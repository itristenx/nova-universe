# Nova Universe API V1 - Postman Collection

Complete Postman collection for testing and exploring the Nova Universe Platform V1 API.

## Contents

- **Nova-Universe-API-V1.postman_collection.json** - Complete API collection with all V1 endpoints
- **Nova-Universe-V1-Development.postman_environment.json** - Development environment variables
- **Nova-Universe-V1-Production.postman_environment.json** - Production environment variables

## Quick Start

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Nova-Universe-API-V1.postman_collection.json`
4. Collection will appear in your workspace

### 2. Import Environment

1. Click **Import** button
2. Select the appropriate environment file:
   - `Nova-Universe-V1-Development.postman_environment.json` for local testing
   - `Nova-Universe-V1-Production.postman_environment.json` for production
3. Select the environment from the dropdown in the top-right corner

### 3. Authenticate

1. Open the **Authentication** folder
2. Run the **Login** request
3. The auth token will be automatically saved to your environment
4. All subsequent requests will use this token

## Environment Variables

### Development Environment

- **baseUrl**: `http://localhost:3000`
- **apiVersion**: `v1`
- **adminEmail**: `admin@example.com`
- **adminPassword**: `admin`

### Production Environment

- **baseUrl**: `https://api.nova-universe.com`
- **apiVersion**: `v1`
- **adminEmail**: Your production admin email
- **adminPassword**: Your production admin password

### Auto-Generated Variables

These variables are automatically set by the collection:

- **authToken**: JWT authentication token (set by Login request)
- **refreshToken**: Refresh token for token renewal
- **userId**: Current user ID
- **testTicketId**: ID of created test ticket

## Collection Organization

### 1. Authentication
- Login
- Refresh Token
- Logout

### 2. Organizations
- List Organizations
- Get Organization Config
- Create Organization

### 3. Directory & Users
- List Directory Users
- Sync Directory
- Get User by ID

### 4. Roles & RBAC
- List Roles
- Create Role
- Get RBAC Configuration

### 5. Tickets
- List Tickets (with pagination and filters)
- Create Ticket
- Get Ticket by ID
- Update Ticket
- Add Comment to Ticket
- Close Ticket

### 6. ITSM
- Get ITSM Dashboard
- List Service Requests
- Create Service Request
- Get Service Catalog

### 7. Assets & CMDB
- List Assets
- Create Asset
- List Configuration Items
- Get CI by ID
- List CI Types
- Get CI Relationships

### 8. Workflows
- List Workflows
- Create Workflow
- List Approvals
- Approve Request

### 9. Monitoring & Alerts
- Get Monitoring Dashboard
- Get System Health
- List Alerts
- Create Alert
- Acknowledge Alert
- Get Notifications

### 10. AI Services
- Get AI Synth Status
- Process with Synth
- Get Cosmo Status
- Chat with Cosmo
- Get AI Fabric Status

### 11. Analytics & Reports
- Get Analytics Dashboard
- Get Ticket Metrics
- List Reports
- Generate Report

### 12. Integrations
- List Integrations
- Configure Integration
- List Webhooks
- Create Webhook

### 13. Search
- Global Search

### 14. Configuration
- Get System Configuration
- Update Configuration

## Usage Examples

### Creating a Ticket

```javascript
POST /api/v1/tickets
{
  "title": "Cannot access network drive",
  "description": "Getting permission denied error when trying to access shared drive",
  "priority": "high",
  "category": "network",
  "requester_email": "user@example.com"
}
```

### Searching Tickets

```
GET /api/v1/tickets?page=1&limit=50&status=open&sort=priority&order=desc&search=network
```

### Updating Ticket Status

```javascript
PATCH /api/v1/tickets/:ticketId
{
  "status": "in_progress",
  "assigned_to": 5
}
```

## Authentication

All endpoints (except Login) require authentication. The collection uses Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

The Login request automatically sets the `authToken` environment variable, which is used by all subsequent requests.

## Rate Limiting

The API implements rate limiting:
- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: When the window resets

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Request successful
- **201 Created**: Resource created
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Testing Workflows

### 1. Basic Ticket Workflow

1. **Login** → Get auth token
2. **Create Ticket** → Get ticket ID
3. **Get Ticket by ID** → View ticket details
4. **Add Comment** → Add internal note
5. **Update Ticket** → Change status to "in_progress"
6. **Close Ticket** → Mark as resolved

### 2. Service Request Workflow

1. **Login** → Get auth token
2. **Get Service Catalog** → Browse available services
3. **Create Service Request** → Submit request
4. **List Approvals** → View pending approvals
5. **Approve Request** → Approve/reject

### 3. Monitoring Workflow

1. **Login** → Get auth token
2. **Get System Health** → Check overall health
3. **Get Monitoring Dashboard** → View metrics
4. **List Alerts** → Check active alerts
5. **Acknowledge Alert** → Acknowledge issue

## Advanced Features

### Collection Variables

The collection uses variables for flexibility:
- `{{baseUrl}}` - API base URL
- `{{apiVersion}}` - API version (v1)
- `{{authToken}}` - JWT token (auto-set)

### Pre-request Scripts

The Login request includes a test script that automatically saves the auth token:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('authToken', response.token);
    if (response.refreshToken) {
        pm.collectionVariables.set('refreshToken', response.refreshToken);
    }
}
```

### Test Automation

You can run the entire collection as a test suite:

1. Click the **...** menu on the collection
2. Select **Run collection**
3. Configure test settings
4. Click **Run Nova Universe API V1**

## Support

For API documentation and support:
- **API Docs**: http://localhost:3000/api-docs (when running locally)
- **OpenAPI Spec**: See `apps/api/openapi_spec_v3.yaml`
- **GitHub Issues**: Report bugs and request features

## Version History

- **v1.0.0** (2025-10-05): Initial release with complete V1 endpoint coverage

## License

MIT License - See LICENSE file for details
