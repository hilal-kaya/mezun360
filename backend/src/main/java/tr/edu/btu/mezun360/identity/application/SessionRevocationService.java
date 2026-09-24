package tr.edu.btu.mezun360.identity.application;

import java.util.UUID;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.stereotype.Service;

/** Identity-owned port for future audited password/account/security changes. No public HTTP endpoint. */
@Service
public class SessionRevocationService {
    private final JdbcIndexedSessionRepository sessions;
    public SessionRevocationService(JdbcIndexedSessionRepository sessions) { this.sessions = sessions; }
    public void revokeAll(UUID accountId) {
        sessions.findByPrincipalName(accountId.toString()).keySet().forEach(sessions::deleteById);
    }
}
