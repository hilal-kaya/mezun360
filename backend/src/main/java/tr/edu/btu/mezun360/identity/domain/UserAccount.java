package tr.edu.btu.mezun360.identity.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_accounts", schema = "mezun360")
public class UserAccount {
    @Id private UUID id;
    @Column(nullable = false, length = 254) private String email;
    @Column(name = "email_canonical", nullable = false, unique = true, length = 254) private String emailCanonical;
    @Column(name = "password_hash", nullable = false, length = 255) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private Role role;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private AccountStatus status;
    @Column(name = "email_verified_at") private Instant emailVerifiedAt;
    @Column(name = "security_version", nullable = false) private long securityVersion;
    @Column(name = "development_only", nullable = false) private boolean developmentOnly;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "last_login_at") private Instant lastLoginAt;
    @Version private long version;

    protected UserAccount() {}

    public static UserAccount development(String email, String canonical, String hash, Role role, Instant now) {
        UserAccount account = new UserAccount();
        account.id = UUID.randomUUID();
        account.email = email;
        account.emailCanonical = canonical;
        account.passwordHash = hash;
        account.role = role;
        account.status = AccountStatus.ACTIVE;
        account.emailVerifiedAt = now;
        account.developmentOnly = true;
        account.createdAt = now;
        account.updatedAt = now;
        return account;
    }

    public void recordLogin(Instant now) { lastLoginAt = now; updatedAt = now; }
    public UUID id() { return id; }
    public String email() { return email; }
    public String passwordHash() { return passwordHash; }
    public Role role() { return role; }
    public AccountStatus status() { return status; }
    public Instant emailVerifiedAt() { return emailVerifiedAt; }
    public long securityVersion() { return securityVersion; }
    public boolean developmentOnly() { return developmentOnly; }
    public boolean canAuthenticate() { return status == AccountStatus.ACTIVE && emailVerifiedAt != null; }
}
