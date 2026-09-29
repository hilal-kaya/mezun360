package tr.edu.btu.mezun360.alumni.api;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import tr.edu.btu.mezun360.alumni.application.PrivacyService;
import tr.edu.btu.mezun360.shared.api.RequestIdFilter;
@RestController @RequestMapping("/api/v1/me/privacy-preferences") @SecurityRequirement(name="sessionCookie")
public class PrivacyController {
    private final PrivacyService service;
    public PrivacyController(PrivacyService service) {this.service=service;}
    @GetMapping @Operation(operationId="getOwnPrivacy")
    public ResponseEntity<PrivacyResponse> get() {return response(service.get());}
    @PutMapping @Operation(operationId="replaceOwnPrivacy")
    public ResponseEntity<PrivacyResponse> put(@Valid @RequestBody PrivacyWrite input,@RequestHeader(value="If-Match",required=false) String etag,HttpServletRequest request) {
        return response(service.save(input,etag,(String)request.getAttribute(RequestIdFilter.ATTRIBUTE)));
    }
    private ResponseEntity<PrivacyResponse> response(PrivacyService.Result r) {return ResponseEntity.ok().header("Cache-Control","no-store").eTag(r.etag()).body(r.body());}
}
