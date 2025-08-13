# Migration Checklist to Unified ITSM

- Data
  - [ ] Confirm Prisma schemas for all modules
  - [ ] Backfill/ETL plan if table shapes change

- Auth
  - [ ] Helix login and universal login flows
  - [ ] SAML/SCIM configs migrated

- Frontend
  - [ ] Route mapping Core→/admin, Pulse→/technician, Orbit→/portal
  - [ ] Shared components migrated to design system
  - [ ] Localization (next-intl) and i18n content

- API
  - [ ] Add v1 mounts for all routers
  - [ ] Mark unversioned fallbacks deprecated
  - [ ] Define v2 breaking changes

- PWA
  - [ ] Manifest, SW, offline caches
  - [ ] Camera/QR for inventory

- Testing
  - [ ] Update e2e and integration tests
  - [ ] Security tests (auth, RBAC, SSRF, rate-limit)