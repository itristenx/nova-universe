# 🚀 REDIS CACHING IMPLEMENTATION GUIDE

## Overview
This guide documents the Redis caching implementation for Nova Universe API to achieve 10-100x performance improvements on hot paths.

---

## 📊 Caching Strategy

### Cache-Aside Pattern (Lazy Loading)
1. Check cache first
2. If miss, query database
3. Store result in cache with TTL
4. Return result

### Cache Invalidation Strategy
1. **Time-based**: TTL expiration
2. **Event-based**: Invalidate on updates/deletes
3. **Pattern-based**: Clear multiple related keys

---

## 🔥 Hot Paths Identified

### Critical (Cache First)
| Endpoint | Data Type | TTL | Expected Improvement |
|----------|-----------|-----|---------------------|
| `GET /api/users/:id` | User Profile | 1 hour | 50-100x |
| `GET /api/tickets/:id` | Ticket Details | 30 min | 30-50x |
| `GET /api/tickets` | Ticket List | 5 min | 20-40x |
| `GET /api/kb/articles/:id` | KB Article | 2 hours | 100x |
| `GET /api/kb/articles` | KB List | 15 min | 30-50x |
| `GET /api/groups` | Groups List | 30 min | 50x |
| `GET /api/queues` | Queues List | 1 hour | 50x |
| `GET /api/settings` | System Config | 24 hours | 100x |

### High Priority
| Endpoint | Data Type | TTL | Expected Improvement |
|----------|-----------|-----|---------------------|
| `GET /api/assets` | Asset List | 15 min | 20-30x |
| `GET /api/departments` | Departments | 1 hour | 40x |
| `GET /api/sla-definitions` | SLA Configs | 2 hours | 50x |
| `GET /api/workflows` | Workflows | 30 min | 30x |
| `GET /api/dashboards/:id` | Dashboard | 15 min | 40x |

### Medium Priority
| Endpoint | Data Type | TTL | Expected Improvement |
|----------|-----------|-----|---------------------|
| `GET /api/notifications` | Notifications | 2 min | 10-20x |
| `GET /api/leaderboard` | Leaderboard | 10 min | 30x |
| `GET /api/reports/*` | Reports | 1 hour | 50x |

---

## 🎯 Cache Key Naming Convention

### Format
```
{service}:{resource}:{identifier}:{version}
```

### Examples
```javascript
// User cache keys
'nova:user:123e4567-e89b-12d3-a456-426614174000:v1'
'nova:user:profile:email@example.com:v1'
'nova:users:list:page:1:v1'

// Ticket cache keys
'nova:ticket:987fcdeb-51a2-43c7-8765-987654321000:v1'
'nova:tickets:queue:support:page:1:v1'
'nova:tickets:user:123:open:v1'

// KB cache keys
'nova:kb:article:456:v1'
'nova:kb:articles:category:tech:v1'
'nova:kb:search:query:hash:v1'

// Configuration cache keys
'nova:config:email:v1'
'nova:config:sla:v1'
'nova:settings:all:v1'
```

---

## ⏱️ TTL Guidelines

### By Data Type
| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| User Profiles | 1 hour | Changes infrequently |
| Tickets (Open) | 5-30 min | Moderate changes |
| Tickets (Closed) | 2 hours | Rarely changes |
| KB Articles | 2-24 hours | Very stable |
| Settings/Config | 24 hours | Rarely changes |
| Lists (paginated) | 5-15 min | Prevent stale data |
| Search Results | 15 min | Balance freshness/performance |
| Dashboards | 5-15 min | Near real-time acceptable |
| Leaderboard | 10 min | Gamification tolerance |
| Notifications | 1-2 min | Need freshness |

---

## 🔧 Implementation Patterns

### Pattern 1: Simple Cache-Aside
```javascript
import { prisma, getWithCache, invalidateCache } from './db.js';

// GET endpoint with caching
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  const user = await getWithCache(
    `nova:user:${id}:v1`,
    async () => {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          department: true,
          jobTitle: true,
          roles: {
            include: { role: true }
          }
        }
      });
    },
    3600 // 1 hour TTL
  );
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// UPDATE endpoint with cache invalidation
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  const user = await prisma.user.update({
    where: { id },
    data: req.body
  });
  
  // Invalidate user cache
  await invalidateCache(`nova:user:${id}:*`);
  
  res.json(user);
});
```

### Pattern 2: List Caching with Pagination
```javascript
app.get('/api/tickets', async (req, res) => {
  const { page = 1, limit = 20, queue, status } = req.query;
  
  const cacheKey = `nova:tickets:list:page:${page}:queue:${queue || 'all'}:status:${status || 'all'}:v1`;
  
  const result = await getWithCache(
    cacheKey,
    async () => {
      const where = {};
      if (queue) where.queueId = queue;
      if (status) where.status = status;
      
      const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
          where,
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            requester: { select: { id: true, name: true, email: true } },
            queue: { select: { id: true, name: true } }
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.supportTicket.count({ where })
      ]);
      
      return { tickets, total, page, limit };
    },
    300 // 5 minutes TTL
  );
  
  res.json(result);
});
```

### Pattern 3: Related Data Invalidation
```javascript
app.post('/api/tickets', async (req, res) => {
  const ticket = await prisma.supportTicket.create({
    data: req.body
  });
  
  // Invalidate multiple related caches
  await Promise.all([
    invalidateCache(`nova:tickets:list:*`),
    invalidateCache(`nova:tickets:queue:${ticket.queueId}:*`),
    invalidateCache(`nova:tickets:user:${ticket.requesterId}:*`),
    invalidateCache(`nova:dashboards:*`) // Dashboard might show ticket counts
  ]);
  
  res.status(201).json(ticket);
});
```

### Pattern 4: Conditional Caching (Based on User)
```javascript
app.get('/api/tickets/my', async (req, res) => {
  const userId = req.user.id;
  
  // VIP users get shorter cache (more real-time)
  const ttl = req.user.isVip ? 60 : 300; // 1 min vs 5 min
  
  const tickets = await getWithCache(
    `nova:tickets:user:${userId}:my:v1`,
    async () => {
      return await prisma.supportTicket.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { assigneeId: userId }
          ]
        },
        include: {
          queue: true,
          assignee: { select: { id: true, name: true } }
        },
        orderBy: { updatedAt: 'desc' }
      });
    },
    ttl
  );
  
  res.json(tickets);
});
```

### Pattern 5: Cache Warming (Pre-populate)
```javascript
// Warm cache on application startup or scheduled job
async function warmCaches() {
  console.log('Warming caches...');
  
  // Warm most accessed users
  const activeUsers = await prisma.user.findMany({
    where: { disabled: false },
    take: 100,
    orderBy: { lastLogin: 'desc' }
  });
  
  for (const user of activeUsers) {
    await getWithCache(
      `nova:user:${user.id}:v1`,
      () => prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: { include: { role: true } } }
      }),
      3600
    );
  }
  
  // Warm settings
  await getWithCache(
    'nova:settings:all:v1',
    () => prisma.config.findMany(),
    86400 // 24 hours
  );
  
  console.log('Cache warming complete');
}
```

---

## 📈 Cache Metrics & Monitoring

### Key Metrics to Track
```javascript
// Add to health check endpoint
app.get('/api/health', async (req, res) => {
  const health = await healthCheck();
  
  // Add cache metrics
  const cacheMetrics = {
    hitRate: await getCacheHitRate(),
    missRate: await getCacheMissRate(),
    evictionRate: await getCacheEvictionRate(),
    memoryUsage: await getCacheMemoryUsage(),
    keyCount: await getCacheKeyCount()
  };
  
  res.json({
    ...health,
    cache: cacheMetrics
  });
});
```

### Metrics Implementation
```javascript
// In db.js or separate metrics file
let cacheHits = 0;
let cacheMisses = 0;

export async function getWithCacheMetrics(key, fetchFn, ttl) {
  const cached = await redis.cache.get(key);
  
  if (cached) {
    cacheHits++;
    return cached;
  }
  
  cacheMisses++;
  const data = await fetchFn();
  await redis.cache.set(key, data, ttl);
  return data;
}

export function getCacheHitRate() {
  const total = cacheHits + cacheMisses;
  return total > 0 ? (cacheHits / total * 100).toFixed(2) : 0;
}
```

---

## 🔄 Cache Invalidation Patterns

### On Create
```javascript
// Invalidate lists when creating new items
await invalidateCache('nova:tickets:list:*');
await invalidateCache('nova:tickets:queue:*');
```

### On Update
```javascript
// Invalidate specific item and related lists
await invalidateCache(`nova:ticket:${id}:*`);
await invalidateCache('nova:tickets:list:*');
```

### On Delete
```javascript
// Invalidate specific item and all related
await invalidateCache(`nova:user:${id}:*`);
await invalidateCache('nova:users:*');
await invalidateCache('nova:tickets:user:*'); // User's tickets
```

### Bulk Invalidation
```javascript
// After bulk operations
await invalidateCache('nova:tickets:*');
await invalidateCache('nova:dashboards:*');
```

---

## 🚫 What NOT to Cache

❌ **Never cache**:
- Sensitive data (passwords, tokens, secrets)
- Real-time data (live chat, active connections)
- One-time use data (password reset tokens)
- User-specific sensitive info without encryption
- Data that changes more frequently than cache TTL

❌ **Cache with caution**:
- Financial data (use short TTL, strong invalidation)
- Compliance-related data (ensure audit trail)
- Permission checks (risk of stale permissions)

---

## 🎯 Performance Targets

### Expected Improvements
| Metric | Before Caching | After Caching | Improvement |
|--------|----------------|---------------|-------------|
| User Profile Load | 150ms | 2-5ms | 30-75x |
| Ticket List (20 items) | 200ms | 5-10ms | 20-40x |
| KB Article Load | 100ms | 1-2ms | 50-100x |
| Settings Load | 80ms | 1ms | 80x |
| Dashboard Data | 500ms | 10-20ms | 25-50x |

### Monitoring Thresholds
- **Cache Hit Rate**: Target >70% (warn <60%, alert <50%)
- **Cache Miss Rate**: Target <30% (warn >40%, alert >50%)
- **Memory Usage**: Target <80% (warn >80%, alert >90%)
- **Response Time**: Target <50ms for cached (warn >100ms, alert >200ms)

---

## 🔧 Redis Configuration

### Recommended Settings
```env
REDIS_URL=redis://localhost:6379
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000
REDIS_CONNECT_TIMEOUT=5000
REDIS_COMMAND_TIMEOUT=5000

# Memory management
REDIS_MAXMEMORY=2gb
REDIS_MAXMEMORY_POLICY=allkeys-lru

# Persistence (optional)
REDIS_SAVE_ENABLED=false  # For pure cache, no persistence needed
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Redis client with graceful degradation
- [x] Basic cache operations (get/set/delete)
- [x] Cache invalidation helpers
- [x] TTL configuration

### Phase 2: Hot Path Caching (Current)
- [ ] User profile caching
- [ ] Ticket list/detail caching
- [ ] KB article caching
- [ ] Settings/config caching
- [ ] Queue/group caching

### Phase 3: Advanced Features
- [ ] Cache warming on startup
- [ ] Cache metrics collection
- [ ] Cache hit/miss rate monitoring
- [ ] Memory usage alerts
- [ ] Cache health dashboard

### Phase 4: Optimization
- [ ] Cache key versioning
- [ ] Conditional caching by user type
- [ ] Related data invalidation
- [ ] Bulk operations optimization
- [ ] Performance benchmarking

---

## 🎓 Best Practices

### DO:
✅ Use consistent key naming conventions  
✅ Set appropriate TTLs based on data volatility  
✅ Invalidate cache on updates/deletes  
✅ Monitor cache hit rates  
✅ Handle cache failures gracefully  
✅ Version cache keys for schema changes  
✅ Use short TTLs for frequently changing data  
✅ Warm critical caches on startup  

### DON'T:
❌ Cache without TTL (memory leak risk)  
❌ Use very long TTLs for volatile data  
❌ Forget to invalidate on updates  
❌ Cache sensitive data without encryption  
❌ Rely solely on caching for availability  
❌ Over-cache (cache everything blindly)  
❌ Ignore cache metrics  

---

## 📚 Additional Resources

- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/)
- [Cache-Aside Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Last Updated**: January 6, 2025  
**Status**: Implementation In Progress  
**Target Completion**: Phase 2

