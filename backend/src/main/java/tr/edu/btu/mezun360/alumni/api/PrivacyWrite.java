package tr.edu.btu.mezun360.alumni.api;
import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import tr.edu.btu.mezun360.alumni.domain.ProfileVisibility;
@Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
public record PrivacyWrite(@NotNull Boolean directoryOptIn,@NotNull ProfileVisibility profileVisibility) {}
