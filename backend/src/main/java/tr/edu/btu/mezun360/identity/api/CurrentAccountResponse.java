package tr.edu.btu.mezun360.identity.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;
import tr.edu.btu.mezun360.identity.domain.AccountStatus;
import tr.edu.btu.mezun360.identity.domain.Role;

@Schema(additionalProperties = Schema.AdditionalPropertiesValue.FALSE)
public record CurrentAccountResponse(
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID userId,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, format = "email") String email,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Role role,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) AccountStatus accountStatus,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean mfaSatisfied,
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED) Instant absoluteExpiresAt) {}
