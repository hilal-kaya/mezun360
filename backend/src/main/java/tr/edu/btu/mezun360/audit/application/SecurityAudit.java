package tr.edu.btu.mezun360.audit.application;

import java.time.Clock;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SecurityAudit {
    private final JdbcTemplate jdbc;
    private final Clock clock;
    public SecurityAudit(JdbcTemplate jdbc, Clock clock) { this.jdbc = jdbc; this.clock = clock; }

    @Transactional
    public void append(UUID actor, String role, String action, String outcome, String traceId) {
        jdbc.update("""
                INSERT INTO mezun360.audit_events
                    (id, actor_id, actor_type, actor_role, target_id, action, outcome, occurred_at, correlation_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, UUID.randomUUID(), actor, actor == null ? "SYSTEM" : "USER", role, actor, action, outcome,
                java.sql.Timestamp.from(clock.instant()), UUID.fromString(traceId));
    }

    @Transactional
    public void developmentAccountCreated(UUID target, String traceId) {
        jdbc.update("""
                INSERT INTO mezun360.audit_events
                    (id, actor_type, target_id, action, outcome, occurred_at, correlation_id)
                VALUES (?, 'SYSTEM', ?, 'DEVELOPMENT_ACCOUNT_CREATED', 'SUCCESS', ?, ?)
                """, UUID.randomUUID(), target, java.sql.Timestamp.from(clock.instant()), UUID.fromString(traceId));
    }

    @Transactional
    public void profileUpdated(UUID owner, UUID profile, String traceId) {
        jdbc.update("""
                INSERT INTO mezun360.audit_events
                    (id, actor_id, actor_type, actor_role, target_id, action, outcome, occurred_at, correlation_id)
                VALUES (?, ?, 'USER', 'ALUMNI', ?, 'PROFILE_UPDATED', 'SUCCESS', ?, ?)
                """, UUID.randomUUID(), owner, profile, java.sql.Timestamp.from(clock.instant()), UUID.fromString(traceId));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void authenticationFailure(String traceId) {
        append(null, null, "LOGIN", "DENIED", traceId);
    }
}
