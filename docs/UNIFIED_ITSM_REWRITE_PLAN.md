# Unified ITSM Rewrite Plan

Status: Draft
Owner: Engineering
Scope: Consolidate Core (admin), Pulse (technician), Orbit (end-user) into a single modular monolith with role-based surfaces. Maintain PWA for technicians. Adopt Apple-inspired design.

## Principles
- Single codebase, role-routed surfaces
- Strict API versioning (URL-based v1/v2, plus Accept header for gradual MVE)
- Security-first (OWASP ASVS 4.0.3 L2+), privacy by design
- Offline-first for mobile technicians, graceful degradation
- Accessibility WCAG 2.2 AA

## Architecture
- Frontend: Next.js 15, App Router, RSC where safe, Edge caching, design system
- Backend: Express API, URL versioning `/api/v1`, `/api/v2`, GraphQL optional
- Auth: BFF + PKCE, session cookies httpOnly; token storage server-side, refresh rotation
- Realtime: WebSocket with JWT on connection + RBAC rooms
- Data: Prisma/PG primary, Elastic optional, Redis cache

## Apple-inspired UI (heavy influence)
- Navigation: macOS/iPadOS-style sidebar + split-view; large title, toolbar, search
- Components: cards, lists, sheets, popovers, contextual menus; dynamic translucency
- Typography: Inter or SF-like alternative for web; SF Symbols-style iconography
- Motion: physics-based transitions, subtle depth
- Theming: light/dark, high-contrast; prefers-color-scheme

## Modules and Feature Parity Checklist

- Admin (Core)
  - [ ] Dashboard (system health, modules, auth stats)
  - [ ] Users & Roles (RBAC, 2FA status)
  - [ ] Organizations/Directory
  - [ ] Assets/Inventory/CMDB
  - [ ] Integrations (GoAlert, Helpscout, SCIM)
  - [ ] Logs/Reports/Analytics
  - [ ] Config/Announcements/Status

- Technician (Pulse)
  - [ ] My Work (assigned tickets, SLAs)
  - [ ] Workflows/Runbooks
  - [ ] Inventory scan (PWA camera, barcode)
  - [ ] Notifications (web push), offline queue
  - [ ] Knowledge lookup (Lore)

- End-User (Orbit)
  - [ ] Service Catalog & Requests
  - [ ] My Tickets & Approvals
  - [ ] Knowledge base search
  - [ ] Announcements/Status

- AI (Synth)
  - [ ] Ticket triage, insights, patterns
  - [ ] Conversation assist, MCP bridge

- Monitoring/Sentinel
  - [ ] Status, alerts, dashboards

## Security Baselines
- ASVS controls: input validation, output encoding, CSRF on state-changing forms
- Session security: SameSite=Lax/Strict, httpOnly, Secure, rotation, IP binding option
- RBAC: route-level and data-level checks; least privilege defaults
- Secrets: externalized; no secrets in code
- Audit: structured logs, audit tables for admin actions
- Supply chain: lockfiles, minimal perms, SCA scanner

## API Versioning Strategy
- Default: URL version `/api/v1/...`, additive changes only
- Breaking changes: `/api/v2/...`; deprecation headers on old routes
- Headers: `Deprecation`, `Sunset`, `Link: rel="successor-version"`, `API-Version`
- Docs: Swagger per version and changelog per route

## PWA
- Manifest, service worker, background sync, offline cache
- iOS specific meta tags; push via Web Push for iOS 17+

## Telemetry
- OpenTelemetry traces; RED metrics per service; audit logs

## Deliverables
- Unified app skeleton under `apps/unified-itsm`
- Versioned API policy enforced middleware
- Design system theme aligning to Apple HIG patterns
- Parity matrix completion tracked in this doc

## Risks & Mitigations
- Scope creep → strict parity first, enhancements after
- Offline complexity → stage features; start with read-through cache
- Security regressions → CI security tests, ASVS checklist gates