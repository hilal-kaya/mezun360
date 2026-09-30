package tr.edu.btu.mezun360.mentorship.application.dto;

import jakarta.validation.constraints.NotNull;
import tr.edu.btu.mezun360.mentorship.domain.MentorshipStatus;

public record UpdateMentorshipStatusDTO(
    @NotNull(message = "Status is required")
    MentorshipStatus status
) {}
