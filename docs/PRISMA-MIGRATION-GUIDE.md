# Prisma Schema Migration Guide

## Overview
This guide helps you migrate from the old multi-database, multi-schema setup to the new consolidated single-database schema structure.

## Pre-Migration Checklist

- [ ] Backup all databases
- [ ] Document current database URLs
- [ ] Review all Prisma client imports in codebase
- [ ] Test new schema on development environment first
- [ ] Notify team of upcoming changes

## Step-by-Step Migration

### Step 1: Update Environment Variables

**Old `.env` (DELETE THESE):**
```env
CORE_DATABASE_URL="postgresql://..."
AUTH_DATABASE_URL="postgresql://..."
AUDIT_DATABASE_URL="postgresql://..."
CMDB_DATABASE_URL="postgresql://..."
NOTIFICATION_DATABASE_URL="postgresql://..."
USER360_DATABASE_URL="postgresql://..."
INTEGRATION_DATABASE_URL="postgresql://..."
AI_DATABASE_URL="postgresql://..."
NOVA_TV_DATABASE_URL="postgresql://..."
WORKFLOW_DATABASE_URL="postgresql://..."
SPACES_DATABASE_URL="postgresql://..."
ENTERPRISE_DATABASE_URL="postgresql://..."
```

**New `.env` (USE THIS):**
```env
# Single database for all domains
DATABASE_URL="postgresql://user:password@localhost:5432/nova_universe?schema=public"

# Optional: Separate read replica for analytics
DATABASE_URL_READ_REPLICA="postgresql://user:password@localhost:5432/nova_universe_read?schema=public"
```

### Step 2: Install Dependencies

```bash
# Ensure you have latest Prisma
npm install -D prisma@latest @prisma/client@latest
```

### Step 3: Remove Old Generated Clients

```bash
# Remove all old generated Prisma clients
rm -rf prisma/generated
rm -rf node_modules/.prisma
```

### Step 4: Generate New Schema

```bash
# Generate new Prisma client from consolidated schema
npm run prisma:generate

# You should see:
# ✔ Generated Prisma Client to ./prisma/generated/client
```

### Step 5: Create Migration

**Option A: Fresh Database (Recommended for Development)**
```bash
# Drop existing database and create from scratch
npm run prisma:migrate:reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Run seed scripts (if configured)
```

**Option B: Existing Database (Production)**
```bash
# Create migration from current schema
npx prisma migrate dev --name consolidate_schemas

# Review the generated migration in prisma/migrations/
# Ensure it looks correct before deploying
```

### Step 6: Update Code Imports

**Find all old imports:**
```bash
# Search for old Prisma client imports
grep -r "from '@prisma/client/" apps/
grep -r "from.*generated" apps/
```

**Old Pattern (REPLACE):**
```typescript
// ❌ OLD - Multiple clients
import { PrismaClient as CoreClient } from '../prisma/generated/core'
import { PrismaClient as AuthClient } from '../prisma/generated/auth'

const coreDb = new CoreClient()
const authDb = new AuthClient()

// Queries
const user = await authDb.user.findUnique({ where: { id } })
const ticket = await coreDb.supportTicket.create({ data })
```

**New Pattern (USE THIS):**
```typescript
// ✅ NEW - Single client
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// All queries on same client
const user = await prisma.user.findUnique({ where: { id } })
const ticket = await prisma.supportTicket.create({ data })
```

### Step 7: Update Database Service/Repository Pattern

**Old Pattern (REPLACE):**
```typescript
// ❌ OLD - Multiple database instances
import { coreDb, authDb, auditDb } from './database.js'

export class UserService {
  async getUser(id) {
    return authDb.user.findUnique({ where: { id } })
  }
  
  async getUserTickets(userId) {
    return coreDb.supportTicket.findMany({ where: { userId } })
  }
}
```

**New Pattern (USE THIS):**
```typescript
// ✅ NEW - Single database instance
import { prisma } from './database.js'

export class UserService {
  async getUser(id) {
    return prisma.user.findUnique({ where: { id } })
  }
  
  async getUserTickets(userId) {
    return prisma.supportTicket.findMany({ where: { userId } })
  }
  
  // Bonus: Now you can do cross-domain transactions!
  async createUserWithTicket(userData, ticketData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData })
      const ticket = await tx.supportTicket.create({
        data: { ...ticketData, userId: user.id }
      })
      return { user, ticket }
    })
  }
}
```

### Step 8: Update Model References

**Check for renamed models:**

| Old Model Name | New Model Name | Notes |
|----------------|----------------|-------|
| `EnhancedSupportTicket` | `SupportTicket` | Consolidated into one model |
| `TicketGroup` | `Group` | Simplified naming |
| `TicketQueue` | `Queue` | Simplified naming |

**Find all references:**
```bash
grep -r "EnhancedSupportTicket" apps/
grep -r "TicketGroup" apps/
```

### Step 9: Test Thoroughly

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Check for Prisma errors
npm run prisma:validate

# Test database connections
npm run health
```

### Step 10: Deploy to Production

```bash
# 1. Backup production database
pg_dump -h $HOST -U $USER -d nova_universe > backup_$(date +%Y%m%d).sql

# 2. Deploy migration
npm run prisma:migrate:deploy

# 3. Restart application
pm2 restart nova-api

# 4. Monitor logs
pm2 logs nova-api
```

## Common Issues & Solutions

### Issue: "Model X not found"

**Cause:** Prisma client not regenerated after schema changes

**Solution:**
```bash
npm run prisma:generate
```

### Issue: "Relation X is missing opposite relation field"

**Cause:** Incomplete relation definition in new schema

**Solution:** Check the schema file and ensure both sides of the relation are defined:
```prisma
model User {
  id String @id @default(uuid())
  tickets SupportTicket[] // ✅ Relation field
}

model SupportTicket {
  id String @id @default(uuid())
  userId String
  user User @relation(fields: [userId], references: [id]) // ✅ Relation field
}
```

### Issue: "Cannot find module '@prisma/client/core'"

**Cause:** Old import path still in code

**Solution:** Update to new import path:
```typescript
// ❌ OLD
import { PrismaClient } from '@prisma/client/core'

// ✅ NEW
import { PrismaClient } from '@prisma/client'
```

### Issue: Transaction across models fails

**Cause:** This might have worked accidentally with old setup

**Solution:** Use Prisma's transaction API:
```typescript
await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.supportTicket.create({ ... })
])
```

### Issue: Migration conflicts

**Cause:** Existing data doesn't match new schema

**Solution:** Create a data migration script:
```sql
-- Example: Migrate ticket IDs from Int to UUID
UPDATE support_tickets 
SET id = gen_random_uuid()::text
WHERE id IS NOT NULL;
```

## Data Migration Scripts

### Migrate User IDs from Int to UUID

If you have existing data with integer IDs, you'll need to migrate:

```typescript
// scripts/migrate-ids-to-uuid.ts
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function migrateUserIds() {
  const users = await prisma.$queryRaw`SELECT * FROM users`
  
  for (const user of users) {
    const newId = uuidv4()
    await prisma.$executeRaw`
      UPDATE users SET id = ${newId} WHERE id = ${user.id}
    `
  }
  
  console.log(`Migrated ${users.length} user IDs to UUID`)
}

migrateUserIds()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## Rollback Plan

If migration fails, follow these steps:

### Step 1: Restore Database Backup
```bash
psql -h $HOST -U $USER -d nova_universe < backup_YYYYMMDD.sql
```

### Step 2: Revert Code Changes
```bash
git revert <commit-hash>
```

### Step 3: Reinstall Old Generated Clients
```bash
npm run prisma:generate:all
```

### Step 4: Restart Application
```bash
pm2 restart nova-api
```

## Validation Checklist

After migration, verify:

- [ ] All tests pass
- [ ] Application starts without errors
- [ ] Users can log in
- [ ] Tickets can be created
- [ ] Comments and attachments work
- [ ] Knowledge base accessible
- [ ] API endpoints respond correctly
- [ ] No console errors
- [ ] Database connections stable
- [ ] Performance is acceptable

## Performance Considerations

### Benefits of Consolidated Schema
- **Better query performance** - No cross-database JOINs needed
- **Single connection pool** - More efficient resource usage
- **ACID transactions** - Cross-table transactions now possible
- **Simpler caching** - One database to cache

### Potential Issues
- **Larger database** - All data in one place (easier to backup!)
- **Lock contention** - Monitor for table locks
- **Index optimization** - Ensure proper indexes on new schema

### Monitoring
```bash
# Check database size
SELECT pg_size_pretty(pg_database_size('nova_universe'));

# Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check index usage
SELECT
  schemaname || '.' || tablename AS table,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Schema consolidation | 2-4 hours | Already complete ✅ |
| Code updates | 4-8 hours | Update all imports and queries |
| Testing | 4-8 hours | Comprehensive testing |
| Staging deployment | 1-2 hours | Deploy to staging first |
| Production deployment | 1-2 hours | With rollback plan ready |
| **Total** | **12-24 hours** | Spread over multiple days |

## Success Criteria

Migration is successful when:

1. ✅ All old schema files removed
2. ✅ Single `DATABASE_URL` in use
3. ✅ All tests passing
4. ✅ Zero console errors
5. ✅ All features working
6. ✅ Performance metrics normal
7. ✅ Team trained on new structure
8. ✅ Documentation updated

## Support

If you encounter issues:
1. Check this migration guide
2. Review Prisma logs: `npx prisma --version && npx prisma validate`
3. Check database logs
4. Contact: [team lead email]

## Resources

- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate-to-prisma)
- [Multi-File Schemas](https://www.prisma.io/docs/orm/prisma-schema/overview/location#multi-file-prisma-schema)
- [Prisma Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
