package tr.edu.btu.mezun360.events.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "events", schema = "mezun360")
public class Event {

    @Id
    public UUID id;

    @Column(nullable = false)
    public String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String description;

    @Column(name = "event_date", nullable = false)
    public Instant eventDate;

    public String location;

    @Column(name = "is_online", nullable = false)
    public boolean isOnline;

    public Integer capacity;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt;

    @Version
    public int version;

    protected Event() {}

    public Event(UUID id, String title, String description, Instant eventDate, String location, boolean isOnline, Integer capacity, Instant now) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.location = location;
        this.isOnline = isOnline;
        this.capacity = capacity;
        this.createdAt = now;
        this.updatedAt = now;
    }
}
