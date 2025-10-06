# API Infrastructure Endpoints - Architecture Decision Record

**Date:** January 2025  
**Status:** APPROVED  
**Decision:** Keep specific infrastructure/meta endpoints unversioned

## Context

During the API V1 (2025.08) standardization project, we needed to decide whether ALL endpoints should be versioned under `/api/v1/*` or if certain infrastructure endpoints should remain unversioned.

## Decision

We have decided to keep the following endpoints **UNVERSIONED** as infrastructure/meta endpoints:

### Infrastructure Endpoints (Unversioned)

1. **`/api/health`** - Health check for load balancers and monitoring
2. **`/health`** - Root-level health check
3. **`/api/version`** - API version discovery and meta information
4. **`/metrics`** - Performance metrics (admin-only)
5. **`/api-docs/*`** - API documentation (Swagger/OpenAPI)

### Versioned Business Endpoints

All business logic and data endpoints are under `/api/v1/*`:

- `/api/v1/auth/*` - Authentication
- `/api/v1/users/*` - User management
- `/api/v1/kiosks/*` - Kiosk management
- `/api/v1/config/*` - Configuration
- `/api/v1/notifications/*` - Notifications
- etc.

## Rationale

### Industry Standards

This approach follows industry best practices from major cloud providers:

**AWS API Gateway:**
```
/health       ← Unversioned (infrastructure)
/metrics      ← Unversioned (infrastructure)
/v1/resources ← Versioned (business logic)
```

**Azure API Management:**
```
/status       ← Unversioned (infrastructure)
/api/v1/*     ← Versioned (business logic)
```

**Google Cloud Endpoints:**
```
/healthz      ← Unversioned (infrastructure)
/v1/*         ← Versioned (business logic)
```

**Kubernetes:**
```
/healthz      ← Unversioned
/readyz       ← Unversioned
/livez        ← Unversioned
/metrics      ← Unversioned
/api/v1/*     ← Versioned
```

### Technical Reasons

1. **Load Balancer Compatibility**
   - Load balancers need stable, predictable health check endpoints
   - These should NEVER change or require version negotiation
   - `/health` and `/api/health` must remain stable for operational tooling

2. **Monitoring & Observability**
   - Monitoring systems (Prometheus, Datadog, etc.) expect `/metrics` at a fixed path
   - Version discovery endpoint (`/api/version`) must be accessible to determine available API versions
   - Cannot have a chicken-and-egg problem where you need to know the version to discover versions

3. **API Discovery**
   - Clients need a stable endpoint to discover which API versions are available
   - `/api/version` serves this meta-information purpose
   - This is conceptually "above" any specific API version

4. **Operational Simplicity**
   - Infrastructure teams don't want to update health check configs when API versions change
   - Kubernetes liveness/readiness probes should point to stable endpoints
   - CI/CD pipelines need predictable health check URLs

5. **Semantic Clarity**
   - Infrastructure endpoints are about the **service itself**, not the business API
   - Versioned endpoints are about the **business domain**
   - Keeping them separate makes this distinction clear

## Examples

### Infrastructure Endpoint (Unversioned)

```bash
# Health check - always available, never changes
curl https://api.example.com/health
# Returns: {"status": "healthy", ...}

# API discovery - tells you which versions exist
curl https://api.example.com/api/version
# Returns: {"current": "v1", "supported": ["v1"], ...}
```

### Business Endpoint (Versioned)

```bash
# Get user data - versioned business logic
curl https://api.example.com/api/v1/users/123
# Returns: {...user data...}

# In the future, if we release V2:
curl https://api.example.com/api/v2/users/123
# Returns: {...user data in new format...}
```

## Non-Functional Requirements

### Health Endpoints

**Purpose:** System health status for automated monitoring  
**Audience:** Load balancers, monitoring systems, DevOps tools  
**Stability:** MUST remain stable - operational dependency  
**Versioning:** None - infrastructure concern  

**Endpoints:**
- `GET /health` - Root health check
- `GET /api/health` - API health check with DB status

**Response Contract (Stable):**
```json
{
  "status": "ok|degraded|down",
  "timestamp": "ISO-8601 date",
  "database": "ready|starting|unavailable",
  "uptime": "human readable",
  "uptimeSeconds": 12345
}
```

### Version Discovery Endpoint

**Purpose:** API version discovery and meta information  
**Audience:** API clients, developers, documentation tools  
**Stability:** MUST remain stable - serves as entry point  
**Versioning:** None - meta/discovery endpoint  

**Endpoint:**
- `GET /api/version`

**Response Contract (Stable):**
```json
{
  "api": {
    "version": "v1 (2025.08)",
    "current": "v1",
    "supported": ["v1"],
    "deprecated": [],
    "removed": ["v2"]
  },
  "versioningStrategy": {
    "type": "URI Path Versioning",
    "basePath": "/api/v1",
    "standard": "Microsoft Azure REST API Guidelines"
  }
}
```

### Metrics Endpoint

**Purpose:** Performance monitoring and observability  
**Audience:** Prometheus, Datadog, monitoring systems  
**Stability:** MUST remain stable for monitoring continuity  
**Versioning:** None - operational/observability concern  

**Endpoint:**
- `GET /metrics` (admin-only)

## Comparison: Infrastructure vs Business Endpoints

| Aspect | Infrastructure Endpoints | Business Endpoints |
|--------|-------------------------|-------------------|
| **Purpose** | Service health, meta info | Business logic, data |
| **Audience** | Ops tools, monitoring | API consumers, apps |
| **Versioning** | None - stable by design | Versioned (`/api/v1/*`) |
| **Breaking Changes** | NEVER allowed | Managed via versioning |
| **Examples** | `/health`, `/metrics` | `/api/v1/users`, `/api/v1/kiosks` |
| **Stability** | Permanent | Can evolve with versions |
| **Auth Required** | Usually no | Usually yes |

## Migration Impact

This decision means:

### ✅ Correct Patterns

```bash
# Infrastructure (unversioned)
GET /health
GET /api/health
GET /api/version
GET /metrics

# Business logic (versioned)
GET /api/v1/users
GET /api/v1/kiosks
POST /api/v1/auth/login
```

### ❌ Incorrect Patterns

```bash
# DON'T version infrastructure endpoints
GET /api/v1/health      # ❌ Wrong
GET /api/v1/version     # ❌ Wrong
GET /api/v1/metrics     # ❌ Wrong

# DON'T use unversioned business endpoints
GET /api/users          # ❌ Wrong (deprecated, removed)
GET /api/kiosks         # ❌ Wrong (deprecated, removed)
```

## Future Considerations

### When we add API V2 (hypothetical future)

Infrastructure endpoints remain stable:
```bash
GET /health              # Same forever
GET /api/version         # Returns: {"supported": ["v1", "v2"], "current": "v2"}
```

Business endpoints get new versions:
```bash
GET /api/v1/users        # Still works (V1 contract)
GET /api/v2/users        # New V2 contract
```

### During Deprecation of V1 (hypothetical future)

Infrastructure endpoints remain stable:
```bash
GET /api/version
# Returns: {
#   "supported": ["v1", "v2"],
#   "deprecated": ["v1"],
#   "sunset": "2026-12-31"
# }
```

## Code Organization

In `/apps/api/index.js`:

```javascript
// ========================================
// Infrastructure & Meta Endpoints
// ========================================
// These are NOT versioned - they are infrastructure/meta endpoints
// following industry standards (AWS, Azure, Google Cloud patterns)

app.get('/health', ...)
app.get('/api/health', ...)
app.get('/api/version', ...)
app.get('/metrics', ...)

// ========================================
// V1 Business Endpoints
// ========================================
// All business logic under /api/v1/*

app.use('/api/v1', v1Router);
```

## Compliance

This approach is compliant with:

- ✅ **Microsoft Azure REST API Guidelines** - Recommends stable infrastructure endpoints
- ✅ **AWS API Gateway Best Practices** - Health checks outside versioned paths
- ✅ **Google Cloud API Design Guide** - Service-level vs API-level endpoints
- ✅ **Kubernetes API Conventions** - `/healthz`, `/readyz` unversioned
- ✅ **OpenAPI 3.0 Specification** - Servers and info separate from versioned paths
- ✅ **RFC 7234 (HTTP Caching)** - Stable resource identifiers for cache efficiency

## Consequences

### Positive

- ✅ Operational tooling remains stable across API versions
- ✅ Clear separation of concerns (infrastructure vs business)
- ✅ Follows industry standards and best practices
- ✅ No breaking changes to monitoring/health checks
- ✅ Easier API discovery for new consumers

### Negative

- ⚠️ Slight inconsistency (some `/api/*` paths unversioned)
- ⚠️ Need to document this pattern clearly
- ⚠️ Developers must understand the distinction

### Mitigation

- 📝 Clear documentation (this ADR)
- 📝 Code comments explaining infrastructure endpoints
- 📝 Updated API documentation with categorization
- 📝 Client SDK documentation highlighting the distinction

## References

- [Microsoft Azure REST API Guidelines - Versioning](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#12-versioning)
- [AWS API Gateway Best Practices](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-known-issues.html)
- [Google Cloud API Design Guide - Versioning](https://cloud.google.com/apis/design/versioning)
- [Kubernetes API Conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md)
- [12-Factor App - Port Binding](https://12factor.net/port-binding)

## Summary

**Decision:** Keep `/health`, `/api/health`, `/api/version`, and `/metrics` as unversioned infrastructure endpoints. Version all business logic endpoints under `/api/v1/*`.

**Rationale:** Follows industry standards, maintains operational stability, and provides clear separation between infrastructure and business concerns.

**Status:** ✅ **APPROVED AND IMPLEMENTED**

---

*Last Updated: January 2025*  
*Author: Development Team*  
*Reviewers: DevOps, API Team*
