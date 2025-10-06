# 🚀 Database Factory Migration - Next Steps

## Current Status

✅ **COMPLETE**: New database factory implementation
- PostgreSQL client via Prisma ORM
- Redis client for caching and sessions
- Industry-standard architecture
- Comprehensive documentation

⏳ **IN PROGRESS**: API code migration
- Need to update all imports
- Need to migrate MongoDB operations
- Need to integrate Redis caching

---

## Phase 1: Update API Database Initialization

### File: `apps/api/db.js`

**Current Code** (OLD):
```javascript
import { DatabaseFactory } from './database/factory.js';

const dbFactory = new DatabaseFactory();
await dbFactory.initialize({
  mongodb: { uri: process.env.MONGODB_URI },
  postgresql: { connectionString: process.env.DATABASE_URL }
});

export default dbFactory;
```

**New Code** (Replace with):
```typescript
import { prisma, redis, checkDatabaseHealth } from '@/packages/database';

// Export database clients
export { prisma, redis };

// Health check endpoint
export async function healthCheck() {
  const dbHealthy = await checkDatabaseHealth();
  const redisHealthy = await redis.healthCheck();
  
  return {
    database: dbHealthy ? 'healthy' : 'unhealthy',
    redis: redisHealthy ? 'healthy' : 'degraded',
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

export default { prisma, redis, healthCheck, connect, disconnect };
```

---

## Phase 2: Find and Replace All Imports

### Search and Replace Patterns

```bash
# Find all old imports
grep -r "DatabaseFactory" apps/api/ --include="*.js" --include="*.ts"
grep -r "from.*database.*factory" apps/api/ --include="*.js" --include="*.ts"

# Pattern 1: DatabaseFactory import
OLD: import { DatabaseFactory } from './database/factory.js';
NEW: import { prisma, redis } from '@/packages/database';

# Pattern 2: require() syntax (if any)
OLD: const { DatabaseFactory } = require('./database/factory.js');
NEW: const { prisma, redis } = require('@/packages/database');
```

### Files to Update (Search results)

Based on previous grep search, update these files:
- `apps/api/db.js`
- `apps/api/database/factory.js` (DELETE - duplicate)
- `apps/api/database/db.js` (DELETE - duplicate)
- Any route handlers that import DatabaseFactory

---

## Phase 3: Migrate MongoDB Operations

### Pattern 1: Store Document → Create Record

```javascript
// OLD (MongoDB)
await dbFactory.storeDocument('support_tickets', {
  _id: 'ticket-123',
  subject: 'Help needed',
  status: 'open',
  priority: 'high'
});

// NEW (Prisma)
await prisma.supportTicket.create({
  data: {
    id: 'ticket-123',
    subject: 'Help needed',
    status: 'OPEN',
    priority: 'HIGH',
    assigneeId: userId // Add required fields
  }
});
```

### Pattern 2: Find Documents → Find Many

```javascript
// OLD (MongoDB)
const tickets = await dbFactory.findDocuments('support_tickets', {
  status: 'open',
  priority: 'high'
});

// NEW (Prisma)
const tickets = await prisma.supportTicket.findMany({
  where: {
    status: 'OPEN',
    priority: 'HIGH'
  },
  include: {
    assignee: true,
    comments: true
  }
});
```

### Pattern 3: Update Documents → Update Many

```javascript
// OLD (MongoDB)
await dbFactory.updateDocuments('support_tickets',
  { status: 'open' },
  { status: 'in_progress' }
);

// NEW (Prisma)
await prisma.supportTicket.updateMany({
  where: { status: 'OPEN' },
  data: { status: 'IN_PROGRESS' }
});
```

### Pattern 4: Delete Documents → Delete Many

```javascript
// OLD (MongoDB)
await dbFactory.deleteDocuments('support_tickets', {
  status: 'closed',
  closedAt: { $lt: thirtyDaysAgo }
});

// NEW (Prisma)
await prisma.supportTicket.deleteMany({
  where: {
    status: 'CLOSED',
    closedAt: { lt: thirtyDaysAgo }
  }
});
```

### Pattern 5: Audit Logs → PostgreSQL Log Table

```javascript
// OLD (MongoDB)
await dbFactory.createAuditLog({
  action: 'user.login',
  userId: '123',
  metadata: { ip: '192.168.1.1' }
});

// NEW (Prisma - use Log model)
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

---

## Phase 4: Add Redis Caching

### Pattern: Cache-Aside (Recommended)

```typescript
// Get with cache
async function getTicket(id: string) {
  // Try cache first
  const cacheKey = `ticket:${id}`;
  const cached = await redis.cache.get(cacheKey);
  if (cached) return cached;

  // Cache miss - query database
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { assignee: true, comments: true }
  });

  // Store in cache (30 minutes)
  if (ticket) {
    await redis.cache.set(cacheKey, ticket, { ttl: 1800 });
  }

  return ticket;
}

// Update with cache invalidation
async function updateTicket(id: string, data: any) {
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data
  });

  // Invalidate cache
  await redis.cache.delete(`ticket:${id}`);

  return ticket;
}
```

### Caching Candidates (High Priority)

1. **User Profiles** - Cache for 1 hour
2. **Settings** - Cache for 24 hours
3. **KB Articles** - Cache for 2 hours
4. **Ticket Details** - Cache for 30 minutes
5. **Categories/Tags** - Cache for 4 hours

---

## Phase 5: Add Rate Limiting

### Pattern: Middleware for API Routes

```typescript
import { redis } from '@/packages/database';

export async function rateLimitMiddleware(req, res, next) {
  const identifier = req.ip || req.user?.id || 'anonymous';

  const result = await redis.rateLimit.check({
    identifier,
    max: 100,        // 100 requests
    window: 60       // per 60 seconds
  });

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', 100);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetAt: new Date(result.resetAt).toISOString()
    });
  }

  next();
}

// Apply to routes
app.use('/api/', rateLimitMiddleware);
```

---

## Phase 6: Add Session Management

### Pattern: Redis Sessions

```typescript
import { redis } from '@/packages/database';

// Create session on login
export async function createSession(userId: string) {
  const sessionId = generateSessionId();
  
  await redis.session.set(sessionId, {
    userId,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    permissions: await getUserPermissions(userId)
  }, 86400); // 24 hours

  return sessionId;
}

// Get session
export async function getSession(sessionId: string) {
  const session = await redis.session.get(sessionId);
  
  if (session) {
    // Update last activity
    await redis.session.touch(sessionId);
  }
  
  return session;
}

// Destroy session on logout
export async function destroySession(sessionId: string) {
  await redis.session.delete(sessionId);
}
```

---

## Phase 7: Remove Old Files

### Files to Delete

```bash
# Old database factory files
rm packages/database/database/factory.js
rm packages/database/database/mongodb.js
rm packages/database/database/postgresql.js
rm packages/database/database/sqlite.js

# Old API database files
rm apps/api/database/factory.js
rm apps/api/database/db.js
```

### Remove MongoDB from Docker Compose

Edit `docker-compose.yml`:
```yaml
# DELETE this entire service block
  mongo:
    image: mongo:latest
    container_name: nova_mongo
    # ... rest of config

  mongo-express:
    image: mongo-express
    # ... rest of config
```

### Remove MongoDB Dependencies

Edit `package.json`:
```json
// REMOVE these dependencies
{
  "mongoose": "^8.16.4"  // DELETE
}
```

---

## Phase 8: Update Environment Variables

### Production Environment

Create `.env.production`:
```bash
# PostgreSQL (Primary Database)
DATABASE_URL="postgresql://user:password@host:5432/nova?schema=public&connection_limit=20&pool_timeout=10"
DATABASE_URL_READ_REPLICA="postgresql://user:password@replica:5432/nova?schema=public"
DATABASE_POOL_SIZE=20

# Redis (Caching & Sessions)
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>
REDIS_DB=0
REDIS_ENABLED=true
REDIS_TLS_ENABLED=true
REDIS_TLS_REJECT_UNAUTHORIZED=true

# For Redis Cluster (optional)
# REDIS_CLUSTER_NODES=redis1:6379,redis2:6379,redis3:6379
```

### Development Environment

Update `.env`:
```bash
# PostgreSQL
DATABASE_URL="postgresql://nova_admin:nova_password@localhost:5432/nova_universe?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_secure_pass_2024
REDIS_DB=0
REDIS_ENABLED=true
REDIS_TLS_ENABLED=false
```

---

## Phase 9: Testing

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
await redis.cache.delete('test');
```

### Run Existing Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:integration
pnpm test:uat
```

---

## Phase 10: Deployment

### Pre-Deployment Checklist

- [ ] All imports updated to use new factory
- [ ] All MongoDB operations migrated to Prisma
- [ ] Redis caching implemented for hot paths
- [ ] Rate limiting added to API endpoints
- [ ] Session management implemented
- [ ] Old files removed
- [ ] Environment variables updated
- [ ] Tests passing
- [ ] Documentation updated

### Deployment Steps

1. **Backup Current Database**
   ```bash
   pg_dump -h localhost -U postgres nova_universe > backup-$(date +%Y%m%d).sql
   ```

2. **Deploy PostgreSQL Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Run Prisma Migrations**
   ```bash
   pnpm prisma:migrate:deploy
   ```

4. **Deploy Redis Instance**
   ```bash
   # For Docker
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   
   # For production, use managed service (AWS ElastiCache, Redis Cloud, etc.)
   ```

5. **Deploy Application**
   ```bash
   pnpm build
   pnpm start
   ```

6. **Monitor Metrics**
   - Connection pool usage
   - Cache hit rates
   - Query performance
   - Error rates

---

## Rollback Plan

If issues occur during migration:

1. **Keep old factory as backup**
   ```bash
   # Rename instead of delete
   mv packages/database/database/factory.js packages/database/database/factory.backup.js
   ```

2. **Create compatibility layer**
   ```typescript
   // Temporary wrapper to use both systems
   import { DatabaseFactory } from './database/factory.backup.js';
   import { prisma, redis } from '@/packages/database';
   
   export async function migrateGradually() {
     // Use old factory for critical operations
     // Use new system for new features
   }
   ```

3. **Monitor and migrate incrementally**
   - Migrate one module at a time
   - Test thoroughly before next module
   - Keep both systems running during transition

---

## Success Metrics

### Performance
- ✅ Average query time < 100ms
- ✅ Cache hit rate > 70%
- ✅ Connection pool utilization < 80%
- ✅ Zero connection pool exhaustion errors

### Reliability
- ✅ Database uptime > 99.9%
- ✅ Redis uptime > 99% (with graceful degradation)
- ✅ Zero data loss
- ✅ Zero connection leak errors

### Developer Experience
- ✅ Type-safe database queries
- ✅ Auto-complete in IDE
- ✅ Clear error messages
- ✅ Comprehensive documentation

---

## Support

### Documentation
- Migration Guide: `docs/DATABASE-MIGRATION-GUIDE.md`
- Completion Summary: `docs/DATABASE-MODERNIZATION-COMPLETE.md`
- Package README: `packages/database/README.md`

### External Resources
- Prisma Docs: https://www.prisma.io/docs
- Redis Docs: https://redis.io/docs
- ioredis: https://github.com/redis/ioredis
- pgvector: https://github.com/pgvector/pgvector

---

## Timeline Estimate

| Phase | Effort | Duration |
|-------|--------|----------|
| Update API initialization | Small | 1 hour |
| Find and replace imports | Small | 2 hours |
| Migrate MongoDB operations | Medium | 4-8 hours |
| Add Redis caching | Medium | 4-6 hours |
| Add rate limiting | Small | 2 hours |
| Add session management | Small | 2 hours |
| Remove old files | Small | 1 hour |
| Testing | Medium | 4-6 hours |
| Deployment | Small | 2-4 hours |
| **Total** | **Medium** | **1-2 days** |

---

**Ready to proceed?** Start with Phase 1 (Update API Database Initialization) and work through each phase systematically. Test thoroughly at each step before moving to the next phase.

