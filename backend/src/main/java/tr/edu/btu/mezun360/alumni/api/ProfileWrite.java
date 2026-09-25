package tr.edu.btu.mezun360.alumni.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
public record ProfileWrite(
    @NotBlank @Size(max=100) String firstName,
    @NotBlank @Size(max=100) String lastName,
    @Schema(nullable=true) @Size(max=150) String department,
    @Schema(nullable=true) @Min(1900) Integer graduationYear,
    @Schema(nullable=true) @Size(max=100) String city,
    @Schema(nullable=true) @Size(max=150) String currentCompany,
    @Schema(nullable=true) @Size(max=150) String currentPosition,
    @Schema(nullable=true) @Size(max=100) String industry,
    @Schema(nullable=true) @Size(max=2000) String about,
    @NotNull @Size(max=30) List<@NotNull @Valid CareerInput> career,
    @NotNull @Size(max=20) List<@NotNull @Valid EducationInput> education,
    @NotNull @Size(max=50) List<@NotBlank @Size(max=60) String> skills,
    @NotNull @Size(max=30) List<@NotNull @Valid CertificationInput> certifications,
    @NotNull @Valid ContributionInput contribution
) {
    @Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
    public record CareerInput(@Schema(nullable=true) UUID id, @NotBlank @Size(max=150) String company,
        @NotBlank @Size(max=150) String position, @Schema(nullable=true) @Size(max=100) String industry,
        @Schema(nullable=true) @Size(max=100) String city, @NotNull LocalDate startDate, @Schema(nullable=true) LocalDate endDate,
        boolean currentlyWorking, @Schema(nullable=true) @Size(max=2000) String description) {}
    @Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
    public record EducationInput(@Schema(nullable=true) UUID id, @NotBlank @Size(max=150) String institution,
        @NotBlank @Size(max=150) String department, @NotBlank @Size(max=100) String degree,
        @NotNull @Min(1900) Integer startYear, @Schema(nullable=true) @Min(1900) Integer graduationYear) {}
    @Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
    public record CertificationInput(@Schema(nullable=true) UUID id, @NotBlank @Size(max=150) String name,
        @NotBlank @Size(max=150) String issuer, @NotNull @Min(1900) Integer year,
        @Schema(nullable=true) @Size(max=2048) String credentialUrl) {}
    @Schema(additionalProperties=Schema.AdditionalPropertiesValue.FALSE)
    public record ContributionInput(boolean willingToMentor, boolean willingToShareOpportunities,
        boolean willingToSpeakAtEvents, boolean willingToSupportUniversityProjects) {}
}
