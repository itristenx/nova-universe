-- Migration: Add email_accounts table for M365 integration
CREATE TABLE IF NOT EXISTS email_accounts (
    id SERIAL PRIMARY KEY,
    queue VARCHAR(16) NOT NULL CHECK (queue IN ('IT', 'HR', 'OPS', 'CYBER')),
    address VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    graph_impersonation BOOLEAN DEFAULT FALSE,
    auto_create_tickets BOOLEAN DEFAULT TRUE,
    webhook_mode BOOLEAN DEFAULT FALSE,
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup by address
CREATE INDEX IF NOT EXISTS idx_email_accounts_address ON email_accounts(address);

-- Index for queue
CREATE INDEX IF NOT EXISTS idx_email_accounts_queue ON email_accounts(queue);

-- Knowledge Base: Articles, Versions, Comments
CREATE TABLE IF NOT EXISTS kb_articles (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    author_id INTEGER NOT NULL,
    current_version_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kb_article_versions (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
    version_number VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    content TEXT NOT NULL,
    editor_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key for current_version_id (set after first version is created)
ALTER TABLE kb_articles
    ADD CONSTRAINT fk_kb_articles_current_version
    FOREIGN KEY (current_version_id)
    REFERENCES kb_article_versions(id)
    ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS kb_article_comments (
    id SERIAL PRIMARY KEY,
    article_version_id INTEGER NOT NULL REFERENCES kb_article_versions(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX IF NOT EXISTS idx_kb_article_versions_article_id ON kb_article_versions(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_article_comments_version_id ON kb_article_comments(article_version_id);
