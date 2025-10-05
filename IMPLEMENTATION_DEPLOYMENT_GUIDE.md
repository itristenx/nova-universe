# Nova Universe API - Implementation & Deployment Guide

**Version:** 1.0  
**Last Updated:** $(date +"%Y-%m-%d")  
**Status:** Production Ready (Phase 1 Complete)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Security Configuration](#security-configuration)
4. [Deployment Steps](#deployment-steps)
5. [Testing & Validation](#testing--validation)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Development Environment

```bash
# Clone repository
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development environment
./setup.sh

# Verify API is running
curl http://localhost:3000/health
```

### Production Environment

```bash
# Use production setup script
./scripts/validate-production-security.sh

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Verify health
curl https://your-domain.com/health
```

---

## Pre-Deployment Checklist

### Phase 1: Critical Security (MUST DO)

- [ ] **Review PRODUCTION_SECURITY_CONFIGURATION.md**
- [ ] **Set all required environment variables**
- [ ] **Generate strong random secrets (32+ characters)**
  ```bash
  openssl rand -base64 48  # For JWT_SECRET
  openssl rand -base64 48  # For SESSION_SECRET
  openssl rand -base64 32  # For KIOSK_TOKEN
  openssl rand -base64 32  # For SCIM_TOKEN
  ```
- [ ] **Configure database credentials (no defaults)**
- [ ] **Set CORS_ORIGINS to actual domains (no wildcards)**
- [ ] **Ensure DISABLE_AUTH is not set or is false**
- [ ] **Configure SMTP for email notifications**
- [ ] **Run security validation script**
  ```bash
  ./scripts/validate-production-security.sh
  ```

### Phase 2: Infrastructure Setup

- [ ] **PostgreSQL database is running and accessible**
- [ ] **MongoDB is running for logs and telemetry**
- [ ] **Redis is running for caching and sessions**
- [ ] **SSL/TLS certificates are valid and configured**
- [ ] **DNS records point to your servers**
- [ ] **Firewall rules allow necessary ports**
- [ ] **Backup strategy is in place**

### Phase 3: Application Configuration

- [ ] **Review and customize docker-compose.prod.yml**
- [ ] **Configure Nginx reverse proxy**
- [ ] **Set up monitoring (Uptime Kuma, GoAlert)**
- [ ] **Configure logging aggregation**
- [ ] **Set up alerting rules**
- [ ] **Test database migrations**

### Phase 4: Testing

- [ ] **Run endpoint validation tests**
  ```bash
  node scripts/test-api-endpoints.js
  ```
- [ ] **Run full test suite**
  ```bash
  npm run test:ci
  ```
- [ ] **Security testing**
  ```bash
  npm run test:security
  ```
- [ ] **Performance testing**
  ```bash
  npm run test:performance
  ```
- [ ] **Load testing**
  ```bash
  npm run test:load
  ```

---

## Security Configuration

### Critical Security Settings

#### 1. Environment Variables

Create `.env.production` file:

```bash
# CRITICAL: Never commit this file to version control
# Add to .gitignore

NODE_ENV=production

# Database - NO DEFAULTS IN PRODUCTION
DATABASE_URL=postgresql://user:password@host:5432/database
MONGODB_URI=mongodb://user:password@host:27017/logs?authSource=admin
REDIS_URL=redis://:password@host:6379

# Database Passwords
CORE_DB_PASSWORD=<strong-password>
AUTH_DB_PASSWORD=<strong-password>
AUDIT_DB_PASSWORD=<strong-password>
POSTGRES_PASSWORD=<strong-password>

# Security Tokens - Generate with: openssl rand -base64 48
JWT_SECRET=<48-character-random-string>
SESSION_SECRET=<48-character-random-string>
KIOSK_TOKEN=<32-character-random-string>
SCIM_TOKEN=<32-character-random-string>

# CORS - Specific domains only, NO wildcards
CORS_ORIGINS=https://app.example.com,https://admin.example.com

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=<smtp-password>
SMTP_FROM=Nova Universe <noreply@example.com>
SMTP_SECURE=true

# API Configuration
API_PORT=3000
API_BASE_URL=https://api.example.com

# Feature Flags
ENABLE_AI_COMPONENTS=false
FAST_BOOT=true
```

#### 2. File Permissions

```bash
# Secure .env files
chmod 600 .env.production
chmod 600 .env

# Secure SSL certificates
chmod 600 /path/to/ssl/private.key
chmod 644 /path/to/ssl/certificate.crt

# Verify permissions
ls -la .env* 
```

#### 3. Secrets Management

**Recommended Approach: Use a Secrets Manager**

**Option A: Docker Secrets**
```bash
# Create secrets
echo "my_jwt_secret" | docker secret create jwt_secret -
echo "my_session_secret" | docker secret create session_secret -

# Reference in docker-compose.yml
services:
  nova-api:
    secrets:
      - jwt_secret
      - session_secret
```

**Option B: HashiCorp Vault**
```bash
# Store secrets
vault kv put secret/nova/api \
  jwt_secret="..." \
  session_secret="..."

# Retrieve in startup script
export JWT_SECRET=$(vault kv get -field=jwt_secret secret/nova/api)
```

**Option C: Kubernetes Secrets**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nova-api-secrets
type: Opaque
stringData:
  jwt-secret: "your-secret"
  session-secret: "your-secret"
```

---

## Deployment Steps

### Method 1: Docker Compose (Recommended for Single Server)

```bash
# 1. Prepare environment
cd /opt/nova-universe
git pull origin main

# 2. Validate security
./scripts/validate-production-security.sh

# 3. Build images
docker-compose -f docker-compose.prod.yml build

# 4. Run database migrations
docker-compose -f docker-compose.prod.yml run --rm nova-api npm run migrate

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Verify health
curl https://your-domain.com/health

# 7. Check logs
docker-compose -f docker-compose.prod.yml logs -f nova-api
```

### Method 2: Kubernetes (Recommended for Multi-Server)

```bash
# 1. Create namespace
kubectl create namespace nova-universe

# 2. Create secrets
kubectl create secret generic nova-api-secrets \
  --from-literal=jwt-secret="..." \
  --from-literal=session-secret="..." \
  -n nova-universe

# 3. Apply database secrets
kubectl apply -f k8s/database-secrets.yaml

# 4. Deploy database
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# 5. Deploy API
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml

# 6. Deploy ingress
kubectl apply -f k8s/ingress.yaml

# 7. Verify deployment
kubectl get pods -n nova-universe
kubectl logs -f deployment/nova-api -n nova-universe
```

### Method 3: Traditional Server (systemd)

```bash
# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone and setup
cd /opt
sudo git clone https://github.com/itristenx/nova-universe.git
cd nova-universe
sudo npm install --production

# 3. Create systemd service
sudo tee /etc/systemd/system/nova-api.service > /dev/null <<EOF
[Unit]
Description=Nova Universe API
After=network.target postgresql.service mongodb.service

[Service]
Type=simple
User=nova
Group=nova
WorkingDirectory=/opt/nova-universe/apps/api
EnvironmentFile=/opt/nova-universe/.env.production
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 4. Start service
sudo systemctl daemon-reload
sudo systemctl enable nova-api
sudo systemctl start nova-api

# 5. Check status
sudo systemctl status nova-api
sudo journalctl -u nova-api -f
```

---

## Testing & Validation

### 1. Endpoint Validation

Test all endpoints are responding:

```bash
# Basic test
node scripts/test-api-endpoints.js

# With custom URL
API_URL=https://your-domain.com node scripts/test-api-endpoints.js
```

Expected output:
```
╔══════════════════════════════════════════════════════════════╗
║  Nova Universe API - Endpoint Validation Tests              ║
╚══════════════════════════════════════════════════════════════╝

Health & Monitoring Endpoints:
✓ Basic Health Check: /health → 200
✓ API Health Check: /api/health → 200
✓ Readiness Probe: /ready → 200
...

All tested endpoints are responding!
```

### 2. Security Validation

Run security checks:

```bash
./scripts/validate-production-security.sh
```

Expected output:
```
╔══════════════════════════════════════════════════════════════╗
║  ALL SECURITY VALIDATIONS PASSED - Ready for deployment!    ║
╚══════════════════════════════════════════════════════════════╝
```

### 3. Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test suites
npm run test:security
npm run test:performance
npm run test:load
```

### 4. Health Check Validation

```bash
# Basic health
curl https://your-domain.com/health
# Expected: {"status":"ok"}

# Detailed health
curl https://your-domain.com/api/health
# Expected: {"status":"ok","timestamp":"...","apiVersion":"..."}

# Readiness
curl https://your-domain.com/ready
# Expected: {"ready":true}

# Metrics (requires auth)
curl -H "Authorization: Bearer $TOKEN" https://your-domain.com/metrics
```

---

## Monitoring & Health Checks

### Docker Health Checks

Health checks are configured in Dockerfiles:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

Check health status:
```bash
docker ps
# HEALTHY containers will show in STATUS column
```

### Kubernetes Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```

### External Monitoring

**Uptime Kuma Integration:**
```bash
# Configure in .env
ENABLE_UPTIME_KUMA=true
UPTIME_KUMA_API_URL=http://uptime-kuma:3001
UPTIME_KUMA_API_KEY=your-api-key
```

**GoAlert Integration:**
```bash
# Configure in .env
GOALERT_PROXY_ENABLED=true
GOALERT_API_BASE=http://goalert:8081
GOALERT_API_KEY=your-api-key
```

### Logging

View logs:
```bash
# Docker Compose
docker-compose logs -f nova-api

# Kubernetes
kubectl logs -f deployment/nova-api -n nova-universe

# systemd
sudo journalctl -u nova-api -f
```

---

## Rollback Procedures

### Quick Rollback (Docker Compose)

```bash
# 1. Tag current state
docker tag nova-universe/api:latest nova-universe/api:backup-$(date +%Y%m%d)

# 2. Pull previous version
docker pull nova-universe/api:v1.9.0

# 3. Update docker-compose.yml to use v1.9.0
# 4. Restart services
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# 5. Verify
curl https://your-domain.com/health
```

### Rollback with Git

```bash
# 1. Identify last known good commit
git log --oneline

# 2. Revert to previous version
git revert <commit-hash>
# or
git reset --hard <commit-hash>

# 3. Rebuild and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Database Rollback

```bash
# 1. Stop API
docker-compose -f docker-compose.prod.yml stop nova-api

# 2. Restore database from backup
psql -U nova_admin -d nova_universe < backup-$(date +%Y%m%d).sql

# 3. Restart API
docker-compose -f docker-compose.prod.yml start nova-api
```

---

## Troubleshooting

### Common Issues

#### 1. API Not Starting

**Symptom:** Container starts then exits immediately

**Check:**
```bash
# View logs
docker-compose logs nova-api

# Check environment variables
docker-compose exec nova-api env | grep -E "DATABASE|JWT|SESSION"
```

**Common Causes:**
- Missing required environment variables
- Database connection failure
- Invalid JWT/Session secrets

**Fix:**
```bash
# Validate environment
./scripts/validate-production-security.sh

# Check database connectivity
docker-compose exec nova-api nc -zv postgres 5432
```

#### 2. Health Check Failing

**Symptom:** Container shows as "unhealthy"

**Check:**
```bash
# Manual health check
docker-compose exec nova-api curl -f http://localhost:3000/health

# Check port binding
docker-compose exec nova-api netstat -tlnp | grep 3000
```

**Fix:**
```bash
# Increase health check start period in docker-compose.yml
healthcheck:
  start-period: 60s  # Increase if slow startup
```

#### 3. Database Connection Errors

**Symptom:** "ECONNREFUSED" or "Connection timeout"

**Check:**
```bash
# Verify database is running
docker-compose ps postgres

# Test connection
docker-compose exec nova-api nc -zv postgres 5432

# Check credentials
docker-compose exec postgres psql -U nova_admin -d nova_universe -c "SELECT 1"
```

**Fix:**
```bash
# Restart database
docker-compose restart postgres

# Check DATABASE_URL format
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### 4. CORS Errors

**Symptom:** "CORS policy blocked"

**Check:**
```bash
# Test CORS headers
curl -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: GET" \
  -I https://your-domain.com/api/health
```

**Fix:**
```bash
# Update CORS_ORIGINS in .env
CORS_ORIGINS=https://app.example.com,https://admin.example.com

# Restart API
docker-compose restart nova-api
```

#### 5. Authentication Failures

**Symptom:** All requests return 401

**Check:**
```bash
# Verify JWT_SECRET is set
docker-compose exec nova-api env | grep JWT_SECRET

# Check DISABLE_AUTH is not enabled
docker-compose exec nova-api env | grep DISABLE_AUTH
```

**Fix:**
```bash
# Ensure JWT_SECRET is set and consistent
JWT_SECRET=$(openssl rand -base64 48)

# Restart API
docker-compose restart nova-api
```

### Debug Mode

Enable debug logging:

```bash
# Set in .env
DEBUG=nova:*
LOG_LEVEL=debug

# Restart API
docker-compose restart nova-api

# View detailed logs
docker-compose logs -f nova-api
```

### Get Help

1. **Review Documentation:**
   - COMPREHENSIVE_API_AUDIT_REPORT.md
   - PRODUCTION_SECURITY_CONFIGURATION.md
   - README.md

2. **Check Logs:**
   ```bash
   docker-compose logs -f nova-api
   ```

3. **Run Diagnostics:**
   ```bash
   cd apps/api
   node cli.js health --verbose
   node cli.js diagnostics
   ```

4. **GitHub Issues:**
   - Search existing issues
   - Create new issue with logs and environment details

---

## Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- [ ] Review logs for errors
- [ ] Check disk space
- [ ] Monitor performance metrics

**Monthly:**
- [ ] Update dependencies (security patches)
- [ ] Review and rotate access logs
- [ ] Test backup restore procedures

**Quarterly:**
- [ ] Rotate secrets and credentials
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Update SSL/TLS certificates

### Backup Strategy

**Database Backups:**
```bash
# Daily backup (automated)
0 2 * * * pg_dump -U nova_admin nova_universe > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 tar -czf /backups/full-$(date +\%Y\%m\%d).tar.gz /opt/nova-universe
```

**Restore from Backup:**
```bash
# Stop API
docker-compose stop nova-api

# Restore database
psql -U nova_admin -d nova_universe < /backups/db-20240101.sql

# Restart API
docker-compose start nova-api
```

---

## Appendix

### Environment Variables Reference

See: **PRODUCTION_SECURITY_CONFIGURATION.md**

### API Endpoints Reference

See: **COMPREHENSIVE_API_AUDIT_REPORT.md**

### Architecture Diagrams

See: **README.md**

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Nova Universe Team  
**Support:** GitHub Issues
