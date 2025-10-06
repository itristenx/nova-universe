# 🚀 REDIS CACHING QUICK REFERENCE

> **Quick guide for developers working with Redis caching in Nova Universe API**

---

## 📖 Basic Usage

### Import Caching Functions
```javascript
import { prisma, getWithCache, invalidateCache } from '../db.js';
```

---

## 🎯 Common Patterns

### Pattern 1: Cache a GET Endpoint
```javascript
router.get('/api/resource/:id', async (req, res) => {
  const cacheKey = `nova:resource:${req.params.id}:v1`;
  
  const data = await getWithCache(
    cacheKey,
    async () => {
      // Your database query
      return await prisma.resource.findUnique({
        where: { id: req.params.id }
      });
    },
    3600 // TTL in seconds (1 hour)
  );
  
  res.json(data);
});
```

---

### Pattern 2: Cache a List with Filters
```javascript
router.get('/api/resources', async (req, res) => {
  const { page = 1, status, category } = req.query;
  
  const cacheKey = `nova:resources:list:page:${page}:status:${status || 'all'}:category:${category || 'all'}:v1`;
  
  const result = await getWithCache(
    cacheKey,
    async () => {
      const where = {};
      if (status) where.status = status;
      if (category) where.category = category;
      
      const [items, total] = await Promise.all([
        prisma.resource.findMany({ where, skip: (page-1)*20, take: 20 }),
        prisma.resource.count({ where })
      ]);
      
      return { items, total };
    },
    300 // 5 minutes
  );
  
  res.json(result);
});
```

---

### Pattern 3: Invalidate Cache on Update
```javascript
router.put('/api/resource/:id', async (req, res) => {
  const updated = await prisma.resource.update({
    where: { id: req.params.id },
    data: req.body
  });
  
  // Invalidate caches
  await Promise.all([
    invalidateCache(`nova:resource:${req.params.id}:*`), // This specific item
    invalidateCache('nova:resources:list:*'), // All lists
  ]);
  
  res.json(updated);
});
```

---

### Pattern 4: Invalidate Cache on Create
```javascript
router.post('/api/resources', async (req, res) => {
  const created = await prisma.resource.create({
    data: req.body
  });
  
  // Invalidate list caches
  await invalidateCache('nova:resources:list:*');
  
  res.status(201).json(created);
});
```

---

### Pattern 5: Invalidate Cache on Delete
```javascript
router.delete('/api/resource/:id', async (req, res) => {
  await prisma.resource.delete({
    where: { id: req.params.id }
  });
  
  // Invalidate caches
  await Promise.all([
    invalidateCache(`nova:resource:${req.params.id}:*`),
    invalidateCache('nova:resources:list:*'),
  ]);
  
  res.status(204).send();
});
```

---

## 🔑 Cache Key Convention

### Format
```
{service}:{resource}:{identifier}:{version}
```

### Examples
```javascript
// Single item
'nova:user:123:v1'
'nova:ticket:abc-def-456:v1'

// List with filters
'nova:tickets:list:page:1:status:open:priority:high:v1'

// Configuration
'nova:config:organization:v1'
'nova:settings:email:v1'
```

### Rules
- Use `:` as separator
- Include filters in key
- Always end with version (`:v1`)
- Use wildcards for invalidation (`*`)

---

## ⏱️ TTL Guidelines

| Data Type | TTL | Example |
|-----------|-----|---------|
| **Real-time** | 1-2 min | Notifications, live chat |
| **Volatile** | 5-10 min | Ticket lists, dashboards |
| **Moderate** | 30-60 min | Ticket details, user profiles |
| **Stable** | 1-2 hours | KB articles, reports |
| **Very Stable** | 24 hours | Settings, config |

### TTL in Seconds
```javascript
const TTL = {
  MINUTE: 60,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  THIRTY_MINUTES: 1800,
  HOUR: 3600,
  TWO_HOURS: 7200,
  DAY: 86400
};
```

---

## 🔄 Invalidation Patterns

### Invalidate Specific Item
```javascript
await invalidateCache(`nova:resource:${id}:*`);
```

### Invalidate All Lists
```javascript
await invalidateCache('nova:resources:list:*');
```

### Invalidate Multiple Related Caches
```javascript
await Promise.all([
  invalidateCache(`nova:resource:${id}:*`),
  invalidateCache('nova:resources:list:*'),
  invalidateCache('nova:dashboards:*'), // Related data
]);
```

### Invalidate by Pattern
```javascript
// All caches for a user
await invalidateCache(`nova:*:user:${userId}:*`);

// All configuration caches
await invalidateCache('nova:config:*');

// All caches (use with caution!)
await invalidateCache('nova:*');
```

---

## 🚫 What NOT to Cache

❌ **Never cache**:
- Passwords, tokens, secrets
- Real-time data (live updates)
- One-time tokens (password reset)
- User-specific sensitive data (without encryption)

❌ **Cache with caution**:
- Financial data (use very short TTL)
- Compliance data (ensure audit trail)
- Permission checks (risk of stale permissions - use 1-5 min TTL)

---

## 🐛 Common Mistakes

### Mistake 1: Forgetting to Invalidate
```javascript
// ❌ BAD - Cache never invalidated
router.put('/api/resource/:id', async (req, res) => {
  const updated = await prisma.resource.update({...});
  res.json(updated); // Cache now stale!
});

// ✅ GOOD - Cache invalidated
router.put('/api/resource/:id', async (req, res) => {
  const updated = await prisma.resource.update({...});
  await invalidateCache(`nova:resource:${req.params.id}:*`);
  res.json(updated);
});
```

---

### Mistake 2: Cache Key Missing Filter
```javascript
// ❌ BAD - Different filters share same cache
const cacheKey = 'nova:tickets:list:v1'; // Always same key!

// ✅ GOOD - Each filter combination has unique key
const cacheKey = `nova:tickets:list:status:${status}:priority:${priority}:v1`;
```

---

### Mistake 3: TTL Too Long for Volatile Data
```javascript
// ❌ BAD - Ticket status changes frequently
const ticket = await getWithCache(key, fetchFn, 86400); // 24 hours!

// ✅ GOOD - Short TTL for volatile data
const ticket = await getWithCache(key, fetchFn, 300); // 5 minutes
```

---

### Mistake 4: Not Handling Cache Failure
```javascript
// ❌ BAD - Will throw if Redis down
const data = await redis.get(key);

// ✅ GOOD - Graceful degradation built-in
const data = await getWithCache(key, fetchFn, ttl);
// If Redis down, just runs fetchFn and returns data
```

---

## 📊 Performance Expectations

### Before Caching
```
User profile: 150ms
Ticket list: 200ms
KB article: 100ms
```

### After Caching (Cache Hit)
```
User profile: 2-5ms    (30-75x faster) ✅
Ticket list: 5-10ms   (20-40x faster) ✅
KB article: 1-2ms     (50-100x faster) ✅
```

### Cache Miss
- Same as before caching + small overhead (~5-10ms)
- Subsequent requests will be cache hits

---

## 🔍 Debugging

### Check if Cache Working
```javascript
// Add temporary logging
const data = await getWithCache(cacheKey, async () => {
  console.log('🔍 CACHE MISS - Fetching from database');
  return await fetchFn();
}, ttl);
console.log('✅ Returned data (cached or fresh)');
```

### Check Cache Keys in Redis
```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS nova:*

# Get specific key
GET nova:user:123:v1

# Check TTL
TTL nova:user:123:v1

# Delete key
DEL nova:user:123:v1
```

---

## ✅ Checklist for New Cached Endpoint

When adding caching to an endpoint:

- [ ] Import `getWithCache` and `invalidateCache` from `../db.js`
- [ ] Create unique cache key with format `nova:resource:identifier:v1`
- [ ] Include all filters in cache key
- [ ] Choose appropriate TTL based on data volatility
- [ ] Wrap database query in `getWithCache()`
- [ ] Add cache invalidation to UPDATE endpoint
- [ ] Add cache invalidation to DELETE endpoint
- [ ] Add cache invalidation to CREATE endpoint (for lists)
- [ ] Test cache hit (request twice, second should be faster)
- [ ] Test cache invalidation (update, verify cache cleared)
- [ ] Document the caching strategy (in code comments)

---

## 📚 Further Reading

- **Full Guide**: `docs/REDIS-CACHING-IMPLEMENTATION.md`
- **Status**: `docs/REDIS-CACHING-COMPLETE.md`
- **Migration**: `docs/DEPRECATED-METHOD-MIGRATION-CHECKLIST.md`
- **Database Module**: `apps/api/db.js`

---

## 🆘 Getting Help

### Issues?
1. Check if Redis is running: `redis-cli ping` (should return PONG)
2. Check environment variables: `REDIS_URL` set correctly
3. Check logs for Redis connection errors
4. Verify graceful degradation working (app continues without Redis)

### Questions?
- Review full documentation in `docs/REDIS-CACHING-IMPLEMENTATION.md`
- Check existing implementations in:
  - `apps/api/routes/tickets.js`
  - `apps/api/routes/knowledge-articles.js`
  - `apps/api/routes/config.js`

---

**Last Updated**: January 6, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

