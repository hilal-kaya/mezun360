package tr.edu.btu.mezun360.identity.infrastructure;

import java.io.Serializable;
import java.security.Principal;
import java.time.Instant;
import java.util.UUID;
import tr.edu.btu.mezun360.identity.domain.Role;

// Minimal JDBC session data: no email, password/hash, token, profile or mutable entity.
public record SessionPrincipal(UUID accountId, Role role, long securityVersion,
        Instant authenticatedAt, boolean mfaSatisfied) implements Principal, Serializable {
    private static final long serialVersionUID = 1L;
    @Override public String getName() { return accountId.toString(); }
}
