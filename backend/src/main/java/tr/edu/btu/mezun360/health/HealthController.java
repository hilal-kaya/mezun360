package tr.edu.btu.mezun360.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tr.edu.btu.mezun360.shared.api.ApiProblem;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {
    private final HealthService service;

    public HealthController(HealthService service) {
        this.service = service;
    }

    @GetMapping(produces = "application/json")
    @Operation(operationId = "getHealth", summary = "Check API and database readiness")
    @ApiResponse(responseCode = "200", description = "API and database are ready")
    @ApiResponse(responseCode = "503", description = "Service temporarily unavailable",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ApiProblem.class)))
    @ApiResponse(responseCode = "500", description = "Unexpected error",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ApiProblem.class)))
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.checkReadiness());
    }
}
