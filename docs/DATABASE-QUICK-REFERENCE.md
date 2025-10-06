# 🚀 NOVA UNIVERSE DATABASE - QUICK REFERENCE

**Status**: ✅ Production Ready | **Date**: January 6, 2025

---

## Import Statements

```javascript
// Modern approach (recommended)
import { prisma, redis, Prisma, getWithCache, invalidateCache } from './db.js';

// Legacy approach (still works, but deprecated)
import db from './db.js';
```

---

## Common Operations

### 1. Basic CRUD Operations

```javascript
// CREATE
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: await bcrypt.hash(password, 10)
  }
});

// READ (single)
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { roles: true, tickets: true }
});

// READ (multiple)
const tickets = await prisma.supportTicket.findMany({
  where: {
    status: 'OPEN',
    queueId: queueId
  },
  include: { assignee: true, comments: true },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// UPDATE
const updatedTicket = await prisma.supportTicket.update({
  where: { id: ticketId },
  data: {
    status: 'IN_PROGRESS',
    assigneeId: userId
  }
});

// DELETE (soft delete - recommended)
const deleted = await prisma.supportTicket.update({
  where: { id: ticketId },
  data: { deletedAt: new Date() }
});

// DELETE (hard delete)
const deleted = await prisma.supportTicket.delete({
  where: { id: ticketId }
});
```

### 2. Caching (10-100x Faster Reads)

```javascript
// Cache-aside pattern
const cachedUser = await getWithCache(
  `user:${userId}`,                        // Cache key
  () => prisma.user.findUnique({          // Fetch function
    where: { id: userId },
    include: { roles: true }
  }),
  3600                                     // TTL in seconds (1 hour)
);

// Invalidate cache after update
await prisma.user.update({ where: { id: userId }, data: { ... } });
await invalidateCache(`user:${userId}`);

// Invalidate pattern (e.g., all user caches)
await invalidateCache('user:*');

// Common TTL values
const TTL = {
  USER_PROFILE: 3600,        // 1 hour
  TICKET: 1800,              // 30 minutes
  KB_ARTICLE: 7200,          // 2 hours
  SETTINGS: 86400,           // 24 hours
  SESSION: 1800              // 30 minutes
};
```

### 3. Transactions

```javascript
// Simple transaction
const result = await prisma.$transaction([
  prisma.user.create({ data: { ... } }),
  prisma.log.create({ data: { ... } })
]);

// Interactive transaction with retry
const result = await prisma.$transaction(async (tx) => {
  // Create ticket
  const ticket = await tx.supportTicket.create({
    data: { subject: 'Issue', description: '...' }
  });
  
  // Log action
  await tx.log.create({
    data: {
      level: 'INFO',
      message: `Ticket ${ticket.id} created`,
      userId
    }
  });
  
  return ticket;
}, {
  maxWait: 5000,      // Max wait to start transaction (ms)
  timeout: 10000,     // Max transaction time (ms)
  isolationLevel: 'ReadCommitted'
});
```

### 4. Raw SQL (When Needed)

```javascript
// Raw query (read-only)
const result = await prisma.$queryRaw`
  SELECT u.*, COUNT(t.id) as ticket_count
  FROM "User" u
  LEFT JOIN "SupportTicket" t ON t."assigneeId" = u.id
  WHERE u."deletedAt" IS NULL
  GROUP BY u.id
`;

// Raw execute (write)
await prisma.$executeRaw`
  UPDATE "SupportTicket"
  SET status = 'CLOSED'
  WHERE "createdAt" < NOW() - INTERVAL '30 days'
    AND status = 'RESOLVED'
`;
```

### 5. Audit Logging

```javascript
// Modern approach
await prisma.log.create({
  data: {
    level: 'INFO',
    message: 'User logged in',
    metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
    userId: user.id
  }
});

// Legacy approach (still works, deprecated)
await db.createAuditLog('user.login', userId, {
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

### 6. Full-Text Search

```javascript
// PostgreSQL full-text search
const articles = await prisma.$queryRaw`
  SELECT id, title, content,
    ts_rank(search_vector, to_tsquery('english', ${query})) as rank
  FROM "KbArticle"
  WHERE search_vector @@ to_tsquery('english', ${query})
  ORDER BY rank DESC
  LIMIT 10
`;
```

### 7. Vector Search (AI Embeddings)

```javascript
// Semantic similarity search
const similar = await prisma.$queryRaw`
  SELECT id, title, content,
    embedding <=> ${embedding}::vector AS distance
  FROM "KbArticle"
  WHERE embedding IS NOT NULL
  ORDER BY distance
  LIMIT 10
`;
```

---

## Health Check

```javascript
import { healthCheck } from './db.js';

// Check database and Redis health
const health = await healthCheck();

// Returns:
// {
//   database: { status: 'healthy', version: 'PostgreSQL 15.3' },
//   redis: { status: 'healthy' | 'degraded' },
//   timestamp: '2025-01-06T02:09:17.817Z'
// }
```

---

## Connection Management

```javascript
import { initializeDatabase, disconnectDatabase } from './db.js';

// Initialize (called automatically on first use)
await initializeDatabase();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
```

---

## Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/nova_universe?schema=public&connection_limit=20&pool_timeout=10"

# Optional (Redis for caching)
REDIS_URL="redis://localhost:6379"

# PostgreSQL (for DATABASE_URL template expansion)
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_admin
POSTGRES_PASSWORD=nova_password
POSTGRES_PORT=5432
```

---

## Type Safety

```typescript
import { Prisma } from './db.js';

// Use generated types
type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: true }
}>;

// Type-safe where clauses
const where: Prisma.SupportTicketWhereInput = {
  status: 'OPEN',
  assigneeId: userId,
  deletedAt: null
};

// Type-safe select
const select: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  roles: { include: { role: true } }
};
```

---

## Common Patterns

### Pattern 1: Find or Create

```javascript
const user = await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: { lastLoginAt: new Date() },
  create: {
    email: 'user@example.com',
    name: 'New User',
    passwordHash: '...'
  }
});
```

### Pattern 2: Pagination

```javascript
const page = 1;
const pageSize = 20;

const [tickets, total] = await Promise.all([
  prisma.supportTicket.findMany({
    where: { status: 'OPEN' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.supportTicket.count({
    where: { status: 'OPEN' }
  })
]);

const totalPages = Math.ceil(total / pageSize);
```

### Pattern 3: Batch Operations

```javascript
// Batch create
const users = await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
    { email: 'user3@example.com', name: 'User 3' }
  ],
  skipDuplicates: true
});

// Batch update
const updated = await prisma.supportTicket.updateMany({
  where: {
    status: 'PENDING',
    createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  },
  data: { status: 'EXPIRED' }
});
```

### Pattern 4: Nested Writes

```javascript
// Create ticket with comments
const ticket = await prisma.supportTicket.create({
  data: {
    subject: 'Issue',
    description: 'Description',
    assigneeId: userId,
    queueId: queueId,
    comments: {
      create: [
        { body: 'Initial comment', authorId: userId }
      ]
    }
  },
  include: { comments: true }
});
```

### Pattern 5: Filters with Relations

```javascript
// Find users with open tickets
const users = await prisma.user.findMany({
  where: {
    tickets: {
      some: {
        status: 'OPEN',
        deletedAt: null
      }
    }
  },
  include: {
    tickets: {
      where: { status: 'OPEN' }
    }
  }
});
```

---

## Redis Operations

```javascript
// Check if Redis is available
const isAvailable = await redis.isAvailable();

// Cache operations
await redis.cache.set('key', { data: 'value' }, 3600);  // 3600s TTL
const value = await redis.cache.get('key');
await redis.cache.delete('key');
await redis.cache.clear('pattern:*');
```

---

## Troubleshooting

### Issue: Prisma Client Not Generated
```bash
# Solution: Generate Prisma client
pnpm prisma:generate
```

### Issue: Database Connection Failed
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Verify PostgreSQL is running
psql -U nova_admin -d nova_universe -c "SELECT version();"

# Check health
node -e "import('./apps/api/db.js').then(m => m.healthCheck()).then(console.log)"
```

### Issue: Redis Connection Failed
```bash
# Redis is optional - app will continue with graceful degradation
# Check Redis is running (optional)
redis-cli ping

# Verify graceful degradation works
node verify-database-factory.js
```

---

## Verification

```bash
# Run comprehensive verification
node verify-database-factory.js

# Expected output:
# ✅ Database module loads correctly
# ✅ Prisma client initialized
# ✅ Redis client initialized (with graceful degradation)
# ✅ Backward compatibility layer present
# ✅ Health check function available
```

---

## Documentation

| Document | Description |
|----------|-------------|
| `packages/database/README.md` | Complete API reference (500+ lines) |
| `docs/DATABASE-MIGRATION-GUIDE.md` | Migration instructions (600+ lines) |
| `docs/DATABASE-MIGRATION-STATUS.md` | Current status and verification |
| `docs/DATABASE-MIGRATION-CHECKLIST.md` | Detailed checklist |
| `docs/DATABASE-QUICK-REFERENCE.md` | This document |

---

## Quick Commands

```bash
# Generate Prisma client
pnpm prisma:generate

# Create migration
pnpm prisma:migrate:dev --name "migration_name"

# Apply migrations (production)
pnpm prisma:migrate:deploy

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Reset database (development only!)
pnpm prisma:migrate:reset

# Verify database factory
node verify-database-factory.js
```

---

## Performance Tips

1. **Use caching for frequently accessed data** (10-100x faster)
2. **Use `include` instead of separate queries** (fewer round trips)
3. **Use `select` to fetch only needed fields** (less data transfer)
4. **Use indexes** for commonly filtered/sorted fields
5. **Use connection pooling** (already configured - 20 connections)
6. **Use transactions** for related operations
7. **Use batch operations** for bulk inserts/updates
8. **Monitor query performance** with Prisma query logging

---

**Last Updated**: January 6, 2025  
**Status**: ✅ Production Ready  
**Architecture**: Prisma ORM + Redis + PostgreSQL

