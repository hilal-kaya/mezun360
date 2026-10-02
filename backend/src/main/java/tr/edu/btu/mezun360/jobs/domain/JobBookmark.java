package tr.edu.btu.mezun360.jobs.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "job_bookmarks", schema = "mezun360")
@DynamicUpdate
@IdClass(JobBookmarkId.class)
public class JobBookmark {
    
    @Id
    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected JobBookmark() {}

    public JobBookmark(UUID jobId, UUID userId) {
        this.jobId = jobId;
        this.userId = userId;
        this.createdAt = Instant.now();
    }

    public JobBookmark(UUID jobId, UUID userId, Instant createdAt) {
        this.jobId = jobId;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public UUID getJobId() { return jobId; }
    public UUID getUserId() { return userId; }
    public Instant getCreatedAt() { return createdAt; }
}
