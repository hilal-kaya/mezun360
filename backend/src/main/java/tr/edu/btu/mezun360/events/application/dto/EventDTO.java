package tr.edu.btu.mezun360.events.application.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public record EventDTO(
    UUID id,
    String title,
    String description,
    ZonedDateTime eventDate,
    String location,
    boolean isOnline,
    Integer capacity,
    long currentAttendees,
    boolean isUserAttending
) {}
