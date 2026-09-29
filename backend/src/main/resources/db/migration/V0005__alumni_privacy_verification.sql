ALTER TABLE mezun360.alumni_profiles ADD COLUMN evidence_revision bigint NOT NULL DEFAULT 0 CHECK (evidence_revision >= 0);

CREATE TABLE mezun360.alumni_privacy_settings (
    profile_id uuid PRIMARY KEY REFERENCES mezun360.alumni_profiles(id) ON DELETE CASCADE,
    directory_opt_in boolean NOT NULL DEFAULT false,
    profile_visibility varchar(24) NOT NULL DEFAULT 'PRIVATE' CHECK (profile_visibility IN ('PRIVATE','ALUMNI_MEMBERS')),
    version bigint NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);
INSERT INTO mezun360.alumni_privacy_settings (profile_id, created_at, updated_at)
SELECT id, now(), now() FROM mezun360.alumni_profiles;

CREATE TABLE mezun360.alumni_verification_requests (
    id uuid PRIMARY KEY,
    profile_id uuid NOT NULL REFERENCES mezun360.alumni_profiles(id) ON DELETE RESTRICT,
    evidence_revision bigint NOT NULL CHECK (evidence_revision >= 0),
    evidence jsonb NOT NULL CHECK (jsonb_typeof(evidence) = 'object'),
    status varchar(16) NOT NULL CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
    source varchar(24) NOT NULL DEFAULT 'MANUAL_ADMIN' CHECK (source = 'MANUAL_ADMIN'),
    submitted_at timestamptz NOT NULL,
    reviewed_at timestamptz,
    reviewed_by uuid REFERENCES mezun360.user_accounts(id) ON DELETE RESTRICT,
    rejection_reason varchar(500),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    version bigint NOT NULL DEFAULT 0,
    CHECK ((status = 'PENDING' AND reviewed_at IS NULL AND reviewed_by IS NULL AND rejection_reason IS NULL)
        OR (status = 'VERIFIED' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND rejection_reason IS NULL)
        OR (status = 'REJECTED' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND length(trim(rejection_reason)) BETWEEN 10 AND 500)),
    CHECK (reviewed_at IS NULL OR reviewed_at >= submitted_at)
);
CREATE UNIQUE INDEX verification_one_pending_per_revision ON mezun360.alumni_verification_requests(profile_id, evidence_revision) WHERE status = 'PENDING';
CREATE INDEX verification_profile_history ON mezun360.alumni_verification_requests(profile_id, evidence_revision, submitted_at DESC, id);
CREATE INDEX verification_queue ON mezun360.alumni_verification_requests(status, submitted_at, id);
CREATE INDEX verification_reviewer ON mezun360.alumni_verification_requests(reviewed_by);

-- Evidence and completed decisions cannot be rewritten by later application updates.
CREATE FUNCTION mezun360.protect_verification_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status <> 'PENDING' OR NEW.id <> OLD.id OR NEW.profile_id <> OLD.profile_id
       OR NEW.evidence_revision <> OLD.evidence_revision OR NEW.evidence <> OLD.evidence
       OR NEW.source <> OLD.source OR NEW.submitted_at <> OLD.submitted_at OR NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'Verification history is immutable';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER verification_history_immutable BEFORE UPDATE ON mezun360.alumni_verification_requests
FOR EACH ROW EXECUTE FUNCTION mezun360.protect_verification_history();
