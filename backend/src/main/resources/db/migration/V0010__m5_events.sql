CREATE TABLE mezun360.events (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE mezun360.event_attendances (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES mezun360.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mezun360.user_accounts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_events_date ON mezun360.events(event_date);
CREATE INDEX idx_event_attendances_user ON mezun360.event_attendances(user_id);
