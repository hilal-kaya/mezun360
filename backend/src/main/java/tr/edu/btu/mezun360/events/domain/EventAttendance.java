package tr.edu.btu.mezun360.events.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event_attendances", schema = "mezun360")
public class EventAttendance {

    @Id
    public UUID id;

    @Column(name = "event_id", nullable = false)
    public UUID eventId;

    @Column(name = "user_id", nullable = false)
    public UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public EventAttendanceStatus status;

    @Column(name = "registered_at", nullable = false, updatable = false)
    public Instant registeredAt;

    @Version
    public int version;

    protected EventAttendance() {}

    public EventAttendance(UUID id, UUID eventId, UUID userId, EventAttendanceStatus status, Instant now) {
        this.id = id;
        this.eventId = eventId;
        this.userId = userId;
        this.status = status;
        this.registeredAt = now;
    }
}
