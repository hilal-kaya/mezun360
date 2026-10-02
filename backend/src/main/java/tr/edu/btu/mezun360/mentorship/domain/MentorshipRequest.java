package tr.edu.btu.mezun360.mentorship.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "mentorship_requests", schema = "mezun360")
@DynamicUpdate
public class MentorshipRequest {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "mentor_id", nullable = false)
    private UUID mentorId;

    @Column(name = "mentee_id", nullable = false)
    private UUID menteeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MentorshipStatus status;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MentorshipRequest() {}

    public MentorshipRequest(UUID id, UUID mentorId, UUID menteeId, String message) {
        this.id = id != null ? id : UUID.randomUUID();
        this.mentorId = mentorId;
        this.menteeId = menteeId;
        this.status = MentorshipStatus.PENDING;
        this.message = message;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public UUID getId() { return id; }
    public UUID getMentorId() { return mentorId; }
    public UUID getMenteeId() { return menteeId; }
    public MentorshipStatus getStatus() { return status; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void updateStatus(MentorshipStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }
}
