package tr.edu.btu.mezun360.identity.application;

import jakarta.validation.Validator;
import java.time.Clock;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.identity.api.LoginRequest;
import tr.edu.btu.mezun360.identity.domain.UserAccount;
import tr.edu.btu.mezun360.identity.infrastructure.UserAccountRepository;

@Service
public class RegistrationService {
    private final UserAccountRepository accounts;
    private final PasswordEncoder passwords;
    private final Clock clock;
    private final Validator validator;

    public RegistrationService(UserAccountRepository accounts, PasswordEncoder passwords, Clock clock, Validator validator) {
        this.accounts = accounts; this.passwords = passwords; this.clock = clock; this.validator = validator;
    }

    @Transactional
    public UUID register(String email, String password) {
        if (password.length() < 15 || password.length() > 128 || !validator.validate(new LoginRequest(email, password)).isEmpty())
            throw new IllegalArgumentException("Registration requires a valid ASCII email and a 15–128 character password.");
        String canonical = EmailCanonicalizer.canonicalize(email);
        var existing = accounts.findByEmailCanonical(canonical);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Email already registered.");
        }
        var account = accounts.save(UserAccount.publicRegistration(email.strip(), canonical, passwords.encode(password), clock.instant()));
        return account.id();
    }
}
