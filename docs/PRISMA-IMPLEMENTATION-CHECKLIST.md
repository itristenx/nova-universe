# Prisma Schema Consolidation - Implementation Checklist

## ✅ Phase 1: Schema Consolidation (COMPLETE)

All schema consolidation work is complete. The following files have been created:

### Core Schema Files
- [x] `/prisma/schema.prisma` - Main configuration file
- [x] `/prisma/schema/user.prisma` - User management (17 models)
- [x] `/prisma/schema/itsm.prisma` - ITSM domain (20 models)
- [x] `/prisma/schema/knowledge.prisma` - Knowledge base (7 models)
- [x] `/prisma/schema/system.prisma` - System config (6 models)
- [x] `/prisma/schema/asset.prisma` - Asset management (14 models)

### Documentation
- [x] `/prisma/README.md` - Complete schema documentation
- [x] `/docs/PRISMA-MIGRATION-GUIDE.md` - Step-by-step migration guide
- [x] `/docs/PRISMA-CONSOLIDATION-SUMMARY.md` - Executive summary

### Configuration Updates
- [x] `/package.json` - Updated Prisma scripts
- [x] `/env.template` - Added DATABASE_URL configuration

### Validation
- [x] Schema syntax validation passed ✅
- [x] All models properly defined ✅
- [x] All relationships correctly set up ✅
- [x] Proper indexing applied ✅
- [x] Naming conventions consistent ✅

---

## 📋 Phase 2: Development Environment Setup (TODO)

### Step 1: Update Local Environment

- [ ] **Read Documentation**
  - [ ] Read `/prisma/README.md`
  - [ ] Read `/docs/PRISMA-MIGRATION-GUIDE.md`
  - [ ] Review `/docs/PRISMA-CONSOLIDATION-SUMMARY.md`

- [ ] **Update .env File**
  ```bash
  # Add to your .env file:
  DATABASE_URL="postgresql://user:password@localhost:5432/nova_universe?schema=public"
  
  # Remove (or comment out) all old database URLs:
  # CORE_DATABASE_URL=...
  # AUTH_DATABASE_URL=...
  # etc.
  ```

- [ ] **Install/Update Prisma**
  ```bash
  npm install -D prisma@latest @prisma/client@latest
  ```

- [ ] **Generate Prisma Client**
  ```bash
  npm run prisma:generate
  ```
  - Should complete without errors
  - Check that `./prisma/generated/client` is created

- [ ] **Remove Old Generated Clients**
  ```bash
  rm -rf prisma/generated/core
  rm -rf prisma/generated/auth
  rm -rf prisma/generated/audit
  # ... etc for all old clients
  ```

### Step 2: Database Setup

**Option A: Fresh Database (Recommended for Dev)**
- [ ] Create new PostgreSQL database
  ```bash
  createdb nova_universe
  ```
- [ ] Run migrations
  ```bash
  npm run prisma:migrate:dev --name initial_schema
  ```

**Option B: Keep Existing Database**
- [ ] Backup existing databases
  ```bash
  pg_dump nova_core > backup_core.sql
  # ... backup each database
  ```
- [ ] Create migration
  ```bash
  npx prisma migrate dev --name consolidate_schemas
  ```
- [ ] Review generated migration carefully
- [ ] May need manual data migration scripts

### Step 3: Verify Setup

- [ ] Open Prisma Studio
  ```bash
  npm run prisma:studio
  ```
- [ ] Verify all models appear
- [ ] Check relationships are correct
- [ ] Test creating sample records

---

## 🔧 Phase 3: Code Migration (TODO)

### Step 1: Update Imports

Find all Prisma imports in codebase:
```bash
grep -r "from '@prisma/client" apps/
grep -r "from.*generated" apps/
grep -r "PrismaClient as.*Client" apps/
```

**Update Pattern:**
```typescript
// OLD (remove):
import { PrismaClient as CoreClient } from '../prisma/generated/core'
import { PrismaClient as AuthClient } from '../prisma/generated/auth'

// NEW (use this):
import { PrismaClient } from '@prisma/client'
```

**Files to Update:**
- [ ] `apps/api/database.js` (or similar db initialization file)
- [ ] `apps/api/lib/prisma.js` (if exists)
- [ ] All service files
- [ ] All repository files
- [ ] All API route handlers
- [ ] Test setup files

### Step 2: Update Client Instantiation

**OLD Pattern (remove):**
```typescript
const coreDb = new CoreClient()
const authDb = new AuthClient()
const auditDb = new AuditClient()

export { coreDb, authDb, auditDb }
```

**NEW Pattern (use this):**
```typescript
const prisma = new PrismaClient()

export { prisma }

// Or with better error handling:
export const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

**Files to Update:**
- [ ] Database initialization file
- [ ] Service layer base class
- [ ] Test fixtures/setup

### Step 3: Update Model References

Search and replace model names:
```bash
# Find old model names
grep -r "EnhancedSupportTicket" apps/
grep -r "TicketGroup" apps/
grep -r "TicketQueue" apps/
```

**Replacements:**
- [ ] `EnhancedSupportTicket` → `SupportTicket`
- [ ] `TicketGroup` → `Group`
- [ ] `TicketQueue` → `Queue`

### Step 4: Update Database Calls

**OLD Pattern (remove):**
```typescript
const user = await authDb.user.findUnique({ where: { id } })
const ticket = await coreDb.supportTicket.create({ data })
```

**NEW Pattern (use this):**
```typescript
const user = await prisma.user.findUnique({ where: { id } })
const ticket = await prisma.supportTicket.create({ data })
```

**Search for patterns:**
```bash
grep -r "coreDb\." apps/
grep -r "authDb\." apps/
grep -r "auditDb\." apps/
# ... etc for all old clients
```

**Estimate:** Update 100-200 files (use find/replace in IDE)

### Step 5: Update Cross-Domain Queries

**Before** (multiple clients - limited):
```typescript
// Could NOT do this before:
const user = await authDb.user.findUnique({ 
  where: { id },
  include: {
    tickets: true  // ❌ Error: tickets not in authDb
  }
})
```

**After** (single client - enhanced):
```typescript
// CAN do this now:
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    tickets: true,           // ✅ Works!
    feedback: true,          // ✅ Works!
    kbArticles: true,        // ✅ Works!
    // ... any related model
  }
})
```

**Opportunities:**
- [ ] Identify queries that can now include related data
- [ ] Reduce multiple database calls
- [ ] Simplify data fetching logic

### Step 6: Add Transaction Support

**NEW Capability** (wasn't possible before):
```typescript
// Create user and ticket in atomic transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData })
  const ticket = await tx.supportTicket.create({
    data: { ...ticketData, userId: user.id }
  })
  return { user, ticket }
})
```

**Opportunities:**
- [ ] Identify operations that should be atomic
- [ ] Add transaction wrappers where needed
- [ ] Improve data consistency

---

## 🧪 Phase 4: Testing (TODO)

### Step 1: Update Test Setup

- [ ] Update test database setup
  ```typescript
  // test/setup.js
  import { PrismaClient } from '@prisma/client'
  
  export const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL
      }
    }
  })
  
  beforeAll(async () => {
    await prisma.$connect()
  })
  
  afterAll(async () => {
    await prisma.$disconnect()
  })
  ```

- [ ] Update test fixtures and factories
- [ ] Update mock data to use UUIDs instead of integers

### Step 2: Fix Existing Tests

Tests will need updates for:
- [ ] New model names (`EnhancedSupportTicket` → `SupportTicket`)
- [ ] New client import (`import { PrismaClient } from '@prisma/client'`)
- [ ] UUID IDs instead of integer IDs
- [ ] Different relation names if any

**Run tests and fix:**
```bash
npm test 2>&1 | tee test-results.txt
```

### Step 3: Integration Tests

- [ ] Test user authentication flow
- [ ] Test ticket creation and updates
- [ ] Test knowledge base operations
- [ ] Test asset management
- [ ] Test cross-domain queries
- [ ] Test transactions

### Step 4: Performance Tests

- [ ] Benchmark query performance
- [ ] Compare with old multi-DB setup
- [ ] Check for N+1 queries
- [ ] Verify connection pooling working

---

## 🚀 Phase 5: Deployment (TODO)

### Step 1: Staging Environment

- [ ] Deploy to staging environment
- [ ] Run database migrations
  ```bash
  npm run prisma:migrate:deploy
  ```
- [ ] Deploy application code
- [ ] Run smoke tests
- [ ] Monitor for errors

### Step 2: Production Preparation

- [ ] Create production database backup plan
- [ ] Review migration SQL (manually)
- [ ] Prepare rollback procedure
- [ ] Schedule maintenance window
- [ ] Notify stakeholders

### Step 3: Production Deployment

- [ ] Create database backup
  ```bash
  pg_dump -h $HOST -U $USER nova_universe > backup_$(date +%Y%m%d).sql
  ```
- [ ] Run migrations
  ```bash
  npm run prisma:migrate:deploy
  ```
- [ ] Deploy application
- [ ] Verify health checks
- [ ] Monitor logs and metrics

### Step 4: Post-Deployment

- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] User acceptance testing
- [ ] Document any issues

---

## 🧹 Phase 6: Cleanup (TODO)

### Step 1: Remove Old Schema Files

After confirming production is stable:

```bash
rm -rf prisma/core
rm -rf prisma/auth
rm -rf prisma/audit
rm -rf prisma/cmdb
rm -rf prisma/ai
rm -rf prisma/workflow
rm -rf prisma/spaces
rm -rf prisma/nova-tv
rm -rf prisma/user360
rm -rf prisma/notification
rm -rf prisma/enterprise
rm -rf prisma/integration
rm prisma/itsm-enhanced.prisma
rm prisma/enhanced-itsm-schema.prisma
```

### Step 2: Remove Old Generated Clients

```bash
rm -rf prisma/generated/core
rm -rf prisma/generated/auth
rm -rf prisma/generated/audit
rm -rf prisma/generated/cmdb
rm -rf prisma/generated/ai
rm -rf prisma/generated/workflow
rm -rf prisma/generated/nova-tv
rm -rf prisma/generated/user360
rm -rf prisma/generated/notification
rm -rf prisma/generated/integration
```

### Step 3: Update .gitignore

Remove old paths, keep new:
```
# Prisma
prisma/generated/
.env
.env.test
.env.local
```

### Step 4: Remove Old Environment Variables

From all environment files (.env, .env.production, etc.):
- [ ] Remove `CORE_DATABASE_URL`
- [ ] Remove `AUTH_DATABASE_URL`
- [ ] Remove `AUDIT_DATABASE_URL`
- [ ] ... (all 12+ old DB URLs)

### Step 5: Update Documentation

- [ ] Update main README.md
- [ ] Update architecture diagrams
- [ ] Update onboarding docs
- [ ] Update deployment guides

---

## 📊 Success Metrics

Track these metrics before and after migration:

### Performance
- [ ] Average query response time
- [ ] 95th percentile query time
- [ ] Database connection pool usage
- [ ] Transaction throughput

### Developer Experience
- [ ] Lines of code (should decrease)
- [ ] Number of imports (should decrease)
- [ ] Build time
- [ ] Test execution time

### Operational
- [ ] Deployment time
- [ ] Database backup time
- [ ] Migration execution time
- [ ] Error rate

---

## ⚠️ Known Risks & Mitigation

### Risk 1: Data Migration Complexity
**Impact:** High  
**Probability:** Medium  
**Mitigation:**
- Thorough testing on staging
- Complete backup before production
- Rollback procedure documented
- Data validation scripts prepared

### Risk 2: Application Downtime
**Impact:** High  
**Probability:** Low  
**Mitigation:**
- Blue-green deployment strategy
- Feature flags for new code
- Gradual rollout possible
- Quick rollback available

### Risk 3: Missing Edge Cases
**Impact:** Medium  
**Probability:** Medium  
**Mitigation:**
- Comprehensive test suite
- User acceptance testing
- Gradual feature enablement
- Monitoring and alerting

### Risk 4: Performance Degradation
**Impact:** Medium  
**Probability:** Low  
**Mitigation:**
- Proper indexing in new schema
- Connection pooling configured
- Query performance testing
- Rollback if issues arise

---

## 📞 Support & Resources

### Documentation
- `/prisma/README.md` - Schema documentation
- `/docs/PRISMA-MIGRATION-GUIDE.md` - Migration guide
- `/docs/PRISMA-CONSOLIDATION-SUMMARY.md` - Executive summary

### External Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Multi-File Schemas](https://www.prisma.io/docs/orm/prisma-schema/overview/location#multi-file-prisma-schema)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### Team Contacts
- **Schema Questions:** [Tech Lead]
- **Migration Issues:** [Backend Team]
- **Production Deployment:** [DevOps Team]

---

## ✅ Final Validation

Before marking this project complete, ensure:

- [ ] All Phase 2 items complete
- [ ] All Phase 3 items complete
- [ ] All Phase 4 tests passing
- [ ] Phase 5 production deployment successful
- [ ] Phase 6 cleanup complete
- [ ] All documentation updated
- [ ] Team trained on new structure
- [ ] Metrics show improvement or no regression
- [ ] No critical issues in production
- [ ] Stakeholders satisfied

---

**Current Status:** Phase 1 Complete ✅  
**Next Phase:** Phase 2 - Development Environment Setup  
**Estimated Total Time:** 2-3 weeks  

**Last Updated:** October 5, 2025
