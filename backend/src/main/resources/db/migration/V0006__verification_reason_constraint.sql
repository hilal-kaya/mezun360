-- PostgreSQL CHECK permits UNKNOWN; require an explicit non-null reason for rejection.
ALTER TABLE mezun360.alumni_verification_requests
ADD CONSTRAINT rejected_verification_requires_reason CHECK (status <> 'REJECTED' OR rejection_reason IS NOT NULL);
