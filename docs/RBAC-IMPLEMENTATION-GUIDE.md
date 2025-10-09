# RBAC Implementation Guide - Remaining Pages

**Date**: October 9, 2025  
**Status**: 🔄 IN PROGRESS  
**Estimated Time**: 45-60 minutes

---

## Implementation Progress

### ✅ Completed
- [x] Change Management Page (30% - pattern established)

### 🔄 In Progress
- [ ] Workflow Builder Page
- [ ] Approval Queue Page
- [ ] Alert Management Page
- [ ] Webhook Configuration Page
- [ ] Knowledge Base Page
- [ ] Service Catalog Page
- [ ] User Directory Page
- [ ] Agent Portal

---

## 1. Workflow Builder Page ✅ (In Progress)

**File**: `apps/unified/src/pages/admin/WorkflowBuilderPage.tsx`

### Changes Made ✅

1. **Added imports** (lines 5-7):
```typescript
import { useRoles } from '@hooks/usePermission';
import { AdminOnly, WorkflowAdminOnly } from '@components/common/PermissionGuard';
import { DisabledButton, ReadOnlyBadge } from '@components/common/UnauthorizedTooltip';
```

2. **Added role checks** (lines 73-74):
```typescript
const { isAdmin, isWorkflowAdmin } = useRoles();
const canManageWorkflows = isAdmin || isWorkflowAdmin;
```

3. **Added ReadOnlyBadge** (lines 305-310):
```typescript
{!canManageWorkflows && (
  <ReadOnlyBadge 
    message="You have read-only access to workflows" 
    showContact 
  />
)}
```

4. **Wrapped "New Workflow" button** (lines 321-338):
```typescript
<WorkflowAdminOnly fallback={
  <DisabledButton 
    requiredRole="Workflow Admin"
    tooltip="Only workflow administrators can create workflows"
    showContact
  >
    <PlusIcon />
    New Workflow
  </DisabledButton>
}>
  <button onClick={() => setShowCreateModal(true)}>
    <PlusIcon />
    New Workflow
  </button>
</WorkflowAdminOnly>
```

### TODO - Remaining Actions ⏳

**Publish Button** (line ~528):
```typescript
{workflow.status === 'DRAFT' && (
  <WorkflowAdminOnly>
    <button onClick={(e) => {
      e.stopPropagation();
      handlePublish(workflow.id);
    }}>
      <CheckCircleIcon />
    </button>
  </WorkflowAdminOnly>
)}
```

**Delete Button** (line ~541):
```typescript
<AdminOnly>
  <button onClick={(e) => {
    e.stopPropagation();
    handleDelete(workflow.id);
  }}>
    <TrashIcon />
  </button>
</AdminOnly>
```

**Execute Button** (line ~516):
```typescript
{workflow.status === 'PUBLISHED' && (
  <WorkflowAdminOnly>
    <button onClick={(e) => {
      e.stopPropagation();
      setSelectedWorkflow(workflow);
      setShowExecuteModal(true);
    }}>
      <PlayIcon />
    </button>
  </WorkflowAdminOnly>
)}
```

**Edit Button** (line ~506):
```typescript
<WorkflowAdminOnly>
  <button onClick={(e) => {
    e.stopPropagation();
    // Edit logic
  }}>
    <EditIcon />
  </button>
</WorkflowAdminOnly>
```

---

## 2. Approval Queue Page

**File**: `apps/unified/src/pages/admin/ApprovalQueuePage.tsx`

### Implementation Pattern

**1. Add imports**:
```typescript
import { useRoles } from '@hooks/usePermission';
import { ApproverOnly } from '@components/common/PermissionGuard';
import { DisabledButton, ReadOnlyBadge } from '@components/common/UnauthorizedTooltip';
```

**2. Add role checks**:
```typescript
const { isApprover, isAdmin } = useRoles();
const canApprove = isApprover || isAdmin;
```

**3. Add ReadOnlyBadge**:
```typescript
{!canApprove && (
  <ReadOnlyBadge 
    message="You have read-only access to approvals" 
    showContact 
  />
)}
```

**4. Wrap Approve button**:
```typescript
<ApproverOnly fallback={
  <DisabledButton 
    requiredRole="Approver"
    tooltip="Only approvers can approve requests"
  >
    Approve
  </DisabledButton>
}>
  <button onClick={() => handleApprove(item.id)}>
    Approve
  </button>
</ApproverOnly>
```

**5. Wrap Reject button**:
```typescript
<ApproverOnly fallback={
  <DisabledButton 
    requiredRole="Approver"
    tooltip="Only approvers can reject requests"
  >
    Reject
  </DisabledButton>
}>
  <button onClick={() => handleReject(item.id)}>
    Reject
  </button>
</ApproverOnly>
```

**6. Wrap Assign button** (if exists):
```typescript
<ApproverOnly>
  <button onClick={() => handleAssign(item.id)}>
    Assign to Me
  </button>
</ApproverOnly>
```

---

## 3. Alert Management Page

**File**: `apps/unified/src/pages/admin/AlertManagementPage.tsx`

### Implementation Pattern

**1. Add imports**:
```typescript
import { useRoles } from '@hooks/usePermission';
import { AdminOnly } from '@components/common/PermissionGuard';
import { DisabledButton, ReadOnlyBadge } from '@components/common/UnauthorizedTooltip';
```

**2. Add role checks**:
```typescript
const { isAdmin } = useRoles();
```

**3. Add ReadOnlyBadge**:
```typescript
{!isAdmin && (
  <ReadOnlyBadge 
    message="You have read-only access to alert management" 
    showContact 
  />
)}
```

**4. Wrap "Create Rule" button**:
```typescript
<AdminOnly fallback={
  <DisabledButton 
    requiredRole="Admin"
    tooltip="Only admins can create alert rules"
  >
    Create Rule
  </DisabledButton>
}>
  <button onClick={() => setShowCreateRuleModal(true)}>
    Create Rule
  </button>
</AdminOnly>
```

**5. Wrap Delete button**:
```typescript
<AdminOnly>
  <button onClick={() => handleDeleteRule(rule.id)}>
    <TrashIcon />
  </button>
</AdminOnly>
```

**6. Acknowledge/Resolve** (Allow all authenticated users):
```typescript
// These can stay unwrapped - all users can acknowledge/resolve alerts
<button onClick={() => handleAcknowledge(alert.id)}>
  Acknowledge
</button>
```

---

## 4. Webhook Configuration Page

**File**: `apps/unified/src/pages/admin/WebhookConfigurationPage.tsx`

### Implementation Pattern

**1. Add imports**:
```typescript
import { useRoles } from '@hooks/usePermission';
import { AdminOnly } from '@components/common/PermissionGuard';
import { DisabledButton, ReadOnlyBadge } from '@components/common/UnauthorizedTooltip';
```

**2. Add role checks**:
```typescript
const { isAdmin } = useRoles();
```

**3. Add ReadOnlyBadge**:
```typescript
{!isAdmin && (
  <ReadOnlyBadge 
    message="You have read-only access to webhook configuration" 
    showContact 
  />
)}
```

**4. Wrap "New Webhook" button**:
```typescript
<AdminOnly fallback={
  <DisabledButton 
    requiredRole="Admin"
    tooltip="Only admins can create webhooks"
  >
    New Webhook
  </DisabledButton>
}>
  <button onClick={() => setShowCreateModal(true)}>
    New Webhook
  </button>
</AdminOnly>
```

**5. Wrap Edit button**:
```typescript
<AdminOnly>
  <button onClick={() => handleEdit(webhook.id)}>
    <EditIcon />
  </button>
</AdminOnly>
```

**6. Wrap Delete button**:
```typescript
<AdminOnly>
  <button onClick={() => handleDelete(webhook.id)}>
    <TrashIcon />
  </button>
</AdminOnly>
```

**7. Test button** (Allow all users to test):
```typescript
// Test can stay unwrapped - useful for all users
<button onClick={() => handleTest(webhook.id)}>
  Test
</button>
```

---

## 5. Knowledge Base Page

**File**: `apps/unified/src/pages/knowledge/KnowledgeBasePage.tsx`

### Implementation Pattern

**1. Add imports**:
```typescript
import { useRoles } from '@hooks/usePermission';
import { AdminOnly } from '@components/common/PermissionGuard';
import { DisabledButton } from '@components/common/UnauthorizedTooltip';
```

**2. Add role checks**:
```typescript
const { isAdmin } = useRoles();
```

**3. Wrap "Suggest Article" button** (if exists):
```typescript
// This can remain accessible to all users - it's a suggestion
<button onClick={() => setShowSuggestModal(true)}>
  Suggest Article
</button>
```

**4. Add admin-only features** (if implementing):
```typescript
<AdminOnly>
  <button onClick={() => setShowCreateArticleModal(true)}>
    Create Article
  </button>
</AdminOnly>

<AdminOnly>
  <button onClick={() => handlePublish(article.id)}>
    Publish
  </button>
</AdminOnly>

<AdminOnly>
  <button onClick={() => handleDelete(article.id)}>
    Delete
  </button>
</AdminOnly>
```

---

## 6. Service Catalog Page

**File**: `apps/unified/src/pages/services/ServiceCatalogPage.tsx`

### Implementation Pattern

**1. Add imports**:
```typescript
import { useRoles } from '@hooks/usePermission';
import { AdminOnly, CatalogAdminOnly } from '@components/common/PermissionGuard';
import { DisabledButton } from '@components/common/UnauthorizedTooltip';
```

**2. Add role checks**:
```typescript
const { isAdmin, isCatalogAdmin } = useRoles();
const canManageCatalog = isAdmin || isCatalogAdmin;
```

**3. Add admin-only features** (if implementing):
```typescript
<CatalogAdminOnly fallback={
  <DisabledButton 
    requiredRole="Catalog Admin"
    tooltip="Only catalog administrators can create services"
  >
    Add Service
  </DisabledButton>
}>
  <button onClick={() => setShowCreateServiceModal(true)}>
    Add Service
  </button>
</CatalogAdminOnly>

<CatalogAdminOnly>
  <button onClick={() => handleEdit(service.id)}>
    Edit
  </button>
</CatalogAdminOnly>

<AdminOnly>
  <button onClick={() => handleDelete(service.id)}>
    Delete
  </button>
</AdminOnly>
```

---

## 7. User Directory Page

**File**: `apps/unified/src/pages/directory/DirectoryManagementPage.tsx`

### Implementation Pattern

**1. Add imports**:
```typescript
import { useRoles } from '@hooks/usePermission';
import { AdminOnly } from '@components/common/PermissionGuard';
import { DisabledButton, ReadOnlyBadge } from '@components/common/UnauthorizedTooltip';
```

**2. Add role checks**:
```typescript
const { isAdmin } = useRoles();
```

**3. Add ReadOnlyBadge**:
```typescript
{!isAdmin && (
  <ReadOnlyBadge 
    message="You have read-only access to the directory" 
    showContact 
  />
)}
```

**4. Wrap "Add User" button** (if exists):
```typescript
<AdminOnly fallback={
  <DisabledButton 
    requiredRole="Admin"
    tooltip="Only admins can create users"
  >
    Add User
  </DisabledButton>
}>
  <button onClick={() => setShowCreateUserModal(true)}>
    Add User
  </button>
</AdminOnly>
```

**5. Wrap Edit button**:
```typescript
<AdminOnly>
  <button onClick={() => handleEdit(user.id)}>
    Edit
  </button>
</AdminOnly>
```

**6. Wrap Delete button**:
```typescript
<AdminOnly>
  <button onClick={() => handleDelete(user.id)}>
    Delete
  </button>
</AdminOnly>
```

---

## 8. Agent Portal

**File**: `apps/unified/src/pages/queue/EnhancedQueueManagement.tsx`

### Implementation Pattern

**1. Add imports**:
```typescript
import { useRoles } from '@hooks/usePermission';
```

**2. Add role checks**:
```typescript
const { isAgent, isAdmin } = useRoles();
const canManageTickets = isAgent || isAdmin;
```

**3. Conditional features**:
```typescript
{canManageTickets && (
  <button onClick={() => handleAssignToMe(ticket.id)}>
    Assign to Me
  </button>
)}

{canManageTickets && (
  <button onClick={() => handleResolve(ticket.id)}>
    Resolve
  </button>
)}
```

---

## Testing Checklist

After implementing RBAC on all pages:

### Test as Admin User
- [ ] Can access all features
- [ ] Can create, edit, delete on all pages
- [ ] No disabled buttons
- [ ] No read-only badges

### Test as Approver User
- [ ] Can approve/reject on Approval Queue
- [ ] Cannot create workflows
- [ ] Cannot create alerts/webhooks
- [ ] Sees read-only badges on admin pages
- [ ] Sees disabled buttons with tooltips

### Test as Regular User
- [ ] Read-only view on most pages
- [ ] Can view knowledge base and service catalog
- [ ] Cannot perform any admin actions
- [ ] Sees read-only badges everywhere
- [ ] All admin buttons disabled with helpful tooltips

### Test as Workflow Admin
- [ ] Can manage workflows
- [ ] Cannot access other admin features
- [ ] Sees appropriate permissions

### Test as Catalog Admin
- [ ] Can manage service catalog
- [ ] Cannot access other admin features
- [ ] Sees appropriate permissions

---

## Implementation Time Estimates

| Page | Estimated Time | Status |
|------|---------------|--------|
| Workflow Builder | 10 min | 🔄 50% |
| Approval Queue | 5 min | ⏳ TODO |
| Alert Management | 7 min | ⏳ TODO |
| Webhook Configuration | 7 min | ⏳ TODO |
| Knowledge Base | 3 min | ⏳ TODO |
| Service Catalog | 5 min | ⏳ TODO |
| User Directory | 7 min | ⏳ TODO |
| Agent Portal | 3 min | ⏳ TODO |
| **Total** | **47 min** | **10% Complete** |

---

## Next Steps

1. ✅ Complete Workflow Builder Page (5 min remaining)
2. ⏳ Implement Approval Queue Page (5 min)
3. ⏳ Implement Alert Management Page (7 min)
4. ⏳ Implement Webhook Configuration Page (7 min)
5. ⏳ Implement Knowledge Base Page (3 min)
6. ⏳ Implement Service Catalog Page (5 min)
7. ⏳ Implement User Directory Page (7 min)
8. ⏳ Implement Agent Portal (3 min)
9. ⏳ Test with different user roles (15 min)
10. ⏳ Update documentation (5 min)

---

**Status**: 🔄 IN PROGRESS (10%)  
**Next**: Complete Workflow Builder, then move to Approval Queue
