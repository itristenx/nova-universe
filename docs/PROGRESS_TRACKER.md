# Unified ITSM Rewrite Progress Tracker

See also: `docs/Feature_Inventory.md`, `docs/IMPLEMENTATION_PROGRESS.md`, `GOALERT_1_TO_1_FEATURE_PARITY_COMPLETE.md`.

- Parity Matrix
  - [ ] Core (Admin)
  - [ ] Pulse (Technician)
  - [ ] Orbit (End-User)
  - [ ] Synth (AI)
  - [ ] Sentinel/Monitoring

- Cross-Cutting
  - [ ] API v1 routing parity
  - [ ] API v2 upgrades planned
  - [ ] Auth BFF/PKCE implemented
  - [ ] Security baseline (ASVS) validated
  - [ ] PWA (offline + push) implemented
  - [ ] Accessibility AA
  - [ ] Telemetry and audit

- Frontend
  - [ ] Unified shell (sidebar, toolbar, search)
  - [ ] Role routing (Core/Pulse/Orbit)
  - [ ] Design system theme
  - [ ] Dark mode + high contrast

- Backend
  - [x] Deprecation headers for unversioned fallbacks
  - [ ] Swagger split per version
  - [ ] Changelog per route
  - [ ] Add versioned mounts for analytics and helpscout