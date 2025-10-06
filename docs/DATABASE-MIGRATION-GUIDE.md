# Database Factory Migration Guide

## Overview

This guide helps you migrate from the **old MongoDB-based database factory** to the **new industry-standard PostgreSQL + Redis architecture**.

### Architecture Changes

| Component | Old | New | Purpose |
|-----------|-----|-----|---------|
| **Primary DB** | MongoDB + PostgreSQL | PostgreSQL only (via Prisma) | All persistent data |
| **Caching** | N/A | Redis | Query cache, sessions, rate limiting |
| **ORM** | Custom managers | Prisma Client | Type-safe database access |
| **Multi-tenancy** | N/A | Schema-based isolation | B2B SaaS standard |
| **Vector Search** | N/A | pgvector extension | AI embeddings |
| **Full-Text Search** | N/A | PostgreSQL ts_vector | Native search |

---

## Migration Steps

### Step 1: Update Imports

#### Old Code (MongoDB-based factory)
```javascript
// ❌ OLD - Don't use this anymore
import { DatabaseFactory } from './database/factory.js';
import { MongoDBManager } from './database/mongodb.js';

const dbFactory = new DatabaseFactory();
await dbFactory.initialize({
  mongodb: { uri: process.env.MONGODB_URI },
  postgresql: { connectionString: process.env.DATABASE_URL }
});

// Store document in MongoDB
await dbFactory.storeDocument('tickets', { 
  title: 'Issue', 
  status: 'open' 
});

// Query PostgreSQL
const result = await dbFactory.query('SELECT * FROM users');
```

#### New Code (Prisma + Redis)
```typescript
// ✅ NEW - Use this instead
import { prisma, redis, Prisma } from '@/packages/database';

// All data goes to PostgreSQL via Prisma
const ticket = await prisma.supportTicket.create({
  data: {
    title: 'Issue',
    status: 'OPEN',
    priority: 'MEDIUM',
    assigneeId: userId,
  }
});

// Query with type safety
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' },
  include: { tickets: true }
});

// Use Redis for caching
await redis.cache.set(`ticket:${ticket.id}`, ticket, { ttl: 3600 });
const cached = await redis.cache.get(`ticket:${ticket.id}`);
```

---

### Step 2: Migrate MongoDB Collections to PostgreSQL Tables

#### Audit Logs
```javascript
// ❌ OLD (MongoDB)
await dbFactory.createAuditLog({
  action: 'user.login',
  userId: '123',
  metadata: { ip: '192.168.1.1' }
});
```

```typescript
// ✅ NEW (PostgreSQL)
await prisma.log.create({
  data: {
    level: 'INFO',
    message: 'User login',
    metadata: {
      action: 'user.login',
      userId: '123',
      ip: '192.168.1.1'
    },
    userId: '123'
  }
});
```

#### Documents/Tickets
```javascript
// ❌ OLD (MongoDB collections)
await dbFactory.storeDocument('support_tickets', {
  _id: 'ticket-123',
  subject: 'Help needed',
  status: 'open',
  createdAt: new Date()
});

await dbFactory.findDocuments('support_tickets', {
  status: 'open'
});

await dbFactory.updateDocuments('support_tickets', 
  { _id: 'ticket-123' },
  { status: 'closed' }
);
```

```typescript
// ✅ NEW (Prisma models)
await prisma.supportTicket.create({
  data: {
    id: 'ticket-123',
    subject: 'Help needed',
    status: 'OPEN',
    priority: 'MEDIUM'
  }
});

const openTickets = await prisma.supportTicket.findMany({
  where: { status: 'OPEN' }
});

await prisma.supportTicket.update({
  where: { id: 'ticket-123' },
  data: { status: 'CLOSED' }
});
```

---

### Step 3: Replace Manual SQL with Prisma

```javascript
// ❌ OLD (Raw SQL queries)
const users = await dbFactory.query(
  'SELECT * FROM users WHERE status = $1',
  ['active']
);

const result = await dbFactory.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  ['John Doe', 'john@example.com']
);
```

```typescript
// ✅ NEW (Prisma type-safe queries)
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' }
});

const newUser = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'ACTIVE'
  }
});

// For complex queries, still use raw SQL but typed
const result = await prisma.$queryRaw<User[]>`
  SELECT * FROM users 
  WHERE created_at > NOW() - INTERVAL '7 days'
`;
```

---

### Step 4: Implement Caching with Redis

```javascript
// ❌ OLD (No caching layer)
async function getUser(id) {
  const user = await dbFactory.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return user[0];
}
```

```typescript
// ✅ NEW (Redis caching pattern)
async function getUser(id: string) {
  // Try cache first
  const cached = await redis.cache.get<User>(`user:${id}`);
  if (cached) return cached;

  // Cache miss - query database
  const user = await prisma.user.findUnique({
    where: { id },
    include: { groups: true, tickets: true }
  });

  if (user) {
    // Store in cache for 1 hour
    await redis.cache.set(`user:${id}`, user, { ttl: 3600 });
  }

  return user;
}

// Invalidate cache on update
async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  const user = await prisma.user.update({
    where: { id },
    data
  });

  // Clear cache
  await redis.cache.delete(`user:${id}`);

  return user;
}
```

---

### Step 5: Migrate Transactions

```javascript
// ❌ OLD (Manual transaction management)
const client = await dbFactory.getClient();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO audit_logs ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

```typescript
// ✅ NEW (Prisma transactions)
await prisma.$transaction([
  prisma.user.create({
    data: { name: 'John', email: 'john@example.com' }
  }),
  prisma.log.create({
    data: { level: 'INFO', message: 'User created' }
  })
]);

// Or with callback (for complex logic)
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name: 'John', email: 'john@example.com' }
  });

  await tx.log.create({
    data: { 
      level: 'INFO', 
      message: 'User created',
      userId: user.id 
    }
  });

  return user;
});

// With automatic retry on failure
import { executeTransaction } from '@/packages/database';

await executeTransaction(async (tx) => {
  return tx.user.create({ data: {...} });
}, { maxRetries: 3 });
```

---

### Step 6: Implement Multi-Tenancy

```typescript
// Set tenant context (typically in auth middleware)
import { setTenant, clearTenant } from '@/packages/database';

// In your auth middleware
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  if (tenantId) {
    setTenant(tenantId);
  }
  next();
});

// Now all queries are automatically tenant-scoped
const tickets = await prisma.supportTicket.findMany();
// → Only returns tickets for the current tenant

// Clear tenant context for background jobs
clearTenant();
```

---

### Step 7: Add Rate Limiting and Sessions

```typescript
// Rate limiting for API endpoints
import { redis } from '@/packages/database';

app.use(async (req, res, next) => {
  const identifier = req.ip || req.user?.id || 'anonymous';
  
  const result = await redis.rateLimit.check({
    identifier,
    max: 100,        // 100 requests
    window: 60       // per 60 seconds
  });

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      resetAt: new Date(result.resetAt)
    });
  }

  res.setHeader('X-RateLimit-Remaining', result.remaining);
  next();
});

// Session storage
await redis.session.set(sessionId, {
  userId: '123',
  permissions: ['read', 'write']
}, 86400); // 24 hours

const session = await redis.session.get(sessionId);
```

---

### Step 8: Use AI Features (Vector Search & Full-Text Search)

```typescript
// Store AI embeddings for semantic search
import { generateEmbedding } from '@/packages/ai';

const embedding = await generateEmbedding(article.content);

await prisma.kbArticle.create({
  data: {
    title: 'How to reset password',
    content: article.content,
    embedding: embedding, // vector(1536)
    categoryId: 'cat-123'
  }
});

// Semantic search using vector similarity
const similarArticles = await prisma.$queryRaw`
  SELECT id, title, content,
    embedding <=> ${embedding}::vector AS distance
  FROM "KbArticle"
  ORDER BY distance
  LIMIT 10
`;

// Full-text search
const searchResults = await prisma.$queryRaw`
  SELECT id, title, content
  FROM "KbArticle"
  WHERE search_vector @@ to_tsquery('english', ${query})
  ORDER BY ts_rank(search_vector, to_tsquery('english', ${query})) DESC
  LIMIT 20
`;
```

---

## Files to Update

### 1. Remove Old Files
```bash
# Delete old MongoDB-based factory
rm packages/database/database/factory.js
rm packages/database/database/mongodb.js
rm packages/database/database/postgresql.js
rm packages/database/database/sqlite.js

# Delete old API database initialization
rm apps/api/database/factory.js
rm apps/api/database/db.js
```

### 2. Update Import Statements

Search and replace across all files:

```bash
# Find all old imports
grep -r "DatabaseFactory" apps/api/
grep -r "from.*database.*factory" apps/api/

# Replace with new imports
# OLD: import { DatabaseFactory } from './database/factory.js';
# NEW: import { prisma, redis } from '@/packages/database';
```

### 3. Update apps/api/db.js

```typescript
/**
 * Database initialization for API
 * Uses industry-standard Prisma + Redis architecture
 */
import { prisma, redis, checkDatabaseHealth } from '@/packages/database';

// Export database clients
export { prisma, redis };

// Health check endpoint
export async function healthCheck() {
  const dbHealthy = await checkDatabaseHealth();
  const redisHealthy = await redis.healthCheck();
  
  return {
    database: dbHealthy ? 'healthy' : 'unhealthy',
    redis: redisHealthy ? 'healthy' : 'unhealthy (graceful degradation)',
    timestamp: new Date().toISOString()
  };
}

// Connection lifecycle
export async function connect() {
  await prisma.$connect();
  console.log('✅ Connected to PostgreSQL via Prisma');
  
  if (await redis.isAvailable()) {
    console.log('✅ Connected to Redis');
  } else {
    console.warn('⚠️ Redis unavailable - continuing with graceful degradation');
  }
}

export async function disconnect() {
  await prisma.$disconnect();
  await redis.disconnect();
  console.log('👋 Disconnected from databases');
}

// Export default
export default { prisma, redis, healthCheck, connect, disconnect };
```

---

## Environment Variables

### Remove MongoDB Variables
```bash
# ❌ Remove these from .env
# MONGODB_URI=mongodb://localhost:27017/nova
# MONGODB_DATABASE=nova
```

### Add Redis Variables
```bash
# ✅ Add these to .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_ENABLED=true
REDIS_TLS_ENABLED=false
```

### Keep PostgreSQL Variables
```bash
# ✅ Keep these (already in .env)
DATABASE_URL=postgresql://user:password@localhost:5432/nova?schema=public&connection_limit=20
DATABASE_URL_READ_REPLICA= # Optional for read scaling
```

---

## Testing

### Test Database Connection
```typescript
import { checkDatabaseHealth, getPoolMetrics } from '@/packages/database';

// Health check
const healthy = await checkDatabaseHealth();
console.log('Database healthy:', healthy);

// Pool metrics
const metrics = await getPoolMetrics();
console.log('Connection pool:', metrics);
```

### Test Redis Connection
```typescript
import { redis } from '@/packages/database';

// Health check
const healthy = await redis.healthCheck();
console.log('Redis healthy:', healthy);

// Test cache
await redis.cache.set('test', { foo: 'bar' }, { ttl: 60 });
const cached = await redis.cache.get('test');
console.log('Cached value:', cached);
```

### Test Prisma Queries
```typescript
import { prisma } from '@/packages/database';

// Test query
const count = await prisma.user.count();
console.log('Total users:', count);

// Test transaction
await prisma.$transaction([
  prisma.user.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'ACTIVE' }
  })
]);
```

---

## Rollback Plan

If issues occur, you can temporarily use both systems:

```typescript
// Keep old factory for critical operations
import { DatabaseFactory } from './database/factory-backup.js';
const oldDb = new DatabaseFactory();

// Use new system for new features
import { prisma, redis } from '@/packages/database';

// Gradually migrate operations one by one
```

---

## Performance Considerations

### Connection Pooling
- **Old**: Manual connection management
- **New**: Automatic pooling (20 connections default)
- Configure via `DATABASE_URL`: `?connection_limit=20&pool_timeout=10`

### Caching Strategy
```typescript
// Cache frequently accessed data
const CACHE_TTL = {
  USER_PROFILE: 3600,      // 1 hour
  TICKET_DETAILS: 1800,    // 30 minutes
  KB_ARTICLE: 7200,        // 2 hours
  SETTINGS: 86400,         // 24 hours
};

// Cache-aside pattern
async function getTicket(id: string) {
  const cacheKey = `ticket:${id}`;
  
  // Try cache
  let ticket = await redis.cache.get(cacheKey);
  if (ticket) return ticket;
  
  // Cache miss - query DB
  ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { assignee: true, comments: true }
  });
  
  // Store in cache
  if (ticket) {
    await redis.cache.set(cacheKey, ticket, { 
      ttl: CACHE_TTL.TICKET_DETAILS 
    });
  }
  
  return ticket;
}
```

---

## Common Issues

### Issue: Module not found
```bash
# Solution: Regenerate Prisma client
pnpm prisma:generate
```

### Issue: Redis connection timeout
```typescript
// Solution: Graceful degradation is built-in
// Application continues working even if Redis is unavailable
if (!await redis.isAvailable()) {
  console.warn('Redis unavailable - cache disabled');
  // App continues normally
}
```

### Issue: Type errors with Prisma
```typescript
// Solution: Import types from Prisma namespace
import { Prisma } from '@/packages/database';

type UserCreateInput = Prisma.UserCreateInput;
type TicketWhereInput = Prisma.SupportTicketWhereInput;
```

---

## Next Steps

1. ✅ Update environment variables
2. ✅ Install dependencies: `pnpm install`
3. ✅ Generate Prisma client: `pnpm prisma:generate`
4. ✅ Run migrations: `pnpm prisma:migrate:deploy`
5. ✅ Update imports in API code
6. ✅ Remove old factory files
7. ✅ Test database connectivity
8. ✅ Deploy to production

---

## Support

For questions or issues during migration:
- Review Prisma documentation: https://www.prisma.io/docs
- Review Redis (ioredis) documentation: https://github.com/redis/ioredis
- Check implementation examples in `packages/database/src/`

