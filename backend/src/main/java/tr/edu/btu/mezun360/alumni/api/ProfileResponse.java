package tr.edu.btu.mezun360.alumni.api;
import java.time.Instant;
import io.swagger.v3.oas.annotations.media.Schema;
@Schema(description="Owner-only profile. exists=false has null data/timestamps and completionPercentage=0. Education is user-entered, never institutionally verified.")
public record ProfileResponse(
    @Schema(requiredMode=Schema.RequiredMode.REQUIRED) boolean exists,
    @Schema(requiredMode=Schema.RequiredMode.REQUIRED, nullable=true) ProfileWrite data,
    @Schema(requiredMode=Schema.RequiredMode.REQUIRED, minimum="0", maximum="100") int completionPercentage,
    @Schema(requiredMode=Schema.RequiredMode.REQUIRED, nullable=true) Instant createdAt,
    @Schema(requiredMode=Schema.RequiredMode.REQUIRED, nullable=true) Instant updatedAt) {}
