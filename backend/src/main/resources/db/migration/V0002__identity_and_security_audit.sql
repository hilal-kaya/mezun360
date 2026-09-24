CREATE TABLE mezun360.user_accounts (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    email_canonical VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL DEFAULT 'ALUMNI' CHECK (role IN ('ALUMNI', 'ADMIN')),
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING_EMAIL'
        CHECK (status IN ('PENDING_EMAIL', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    email_verified_at TIMESTAMPTZ,
    security_version BIGINT NOT NULL DEFAULT 0 CHECK (security_version >= 0),
    development_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT user_accounts_canonical_email CHECK (email_canonical = lower(btrim(email))),
    CONSTRAINT user_accounts_password_format CHECK (password_hash LIKE '{argon2id}$argon2id$%'),
    CONSTRAINT user_accounts_active_email CHECK (status <> 'ACTIVE' OR email_verified_at IS NOT NULL)
);

-- Credential/authority changes invalidate existing session security versions, including operator SQL changes.
CREATE FUNCTION mezun360.update_account_security_version() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF ROW(NEW.password_hash, NEW.email_canonical, NEW.role, NEW.status, NEW.email_verified_at, NEW.development_only)
        IS DISTINCT FROM ROW(OLD.password_hash, OLD.email_canonical, OLD.role, OLD.status, OLD.email_verified_at, OLD.development_only) THEN
        NEW.security_version := OLD.security_version + 1;
    ELSIF NEW.security_version < OLD.security_version THEN
        RAISE EXCEPTION 'Security version cannot decrease';
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
CREATE TRIGGER user_accounts_security_version BEFORE UPDATE ON mezun360.user_accounts
    FOR EACH ROW EXECUTE FUNCTION mezun360.update_account_security_version();

CREATE TABLE mezun360.audit_events (
    id UUID PRIMARY KEY,
    actor_id UUID,
    actor_type VARCHAR(16) NOT NULL CHECK (actor_type IN ('USER', 'SYSTEM', 'OPERATOR')),
    actor_role VARCHAR(16) CHECK (actor_role IN ('ALUMNI', 'ADMIN')),
    target_id UUID,
    action VARCHAR(64) NOT NULL,
    outcome VARCHAR(16) NOT NULL CHECK (outcome IN ('ACCEPTED', 'DENIED', 'SUCCESS')),
    occurred_at TIMESTAMPTZ NOT NULL,
    correlation_id UUID NOT NULL
);
CREATE INDEX audit_events_occurred_at_idx ON mezun360.audit_events (occurred_at);
CREATE INDEX audit_events_actor_time_idx ON mezun360.audit_events (actor_id, occurred_at);
-- No contact values, raw attempted email, IP address, password, token or session ID is stored here.
-- Before production, runtime grants must allow audit INSERT/SELECT only; migration credentials stay separate.
REVOKE UPDATE, DELETE, TRUNCATE ON mezun360.audit_events FROM PUBLIC;
