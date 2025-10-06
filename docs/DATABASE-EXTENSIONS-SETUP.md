# Database Extensions Setup Guide

## Overview

This guide covers setting up PostgreSQL extensions for AI-powered search and full-text capabilities in Nova Universe, following industry standards for complex applications in 2024/2025.

## Required Extensions

### 1. pgvector - Vector Similarity Search

**Purpose**: Enable AI-powered semantic search, ticket auto-categorization, and intelligent KB recommendations.

**Version**: 0.8.0 or higher (latest: 0.8.1)

**Use Cases**:
- Semantic search across knowledge base articles
- Similar ticket detection and auto-categorization
- AI-powered ticket routing and assignment
- Smart KB article recommendations
- Duplicate ticket detection
- Sentiment analysis and classification

#### Installation

**Option A: Package Manager (Recommended)**

```bash
# Ubuntu/Debian
sudo apt install postgresql-16-pgvector

# macOS Homebrew
brew install pgvector

# Docker
docker pull pgvector/pgvector:pg16-latest
```

**Option B: Build from Source**

```bash
cd /tmp
git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install # may need sudo
```

#### Enable Extension

```sql
-- Connect to your database
psql -U nova_admin -d nova_universe

-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 2. Full-Text Search (Built-in)

**Purpose**: Fast, language-aware text search across tickets and knowledge base.

**Version**: Built into PostgreSQL 13+

**Use Cases**:
- Fast keyword search across tickets
- Knowledge base article search
- Comment and description search
- Tag and category search
- Multi-language support (English, Spanish, etc.)

#### Configuration

```sql
-- Set default text search configuration
ALTER DATABASE nova_universe SET default_text_search_config = 'pg_catalog.english';

-- For multi-language support
-- ALTER DATABASE nova_universe SET default_text_search_config = 'pg_catalog.spanish';
```

## Schema Updates

### 1. Update Prisma Schema

The schema has already been updated with:

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector", schema: "public")]
}

generator client {
  previewFeatures = ["postgresqlExtensions", "fullTextSearch", "fullTextIndex"]
}
```

### 2. Create Migration

```bash
# Generate migration for extensions
npx prisma migrate dev --name add_vector_and_fulltext_search
```

### 3. Migration SQL

The migration will include:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector and tsvector columns to kb_articles
ALTER TABLE kb_articles 
  ADD COLUMN IF NOT EXISTS search_vector tsvector,
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add vector and tsvector columns to support_tickets
ALTER TABLE support_tickets 
  ADD COLUMN IF NOT EXISTS search_vector tsvector,
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS kb_articles_search_vector_idx 
  ON kb_articles USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS support_tickets_search_vector_idx 
  ON support_tickets USING GIN (search_vector);

-- Create HNSW indexes for vector similarity search
-- Using cosine distance (best for normalized embeddings like OpenAI)
CREATE INDEX IF NOT EXISTS kb_articles_embedding_idx 
  ON kb_articles USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS support_tickets_embedding_idx 
  ON support_tickets USING hnsw (embedding vector_cosine_ops);

-- Create trigger functions to automatically update search_vector
CREATE OR REPLACE FUNCTION kb_articles_search_vector_update() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION support_tickets_search_vector_update() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.resolution, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS kb_articles_search_vector_trigger ON kb_articles;
CREATE TRIGGER kb_articles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION kb_articles_search_vector_update();

DROP TRIGGER IF EXISTS support_tickets_search_vector_trigger ON support_tickets;
CREATE TRIGGER support_tickets_search_vector_trigger
  BEFORE INSERT OR UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION support_tickets_search_vector_update();

-- Backfill existing data
UPDATE kb_articles SET updated_at = updated_at;
UPDATE support_tickets SET updated_at = updated_at;
```

## Usage Examples

### Full-Text Search

```typescript
// Search knowledge base articles
const articles = await prisma.$queryRaw`
  SELECT id, title, 
         ts_rank(search_vector, query) AS rank
  FROM kb_articles, 
       plainto_tsquery('english', ${searchTerm}) query
  WHERE search_vector @@ query
    AND status = 'PUBLISHED'
  ORDER BY rank DESC
  LIMIT 10
`;

// Search tickets with highlighting
const tickets = await prisma.$queryRaw`
  SELECT 
    id, 
    ticket_number,
    title,
    ts_headline('english', description, query) AS highlighted_description,
    ts_rank(search_vector, query) AS relevance
  FROM support_tickets,
       plainto_tsquery('english', ${searchTerm}) query
  WHERE search_vector @@ query
  ORDER BY relevance DESC
  LIMIT 20
`;
```

### Vector Similarity Search

```typescript
// Find similar knowledge base articles (using OpenAI embeddings)
const similarArticles = await prisma.$queryRaw`
  SELECT 
    id, 
    title,
    1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
  FROM kb_articles
  WHERE embedding IS NOT NULL
    AND status = 'PUBLISHED'
  ORDER BY embedding <=> ${queryEmbedding}::vector
  LIMIT 5
`;

// Find similar tickets for auto-categorization
const similarTickets = await prisma.$queryRaw`
  SELECT 
    id, 
    ticket_number,
    category,
    subcategory,
    1 - (embedding <=> ${newTicketEmbedding}::vector) AS similarity
  FROM support_tickets
  WHERE embedding IS NOT NULL
    AND state IN ('RESOLVED', 'CLOSED')
  ORDER BY embedding <=> ${newTicketEmbedding}::vector
  LIMIT 10
`;
```

### Hybrid Search (Combining Full-Text + Vector)

```typescript
// Best of both worlds: keyword relevance + semantic similarity
const hybridResults = await prisma.$queryRaw`
  WITH text_search AS (
    SELECT 
      id, 
      ts_rank(search_vector, query) AS text_score
    FROM kb_articles, plainto_tsquery('english', ${searchTerm}) query
    WHERE search_vector @@ query
      AND status = 'PUBLISHED'
  ),
  vector_search AS (
    SELECT 
      id, 
      1 - (embedding <=> ${queryEmbedding}::vector) AS vector_score
    FROM kb_articles
    WHERE embedding IS NOT NULL
      AND status = 'PUBLISHED'
  )
  SELECT 
    a.id,
    a.title,
    a.summary,
    COALESCE(t.text_score, 0) * 0.4 + COALESCE(v.vector_score, 0) * 0.6 AS combined_score
  FROM kb_articles a
  LEFT JOIN text_search t ON a.id = t.id
  LEFT JOIN vector_search v ON a.id = v.id
  WHERE (t.text_score IS NOT NULL OR v.vector_score IS NOT NULL)
  ORDER BY combined_score DESC
  LIMIT 10
`;
```

## Performance Optimization

### 1. Index Configuration

```sql
-- Tune HNSW index parameters for better performance
-- m: max connections per layer (higher = better recall, slower build)
-- ef_construction: candidate list size during build (higher = better quality, slower)
CREATE INDEX kb_articles_embedding_idx 
  ON kb_articles USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Tune query performance
SET hnsw.ef_search = 40; -- Default, increase for better recall
```

### 2. Maintenance

```sql
-- Rebuild indexes periodically (monthly for production)
REINDEX INDEX CONCURRENTLY kb_articles_search_vector_idx;
REINDEX INDEX CONCURRENTLY kb_articles_embedding_idx;

-- Vacuum to reclaim space
VACUUM ANALYZE kb_articles;
VACUUM ANALYZE support_tickets;
```

### 3. Monitoring

```sql
-- Check index usage
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('kb_articles', 'support_tickets')
ORDER BY idx_scan DESC;

-- Check index size
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('kb_articles', 'support_tickets');
```

## AI Integration (OpenAI Example)

### Generate Embeddings

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embedding for KB article
async function generateArticleEmbedding(article: { title: string; content: string }) {
  const text = `${article.title}\n\n${article.content}`;
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // 1536 dimensions
    input: text,
    encoding_format: 'float',
  });
  
  return response.data[0].embedding;
}

// Store embedding in database
await prisma.$executeRaw`
  UPDATE kb_articles
  SET embedding = ${JSON.stringify(embedding)}::vector
  WHERE id = ${articleId}
`;
```

## Multi-Tenancy Considerations

For multi-tenant setups, consider:

1. **Schema-based isolation**: Each tenant has separate schema
   ```sql
   CREATE SCHEMA tenant_123;
   SET search_path TO tenant_123, public;
   CREATE TABLE tenant_123.kb_articles ( ... );
   ```

2. **Row-level security**: Single schema with tenant_id column
   ```sql
   ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY tenant_isolation ON kb_articles
     USING (tenant_id = current_setting('app.current_tenant')::uuid);
   ```

## Troubleshooting

### pgvector not found

```bash
# Verify extension is available
psql -U postgres -c "SELECT * FROM pg_available_extensions WHERE name = 'vector';"

# If not available, reinstall
sudo apt remove postgresql-16-pgvector
sudo apt install postgresql-16-pgvector

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Slow vector queries

```sql
-- Increase ef_search for better recall (at cost of speed)
SET hnsw.ef_search = 100;

-- Or rebuild index with higher m value
DROP INDEX kb_articles_embedding_idx;
CREATE INDEX kb_articles_embedding_idx 
  ON kb_articles USING hnsw (embedding vector_cosine_ops)
  WITH (m = 32, ef_construction = 128);
```

### Full-text search not working

```sql
-- Verify search_vector is populated
SELECT id, search_vector IS NOT NULL FROM kb_articles LIMIT 5;

-- Manually trigger update
UPDATE kb_articles SET updated_at = updated_at WHERE id = '...';

-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgrelid = 'kb_articles'::regclass;
```

## References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Multi-Tenant Database Design Patterns](https://daily.dev/blog/multi-tenant-database-design-patterns-2024)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Prisma PostgreSQL Extensions](https://www.prisma.io/docs/concepts/components/prisma-schema/postgresql-extensions)

## Next Steps

1. ✅ Update `.env` with connection pool configuration
2. ✅ Run `npm run prisma:generate` to generate new client
3. ⬜ Run migrations: `npm run prisma:migrate:dev`
4. ⬜ Verify extensions: `psql -c "SELECT * FROM pg_extension;"`
5. ⬜ Test full-text search queries
6. ⬜ Integrate OpenAI for embeddings
7. ⬜ Set up monitoring and alerting
8. ⬜ Update application code to use new search capabilities
