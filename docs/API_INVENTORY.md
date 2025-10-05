# Nova Universe API Endpoint Inventory

Generated: 2025-10-05T23:17:23.187Z

Total Endpoints: 890
Total Route Files: 89

## Table of Contents

1. [API Endpoints by Category](#api-endpoints-by-category)
2. [Duplicate Endpoints](#duplicate-endpoints)
3. [Consolidation Opportunities](#consolidation-opportunities)
4. [Security Analysis](#security-analysis)
5. [API Versioning](#api-versioning)
6. [Recommendations](#recommendations)

## API Endpoints by Category

### Analytics & Reporting

Total: 27 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /analytics/dashboard | 🔓 No | abTesting.js |
| GET | /analytics | 🔓 No | ai-agent.js |
| GET | /analytics/summary | 🔓 No | ai-agent.js |
| GET | /dashboard | 🔒 Yes | analytics.js |
| GET | /real-time | 🔒 Yes | analytics.js |
| GET | /realtime | 🔒 Yes | analytics.js |
| GET | /executive | 🔒 Yes | analytics.js |
| GET | /analytics | 🔒 Yes | app-switcher.js |
| GET | /analytics/dashboard | 🔓 No | approvals.js |
| POST | /reports/impact-analysis | 🔓 No | cmdb.js |
| GET | /:id/analytics | 🔓 No | costCenters.js |
| GET | /analytics/dashboard | 🔓 No | costCenters.js |
| GET | /analytics/emails | 🔒 Yes | customer-activity.js |
| GET | /analytics/enterprise-metrics | 🔓 No | enterprise-platform.js |
| GET | /analytics/dashboard | 🔓 No | featureFlags.js |
| GET | /admin/analytics | 🔓 No | notifications.js |
| GET | /analytics/dashboard | 🔒 Yes | problems.js |
| GET | /usage | 🔓 No | reports.js |
| GET | /insights | 🔓 No | reports.js |
| GET | /vip-heatmap | 🔓 No | reports.js |

*... and 7 more endpoints*

### Configuration & Settings

Total: 50 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /external-providers/config | 🔓 No | ai-control-tower.js |
| POST | /providers/validate-config | 🔓 No | ai-control-tower.js |
| GET | /config | 🔒 Yes | app-switcher.js |
| PUT | /config | 🔒 Yes | app-switcher.js |
| GET | / | 🔒 Yes | config.js |
| GET | /admin | 🔒 Yes | config.js |
| GET | /:key | 🔒 Yes | config.js |
| PUT | /:key | 🔒 Yes | config.js |
| POST | /organization | 🔒 Yes | config.js |
| GET | /organization | 🔒 Yes | config.js |
| POST | /bulk | 🔒 Yes | config.js |
| POST | /bulk | 🔒 Yes | config.js |
| GET | /:key/history | 🔒 Yes | config.js |
| GET | /schema/validation | 🔒 Yes | config.js |
| GET | /templates | 🔒 Yes | config.js |
| POST | /templates/:id/apply | 🔒 Yes | config.js |
| GET | /categories/all | 🔒 Yes | config.js |
| GET | /categories/messages | 🔓 No | config.js |
| POST | /categories/messages | 🔓 No | config.js |
| GET | /categories/features | 🔒 Yes | config.js |

*... and 30 more endpoints*

### Monitoring & Alerting

Total: 104 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /monitoring/metrics | 🔒 Yes | ai-fabric.js |
| POST | /monitoring/bias | 🔒 Yes | ai-fabric.js |
| GET | /monitoring/compliance | 🔒 Yes | ai-fabric.js |
| POST | /monitoring/explain | 🔒 Yes | ai-fabric.js |
| POST | /create | 🔓 No | alerts.js |
| POST | /:alertId/acknowledge | 🔓 No | alerts.js |
| POST | /:alertId/resolve | 🔓 No | alerts.js |
| POST | /:alertId/escalate | 🔓 No | alerts.js |
| GET | /stats | 🔓 No | alerts.js |
| POST | /escalate/:ticketId | 🔓 No | alerts.js |
| GET | /status/:alertId | 🔓 No | alerts.js |
| GET | /schedules | 🔓 No | alerts.js |
| GET | /schedules/:scheduleId | 🔓 No | alerts.js |
| POST | /rotate/:scheduleId | 🔓 No | alerts.js |
| GET | /services | 🔒 Yes | alerts.js |
| GET | /escalation-policies | 🔓 No | alerts.js |
| POST | /escalation-policies | 🔓 No | alerts.js |
| PUT | /escalation-policies/:id | 🔓 No | alerts.js |
| DELETE | /escalation-policies/:id | 🔓 No | alerts.js |
| GET | /history | 🔓 No | alerts.js |

*... and 84 more endpoints*

### User Management

Total: 36 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | /apps/:appId/assign-users | 🔒 Yes | app-switcher.js |
| DELETE | /support-groups/:id/members/:userId | 🔓 No | cmdbExtended.js |
| PUT | /support-groups/:id/members/:userId | 🔓 No | cmdbExtended.js |
| GET | /users/:userId/permissions | 🔒 Yes | cmdbExtended.js |
| POST | /users/:userId/permissions/check | 🔒 Yes | cmdbExtended.js |
| DELETE | /cis/:ciId/ownership/:ownershipType/:userId | 🔓 No | cmdbExtended.js |
| PUT | /cis/:ciId/ownership/:ownershipType/:userId | 🔓 No | cmdbExtended.js |
| GET | /users/:userId/owned-cis | 🔒 Yes | cmdbExtended.js |
| GET | /config | 🔒 Yes | directory.js |
| PUT | /config | 🔒 Yes | directory.js |
| GET | /search | 🔒 Yes | directory.js |
| POST | /user | 🔒 Yes | directory.js |
| GET | /employee-center/dashboard/:userId | 🔓 No | enterprise-platform.js |
| POST | /admin/sync-users | 🔓 No | goalert-proxy.js |
| GET | /users | 🔓 No | goalert-proxy.js |
| GET | /users/:id/contact-methods | 🔓 No | goalert-proxy.js |
| POST | /users/:id/contact-methods | 🔓 No | goalert-proxy.js |
| GET | /users/:id/notification-rules | 🔓 No | goalert-proxy.js |
| POST | /users/:id/notification-rules | 🔓 No | goalert-proxy.js |
| GET | /user/preferences | 🔒 Yes | goalert-proxy.js |

*... and 16 more endpoints*

### Workflows

Total: 19 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /workflows | 🔒 Yes | approvals.js |
| GET | /workflows/:id | 🔓 No | approvals.js |
| POST | /workflows | 🔒 Yes | approvals.js |
| PUT | /workflows/:id | 🔓 No | approvals.js |
| GET | /instances | 🔒 Yes | approvals.js |
| GET | /instances/:id | 🔓 No | approvals.js |
| POST | /instances/:id/action | 🔓 No | approvals.js |
| POST | /workflows/trigger | 🔓 No | enterprise-platform.js |
| POST | /workflows/:id/execute | 🔓 No | enterprise-platform.js |
| GET | / | 🔒 Yes | workflows.js |
| GET | /templates | 🔒 Yes | workflows.js |
| GET | /status | 🔓 No | workflows.js |
| GET | /:id | 🔒 Yes | workflows.js |
| POST | / | 🔒 Yes | workflows.js |
| PUT | /:id | 🔒 Yes | workflows.js |
| POST | /:id/publish | 🔒 Yes | workflows.js |
| POST | /:id/execute | 🔒 Yes | workflows.js |
| GET | /:id/executions | 🔒 Yes | workflows.js |
| POST | /trigger | 🔓 No | workflows.js |

### Assets & Inventory

Total: 51 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | / | 🔓 No | assets.js |
| POST | / | 🔓 No | assets.js |
| DELETE | /:id | 🔓 No | assets.js |
| GET | /:id/download | 🔓 No | assets.js |
| GET | /:id/url | 🔓 No | assets.js |
| GET | /cis | 🔓 No | cmdb.js |
| GET | /cis/:id | 🔓 No | cmdb.js |
| POST | /cis | 🔓 No | cmdb.js |
| PUT | /cis/:id | 🔓 No | cmdb.js |
| DELETE | /cis/:id | 🔓 No | cmdb.js |
| GET | /ci-types | 🔒 Yes | cmdb.js |
| POST | /ci-types | 🔒 Yes | cmdb.js |
| GET | /cis/:id/relationships | 🔓 No | cmdb.js |
| POST | /relationships | 🔓 No | cmdb.js |
| POST | /discovery/run | 🔒 Yes | cmdb.js |
| GET | /discovery/runs | 🔒 Yes | cmdb.js |
| GET | /business-services | 🔒 Yes | cmdb.js |
| GET | /health | 🔒 Yes | cmdb.js |
| GET | /support-groups | 🔓 No | cmdbExtended.js |
| GET | /support-groups/:id | 🔓 No | cmdbExtended.js |

*... and 31 more endpoints*

### Authentication & Authorization

Total: 35 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | /register | 🔓 No | auth.js |
| POST | /login | 🔓 No | auth.js |
| POST | /logout | 🔓 No | auth.js |
| GET | /me | 🔓 No | auth.js |
| GET | /.well-known/oauth-authorization-server | 🔓 No | mcp-server.js |
| POST | /oauth/register | 🔓 No | mcp-server.js |
| GET | /oauth/authorize | 🔓 No | mcp-server.js |
| POST | /oauth/token | 🔓 No | mcp-server.js |
| POST | /oauth/revoke | 🔓 No | mcp-server.js |
| POST | /auth/generate-code | 🔓 No | nova-tv-prisma.js |
| POST | /auth/verify-code | 🔓 No | nova-tv-prisma.js |
| GET | /auth/status/:sessionId | 🔓 No | nova-tv-prisma.js |
| POST | /auth/generate-code | 🔓 No | nova-tv.js |
| POST | /auth/verify-code | 🔓 No | nova-tv.js |
| GET | /auth/status/:sessionId | 🔓 No | nova-tv.js |
| POST | /auth/refresh | 🔓 No | nova-tv.js |
| GET | /.well-known/oauth-authorization-server | 🔓 No | oauth2.js |
| POST | /register | 🔓 No | oauth2.js |
| GET | /authorize | 🔓 No | oauth2.js |
| POST | /token | 🔓 No | oauth2.js |

*... and 15 more endpoints*

### Nova Beacon (Kiosk Management)

Total: 7 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /config | 🔓 No | beacon.js |
| POST | /ticket | 🔓 No | beacon.js |
| GET | /assets | 🔓 No | beacon.js |
| POST | /activate | 🔓 No | beacon.js |
| POST | /activation-codes | 🔓 No | beacon.js |
| POST | /check-in | 🔓 No | beacon.js |
| POST | /link-asset | 🔒 Yes | beacon.js |

### Service Catalog

Total: 25 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | / | 🔒 Yes | catalogItems.js |
| POST | / | 🔒 Yes | catalogItems.js |
| PUT | /:id | 🔒 Yes | catalogItems.js |
| DELETE | /:id | 🔒 Yes | catalogItems.js |
| GET | / | 🔒 Yes | service-catalog.js |
| GET | /categories | 🔒 Yes | service-catalog.js |
| GET | /popular | 🔒 Yes | service-catalog.js |
| GET | /:id | 🔒 Yes | service-catalog.js |
| POST | / | 🔒 Yes | service-catalog.js |
| PUT | /:id | 🔒 Yes | service-catalog.js |
| DELETE | /:id | 🔒 Yes | service-catalog.js |
| GET | /categories | 🔒 Yes | serviceCatalog.js |
| POST | /categories | 🔒 Yes | serviceCatalog.js |
| PUT | /categories/:id | 🔓 No | serviceCatalog.js |
| GET | /items | 🔒 Yes | serviceCatalog.js |
| GET | /items/:id | 🔒 Yes | serviceCatalog.js |
| POST | /items | 🔒 Yes | serviceCatalog.js |
| PUT | /items/:id | 🔒 Yes | serviceCatalog.js |
| DELETE | /items/:id | 🔒 Yes | serviceCatalog.js |
| GET | / | 🔒 Yes | serviceCatalogRequests.js |

*... and 5 more endpoints*

### RBAC & Permissions

Total: 23 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | /support-groups/:id/permissions | 🔓 No | cmdbExtended.js |
| DELETE | /support-groups/:id/permissions/:resource/:action | 🔓 No | cmdbExtended.js |
| POST | /test-rbac | 🔓 No | nova-rag.js |
| POST | /rbac/policies | 🔓 No | nova-rag.js |
| GET | /rbac/audit-logs | 🔓 No | nova-rag.js |
| GET | /roles | 🔒 Yes | rbac.js |
| GET | /roles/:id | 🔒 Yes | rbac.js |
| POST | /roles | 🔒 Yes | rbac.js |
| PUT | /roles/:id | 🔒 Yes | rbac.js |
| DELETE | /roles/:id | 🔒 Yes | rbac.js |
| GET | /permissions | 🔒 Yes | rbac.js |
| POST | /permissions | 🔒 Yes | rbac.js |
| GET | /groups | 🔒 Yes | rbac.js |
| GET | /groups/:id | 🔒 Yes | rbac.js |
| POST | /groups | 🔒 Yes | rbac.js |
| PUT | /groups/:id | 🔒 Yes | rbac.js |
| GET | / | 🔒 Yes | roles.js |
| POST | / | 🔒 Yes | roles.js |
| PUT | /:id | 🔒 Yes | roles.js |
| DELETE | /:id | 🔒 Yes | roles.js |

*... and 3 more endpoints*

### Ticketing

Total: 61 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /tickets/:ticketId/communications | 🔓 No | customer-activity.js |
| GET | / | 🔒 Yes | enhanced-tickets.js |
| GET | /:id | 🔓 No | enhanced-tickets.js |
| POST | / | 🔒 Yes | enhanced-tickets.js |
| PUT | /:id | 🔓 No | enhanced-tickets.js |
| POST | /:id/assign | 🔓 No | enhanced-tickets.js |
| POST | /:id/comments | 🔓 No | enhanced-tickets.js |
| POST | /:id/watchers | 🔓 No | enhanced-tickets.js |
| POST | /:id/escalate | 🔓 No | enhanced-tickets.js |
| POST | /:id/resolve | 🔓 No | enhanced-tickets.js |
| POST | /:id/close | 🔓 No | enhanced-tickets.js |
| POST | /:id/reopen | 🔓 No | enhanced-tickets.js |
| POST | /:id/links | 🔓 No | enhanced-tickets.js |
| POST | /:id/time-entries | 🔓 No | enhanced-tickets.js |
| GET | /search | 🔓 No | enhanced-tickets.js |
| GET | /stats | 🔓 No | enhanced-tickets.js |
| POST | /bulk | 🔓 No | enhanced-tickets.js |
| GET | /export | 🔓 No | enhanced-tickets.js |
| GET | /templates | 🔒 Yes | enhanced-tickets.js |
| POST | /templates/:id/apply | 🔓 No | enhanced-tickets.js |

*... and 41 more endpoints*

### Notifications

Total: 46 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | /emails/track | 🔓 No | customer-activity.js |
| POST | /emails/schedule | 🔓 No | customer-activity.js |
| DELETE | /emails/schedule/:ticketId | 🔓 No | customer-activity.js |
| GET | /approve | 🔓 No | email-actions.js |
| GET | /deny | 🔓 No | email-actions.js |
| GET | /comment | 🔓 No | email-actions.js |
| GET | /pixel/:trackingId.png | 🔓 No | email-actions.js |
| POST | /webhook/reply | 🔓 No | email-actions.js |
| GET | /accounts | 🔒 Yes | email-integration.js |
| POST | /accounts | 🔒 Yes | email-integration.js |
| PUT | /accounts/:id | 🔓 No | email-integration.js |
| DELETE | /accounts/:id | 🔓 No | email-integration.js |
| POST | /accounts/:id/test | 🔓 No | email-integration.js |
| POST | /send | 🔓 No | email-integration.js |
| GET | /stats | 🔒 Yes | email-integration.js |
| POST | /process | 🔒 Yes | email-integration.js |
| GET | /status | 🔒 Yes | email-integration.js |
| POST | /webhook | 🔓 No | email-integration.js |
| POST | /analyze-email | 🔒 Yes | email-integration.js |
| GET | /templates | 🔒 Yes | email-templates.js |

*... and 26 more endpoints*

### Nova Synth (AI Engine)

Total: 37 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | /test-nova-synth | 🔒 Yes | email-integration.js |
| GET | /nova-synth/stats | 🔒 Yes | email-integration.js |
| POST | /synth-query | 🔓 No | nova-rag.js |
| POST | /conversation/start | 🔓 No | synth-v2.js |
| POST | /conversation/:id/send | 🔓 No | synth-v2.js |
| GET | /conversation/:id | 🔓 No | synth-v2.js |
| DELETE | /conversation/:id | 🔓 No | synth-v2.js |
| POST | /intent/classify | 🔓 No | synth-v2.js |
| POST | /ticket/auto-create | 🔓 No | synth-v2.js |
| POST | /workflow/execute | 🔓 No | synth-v2.js |
| POST | /workflow/custom | 🔓 No | synth-v2.js |
| POST | /gamification/xp | 🔓 No | synth-v2.js |
| GET | /gamification/profile | 🔓 No | synth-v2.js |
| POST | /hook/register | 🔓 No | synth-v2.js |
| POST | /alerts/analyze | 🔓 No | synth-v2.js |
| POST | /hook/trigger | 🔓 No | synth-v2.js |
| POST | /mcp/session | 🔓 No | synth-v2.js |
| POST | /mcp/tool/:name | 🔓 No | synth-v2.js |
| GET | /mcp/session/:id | 🔓 No | synth-v2.js |
| DELETE | /mcp/session/:id | 🔓 No | synth-v2.js |

*... and 17 more endpoints*

### Nova Helix (Identity Engine)

Total: 47 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| POST | /tenant/discover | 🔓 No | helix-universal-login.js |
| POST | /email/verify | 🔓 No | helix-universal-login.js |
| POST | /email/resend | 🔓 No | helix-universal-login.js |
| POST | /authenticate | 🔓 No | helix-universal-login.js |
| POST | /mfa/challenge | 🔓 No | helix-universal-login.js |
| POST | /mfa/verify | 🔓 No | helix-universal-login.js |
| POST | /token/refresh | 🔓 No | helix-universal-login.js |
| POST | /logout | 🔒 Yes | helix-universal-login.js |
| GET | /sso/initiate/:provider | 🔓 No | helix-universal-login.js |
| POST | /sso/callback/:provider | 🔓 No | helix-universal-login.js |
| POST | /register | 🔓 No | helix-universal-login.js |
| POST | /password/forgot | 🔓 No | helix-universal-login.js |
| POST | /password/reset | 🔓 No | helix-universal-login.js |
| POST | /password/change | 🔓 No | helix-universal-login.js |
| GET | /admin/tenant/:tenantId/options | 🔒 Yes | helix-universal-login.js |
| GET | /admin/tenant/:tenantId/sso-configs | 🔓 No | helix-universal-login.js |
| GET | /admin/tenant/:tenantId/sso-configs/saml | 🔓 No | helix-universal-login.js |
| PUT | /admin/tenant/:tenantId/sso-configs/saml | 🔓 No | helix-universal-login.js |
| GET | /admin/tenant/:tenantId/saml/metadata | 🔓 No | helix-universal-login.js |
| PUT | /admin/tenant/:tenantId/options | 🔒 Yes | helix-universal-login.js |

*... and 27 more endpoints*

### Nova Lore (Knowledge Base)

Total: 12 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /articles | 🔒 Yes | lore.js |
| GET | /articles/:kbId | 🔓 No | lore.js |
| POST | /articles | 🔒 Yes | lore.js |
| POST | /articles/:kbId/feedback | 🔓 No | lore.js |
| GET | /search | 🔓 No | lore.js |
| GET | /articles/:articleId/versions | 🔒 Yes | lore.js |
| GET | /articles/:articleId/versions/:versionId | 🔒 Yes | lore.js |
| POST | /articles/:articleId/versions | 🔒 Yes | lore.js |
| GET | /articles/:articleId/comments | 🔒 Yes | lore.js |
| POST | /articles/:articleId/comments | 🔒 Yes | lore.js |
| POST | /lore/query | 🔓 No | synth-v2.js |
| POST | /lore/feedback | 🔓 No | synth-v2.js |

### Nova Orbit (End-User Portal)

Total: 8 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /tickets | 🔓 No | orbit.js |
| POST | /tickets | 🔓 No | orbit.js |
| GET | /tickets/:ticketId | 🔓 No | orbit.js |
| GET | /categories | 🔓 No | orbit.js |
| GET | /catalog | 🔒 Yes | orbit.js |
| POST | /catalog/:id | 🔒 Yes | orbit.js |
| POST | /feedback | 🔓 No | orbit.js |
| GET | /forms/:id | 🔓 No | orbit.js |

### Nova Pulse (Technician Portal)

Total: 25 endpoints

| Method | Path | Auth | File |
|--------|------|------|------|
| GET | /assets | 🔓 No | pulse-inventory.js |
| GET | /assets/:assetId | 🔓 No | pulse-inventory.js |
| POST | /assets/:assetId/tickets | 🔓 No | pulse-inventory.js |
| GET | /assets/:id/tickets | 🔓 No | pulse-inventory.js |
| GET | /warranty-alerts | 🔓 No | pulse-inventory.js |
| POST | /warranty-alerts/:alertId/dismiss | 🔓 No | pulse-inventory.js |
| GET | /kiosk-assets | 🔓 No | pulse-inventory.js |
| POST | /import | 🔓 No | pulse-inventory.js |
| POST | /import/:batchId/rollback | 🔓 No | pulse-inventory.js |
| GET | /dashboard | 🔓 No | pulse.js |
| POST | /tickets | 🔒 Yes | pulse.js |
| GET | /tickets | 🔒 Yes | pulse.js |
| PUT | /tickets/:ticketId/update | 🔓 No | pulse.js |
| POST | /tickets/:ticketId/claim | 🔓 No | pulse.js |
| GET | /timesheet | 🔓 No | pulse.js |
| GET | /alerts | 🔒 Yes | pulse.js |
| GET | /inventory | 🔓 No | pulse.js |
| GET | /tickets/:ticketId/history | 🔓 No | pulse.js |
| GET | /tickets/:ticketId/related | 🔒 Yes | pulse.js |
| GET | /xp | 🔒 Yes | pulse.js |

*... and 5 more endpoints*

## Duplicate Endpoints

⚠️ Found 88 duplicate endpoint registrations:

### GET:/experiments

Registered in:
- abTesting.js
- ml-pipeline.js

### GET:/analytics/dashboard

Registered in:
- abTesting.js
- approvals.js
- costCenters.js
- featureFlags.js
- itsm.js
- problems.js
- serviceCatalogRequests.js
- spaces.js

### POST:/chat

Registered in:
- ai-agent.js
- synth.js

### GET:/sessions

Registered in:
- ai-agent.js
- ai-fabric.js

### POST:/feedback

Registered in:
- ai-agent.js
- orbit.js

### GET:/analytics

Registered in:
- ai-agent.js
- app-switcher.js
- search.js

### GET:/performance

Registered in:
- ai-agent.js
- monitoring.js
- workflow-analytics.js

### GET:/status

Registered in:
- ai-fabric.js
- email-integration.js
- mcp-server.js
- ml-pipeline.js
- scimMonitor.js
- uptime-kuma-websocket.js
- workflows.js

### POST:/process

Registered in:
- ai-fabric.js
- email-integration.js

### GET:/stats

Registered in:
- alerts.js
- email-integration.js
- enhanced-tickets.js
- incidents.js
- nova-rag.js
- tickets.js
- websocket.js

### GET:/schedules

Registered in:
- alerts.js
- goalert-proxy.js

### GET:/services

Registered in:
- alerts.js
- goalert-proxy.js
- unified-monitoring.js

### GET:/escalation-policies

Registered in:
- alerts.js
- goalert-proxy.js
- unified-monitoring.js

### POST:/escalation-policies

Registered in:
- alerts.js
- goalert-proxy.js

### GET:/health

Registered in:
- alerts.js
- cmdb.js
- comms.js
- monitoring.js
- notifications.js
- scimMonitor.js
- server.js
- uptime-kuma-proxy.js
- uptime-kuma-websocket.js

### GET:/dashboard

Registered in:
- analytics.js
- app-switcher.js
- pulse.js
- sla.js
- workflow-analytics.js

### GET:/

Registered in:
- announcements.js
- apiKeys.js
- assets.js
- catalogItems.js
- changes.js
- config.js
- configuration.js
- costCenters.js
- emailAccounts.js
- enhanced-tickets.js
- featureFlags.js
- incidents.js
- integrations.js
- inventory.js
- knowledge-articles.js
- modules.js
- notifications.js
- problems.js
- roles.js
- service-catalog.js
- service-requests.js
- serviceCatalogRequests.js
- spaces.js
- tickets.js
- workflows.js

### POST:/

Registered in:
- apiKeys.js
- assets.js
- catalogItems.js
- changes.js
- costCenters.js
- emailAccounts.js
- enhanced-tickets.js
- featureFlags.js
- incidents.js
- inventory.js
- knowledge-articles.js
- problems.js
- roles.js
- service-catalog.js
- service-requests.js
- serviceCatalogRequests.js
- spaces.js
- tickets.js
- workflows.js

### GET:/config

Registered in:
- app-switcher.js
- beacon.js
- core.js
- directory.js
- organizations.js

### PUT:/config

Registered in:
- app-switcher.js
- directory.js

### GET:/search

Registered in:
- app-switcher.js
- directory.js
- enhanced-tickets.js
- lore.js
- tickets.js

### GET:/categories

Registered in:
- app-switcher.js
- itsm.js
- knowledge-articles.js
- orbit.js
- service-catalog.js
- serviceCatalog.js

### DELETE:/:id

Registered in:
- assets.js
- catalogItems.js
- costCenters.js
- emailAccounts.js
- featureFlags.js
- files.js
- incidents.js
- integrations.js
- inventory.js
- roles.js
- service-catalog.js
- service-requests.js
- serviceCatalogRequests.js
- spaces.js
- tickets.js

### POST:/register

Registered in:
- auth.js
- helix-universal-login.js
- oauth2.js

### POST:/login

Registered in:
- auth.js
- helix.js

### POST:/logout

Registered in:
- auth.js
- helix-universal-login.js

### GET:/assets

Registered in:
- beacon.js
- pulse-inventory.js

### PUT:/:id

Registered in:
- catalogItems.js
- changes.js
- costCenters.js
- emailAccounts.js
- enhanced-tickets.js
- featureFlags.js
- incidents.js
- integrations.js
- inventory.js
- knowledge-articles.js
- problems.js
- roles.js
- service-catalog.js
- service-requests.js
- serviceCatalogRequests.js
- spaces.js
- tickets.js
- workflows.js

### GET:/:id

Registered in:
- changes.js
- costCenters.js
- enhanced-tickets.js
- featureFlags.js
- files.js
- incidents.js
- inventory.js
- knowledge-articles.js
- problems.js
- service-catalog.js
- service-requests.js
- serviceCatalogRequests.js
- spaces.js
- tickets.js
- workflows.js

### POST:/:id/approve

Registered in:
- changes.js
- knowledge-articles.js

### GET:/users/:userId/permissions

Registered in:
- cmdbExtended.js
- rbac.js

### GET:/:key

Registered in:
- config.js
- configuration.js

### PUT:/:key

Registered in:
- config.js
- configuration.js
- modules.js

### POST:/bulk

Registered in:
- config.js
- config.js
- enhanced-tickets.js

### GET:/templates

Registered in:
- config.js
- email-templates.js
- enhanced-tickets.js
- itsm.js
- sla.js
- tickets.js
- workflows.js

### POST:/templates/:id/apply

Registered in:
- config.js
- enhanced-tickets.js
- tickets.js

### GET:/export

Registered in:
- configuration.js
- enhanced-tickets.js
- tickets.js

### POST:/import

Registered in:
- configuration.js
- helpscout.js
- inventory.js
- pulse-inventory.js

### POST:/query

Registered in:
- cosmo.js
- nova-rag.js

### GET:/:id/analytics

Registered in:
- costCenters.js
- workflows.js

### POST:/send

Registered in:
- email-integration.js
- email.js
- notifications.js

### GET:/monitors

Registered in:
- enhanced-monitoring.js
- monitoring.js
- unified-monitoring.js
- uptime-kuma-proxy.js

### POST:/monitors

Registered in:
- enhanced-monitoring.js
- monitoring.js
- unified-monitoring.js
- uptime-kuma-proxy.js

### GET:/tags

Registered in:
- enhanced-monitoring.js
- uptime-kuma-proxy.js

### GET:/status-pages

Registered in:
- enhanced-monitoring.js
- monitoring.js
- uptime-kuma-proxy.js

### POST:/:id/assign

Registered in:
- enhanced-tickets.js
- inventory.js
- tickets.js

### POST:/:id/comments

Registered in:
- enhanced-tickets.js
- tickets.js

### POST:/:id/watchers

Registered in:
- enhanced-tickets.js
- tickets.js

### GET:/admin/health

Registered in:
- goalert-proxy.js
- uptime-kuma-proxy.js

### POST:/services

Registered in:
- goalert-proxy.js
- unified-monitoring.js

### GET:/alerts

Registered in:
- goalert-proxy.js
- monitoring.js
- pulse.js
- unified-monitoring.js

### GET:/heartbeat-monitors

Registered in:
- goalert-proxy.js
- unified-monitoring.js

### POST:/heartbeat-monitors

Registered in:
- goalert-proxy.js
- unified-monitoring.js

### GET:/:id/history

Registered in:
- inventory.js
- tickets.js

### GET:/tickets

Registered in:
- itsm.js
- orbit.js
- pulse.js
- search.js

### POST:/tickets

Registered in:
- itsm.js
- orbit.js
- pulse.js

### GET:/tickets/:ticketId

Registered in:
- itsm.js
- orbit.js

### GET:/.well-known/oauth-authorization-server

Registered in:
- mcp-server.js
- oauth2.js

### GET:/monitors/:id

Registered in:
- monitoring.js
- uptime-kuma-proxy.js

### PATCH:/monitors/:id

Registered in:
- monitoring.js
- uptime-kuma-proxy.js

### POST:/monitors/:id/pause

Registered in:
- monitoring.js
- uptime-kuma-proxy.js

### POST:/monitors/:id/resume

Registered in:
- monitoring.js
- uptime-kuma-proxy.js

### DELETE:/monitors/:id

Registered in:
- monitoring.js
- uptime-kuma-proxy.js

### GET:/notifications

Registered in:
- monitoring.js
- uptime-kuma-proxy.js

### GET:/dashboards

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### GET:/dashboards/:id

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/dashboards

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### PUT:/dashboards/:id

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### DELETE:/dashboards/:id

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/dashboards/:id/duplicate

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### GET:/devices

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### GET:/devices/:id

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/devices/register

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### PUT:/devices/:id

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/devices/:deviceId/assign

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/devices/:deviceId/heartbeat

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/activations/generate

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/activations/verify

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/auth/generate-code

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### POST:/auth/verify-code

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### GET:/auth/status/:sessionId

Registered in:
- nova-tv-prisma.js
- nova-tv.js

### GET:/permissions

Registered in:
- rbac.js
- roles.js

### GET:/insights

Registered in:
- reports.js
- synth.js

### GET:/metrics

Registered in:
- spaces.js
- vip.js

### POST:/conversation/start

Registered in:
- synth-v2.js
- synth.js

### POST:/conversation/:id/send

Registered in:
- synth-v2.js
- synth.js

### GET:/conversation/:id

Registered in:
- synth-v2.js
- synth.js

### DELETE:/conversation/:id

Registered in:
- synth-v2.js
- synth.js

## Consolidation Opportunities

💡 Found 42 potential consolidation opportunities:

### /experiments/*

- **Routes**: 19
- **Files**: 2
- **Files involved**: abTesting.js, ml-pipeline.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /analytics/*

- **Routes**: 17
- **Files**: 15
- **Files involved**: abTesting.js, ai-agent.js, app-switcher.js, approvals.js, costCenters.js, customer-activity.js, enterprise-platform.js, featureFlags.js, itsm.js, monitoring.js, problems.js, search.js, serviceCatalogRequests.js, spaces.js, user360-interactions.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /rag/*

- **Routes**: 5
- **Files**: 2
- **Files involved**: ai-control-tower.js, ai-fabric.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /providers/*

- **Routes**: 4
- **Files**: 2
- **Files involved**: ai-control-tower.js, ai-fabric.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /status/*

- **Routes**: 11
- **Files**: 10
- **Files involved**: ai-fabric.js, alerts.js, email-integration.js, enhanced-monitoring.js, mcp-server.js, ml-pipeline.js, monitoring.js, scimMonitor.js, uptime-kuma-websocket.js, workflows.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /metrics/*

- **Routes**: 4
- **Files**: 3
- **Files involved**: ai-fabric.js, spaces.js, vip.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /stats/*

- **Routes**: 7
- **Files**: 7
- **Files involved**: alerts.js, email-integration.js, enhanced-tickets.js, incidents.js, nova-rag.js, tickets.js, websocket.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /schedules/*

- **Routes**: 7
- **Files**: 2
- **Files involved**: alerts.js, goalert-proxy.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /services/*

- **Routes**: 10
- **Files**: 3
- **Files involved**: alerts.js, goalert-proxy.js, unified-monitoring.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /escalation-policies/*

- **Routes**: 7
- **Files**: 3
- **Files involved**: alerts.js, goalert-proxy.js, unified-monitoring.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /health/*

- **Routes**: 9
- **Files**: 9
- **Files involved**: alerts.js, cmdb.js, comms.js, monitoring.js, notifications.js, scimMonitor.js, server.js, uptime-kuma-proxy.js, uptime-kuma-websocket.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /dashboard/*

- **Routes**: 5
- **Files**: 5
- **Files involved**: analytics.js, app-switcher.js, pulse.js, sla.js, workflow-analytics.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### ///*

- **Routes**: 44
- **Files**: 25
- **Files involved**: announcements.js, apiKeys.js, assets.js, catalogItems.js, changes.js, config.js, configuration.js, costCenters.js, emailAccounts.js, enhanced-tickets.js, featureFlags.js, incidents.js, integrations.js, inventory.js, knowledge-articles.js, modules.js, notifications.js, problems.js, roles.js, service-catalog.js, service-requests.js, serviceCatalogRequests.js, spaces.js, tickets.js, workflows.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /:key/*

- **Routes**: 8
- **Files**: 5
- **Files involved**: apiKeys.js, config.js, configuration.js, integrations.js, modules.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /config/*

- **Routes**: 7
- **Files**: 5
- **Files involved**: app-switcher.js, beacon.js, core.js, directory.js, organizations.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /search/*

- **Routes**: 6
- **Files**: 6
- **Files involved**: app-switcher.js, directory.js, enhanced-tickets.js, itsm.js, lore.js, tickets.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /categories/*

- **Routes**: 19
- **Files**: 7
- **Files involved**: app-switcher.js, config.js, itsm.js, knowledge-articles.js, orbit.js, service-catalog.js, serviceCatalog.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /sso/*

- **Routes**: 7
- **Files**: 3
- **Files involved**: app-switcher.js, helix-universal-login.js, helix.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /workflows/*

- **Routes**: 6
- **Files**: 2
- **Files involved**: approvals.js, enterprise-platform.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /:id/*

- **Routes**: 94
- **Files**: 20
- **Files involved**: assets.js, catalogItems.js, changes.js, costCenters.js, emailAccounts.js, enhanced-tickets.js, featureFlags.js, files.js, incidents.js, integrations.js, inventory.js, knowledge-articles.js, problems.js, roles.js, service-catalog.js, service-requests.js, serviceCatalogRequests.js, spaces.js, tickets.js, workflows.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /assets/*

- **Routes**: 11
- **Files**: 4
- **Files involved**: beacon.js, enterprise-platform.js, pulse-inventory.js, user360.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /cis/*

- **Routes**: 10
- **Files**: 2
- **Files involved**: cmdb.js, cmdbExtended.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /users/*

- **Routes**: 14
- **Files**: 4
- **Files involved**: cmdbExtended.js, goalert-proxy.js, helix.js, rbac.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /admin/*

- **Routes**: 15
- **Files**: 6
- **Files involved**: config.js, goalert-proxy.js, helix-universal-login.js, notifications.js, uptime-kuma-proxy.js, user360-interactions.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /bulk/*

- **Routes**: 4
- **Files**: 3
- **Files involved**: config.js, configuration.js, enhanced-tickets.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /templates/*

- **Routes**: 20
- **Files**: 7
- **Files involved**: config.js, email-templates.js, enhanced-tickets.js, itsm.js, sla.js, tickets.js, workflows.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /import/*

- **Routes**: 5
- **Files**: 4
- **Files involved**: configuration.js, helpscout.js, inventory.js, pulse-inventory.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /customers/*

- **Routes**: 5
- **Files**: 2
- **Files involved**: customer-activity.js, synth.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /tickets/*

- **Routes**: 23
- **Files**: 7
- **Files involved**: customer-activity.js, itsm.js, orbit.js, pulse.js, search.js, synth.js, user360.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /user/*

- **Routes**: 4
- **Files**: 3
- **Files involved**: directory.js, goalert-proxy.js, inventory.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /send/*

- **Routes**: 4
- **Files**: 3
- **Files involved**: email-integration.js, email.js, notifications.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /monitors/*

- **Routes**: 24
- **Files**: 4
- **Files involved**: enhanced-monitoring.js, monitoring.js, unified-monitoring.js, uptime-kuma-proxy.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /status-pages/*

- **Routes**: 5
- **Files**: 4
- **Files involved**: enhanced-monitoring.js, monitoring.js, status.js, uptime-kuma-proxy.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /incidents/*

- **Routes**: 5
- **Files**: 2
- **Files involved**: enterprise-platform.js, monitoring.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /alerts/*

- **Routes**: 8
- **Files**: 5
- **Files involved**: goalert-proxy.js, monitoring.js, pulse.js, synth-v2.js, unified-monitoring.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /heartbeat-monitors/*

- **Routes**: 4
- **Files**: 2
- **Files involved**: goalert-proxy.js, unified-monitoring.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /dashboards/*

- **Routes**: 12
- **Files**: 2
- **Files involved**: nova-tv-prisma.js, nova-tv.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /devices/*

- **Routes**: 12
- **Files**: 2
- **Files involved**: nova-tv-prisma.js, nova-tv.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /activations/*

- **Routes**: 4
- **Files**: 2
- **Files involved**: nova-tv-prisma.js, nova-tv.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /auth/*

- **Routes**: 7
- **Files**: 2
- **Files involved**: nova-tv-prisma.js, nova-tv.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /conversation/*

- **Routes**: 8
- **Files**: 2
- **Files involved**: synth-v2.js, synth.js
- **Recommendation**: Consider consolidating these routes into a single router file.

### /mcp/*

- **Routes**: 5
- **Files**: 2
- **Files involved**: synth-v2.js, synth.js
- **Recommendation**: Consider consolidating these routes into a single router file.

## Security Analysis

- **Protected Endpoints**: 330 (37.1%)
- **Public Endpoints**: 560 (62.9%)

### Public Endpoints Requiring Review

These endpoints do not appear to have authentication:

| Method | Path | File |
|--------|------|------|
| POST | /experiments/:id/start | abTesting.js |
| POST | /experiments/:id/stop | abTesting.js |
| POST | /experiments/:id/complete | abTesting.js |
| GET | /experiments/:id/results | abTesting.js |
| GET | /analytics/dashboard | abTesting.js |
| POST | /chat | ai-agent.js |
| GET | /capabilities | ai-agent.js |
| GET | /channels | ai-agent.js |
| GET | /sessions | ai-agent.js |
| POST | /sessions/:sessionId/close | ai-agent.js |
| POST | /feedback | ai-agent.js |
| GET | /analytics | ai-agent.js |
| GET | /analytics/summary | ai-agent.js |
| POST | /ab-tests | ai-agent.js |
| POST | /ab-tests/:experimentId/start | ai-agent.js |

*... and 545 more*

## API Versioning

- **v1 Endpoints**: 2
- **v2 Endpoints**: 0
- **Unversioned Endpoints**: 888

## Recommendations

### High Priority

1. **Remove Duplicate Registrations**: 88 duplicate endpoints should be consolidated.
2. **Review Public Endpoints**: 560 endpoints (62.9%) lack authentication. Verify this is intentional.
3. **Consolidate Route Files**: 42 groups of related endpoints spread across multiple files could be consolidated.

### Medium Priority

1. **API Versioning**: 888 unversioned endpoints should be migrated to versioned routes.
2. **OpenAPI Specification**: Ensure all endpoints are documented in the OpenAPI spec.
3. **Rate Limiting**: Verify rate limiting is applied consistently across all endpoints.

### Best Practices

1. Use consistent authentication middleware across all protected endpoints
2. Implement comprehensive input validation on all POST/PUT/PATCH endpoints
3. Add security headers (CSP, HSTS, X-Frame-Options) to all responses
4. Document all endpoints with JSDoc comments
5. Write integration tests for all critical endpoints
