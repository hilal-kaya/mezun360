package tr.edu.btu.mezun360.mentorship.application.dto;

import tr.edu.btu.mezun360.mentorship.domain.MentorshipStatus;
import java.time.ZonedDateTime;
import java.util.UUID;

public record MentorshipRequestDTO(
    UUID id,
    UUID mentorId,
    UUID menteeId,
    MentorshipStatus status,
    String message,
    ZonedDateTime createdAt
) {}
