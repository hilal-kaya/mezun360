package tr.edu.btu.mezun360.identity.application;

import java.time.Clock;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.identity.infrastructure.SessionPrincipal;
import tr.edu.btu.mezun360.identity.infrastructure.UserAccountRepository;

@Service
public class LoginService {
    private final AuthenticationManager authenticator;
    private final LoginRateLimiter limiter;
    private final UserAccountRepository accounts;
    private final SecurityAudit audit;
    private final Clock clock;

    public LoginService(AuthenticationManager authenticator, LoginRateLimiter limiter, UserAccountRepository accounts, SecurityAudit audit, Clock clock) {
        this.authenticator = authenticator; this.limiter = limiter; this.accounts = accounts; this.audit = audit; this.clock = clock;
    }

    @Transactional
    public Authentication authenticate(String email, String password, String address, String traceId) {
        limiter.attempt(address, email);
        Authentication result;
        var candidate = UsernamePasswordAuthenticationToken.unauthenticated(email, password);
        try { result = authenticator.authenticate(candidate); }
        catch (AuthenticationException ex) { audit.authenticationFailure(traceId); throw ex; }
        finally { candidate.eraseCredentials(); }
        var principal = (SessionPrincipal) result.getPrincipal();
        accounts.findById(principal.accountId()).orElseThrow().recordLogin(clock.instant());
        audit.append(principal.accountId(), principal.role().name(), "PASSWORD_AUTHENTICATION", "ACCEPTED", traceId);
        return result;
    }
}
