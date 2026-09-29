package tr.edu.btu.mezun360.jobs.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import tr.edu.btu.mezun360.jobs.domain.WorkModel;

public record JobPostRequest(
    @NotBlank String title,
    @NotBlank String company,
    String location,
    @NotNull WorkModel workModel,
    @NotBlank String description,
    @NotBlank String applicationUrl
) {}
