package tr.edu.btu.mezun360.mentorship.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateMentorshipRequestDTO(
    @NotNull(message = "Mentor ID is required")
    UUID mentorId,

    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 1000, message = "Message must be between 10 and 1000 characters")
    String message
) {}
