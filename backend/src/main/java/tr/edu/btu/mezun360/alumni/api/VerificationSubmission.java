package tr.edu.btu.mezun360.alumni.api;
import jakarta.validation.constraints.AssertTrue;
import io.swagger.v3.oas.annotations.media.Schema;
@Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
public record VerificationSubmission(@AssertTrue boolean confirmAccuracy) {}
