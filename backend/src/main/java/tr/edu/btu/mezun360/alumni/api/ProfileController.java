package tr.edu.btu.mezun360.alumni.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.alumni.application.ProfileService;
import tr.edu.btu.mezun360.shared.api.RequestIdFilter;

@RestController
@RequestMapping("/api/v1/me/profile")
@SecurityRequirement(name="sessionCookie")
public class ProfileController {
    private final ProfileService profiles;
    public ProfileController(ProfileService profiles) { this.profiles=profiles; }
    @GetMapping
    @Operation(operationId="getOwnProfile", summary="Read current ALUMNI owner's profile or empty onboarding state")
    @ApiResponse(responseCode="200", description="Owner-only profile; no account/contact/verification fields", headers=@Header(name="ETag",schema=@Schema(type="string")))
    public ResponseEntity<ProfileResponse> get() { return response(profiles.get()); }
    @PutMapping
    @Operation(operationId="replaceOwnProfile", summary="Atomically replace editable profile and bounded nested records; ALUMNI owner only")
    @ApiResponse(responseCode="200", description="Saved owner profile", headers=@Header(name="ETag",schema=@Schema(type="string")))
    public ResponseEntity<ProfileResponse> put(@Valid @RequestBody ProfileWrite body,
            @RequestHeader(value="If-Match",required=false) String ifMatch, HttpServletRequest request) {
        return response(profiles.save(body,ifMatch,(String)request.getAttribute(RequestIdFilter.ATTRIBUTE)));
    }
    private ResponseEntity<ProfileResponse> response(ProfileService.Result result) {
        return ResponseEntity.ok().header("Cache-Control","no-store").eTag(result.etag()).body(result.body());
    }
}
