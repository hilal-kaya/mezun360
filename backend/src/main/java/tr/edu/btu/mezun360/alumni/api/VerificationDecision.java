package tr.edu.btu.mezun360.alumni.api;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;
import tr.edu.btu.mezun360.alumni.domain.VerificationStatus;
@Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
public record VerificationDecision(@NotNull VerificationStatus status,@Size(max=500) String rejectionReason) {}
