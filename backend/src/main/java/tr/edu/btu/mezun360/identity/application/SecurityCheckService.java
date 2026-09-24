package tr.edu.btu.mezun360.identity.application;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.identity.api.SecurityCheckResponse;
import tr.edu.btu.mezun360.identity.infrastructure.SessionPrincipal;

@Service
public class SecurityCheckService {
    private final SecurityAudit audit;
    public SecurityCheckService(SecurityAudit audit) { this.audit = audit; }

    @PreAuthorize("hasRole('ADMIN')")
    public SecurityCheckResponse admin(String traceId) {
        var principal = (SessionPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        audit.append(principal.accountId(), principal.role().name(), "ADMIN_SECURITY_CHECK", "SUCCESS", traceId);
        return new SecurityCheckResponse("OK");
    }

    @PreAuthorize("hasRole('ALUMNI')")
    public SecurityCheckResponse alumni() { return new SecurityCheckResponse("OK"); }
}
