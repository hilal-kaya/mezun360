package tr.edu.btu.mezun360.outbox.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events", schema = "mezun360")
public class OutboxEvent {
    @Id
    private UUID id;

    @Column(name = "type", nullable = false, length = 64)
    private String type;

    @Column(name = "type_version", nullable = false)
    private Integer typeVersion = 1;

    @Column(name = "aggregate_id", nullable = false)
    private UUID aggregateId;

    @Column(name = "aggregate_version")
    private Long aggregateVersion;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "correlation_id", nullable = false)
    private UUID correlationId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", nullable = false, columnDefinition = "jsonb")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private OutboxEventStatus status = OutboxEventStatus.PENDING;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    protected OutboxEvent() {}

    public OutboxEvent(UUID id, String type, UUID aggregateId, Instant occurredAt, UUID correlationId, String payload) {
        this.id = id;
        this.type = type;
        this.aggregateId = aggregateId;
        this.occurredAt = occurredAt;
        this.correlationId = correlationId;
        this.payload = payload;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void markAsProcessed() {
        this.status = OutboxEventStatus.PROCESSED;
    }

    public void markAsFailed(String errorMessage) {
        this.status = OutboxEventStatus.FAILED;
        this.errorMessage = errorMessage != null && errorMessage.length() > 1000 ? errorMessage.substring(0, 1000) : errorMessage;
    }

    public void incrementRetryCount() {
        this.retryCount++;
    }

    public UUID getId() { return id; }
    public String getType() { return type; }
    public String getPayload() { return payload; }
    public OutboxEventStatus getStatus() { return status; }
    public int getRetryCount() { return retryCount; }
    public String getErrorMessage() { return errorMessage; }
}
