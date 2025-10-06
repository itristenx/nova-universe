# Nova Universe API - Production Deployment Guide
**Version:** 1.0.0  
**Last Updated:** October 5, 2025  
**Environment:** Production

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Deployment Steps](#pre-deployment-steps)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Validation](#post-deployment-validation)
6. [Rollback Procedure](#rollback-procedure)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides step-by-step instructions for deploying the Nova Universe API to production using Docker containers with comprehensive security hardening and monitoring.

**Deployment Strategy:** Blue-Green Deployment with zero-downtime  
**Container Orchestration:** Docker Compose (Kubernetes optional)  
**High Availability:** Yes (horizontal scaling supported)

---

## Prerequisites

### System Requirements

**Hardware:**
- CPU: 4 cores minimum (8 cores recommended)
- RAM: 8GB minimum (16GB recommended)
- Disk: 100GB SSD minimum
- Network: 1Gbps

**Software:**
- Docker: 24.0+ 
- Docker Compose: 2.20+
- Git: 2.40+
- OpenSSL: 3.0+
- curl/wget for health checks

### Access Requirements

- [ ] Server SSH access with sudo privileges
- [ ] Docker Hub or private registry credentials
- [ ] Domain name with DNS control
- [ ] SSL/TLS certificates (Let's Encrypt or CA-issued)
- [ ] Database credentials
- [ ] Third-party service API keys (if applicable)

---

## Pre-Deployment Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/nova-universe.git
cd nova-universe

# Checkout production branch
git checkout main
git pull origin main
```

### Step 2: Generate Secrets

```bash
# Create secrets directory
mkdir -p deploy/docker/production/secrets

# Generate cryptographically secure secrets
cd deploy/docker/production/secrets

# PostgreSQL password
openssl rand -base64 32 > postgres_password.txt

# MongoDB root password
openssl rand -base64 32 > mongodb_root_password.txt

# Redis password
openssl rand -base64 32 > redis_password.txt

# JWT secret
openssl rand -base64 48 > jwt_secret.txt

# Session secret
openssl rand -base64 48 > session_secret.txt

# Secure the secrets directory
chmod 700 ../secrets
chmod 600 ../secrets/*.txt
```

### Step 3: Configure Environment Variables

```bash
# Copy environment template
cp deploy/env/.env.production.template deploy/docker/production/.env.production

# Edit the file with your configuration
nano deploy/docker/production/.env.production
```

**Critical Environment Variables:**

```bash
# Application
NODE_ENV=production
PORT=3000
TZ=UTC

# Security - REQUIRED
SESSION_SECRET=<generate-with-openssl-rand-base64-48>
JWT_SECRET=<generate-with-openssl-rand-base64-48>

# Multi-Factor Authentication (MFA)
MFA_ISSUER=Nova Universe
MFA_WINDOW=2
MFA_CODE_LENGTH=6

# Database
POSTGRES_DB=nova_universe_prod
POSTGRES_USER=nova_admin
# Password loaded from secret file

# Public URLs
PUBLIC_URL=https://nova.yourdomain.com
API_BASE_URL=https://api.nova.yourdomain.com
CORS_ORIGINS=https://nova.yourdomain.com,https://admin.yourdomain.com

# Email/SMTP
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_FROM="Nova Universe <noreply@yourdomain.com>"

# Security
BCRYPT_ROUNDS=14
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
SESSION_SECURE=true
SESSION_SAME_SITE=strict

# SSRF Protection (Optional - whitelist allowed domains)
SSRF_ALLOWED_DOMAINS=example.com,api.partner.com

# Monitoring (optional)
# SENTRY_DSN=https://your-sentry-dsn
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
# SECURITY_SLACK_WEBHOOK=https://hooks.slack.com/services/... (for security alerts)
```

### Step 4: SSL/TLS Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone \
  -d api.nova.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos

# Copy certificates
sudo cp /etc/letsencrypt/live/api.nova.yourdomain.com/fullchain.pem \
  deploy/docker/production/config/nginx/ssl/server.crt
sudo cp /etc/letsencrypt/live/api.nova.yourdomain.com/privkey.pem \
  deploy/docker/production/config/nginx/ssl/server.key

# Set permissions
chmod 644 deploy/docker/production/config/nginx/ssl/server.crt
chmod 600 deploy/docker/production/config/nginx/ssl/server.key
```

**Option B: CA-Issued Certificate**

Place your certificates in:
- `deploy/docker/production/config/nginx/ssl/server.crt`
- `deploy/docker/production/config/nginx/ssl/server.key`

### Step 5: Configure Nginx

```bash
# Edit Nginx configuration
nano deploy/docker/production/config/nginx/nginx.conf
```

**Sample Configuration:**

```nginx
upstream nova_api {
    least_conn;
    server api:3000 max_fails=3 fail_timeout=30s;
    # Add more servers for horizontal scaling
    # server api2:3000 max_fails=3 fail_timeout=30s;
    # server api3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.nova.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.nova.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # Proxy Configuration
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health Check
    location /health {
        proxy_pass http://nova_api/health;
        access_log off;
    }
}
```

### Step 6: Build Docker Image

```bash
cd deploy/docker/production

# Build the production image
docker build \
  -f ../../../apps/api/Dockerfile.production \
  -t nova-universe/api:1.0.0 \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=1.0.0 \
  ../../..

# Tag as latest
docker tag nova-universe/api:1.0.0 nova-universe/api:latest

# Scan for vulnerabilities
docker scan nova-universe/api:1.0.0
```

### Step 7: Run Security Hardening Script

```bash
# Run security validation
cd ../../../
chmod +x scripts/security-hardening.sh
./scripts/security-hardening.sh

# Address any CRITICAL or HIGH issues before proceeding
```

---

## Deployment Process

### Phase 1: Database Initialization

```bash
cd deploy/docker/production

# Start database services only
docker-compose -f docker-compose.production.yml up -d postgres mongodb redis

# Wait for databases to be healthy
docker-compose -f docker-compose.production.yml ps

# Run database migrations
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U nova_admin -d nova_universe_prod -c "SELECT version();"

# Optional: Restore from backup
# docker-compose -f docker-compose.production.yml exec postgres \
#   pg_restore -U nova_admin -d nova_universe_prod /backups/latest.dump
```

### Phase 2: Application Deployment

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f api
```

### Phase 3: Smoke Testing

```bash
# Test health endpoint
curl -f https://api.nova.yourdomain.com/health

# Test authentication
curl -X POST https://api.nova.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Test protected endpoint
curl -H "Authorization: Bearer <token>" \
  https://api.nova.yourdomain.com/api/tickets
```

---

## Post-Deployment Validation

### Automated Validation

```bash
# Run integration tests against production
TEST_API_URL=https://api.nova.yourdomain.com npm run test:integration

# Run security tests
TEST_API_URL=https://api.nova.yourdomain.com npm run test:security
```

### Manual Validation Checklist

- [ ] Health check endpoint returns 200 OK
- [ ] User registration works
- [ ] User login works
- [ ] Create ticket works
- [ ] Database queries successful
- [ ] Redis caching functional
- [ ] Logs being written
- [ ] Metrics being collected
- [ ] SSL certificate valid
- [ ] HTTPS enforced (HTTP redirects)
- [ ] Rate limiting working
- [ ] Email notifications sent
- [ ] Backups running

### Performance Baseline

```bash
# Quick load test
ab -n 1000 -c 10 https://api.nova.yourdomain.com/health

# Monitor resource usage
docker stats
```

---

## Security Features

### Multi-Factor Authentication (MFA)

The API now supports Time-based One-Time Password (TOTP) authentication following RFC 6238.

**Enable MFA for Users:**

1. Users navigate to their profile settings
2. Click "Enable MFA" 
3. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
4. Enter the 6-digit code to verify setup
5. Save the backup codes in a secure location

**API Endpoints:**
- `POST /api/v1/mfa/setup` - Generate MFA secret and QR code
- `POST /api/v1/mfa/enable` - Enable MFA with verification
- `POST /api/v1/mfa/disable` - Disable MFA (requires password)
- `POST /api/v1/mfa/verify` - Verify MFA during login
- `GET /api/v1/mfa/status` - Get MFA status

**Database Migration:**
```bash
# Run MFA migration
psql -U nova_admin -d nova_universe_prod < apps/api/migrations/007_add_mfa_support.sql
```

### Comprehensive Audit Logging

All security-relevant events are logged to the `audit_logs` and `security_events` tables.

**Logged Events:**
- Authentication attempts (login, logout, MFA)
- User management (create, update, delete, role changes)
- Resource access (view, create, update, delete)
- Security events (unauthorized access, rate limiting, suspicious activity)
- Configuration changes
- Data operations (import, export, bulk operations)

**Database Migration:**
```bash
# Run audit logging migration
psql -U nova_admin -d nova_universe_prod < apps/api/migrations/008_comprehensive_audit_logging.sql
```

**Query Audit Logs:**
```bash
# View recent audit logs
psql -U nova_admin -d nova_universe_prod -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50;"

# View security events
psql -U nova_admin -d nova_universe_prod -c "SELECT * FROM recent_security_events LIMIT 20;"

# User activity summary
psql -U nova_admin -d nova_universe_prod -c "SELECT * FROM user_activity_summary;"
```

**Automatic Cleanup:**
```bash
# Clean old logs (runs periodically via cron)
psql -U nova_admin -d nova_universe_prod -c "SELECT clean_old_audit_logs();"
```

### SSRF Protection

The API includes Server-Side Request Forgery (SSRF) protection for all external HTTP requests.

**Protected Actions:**
- Webhook URLs
- Integration endpoints
- External API calls
- File downloads from URLs

**Configuration:**
```bash
# Whitelist allowed domains (optional)
SSRF_ALLOWED_DOMAINS=example.com,api.partner.com

# Security alerts webhook
SECURITY_SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

**Blocked IP Ranges:**
- Localhost (127.0.0.0/8, ::1)
- Private networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Link-local (169.254.0.0/16)
- Metadata services (169.254.169.254)

**API Usage:**
```javascript
import ssrfProtection from './services/ssrf-protection.js';

// Validate URL
const validation = await ssrfProtection.validateURL(url);
if (!validation.valid) {
  return res.status(400).json({ error: validation.reason });
}

// Safe HTTP request
const response = await ssrfProtection.safeRequest(url, options);
```

### Authentication Changes

**IMPORTANT:** The `DISABLE_AUTH` feature has been completely removed for security compliance.

- Authentication is now **always required** in production
- All endpoints require valid JWT tokens or session authentication
- API keys and SCIM tokens still supported for integrations
- SAML SSO continues to work as configured

**Removed Environment Variables:**
- `DISABLE_AUTH` - No longer supported

---

## Monitoring Setup

### Prometheus Metrics

Access Prometheus at: `http://your-server:9090`

**Key Metrics to Monitor:**
- API request rate
- Response times (p50, p95, p99)
- Error rates
- Database connection pool
- Memory usage
- CPU usage

### Grafana Dashboards

Access Grafana at: `http://your-server:3001`

**Default Credentials:**
- Username: admin
- Password: (set in .env)

**Import Dashboards:**
1. Node.js Application Monitoring
2. PostgreSQL Monitoring
3. Redis Monitoring
4. Nginx Monitoring

### Log Aggregation

```bash
# View aggregated logs
docker-compose -f docker-compose.production.yml logs -f --tail=100

# Search logs
docker-compose -f docker-compose.production.yml logs api | grep ERROR
```

### Alerting

Configure alerts in `config/prometheus/alerts/`:

```yaml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        annotations:
          summary: "PostgreSQL is down"
```

---

## Scaling

### Horizontal Scaling

```bash
# Scale API service to 3 instances
docker-compose -f docker-compose.production.yml up -d --scale api=3

# Verify load balancing
curl https://api.nova.yourdomain.com/health
```

### Database Scaling

**Read Replicas:**
- Configure PostgreSQL streaming replication
- Update connection pool to use read replicas for SELECT queries

**Connection Pooling:**
- Increase `POSTGRES_POOL_MAX` for higher concurrency

---

## Rollback Procedure

### Immediate Rollback

```bash
# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Restore previous image
docker-compose -f docker-compose.production.yml pull api:previous

# Start with previous version
docker-compose -f docker-compose.production.yml up -d
```

### Database Rollback

```bash
# Stop API
docker-compose -f docker-compose.production.yml stop api

# Restore database from backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_restore -U nova_admin -d nova_universe_prod /backups/pre-deployment.dump

# Restart API
docker-compose -f docker-compose.production.yml start api
```

---

## Backup & Recovery

### Automated Backups

Backups run daily at 2 AM (configurable via `BACKUP_SCHEDULE`):

```bash
# Manual backup trigger
docker-compose -f docker-compose.production.yml exec backup /backup.sh

# Verify backup
ls -lh backups/postgres/
ls -lh backups/mongodb/
```

### Restore Procedure

```bash
# Restore PostgreSQL
docker-compose -f docker-compose.production.yml exec postgres \
  pg_restore -U nova_admin -d nova_universe_prod /backups/backup_YYYY-MM-DD.dump

# Restore MongoDB
docker-compose -f docker-compose.production.yml exec mongodb \
  mongorestore --username admin --password <password> \
  --authenticationDatabase admin /backups/backup_YYYY-MM-DD/
```

---

## Troubleshooting

### API Won't Start

**Symptom:** Container exits immediately

**Diagnosis:**
```bash
docker-compose -f docker-compose.production.yml logs api
docker-compose -f docker-compose.production.yml exec api cat /app/logs/error.log
```

**Common Causes:**
- Missing environment variables
- Database connection failure
- Port already in use
- Missing secrets file

### High Memory Usage

**Diagnosis:**
```bash
docker stats
```

**Solutions:**
- Reduce connection pool size
- Implement pagination
- Enable caching
- Scale horizontally

### Slow Response Times

**Diagnosis:**
```bash
# Check database query performance
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U nova_admin -d nova_universe_prod \
  -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

**Solutions:**
- Add database indexes
- Optimize queries
- Increase cache TTL
- Scale resources

### Database Connection Errors

**Diagnosis:**
```bash
docker-compose -f docker-compose.production.yml logs postgres
```

**Solutions:**
- Check `POSTGRES_POOL_MAX` settings
- Verify database is healthy
- Check network connectivity
- Review connection string

---

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check backup completion
- Review alert notifications

**Weekly:**
- Review performance metrics
- Check disk space usage
- Update SSL certificates if needed
- Review security logs

**Monthly:**
- Update dependencies (npm audit)
- Review and rotate logs
- Test disaster recovery
- Security audit

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild image
docker build -f apps/api/Dockerfile.production -t nova-universe/api:1.0.1 .

# Update with zero downtime (blue-green)
docker-compose -f docker-compose.production.yml up -d --no-deps --build api

# Verify new version
curl https://api.nova.yourdomain.com/health
```

---

## Support & Contacts

**Emergency Contact:** devops@nova-universe.com  
**Documentation:** https://docs.nova-universe.com  
**Issue Tracking:** https://github.com/your-org/nova-universe/issues

---

**Deployment Completed:** ____________  
**Deployed By:** ____________  
**Version:** ____________  
**Notes:** ____________
