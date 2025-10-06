# 📋 DEPRECATED METHOD MIGRATION CHECKLIST

## Overview
This checklist tracks the migration of all deprecated MongoDB-style method calls (`db.query()`, `db.findDocuments()`, `db.storeDocument()`, `db.createAuditLog()`) to direct Prisma usage.

**Date**: January 6, 2025  
**Status**: Not Started  
**Total Deprecated Calls**: 56+  
**Target Completion**: End of week

---

## 🎯 Migration Strategy

### Replace Patterns

#### Pattern 1: `db.query()` → `prisma.$queryRaw` or Prisma model
```javascript
// BEFORE (Deprecated)
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
const users = result.rows;

// AFTER (Prisma - Preferred)
const users = await prisma.user.findMany({
  where: { id: userId }
});

// AFTER (Raw SQL if needed)
const users = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
```

#### Pattern 2: `db.findDocuments()` → `prisma.model.findMany()`
```javascript
// BEFORE (Deprecated)
const tickets = await db.findDocuments('tickets', { status: 'OPEN' });

// AFTER (Prisma)
const tickets = await prisma.supportTicket.findMany({
  where: { status: 'OPEN' }
});
```

#### Pattern 3: `db.storeDocument()` → `prisma.model.create()`
```javascript
// BEFORE (Deprecated)
const doc = await db.storeDocument('logs', { message: 'test', level: 'info' });

// AFTER (Prisma)
const log = await prisma.log.create({
  data: { message: 'test', level: 'info' }
});
```

#### Pattern 4: `db.createAuditLog()` → `prisma.auditTrail.create()`
```javascript
// BEFORE (Deprecated)
await db.createAuditLog('user_update', userId, { field: 'email', old: 'a@b.com', new: 'x@y.com' });

// AFTER (Prisma)
await prisma.auditTrail.create({
  data: {
    action: 'user_update',
    userId: userId,
    details: { field: 'email', old: 'a@b.com', new: 'x@y.com' },
    timestamp: new Date()
  }
});
```

---

## 📁 Files to Migrate

### HIGH PRIORITY (Heavy Usage)

#### 1. apps/api/routes/rbac.js
**Deprecated Calls**: 19  
**Status**: ❌ Not Started  
**Complexity**: Medium  
**Estimated Time**: 2-3 hours

**Calls to Replace**:
- [ ] Line 14: `db.query()` - Get all roles
- [ ] Line 37: `db.query()` - Get role by ID
- [ ] Line 75: `db.query()` - Create role
- [ ] Line 96: `db.query()` - Update role
- [ ] Line 121: `db.query()` - Delete role
- [ ] Line 147: `db.query()` - Get all permissions
- [ ] Line 163: `db.query()` - Assign permission to role
- [ ] Line 184: `db.query()` - Remove permission from role
- [ ] Line 209: `db.query()` - Get user roles
- [ ] Line 247: `db.query()` - Assign role to user
- [ ] Line 268: `db.query()` - Remove role from user
- [ ] Line 301: `db.query()` - Check permission
- [ ] Line 327: `db.query()` - Get role permissions
- [ ] Line 357: `db.query()` - Bulk assign permissions
- [ ] Line 383: `db.query()` - Get user permissions
- [ ] Line 412: `db.query()` - Custom RBAC query

**Migration Notes**:
- Most queries can use Prisma models: `Role`, `Permission`, `RolePermission`, `UserRole`
- Add caching after migration (RBAC lookups are hot path)
- Cache TTL: 1 hour (permissions change rarely)

---

#### 2. apps/api/routes/unified-monitoring.js
**Deprecated Calls**: 18  
**Status**: ❌ Not Started  
**Complexity**: Medium-High  
**Estimated Time**: 3-4 hours

**Calls to Replace**:
- [ ] Line 30: `db.query()` - Monitor stats (COUNT aggregation)
- [ ] Line 31: `db.query()` - Alert stats (COUNT aggregation)
- [ ] Line 32: `db.query()` - Service stats (COUNT aggregation)
- [ ] Line 84: `db.query()` - Get all monitors
- [ ] Line 118: `db.query()` - Create monitor
- [ ] Line 142: `db.query()` - Update monitor
- [ ] Line 184: `db.query()` - Delete monitor
- [ ] Line 218: `db.query()` - Get alerts
- [ ] Line 252: `db.query()` - Create alert
- [ ] Line 288: `db.query()` - Update alert
- [ ] Line 322: `db.query()` - Acknowledge alert
- [ ] Line 357: `db.query()` - Get services
- [ ] Line 381: `db.query()` - Get escalation policies
- [ ] Line 400: `db.query()` - Get schedule overrides
- [ ] Line 429: `db.query()` - Create escalation policy
- [ ] Line 459: `db.query()` - Update escalation policy
- [ ] Line 498: `db.query()` - Delete escalation policy

**Migration Notes**:
- Check if monitoring models exist in Prisma schema
- May need to create monitoring-specific models if missing
- Add caching after migration (monitoring dashboards are hot path)
- Cache TTL: 5-15 minutes (near real-time acceptable)

---

#### 3. apps/api/routes/featureFlags.js
**Deprecated Calls**: 13  
**Status**: ❌ Not Started  
**Complexity**: Low-Medium  
**Estimated Time**: 1-2 hours

**Calls to Replace**:
- [ ] Line 44: `db.query()` - Get all feature flags
- [ ] Line 56: `db.query()` - Get feature flag by key
- [ ] Line 106: `db.query()` - Create feature flag
- [ ] Line 153: `db.query()` - Update feature flag
- [ ] Line 196: `db.query()` - Delete feature flag
- [ ] Line 222: `db.query()` - Get flag by environment
- [ ] Line 247: `db.query()` - Toggle flag
- [ ] Line 274: `db.query()` - Get user-specific flags
- [ ] Line 309: `db.query()` - Bulk update flags
- [ ] Line 318: `db.query()` - Get flag history
- [ ] Line 329: `db.query()` - Get flag analytics
- [ ] Line 342: `db.query()` - Clone flag

**Migration Notes**:
- Use Prisma model: `FeatureFlag` (already exists in enterprise schema)
- Add caching after migration (feature flags are VERY hot path)
- Cache TTL: 1-2 hours (flags rarely change)
- Expected performance: 50-100x with caching

---

### MEDIUM PRIORITY (Moderate Usage)

#### 4. apps/api/routes/reports.js
**Deprecated Calls**: 2  
**Status**: ❌ Not Started  
**Complexity**: Medium  
**Estimated Time**: 30-60 minutes

**Calls to Replace**:
- [ ] Line 15: `db.query()` - Ticket trends aggregation
- [ ] Line 45: `db.query()` - Average resolution time calculation

**Migration Notes**:
- Use Prisma aggregation methods: `groupBy()`, `aggregate()`
- Add caching after migration (reports are frequently viewed)
- Cache TTL: 1 hour (reports data acceptable to be slightly stale)

---

### LOW PRIORITY (Low Usage)

#### 5. apps/api/routes/logs.js
**Deprecated Calls**: 1  
**Status**: ❌ Not Started  
**Complexity**: Low  
**Estimated Time**: 15 minutes

**Calls to Replace**:
- [ ] Line 24: `db.query()` - Get logs with filters

**Migration Notes**:
- Use Prisma model: `Log` or `AuditTrail`
- Simple find query, straightforward migration

---

#### 6. apps/api/routes/setup.js
**Deprecated Calls**: 2  
**Status**: ❌ Not Started  
**Complexity**: Low  
**Estimated Time**: 15 minutes

**Calls to Replace**:
- [ ] Line 536: `db.query('SELECT 1')` - Database health check
- [ ] Line 544: `db.query('SELECT NOW()')` - Get database time

**Migration Notes**:
- Use `prisma.$queryRaw` for health checks
- Already have health check in db.js, may consolidate

---

#### 7. apps/api/routes/organizations.js
**Deprecated Calls**: 1  
**Status**: ❌ Not Started  
**Complexity**: Low  
**Estimated Time**: 10 minutes

**Calls to Replace**:
- [ ] Line 33: `db.query('SELECT key, value FROM config')` - Get all config

**Migration Notes**:
- Use `prisma.config.findMany()`
- Simple migration

---

## 📊 Progress Tracker

### Summary
- **Total Files**: 7
- **Total Deprecated Calls**: 56+
- **Completed**: 0 (0%)
- **In Progress**: 0
- **Not Started**: 7 (100%)

### By Priority
- **High Priority**: 3 files, 50 calls (89% of total)
- **Medium Priority**: 1 file, 2 calls (4% of total)
- **Low Priority**: 3 files, 4 calls (7% of total)

### By Complexity
- **High**: 1 file, 18 calls (unified-monitoring.js)
- **Medium**: 3 files, 23 calls (rbac.js, featureFlags.js, reports.js)
- **Low**: 3 files, 4 calls (logs.js, setup.js, organizations.js)

---

## 🎯 Migration Phases

### Phase 1: Quick Wins (Low Priority, Low Complexity)
**Target**: Day 1 (2-3 hours)
1. [ ] Migrate `organizations.js` (1 call, 10 min)
2. [ ] Migrate `setup.js` (2 calls, 15 min)
3. [ ] Migrate `logs.js` (1 call, 15 min)
4. [ ] Test and verify all changes

**Deliverables**: 4 calls migrated, 3 files cleaned up

---

### Phase 2: Medium Wins (Medium Priority)
**Target**: Day 2 (1-2 hours)
1. [ ] Migrate `reports.js` (2 calls, 30-60 min)
2. [ ] Add caching to reports (15 min)
3. [ ] Test aggregation queries
4. [ ] Verify performance improvements

**Deliverables**: 2 calls migrated, caching added

---

### Phase 3: High Value (High Priority, Low-Medium Complexity)
**Target**: Day 3-4 (3-5 hours)
1. [ ] Migrate `featureFlags.js` (13 calls, 1-2 hours)
2. [ ] Add caching to feature flags (30 min)
3. [ ] Test flag toggles and user-specific flags
4. [ ] Performance testing with caching

**Deliverables**: 13 calls migrated, significant caching gains

---

### Phase 4: Complex Migrations (High Priority, High Complexity)
**Target**: Day 5-7 (5-7 hours)
1. [ ] Migrate `rbac.js` (19 calls, 2-3 hours)
2. [ ] Add caching to RBAC lookups (1 hour)
3. [ ] Test permission checks thoroughly
4. [ ] Migrate `unified-monitoring.js` (18 calls, 3-4 hours)
5. [ ] Add caching to monitoring dashboards (1 hour)
6. [ ] Verify monitoring metrics accuracy

**Deliverables**: 37 calls migrated, critical hot paths cached

---

### Phase 5: Cleanup & Optimization
**Target**: Day 8 (2-3 hours)
1. [ ] Remove backward compatibility layer from `db.js`
2. [ ] Remove deprecated methods:
   - `db.query()`
   - `db.findDocuments()`
   - `db.storeDocument()`
   - `db.createAuditLog()`
3. [ ] Update all imports
4. [ ] Run full test suite
5. [ ] Performance benchmarking
6. [ ] Update documentation

**Deliverables**: Clean codebase, no deprecated methods

---

## 🔍 Testing Checklist

### For Each Migration
- [ ] Code compiles without errors
- [ ] Functionality unchanged (manual testing)
- [ ] Performance improved or maintained
- [ ] Cache invalidation works correctly
- [ ] Error handling preserved
- [ ] Audit logging preserved (if applicable)

### Integration Testing
- [ ] All API endpoints functional
- [ ] Authentication/authorization working
- [ ] Database queries performant
- [ ] Cache hit rates >70%
- [ ] No memory leaks
- [ ] Graceful degradation functional

### Performance Testing
- [ ] Response times <50ms for cached endpoints
- [ ] Response times <200ms for uncached endpoints
- [ ] 1000+ concurrent users supported
- [ ] Cache memory usage <2GB
- [ ] Database connection pool stable

---

## 📝 Migration Template

Use this template for each file migration:

### File: [filename]
**Date**: [date]  
**Migrated By**: [developer]  
**Time Taken**: [hours]

#### Changes Made
- Replaced X deprecated calls with Prisma
- Added caching to Y endpoints (TTL: Z)
- Updated imports
- Added tests

#### Performance Impact
- Before: Xms average response
- After: Yms average response  
- Improvement: Zx

#### Issues Encountered
- [List any issues]

#### Testing Notes
- [Manual testing performed]
- [Edge cases tested]

---

## 🚨 Common Issues & Solutions

### Issue 1: Raw SQL Too Complex for Prisma
**Solution**: Use `prisma.$queryRaw` or `prisma.$executeRaw` for complex queries
```javascript
const result = await prisma.$queryRaw`
  SELECT u.*, COUNT(t.id) as ticket_count
  FROM users u
  LEFT JOIN tickets t ON t.user_id = u.id
  GROUP BY u.id
`;
```

### Issue 2: Parameterized Queries with Dynamic Filters
**Solution**: Build where clause conditionally
```javascript
const where = {};
if (status) where.status = status;
if (priority) where.priority = priority;

const tickets = await prisma.supportTicket.findMany({ where });
```

### Issue 3: Transaction Support Needed
**Solution**: Use Prisma transactions
```javascript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.auditTrail.create({ data: { action: 'user_created', userId: user.id } });
});
```

### Issue 4: Model Doesn't Exist in Schema
**Solution**: 
1. Check if model exists with different name
2. Add model to appropriate Prisma schema file
3. Run `pnpm prisma:generate`
4. Retry migration

---

## 📚 Resources

### Documentation
- **Prisma Client API**: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- **Prisma Queries**: https://www.prisma.io/docs/concepts/components/prisma-client/crud
- **Prisma Raw SQL**: https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access
- **Caching Guide**: `docs/REDIS-CACHING-IMPLEMENTATION.md`

### Code References
- **Database Module**: `apps/api/db.js`
- **Prisma Schemas**: `prisma/schema/*.prisma`
- **Generated Client**: `prisma/generated/client/`

---

## ✅ Completion Criteria

### Individual File
- [x] All deprecated calls replaced
- [x] Code compiles without errors
- [x] Manual testing passed
- [x] Performance maintained/improved
- [x] Caching added (if applicable)

### Overall Project
- [ ] 56+ deprecated calls migrated
- [ ] 7 files cleaned up
- [ ] Backward compatibility layer removed
- [ ] Full test suite passing
- [ ] Performance benchmarks show 10-100x improvements
- [ ] Documentation updated
- [ ] Production deployment successful

---

**Last Updated**: January 6, 2025  
**Status**: Ready to Begin  
**Target Completion**: End of Week  
**Next Action**: Begin Phase 1 (Quick Wins)

