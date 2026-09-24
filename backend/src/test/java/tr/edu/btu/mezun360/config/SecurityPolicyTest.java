package tr.edu.btu.mezun360.config;

import static org.assertj.core.api.Assertions.*;
import java.time.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import tr.edu.btu.mezun360.identity.application.*;

class SecurityPolicyTest {
    @Test void productionCookieUsesSecureHttpOnlyAndHostScope() {
        var p = new SecurityProperties();
        var serializer = new SecurityConfiguration().cookieSerializer(p, org.mockito.Mockito.mock(SecurityPolicy.class));
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        var response = new org.springframework.mock.web.MockHttpServletResponse();
        serializer.writeCookieValue(new org.springframework.session.web.http.CookieSerializer.CookieValue(request, response, "synthetic-session"));
        assertThat(response.getHeader("Set-Cookie")).contains("__Host-mezun360-session", "Secure", "HttpOnly", "SameSite=Lax", "Path=/").doesNotContain("Domain=");
    }
    @Test void productionCannotBypassUnimplementedMfa() {
        var p = new SecurityProperties();
        assertThatThrownBy(() -> SecurityPolicy.validate(p, false, false)).hasMessageContaining("MFA");
        p.setAdminMfaRequired(false);
        assertThatThrownBy(() -> SecurityPolicy.validate(p, false, true)).hasMessageContaining("cannot be disabled");
    }
    @Test void productionRequiresSecureHostCookiesAndNoDevelopmentUsers() {
        var p = new SecurityProperties(); p.setCookieName("session"); p.setCookieSecure(false);
        assertThatThrownBy(() -> SecurityPolicy.validate(p, false, true)).hasMessageContaining("Secure");
        p.setCookieSecure(true); p.setCookieName("__Host-mezun360-session"); p.setDevUsersEnabled(true);
        assertThatThrownBy(() -> SecurityPolicy.validate(p, false, true)).hasMessageContaining("Development users");
    }
    @Test void corsRequiresExactOriginsAndHttpsOutsideLocal() {
        var p = new SecurityProperties();
        for (String origin : List.of("*", "https://*.example.test", "http://example.test", "https://example.test/path")) {
            p.setAllowedOrigins(List.of(origin));
            assertThatThrownBy(() -> SecurityPolicy.validate(p, false, true)).isInstanceOf(IllegalStateException.class);
        }
        p.setAllowedOrigins(List.of("https://mezun.example.test"));
        assertThatCode(() -> SecurityPolicy.validate(p, false, true)).doesNotThrowAnyException();
    }
    @Test void localCannotBeCombinedWithProductionProfile() {
        var env = new MockEnvironment(); env.setActiveProfiles("local", "production");
        assertThatThrownBy(() -> new SecurityPolicy(new SecurityProperties(), env, new AdminMfaBoundary())).hasMessageContaining("combined");
    }
    @Test void timeoutConfigurationIsBounded() {
        var p = new SecurityProperties(); p.setAlumniIdle(Duration.ofMillis(500));
        assertThatThrownBy(() -> SecurityPolicy.validate(p, true, false)).isInstanceOf(IllegalStateException.class);
        p.setAlumniIdle(Duration.ofDays(2));
        assertThatThrownBy(() -> SecurityPolicy.validate(p, true, false)).isInstanceOf(IllegalStateException.class);
    }
    @Test void bruteForceLimitsApplyAcrossSourcesAndCanonicalEmails() {
        var p = new SecurityProperties(); p.setAccountAttempts(2); p.setSourceAttempts(3);
        var limiter = new LoginRateLimiter(Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC), p);
        limiter.attempt("source-1", "ALUMNI@example.test"); limiter.attempt("source-2", "alumni@example.test");
        assertThatThrownBy(() -> limiter.attempt("source-3", "alumni@example.test")).isInstanceOf(RateLimitExceededException.class);
        limiter.attempt("shared-source", "one@example.test"); limiter.attempt("shared-source", "two@example.test"); limiter.attempt("shared-source", "three@example.test");
        assertThatThrownBy(() -> limiter.attempt("shared-source", "four@example.test")).isInstanceOf(RateLimitExceededException.class);
    }
}
