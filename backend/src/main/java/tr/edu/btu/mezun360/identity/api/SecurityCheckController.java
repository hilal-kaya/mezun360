package tr.edu.btu.mezun360.identity.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.identity.application.SecurityCheckService;
import tr.edu.btu.mezun360.shared.api.ApiProblems;

@RestController
public class SecurityCheckController {
    private final SecurityCheckService service;
    public SecurityCheckController(SecurityCheckService service) { this.service = service; }

    @GetMapping("/api/v1/admin/security-check")
    @Operation(operationId = "checkAdminAccess", summary = "Technical ADMIN authorization probe", security = @SecurityRequirement(name = "sessionCookie"))
    public SecurityCheckResponse admin(HttpServletRequest request) { return service.admin(ApiProblems.traceId(request)); }

    @GetMapping("/api/v1/alumni/security-check")
    @Operation(operationId = "checkAlumniAccess", summary = "Technical ALUMNI role probe; not a verified-member feature", security = @SecurityRequirement(name = "sessionCookie"))
    public SecurityCheckResponse alumni() { return service.alumni(); }
}
