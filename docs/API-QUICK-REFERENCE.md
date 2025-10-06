# Nova Universe API V1 (2025.08) - Quick Reference

## 🚀 Quick Start

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin"}'
```

### Making Authenticated Requests
```bash
curl -X GET http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 API Documentation

- **Interactive Documentation**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api-docs/swagger.json
- **Health Check**: http://localhost:3000/api/v1/health
- **Server Info**: http://localhost:3000/api/v1/server-info

## 🔑 Key Endpoints

### Authentication
```bash
# Login
POST /api/v1/auth/login

# Register
POST /api/v1/auth/register

# Refresh Token
POST /api/v1/auth/refresh

# Logout
POST /api/v1/auth/logout
```

### Tickets
```bash
# List tickets
GET /api/v1/tickets?page=1&limit=25&status=open

# Get ticket by ID
GET /api/v1/tickets/:id

# Create ticket
POST /api/v1/tickets

# Update ticket
PATCH /api/v1/tickets/:id

# Delete ticket
DELETE /api/v1/tickets/:id
```

### Users & Directory
```bash
# List users
GET /api/v1/directory

# Get user
GET /api/v1/directory/:id

# Search users
GET /api/v1/directory?search=john
```

### Monitoring
```bash
# System status
GET /api/v1/monitoring/status

# Alerts
GET /api/v1/alerts

# Create alert
POST /api/v1/alerts
```

### AI Services
```bash
# AI conversation
POST /api/v1/synth/conversation/start

# AI insights
GET /api/v1/ai-fabric/insights

# Cosmo chat (if enabled)
POST /api/v1/cosmo/chat
```

## 📊 Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "ticket-123",
    "title": "Network Issue",
    "status": "open",
    "priority": "high"
  },
  "meta": {
    "requestId": "req_abc123",
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
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ],
    "statusCode": 400,
    "requestId": "req_abc123"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4
  }
}
```

## 🔒 Security

### Rate Limits
- **Authenticated**: 1000 req/hour
- **Unauthenticated**: 100 req/hour
- **Burst**: 100 req/minute

### Headers
```bash
# Authentication
Authorization: Bearer <token>

# API Key (alternative)
X-API-Key: <api-key>

# Rate limit tracking
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1641024000
```

## 🔄 WebSockets

### Connect
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => {
  console.log('Connected to Nova Universe');
});

socket.on('ticket:updated', (data) => {
  console.log('Ticket updated:', data);
});
```

### Events
- `ticket:created`
- `ticket:updated`
- `ticket:deleted`
- `alert:triggered`
- `alert:resolved`
- `notification:new`
- `system:status`

## 🧪 Testing

### cURL Examples

#### Create a Ticket
```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Printer not working",
    "description": "Office printer on 3rd floor is offline",
    "priority": "medium",
    "category": "hardware"
  }'
```

#### Search Tickets
```bash
curl -X GET "http://localhost:3000/api/v1/tickets?search=printer&status=open" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Ticket Status
```bash
curl -X PATCH http://localhost:3000/api/v1/tickets/ticket-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

## 📦 SDKs & Libraries

### JavaScript/TypeScript
```javascript
import { NovaClient } from '@nova-universe/sdk';

const client = new NovaClient({
  baseURL: 'http://localhost:3000',
  apiKey: 'YOUR_API_KEY'
});

const tickets = await client.tickets.list({
  status: 'open',
  page: 1,
  limit: 25
});
```

### Python
```python
from nova_universe import NovaClient

client = NovaClient(
    base_url='http://localhost:3000',
    api_key='YOUR_API_KEY'
)

tickets = client.tickets.list(status='open', page=1, limit=25)
```

## 🌐 Environment Variables

```bash
# API Configuration
API_PORT=3000
API_BASE_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW=3600000  # 1 hour in ms
RATE_LIMIT_MAX=1000

# Features
ENABLE_AI_COMPONENTS=true
ENABLE_PUBLIC_DOCS=false
```

## 📖 Full Documentation

For complete API documentation, visit:
- **Interactive Docs**: http://localhost:3000/api-docs
- **Migration Guide**: See `docs/api-v1-2025-08-migration.md`
- **Changelog**: See `CHANGELOG.md`

## 💡 Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely (never in source code)**
3. **Respect rate limits**
4. **Use pagination for large datasets**
5. **Handle errors gracefully**
6. **Include request IDs for support**
7. **Use WebSockets for real-time updates**
8. **Cache responses when appropriate**

## 🆘 Troubleshooting

### Common Issues

**401 Unauthorized**
- Check that your token is valid and not expired
- Ensure `Authorization` header is properly formatted

**429 Too Many Requests**
- You've hit the rate limit
- Check `X-RateLimit-Reset` header
- Implement exponential backoff

**500 Internal Server Error**
- Check server logs
- Report issue with `requestId` from error response

### Getting Help

- **Email**: api-support@nova-universe.com
- **Documentation**: https://docs.nova-universe.com
- **GitHub Issues**: https://github.com/itristenx/nova-universe/issues

---

**API Version**: V1 (2025.08)
**Last Updated**: October 5, 2025
