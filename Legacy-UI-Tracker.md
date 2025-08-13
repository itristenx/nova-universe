# Legacy UI Feature Tracker

This document enumerates legacy features in Core, Pulse, and Orbit (and their submodules) and maps each to the new Unified ITSM app. Use this to ensure every feature is migrated and legacy UIs are deprecated.

## Legend
- Status: Migrated | Partial | Missing | N/A
- New UI Route: Unified Next.js path under `apps/unified-itsm/app`
- Deprecation: banner present in legacy? Yes/No

---

## Core (Legacy)

- Module Management
  - Legacy: `apps/core/nova-core/src/pages/ModuleManagementPage.{ts,tsx,js}`
  - Functions: Toggle modules, configure modules, health overview
  - New UI Route: `/(shell)/admin/dashboard` (overview), `/(shell)/admin/config`, `/(shell)/admin/status`
  - Status: Migrated (deprecation banner added)
  - Deprecation: Yes

- System Configuration
  - Legacy: `SystemConfigurationPage.{ts,tsx,js}`, `ConfigurationPage.{ts,tsx,js}`, `EmailAccountsPage.{ts,tsx,js}`
  - Functions: Global settings, email accounts
  - New UI Route: `/(shell)/admin/config`, `/(shell)/admin/config/edit`
  - Status: Partial (email account UI pending if required)
  - Deprecation: Pending

- Users/Directories
  - Legacy: `UsersPage.{ts,tsx,js}`, `UserManagementPage.{ts,tsx,js}`, `DirectorySSOConfig.{ts,js}`, `SAMLConfigurationPage.{ts,js}`
  - Functions: User listing, roles, SSO/SAML config
  - New UI Route: `/(shell)/admin/users`, `/(shell)/admin/org`
  - Status: Partial (SSO screens not fully recreated yet)
  - Deprecation: Pending

- Knowledge (Admin side)
  - Legacy: `pages/knowledge/*`
  - Functions: KB CRUD
  - New UI Route: Knowledge consumption exists in portal; admin KB CRUD not yet recreated
  - Status: Missing (admin KB edit)
  - Deprecation: Pending

- Kiosks & Kiosk Activation
  - Legacy: `KiosksPage`, `KioskActivationPage`, `KioskConfigurationModal`
  - New UI Route: Not explicitly migrated
  - Status: Missing
  - Deprecation: Pending

- Integrations (Core)
  - Legacy: `IntegrationsPage.{ts,js}` covering general integrations
  - New UI Route: `/(shell)/admin/integrations` (+ subpages for GoAlert, HelpScout, SCIM)
  - Status: Migrated (expand remaining providers as needed)
  - Deprecation: Pending

- Notifications (Core)
  - Legacy: `NotificationsPage.{ts,js}`
  - New UI Route: `/(shell)/admin/notifications`
  - Status: Migrated
  - Deprecation: Pending

- Analytics/Reports (Core)
  - Legacy: `AnalyticsPage.{ts,js}`
  - New UI Route: `/(shell)/admin/analytics`, `/(shell)/admin/reports`
  - Status: Migrated (improvable visuals)
  - Deprecation: Pending

- SCIM Monitor (Core)
  - Legacy: `SCIMProvisioningMonitorNew.{ts,js}`
  - New UI Route: `/(shell)/admin/integrations/scim`
  - Status: Migrated
  - Deprecation: Pending

- Monitoring (Core)
  - Legacy: `components/monitoring/*`, `SentinelAdminPanel`, `AdminMonitoringDashboard`
  - New UI Route: `/(shell)/admin/status`, `/(shell)/admin/integrations`, `/api/enhanced-monitoring`
  - Status: Partial (dedicated monitors/incidents UI pages recommended)
  - Deprecation: Pending

---

## Pulse (Legacy)

- Dashboard & Queues
  - Legacy: `pages/DashboardPage.tsx`, enhanced dashboards and queue components
  - New UI Route: `/(shell)/technician/my-work`
  - Status: Partial (basic list + chart; advanced widgets pending)
  - Deprecation: Pending

- Tickets: Views/Details/Updates
  - Legacy: Enhanced ticket grids and lifecycle
  - New UI Route: `/(shell)/technician/tickets/[id]`
  - Status: Migrated (SLA badge present, advanced controls pending)
  - Deprecation: Pending

- Knowledge (Tech)
  - Legacy: Knowledge pages
  - New UI Route: `/(shell)/technician/knowledge`
  - Status: Migrated (basic)
  - Deprecation: Pending

- Alerts / On-call
  - Legacy: Alerts pages, Sentinel widgets, GoAlert dashboards
  - New UI Route: `/(shell)/admin/integrations/goalert` (admin surface), pulse tech-facing alerts not added yet
  - Status: Partial (tech alerts screen pending)
  - Deprecation: Pending

- Workflows/Runbooks
  - Legacy: `CommunicationHub`, `AlertWorkflowEngine`, workflow pages
  - New UI Route: `/(shell)/technician/workflows`
  - Status: Partial (run logs, quick actions pending)
  - Deprecation: Pending

- Inventory scan
  - Legacy: various utils
  - New UI Route: `/(shell)/technician/inventory-scan`
  - Status: Migrated (decoder integration pending)
  - Deprecation: Pending

- Notifications (Tech)
  - Legacy: widgets
  - New UI Route: `/(shell)/technician/notifications`
  - Status: Migrated (web push enablement)
  - Deprecation: Pending

---

## Orbit (Legacy)

- Tickets
  - Legacy: `apps/orbit/src/app/tickets/*`
  - New UI Route: `/(shell)/portal/tickets`
  - Status: Migrated (basic form/list)
  - Deprecation: Pending

- Catalog
  - Legacy: `apps/orbit/src/app/catalog/*`
  - New UI Route: `/(shell)/portal/catalog` and `/(shell)/portal/catalog/[id]`
  - Status: Migrated (forms, workflows via RITM)
  - Deprecation: Pending

- Approvals (End-user)
  - Legacy: not fully present
  - New UI Route: `/(shell)/portal/approvals`
  - Status: Migrated
  - Deprecation: N/A

- Knowledge
  - Legacy: `apps/orbit/src/app/knowledge/*`
  - New UI Route: `/(shell)/portal/knowledge/[id]`
  - Status: Migrated (detail), list/search pending
  - Deprecation: Pending

- Status/Announcements
  - Legacy: status pages and banners
  - New UI Route: `/(shell)/admin/status`, portal quick view not added yet
  - Status: Partial (portal quick-view pending)
  - Deprecation: Pending

---

## Migration Tasks (Actionable)

- Core
  - Add deprecation banners to: System Configuration, Users/Directories, Integrations, Notifications, Analytics pages in legacy Core. Status: Missing
  - SSO/SAML admin screens in Unified. Status: Missing
  - Admin KB CRUD screens in Unified. Status: Missing
  - Kiosk management & activation screens in Unified. Status: Missing
  - Dedicated Sentinel pages: Monitors, Incidents with charts in Unified. Status: Partial

- Pulse
  - Technician alerts screen mirroring legacy alert dashboards. Status: Missing
  - Workflow run logs and quick action buttons in Unified. Status: Missing
  - Advanced tech dashboard widgets (queue, productivity). Status: Missing
  - Barcode/QR decoder integration on inventory scan. Status: Missing

- Orbit
  - Knowledge list/search UI in Unified portal. Status: Missing
  - Portal status and announcements quick-view. Status: Missing
  - Expand ticket detail for end-users (comments, updates). Status: Missing

- Cross-cutting
  - Add “Legacy Tracker” link in Unified Admin linking to this document. Status: Missing
  - OpenTelemetry init and ASVS checks in CI. Status: Missing
  - Remove dev fallbacks in prod (verified). Status: Done

---

## Deprecation Plan
- Maintain API deprecation headers (already present for unversioned routes)
- Banners in all legacy Core pages (in progress)
- Orbit/Pulse legacy deprecation banners: add where applicable
- Track completion via this document and remove legacy routes post-UAT