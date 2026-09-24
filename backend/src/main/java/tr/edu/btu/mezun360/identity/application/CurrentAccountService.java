package tr.edu.btu.mezun360.identity.application;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import tr.edu.btu.mezun360.config.SecurityProperties;
import tr.edu.btu.mezun360.identity.api.CurrentAccountResponse;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.identity.infrastructure.SessionPrincipal;

@Service
public class CurrentAccountService {
    private final AccountIdentityService identities;
    private final SecurityProperties properties;
    public CurrentAccountService(AccountIdentityService identities, SecurityProperties properties) { this.identities = identities; this.properties = properties; }

    @PreAuthorize("isAuthenticated()")
    public CurrentAccountResponse current() {
        var principal = (SessionPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var account = identities.find(principal.accountId()).filter(AccountIdentity::canAuthenticate)
                .filter(a -> a.role() == principal.role() && a.securityVersion() == principal.securityVersion())
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Authentication is required."));
        var limit = account.role() == Role.ADMIN ? properties.getAdminAbsolute() : properties.getAlumniAbsolute();
        return new CurrentAccountResponse(account.id(), account.email(), account.role(), account.status(), principal.mfaSatisfied(), principal.authenticatedAt().plus(limit));
    }
}
