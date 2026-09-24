-- Flyway owns the technical schema. No domain tables belong in M1A.
CREATE SCHEMA IF NOT EXISTS mezun360;
COMMENT ON SCHEMA mezun360 IS 'BTU Mezun360 application schema; managed by Flyway';

