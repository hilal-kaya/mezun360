CREATE TABLE mezun360.job_posts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    work_model VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    application_url VARCHAR(1024) NOT NULL,
    posted_by_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    CONSTRAINT job_posts_posted_by_fk FOREIGN KEY (posted_by_id) REFERENCES mezun360.user_accounts (id) ON DELETE CASCADE
);

CREATE INDEX idx_job_posts_created_at ON mezun360.job_posts (created_at DESC);

CREATE TABLE mezun360.job_bookmarks (
    job_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    PRIMARY KEY (job_id, user_id),
    CONSTRAINT job_bookmarks_job_fk FOREIGN KEY (job_id) REFERENCES mezun360.job_posts (id) ON DELETE CASCADE,
    CONSTRAINT job_bookmarks_user_fk FOREIGN KEY (user_id) REFERENCES mezun360.user_accounts (id) ON DELETE CASCADE
);
