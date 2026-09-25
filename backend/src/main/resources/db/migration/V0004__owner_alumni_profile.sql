-- M2A owner-only data. No visibility, verification workflow or demo records.
CREATE TABLE mezun360.alumni_profiles (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES mezun360.user_accounts(id) ON DELETE RESTRICT,
    first_name varchar(100) NOT NULL CHECK (length(btrim(first_name)) > 0),
    last_name varchar(100) NOT NULL CHECK (length(btrim(last_name)) > 0),
    department varchar(150), graduation_year integer CHECK (graduation_year >= 1900),
    city varchar(100), current_company varchar(150), current_position varchar(150), industry varchar(100), about varchar(2000),
    willing_to_mentor boolean NOT NULL DEFAULT false,
    willing_to_share_opportunities boolean NOT NULL DEFAULT false,
    willing_to_speak_at_events boolean NOT NULL DEFAULT false,
    willing_to_support_university_projects boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
    version bigint NOT NULL DEFAULT 0
);
CREATE TABLE mezun360.employment_records (
    id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES mezun360.alumni_profiles(id) ON DELETE CASCADE,
    company varchar(150) NOT NULL, position varchar(150) NOT NULL, industry varchar(100), city varchar(100),
    start_date date NOT NULL CHECK (start_date >= DATE '1900-01-01'), end_date date,
    currently_working boolean NOT NULL, description varchar(2000),
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
    CHECK ((currently_working AND end_date IS NULL) OR (NOT currently_working AND end_date >= start_date AND end_date IS NOT NULL))
);
CREATE INDEX employment_profile_dates_idx ON mezun360.employment_records(profile_id, start_date DESC, id);
CREATE TABLE mezun360.education_records (
    id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES mezun360.alumni_profiles(id) ON DELETE CASCADE,
    institution varchar(150) NOT NULL, department varchar(150) NOT NULL, degree varchar(100) NOT NULL,
    start_year integer NOT NULL CHECK (start_year >= 1900), graduation_year integer,
    source varchar(255) NOT NULL DEFAULT 'USER_ENTERED' CHECK (source = 'USER_ENTERED'),
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
    CHECK (graduation_year IS NULL OR graduation_year >= start_year)
);
CREATE INDEX education_profile_years_idx ON mezun360.education_records(profile_id, start_year DESC, id);
CREATE TABLE mezun360.skills (
    id uuid PRIMARY KEY, name varchar(60) NOT NULL, normalized_name varchar(60) NOT NULL UNIQUE,
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
    CHECK (length(btrim(normalized_name)) > 0)
);
CREATE TABLE mezun360.alumni_profile_skills (
    profile_id uuid NOT NULL REFERENCES mezun360.alumni_profiles(id) ON DELETE CASCADE,
    skill_id uuid NOT NULL REFERENCES mezun360.skills(id) ON DELETE RESTRICT,
    PRIMARY KEY (profile_id, skill_id)
);
CREATE INDEX profile_skills_skill_idx ON mezun360.alumni_profile_skills(skill_id);
CREATE TABLE mezun360.certifications (
    id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES mezun360.alumni_profiles(id) ON DELETE CASCADE,
    name varchar(150) NOT NULL, issuer varchar(150) NOT NULL, year integer NOT NULL CHECK (year >= 1900),
    credential_url varchar(2048), created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX certifications_profile_year_idx ON mezun360.certifications(profile_id, year DESC, id);
