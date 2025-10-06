# @nova/database

Industry-standard database layer for Nova Universe ITSM platform.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│                  (API Routes, Services)                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├─────────────────────┬─────────────────
                   │                     │
                   ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  PRISMA CLIENT   │  │  REDIS CLIENT    │
        │  (PostgreSQL)    │  │  (ioredis)       │
        └────────┬─────────┘  └─────────┬────────┘
                 │                      │
                 ▼                      ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   PostgreSQL     │  │      Redis       │
        │                  │  │                  │
        │ • All data       │  │ • Cache          │
        │ • pgvector       │  │ • Sessions       │
        │ • Full-text      │  │ • Rate limiting  │
        │ • Transactions   │  │ • Pub/Sub        │
        └──────────────────┘  └──────────────────┘
```

## Features

### ✅ PostgreSQL (via Prisma ORM)
- **Type-safe database access** - Auto-generated TypeScript types
- **Connection pooling** - Automatic connection management (20 connections default)
- **Multi-tenancy** - Schema-based isolation (Shared Database, Separate Schemas)
- **Soft deletes** - Automatic filtering of deleted records
- **AI-ready** - pgvector extension for embeddings
- **Full-text search** - Native PostgreSQL ts_vector
- **Transaction support** - Automatic retries with exponential backoff
- **Read replicas** - Optional read scaling for analytics

### ✅ Redis (via ioredis)
- **Caching layer** - Query result caching with TTL
- **Session storage** - User sessions and temporary tokens
- **Rate limiting** - Token bucket algorithm for API throttling
- **Pub/Sub** - Real-time messaging and events
- **Distributed locks** - Prevent race conditions
- **Graceful degradation** - App continues if Redis unavailable

## Installation

```bash
pnpm add @nova/database
```

## Quick Start

```typescript
import { prisma, redis, Prisma } from '@nova/database';

// ============================================================================
// POSTGRESQL OPERATIONS
// ============================================================================

// Create a record
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    status: 'ACTIVE'
  }
});

// Query with filters
const activeUsers = await prisma.user.findMany({
  where: { 
    status: 'ACTIVE',
    createdAt: { gte: new Date('2024-01-01') }
  },
  include: { 
    tickets: true,
    groups: true
  },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// Update
await prisma.user.update({
  where: { id: user.id },
  data: { lastLoginAt: new Date() }
});

// Delete (soft delete if model has deletedAt field)
await prisma.user.delete({
  where: { id: user.id }
});

// ============================================================================
// REDIS CACHING
// ============================================================================

// Set cache with TTL
await redis.cache.set('user:123', user, { ttl: 3600 }); // 1 hour

// Get from cache
const cached = await redis.cache.get<User>('user:123');

// Delete cache
await redis.cache.delete('user:123');

// Clear pattern
await redis.cache.clear('user:*');

// ============================================================================
// SESSIONS
// ============================================================================

// Create session
await redis.session.set(sessionId, {
  userId: '123',
  permissions: ['read', 'write']
}, 86400); // 24 hours

// Get session
const session = await redis.session.get(sessionId);

// Delete session
await redis.session.delete(sessionId);

// Keep session alive
await redis.session.touch(sessionId);

// ============================================================================
// RATE LIMITING
// ============================================================================

const result = await redis.rateLimit.check({
  identifier: req.ip,
  max: 100,        // 100 requests
  window: 60       // per 60 seconds
});

if (!result.allowed) {
  throw new Error('Rate limit exceeded');
}

console.log(`Remaining: ${result.remaining}`);
console.log(`Resets at: ${new Date(result.resetAt)}`);

// ============================================================================
// TRANSACTIONS
// ============================================================================

// Simple transaction
await prisma.$transaction([
  prisma.user.create({ data: {...} }),
  prisma.log.create({ data: {...} })
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: {...} });
  await tx.log.create({ data: { userId: user.id, ... } });
  return user;
});

// With automatic retry
import { executeTransaction } from '@nova/database';

await executeTransaction(async (tx) => {
  return tx.user.create({ data: {...} });
}, { maxRetries: 3, delay: 1000 });
```

## Multi-Tenancy

Nova Universe uses the **Shared Database, Separate Schemas** pattern - industry standard for B2B SaaS.

```typescript
import { setTenant, clearTenant, getCurrentTenant } from '@nova/database';

// Set tenant context (typically in auth middleware)
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  if (tenantId) {
    setTenant(tenantId);
  }
  next();
});

// Now all queries are automatically tenant-scoped
const tickets = await prisma.supportTicket.findMany();
// → Only returns tickets for current tenant

// Clear tenant for background jobs
clearTenant();

// Get current tenant
const tenant = getCurrentTenant();
```

## AI Features

### Vector Search (Semantic Similarity)

```typescript
import { generateEmbedding } from '@nova/ai';

// Generate embedding for a KB article
const embedding = await generateEmbedding(article.content);

// Store with embedding
await prisma.kbArticle.create({
  data: {
    title: 'How to reset password',
    content: article.content,
    embedding: embedding, // vector(1536)
    categoryId: 'cat-123'
  }
});

// Find similar articles (cosine similarity)
const similar = await prisma.$queryRaw<KbArticle[]>`
  SELECT id, title, content,
    embedding <=> ${embedding}::vector AS distance
  FROM "KbArticle"
  WHERE embedding IS NOT NULL
  ORDER BY distance
  LIMIT 10
`;
```

### Full-Text Search

```typescript
// PostgreSQL native full-text search
const results = await prisma.$queryRaw<SupportTicket[]>`
  SELECT id, subject, description,
    ts_rank(search_vector, query) AS rank
  FROM "SupportTicket",
  to_tsquery('english', ${searchQuery}) AS query
  WHERE search_vector @@ query
  ORDER BY rank DESC
  LIMIT 20
`;

// Or use Prisma's search (for simple cases)
const tickets = await prisma.supportTicket.findMany({
  where: {
    OR: [
      { subject: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }
});
```

## Performance Best Practices

### 1. Connection Pooling

```typescript
// Configure via DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

Default configuration:
- **connection_limit**: 20 (recommendation: 2-5 per CPU core)
- **connect_timeout**: 10 seconds
- **pool_timeout**: 10 seconds

### 2. Caching Strategy

```typescript
// Cache-aside pattern
async function getUser(id: string) {
  // Try cache first
  const cached = await redis.cache.get<User>(`user:${id}`);
  if (cached) return cached;

  // Cache miss - query database
  const user = await prisma.user.findUnique({
    where: { id },
    include: { groups: true }
  });

  // Store in cache
  if (user) {
    await redis.cache.set(`user:${id}`, user, { ttl: 3600 });
  }

  return user;
}

// Invalidate on update
async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  const user = await prisma.user.update({ where: { id }, data });
  await redis.cache.delete(`user:${id}`); // Invalidate cache
  return user;
}
```

### 3. Recommended TTL Values

```typescript
const CACHE_TTL = {
  USER_PROFILE: 3600,      // 1 hour
  TICKET_DETAILS: 1800,    // 30 minutes
  KB_ARTICLE: 7200,        // 2 hours
  SETTINGS: 86400,         // 24 hours
  TEMP_DATA: 300,          // 5 minutes
};
```

### 4. Read Replicas (Optional)

For production systems with heavy read load:

```typescript
import { prismaReadReplica } from '@nova/database';

// Use read replica for analytics queries
const stats = await prismaReadReplica.supportTicket.groupBy({
  by: ['status'],
  _count: true
});

// Use primary for writes
await prisma.supportTicket.create({ data: {...} });
```

## Health Checks

```typescript
import { checkDatabaseHealth, getPoolMetrics, redis } from '@nova/database';

// Database health
const dbHealthy = await checkDatabaseHealth();

// Connection pool metrics
const metrics = await getPoolMetrics();
console.log(`Active connections: ${metrics.activeConnections}`);
console.log(`Idle connections: ${metrics.idleConnections}`);

// Redis health
const redisHealthy = await redis.healthCheck();

// Combined health endpoint
export async function healthEndpoint() {
  return {
    database: await checkDatabaseHealth() ? 'healthy' : 'unhealthy',
    redis: await redis.healthCheck() ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString()
  };
}
```

## Error Handling

```typescript
import { Prisma } from '@nova/database';

try {
  await prisma.user.create({ data: {...} });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    
    // Foreign key constraint violation
    if (error.code === 'P2003') {
      throw new Error('Referenced record not found');
    }
  }
  
  throw error;
}
```

## Testing

```typescript
import { prisma, redis } from '@nova/database';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.disconnect();
});

beforeEach(async () => {
  // Clean database between tests
  await prisma.user.deleteMany();
  await prisma.supportTicket.deleteMany();
  
  // Clear Redis cache
  await redis.cache.clear('*');
});

test('create user', async () => {
  const user = await prisma.user.create({
    data: { email: 'test@example.com', name: 'Test' }
  });
  
  expect(user.id).toBeDefined();
  expect(user.email).toBe('test@example.com');
});
```

## Environment Variables

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/nova?schema=public&connection_limit=20
DATABASE_URL_READ_REPLICA= # Optional for read scaling
DATABASE_POOL_SIZE=20
DATABASE_CONNECT_TIMEOUT=10
DATABASE_POOL_TIMEOUT=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_ENABLED=true
REDIS_TLS_ENABLED=false
# REDIS_CLUSTER_NODES=host1:6379,host2:6379,host3:6379
```

## Migration Guide

See [DATABASE-MIGRATION-GUIDE.md](../../docs/DATABASE-MIGRATION-GUIDE.md) for detailed instructions on migrating from the old MongoDB-based factory to the new Prisma + Redis architecture.

## API Reference

### Prisma Client

Full Prisma API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

### Redis Client

```typescript
// Connection
redis.isAvailable(): boolean
redis.getClient(): Redis | Cluster | null
redis.disconnect(): Promise<void>
redis.healthCheck(): Promise<boolean>

// Cache
redis.cache.set(key, value, options): Promise<boolean>
redis.cache.get<T>(key, options): Promise<T | null>
redis.cache.delete(key, options): Promise<boolean>
redis.cache.clear(pattern, namespace): Promise<boolean>

// Sessions
redis.session.set(id, data, ttl): Promise<boolean>
redis.session.get(id): Promise<SessionData | null>
redis.session.delete(id): Promise<boolean>
redis.session.touch(id, ttl): Promise<boolean>

// Rate Limiting
redis.rateLimit.check(config): Promise<RateLimitResult>
redis.rateLimit.reset(identifier): Promise<boolean>

// Pub/Sub
redis.pubsub.publish(channel, message): Promise<boolean>
redis.pubsub.subscribe(channel, callback): Promise<boolean>

// Locks
redis.lock.acquire(resource, ttl, retries): Promise<string | null>
redis.lock.release(resource, token): Promise<boolean>
```

## License

MIT

