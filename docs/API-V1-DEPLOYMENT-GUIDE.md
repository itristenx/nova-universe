# Nova Universe API V1 - Complete Deployment Guide

This guide covers everything you need to deploy and maintain the Nova Universe Platform API V1 in production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Integration Tests](#integration-tests)
3. [Postman Collection](#postman-collection)
4. [Client SDKs](#client-sdks)
5. [API Monitoring](#api-monitoring)
6. [Production Configuration](#production-configuration)
7. [Deployment](#deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required

- **Node.js**: >= 16.0.0
- **PostgreSQL**: >= 14.0
- **Redis**: >= 6.0 (for caching and sessions)
- **MongoDB**: >= 5.0 (for logging)

### Recommended

- **Nginx**: For reverse proxy and load balancing
- **PM2**: For process management
- **Docker**: For containerized deployment
- **SSL Certificate**: Let's Encrypt or commercial

---

## Integration Tests

### Location

Integration tests are located in:
```
test/integration/api-v1-endpoints.test.js
```

### Running Tests

```bash
# Run all V1 endpoint tests
npm test test/integration/api-v1-endpoints.test.js

# Run with verbose output
NODE_OPTIONS=--experimental-vm-modules node --test test/integration/api-v1-endpoints.test.js

# Run specific test suite
npm test -- --grep "Authentication"
```

### Test Coverage

The integration test suite covers:

- ✅ Health & Server Info endpoints
- ✅ Authentication (login, logout, token refresh)
- ✅ Organizations management
- ✅ Directory & User management
- ✅ Roles & RBAC
- ✅ Ticket operations (CRUD + comments)
- ✅ ITSM features (service requests, catalog)
- ✅ Assets & CMDB
- ✅ Workflows & Approvals
- ✅ Monitoring & Alerts
- ✅ AI Services (Synth, Cosmo, AI Fabric)
- ✅ Analytics & Reports
- ✅ Integrations & Webhooks
- ✅ Search
- ✅ Configuration

### Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run V1 API tests
        run: npm test test/integration/api-v1-endpoints.test.js
```

---

## Postman Collection

### Files

Located in `postman/`:

- **Nova-Universe-API-V1.postman_collection.json** - Complete collection
- **Nova-Universe-V1-Development.postman_environment.json** - Dev environment
- **Nova-Universe-V1-Production.postman_environment.json** - Prod environment
- **README.md** - Usage documentation

### Import to Postman

1. Open Postman
2. Click **Import**
3. Select `Nova-Universe-API-V1.postman_collection.json`
4. Import environment file for your target environment

### Key Features

- **Auto-authentication**: Login request automatically saves token
- **Environment variables**: Easy switching between dev/staging/prod
- **Pre-request scripts**: Automatic token management
- **Test scripts**: Validate responses
- **Complete coverage**: All V1 endpoints included

### Quick Start

1. Import collection and development environment
2. Select "Nova Universe V1 - Development" environment
3. Run "Login" request in the Authentication folder
4. Token is automatically saved - all other requests will work
5. Explore other endpoint folders

---

## Client SDKs

We provide official SDKs for popular programming languages.

### Python SDK

**Installation:**
```bash
pip install nova-universe-sdk
```

**Quick Start:**
```python
from nova_universe import NovaClient

client = NovaClient(base_url="http://localhost:3000")
client.authenticate("admin@example.com", "admin")

# List tickets
tickets = client.tickets.list(status="open", limit=50)

# Create ticket
ticket = client.tickets.create({
    "title": "Network issue",
    "description": "Cannot access network drive",
    "priority": "high"
})
```

**Documentation:** `sdk/python/README.md`

### JavaScript/TypeScript SDK

**Installation:**
```bash
npm install @nova-universe/sdk
```

**Quick Start:**
```typescript
import { NovaClient } from '@nova-universe/sdk';

const client = new NovaClient({
  baseUrl: 'http://localhost:3000'
});

await client.authenticate('admin@example.com', 'admin');

// List tickets
const tickets = await client.tickets.list({ status: 'open' });

// Create ticket
const ticket = await client.tickets.create({
  title: 'Network issue',
  description: 'Cannot access network drive',
  priority: 'high'
});
```

**Documentation:** `sdk/javascript/README.md`

### Go SDK

**Installation:**
```bash
go get github.com/itristenx/nova-universe/sdk/go/novauniverse
```

**Quick Start:**
```go
import "github.com/itristenx/nova-universe/sdk/go/novauniverse"

client := novauniverse.NewClient(&novauniverse.ClientConfig{
    BaseURL: "http://localhost:3000",
})

authResp, err := client.Authenticate("admin@example.com", "admin")
if err != nil {
    log.Fatal(err)
}

// List tickets
tickets, err := client.ListTickets(&novauniverse.TicketListParams{
    ListParams: novauniverse.ListParams{Limit: 50},
    Status: "open",
})

// Create ticket
ticket, err := client.CreateTicket(&novauniverse.Ticket{
    Title:       "Network issue",
    Description: "Cannot access network drive",
    Priority:    "high",
})
```

**Documentation:** `sdk/go/README.md`

---

## API Monitoring

### Configuration

API monitoring is built-in and tracks:

- Request count and success rate
- Response times (average, P95, P99)
- Error rates and types
- Top endpoints by traffic
- Slowest endpoints
- System resource usage

### Enable Monitoring

In your `.env.production`:

```bash
ENABLE_API_MONITORING=true
API_METRICS_WINDOW_MINUTES=60
API_METRICS_MAX_STORED=10000
API_RESPONSE_TIME_WARNING_MS=1000
API_RESPONSE_TIME_CRITICAL_MS=5000
```

### Monitoring Endpoints

Access monitoring data via API:

```bash
# Get aggregated metrics
GET /api/v1/monitoring/metrics?window=60

# Get system stats
GET /api/v1/monitoring/system

# Get top endpoints
GET /api/v1/monitoring/top-endpoints?limit=10

# Get slowest endpoints
GET /api/v1/monitoring/slowest-endpoints

# Get error breakdown
GET /api/v1/monitoring/errors

# Export metrics
GET /api/v1/monitoring/export
```

### Alert Configuration

The monitoring system emits events for threshold violations:

```javascript
import { getMonitor } from './middleware/apiMonitoring';

const monitor = getMonitor();

monitor.on('alert', (alert) => {
  if (alert.level === 'critical') {
    // Send to PagerDuty, Slack, etc.
    notifyOps(alert);
  }
});
```

### Integration with External Services

**Prometheus:**
```bash
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
```

**Datadog:**
```bash
DATADOG_API_KEY=your-api-key
DATADOG_APP_KEY=your-app-key
```

**Sentry:**
```bash
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

---

## Production Configuration

### Setup Script

Run the production environment setup script:

```bash
chmod +x scripts/setup-production-env.sh
./scripts/setup-production-env.sh
```

This will:
1. Create `.env.production` from template
2. Generate strong security secrets
3. Prompt for basic configuration
4. Set secure file permissions
5. Add to `.gitignore`

### Required Configuration

Edit `.env.production` and set:

#### Database Credentials
```bash
POSTGRES_PASSWORD=your-strong-password
MONGO_PASSWORD=your-strong-password
REDIS_PASSWORD=your-strong-password
```

#### Email Service
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### Storage (S3)
```bash
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

#### SSL/TLS
```bash
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem
```

### Security Checklist

- [ ] Generated strong JWT_SECRET (done by setup script)
- [ ] Generated strong SESSION_SECRET (done by setup script)
- [ ] Generated strong ENCRYPTION_KEY (done by setup script)
- [ ] Updated all database passwords
- [ ] Configured SSL certificates
- [ ] Set proper CORS origins
- [ ] Enabled rate limiting
- [ ] Configured backup strategy
- [ ] Set up monitoring and alerts
- [ ] Enabled audit logging
- [ ] Reviewed security headers
- [ ] Changed default admin password
- [ ] Restricted database access
- [ ] Configured firewall rules

---

## Deployment

### Option 1: PM2 (Recommended for Single Server)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start apps/api/index.js --name nova-api \
  --env production \
  --instances max \
  --max-memory-restart 1G

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 monit
```

### Option 2: Docker

```bash
# Build image
docker build -t nova-universe-api:v1 .

# Run container
docker run -d \
  --name nova-api \
  -p 3000:3000 \
  --env-file .env.production \
  nova-universe-api:v1

# Or use docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Kubernetes

```bash
# Create secrets
kubectl create secret generic nova-api-secrets \
  --from-env-file=.env.production

# Apply deployment
kubectl apply -f k8s/deployment.yml

# Apply service
kubectl apply -f k8s/service.yml

# Apply ingress
kubectl apply -f k8s/ingress.yml
```

### Nginx Reverse Proxy

Example Nginx configuration:

```nginx
upstream nova_api {
    server localhost:3000;
    server localhost:3001;  # If running multiple instances
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location / {
        proxy_pass http://nova_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

---

## Monitoring & Maintenance

### Health Checks

Monitor application health:

```bash
# API health
curl https://api.yourdomain.com/api/v1/health

# Database connectivity
curl https://api.yourdomain.com/api/v1/monitoring/health
```

### Log Management

Access logs:

```bash
# PM2 logs
pm2 logs nova-api

# Docker logs
docker logs -f nova-api

# Kubernetes logs
kubectl logs -f deployment/nova-api
```

### Database Backups

Automated backup script:

```bash
# PostgreSQL backup
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER $POSTGRES_DB \
  | gzip > backup-$(date +%Y%m%d).sql.gz

# MongoDB backup
mongodump --uri=$MONGODB_URI --archive=backup-$(date +%Y%m%d).archive --gzip
```

### Performance Monitoring

Monitor key metrics:

- Response time (target: < 200ms for most endpoints)
- Error rate (target: < 1%)
- Database query performance
- Memory usage
- CPU utilization
- Active connections

### Scaling

**Horizontal Scaling:**
```bash
# PM2
pm2 scale nova-api +2

# Docker
docker-compose -f docker-compose.prod.yml up -d --scale api=4

# Kubernetes
kubectl scale deployment nova-api --replicas=4
```

**Vertical Scaling:**
```bash
# Increase memory limit
pm2 restart nova-api --max-memory-restart 2G
```

### Troubleshooting

Common issues and solutions:

1. **High memory usage**
   - Check for memory leaks
   - Increase Node.js heap size: `NODE_OPTIONS=--max-old-space-size=4096`

2. **Slow response times**
   - Check database query performance
   - Enable Redis caching
   - Review slow endpoint logs

3. **Database connection errors**
   - Verify credentials
   - Check connection pool settings
   - Ensure database is accessible

4. **Rate limiting issues**
   - Review rate limit configuration
   - Check if legitimate traffic is being blocked
   - Consider whitelisting certain IPs

---

## Support

For additional help:

- **Documentation**: https://docs.nova-universe.com
- **GitHub Issues**: https://github.com/itristenx/nova-universe/issues
- **Email Support**: api-support@nova-universe.com

---

## Changelog

### v1.0.0 (2025-10-05)

- Initial V1 API release
- Complete integration test suite
- Postman collection with all V1 endpoints
- SDKs for Python, JavaScript/TypeScript, and Go
- Built-in API monitoring and analytics
- Production configuration template
- Comprehensive deployment documentation
