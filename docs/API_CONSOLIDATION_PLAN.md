# API Endpoint Consolidation Plan

## Overview

Based on the comprehensive API audit, we've identified 107 duplicate endpoint registrations and 46 consolidation opportunities across 926 total endpoints in 94 route files.

## Critical Issues

### 1. Duplicate Endpoint Registrations (107 instances)

These endpoints are registered multiple times, creating confusion and potential inconsistency:

#### High-Impact Duplicates

| Endpoint | Count | Files | Impact | Recommendation |
|----------|-------|-------|--------|----------------|
| `GET /analytics/dashboard` | 8 | abTesting.js, approvals.js, costCenters.js, featureFlags.js, itsm.js, problems.js, serviceCatalogRequests.js, spaces.js | HIGH | Consolidate into single analytics router |
| `GET /health` | 9 | alerts.js, cmdb.js, comms.js, monitoring.js, notifications.js, scimMonitor.js, server.js, uptime-kuma-proxy.js, uptime-kuma-websocket.js | HIGH | Use middleware or single health router |
| `GET /analytics` | 4 | ai-agent.js, app-switcher-enhanced.js, app-switcher.js, search.js | MEDIUM | Create dedicated analytics endpoint |
| `GET /config` | 4 | app-switcher-enhanced.js, app-switcher-old.js, app-switcher.js, config.js | MEDIUM | Use single config router |
| `GET /dashboard` | 6 | analytics.js, app-switcher-enhanced.js, app-switcher-old.js, app-switcher.js, pulse.js, sla.js | MEDIUM | Consolidate dashboard endpoints |

### 2. App Switcher Duplication

Three separate app-switcher files with identical endpoints:
- `app-switcher.js` (16 routes)
- `app-switcher-enhanced.js` (16 routes)
- `app-switcher-old.js` (11 routes)

**Recommendation**: Consolidate to a single `app-switcher.js` with feature flags for different versions.

### 3. Customer Activity Duplication

Two customer activity files:
- `customer-activity.js` (13 routes)
- `customer-activity-clean.js` (9 routes)

**Recommendation**: Merge into single file, remove "-clean" suffix.

### 4. Nova TV Duplication

Two Nova TV route files:
- `nova-tv.js` (20 routes)
- `nova-tv-prisma.js` (17 routes)

**Recommendation**: Use single router with Prisma as the backend.

## Security Concerns

### Authentication Issues

- **62.4% of endpoints (578 out of 926) lack authentication**
- Many critical operations are unprotected:
  - A/B testing experiments can be started/stopped without auth
  - CMDB data accessible without auth
  - Alert escalation without auth
  - User management endpoints without auth

### Recommended Authentication Strategy

1. **Public Endpoints (Keep Unauthenticated)**:
   - `/health` - Health checks
   - `/api/v1/lore/search` - Knowledge base search
   - `/api/v1/lore/articles` - Public KB articles
   - `/scim/v2/*` - SCIM endpoints (use separate SCIM auth)

2. **Protected Endpoints (Add Authentication)**:
   - All `/analytics/*` endpoints
   - All `/dashboard` endpoints
   - All user management endpoints
   - All configuration endpoints
   - All A/B testing endpoints
   - All workflow endpoints
   - All CMDB write operations

## API Versioning Strategy

### Current State
- **v1 Endpoints**: 2 only
- **v2 Endpoints**: 0
- **Unversioned**: 924

### Recommended Migration Plan

#### Phase 1: Core Modules (Immediate)
Move to `/api/v1/`:
- `/api/helix/*` → Already at `/api/v1/helix/*` ✓
- `/api/pulse/*` → Already at `/api/v1/pulse/*` ✓
- `/api/orbit/*` → Already at `/api/v1/orbit/*` ✓
- `/api/lore/*` → Already at `/api/v1/lore/*` ✓
- `/api/synth/*` → Mix of v1 and v2

#### Phase 2: Support Systems (Next Sprint)
- `/api/tickets` → `/api/v1/pulse/tickets` (consolidate with pulse)
- `/api/auth` → `/api/v1/helix/auth` (consolidate with helix)
- `/api/config` → `/api/v1/config`
- `/api/analytics` → `/api/v1/analytics`

#### Phase 3: Advanced Features (Future)
- Service Catalog → `/api/v2/service-catalog`
- User 360 → Already at `/api/v2/user360` ✓
- Monitoring → `/api/v2/monitoring`

## Consolidation Opportunities

### 1. Monitoring & Alerting (104 endpoints across multiple files)

**Current Files**:
- alerts.js (17 routes)
- monitoring.js (28 routes)
- enhanced-monitoring.js (16 routes)
- unified-monitoring.js (15 routes)
- goalert-proxy.js (29 routes)
- uptime-kuma-proxy.js (17 routes)

**Recommendation**: Create modular structure:
```
routes/monitoring/
  ├── index.js (main router)
  ├── alerts.js (alert management)
  ├── services.js (service monitoring)
  ├── incidents.js (incident management)
  └── integrations/
      ├── goalert.js
      └── uptime-kuma.js
```

### 2. Ticketing System (62 endpoints)

**Current Files**:
- tickets.js (25 routes)
- enhanced-tickets.js (19 routes)
- pulse.js (16 routes)
- itsm.js (12 routes)
- incidents.js (6 routes)
- problems.js (6 routes)
- changes.js (6 routes)

**Recommendation**: Consolidate under `/api/v1/pulse/` namespace:
```
routes/pulse/
  ├── index.js (tickets CRUD)
  ├── incidents.js
  ├── problems.js
  ├── changes.js
  └── queues.js
```

### 3. Configuration Management (54 endpoints)

**Current Files**:
- config.js (23 routes)
- configuration.js (8 routes)
- setup.js (10 routes)
- Various per-module configs

**Recommendation**: Single configuration router:
```javascript
// routes/configuration.js
router.get('/', getAllConfig);           // Get all settings
router.get('/:module', getModuleConfig); // Get module-specific
router.put('/:module/:key', updateConfig);
```

## Implementation Plan

### Week 1: Critical Security Fixes
- [ ] Add authentication to all dashboard endpoints
- [ ] Add authentication to all analytics endpoints
- [ ] Add authentication to configuration endpoints
- [ ] Add authentication to user management endpoints

### Week 2: Duplicate Removal
- [ ] Consolidate app-switcher files (remove old/enhanced)
- [ ] Consolidate customer-activity files
- [ ] Consolidate nova-tv files
- [ ] Remove duplicate health check registrations

### Week 3: API Versioning
- [ ] Ensure all core modules use `/api/v1/` prefix
- [ ] Update client code to use versioned endpoints
- [ ] Add deprecation warnings to unversioned endpoints

### Week 4: Route Consolidation
- [ ] Consolidate monitoring routes
- [ ] Consolidate ticketing routes
- [ ] Consolidate configuration routes

### Week 5: Testing & Documentation
- [ ] Update API documentation
- [ ] Update OpenAPI spec
- [ ] Run comprehensive integration tests
- [ ] Update client applications

## Testing Strategy

### 1. Endpoint Inventory Tests
Run `test/api-comprehensive-audit.test.js` to verify:
- All expected endpoints are accessible
- Proper authentication is enforced
- Security headers are present
- Rate limiting is working
- CORS is configured correctly

### 2. Duplicate Detection
```bash
node scripts/generate-api-inventory.js
```
Review `docs/API_INVENTORY.md` for:
- New duplicate registrations
- Unprotected endpoints
- Versioning compliance

### 3. Integration Tests
For each consolidated router:
- Test all CRUD operations
- Test error handling
- Test authentication
- Test rate limiting

## Backward Compatibility

### Legacy Endpoint Support (6 months)

1. **Keep legacy routes active** with deprecation warnings:
```javascript
router.use('/api/tickets', deprecationMiddleware('Use /api/v1/pulse/tickets'), ticketsRouter);
```

2. **Add deprecation headers**:
```javascript
res.set('X-API-Deprecated', 'true');
res.set('X-API-Sunset', '2025-04-01');
res.set('X-API-Replacement', '/api/v1/pulse/tickets');
```

3. **Client migration timeline**:
   - Month 1-2: Warning headers only
   - Month 3-4: Logging deprecation usage
   - Month 5: Return 410 Gone for deprecated endpoints
   - Month 6: Remove legacy routes

## Success Metrics

- **Duplicate Endpoints**: Reduce from 107 to 0
- **Authentication Coverage**: Increase from 37.6% to 85%+
- **Versioned Endpoints**: Increase from 0.2% to 100%
- **Route Files**: Reduce from 94 to ~60 (targeted consolidation)
- **API Consistency Score**: Achieve 95%+ in OpenAPI compliance

## Risk Mitigation

1. **Feature Flags**: Use feature flags for route consolidation
2. **Monitoring**: Track 404s and authentication failures
3. **Rollback Plan**: Keep old route files for 1 sprint
4. **Communication**: Notify all API consumers 2 weeks before changes
5. **Documentation**: Update all docs before deployment

## Approval Required

This plan requires review and approval from:
- [ ] API Team Lead
- [ ] Security Team
- [ ] Client Application Teams
- [ ] DevOps/Infrastructure

---

**Last Updated**: 2025-10-05
**Status**: Draft - Awaiting Review
