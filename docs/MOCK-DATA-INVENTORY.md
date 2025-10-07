# Mock Data Inventory - Nova Universe UI

**Last Updated**: October 6, 2025  
**Purpose**: Comprehensive list of all mock/sample data in the UI that needs backend integration

---

## Executive Summary

This document catalogs all instances of hardcoded mock/sample data in the Nova Universe UI that should be replaced with real API calls.

**Total Files with Mock Data**: 26 files  
**Categories**: Portals (3), Monitoring (5), Directory (1), Knowledge (1), ITSM (5), Analytics (2), AI (4), Automation (3), Other (2)

---

## Phase 6: Portal Pages (HIGH PRIORITY)

### 1. AgentPortalPage.tsx
**Location**: `/apps/unified/src/pages/portals/AgentPortalPage.tsx`

**Mock Data**:
- `queueTickets` (line 120-182) - 5 sample tickets with full details
- `teamMembers` (line 183-217) - 4 team members with status and specializations
- `recentAchievements` (line 218-243) - 4 achievements with points and dates

**Required API Endpoints**:
```typescript
GET /api/v1/agent/queue          // Replace queueTickets
GET /api/v1/team/status          // Replace teamMembers
GET /api/v1/gamification/achievements  // Replace recentAchievements
GET /api/v1/agent/stats          // Real-time metrics
```

**Impact**: Critical - Agent portal is non-functional without real queue data

---

### 2. SelfServicePortalPage.tsx
**Location**: `/apps/unified/src/pages/portals/SelfServicePortalPage.tsx`

**Mock Data**:
- `myTickets` (line 102-134) - 3 sample user tickets
- `popularArticles` (line 135-177) - 4 knowledge base articles with ratings
- `popularServices` (line 178-220) - 4 service catalog items
- `notifications` (line 221-243) - 3 notification messages

**Required API Endpoints**:
```typescript
GET /api/v1/tickets?userId={userId}     // Replace myTickets
GET /api/v1/knowledge/popular           // Replace popularArticles
GET /api/v1/services/popular            // Replace popularServices
GET /api/v1/notifications               // Replace notifications
WS  /ws/chat                            // Live chat WebSocket
```

**Impact**: Critical - End-user portal is non-functional without real ticket/knowledge data

---

### 3. DirectoryManagementPage.tsx
**Location**: `/apps/unified/src/pages/directory/DirectoryManagementPage.tsx`

**Mock Data**:
- `users` (line 117-199) - 5 sample users with full profiles
- `groups` (line 200-237) - 4 sample groups (departments, teams, roles)

**Required API Endpoints**:
```typescript
GET    /api/v1/directory/users          // Replace users list
POST   /api/v1/directory/users          // Create user
PUT    /api/v1/directory/users/:id      // Update user
DELETE /api/v1/directory/users/:id      // Delete user
GET    /api/v1/directory/groups         // Replace groups list
POST   /api/v1/directory/users/bulk-activate   // Bulk activate
POST   /api/v1/directory/users/bulk-suspend    // Bulk suspend
DELETE /api/v1/directory/users/bulk-delete     // Bulk delete
GET    /api/v1/directory/audit          // Activity log
```

**Impact**: High - Directory management requires real user data

---

## Phase 5: Monitoring & Integration Pages

### 4. AlertManagementPage.tsx
**Location**: `/apps/unified/src/pages/monitoring/AlertManagementPage.tsx`

**Mock Data**:
- `alerts` (line 94-264) - 8 sample alerts with various severities and statuses
- `alertRules` (line 265-327) - 6 alert rules with thresholds and notifications

**Required API Endpoints**:
```typescript
GET    /api/v1/alerts                   // Replace alerts list
POST   /api/v1/alerts/acknowledge       // Acknowledge alerts
POST   /api/v1/alerts/resolve           // Resolve alerts
POST   /api/v1/alerts/mute              // Mute alerts
GET    /api/v1/alerts/rules             // Replace alert rules
POST   /api/v1/alerts/rules             // Create rule
PUT    /api/v1/alerts/rules/:id         // Update rule
DELETE /api/v1/alerts/rules/:id         // Delete rule
```

**Impact**: Medium - Alert management functional but shows fake data

---

### 5. WebhookConfigurationPage.tsx
**Location**: `/apps/unified/src/pages/integrations/WebhookConfigurationPage.tsx`

**Mock Data**:
- `webhooks` (line 92-214) - 4 sample webhook configurations
- `recentLogs` (line 215-280) - 6 webhook activity logs

**Required API Endpoints**:
```typescript
GET    /api/v1/webhooks                 // Replace webhooks list
POST   /api/v1/webhooks                 // Create webhook
PUT    /api/v1/webhooks/:id             // Update webhook
DELETE /api/v1/webhooks/:id             // Delete webhook
POST   /api/v1/webhooks/:id/test        // Test webhook
GET    /api/v1/webhooks/:id/logs        // Replace recent logs
```

**Impact**: Medium - Webhook configuration functional but shows fake data

---

### 6. UnifiedMonitoringDashboard.tsx
**Location**: `/apps/unified/src/pages/monitoring/UnifiedMonitoringDashboard.tsx`

**Mock Data**:
- `monitors` (line 40) - Initially empty, fetched from API ✅
- `alerts` (line 41) - Initially empty, fetched from API ✅
- `services` (line 42) - Initially empty, fetched from API ✅
- `onCallAssignments` (line 43) - Initially empty, fetched from API ✅

**Status**: ✅ ALREADY INTEGRATED - Uses real API endpoints

---

### 7. MonitoringPage.tsx
**Location**: `/apps/unified/src/pages/monitoring/MonitoringPage.tsx`

**Mock Data**:
- `monitors` (line 29) - Initially empty, fetched from API
- `metrics` (line 34) - Initially empty, fetched from API

**Required API Endpoints**: Already using `/api/v1/monitoring/services`

**Status**: ⚠️ PARTIAL INTEGRATION - Check if API responses are complete

---

### 8. ServiceStatusPage.tsx
**Location**: `/apps/unified/src/pages/monitoring/ServiceStatusPage.tsx`

**Mock Data**:
- `services` (line 64) - Initially empty, fetched from API
- `metrics` (line 65) - Initially empty, fetched from API
- `incidents` (line 66) - Initially empty, fetched from API
- `maintenance` (line 67) - Initially empty, fetched from API

**Required API Endpoints**: Already using `/api/v1/monitoring/*`

**Status**: ⚠️ PARTIAL INTEGRATION - Verify API responses

---

## Phase 3: ITSM Pages

### 9. EnhancedTicketManagementPage.tsx
**Location**: `/apps/unified/src/pages/itsm/EnhancedTicketManagementPage.tsx`

**Mock Data**:
- `tickets` (line 52) - Initially empty, fetched from API

**Required API Endpoints**: Already using `/api/v1/tickets`

**Status**: ✅ ALREADY INTEGRATED - Uses real API endpoints

---

### 10. ServiceCatalogBrowserPage.tsx
**Location**: `/apps/unified/src/pages/itsm/ServiceCatalogBrowserPage.tsx`

**Mock Data**:
- `items` (line 49) - Initially empty, fetched from API
- `filteredItems` (line 50) - Derived from items

**Required API Endpoints**: Already using `/api/v1/service-catalog/items`

**Status**: ✅ ALREADY INTEGRATED - Uses real API endpoints

---

### 11. AITicketCreationPage.tsx
**Location**: `/apps/unified/src/pages/itsm/AITicketCreationPage.tsx`

**Mock Data**:
- `similarTickets` (line 39) - Set by AI analysis
- `aiSuggestions` (line 40) - Set by AI analysis

**Required API Endpoints**: Already using `/api/v1/ai/cosmo/chat` and ticket creation endpoints

**Status**: ✅ ALREADY INTEGRATED - AI-powered, no static mock data

---

### 12. AppleInspiredTicketsList.tsx
**Location**: `/apps/unified/src/pages/itsm/AppleInspiredTicketsList.tsx`

**Mock Data**:
- `tickets` (line 42) - Initially empty, fetched from API

**Required API Endpoints**: Already using `/api/v1/tickets`

**Status**: ✅ ALREADY INTEGRATED - Uses real API endpoints

---

### 13. AppleInspiredTicketDetail.tsx
**Location**: `/apps/unified/src/pages/itsm/AppleInspiredTicketDetail.tsx`

**Mock Data**:
- `comments` (line 43) - Initially empty, fetched from API

**Required API Endpoints**: Already using `/api/v1/tickets/:id/comments`

**Status**: ✅ ALREADY INTEGRATED - Uses real API endpoints

---

## Phase 7: Knowledge & Workflow Pages

### 14. ArticleEditorPage.tsx
**Location**: `/apps/unified/src/pages/knowledge/ArticleEditorPage.tsx`

**Mock Data**:
- `content` (line 57) - Sample markdown template
- `attachments` (line 74) - Initially empty array

**Required API Endpoints**:
```typescript
GET  /api/v1/knowledge/articles/:id     // Load article for editing
POST /api/v1/knowledge/articles         // Save new article
PUT  /api/v1/knowledge/articles/:id     // Update article
POST /api/v1/knowledge/articles/:id/attachments  // Upload attachments
```

**Impact**: Medium - Editor functional but needs persistence

**Note**: Sample markdown is acceptable as a template, but should load real content when editing existing articles

---

### 15. ChangeManagementPage.tsx
**Location**: `/apps/unified/src/pages/change/ChangeManagementPage.tsx`

**Mock Data**: Sample change requests should be in this file based on Phase 7 docs

**Required API Endpoints**:
```typescript
GET /api/v1/changes                     // Get all change requests
POST /api/v1/changes                    // Create change
PUT /api/v1/changes/:id                 // Update change
POST /api/v1/changes/:id/approve        // Approve change
POST /api/v1/changes/:id/reject         // Reject change
```

**Impact**: Medium - Change management needs real change data

---

### 16. WorkflowBuilderPage.tsx
**Location**: `/apps/unified/src/pages/workflow/WorkflowBuilderPage.tsx`

**Mock Data**: Sample workflows based on Phase 7 docs

**Required API Endpoints**:
```typescript
GET  /api/v1/workflows                  // Get all workflows
POST /api/v1/workflows                  // Create workflow
PUT  /api/v1/workflows/:id              // Update workflow
POST /api/v1/workflows/:id/execute      // Execute workflow
GET  /api/v1/workflows/executions       // Get execution history
```

**Impact**: Medium - Workflow builder needs persistence

---

## Phase 4: Analytics & AI Pages

### 17. ConfigurableDashboardPage.tsx (Phase 4)
**Mock Data**: Likely has sample widgets/layouts

**Required API Endpoints**:
```typescript
GET  /api/v1/dashboards/:id             // Load dashboard config
PUT  /api/v1/dashboards/:id             // Save dashboard config
GET  /api/v1/widgets/data               // Load widget data
```

**Impact**: Medium - Dashboard builder needs persistence

---

### 18. AnalyticsVisualizationPage.tsx (Phase 4)
**Mock Data**: Likely has sample chart data

**Required API Endpoints**:
```typescript
GET /api/v1/analytics/metrics           // Get real metrics data
GET /api/v1/analytics/trends            // Get trend data
```

**Impact**: Medium - Analytics shows fake data

---

## AI & Automation Pages

### 19. AIControlTower.tsx
**Location**: `/apps/unified/src/pages/ai/AIControlTower.tsx`

**Mock Data**:
- `models` (line 88) - Initially empty
- `sessions` (line 89) - Initially empty
- `mcpServers` (line 90) - Initially empty

**Required API Endpoints**:
```typescript
GET /api/v1/ai/models                   // Get AI models
GET /api/v1/ai/sessions                 // Get active sessions
GET /api/v1/ai/mcp/servers              // Get MCP servers
```

**Impact**: Low - Admin feature, needs real AI infrastructure data

---

### 20. AIAssistantPage.tsx
**Location**: `/apps/unified/src/pages/ai/AIAssistantPage.tsx`

**Mock Data**:
- `messages` (line 15) - Sample welcome message

**Status**: ⚠️ Likely uses AI streaming API already

---

### 21. AutomationHubPage.tsx
**Location**: `/apps/unified/src/pages/automation/AutomationHubPage.tsx`

**Mock Data**:
- `rules` (line 58) - Initially empty
- `executions` (line 59) - Initially empty
- `templates` (line 60) - Initially empty

**Required API Endpoints**:
```typescript
GET  /api/v1/automation/rules           // Get automation rules
POST /api/v1/automation/rules           // Create rule
GET  /api/v1/automation/executions      // Get execution history
GET  /api/v1/automation/templates       // Get rule templates
```

**Impact**: Medium - Automation hub needs real rules

---

### 22. MailroomIntegrationPage.tsx
**Location**: `/apps/unified/src/pages/automation/MailroomIntegrationPage.tsx`

**Mock Data**:
- `emails` (line 79) - Initially empty
- `processingRules` (line 80) - Initially empty

**Required API Endpoints**:
```typescript
GET  /api/v1/automation/mailroom/emails      // Get processed emails
GET  /api/v1/automation/mailroom/rules       // Get processing rules
POST /api/v1/automation/mailroom/rules       // Create rule
```

**Impact**: Low - Niche feature

---

## Other Pages

### 23. EnhancedDeepWorkMode.tsx
**Location**: `/apps/unified/src/pages/deepwork/EnhancedDeepWorkMode.tsx`

**Mock Data**:
- `quickNotes` (line 76) - Initially empty
- `aiSuggestions` (line 78) - Initially empty
- `ticketsWorked` (line 81) - Initially empty

**Required API Endpoints**:
```typescript
GET  /api/v1/deepwork/session/:id       // Load deep work session
POST /api/v1/deepwork/notes             // Save quick notes
GET  /api/v1/ai/suggestions             // Get AI suggestions
```

**Impact**: Low - Advanced feature

---

### 24. OfflinePage.tsx
**Location**: `/apps/unified/src/pages/OfflinePage.tsx`

**Mock Data**:
- `cachedData` (line 26) - Initially empty, reads from IndexedDB

**Status**: ✅ FUNCTIONAL - Reads from browser cache (IndexedDB/Service Worker)

---

### 25. Nova TV Pages
**Files**: 
- `/apps/unified/src/pages/nova-tv/builder.tsx` - `contentBlocks`
- `/apps/unified/src/pages/nova-tv/devices.tsx` - `devices`
- `/apps/unified/src/pages/nova-tv/index.tsx` - `dashboards`

**Required API Endpoints**:
```typescript
GET  /api/v1/nova-tv/dashboards         // Get TV dashboards
POST /api/v1/nova-tv/dashboards         // Create dashboard
GET  /api/v1/nova-tv/devices            // Get registered devices
GET  /api/v1/nova-tv/content            // Get content blocks
```

**Impact**: Low - TV feature, separate from core ITSM

---

### 26. Showcase Pages
**Files**:
- `/apps/unified/src/pages/showcase/Phase2ShowcasePage.tsx`
- `/apps/unified/src/pages/showcase/LiquidGlassShowcasePage.tsx`

**Status**: ✅ ACCEPTABLE - These are demo pages for components, mock data is expected

---

## Integration Priority Matrix

### Critical Priority (Must have real data for production)
1. ✅ **AgentPortalPage** - Core agent workflow
2. ✅ **SelfServicePortalPage** - Core end-user workflow
3. **DirectoryManagementPage** - User/group management

### High Priority (Important for full functionality)
4. **AlertManagementPage** - System reliability monitoring
5. **WebhookConfigurationPage** - Integration management
6. **ArticleEditorPage** - Knowledge base content

### Medium Priority (Enhanced features)
7. **ChangeManagementPage** - Change tracking
8. **WorkflowBuilderPage** - Automation
9. **AutomationHubPage** - Rule management
10. **ConfigurableDashboardPage** - Custom dashboards
11. **AnalyticsVisualizationPage** - Reporting

### Low Priority (Advanced/niche features)
12. **AIControlTower** - AI admin
13. **MailroomIntegrationPage** - Email processing
14. **EnhancedDeepWorkMode** - Focus mode
15. **Nova TV Pages** - TV displays

---

## Backend Integration Checklist

### Agent Portal (`/api/v1/agent/*`)
- [ ] `GET /api/v1/agent/queue` - Get agent's ticket queue
- [ ] `GET /api/v1/agent/stats` - Get performance metrics
- [ ] `GET /api/v1/team/status` - Get team member statuses
- [ ] `GET /api/v1/gamification/achievements` - Get achievements

### Self-Service Portal (`/api/v1/*`)
- [ ] `GET /api/v1/tickets?userId={userId}` - Get user's tickets
- [ ] `POST /api/v1/tickets` - Create new ticket
- [ ] `GET /api/v1/knowledge/popular` - Get popular articles
- [ ] `GET /api/v1/services/popular` - Get popular services
- [ ] `GET /api/v1/notifications` - Get user notifications
- [ ] `WS /ws/chat` - Live chat WebSocket

### Directory Management (`/api/v1/directory/*`)
- [ ] `GET /api/v1/directory/users` - List all users
- [ ] `POST /api/v1/directory/users` - Create user
- [ ] `PUT /api/v1/directory/users/:id` - Update user
- [ ] `DELETE /api/v1/directory/users/:id` - Delete user
- [ ] `GET /api/v1/directory/groups` - List all groups
- [ ] `POST /api/v1/directory/users/bulk-activate` - Bulk activate users
- [ ] `POST /api/v1/directory/users/bulk-suspend` - Bulk suspend users
- [ ] `DELETE /api/v1/directory/users/bulk-delete` - Bulk delete users
- [ ] `GET /api/v1/directory/audit` - Get activity log

### Alert Management (`/api/v1/alerts/*`)
- [ ] `GET /api/v1/alerts` - List all alerts
- [ ] `POST /api/v1/alerts/acknowledge` - Acknowledge alerts
- [ ] `POST /api/v1/alerts/resolve` - Resolve alerts
- [ ] `POST /api/v1/alerts/mute` - Mute alerts
- [ ] `GET /api/v1/alerts/rules` - List alert rules
- [ ] `POST /api/v1/alerts/rules` - Create alert rule
- [ ] `PUT /api/v1/alerts/rules/:id` - Update alert rule
- [ ] `DELETE /api/v1/alerts/rules/:id` - Delete alert rule

### Webhook Configuration (`/api/v1/webhooks/*`)
- [ ] `GET /api/v1/webhooks` - List webhooks
- [ ] `POST /api/v1/webhooks` - Create webhook
- [ ] `PUT /api/v1/webhooks/:id` - Update webhook
- [ ] `DELETE /api/v1/webhooks/:id` - Delete webhook
- [ ] `POST /api/v1/webhooks/:id/test` - Test webhook
- [ ] `GET /api/v1/webhooks/:id/logs` - Get webhook logs

### Knowledge Base (`/api/v1/knowledge/*`)
- [ ] `GET /api/v1/knowledge/articles/:id` - Get article
- [ ] `POST /api/v1/knowledge/articles` - Create article
- [ ] `PUT /api/v1/knowledge/articles/:id` - Update article
- [ ] `POST /api/v1/knowledge/articles/:id/attachments` - Upload attachment

### Change Management (`/api/v1/changes/*`)
- [ ] `GET /api/v1/changes` - List changes
- [ ] `POST /api/v1/changes` - Create change
- [ ] `PUT /api/v1/changes/:id` - Update change
- [ ] `POST /api/v1/changes/:id/approve` - Approve change
- [ ] `POST /api/v1/changes/:id/reject` - Reject change

### Workflow Builder (`/api/v1/workflows/*`)
- [ ] `GET /api/v1/workflows` - List workflows
- [ ] `POST /api/v1/workflows` - Create workflow
- [ ] `PUT /api/v1/workflows/:id` - Update workflow
- [ ] `POST /api/v1/workflows/:id/execute` - Execute workflow
- [ ] `GET /api/v1/workflows/executions` - Get execution history

---

## Migration Strategy

### Phase 1: Critical Portal Pages (Week 1)
1. Replace AgentPortalPage mock data with `/api/v1/agent/*` endpoints
2. Replace SelfServicePortalPage mock data with `/api/v1/tickets`, `/api/v1/knowledge`, `/api/v1/services`
3. Implement WebSocket for live chat
4. Test end-to-end workflows

### Phase 2: Admin & Monitoring (Week 2)
1. Replace DirectoryManagementPage mock data with `/api/v1/directory/*` endpoints
2. Replace AlertManagementPage mock data with `/api/v1/alerts/*` endpoints
3. Replace WebhookConfigurationPage mock data with `/api/v1/webhooks/*` endpoints
4. Test bulk operations and filtering

### Phase 3: Content & Workflow (Week 3)
1. Add persistence to ArticleEditorPage with `/api/v1/knowledge/*` endpoints
2. Replace ChangeManagementPage mock data with `/api/v1/changes/*` endpoints
3. Replace WorkflowBuilderPage mock data with `/api/v1/workflows/*` endpoints
4. Test save/load/execute operations

### Phase 4: Analytics & AI (Week 4)
1. Replace ConfigurableDashboardPage mock data
2. Replace AnalyticsVisualizationPage mock data
3. Replace AutomationHubPage mock data
4. Test data refresh and real-time updates

---

## Testing Checklist

### For Each Page After Integration:
- [ ] Verify data loads from API on page mount
- [ ] Verify CRUD operations (Create, Read, Update, Delete) work correctly
- [ ] Verify error handling for API failures
- [ ] Verify loading states while fetching data
- [ ] Verify empty states when no data exists
- [ ] Verify pagination/filtering/sorting with real data
- [ ] Verify real-time updates (WebSocket/polling) if applicable
- [ ] Test with slow network (throttling) to ensure good UX
- [ ] Test with API errors to ensure graceful degradation
- [ ] Verify no console errors or warnings

---

## Conclusion

**Total Integration Points**: 26 pages with mock data  
**Already Integrated**: 6 pages (ITSM, Monitoring)  
**Remaining Work**: 20 pages  
**Critical Priority**: 3 pages (AgentPortal, SelfServicePortal, Directory)  

**Estimated Effort**: 4 weeks (1 week per phase)

The majority of ITSM pages already use real API endpoints. The critical work is integrating the Portal pages (Phase 6) and admin pages (Directory, Alerts, Webhooks).
