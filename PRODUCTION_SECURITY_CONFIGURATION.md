# Production Security Configuration Guide

## ⚠️ CRITICAL: Required Environment Variables

This file documents the required environment variables for production deployment of Nova Universe API. **All of these must be set in production - no defaults are acceptable.**

## Database Credentials

### PostgreSQL (REQUIRED)
```bash
# Primary database connection
export DATABASE_URL="postgresql://username:password@host:5432/database"

# Core database password
export CORE_DB_PASSWORD="<secure-password>"

# Auth database password  
export AUTH_DB_PASSWORD="<secure-password>"

# Audit database password
export AUDIT_DB_PASSWORD="<secure-password>"

# Legacy environment variables (for backward compatibility)
export POSTGRES_DB="nova_universe"
export POSTGRES_USER="nova_admin"
export POSTGRES_PASSWORD="<secure-password>"
```

### MongoDB (REQUIRED)
```bash
export MONGODB_URI="mongodb://username:password@host:27017/nova_logs?authSource=admin"
```

### Redis (REQUIRED)
```bash
export REDIS_URL="redis://:password@host:6379"
```

### Elasticsearch (OPTIONAL)
```bash
export ELASTICSEARCH_URL="http://host:9200"
export ELASTIC_PASSWORD="<secure-password>"
```

## Authentication & Security (REQUIRED)

### JWT and Session Secrets
```bash
# Generate strong random secrets (minimum 32 characters)
export JWT_SECRET="$(openssl rand -base64 48)"
export SESSION_SECRET="$(openssl rand -base64 48)"
```

### API Tokens
```bash
# Kiosk authentication token
export KIOSK_TOKEN="$(openssl rand -base64 32)"

# SCIM provisioning token
export SCIM_TOKEN="$(openssl rand -base64 32)"
```

### SAML Configuration (if using SSO)
```bash
export SAML_CERT="<certificate-content>"
export SAML_PRIVATE_KEY="<private-key-content>"
export SAML_ENTRY_POINT="https://sso.example.com/saml"
export SAML_ISSUER="https://your-domain.com"
export SAML_CALLBACK_URL="https://your-domain.com/api/auth/saml/callback"
```

## Email Configuration (REQUIRED for notifications)

```bash
export SMTP_HOST="smtp.example.com"
export SMTP_PORT="587"
export SMTP_USER="notifications@example.com"
export SMTP_PASS="<secure-password>"
export SMTP_FROM="Nova Universe <noreply@example.com>"
export SMTP_SECURE="true"  # Use TLS
```

## Monitoring & Alerting (OPTIONAL)

### Uptime Kuma
```bash
export ENABLE_UPTIME_KUMA="true"
export UPTIME_KUMA_API_URL="http://uptime-kuma:3001"
export UPTIME_KUMA_API_KEY="<api-key>"
```

### GoAlert
```bash
export GOALERT_PROXY_ENABLED="true"
export GOALERT_API_BASE="http://goalert:8081"
export GOALERT_API_KEY="<api-key>"
```

## Security Settings

### CORS Configuration
```bash
# Comma-separated list of allowed origins (NO WILDCARDS in production)
export CORS_ORIGINS="https://app.example.com,https://admin.example.com"
```

### Rate Limiting
```bash
export RATE_LIMIT_WINDOW="900000"  # 15 minutes in milliseconds
export RATE_LIMIT_MAX="100"         # Max requests per window
export AUTH_LIMIT="5"               # Max auth attempts per window
export SUBMIT_TICKET_LIMIT="10"    # Max ticket submissions per window
```

### Disable Dangerous Flags
```bash
# NEVER set these in production
# export DISABLE_AUTH="false"  # Must be false or unset
# export DEBUG_CORS="false"    # Must be false or unset
```

## Example Production .env File

Create `/home/runner/work/nova-universe/nova-universe/.env.production` with:

```bash
# Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://nova_admin:CHANGE_ME@postgres:5432/nova_universe
MONGODB_URI=mongodb://admin:CHANGE_ME@mongodb:27017/nova_logs?authSource=admin
REDIS_URL=redis://:CHANGE_ME@redis:6379

# Core DB Passwords
CORE_DB_PASSWORD=CHANGE_ME
AUTH_DB_PASSWORD=CHANGE_ME
AUDIT_DB_PASSWORD=CHANGE_ME

# Security (Generate with: openssl rand -base64 48)
JWT_SECRET=CHANGE_ME_MINIMUM_32_CHARS
SESSION_SECRET=CHANGE_ME_MINIMUM_32_CHARS
KIOSK_TOKEN=CHANGE_ME_MINIMUM_32_CHARS
SCIM_TOKEN=CHANGE_ME_MINIMUM_32_CHARS

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=CHANGE_ME
SMTP_FROM=Nova Universe <noreply@example.com>
SMTP_SECURE=true

# CORS (No wildcards!)
CORS_ORIGINS=https://app.example.com,https://admin.example.com

# API Configuration
API_PORT=3000
API_BASE_URL=https://api.example.com

# Feature Flags
ENABLE_AI_COMPONENTS=false
FAST_BOOT=true
ENABLE_UPTIME_KUMA=true
GOALERT_PROXY_ENABLED=true

# Monitoring URLs
UPTIME_KUMA_API_URL=http://uptime-kuma:3001
UPTIME_KUMA_API_KEY=CHANGE_ME
GOALERT_API_BASE=http://goalert:8081
GOALERT_API_KEY=CHANGE_ME
```

## Security Validation Script

Before deploying to production, run:

```bash
./scripts/validate-production-security.sh
```

This script will:
1. ✅ Check all required environment variables are set
2. ✅ Verify no default/placeholder values are used
3. ✅ Validate secret strength (minimum lengths)
4. ✅ Check DISABLE_AUTH is not enabled
5. ✅ Verify CORS is not set to wildcard
6. ✅ Confirm SSL/TLS is configured

## Secrets Management Recommendations

### Using Docker Secrets (Recommended)
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
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - SESSION_SECRET_FILE=/run/secrets/session_secret
```

### Using Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nova-api-secrets
type: Opaque
stringData:
  jwt-secret: "your-jwt-secret"
  session-secret: "your-session-secret"
  postgres-password: "your-db-password"
```

### Using HashiCorp Vault
```bash
# Store secrets
vault kv put secret/nova/api \
  jwt_secret="..." \
  session_secret="..." \
  postgres_password="..."

# Retrieve in startup script
export JWT_SECRET=$(vault kv get -field=jwt_secret secret/nova/api)
```

### Using AWS Secrets Manager
```bash
# Store secret
aws secretsmanager create-secret \
  --name nova/api/jwt-secret \
  --secret-string "your-jwt-secret"

# Retrieve in application startup
JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id nova/api/jwt-secret \
  --query SecretString \
  --output text)
```

## Pre-Deployment Checklist

- [ ] All required environment variables are set
- [ ] All passwords are strong (minimum 20 characters, random)
- [ ] JWT_SECRET and SESSION_SECRET are unique and random (48+ chars)
- [ ] KIOSK_TOKEN and SCIM_TOKEN are set (32+ chars)
- [ ] DISABLE_AUTH is NOT set or is explicitly "false"
- [ ] CORS_ORIGINS lists only your actual domains (no wildcards)
- [ ] SMTP credentials are configured and tested
- [ ] Database connection strings use secure passwords
- [ ] SSL/TLS certificates are valid and properly configured
- [ ] Secrets are stored in a secure secrets manager
- [ ] Backup of all secrets is stored securely offline
- [ ] Security validation script passes: `./scripts/validate-production-security.sh`

## Incident Response

If credentials are compromised:

1. **Immediately** rotate the affected credentials
2. Update the secret in your secrets manager
3. Restart affected services with new credentials
4. Audit logs for unauthorized access
5. Review and update security procedures

## Support

For security questions or concerns:
- Review: COMPREHENSIVE_API_AUDIT_REPORT.md
- Security issues: Create a private security advisory on GitHub
- Compliance questions: Contact your security team

---

**Last Updated:** $(date +"%Y-%m-%d")  
**Version:** 1.0  
**Severity:** CRITICAL - Must be implemented before production deployment
