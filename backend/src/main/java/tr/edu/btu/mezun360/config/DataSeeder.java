package tr.edu.btu.mezun360.config;

import java.time.Clock;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(UserAccountRepository accounts, PasswordEncoder passwordEncoder, Clock clock, JdbcTemplate jdbcTemplate) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUser("admin@example.test", "admin", Role.ADMIN);
        seedUser("alumni@example.test", "alumni", Role.ALUMNI);
    }

    private void seedUser(String email, String password, Role role) {
        String canonical = EmailCanonicalizer.canonicalize(email);
        var existing = accounts.findByEmailCanonical(canonical);
        String hash = passwordEncoder.encode(password);
        if (existing.isEmpty()) {
            UserAccount account = UserAccount.development(
                email, 
                canonical, 
                hash, 
                role, 
                clock.instant()
            );
            accounts.save(account);
        } else {
            // Overwrite password directly via native query to avoid foreign key constraints
            jdbcTemplate.update("UPDATE mezun360.user_accounts SET password_hash = ? WHERE email_canonical = ?", hash, canonical);
        }
    }
}
