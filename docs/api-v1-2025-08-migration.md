# Nova Universe API V1 (2025.08) - Migration Guide

## 📋 Overview

This document outlines the consolidation and standardization of all Nova Universe API endpoints to **V1 (2025.08)**, following industry best practices from Microsoft Azure and REST API standards.

## 🎯 Objectives

- ✅ Consolidate all API endpoints under a single version: **V1 (2025.08)**
- ✅ Remove duplicate endpoints and route mountings
- ✅ Eliminate backward compatibility for legacy versions (v2, unversioned)
- ✅ Follow URI path versioning best practices
- ✅ Create clean, predictable endpoint structure
- ✅ Improve API documentation and developer experience

## 📅 Version Information

- **Version**: V1
- **Release**: 2025.08
- **Status**: Stable
- **Base Path**: `/api/v1`
- **Date**: October 5, 2025

## 🔄 Changes Summary

### Removed

1. **V2 API** (`/api/v2/*`)
   - All v2 routes consolidated into v1
   - No deprecation needed (new application)

2. **Unversioned Routes** (`/api/*`)
   - Removed all unversioned endpoint mountings
   - Clean separation between versioned and special routes

3. **Duplicate Route Mountings**
   - Removed duplicate kiosk routes
   - Consolidated all route registrations
   - Single source of truth for all endpoints

### Standardized

1. **URI Path Versioning**
   - All routes under `/api/v1/*` namespace
   - Clear, consistent structure
   - Follows REST best practices

2. **Endpoint Organization**
   - Grouped by functional area
   - Logical resource hierarchy
   - Improved discoverability

3. **API Documentation**
   - Updated Swagger/OpenAPI spec to V1 (2025.08)
   - Enhanced documentation with examples
   - Clear authentication and rate limiting guidelines

## 🗺️ API Endpoint Map

### Authentication & Identity
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/helix/*` - Nova Helix Identity Engine
- `POST /api/v1/oauth/token` - OAuth 2.0 token endpoint
- `GET /api/v1/tenants` - Tenant discovery

### Core Resource Management
- `GET /api/v1/organizations` - List organizations
- `GET /api/v1/directory` - User directory
- `GET /api/v1/roles` - Role management
- `GET /api/v1/configuration` - System configuration
- `GET /api/v1/modules` - Feature flags
- `GET /api/v1/api-keys` - API key management
- `GET /api/v1/health` - Health check
- `GET /api/v1/server-info` - Server information

### Asset & Inventory Management
- `GET /api/v1/assets` - Asset management
- `GET /api/v1/inventory` - Inventory tracking
- `GET /api/v1/cmdb` - CMDB resources

### ITSM & Service Management
- `GET /api/v1/tickets` - Ticket management
- `GET /api/v1/itsm` - ITSM operations
- `GET /api/v1/service-requests` - Service requests
- `GET /api/v1/service-catalog` - Service catalog
- `GET /api/v1/approvals` - Approval workflows

### Knowledge & Documentation
- `GET /api/v1/lore` - Knowledge base
- `GET /api/v1/search` - Global search

### Workflow & Automation
- `GET /api/v1/workflows` - Workflow engine
- `GET /api/v1/rbac` - RBAC engine

### AI & Intelligence
- `POST /api/v1/synth` - AI orchestration
- `POST /api/v1/cosmo` - Conversational AI (if enabled)
- `GET /api/v1/ai-fabric` - AI fabric platform (if enabled)
- `GET /api/v1/ai-control-tower` - AI/ML management (if enabled)
- `POST /api/v1/mcp` - Model Context Protocol (if enabled)

### Monitoring & Alerting
- `GET /api/v1/monitoring` - System monitoring
- `GET /api/v1/unified-monitoring` - Unified monitoring
- `GET /api/v1/alerts` - Alert management
- `GET /api/v1/notifications` - Notification platform
- `GET /api/v1/analytics` - Analytics & reporting
- `GET /api/v1/uptime-kuma` - Uptime monitoring
- `GET /api/v1/status` - Status page
- `GET /api/v1/announcements` - System announcements

### Integration & Communication
- `GET /api/v1/integrations` - Third-party integrations
- `POST /api/v1/webhooks` - Webhook management
- `GET /api/v1/helpscout` - HelpScout integration
- `GET /api/v1/comms` - Slack integration
- `GET /api/v1/websocket` - WebSocket management
- `GET /api/v1/email-templates` - Email templates

### Portal & User Experience
- `GET /api/v1/pulse` - Technician portal
- `GET /api/v1/orbit` - End-user portal
- `GET /api/v1/beacon` - Kiosk management
- `GET /api/v1/kiosks` - Kiosk operations
- `GET /api/v1/app-switcher` - App switcher
- `GET /api/v1/spaces` - Collaborative spaces
- `GET /api/v1/nova-tv` - Digital signage

### User360 & Engagement
- `GET /api/v1/user360` - User 360 profiles
- `GET /api/v1/user360/interactions` - User interactions

### Reporting & Analytics
- `GET /api/v1/reports` - Report generation
- `GET /api/v1/vip` - VIP management

### Advanced Features
- `GET /api/v1/feature-flags` - Feature flag management
- `GET /api/v1/ab-testing` - A/B testing
- `GET /api/v1/cost-centers` - Cost centers

### Setup & Administration
- `POST /api/v1/setup` - System setup
- `GET /api/v1/core` - Core functions

## 🔒 Special Routes (Outside /api/v1)

These routes maintain their own paths for compatibility with external standards:

- `/scim/v2/*` - SCIM 2.0 Provisioning (per SCIM specification)
- `/.well-known/*` - OAuth 2.0 discovery (per RFC 8414)
- `/status` - Public status page (feature-gated)
- `/announcements` - Public announcements
- `/core` - Core system functions

## 📊 API Response Format

All V1 (2025.08) responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-08-15T10:30:00Z",
    "version": "v1"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [],
    "timestamp": "2025-08-15T10:30:00Z",
    "requestId": "req_123456",
    "path": "/api/v1/resource",
    "statusCode": 400
  }
}
```

## 🔐 Authentication

All API requests require authentication via one of:

1. **Bearer Token** (Recommended)
   ```
   Authorization: Bearer <jwt-token>
   ```

2. **API Key**
   ```
   X-API-Key: <api-key>
   ```

3. **OAuth 2.0**
   - See `/api/v1/oauth/*` endpoints

## 🚦 Rate Limiting

- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour
- **Burst**: Max 100 requests/minute

Rate limit headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After` (when throttled)

## 📖 Pagination

Standard pagination parameters:

- `page` - Page number (1-based, default: 1)
- `limit` - Items per page (1-100, default: 25)
- `sort` - Field to sort by
- `order` - Sort direction (asc/desc, default: desc)
- `search` or `q` - Full-text search

Example:
```
GET /api/v1/tickets?page=2&limit=50&status=open&sort=priority&order=desc
```

## 🔗 HATEOAS Support

Responses include hypermedia links for related resources:

```json
{
  "data": {
    "id": "ticket-123",
    "title": "Network Issue",
    "_links": {
      "self": { "href": "/api/v1/tickets/ticket-123" },
      "assignee": { "href": "/api/v1/directory/users/user-456" },
      "comments": { "href": "/api/v1/tickets/ticket-123/comments" }
    }
  }
}
```

## 🧪 Testing

All endpoints can be tested via:

1. **Swagger UI**: `http://localhost:3000/api-docs`
2. **Postman Collection**: See `docs/postman/nova-universe-v1.json`
3. **cURL Examples**: See endpoint documentation

## 📝 Migration Checklist

- [x] Remove v2 routes and router
- [x] Remove unversioned route mountings
- [x] Consolidate all routes under /api/v1
- [x] Remove duplicate route registrations
- [x] Update Swagger/OpenAPI specification
- [x] Update version headers middleware
- [x] Update server URL configuration
- [x] Document all endpoint changes
- [ ] Update client SDKs (if applicable)
- [ ] Update integration tests
- [ ] Update API documentation website
- [ ] Notify API consumers

## 🔍 Breaking Changes

**None** - This is a new application with no legacy clients.

All endpoints are consolidated under V1 (2025.08) from the start.

## 📚 Additional Resources

- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/v1/health
- **Server Info**: http://localhost:3000/api/v1/server-info
- **OpenAPI Spec**: http://localhost:3000/api-docs/swagger.json

## 🏗️ Architecture Decisions

Following Microsoft Azure REST API Best Practices:

1. **URI Path Versioning**: Clear, visible, and cacheable
2. **Nouns over Verbs**: Resource-oriented design
3. **Plural Nouns**: Consistent collection naming
4. **Stateless**: No server-side session state
5. **HTTP Methods**: Proper use of GET, POST, PUT, PATCH, DELETE
6. **Idempotency**: Safe retries for PUT, DELETE
7. **JSON**: Standard response format
8. **HTTP Status Codes**: Proper semantic usage

## ✅ Validation

All changes have been validated:

- ✅ No TypeScript/ESLint errors
- ✅ All route imports resolved correctly
- ✅ Swagger spec generates successfully
- ✅ Server starts without errors
- ✅ API documentation accessible
- ✅ Version headers correctly set

## 👥 Support

For questions or issues:

- **Email**: api-support@nova-universe.com
- **Documentation**: https://docs.nova-universe.com
- **Status Page**: https://status.nova-universe.com

---

**Last Updated**: October 5, 2025
**Version**: V1 (2025.08)
**Status**: ✅ Complete
