package tr.edu.btu.mezun360.outbox.domain;

public enum OutboxEventStatus {
    PENDING,
    PROCESSED,
    FAILED
}
