package tr.edu.btu.mezun360.config;

import java.io.IOException;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.DefaultCorsProcessor;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import tr.edu.btu.mezun360.identity.application.AccountIdentityService;
import tr.edu.btu.mezun360.identity.infrastructure.CurrentAccountFilter;
import tr.edu.btu.mezun360.identity.infrastructure.LocalPasswordAuthenticationProvider;
import tr.edu.btu.mezun360.identity.infrastructure.SessionAuthenticationService;
import tr.edu.btu.mezun360.shared.api.ApiProblems;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityConfiguration {
    @Bean Clock clock() { return Clock.systemUTC(); }

    @Bean PasswordEncoder passwordEncoder() {
        // Argon2id: 64 MiB, 3 iterations, parallelism 1, 16-byte salt and 32-byte output.
        return new DelegatingPasswordEncoder("argon2id", Map.of("argon2id", new Argon2PasswordEncoder(16, 32, 1, 65_536, 3)));
    }

    @Bean AuthenticationManager authenticationManager(LocalPasswordAuthenticationProvider local) { return new ProviderManager(local); }

    @Bean SecurityContextRepository securityContextRepository() {
        var repository = new HttpSessionSecurityContextRepository();
        repository.setDisableUrlRewriting(true);
        return repository;
    }

    @Bean CookieSerializer cookieSerializer(SecurityProperties properties, SecurityPolicy policy) {
        var serializer = new DefaultCookieSerializer();
        serializer.setCookieName(properties.getCookieName());
        serializer.setCookiePath("/");
        serializer.setUseSecureCookie(properties.isCookieSecure());
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite(properties.getSameSite());
        serializer.setUseBase64Encoding(false);
        return serializer;
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http, SecurityProperties properties, SecurityPolicy policy,
            ApiProblems problems, SecurityContextRepository contexts, AccountIdentityService accounts,
            SessionAuthenticationService sessions, Clock clock) throws Exception {
        http.formLogin(AbstractHttpConfigurer::disable).httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable).requestCache(AbstractHttpConfigurer::disable)
                .securityContext(c -> c.securityContextRepository(contexts).requireExplicitSave(true))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .csrf(c -> c.csrfTokenRepository(new HttpSessionCsrfTokenRepository())
                        .csrfTokenRequestHandler(new XorCsrfTokenRequestAttributeHandler()))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((request, response, ex) -> problems.write(request, response, HttpStatus.UNAUTHORIZED,
                                "AUTHENTICATION_REQUIRED", "Authentication is required."))
                        .accessDeniedHandler((request, response, ex) -> problems.write(request, response, HttpStatus.FORBIDDEN,
                                ex instanceof CsrfException ? "CSRF_INVALID" : "FORBIDDEN",
                                ex instanceof CsrfException ? "The request security token is invalid." : "Access is denied.")))
                .headers(h -> { h.referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER));
                        h.permissionsPolicy(p -> p.policy("camera=(), microphone=(), geolocation=()"));
                        h.addHeaderWriter((request, response) -> response.setHeader("Content-Security-Policy",
                                policy.isLocal() && request.getRequestURI().startsWith("/swagger-ui/")
                                ? "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'"
                                : "default-src 'none'; frame-ancestors 'none'; base-uri 'none'")); });
        http.authorizeHttpRequests(a -> {
            a.requestMatchers(HttpMethod.GET, "/api/v1/health", "/api/v1/auth/csrf").permitAll();
            a.requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/logout").permitAll();
            if (policy.isLocal()) a.requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll();
            a.requestMatchers("/api/v1/admin/**").hasRole("ADMIN");
            a.requestMatchers("/api/v1/alumni/security-check").hasRole("ALUMNI");
            a.requestMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated();
            a.anyRequest().denyAll();
        });
        http.addFilterBefore(new CurrentAccountFilter(accounts, properties, policy, sessions, clock), CsrfFilter.class);
        var configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(properties.getAllowedOrigins());
        configuration.setAllowCredentials(true);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN", "If-Match"));
        configuration.setExposedHeaders(List.of("X-Request-ID", "Retry-After"));
        configuration.setMaxAge(600L);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        var cors = new CorsFilter(source);
        cors.setCorsProcessor((config, request, response) -> new DefaultCorsProcessor() {
            @Override protected void rejectRequest(ServerHttpResponse ignored) throws IOException {
                problems.write(request, response, HttpStatus.FORBIDDEN, "FORBIDDEN", "Cross-origin access is not allowed.");
            }
        }.processRequest(config, request, response));
        http.addFilterBefore(cors, CsrfFilter.class);
        return http.build();
    }
}
