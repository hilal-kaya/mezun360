package tr.edu.btu.mezun360.alumni.api;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import tr.edu.btu.mezun360.alumni.application.VerificationService;
import tr.edu.btu.mezun360.shared.api.RequestIdFilter;
@RestController @RequestMapping("/api/v1/me/verification-requests") @SecurityRequirement(name="sessionCookie")
public class VerificationController {
    private final VerificationService service;
    public VerificationController(VerificationService service) {this.service=service;}
    @GetMapping @Operation(operationId="getOwnVerification")
    public ResponseEntity<VerificationSummary> get() {return response(service.own(),200);}
    @PostMapping @Operation(operationId="submitOwnVerification")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode="201",description="Submitted minimal current education snapshot")
    public ResponseEntity<VerificationSummary> submit(@Valid @RequestBody VerificationSubmission input,@RequestHeader(value="If-Match",required=false) String etag,HttpServletRequest request) {
        return response(service.submit(etag,(String)request.getAttribute(RequestIdFilter.ATTRIBUTE)),201);
    }
    private ResponseEntity<VerificationSummary> response(VerificationService.OwnResult r,int status) {return ResponseEntity.status(status).header("Cache-Control","no-store").eTag(r.etag()).body(r.body());}
}
