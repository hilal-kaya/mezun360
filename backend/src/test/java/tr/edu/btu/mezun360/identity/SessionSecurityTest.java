package tr.edu.btu.mezun360.identity;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.*;
import java.util.*;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.session.web.http.DefaultCookieSerializer;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.config.*;
import tr.edu.btu.mezun360.identity.application.*;
import tr.edu.btu.mezun360.identity.domain.*;
import tr.edu.btu.mezun360.identity.infrastructure.*;

class SessionSecurityTest {
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    @Test void pendingMfaNeverCreatesAnAuthenticatedContext() {
        var p = new SecurityProperties();
        var serializer = new DefaultCookieSerializer();
        var service = new SessionAuthenticationService(p, new HttpSessionSecurityContextRepository(), serializer, mock(SecurityAudit.class));
        var principal = new SessionPrincipal(UUID.randomUUID(), Role.ADMIN, 0, Instant.now(), false);
        var auth = UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        var request = new MockHttpServletRequest();
        var result = service.login(auth, request, new MockHttpServletResponse());
        assertThat(result.authenticated()).isFalse(); assertThat(result.mfaRequired()).isTrue();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(request.getSession().getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY)).isNull();
        assertThat(request.getSession().getMaxInactiveInterval()).isEqualTo(300);
    }
    @Test void absoluteExpiryInvalidatesSessionEvenWhenAccountIsActive() throws Exception {
        Instant now = Instant.parse("2026-01-01T12:00:00Z");
        UUID id = UUID.randomUUID();
        var principal = new SessionPrincipal(id, Role.ALUMNI, 0, now.minus(Duration.ofHours(9)), false);
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of(new SimpleGrantedAuthority("ROLE_ALUMNI"))));
        var accounts = mock(AccountIdentityService.class);
        when(accounts.find(id)).thenReturn(Optional.of(new AccountIdentity(id, "test@example.test", Role.ALUMNI, AccountStatus.ACTIVE, 0, true, false)));
        var sessions = mock(SessionAuthenticationService.class);
        var filter = new CurrentAccountFilter(accounts, new SecurityProperties(), mock(SecurityPolicy.class), sessions, Clock.fixed(now, ZoneOffset.UTC));
        var request = new MockHttpServletRequest(); var session = new MockHttpSession(); request.setSession(session);
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, mock(FilterChain.class));
        assertThat(session.isInvalid()).isTrue(); assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(sessions).clearCookie(request, response);
    }
}
