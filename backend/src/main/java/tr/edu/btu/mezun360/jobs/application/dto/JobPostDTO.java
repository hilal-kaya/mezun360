package tr.edu.btu.mezun360.jobs.application.dto;

import tr.edu.btu.mezun360.jobs.domain.WorkModel;
import java.time.Instant;
import java.util.UUID;

public record JobPostDTO(
    UUID id,
    String title,
    String company,
    String location,
    WorkModel workModel,
    String description,
    String applicationUrl,
    Instant createdAt,
    boolean bookmarked
) {}
