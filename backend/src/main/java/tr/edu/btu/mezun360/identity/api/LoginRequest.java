package tr.edu.btu.mezun360.identity.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(additionalProperties = Schema.AdditionalPropertiesValue.FALSE)
public record LoginRequest(
        @NotBlank @Email @Size(max = 254) @Pattern(regexp = "[\\x21-\\x7E]+")
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, format = "email", maxLength = 254) String email,
        @NotBlank @Size(max = 128)
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, format = "password", maxLength = 128, accessMode = Schema.AccessMode.WRITE_ONLY) String password) {
    @Override public String toString() { return "LoginRequest[redacted]"; }
}
