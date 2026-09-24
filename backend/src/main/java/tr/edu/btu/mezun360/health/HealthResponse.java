package tr.edu.btu.mezun360.health;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(additionalProperties = Schema.AdditionalPropertiesValue.FALSE)
public record HealthResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = "UP") String status,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = "mezun360-api") String service) {}
