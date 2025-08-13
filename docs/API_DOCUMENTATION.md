# Nova Universe API Documentation

## Overview

Nova Universe provides a comprehensive RESTful API for enterprise ITSM operations. The API supports authentication, real-time notifications, and extensive analytics capabilities.

## Base URL

- **Production**: `https://your-domain.com/api`
- **Development**: `http://localhost:3000/api`

## Authentication

### JWT Bearer Token
All API endpoints require authentication using JWT Bearer tokens.

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-domain.com/api/v1/tickets
```

### SAML 2.0 SSO
Nova Universe supports SAML 2.0 Single Sign-On for enterprise authentication.

```bash
# Initiate SAML login
GET /api/auth/saml/login

# SAML callback endpoint
POST /api/auth/saml/callback
```

## Core Endpoints

### 🎫 Tickets Management

#### Get All Tickets
```http
GET /api/v1/tickets
```

**Query Parameters:**
- `status` - Filter by status (`open`, `in_progress`, `resolved`, `closed`)
- `priority` - Filter by priority (`low`, `medium`, `high`, `critical`)
- `assigned_to` - Filter by assigned user ID
- `limit` - Number of results (default: 50, max: 200)
- `offset` - Pagination offset

**Response:**
```json
{
  "tickets": [
    {
      "id": "ticket_123",
      "title": "Network connectivity issue",
      "description": "Users unable to access company network",
      "status": "open",
      "priority": "high",
      "created_at": "2025-08-09T10:00:00Z",
      "updated_at": "2025-08-09T10:00:00Z",
      "assigned_to": "user_456",
      "customer_email": "user@company.com",
      "vip_priority_score": 0
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

#### Create Ticket
```http
POST /api/v1/tickets
```

**Request Body:**
```json
{
  "title": "System maintenance request",
  "description": "Scheduled maintenance for database servers",
  "priority": "medium",
  "category": "infrastructure",
  "customer_email": "admin@company.com"
}
```

#### Update Ticket
```http
PUT /api/v1/tickets/{id}
```

#### Delete Ticket
```http
DELETE /api/v1/tickets/{id}
```

### 👥 User Management

#### Get Users
```http
GET /api/v1/directory/users
```

#### Create User
```http
POST /api/v1/directory/users
```

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "name": "John Doe",
  "role": "technician",
  "department": "IT Support"
}
```

### 🏢 Organizations

#### Get Organizations
```http
GET /api/v1/organizations
```

#### Create Organization
```http
POST /api/v1/organizations
```

### 📊 Analytics & Reporting

#### Dashboard Analytics
```http
GET /api/analytics/dashboard?range=7d
```

**Query Parameters:**
- `range` - Time range (`1d`, `7d`, `30d`, `90d`)

**Response:**
```json
{
  "summary": {
    "totalTickets": 342,
    "openTickets": 45,
    "resolvedTickets": 287,
    "avgResolutionHours": "18.5",
    "vipTickets": 12,
    "activeUsers": 89,
    "systemUptime": 99.9
  },
  "performance": {
    "avgResponseTime": "150",
    "errorRate": "0.5",
    "dbSize": 1000000000,
    "activeConnections": 5
  },
  "trends": {
    "dailyTickets": [...],
    "resolutionTimes": [...],
    "userActivity": [...]
  }
}
```

#### Real-time Metrics
```http
GET /api/analytics/real-time
```

#### Executive Reporting
```http
GET /api/analytics/executive?range=30d
```

### 🔍 Search

#### Global Search
```http
GET /api/v1/search?q=network&type=tickets
```

**Query Parameters:**
- `q` - Search query
- `type` - Search type (`tickets`, `users`, `articles`, `all`)
- `limit` - Results limit

### 📚 Knowledge Base

#### Get Articles
```http
GET /api/v1/lore/articles
```

#### Create Article
```http
POST /api/v1/lore/articles
```

#### Search Articles
```http
GET /api/v1/lore/search?q=network
```

### 🔧 System Monitoring

#### Health Check
```http
GET /api/monitoring/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-09T10:00:00Z",
  "components": {
    "database": {
      "status": "healthy",
      "responseTime": 50,
      "connections": 5
    },
    "api": {
      "status": "healthy",
      "uptime": 86400,
      "memory": {
        "used": 256,
        "total": 512
      }
    }
  }
}
```

#### System Alerts
```http
GET /api/monitoring/alerts
```

#### Performance Metrics
```http
GET /api/monitoring/performance
```

### 🔗 Integrations

#### HelpScout Import
```http
POST /api/helpscout/import
```

**Request Body:**
```json
{
  "apiKey": "your-helpscout-api-key",
  "mailboxId": "12345"
}
```

#### Slack Integration
```http
GET /api/v1/integrations/slack/status
```

### 🚀 Workflows

#### Trigger Workflow
```http
POST /api/workflows/trigger
```

**Request Body:**
```json
{
  "workflow": "ticket-escalation",
  "data": {
    "ticketId": "ticket_123",
    "priority": "high"
  }
}
```

#### Get Workflow Status
```http
GET /api/workflows/status
```

## Error Handling

### Standard Error Response
```json
{
  "error": "Resource not found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "details": "Ticket with ID 'ticket_999' does not exist",
  "timestamp": "2025-08-09T10:00:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Standard Users**: 1000 requests per hour
- **VIP Users**: 5000 requests per hour
- **Admin Users**: 10000 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1628611200
```

## Webhooks

### Webhook Events
Nova Universe can send webhooks for various events:

- `ticket.created`
- `ticket.updated` 
- `ticket.resolved`
- `user.created`
- `alert.triggered`

### Webhook Configuration
```http
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["ticket.created", "ticket.updated"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload Example
```json
{
  "event": "ticket.created",
  "timestamp": "2025-08-09T10:00:00Z",
  "data": {
    "ticket": {
      "id": "ticket_123",
      "title": "New support request",
      "status": "open",
      "priority": "medium"
    }
  },
  "signature": "sha256=..."
}
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install @nova-universe/sdk
```

```javascript
import { NovaClient } from '@nova-universe/sdk';

const client = new NovaClient({
  apiKey: 'your-api-key',
  baseURL: 'https://your-domain.com/api'
});

// Create a ticket
const ticket = await client.tickets.create({
  title: 'API Integration Issue',
  description: 'Unable to authenticate with API',
  priority: 'high'
});
```

### Python
```bash
pip install nova-universe-sdk
```

```python
from nova_universe import NovaClient

client = NovaClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api'
)

# Get all tickets
tickets = client.tickets.list(status='open')
```

## Testing

### Postman Collection
Download our comprehensive Postman collection:
[Nova Universe API.postman_collection.json](./Nova_Universe_API.postman_collection.json)

### Test Environment
- **Test URL**: `https://test.nova-universe.com/api`
- **Test API Key**: `test_key_123456789`

## Support

- **Documentation**: [https://docs.nova-universe.com](https://docs.nova-universe.com)
- **Support Email**: [api-support@nova-universe.com](mailto:api-support@nova-universe.com)
- **Status Page**: [https://status.nova-universe.com](https://status.nova-universe.com)

## Changelog

### v2.0.0 (2025-08-09)
- ✅ Added comprehensive analytics endpoints
- ✅ Enhanced real-time monitoring capabilities
- ✅ Implemented HelpScout integration
- ✅ Added workflow automation APIs
- ✅ Improved error handling and validation

### v1.2.0 (2025-07-15)
- Added SAML 2.0 SSO support
- Enhanced search capabilities
- Improved performance monitoring

### v1.1.0 (2025-06-01)
- Added webhook support
- Implemented VIP priority scoring
- Enhanced ticket management APIs

### v1.0.0 (2025-05-01)
- Initial API release
- Core ITSM functionality
- User and organization management
