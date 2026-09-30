CREATE TABLE mezun360.mentorship_requests (
    id UUID PRIMARY KEY,
    mentor_id UUID NOT NULL REFERENCES mezun360.user_accounts(id),
    mentee_id UUID NOT NULL REFERENCES mezun360.user_accounts(id),
    status VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Ensure a mentee cannot spam the same mentor with multiple active requests
CREATE UNIQUE INDEX idx_active_mentorship ON mezun360.mentorship_requests (mentor_id, mentee_id) 
WHERE status IN ('PENDING', 'ACCEPTED');
