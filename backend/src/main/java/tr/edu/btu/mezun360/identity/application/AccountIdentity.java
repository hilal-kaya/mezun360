package tr.edu.btu.mezun360.identity.application;

import java.util.UUID;
import tr.edu.btu.mezun360.identity.domain.AccountStatus;
import tr.edu.btu.mezun360.identity.domain.Role;

// Module-facing identity; never carries credentials or alumni profile information.
public record AccountIdentity(UUID id, String email, Role role, AccountStatus status,
        long securityVersion, boolean canAuthenticate, boolean developmentOnly) {}
