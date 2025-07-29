-- Add Nova Lore tables
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY,
  kb_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  tags JSONB,
  system_context TEXT,
  verified_solution BOOLEAN DEFAULT FALSE,
  approval_required BOOLEAN DEFAULT FALSE,
  created_by_id TEXT NOT NULL,
  last_modified_by_id TEXT,
  approved_by_id TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  access_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  unhelpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kb_article_versions (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  body_markdown TEXT NOT NULL,
  modified_by_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kb_article_comments (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

