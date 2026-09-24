package tr.edu.btu.mezun360.shared.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(additionalProperties = Schema.AdditionalPropertiesValue.FALSE)
public record FieldViolation(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String field,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String code,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String message) {}
