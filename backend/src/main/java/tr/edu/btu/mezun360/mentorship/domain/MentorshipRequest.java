package tr.edu.btu.mezun360.mentorship.domain;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentorship_requests", schema = "mezun360")
public class MentorshipRequest {

    @Id
    private UUID id;

    @Column(name = "mentor_id", nullable = false)
    private UUID mentorId;

    @Column(name = "mentee_id", nullable = false)
    private UUID menteeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MentorshipStatus status;

    @Column(nullable = false)
    private String message;

    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    protected MentorshipRequest() {}

    public MentorshipRequest(UUID id, UUID mentorId, UUID menteeId, String message) {
        this.id = id;
        this.mentorId = mentorId;
        this.menteeId = menteeId;
        this.message = message;
        this.status = MentorshipStatus.PENDING;
        this.createdAt = ZonedDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public UUID getId() { return id; }
    public UUID getMentorId() { return mentorId; }
    public UUID getMenteeId() { return menteeId; }
    public MentorshipStatus getStatus() { return status; }
    public String getMessage() { return message; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }

    public void updateStatus(MentorshipStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = ZonedDateTime.now();
    }
}
