# API Changelog (v1)

Status: Stable

- v1 initial stabilization
  - All core routes mounted under `/api/v1/*` (organizations, directory, roles, inventory, cmdb, configuration, modules, logs, vip, websocket, helix, lore, pulse, orbit, synth v1)
  - Non-versioned fallbacks return headers: `Deprecation`, `Sunset`, `Link: rel="successor-version"`, `API-Version`
- Deprecations
  - Unversioned `/api/analytics`, `/api/monitoring`, `/api/helpscout`, `/api/workflows` now emit deprecation headers; use `/api/v1/*` equivalents
- Notes
  - v2 reserved for breaking changes (synth v2, sentinel, goalert proxy, notifications, beacon)