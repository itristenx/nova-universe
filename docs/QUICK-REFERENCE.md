# Nova Universe API - Quick Reference Guide

**Last Updated:** October 5, 2025  
**For:** Developers, DevOps, QA

---

## 🚀 Quick Start Commands

### Development

```bash
# Start development environment
./dev.sh

# Start API only (requires databases running)
cd apps/api && npm run dev

# Run all tests
npm run test:all

# Run specific test suite
npm run test:integration
npm run test:security
npm run test:e2e
```

### Production Deployment

```bash
# Security validation (run first!)
./scripts/security-hardening.sh

# Build production image
docker build -f apps/api/Dockerfile.production -t nova-api:latest .

# Deploy to production
cd deploy/docker/production
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f api
```

---

## 📋 Critical Issues Checklist

Before production deployment, ensure all items are complete:

### 🔴 CRITICAL BLOCKERS
- [ ] Generate missing Prisma clients (`npx prisma generate`)
- [ ] Implement Multi-Factor Authentication (MFA)
- [ ] Complete comprehensive audit logging
- [ ] Add SSRF protection
- [ ] Run and pass all test suites

### 🟡 HIGH PRIORITY
- [ ] Verify RBAC implementation
- [ ] Set up automated dependency scanning
- [ ] Configure monitoring (Prometheus + Grafana)
- [ ] Implement file integrity checks

---

## 🔒 Security Quick Checks

```bash
# Run security hardening validation
./scripts/security-hardening.sh

# Check for vulnerabilities
npm audit --production

# Verify environment variables
grep -E "^(JWT_SECRET|SESSION_SECRET|POSTGRES_PASSWORD)=" .env | \
  awk -F= '{print length($2), $1}'
# All should be 32+ characters

# Check file permissions
ls -la .env
# Should be -rw------- (600)
```

---

## 🧪 Testing Quick Reference

### Run All Tests
```bash
npm run test:all
```

### Run Specific Tests
```bash
# Integration tests
npm run test:integration

# Security tests  
npm run test:security

# Performance tests
npm run test:performance

# E2E tests (new comprehensive suite)
NODE_OPTIONS=--experimental-vm-modules node --test test/e2e-comprehensive.test.js

# With coverage
npm run test:all -- --coverage
```

### Test Against Production
```bash
TEST_API_URL=https://api.your-domain.com npm run test:integration
```

---

## 🐳 Docker Quick Commands

### Build
```bash
# Development
docker build -f apps/api/Dockerfile -t nova-api:dev .

# Production
docker build -f apps/api/Dockerfile.production -t nova-api:prod .

# With build args
docker build \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  -f apps/api/Dockerfile.production \
  -t nova-api:1.0.0 .
```

### Run
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres

# Scale API
docker-compose up -d --scale api=3

# View logs
docker-compose logs -f api

# Execute command in container
docker-compose exec api sh
```

### Maintenance
```bash
# Stop all services
docker-compose down

# Remove volumes (DESTRUCTIVE!)
docker-compose down -v

# Rebuild service
docker-compose up -d --build api

# Clean up
docker system prune -a
```

---

## 📊 Monitoring & Health Checks

### Health Endpoints
```bash
# API health
curl http://localhost:3000/health

# Detailed health
curl http://localhost:3000/api/monitoring/health

# Metrics (Prometheus format)
curl http://localhost:3000/metrics
```

### Monitoring Dashboards
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001 (admin/admin)
- **API Docs:** http://localhost:3000/api-docs

### Log Access
```bash
# Application logs
docker-compose exec api cat /app/logs/app.log

# Error logs
docker-compose exec api cat /app/logs/error.log

# Database logs
docker-compose logs postgres

# All logs
docker-compose logs --tail=100 -f
```

---

## 🗄️ Database Quick Commands

### PostgreSQL
```bash
# Connect to database
docker-compose exec postgres psql -U nova_admin -d nova_universe

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Database backup
docker-compose exec postgres pg_dump \
  -U nova_admin nova_universe > backup.sql

# Database restore
docker-compose exec -T postgres psql \
  -U nova_admin nova_universe < backup.sql
```

### MongoDB
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh \
  -u admin -p <password> --authenticationDatabase admin

# Backup
docker-compose exec mongodb mongodump \
  --username admin --password <password> \
  --authenticationDatabase admin --out /backups/

# Restore
docker-compose exec mongodb mongorestore \
  --username admin --password <password> \
  --authenticationDatabase admin /backups/
```

### Redis
```bash
# Connect to Redis
docker-compose exec redis redis-cli -a <password>

# Check cache
docker-compose exec redis redis-cli -a <password> KEYS '*'

# Clear cache
docker-compose exec redis redis-cli -a <password> FLUSHALL
```

---

## 🔧 Troubleshooting Quick Fixes

### API Won't Start

```bash
# Check logs
docker-compose logs api | tail -50

# Verify environment variables
docker-compose config

# Check dependencies
docker-compose exec api npm ls

# Regenerate Prisma clients
docker-compose exec api npx prisma generate
```

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps postgres

# Check health
docker-compose exec postgres pg_isready

# Verify credentials
echo $POSTGRES_PASSWORD

# Test connection
docker-compose exec postgres psql \
  -U nova_admin -d nova_universe -c "SELECT 1;"
```

### Memory Issues

```bash
# Check resource usage
docker stats

# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 node index.js

# Adjust in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```

### Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Use different port
API_PORT=3001 npm run dev
```

---

## 🔐 Security Quick Reference

### Generate Secure Secrets

```bash
# JWT Secret (48 bytes = 64 chars base64)
openssl rand -base64 48

# Session Secret
openssl rand -base64 48

# Database Password
openssl rand -base64 32

# API Keys
openssl rand -hex 32

# Encryption Key (64 hex chars)
openssl rand -hex 32
```

### SSL/TLS Certificates

```bash
# Generate self-signed (development only!)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key -out server.crt

# Let's Encrypt (production)
certbot certonly --standalone -d api.your-domain.com
```

### Password Strength Check

```bash
# Minimum requirements:
# - 8+ characters
# - 1 uppercase
# - 1 lowercase  
# - 1 number
# - 1 special character

# Test password strength
echo "YourPassword123!" | \
  grep -E '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
```

---

## 📁 Important File Locations

### Configuration
- `apps/api/.env` - Environment variables (development)
- `deploy/docker/production/.env.production` - Production environment
- `apps/api/package.json` - Dependencies
- `docker-compose.yml` - Development orchestration
- `deploy/docker/production/docker-compose.production.yml` - Production orchestration

### Code
- `apps/api/index.js` - Main entry point
- `apps/api/routes/` - API routes
- `apps/api/middleware/` - Express middleware
- `apps/api/services/` - Business logic
- `apps/api/models/` - Data models

### Tests
- `test/e2e-comprehensive.test.js` - E2E tests (NEW)
- `test/integration-testing.test.js` - Integration tests
- `test/security-testing.test.js` - Security tests
- `test/performance-testing.test.js` - Performance tests

### Documentation
- `docs/API-PRODUCTION-READINESS-REPORT.md` - Full analysis
- `docs/PRODUCTION-SECURITY-CHECKLIST.md` - Security checklist
- `docs/PRODUCTION-DEPLOYMENT-GUIDE.md` - Deployment guide
- `docs/PROJECT-COMPLETION-SUMMARY.md` - Project summary

### Scripts
- `scripts/security-hardening.sh` - Security validation
- `dev.sh` - Start development environment
- `setup.sh` - Initial setup

---

## 🆘 Getting Help

### Documentation
- **API Docs:** http://localhost:3000/api-docs
- **OpenAPI Spec:** `apps/api/openapi_spec.yaml`
- **README:** `README.md` in project root

### Common Issues & Solutions

**Issue:** "Cannot find module @prisma/client"  
**Solution:** Run `npx prisma generate`

**Issue:** "ECONNREFUSED postgres:5432"  
**Solution:** Start database with `docker-compose up -d postgres`

**Issue:** "JWT malformed"  
**Solution:** Generate new token via `/api/auth/login`

**Issue:** "Port 3000 already in use"  
**Solution:** `lsof -i :3000` and kill process or use different port

**Issue:** "Permission denied"  
**Solution:** Check file permissions, run with sudo if needed

### Support Channels
- **Issues:** GitHub Issues
- **Email:** devops@nova-universe.com
- **Docs:** https://docs.nova-universe.com

---

## 🎯 Production Deployment Checklist

Before deploying to production, verify:

- [ ] All CRITICAL issues resolved
- [ ] Security hardening script passes
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Secrets generated and secured
- [ ] SSL certificates valid
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Logs aggregation configured
- [ ] Rollback plan ready
- [ ] Team notified

---

## 📈 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Health Check | < 50ms | < 100ms |
| Authentication | < 200ms | < 500ms |
| CRUD Operations | < 300ms | < 800ms |
| Search | < 500ms | < 1000ms |
| Error Rate | < 0.1% | < 1% |
| Uptime | > 99.9% | > 99.5% |

---

**Quick Reference Version:** 1.0  
**Last Updated:** October 5, 2025  
**Maintainer:** DevOps Team
