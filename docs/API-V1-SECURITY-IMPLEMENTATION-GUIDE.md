# API V1 Migration and Security Implementation Guide

## Overview

This document provides comprehensive guidance for the Nova Universe API V1 implementation, including security enhancements, monitoring setup, and migration instructions.

## Table of Contents

1. [Security Features](#security-features)
2. [Monitoring Setup](#monitoring-setup)
3. [Backup Configuration](#backup-configuration)
4. [API Migration](#api-migration)
5. [SDK Updates](#sdk-updates)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)

---

## Security Features

### Multi-Factor Authentication (MFA)

MFA is now available for all users and can be enforced for admin accounts.

#### Setup MFA

**Endpoint:** `POST /api/v1/mfa/setup`

```bash
curl -X POST https://your-domain.com/api/v1/mfa/setup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "BASE32ENCODEDSECRET",
    "qrCode": "data:image/png;base64,...",
    "otpauthUrl": "otpauth://totp/Nova%20Universe..."
  },
  "message": "Scan the QR code with your authenticator app"
}
```

#### Enable MFA

**Endpoint:** `POST /api/v1/mfa/enable`

```bash
curl -X POST https://your-domain.com/api/v1/mfa/enable \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "BASE32ENCODEDSECRET",
    "token": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backupCodes": [
      "ABC123DE",
      "XYZ789FG",
      ...
    ]
  },
  "message": "MFA enabled successfully. Save these backup codes in a secure location."
}
```

#### Environment Variables

```bash
# Multi-Factor Authentication
MFA_ISSUER=Nova Universe
MFA_WINDOW=2
MFA_CODE_LENGTH=6
MFA_ENFORCE_FOR_ADMIN=true
```

### SSRF Protection

Server-Side Request Forgery (SSRF) protection is built-in and configurable.

#### Configuration

```bash
# SSRF Protection - Whitelist of allowed domains
SSRF_ALLOWED_DOMAINS=api.openai.com,api.anthropic.com,api.stripe.com,slack.com,hooks.slack.com
```

**Important:** Only add trusted domains to this whitelist. The service automatically blocks:
- Private IP ranges (RFC 1918)
- Localhost addresses
- Cloud metadata endpoints (AWS, Azure, GCP)
- Link-local addresses

### Security Monitoring

The security monitoring service watches for suspicious activity and sends alerts.

#### Configuration

```bash
# Security Webhooks
SECURITY_ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SECURITY_ALERT_WEBHOOK_TYPE=slack
SECURITY_ALERT_ENABLED=true
SECURITY_CHECK_INTERVAL=60000
```

#### Monitored Events

- Failed login attempts (5+ from same IP in 5 minutes)
- MFA failures (3+ attempts)
- Brute force attacks
- Suspicious activity patterns
- Unresolved security events

#### Security Dashboard

Access the security dashboard to view metrics:

**Endpoint:** `GET /security/dashboard`

```bash
curl https://your-domain.com/security/dashboard?timeWindow=24hours \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audit_logs": {
      "total_events": 1234,
      "failed_actions": 45,
      "successful_logins": 567,
      "unique_ips": 123,
      "unique_users": 89
    },
    "security_events": {
      "total_events": 12,
      "unresolved": 2,
      "critical": 0,
      "high": 2,
      "medium": 5,
      "low": 5
    },
    "monitoring_active": true,
    "webhook_configured": true
  },
  "timestamp": "2025-10-06T12:00:00Z"
}
```

---

## Monitoring Setup

### Database Tables

The system uses two main tables for security monitoring:

#### audit_logs

Tracks all user actions and API requests.

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path TEXT,
  status_code INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  tenant_id UUID REFERENCES tenants(id)
);
```

#### security_events

Tracks critical security events requiring attention.

```sql
CREATE TABLE security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id INTEGER REFERENCES users(id),
  ip_address INET,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id)
);
```

### Querying Security Data

#### Recent Failed Logins

```sql
SELECT ip_address, COUNT(*) as attempts, MAX(created_at) as last_attempt
FROM audit_logs
WHERE action = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
ORDER BY attempts DESC;
```

#### Unresolved Security Events

```sql
SELECT * FROM security_events
WHERE resolved = false
  AND severity IN ('high', 'critical')
ORDER BY severity DESC, created_at DESC;
```

---

## Backup Configuration

### Automated PostgreSQL Backups

A production-ready backup script is provided at `scripts/backup-postgres.sh`.

#### Features

- Automated compression (gzip)
- S3 upload support
- Configurable retention
- Slack notifications
- Error handling
- Backup rotation

#### Configuration

```bash
# Backup Settings
BACKUP_DIR=/backups/postgres
BACKUP_RETENTION_DAYS=7
BACKUP_S3_ENABLED=true
BACKUP_S3_PREFIX=backups/postgres
BACKUP_NOTIFY_SUCCESS=false
BACKUP_NOTIFY_FAILURE=true
```

#### Manual Backup

```bash
./scripts/backup-postgres.sh
```

#### Automated Backups (Cron)

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/nova-universe/scripts/backup-postgres.sh >> /var/log/nova-backup.log 2>&1
```

#### S3 Configuration

```bash
# AWS Configuration for S3 backups
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-backup-bucket
```

---

## API Migration

### V1 Endpoints

All API endpoints are now under `/api/v1/` following Microsoft Azure REST API best practices.

#### Base URL

```
https://your-domain.com/api/v1
```

#### Migration Guide

| Legacy Endpoint | V1 Endpoint |
|----------------|-------------|
| `/api/auth/status` | `/api/v1/auth/status` |
| `/api/login` | `/api/v1/login` |
| `/api/me` | `/api/v1/me` |
| `/api/tickets` | `/api/v1/tickets` |
| `/api/users` | `/api/v1/users` |
| `/api/organizations` | `/api/v1/organizations` |
| `/api/kiosks/*` | `/api/v1/kiosks/*` |

#### Infrastructure Endpoints (Unversioned)

These endpoints remain unversioned as they are infrastructure/meta endpoints:

- `/api/health` - Health check for load balancers
- `/health` - Detailed health status
- `/api/version` - API version discovery
- `/metrics` - Performance metrics (admin only)
- `/ready` - Readiness probe

### Version Headers

All V1 responses include version headers:

```
X-API-Version: v1
X-API-Release: 2025.08
X-API-Status: stable
```

---

## SDK Updates

### JavaScript/TypeScript SDK

The official SDK is already updated to use V1 endpoints.

#### Installation

```bash
npm install @nova-universe/sdk
```

#### Usage

```typescript
import { NovaClient } from '@nova-universe/sdk';

const client = new NovaClient({
  baseUrl: 'https://your-domain.com',
  apiVersion: 'v1', // Default
});

// Authenticate
await client.authenticate('admin@example.com', 'password');

// Use API
const tickets = await client.tickets.list({ status: 'open' });
```

#### Configuration

```typescript
const client = new NovaClient({
  baseUrl: 'https://your-domain.com',
  apiVersion: 'v1',        // API version (default: 'v1')
  timeout: 30000,          // Request timeout in ms
  apiKey: 'optional-key',  // Optional API key
});
```

### Python SDK

Coming soon. For now, use direct HTTP requests:

```python
import requests

BASE_URL = "https://your-domain.com/api/v1"
headers = {"Authorization": f"Bearer {token}"}

response = requests.get(f"{BASE_URL}/tickets", headers=headers)
tickets = response.json()
```

---

## Testing

### E2E Test Suite

A comprehensive end-to-end test suite is provided.

#### Run Tests

```bash
# Run all E2E tests
npm run test

# Run specific test file
NODE_OPTIONS=--experimental-vm-modules node test/e2e-api-complete.test.js
```

#### Environment Setup

```bash
# Test configuration
export API_BASE_URL=http://localhost:3000
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=admin
```

#### Test Coverage

The E2E suite tests:
- ✅ Infrastructure endpoints
- ✅ Authentication & authorization
- ✅ Multi-factor authentication
- ✅ Tickets (CRUD operations)
- ✅ Users & directory
- ✅ Roles & RBAC
- ✅ Monitoring & alerts
- ✅ Security features
- ✅ Notifications
- ✅ Kiosks
- ✅ API documentation
- ✅ Error handling

---

## Production Deployment

### Checklist

- [ ] Update environment variables in `.env`
- [ ] Generate secure secrets for `JWT_SECRET` and `SESSION_SECRET`
- [ ] Configure `SECURITY_ALERT_WEBHOOK` for security notifications
- [ ] Set `SSRF_ALLOWED_DOMAINS` to trusted domains only
- [ ] Enable MFA for all admin users
- [ ] Set up automated backups (cron job)
- [ ] Configure S3 for backup storage
- [ ] Run database migrations
- [ ] Run E2E test suite
- [ ] Update client applications to use `/api/v1/` endpoints
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and alerting
- [ ] Review audit logs and security events
- [ ] Configure rate limiting
- [ ] Set up database connection pooling

### Generate Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Environment Template

```bash
# Required Production Settings
NODE_ENV=production
JWT_SECRET=<generated-64-char-hex>
SESSION_SECRET=<generated-64-char-hex>
SECURITY_ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SSRF_ALLOWED_DOMAINS=api.openai.com,api.stripe.com
MFA_ENFORCE_FOR_ADMIN=true

# Database
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_admin
POSTGRES_PASSWORD=<secure-password>

# Backup
BACKUP_S3_ENABLED=true
AWS_S3_BUCKET=your-backup-bucket
BACKUP_RETENTION_DAYS=30

# Security Monitoring
SECURITY_ALERT_ENABLED=true
SECURITY_CHECK_INTERVAL=60000
```

### Deployment Commands

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm run prisma:migrate:deploy

# Start production server
NODE_ENV=production pnpm start
```

---

## Support

For questions or issues:
- **Documentation**: https://docs.nova-universe.com
- **API Support**: api-support@nova-universe.com
- **Security Issues**: security@nova-universe.com

---

**Last Updated:** October 6, 2025
**API Version:** V1 (2025.08)
