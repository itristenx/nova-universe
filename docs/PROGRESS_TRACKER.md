# Unified ITSM Rewrite Progress Tracker

See also: `docs/Feature_Inventory.md`, `docs/IMPLEMENTATION_PROGRESS.md`, `GOALERT_1_TO_1_FEATURE_PARITY_COMPLETE.md`.

- Parity Matrix
  - [ ] Core (Admin)
  - [ ] Pulse (Technician)
  - [ ] Orbit (End-User)
  - [ ] Synth (AI)
  - [ ] Sentinel/Monitoring

- Cross-Cutting
  - [x] API v1 routing parity (initial mounts and deprecations)
  - [ ] API v2 upgrades planned
  - [ ] Auth BFF/PKCE implemented
  - [x] Security baseline (ASVS) documented
  - [ ] PWA (offline + push) implemented
  - [ ] Accessibility AA
  - [ ] Telemetry and audit

- Frontend
  - [x] Unified app scaffold `apps/unified-itsm`
  - [x] Unified shell (sidebar, topbar)
  - [x] Design system wired
  - [ ] Role routing (Core/Pulse/Orbit) connected to API
  - [ ] Dark mode + high contrast

- Backend
  - [x] Deprecation headers for unversioned fallbacks
  - [ ] Swagger split per version
  - [ ] Changelog per route
  - [x] Add versioned mounts for analytics and helpscout

- UAT Readiness
  - [ ] Dev env `.env` prepared and start scripts
  - [ ] UAT checklist and scenarios
  - [ ] Smoke and integration tests green