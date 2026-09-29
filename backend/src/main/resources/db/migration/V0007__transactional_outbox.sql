CREATE TABLE mezun360.outbox_events (
    id UUID PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    type_version INTEGER NOT NULL DEFAULT 1,
    aggregate_id UUID NOT NULL,
    aggregate_version BIGINT,
    occurred_at TIMESTAMPTZ NOT NULL,
    correlation_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
    error_message VARCHAR(1000),
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX outbox_events_pending_idx ON mezun360.outbox_events(status, created_at ASC) WHERE status = 'PENDING';
