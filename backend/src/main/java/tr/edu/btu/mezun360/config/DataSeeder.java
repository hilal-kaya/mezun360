package tr.edu.btu.mezun360.config;

import java.time.Clock;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
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
import tr.edu.btu.mezun360.jobs.domain.JobPost;
import tr.edu.btu.mezun360.jobs.domain.WorkModel;
import tr.edu.btu.mezun360.jobs.infrastructure.JobPostRepository;

@Component
@Profile({"local", "dev"})
public class DataSeeder implements CommandLineRunner {

    private final UserAccountRepository accounts;
    private final JobPostRepository jobs;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(UserAccountRepository accounts, JobPostRepository jobs, PasswordEncoder passwordEncoder, Clock clock, JdbcTemplate jdbcTemplate) {
        this.accounts = accounts;
        this.jobs = jobs;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        UserAccount admin = seedUser("admin@example.test", "admin", Role.ADMIN);
        seedUser("alumni@example.test", "alumni", Role.ALUMNI);
        seedJobs(admin);
    }

    private UserAccount seedUser(String email, String password, Role role) {
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
            return accounts.save(account);
        } else {
            jdbcTemplate.update("UPDATE mezun360.user_accounts SET password_hash = ? WHERE email_canonical = ?", hash, canonical);
            return existing.get();
        }
    }

    private void seedJobs(UserAccount admin) {
        if (jobs.count() > 0) return;

        jobs.save(new JobPost(UUID.randomUUID(), "Senior Java Engineer", "TechCorp TR", "Istanbul", WorkModel.HYBRID, "We are looking for an experienced Java developer with Spring Boot expertise to join our core banking team.", "https://techcorp.tr/careers/1", admin, clock.instant().minus(2, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "Product Manager", "Innovate A.S.", "Bursa", WorkModel.ONSITE, "Leading tech company in Bursa is seeking a Product Manager to oversee our B2B SaaS products.", "https://innovate.as/jobs", admin, clock.instant().minus(5, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "React Developer", "StartApp", "Remote", WorkModel.REMOTE, "Fast-growing startup looking for a frontend developer to build responsive web applications using React and TypeScript.", "https://startapp.io/apply", admin, clock.instant().minus(1, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "Data Scientist", "Bursa Analytics", "Bursa", WorkModel.HYBRID, "Join our data team to build predictive models and analyze large datasets using Python and SQL.", "https://bursaanalytics.com/careers", admin, clock.instant().minus(10, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "DevOps Engineer", "CloudNet", "Remote", WorkModel.REMOTE, "We need a DevOps engineer to manage our Kubernetes clusters, CI/CD pipelines, and AWS infrastructure.", "https://cloudnet.com/jobs", admin, clock.instant().minus(14, ChronoUnit.DAYS)));
    }
}
