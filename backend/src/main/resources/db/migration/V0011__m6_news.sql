CREATE TABLE mezun360.news_articles (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    publish_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url VARCHAR(1000),
    author VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_news_publish_date ON mezun360.news_articles(publish_date DESC);
