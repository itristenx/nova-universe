# API Versioning Strategy

## Overview

Nova Universe API follows semantic versioning with clear migration paths and deprecation policies to ensure stability while allowing innovation.

## Versioning Scheme

### Current Versions

| Version | Status | Sunset Date | Description |
|---------|--------|-------------|-------------|
| **v2** | ✅ Stable | N/A | Current stable version with latest features |
| **v1** | ⚠️ Deprecated | 2024-12-31 | Legacy version, security fixes only |
| **Unversioned** | ⚠️ Legacy | 2025-06-30 | Backward compatibility, will be removed |

### Version Format

All versioned endpoints follow the pattern:

```
/api/{version}/{module}/{resource}
```

Examples:
- `/api/v2/pulse/tickets` - v2 Pulse module, tickets resource
- `/api/v2/helix/users` - v2 Helix module, users resource
- `/api/v1/orbit/requests` - v1 Orbit module (deprecated)

## API Version Headers

### Response Headers

All API responses include version information:

#### v2 (Current)
```http
X-API-Version: v2
X-API-Status: stable
Cache-Control: public, max-age=300
X-Rate-Limit-Policy: https://docs.nova-universe.com/api/rate-limits
```

#### v1 (Deprecated)
```http
X-API-Version: v1
Deprecation: true
Sunset: 2024-12-31T23:59:59Z
Link: </api/v2>; rel="successor-version"; type="application/json"
Warning: 299 "This API version is deprecated. Please migrate to v2. See https://docs.nova-universe.com/api/migration"
X-API-Deprecation-Notice: This version will be sunset on 2024-12-31. Please upgrade to v2.
```

#### Unversioned (Legacy)
```http
X-API-Version: unversioned-legacy
Deprecation: true
Sunset: 2025-06-30T23:59:59Z
Warning: 299 "Unversioned API routes are deprecated. Please use /api/v2/* endpoints."
X-API-Deprecation-Notice: Unversioned routes will be removed on 2025-06-30. Please migrate to /api/v2/*.
```

## Module Organization

### Nova Modules

The API is organized into logical modules:

#### Core Modules (v2)

1. **Helix** (`/api/v1/helix`) - Identity & Authentication Engine
   - User management
   - SSO/SAML authentication
   - Session management
   - Audit logs

2. **Pulse** (`/api/v1/pulse`) - Technician Portal
   - Ticket management
   - Queue management
   - Time tracking
   - Dashboard analytics

3. **Orbit** (`/api/v1/orbit`) - End-User Portal
   - Ticket submission
   - Request catalog
   - Self-service portal
   - Ticket status tracking

4. **Lore** (`/api/v1/lore`) - Knowledge Base
   - Article management
   - Search functionality
   - Feedback system
   - Related articles

5. **Synth** (`/api/v2/synth`) - AI Engine
   - AI classification
   - Automated responses
   - Pattern detection
   - Workflow recommendations

6. **Beacon** (`/api/v2/beacon`) - Kiosk Management
   - Kiosk registration
   - Status monitoring
   - Configuration management
   - Analytics

#### Supporting Modules

7. **User360** (`/api/v2/user360`) - User Profile & Analytics
   - User profiles
   - Interaction history
   - Activity tracking
   - Engagement metrics

8. **Notifications** (`/api/v2/notifications`) - Universal Notification Platform
   - Multi-channel notifications
   - Notification templates
   - Delivery tracking
   - Preference management

9. **Alerts** (`/api/v2/alerts`) - Unified Alerting
   - Alert management
   - Escalation policies
   - Alert history
   - Integration with monitoring

## Route Structure

### Current Route Organization

```
/api/v2/
├── helix/              # Identity Engine
├── pulse/              # Technician Portal
├── orbit/              # End-User Portal
├── lore/               # Knowledge Base
├── synth/              # AI Engine
├── beacon/             # Kiosk Management (v2)
├── user360/            # User Analytics
├── notifications/      # Notification Platform
├── alerts/             # Alert Management
├── monitoring/         # Monitoring & Observability
└── mcp/                # Model Context Protocol

/api/v1/
├── helix/              # Legacy Identity
├── pulse/              # Legacy Technician Portal
├── orbit/              # Legacy End-User Portal
├── lore/               # Legacy Knowledge Base
├── synth/              # Legacy AI (v1)
├── kiosks/             # Legacy Kiosk Management
├── tickets/            # Legacy Tickets
├── auth/               # Legacy Authentication
├── assets/             # Asset Management
├── inventory/          # Inventory Management
├── cmdb/               # Configuration Management DB
│   └── extended/       # Extended CMDB features
├── vip/                # VIP Management
├── workflows/          # Workflow Automation
├── analytics/          # Analytics & Reporting
└── monitoring/         # Legacy Monitoring

/api/ (unversioned - deprecated)
├── auth                # ⚠️ Use /api/v2/helix instead
├── tickets             # ⚠️ Use /api/v2/pulse/tickets instead
├── kiosks              # ⚠️ Use /api/v2/beacon instead
├── catalog-items       # ⚠️ Use /api/v1/catalog-items (then v2)
├── reports             # ⚠️ Use /api/v1/reports (then v2)
└── ...                 # Other legacy routes
```

## Migration Guide

### Migration Timeline

| Date | Action | Affected Versions |
|------|--------|-------------------|
| 2024-01-01 | v1 marked as deprecated | v1 |
| 2024-06-01 | v1 deprecation warnings enabled | v1 |
| 2024-09-01 | v1 migration deadline notice | v1 |
| 2024-12-31 | v1 sunset (read-only) | v1 |
| 2025-03-31 | v1 completely removed | v1 |
| 2025-06-30 | Unversioned routes removed | Unversioned |

### Migration Steps

#### Step 1: Inventory Current API Usage

```bash
# Check API version usage in your logs
grep "X-API-Version" /var/log/api/access.log | sort | uniq -c

# Check for deprecation warnings
grep "Deprecation: true" /var/log/api/access.log
```

#### Step 2: Update API Endpoints

**Before (v1 or unversioned):**
```javascript
// Unversioned (legacy)
GET /api/tickets

// v1 (deprecated)
GET /api/v1/tickets
POST /api/v1/tickets
```

**After (v2):**
```javascript
// v2 (current)
GET /api/v2/pulse/tickets
POST /api/v2/pulse/tickets
```

#### Step 3: Update Authentication

v2 uses enhanced JWT with additional security:

```javascript
// v1
Authorization: Bearer <token>

// v2 (same format, but with additional validation)
Authorization: Bearer <token>
// May include IP verification if STRICT_IP_VERIFICATION=true
```

#### Step 4: Update Response Parsing

v2 uses consistent response format:

```javascript
// v2 Success Response
{
  "success": true,
  "data": { ... },
  "pagination": { ... },  // For paginated responses
  "meta": { ... }         // Additional metadata
}

// v2 Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [ ... ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

#### Step 5: Test & Deploy

1. Test in development environment
2. Update staging environment
3. Monitor for errors
4. Deploy to production
5. Monitor API metrics

## Version Compatibility

### Breaking Changes

Breaking changes require a new major version (v1 → v2):

- Removing endpoints
- Changing request/response format
- Changing authentication mechanism
- Removing required fields
- Changing error codes

### Non-Breaking Changes

Non-breaking changes can be added to existing versions:

- Adding new endpoints
- Adding optional parameters
- Adding new response fields
- Deprecating (but not removing) features
- Performance improvements
- Bug fixes

## Deprecation Policy

### Deprecation Process

1. **Announcement** (T-12 months)
   - Announce deprecation in release notes
   - Update API documentation
   - Add deprecation headers

2. **Warning Period** (T-6 months)
   - Deprecation warnings in all responses
   - Email notifications to API consumers
   - Blog posts and announcements

3. **Migration Deadline** (T-3 months)
   - Final migration deadline announced
   - Migration support available
   - Automated migration tools provided

4. **Sunset** (T-0)
   - Version becomes read-only
   - Write operations return 410 Gone
   - Redirects to new version where possible

5. **Removal** (T+3 months)
   - Version completely removed
   - Returns 404 Not Found

### Deprecation Timeline Example

```
Jan 2024: v1 deprecated
  ├─ Deprecation headers added
  ├─ Documentation updated
  └─ Migration guide published

Jun 2024: Warning period
  ├─ Email notifications sent
  ├─ Blog post published
  └─ Migration support available

Sep 2024: Migration deadline
  ├─ Final notice sent
  ├─ Automated migration tools released
  └─ Office hours scheduled

Dec 2024: Sunset
  ├─ v1 becomes read-only
  ├─ Write operations disabled
  └─ Redirects to v2 enabled

Mar 2025: Removal
  ├─ v1 completely removed
  └─ 404 for all v1 endpoints
```

## API Client Updates

### Detecting Version Support

Check if your API client needs updates:

```bash
curl -I https://api.nova-universe.com/api/tickets

# Look for these headers:
# Deprecation: true
# Sunset: 2025-06-30T23:59:59Z
# X-API-Deprecation-Notice: ...
```

### Handling Deprecation in Code

```javascript
// JavaScript example
async function makeApiRequest(endpoint) {
  const response = await fetch(endpoint);
  
  // Check for deprecation
  if (response.headers.get('Deprecation') === 'true') {
    const sunset = response.headers.get('Sunset');
    const successor = response.headers.get('Link');
    
    console.warn(`API endpoint ${endpoint} is deprecated`);
    console.warn(`Sunset date: ${sunset}`);
    console.warn(`Migrate to: ${successor}`);
    
    // Log to monitoring system
    logDeprecationWarning(endpoint, sunset, successor);
  }
  
  return response.json();
}
```

## Versioning Best Practices

### For API Consumers

1. **Always specify version** in your requests
2. **Monitor deprecation headers** in responses
3. **Subscribe to API changelog** for updates
4. **Test against new versions** before sunset
5. **Use semantic versioning** for your client libraries

### For API Developers

1. **Never break backward compatibility** within a version
2. **Document all changes** in changelog
3. **Provide migration path** for breaking changes
4. **Test backward compatibility** in CI/CD
5. **Version client SDKs** alongside API

## SDK Version Mapping

| API Version | Node.js SDK | Python SDK | Go SDK |
|-------------|-------------|------------|--------|
| v2 | 2.x.x | 2.x.x | v2.x.x |
| v1 | 1.x.x | 1.x.x | v1.x.x |

## Support Policy

| Version | Support Level | Updates |
|---------|---------------|---------|
| v2 | Full support | Features + bug fixes + security |
| v1 | Limited support | Security fixes only |
| Unversioned | No support | None |

## Frequently Asked Questions

### Q: Can I use multiple API versions simultaneously?

**A:** Yes, but it's not recommended. Each version has its own authentication context, so you'll need separate tokens for v1 and v2.

### Q: What happens if I don't migrate before sunset?

**A:** After sunset, the API version becomes read-only. Write operations will return `410 Gone`. After complete removal, all requests return `404 Not Found`.

### Q: How do I know which version I'm currently using?

**A:** Check the `X-API-Version` header in API responses. Also review your API client configuration.

### Q: Are there tools to help with migration?

**A:** Yes, we provide:
- Migration guide with code examples
- API compatibility checker
- Automated migration scripts
- Migration support during office hours

### Q: Will my API keys work with v2?

**A:** Yes, authentication tokens work across all versions. However, v2 has enhanced security features (like IP verification) that may require updates to your configuration.

## Change Log

### v2.0.0 (Current)
- Enhanced JWT authentication with IP verification
- Improved error handling and consistent response format
- New User360 module
- Enhanced AI capabilities via Synth v2
- Improved rate limiting
- Better security controls

### v1.0.0 (Deprecated)
- Initial API release
- Basic authentication
- Core modules: Helix, Pulse, Orbit, Lore

## Resources

- **API Documentation**: https://docs.nova-universe.com/api
- **Migration Guide**: https://docs.nova-universe.com/api/migration
- **Changelog**: https://docs.nova-universe.com/api/changelog
- **Status Page**: https://status.nova-universe.com
- **Support**: api-support@nova-universe.com

## Feedback

We welcome feedback on our API versioning strategy. Please submit suggestions via:

- GitHub Issues: https://github.com/nova-universe/api/issues
- Email: api-feedback@nova-universe.com
- Community Forum: https://community.nova-universe.com
