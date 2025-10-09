# Master Checklist - All 4 Enhancements

**Last Updated**: October 9, 2025  
**Overall Progress**: Enhancement #1 33% Complete, #2-#4 100% Documented

---

## 🎯 Enhancement 1: RBAC UI Implementation

**Overall**: 3/9 pages complete (33%)  
**Time Remaining**: 30-45 minutes

### Completed Pages ✅

- [x] **Change Management Page** - COMPLETE
  - [x] Imports added
  - [x] Role hooks initialized
  - [x] ReadOnlyBadge added
  - [x] New Change button protected (AdminOnly)
  - [x] Approve button protected (ApproverOnly)
  - [x] Reject button protected (ApproverOnly)
  - [x] Implement button protected (AdminOnly)
  - [x] All fallback UIs with tooltips

- [x] **Workflow Builder Page** - COMPLETE
  - [x] Imports added
  - [x] Role hooks initialized
  - [x] ReadOnlyBadge added
  - [x] New Workflow button protected (WorkflowAdminOnly)
  - [x] Execute button protected (WorkflowAdminOnly)
  - [x] Publish button protected (WorkflowAdminOnly)
  - [x] Delete button protected (AdminOnly)
  - [x] All fallback UIs with tooltips

- [x] **Approval Queue Page** - COMPLETE
  - [x] Imports added
  - [x] Role hooks initialized
  - [x] ReadOnlyBadge added
  - [x] Approve button protected (ApproverOnly)
  - [x] Reject button protected (ApproverOnly)
  - [x] All fallback UIs with tooltips

### Remaining Pages ⏳

- [ ] **Alert Management Page** (7 min)
  - [ ] Add imports (useRoles, AdminOnly, ReadOnlyBadge)
  - [ ] Initialize hooks
  - [ ] Add ReadOnlyBadge for non-admins
  - [ ] Wrap New Alert button (AdminOnly)
  - [ ] Wrap Edit button (AdminOnly)
  - [ ] Wrap Delete button (AdminOnly)

- [ ] **Webhook Configuration Page** (7 min)
  - [ ] Add imports (useRoles, AdminOnly, ReadOnlyBadge)
  - [ ] Initialize hooks
  - [ ] Add ReadOnlyBadge for non-admins
  - [ ] Wrap New Webhook button (AdminOnly)
  - [ ] Wrap Edit button (AdminOnly)
  - [ ] Wrap Delete button (AdminOnly)
  - [ ] Wrap Test button (AdminOnly)

- [ ] **User Directory Page** (5 min) - CRITICAL SECURITY
  - [ ] Add imports (useRoles, AdminOnly, ReadOnlyBadge)
  - [ ] Initialize hooks
  - [ ] Add ReadOnlyBadge for non-admins
  - [ ] Wrap Create User button (AdminOnly)
  - [ ] Wrap Edit User button (AdminOnly)
  - [ ] Wrap Delete User button (AdminOnly)
  - [ ] Wrap Role Assignment (AdminOnly)

- [ ] **Service Catalog Page** (5 min)
  - [ ] Add imports (useRoles, CatalogAdminOnly, ReadOnlyBadge)
  - [ ] Initialize hooks
  - [ ] Add ReadOnlyBadge for non-catalog-admins
  - [ ] Wrap Create Service button (CatalogAdminOnly)
  - [ ] Wrap Edit button (CatalogAdminOnly)
  - [ ] Wrap Delete button (AdminOnly)

- [ ] **Knowledge Base Page** (3 min)
  - [ ] Add imports (usePermission, PermissionGuard, ReadOnlyBadge)
  - [ ] Check permission (articles:create)
  - [ ] Add ReadOnlyBadge
  - [ ] Wrap New Article button

- [ ] **Agent Portal Page** (3 min)
  - [ ] Add imports (useRole, ReadOnlyBadge)
  - [ ] Check if user is agent
  - [ ] Add ReadOnlyBadge for non-agents

### Testing ⏳

- [ ] **Fix Port Conflict FIRST** (2 min) - CRITICAL
  - [ ] Option 1: Move backend to port 3001
    ```bash
    API_PORT=3001 pnpm --filter @nova-universe/api dev
    echo "VITE_API_URL=http://localhost:3001" > apps/unified/.env.local
    ```
  - [ ] Option 2: Stop Next.js (kill 27103), start backend on 3000

- [ ] **Manual Testing** (15 min)
  - [ ] Login as Admin → Verify full access
  - [ ] Login as Approver → Verify limited access (approve/reject only)
  - [ ] Login as Workflow Admin → Verify workflow access only
  - [ ] Login as Regular User → Verify read-only + tooltips

- [ ] **Verify UI Elements**
  - [ ] ReadOnlyBadge appears for non-privileged users
  - [ ] Disabled buttons show helpful tooltips
  - [ ] Tooltips mention "Contact admin" where appropriate
  - [ ] No console errors

---

## 🧪 Enhancement 2: E2E Test Suite

**Overall**: Guide complete, implementation pending  
**Time Required**: 2-3 hours

### Setup

- [ ] **Test File Structure** (5 min)
  ```bash
  mkdir -p tests/e2e/{auth,crud,rbac,errors,performance}
  ```

### Authentication Tests (20 min)

- [ ] **Create** `tests/e2e/auth/login.spec.ts`
- [ ] Test successful login
- [ ] Test failed login (wrong password)
- [ ] Test token persistence
- [ ] Test logout
- [ ] Test session timeout

### RBAC Tests (30 min)

- [ ] **Create** `tests/e2e/rbac/permissions.spec.ts`
- [ ] Test admin access (all features)
- [ ] Test approver access (limited)
- [ ] Test regular user access (read-only)
- [ ] Test unauthorized button states
- [ ] Test permission tooltips

### CRUD Tests - Alerts (25 min)

- [ ] **Create** `tests/e2e/crud/alerts.spec.ts`
- [ ] Test create alert rule
- [ ] Test edit alert rule
- [ ] Test delete alert rule
- [ ] Test alert list pagination
- [ ] Test alert search

### CRUD Tests - Changes (25 min)

- [ ] **Create** `tests/e2e/crud/changes.spec.ts`
- [ ] Test create change request
- [ ] Test approve change
- [ ] Test reject change
- [ ] Test implement change
- [ ] Test change history

### CRUD Tests - Workflows (25 min)

- [ ] **Create** `tests/e2e/crud/workflows.spec.ts`
- [ ] Test create workflow
- [ ] Test publish workflow
- [ ] Test execute workflow
- [ ] Test delete workflow
- [ ] Test workflow builder

### Error Handling Tests (20 min)

- [ ] **Create** `tests/e2e/errors/handling.spec.ts`
- [ ] Test API errors (500, 404, 403)
- [ ] Test network errors
- [ ] Test validation errors
- [ ] Test error messages

### Performance Tests (15 min)

- [ ] **Create** `tests/e2e/performance/metrics.spec.ts`
- [ ] Test page load times (< 2s)
- [ ] Test API response times (< 500ms)
- [ ] Test large list rendering

### Execution & CI/CD (20 min)

- [ ] **Run all tests**
  ```bash
  pnpm test:e2e
  ```
- [ ] Verify 80%+ code coverage
- [ ] Add GitHub Actions workflow
- [ ] Configure test parallelization
- [ ] Add test reports

**Guide**: `docs/E2E-TESTING-GUIDE.md` (600 lines, complete examples)

---

## ⚡ Enhancement 3: Real-Time Updates

**Overall**: Guide complete, implementation pending  
**Time Required**: 1-2 hours

### WebSocket Client (15 min)

- [ ] **Create** `apps/unified/src/services/websocket-client.ts`
- [ ] Implement connection management
- [ ] Implement reconnection logic
- [ ] Implement event subscription system
- [ ] Implement room/channel support

### React Hooks (15 min)

- [ ] **Create** `apps/unified/src/hooks/useWebSocket.ts`
- [ ] Implement `useWebSocket(event, handler)`
- [ ] Implement `useWebSocketRoom(room)`
- [ ] Implement `useWebSocketConnection()`

### Notification Center (20 min)

- [ ] **Create** `apps/unified/src/components/common/NotificationCenter.tsx`
- [ ] Implement bell icon with unread count
- [ ] Implement notification panel
- [ ] Add toast notifications for real-time events
- [ ] Add mark as read functionality

### Integration (5 min)

- [ ] Add NotificationCenter to header/navbar
- [ ] Initialize WebSocket connection on app load
- [ ] Update `.env.local` with VITE_WS_URL

### Live Updates - Change Management (15 min)

- [ ] Listen for `change:created` → Add to list
- [ ] Listen for `change:updated` → Update in list
- [ ] Listen for `change:approved` → Update status
- [ ] Listen for `change:deleted` → Remove from list

### Live Updates - Workflow Builder (10 min)

- [ ] Listen for `workflow:created` → Add to list
- [ ] Listen for `workflow:published` → Update status
- [ ] Listen for `workflow:completed` → Show notification

### Live Updates - Alert Management (10 min)

- [ ] Listen for `alert:new` → Show urgent notification
- [ ] Listen for `alert:resolved` → Update status

### Backend Event Emitters (15 min)

- [ ] Update `apps/api/routes/changes.js` → Emit events
- [ ] Update `apps/api/routes/workflows.js` → Emit events
- [ ] Update `apps/api/routes/alerts.js` → Emit events

### Testing & Polish (15 min)

- [ ] Open two browsers side-by-side
- [ ] Test real-time notifications
- [ ] Test live data updates
- [ ] Add connection status indicator

**Guide**: `docs/REALTIME-UPDATES-GUIDE.md` (650 lines, complete implementation)

---

## 📊 Enhancement 4: Performance Monitoring

**Overall**: Guide complete, implementation pending  
**Time Required**: 1 hour

### Sentry Setup (10 min)

- [ ] Create Sentry account at https://sentry.io
- [ ] Create "Nova Universe" project
- [ ] Copy DSN
- [ ] Install dependencies
  ```bash
  pnpm add @sentry/react @sentry/tracing
  ```

### Configuration (10 min)

- [ ] **Create** `apps/unified/src/sentry.ts`
- [ ] Add Sentry init with config
- [ ] Add helper functions (captureError, setSentryUser, etc.)
- [ ] Update `.env.local` with VITE_SENTRY_DSN
- [ ] Set VITE_ENABLE_SENTRY=true

### App Integration (5 min)

- [ ] Update `main.tsx` → Add `initSentry()`
- [ ] Wrap App with `<Sentry.ErrorBoundary>`
- [ ] Add error fallback component

### User Context (5 min)

- [ ] Update AuthContext
- [ ] Call `setSentryUser()` on login
- [ ] Call `clearSentryUser()` on logout

### API Performance Tracking (10 min)

- [ ] Update backend-api-client.ts
- [ ] Wrap API calls with `trackAPICall()`
- [ ] Add error context to failed API calls

### Custom Metrics (10 min)

- [ ] Add breadcrumbs for user actions
- [ ] Track page load performance
- [ ] Track critical user flows

### Testing & Alerts (10 min)

- [ ] Throw test error → Check Sentry dashboard
- [ ] Test API performance tracking
- [ ] Test breadcrumbs
- [ ] Configure error rate alerts
- [ ] Configure performance degradation alerts

**Guide**: `docs/PERFORMANCE-MONITORING-GUIDE.md` (550 lines, complete setup)

---

## 📋 Summary

### Time Estimates

| Enhancement | Status | Time Remaining |
|------------|--------|----------------|
| RBAC UI | 33% Complete | 30-45 min |
| E2E Tests | Documented | 2-3 hours |
| Real-Time Updates | Documented | 1-2 hours |
| Performance Monitoring | Documented | 1 hour |
| **TOTAL** | **8% Complete** | **5-7 hours** |

### Priorities

**HIGH (Do First)**:
1. ✅ Complete RBAC (30-45 min)
2. ✅ Test RBAC (15 min)
3. ✅ Implement E2E Tests (2-3 hours)

**MEDIUM (Do Next)**:
4. ✅ Implement Real-Time Updates (1-2 hours)

**LOW (Nice to Have)**:
5. ✅ Add Performance Monitoring (1 hour)

### Success Criteria

- ✅ All 9 pages RBAC-protected
- ✅ 80%+ E2E test coverage
- ✅ Real-time notifications working
- ✅ Sentry tracking errors and performance
- ✅ Zero security vulnerabilities
- ✅ Production-ready deployment

---

## 🚀 Quick Start (Next Session)

### Option 1: Continue RBAC (Recommended)
```bash
# 1. Open Alert Management Page
code apps/unified/src/pages/admin/AlertManagementPage.tsx

# 2. Follow pattern from RBAC-IMPLEMENTATION-GUIDE.md
# - Add imports
# - Initialize hooks
# - Add ReadOnlyBadge
# - Wrap buttons

# 3. Repeat for 5 remaining pages (30 min total)

# 4. Test (15 min)
# - Fix port conflict
# - Login as different roles
# - Verify RBAC works
```

### Option 2: Start E2E Tests
```bash
# 1. Create test structure
mkdir -p tests/e2e/{auth,crud,rbac,errors,performance}

# 2. Follow E2E-TESTING-GUIDE.md
# 3. Implement tests (2-3 hours)
```

### Option 3: Test What's Done
```bash
# 1. Fix port conflict (2 min)
API_PORT=3001 pnpm --filter @nova-universe/api dev

# 2. Update .env (1 min)
echo "VITE_API_URL=http://localhost:3001" > apps/unified/.env.local

# 3. Start frontend (1 min)
pnpm --filter @nova-universe/unified dev

# 4. Test (10 min)
# - Login as Admin, Approver, Regular User
# - Verify buttons disabled/enabled correctly
# - Check ReadOnlyBadge appears
# - Verify tooltips show
```

---

**Status**: Ready for Next Session  
**Recommendation**: Complete RBAC (Option 1) to finish Enhancement #1 completely before moving on  
**ETA to 100%**: 5-7 hours (over 2-4 days at 2-3 hours/day)
