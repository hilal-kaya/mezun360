package tr.edu.btu.mezun360.config;

import java.time.Clock;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.identity.application.EmailCanonicalizer;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.identity.domain.UserAccount;
import tr.edu.btu.mezun360.identity.infrastructure.UserAccountRepository;

@Component
@Profile({"local", "dev"})
public class DataSeeder implements CommandLineRunner {

    private final UserAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public DataSeeder(UserAccountRepository accounts, PasswordEncoder passwordEncoder, Clock clock) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        String email = "admin@example.test";
        String canonical = EmailCanonicalizer.canonicalize(email);
        if (accounts.findByEmailCanonical(canonical).isEmpty()) {
            UserAccount admin = UserAccount.development(
                email, 
                canonical, 
                passwordEncoder.encode("admin"), 
                Role.ADMIN, 
                clock.instant()
            );
            accounts.save(admin);
        }
    }
}
