package tr.edu.btu.mezun360.identity.application;

import jakarta.validation.Validator;
import java.time.Clock;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.config.SecurityPolicy;
import tr.edu.btu.mezun360.identity.api.LoginRequest;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.identity.domain.UserAccount;
import tr.edu.btu.mezun360.identity.infrastructure.UserAccountRepository;

@Service
public class DevelopmentAccountService {
    private final UserAccountRepository accounts;
    private final PasswordEncoder passwords;
    private final Clock clock;
    private final SecurityPolicy policy;
    private final SecurityAudit audit;
    private final Validator validator;

    public DevelopmentAccountService(UserAccountRepository accounts, PasswordEncoder passwords, Clock clock,
            SecurityPolicy policy, SecurityAudit audit, Validator validator) {
        this.accounts = accounts; this.passwords = passwords; this.clock = clock;
        this.policy = policy; this.audit = audit; this.validator = validator;
    }

    @Transactional
    public UUID create(String email, String password, Role role) {
        if (!policy.isLocal()) throw new IllegalStateException("Development provisioning is local-only.");
        if (password.length() < 15 || password.length() > 128 || !validator.validate(new LoginRequest(email, password)).isEmpty())
            throw new IllegalStateException("Development accounts require a valid ASCII email and a 15–128 character password.");
        String canonical = EmailCanonicalizer.canonicalize(email);
        var existing = accounts.findByEmailCanonical(canonical);
        if (existing.isPresent()) {
            var account = existing.get();
            if (!account.developmentOnly() || account.role() != role)
                throw new IllegalStateException("Development provisioning cannot replace or promote an existing account.");
            return account.id(); // Never overwrite an existing password/role or re-enable a disabled account.
        }
        var account = accounts.save(UserAccount.development(email.strip(), canonical, passwords.encode(password), role, clock.instant()));
        audit.developmentAccountCreated(account.id(), UUID.randomUUID().toString());
        return account.id();
    }
}
