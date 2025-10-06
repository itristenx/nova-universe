# TODO/FIXME/PLACEHOLDER Audit

Generated: 2025-08-10

- Summary: Found at least 892 markers across 254 files.
- Marker types: TODO, FIXME, XXX, HACK, BUG, PENDING, TBD, PLACEHOLDER, CHANGEME, REVISIT, OPTIMIZE, WORKAROUND.

## High-priority items

- apps/api/routes/monitoring.js
  - Verify webhook signatures for `/api/monitoring/events` (implemented now)
  - Whitelist `granularity` in `/api/monitoring/history/:id` (implemented now)
  - Create/Update/Delete corresponding Uptime Kuma monitors
  - Integrate Synth for AI incident summaries and actions; notifications; Orbit banners; recovery notifications
  - Implement service groups in public status endpoint

- apps/api/lib/sentinel-integration.ts
  - Replace health check placeholders; implement monitor/incident lifecycle; ticket creation/resolution

- apps/api/lib/goalert-integration.ts
  - Implement service/schedule creation; alert lifecycle; dependency checks; ticket sync/linking

- apps/api/lib/ai-monitoring.ts
  - Replace random placeholder metrics with statistical fairness/bias tests

- apps/api/lib/mcp-server.ts
  - Replace placeholder tool results and resource content; add output schema validation

- apps/api/lib/ai-fabric.ts
  - Replace placeholder returns; implement subsystems noted as stubs

- apps/api/routes/enhanced-monitoring.js
  - Implement verification email sender

- apps/api/src/controllers/monitoring/notifications.ts
  - Implement notification testing

## Files with markers (index)

See list previously generated; search in repo with ripgrep:

Command:
`rg -n --hidden -S "(?i)\b(TODO|FIXME|XXX|HACK|BUG|PENDING|TBD|PLACEHOLDER|CHANGEME|REVISIT|OPTIMIZE|WORKAROUND)\b"`
