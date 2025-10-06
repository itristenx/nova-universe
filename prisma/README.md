# Prisma Schema Documentation

## Overview

This project uses **Prisma ORM 6.x+ multi-file schema structure** following industry best practices. The schema is organized into domain-driven modules for better maintainability, team collaboration, and reduced merge conflicts.

## Architecture

### Single Database Approach
- **One PostgreSQL database** for all domains
- **UUID primary keys** across all models (industry standard for distributed systems)
- **Better transaction support** - ACID guarantees across all tables
- **Simplified deployment** - one database to manage
- **Easier backup and recovery**

### Multi-File Schema Organization
Located in `prisma/schema/` subdirectory:

```
prisma/
├── schema.prisma              # Main config (datasource + generator)
└── schema/                    # Domain models
    ├── user.prisma           # User management & authentication
    ├── itsm.prisma           # IT Service Management (tickets, SLA, workflows)
    ├── knowledge.prisma      # Knowledge base & gamification
    ├── system.prisma         # Config, VIP management, agent availability
    └── asset.prisma          # Assets, inventory, mailroom, kiosks
```

## Schema Files

### 1. `schema.prisma` (Main Configuration)
- Datasource configuration
- Generator configuration
- Global enums
- Documentation index

### 2. `schema/user.prisma`
**Models:**
- `User` - User accounts and profiles
- `Role` - User roles
- `Permission` - Granular permissions
- `UserRole` - User-role assignments
- `RolePermission` - Role-permission assignments
- `Session` - User sessions
- `Passkey` - WebAuthn passkeys
- `PasswordReset` - Password reset tokens
- `LoginAttempt` - Login attempt tracking
- `AuthProvider` - SSO providers (SAML, OAuth, LDAP)
- `UserProvider` - User-provider mappings
- `MfaDevice` - Multi-factor auth devices
- `ApiKey` - API authentication keys
- `ScimMapping` - SCIM identity mappings
- `Log` - Audit logs

### 3. `schema/itsm.prisma`
**Models:**
- `SupportTicket` - Main ticketing system (ServiceNow/ITIL compliant)
- `TicketComment` - Ticket comments
- `TicketAttachment` - File attachments
- `CommentAttachment` - Comment attachments
- `TicketWatcher` - Ticket watchers
- `TicketHistory` - Audit trail
- `TicketEscalation` - Escalation management
- `TicketTimeEntry` - Time tracking
- `TicketLink` - Ticket relationships
- `Group` - Support groups
- `GroupMember` - Group memberships
- `Queue` - Ticket queues
- `SlaDefinition` - SLA rules
- `SlaBreach` - SLA breach tracking
- `TicketApproval` - Approval workflows
- `WorkflowDefinition` - Workflow templates
- `WorkflowStep` - Workflow steps
- `WorkflowInstance` - Workflow executions

**Enums:**
- `TicketType`, `TicketState`, `Priority`, `Urgency`, `Impact`
- `TicketSource`, `WatchType`, `HistoryAction`
- `EscalationStatus`, `TimeType`, `RelationshipType`
- `SlaBreachType`, `ApprovalType`, `ApprovalStatus`
- `WorkflowStepType`, `WorkflowStatus`

### 4. `schema/knowledge.prisma`
**Models:**
- `KbArticle` - Knowledge base articles
- `KbCategory` - Article categories (hierarchical)
- `KbArticleVersion` - Version history
- `KbArticleComment` - Article comments
- `Feedback` - User feedback
- `XpEvent` - Gamification events
- `Leaderboard` - User rankings

**Enums:**
- `KbArticleStatus`, `KbVisibility`, `FeedbackType`

### 5. `schema/system.prisma`
**Models:**
- `Config` - System configuration
- `ConfigHistory` - Config change history
- `ConfigTemplate` - Config templates
- `VipSlaHistory` - VIP SLA tracking
- `VipProxy` - VIP proxy assignments
- `ProxyAuthorization` - Proxy permissions
- `AgentAvailability` - Agent status

**Enums:**
- `AgentStatus`

### 6. `schema/asset.prisma`
**Models:**
- `InventoryAsset` - Asset management
- `AssetStatusLog` - Asset status changes
- `AssetAssignment` - Asset assignments
- `AssetTicketHistory` - Asset-ticket linkage
- `AssetWarrantyAlert` - Warranty alerts
- `AssetValidationLog` - Validation tracking
- `AssetImportBatch` - Bulk imports
- `MailroomPackage` - Package tracking
- `DeliveryEvent` - Package events
- `KioskAssetRegistry` - Kiosk assets
- `RITM` - Requested items (ServiceNow style)
- `HelixSyncFailure` - Integration error tracking

**Enums:**
- `AssetStatus`, `ImportStatus`, `PackageStatus`, `RitmStatus`

## Migration from Old Structure

### Old Structure (DEPRECATED)
```
prisma/
├── core/schema.prisma          ❌ DELETE
├── auth/schema.prisma          ❌ DELETE
├── audit/schema.prisma         ❌ MIGRATE
├── cmdb/schema.prisma          ❌ MIGRATE
├── ai/schema.prisma            ❌ MIGRATE
├── workflow/schema.prisma      ❌ MIGRATE
├── spaces/schema.prisma        ❌ MIGRATE
├── nova-tv/schema.prisma       ❌ MIGRATE
├── user360/schema.prisma       ❌ MIGRATE
├── notification/schema.prisma  ❌ MIGRATE
├── enterprise/schema.prisma    ❌ MIGRATE
├── integration/schema.prisma   ❌ MIGRATE
├── itsm-enhanced.prisma        ❌ DELETE
└── enhanced-itsm-schema.prisma ❌ DELETE
```

### Issues with Old Structure
1. **Multiple duplicate ticket schemas** - `SupportTicket` in core, `EnhancedSupportTicket` in two files
2. **Separate database connections** - 9+ different database URLs
3. **Inconsistent ID strategies** - Mix of Int and UUID
4. **No main schema.prisma** - Violated Prisma best practices
5. **Difficult to maintain** - Models scattered across many files
6. **Merge conflicts** - Single-file schemas caused team issues

### Benefits of New Structure
1. ✅ **Single source of truth** - One database, one schema
2. ✅ **Industry standard UUIDs** - Better for distributed systems
3. ✅ **Domain-driven organization** - Related models grouped together
4. ✅ **Reduced merge conflicts** - Smaller, focused files
5. ✅ **Better performance** - Cross-table queries in same DB
6. ✅ **Easier transactions** - ACID across all tables
7. ✅ **Simpler deployment** - One migration history

## Usage

### Generate Prisma Client
```bash
npm run prisma:generate
```

This generates a single Prisma Client with all models from all schema files.

### Create Migration
```bash
npx prisma migrate dev --name description_of_changes
```

### Apply Migrations (Production)
```bash
npx prisma migrate deploy
```

### Format Schemas
```bash
npx prisma format
```

### Validate Schemas
```bash
npx prisma validate
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

## Environment Variables

Update your `.env` file to use a single database connection:

```env
# Single PostgreSQL database for all domains
DATABASE_URL="postgresql://user:password@localhost:5432/nova_universe?schema=public"

# Legacy environment variables (REMOVE THESE)
# CORE_DATABASE_URL=...
# AUTH_DATABASE_URL=...
# AUDIT_DATABASE_URL=...
# ... (delete all separate DB URLs)
```

## Code Updates Required

### Old Import Pattern (DEPRECATED)
```typescript
import { PrismaClient as CoreClient } from '@prisma/client/core'
import { PrismaClient as AuthClient } from '@prisma/client/auth'
import { PrismaClient as AuditClient } from '@prisma/client/audit'

const coreDb = new CoreClient()
const authDb = new AuthClient()
const auditDb = new AuditClient()
```

### New Import Pattern (CORRECT)
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// All models available on single client
const user = await prisma.user.findUnique({ where: { id: '...' } })
const ticket = await prisma.supportTicket.create({ data: { ... } })
const article = await prisma.kbArticle.findMany()
```

## Best Practices

### 1. Model Naming
- Use **PascalCase** for model names (e.g., `SupportTicket`)
- Use **camelCase** for field names (e.g., `createdAt`)
- Use **snake_case** for database column names via `@map` (e.g., `created_at`)

### 2. Primary Keys
- Always use `@id @default(uuid())` for primary keys
- Use `String` type for UUID fields

### 3. Foreign Keys
- Always include both `@relation` and `fields/references`
- Use descriptive relation names for clarity

### 4. Indexes
- Add `@@index` for frequently queried fields
- Add `@@index` for foreign keys
- Add `@@unique` where appropriate

### 5. Enums
- Define enums in the same file as the models that use them
- Use SCREAMING_SNAKE_CASE for enum values

### 6. Timestamps
- Always include `createdAt` and `updatedAt` on all models
- Use `@default(now())` for `createdAt`
- Use `@updatedAt` for `updatedAt`

### 7. Soft Deletes
- Use `deletedAt DateTime?` for soft deletes
- Add index on `deletedAt` for query performance

## Migration Strategy

### Phase 1: Schema Consolidation ✅ COMPLETE
- [x] Create main `schema.prisma`
- [x] Create `schema/` subdirectory
- [x] Consolidate user/auth models
- [x] Consolidate ITSM models (remove duplicates)
- [x] Organize by domain

### Phase 2: Code Migration (IN PROGRESS)
- [ ] Update all imports to use single PrismaClient
- [ ] Remove multiple database initialization
- [ ] Update API routes to use new schema
- [ ] Update service layer
- [ ] Update repository pattern

### Phase 3: Database Migration
- [ ] Generate initial migration from new schema
- [ ] Test migration on development database
- [ ] Create data migration scripts if needed
- [ ] Deploy to staging
- [ ] Deploy to production

### Phase 4: Cleanup
- [ ] Remove old schema files
- [ ] Remove old generated clients
- [ ] Update documentation
- [ ] Remove deprecated database URLs

## File Organization Tips

### When to Create a New Schema File
- **Do:** Create new file when adding a major new feature domain
- **Do:** Keep related models together (e.g., all ITSM models in one file)
- **Don't:** Create a file with only one or two small models
- **Don't:** Split tightly coupled models across files

### Recommended Maximum File Size
- Keep schema files under **1000 lines**
- If a file grows too large, split by sub-domain
- Example: Split `itsm.prisma` into `itsm-tickets.prisma` and `itsm-workflows.prisma`

## Troubleshooting

### Error: "Model X not found"
- Run `npx prisma generate` to regenerate client
- Check that model is defined in one of the schema files

### Error: "Relation X is missing opposite relation field"
- Ensure both sides of relation are defined
- Check that relation names match

### Error: "Unique constraint violation"
- Check `@@unique` constraints
- Verify data doesn't violate uniqueness

### Slow Queries
- Add indexes on frequently queried fields
- Use `explain` to analyze query plans
- Consider composite indexes for multi-column queries

## Resources

- [Prisma Multi-File Schemas](https://www.prisma.io/docs/orm/prisma-schema/overview/location#multi-file-prisma-schema)
- [Prisma Data Model](https://www.prisma.io/docs/orm/prisma-schema/data-model)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

## Support

For questions or issues with the schema:
1. Check this documentation
2. Review Prisma docs
3. Check migration history
4. Create an issue in the project repo
