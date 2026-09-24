package tr.edu.btu.mezun360.identity.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(additionalProperties = Schema.AdditionalPropertiesValue.FALSE)
public record SecurityCheckResponse(@Schema(requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = "OK") String status) {}
