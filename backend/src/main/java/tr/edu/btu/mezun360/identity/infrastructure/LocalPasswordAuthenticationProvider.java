package tr.edu.btu.mezun360.identity.infrastructure;

import java.time.Clock;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.config.SecurityPolicy;
import tr.edu.btu.mezun360.identity.application.EmailCanonicalizer;

/** Credential adapter; future institutional proof must still resolve this application's account authority. */
@Component
public class LocalPasswordAuthenticationProvider implements AuthenticationProvider {
    private final UserAccountRepository accounts;
    private final PasswordEncoder passwords;
    private final SecurityPolicy policy;
    private final Clock clock;
    private final String dummyHash;

    public LocalPasswordAuthenticationProvider(UserAccountRepository accounts, PasswordEncoder passwords, SecurityPolicy policy, Clock clock) {
        this.accounts = accounts; this.passwords = passwords; this.policy = policy; this.clock = clock;
        dummyHash = passwords.encode(UUID.randomUUID().toString());
    }

    @Override
    @Transactional(readOnly = true)
    public Authentication authenticate(Authentication input) {
        var account = accounts.findByEmailCanonical(EmailCanonicalizer.canonicalize(input.getName()));
        String hash = account.map(a -> a.passwordHash()).orElse(dummyHash);
        boolean matches;
        try { matches = passwords.matches(input.getCredentials().toString(), hash); }
        catch (IllegalArgumentException ex) { passwords.matches(input.getCredentials().toString(), dummyHash); matches = false; }
        if (!matches || account.isEmpty() || !account.get().canAuthenticate() || account.get().developmentOnly() && !policy.isLocal()) {
            throw new BadCredentialsException("Email or password is invalid.");
        }
        var a = account.get();
        var principal = new SessionPrincipal(a.id(), a.role(), a.securityVersion(), clock.instant(), false);
        return UsernamePasswordAuthenticationToken.authenticated(principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + a.role().name())));
    }

    @Override public boolean supports(Class<?> type) { return UsernamePasswordAuthenticationToken.class.isAssignableFrom(type); }
}
