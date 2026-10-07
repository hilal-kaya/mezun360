CREATE TABLE mezun360.connection_requests (
    id uuid PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES mezun360.user_accounts(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES mezun360.alumni_profiles(id) ON DELETE CASCADE,
    status varchar(16) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    UNIQUE(sender_id, receiver_id)
);

CREATE INDEX idx_connection_requests_sender ON mezun360.connection_requests(sender_id);
CREATE INDEX idx_connection_requests_receiver ON mezun360.connection_requests(receiver_id);
