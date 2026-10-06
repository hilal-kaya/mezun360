package tr.edu.btu.mezun360.events.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.events.application.dto.EventDTO;
import tr.edu.btu.mezun360.events.domain.Event;
import tr.edu.btu.mezun360.events.domain.EventAttendance;
import tr.edu.btu.mezun360.events.domain.EventAttendanceStatus;
import tr.edu.btu.mezun360.events.infrastructure.EventAttendanceRepository;
import tr.edu.btu.mezun360.events.infrastructure.EventRepository;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final EventAttendanceRepository attendanceRepository;
    private final Clock clock;

    public EventService(EventRepository eventRepository, EventAttendanceRepository attendanceRepository, Clock clock) {
        this.eventRepository = eventRepository;
        this.attendanceRepository = attendanceRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEvents(String type, UUID currentUserId, Pageable pageable) {
        Instant now = clock.instant();
        Page<Event> events;
        
        if ("past".equalsIgnoreCase(type)) {
            events = eventRepository.findPastEvents(now, pageable);
        } else {
            events = eventRepository.findUpcomingEvents(now, pageable);
        }

        return events.map(event -> toDTO(event, currentUserId));
    }

    @Transactional
    public void toggleAttendance(UUID eventId, UUID userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        EventAttendance attendance = attendanceRepository.findByEventIdAndUserId(eventId, userId)
                .orElse(null);

        if (attendance != null && attendance.status == EventAttendanceStatus.REGISTERED) {
            attendance.status = EventAttendanceStatus.CANCELLED;
            attendanceRepository.save(attendance);
        } else if (attendance != null && attendance.status == EventAttendanceStatus.CANCELLED) {
            checkCapacity(event);
            attendance.status = EventAttendanceStatus.REGISTERED;
            attendanceRepository.save(attendance);
        } else {
            checkCapacity(event);
            EventAttendance newAttendance = new EventAttendance(
                    UUID.randomUUID(),
                    eventId,
                    userId,
                    EventAttendanceStatus.REGISTERED,
                    clock.instant()
            );
            attendanceRepository.save(newAttendance);
        }
    }

    private void checkCapacity(Event event) {
        if (event.capacity != null) {
            long currentAttendees = attendanceRepository.countByEventIdAndStatus(event.id, EventAttendanceStatus.REGISTERED);
            if (currentAttendees >= event.capacity) {
                throw new IllegalStateException("Event capacity reached");
            }
        }
    }

    private EventDTO toDTO(Event event, UUID userId) {
        long attendees = attendanceRepository.countByEventIdAndStatus(event.id, EventAttendanceStatus.REGISTERED);
        boolean isAttending = false;
        
        if (userId != null) {
            isAttending = attendanceRepository.findByEventIdAndUserId(event.id, userId)
                    .map(a -> a.status == EventAttendanceStatus.REGISTERED)
                    .orElse(false);
        }

        return new EventDTO(
                event.id,
                event.title,
                event.description,
                event.eventDate.atZone(ZoneId.of("UTC")),
                event.location,
                event.isOnline,
                event.capacity,
                attendees,
                isAttending
        );
    }
}
