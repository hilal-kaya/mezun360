package tr.edu.btu.mezun360.identity.infrastructure;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import tr.edu.btu.mezun360.config.SecurityPolicy;
import tr.edu.btu.mezun360.config.SecurityProperties;
import tr.edu.btu.mezun360.identity.application.AccountIdentityService;
import tr.edu.btu.mezun360.identity.domain.Role;

public class CurrentAccountFilter extends OncePerRequestFilter {
    private final AccountIdentityService accounts;
    private final SecurityProperties properties;
    private final SecurityPolicy policy;
    private final SessionAuthenticationService sessions;
    private final Clock clock;

    public CurrentAccountFilter(AccountIdentityService accounts, SecurityProperties properties, SecurityPolicy policy,
            SessionAuthenticationService sessions, Clock clock) {
        this.accounts = accounts; this.properties = properties; this.policy = policy; this.sessions = sessions; this.clock = clock;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof SessionPrincipal principal) {
            Duration absolute = principal.role() == Role.ADMIN ? properties.getAdminAbsolute() : properties.getAlumniAbsolute();
            var account = accounts.find(principal.accountId());
            boolean valid = account.isPresent() && account.get().canAuthenticate()
                    && account.get().role() == principal.role() && account.get().securityVersion() == principal.securityVersion()
                    && (!account.get().developmentOnly() || policy.isLocal())
                    && principal.authenticatedAt().plus(absolute).isAfter(clock.instant())
                    && !(principal.role() == Role.ADMIN && properties.isAdminMfaRequired() && !principal.mfaSatisfied());
            if (!valid) {
                var session = request.getSession(false);
                if (session != null) session.invalidate();
                SecurityContextHolder.clearContext();
                sessions.clearCookie(request, response);
            }
        }
        var session = request.getSession(false);
        if (session != null && session.getAttribute(SessionAuthenticationService.MFA_PENDING) instanceof SessionPrincipal pending
                && !pending.authenticatedAt().plusSeconds(300).isAfter(clock.instant())) {
            session.invalidate();
            sessions.clearCookie(request, response);
        }
        chain.doFilter(request, response);
    }
}
