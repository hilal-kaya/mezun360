package tr.edu.btu.mezun360.identity.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(additionalProperties = Schema.AdditionalPropertiesValue.FALSE)
public record LoginResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean authenticated,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean mfaRequired) {}
