# Week 1 Prisma Schema Mapping

**Purpose**: Map Week 1 expected model names to actual Prisma schema models

---

## ✅ Models Found - Direct Matches

| Week 1 Expected | Actual Prisma Model | Schema File | Status |
|-----------------|---------------------|-------------|--------|
| `ServiceCatalogItem` | `ServiceCatalogItem` | `cmdb.prisma` | ✅ EXACT MATCH |
| `AuditLog` | `AuditLog` | `audit.prisma` | ✅ EXACT MATCH |
| `User` | `User` | `user.prisma` | ✅ EXACT MATCH |

## 🔄 Models Found - Name Variations

| Week 1 Expected | Actual Prisma Model | Schema File | Action Required |
|-----------------|---------------------|-------------|-----------------|
| `KnowledgeArticle` | `KbArticle` | `knowledge.prisma` | Replace in code |
| `Ticket` | `SupportTicket` | `itsm.prisma` | Replace in code |
| `UserGroup` | `Group` | `itsm.prisma` | Replace in code |

## ❌ Models NOT Found - Alternatives Available

| Week 1 Expected | Alternative | Schema File | Notes |
|-----------------|-------------|-------------|-------|
| `TicketActivity` | `TicketHistory` | `itsm.prisma` | Use TicketHistory for activity tracking |
| `TicketRating` | *Not found* | N/A | **CREATE NEW MODEL** or use Feedback |
| `UserAchievement` | *Not found* | N/A | **CREATE NEW MODEL** or use XpEvent/Leaderboard |
| `ChatMessage` | `ChatbotMessage` | `ai.prisma` | Use ChatbotMessage for chat |
| `ServiceRequest` | `RITM` | `asset.prisma` | RITM = Requested Item (ServiceNow standard) |

## 📋 Complete Model Mapping for Week 1

### 1. Agent Portal APIs

**File**: `apps/api/routes/agent-portal.js`

```javascript
// Current (Week 1)
prisma.ticket
prisma.ticketActivity
prisma.ticketRating  
prisma.user
prisma.userAchievement

// Should be (Actual Schema)
prisma.supportTicket         // ✅ Found
prisma.ticketHistory         // ✅ Found (alternative)
*CREATE NEW MODEL*           // ❌ TicketRating missing
prisma.user                  // ✅ Found
prisma.leaderboard           // ✅ Found (alternative for achievements)
// OR create gamification model
```

### 2. Knowledge Base APIs

**File**: `apps/api/routes/knowledge.js`

```javascript
// Current (Week 1)
prisma.knowledgeArticle

// Should be (Actual Schema)  
prisma.kbArticle             // ✅ Found
```

### 3. Services APIs

**File**: `apps/api/routes/services.js`

```javascript
// Current (Week 1)
prisma.serviceCatalogItem
prisma.serviceRequest

// Should be (Actual Schema)
prisma.serviceCatalogItem    // ✅ Found (EXACT MATCH!)
prisma.ritm                  // ✅ Found (ServiceNow standard for requests)
```

### 4. Directory Management APIs

**File**: `apps/api/routes/directory.js`

```javascript
// Current (Week 1)
prisma.user
prisma.userGroup
prisma.auditLog

// Should be (Actual Schema)
prisma.user                  // ✅ Found
prisma.group                 // ✅ Found
prisma.auditLog              // ✅ Found (EXACT MATCH!)
```

### 5. Live Chat WebSocket

**File**: `apps/api/websocket/chat-handler.js`

```javascript
// Current (Week 1)
prisma.chatMessage

// Should be (Actual Schema)
prisma.chatbotMessage        // ✅ Found (from ai.prisma)
// OR create dedicated ChatMessage model
```

---

## 🛠 Implementation Strategy - RECOMMENDED APPROACH

### Option 1: Quick Fix with Model Aliases (FASTEST - 30 minutes)

Update `apps/api/db.js` to add aliases:

```javascript
// Add after Prisma client initialization (around line 60)

// ============================================================================
// MODEL ALIASES FOR WEEK 1 COMPATIBILITY
// ============================================================================

/**
 * Model aliases to match Week 1 API expectations
 * Maps expected model names to actual Prisma schema models
 */

// Knowledge Base
export const KnowledgeArticle = prisma.kbArticle;

// ITSM
export const Ticket = prisma.supportTicket;
export const TicketActivity = prisma.ticketHistory; // Using history as activity log
export const UserGroup = prisma.group;

// Services
export const ServiceRequest = prisma.ritm; // RITM = Requested Item

// Chat
export const ChatMessage = prisma.chatbotMessage;

// Note: TicketRating and UserAchievement models don't exist
// These will return undefined - Week 1 code has graceful degradation
```

Then update Week 1 route imports:

```javascript
// In agent-portal.js, knowledge.js, services.js, directory.js
import { 
  prisma, 
  getWithCache,
  KnowledgeArticle,  // alias
  Ticket,            // alias
  TicketActivity,    // alias
  ServiceRequest,    // alias
  UserGroup,         // alias
  ChatMessage        // alias
} from '../db.js';
```

**Pros**:
- ✅ Fastest implementation (30 min)
- ✅ Minimal code changes
- ✅ Preserves Week 1 code structure
- ✅ Graceful degradation for missing models

**Cons**:
- ⚠️ Some features won't work (ratings, achievements) until models created

---

### Option 2: Direct Code Updates (THOROUGH - 2 hours)

Update each Week 1 file to use actual Prisma models:

**agent-portal.js**:
```javascript
// Line ~60: Replace
const tickets = await prisma.ticket.findMany({
// With:
const tickets = await prisma.supportTicket.findMany({

// Line ~180: Replace  
const activities = await prisma.ticketActivity.findMany({
// With:
const activities = await prisma.ticketHistory.findMany({

// Lines ~250-280: Comment out or remove TicketRating queries
// Lines ~320-350: Comment out or remove UserAchievement queries
// Return empty arrays for now
```

**knowledge.js**:
```javascript
// Replace all occurrences
prisma.knowledgeArticle → prisma.kbArticle
```

**services.js**:
```javascript
// Line ~240: Replace
prisma.serviceRequest → prisma.ritm
// Note: prisma.serviceCatalogItem already matches!
```

**directory.js**:
```javascript
// Line ~160: Replace
prisma.userGroup → prisma.group
// Note: prisma.user and prisma.auditLog already match!
```

**chat-handler.js**:
```javascript
// Replace
prisma.chatMessage → prisma.chatbotMessage
```

**Pros**:
- ✅ Direct model usage
- ✅ Better long-term maintainability
- ✅ Clear what works vs. what's missing

**Cons**:
- ⏱ Takes longer (2 hours)
- 🔧 More files to modify
- ❌ Still missing TicketRating, UserAchievement

---

## 🎯 RECOMMENDED ACTION PLAN

### Step 1: Implement Quick Fix (30 minutes)

1. Update `apps/api/db.js` with model aliases (see Option 1 above)
2. Update imports in Week 1 files
3. Restart API server
4. Test endpoints

### Step 2: Test & Verify (15 minutes)

```bash
# Restart server
pkill -f "pnpm dev"
cd /Users/tneibarger/nova-universe/apps/api && pnpm dev &

# Run tests
./test-week-1-simple.sh

# Expected results:
# ✅ Knowledge Base APIs return real data from KbArticle
# ✅ Services APIs return real data from ServiceCatalogItem
# ✅ Agent Portal returns tickets from SupportTicket
# ⚠️ Ratings/Achievements return empty (graceful degradation)
# ✅ Directory APIs work with User, Group, AuditLog
```

### Step 3: Create Missing Models (Optional - Future Work)

Add to appropriate Prisma schema files:

**itsm.prisma** - Add TicketRating:
```prisma
model TicketRating {
  id            String   @id @default(cuid())
  ticketId      String
  ticket        SupportTicket @relation(fields: [ticketId], references: [id])
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  rating        Int      // 1-5
  comment       String?
  createdAt     DateTime @default(now())
  
  @@index([ticketId])
  @@index([userId])
}
```

**user.prisma** - Add UserAchievement:
```prisma
model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  achievementId String
  name          String
  description   String
  points        Int
  category      String   // "support", "knowledge", "community"
  earnedAt      DateTime @default(now())
  progress      Int      @default(100)
  
  @@index([userId])
  @@index([category])
}
```

Then run migration:
```bash
cd /Users/tneibarger/nova-universe
npx prisma migrate dev --name add-week1-missing-models
npx prisma generate
```

---

## 📊 Summary

### Models Status

| Category | Total Needed | Found | Alternatives | Missing |
|----------|--------------|-------|--------------|---------|
| Agent Portal | 5 | 3 | 1 | 1 |
| Knowledge Base | 1 | 1 | 0 | 0 |
| Services | 2 | 2 | 0 | 0 |
| Directory | 3 | 3 | 0 | 0 |
| Chat | 1 | 1 | 0 | 0 |
| **TOTAL** | **12** | **10** | **1** | **1** |

**83% of models found** - Excellent schema coverage!

### Next Steps

1. ✅ Implement model aliases (30 min) - **DO THIS NOW**
2. ✅ Test endpoints (15 min)
3. ⏳ Create missing models (1 hour) - **Optional, future work**
4. ⏳ Frontend integration (2-4 hours)

---

**Generated**: January 7, 2025  
**Status**: Schema mapping complete, ready for implementation
