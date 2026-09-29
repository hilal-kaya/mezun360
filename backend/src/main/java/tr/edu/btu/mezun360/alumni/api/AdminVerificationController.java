package tr.edu.btu.mezun360.alumni.api;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import tr.edu.btu.mezun360.alumni.application.VerificationService;
import tr.edu.btu.mezun360.alumni.domain.VerificationStatus;
import tr.edu.btu.mezun360.shared.api.RequestIdFilter;
@RestController @RequestMapping("/api/v1/admin/verification-requests") @SecurityRequirement(name="sessionCookie")
public class AdminVerificationController {
    private final VerificationService service;
    public AdminVerificationController(VerificationService service) {this.service=service;}
    @GetMapping @Operation(operationId="listVerifications")
    public ResponseEntity<VerificationQueue> list(@RequestParam(defaultValue="PENDING") VerificationStatus status,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,HttpServletRequest request) {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(service.queue(status,page,size,trace(request)));
    }
    @GetMapping("/{id}") @Operation(operationId="getVerificationReview")
    public ResponseEntity<AdminVerification> get(@PathVariable UUID id,HttpServletRequest request) {return response(service.detail(id,trace(request)));}
    @PostMapping("/{id}/decisions") @Operation(operationId="decideVerification")
    public ResponseEntity<AdminVerification> decide(@PathVariable UUID id,@Valid @RequestBody VerificationDecision input,
            @RequestHeader(value="If-Match",required=false) String etag,HttpServletRequest request) {return response(service.decide(id,input,etag,trace(request)));}
    private String trace(HttpServletRequest r) {return (String)r.getAttribute(RequestIdFilter.ATTRIBUTE);}
    private ResponseEntity<AdminVerification> response(VerificationService.AdminResult r) {return ResponseEntity.ok().header("Cache-Control","no-store").eTag(r.etag()).body(r.body());}
}
