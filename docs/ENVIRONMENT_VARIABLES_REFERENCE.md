# Environment Variables Reference Guide

## Quick Start

Copy this template to your `.env` file and customize the values:

```bash
# ====================================================================
# NOVA UNIVERSE ENVIRONMENT VARIABLES
# ====================================================================

# ====================================================================
# 🔴 REQUIRED - CRITICAL INFRASTRUCTURE
# ====================================================================

# Database Configuration (PostgreSQL)
CORE_DATABASE_URL=postgresql://nova_user:your_secure_password@localhost:5432/nova_core
AUTH_DATABASE_URL=postgresql://nova_auth_user:your_auth_password@localhost:5432/nova_auth
AUDIT_DATABASE_URL=mongodb://nova_audit_user:your_audit_password@localhost:27017/nova_audit

# Alternative individual database settings (if not using URLs)
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=nova_core
CORE_DB_USER=nova_user
CORE_DB_PASSWORD=your_secure_password

AUTH_DB_HOST=localhost
AUTH_DB_PORT=5432
AUTH_DB_NAME=nova_auth
AUTH_DB_USER=nova_auth_user
AUTH_DB_PASSWORD=your_auth_password

# Security Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-must-be-32-chars-minimum
SESSION_SECRET=your-session-secret-must-be-32-chars-minimum
ASSET_ENCRYPTION_KEY=your-64-character-hex-encryption-key

# Integration Tokens
SCIM_TOKEN=your-scim-integration-token
KIOSK_TOKEN=your-kiosk-authentication-token

# Deployment Settings
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=https://helpdesk.yourcompany.com

# ====================================================================
# 🟡 REQUIRED - EMAIL (if email features enabled)
# ====================================================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@yourcompany.com
SMTP_PASS=your-app-specific-password
SMTP_SECURE=true

# ====================================================================
# 🟢 OPTIONAL - DATABASE ADVANCED
# ====================================================================

# PostgreSQL SSL Configuration
POSTGRES_SSL_CERT=/path/to/client-cert.pem
POSTGRES_SSL_KEY=/path/to/client-key.pem
POSTGRES_SSL_CA=/path/to/ca-cert.pem
POSTGRES_SSL_MODE=require

# Database Pool Settings
POSTGRES_POOL_MIN=2
POSTGRES_POOL_MAX=10
POSTGRES_POOL_IDLE_TIMEOUT=30000

# MongoDB Settings
MONGO_AUTH_SOURCE=admin
MONGO_AUTH_MECHANISM=SCRAM-SHA-1
MONGO_CONNECTION_POOL_SIZE=10
MONGO_CONNECTION_TIMEOUT=30000

# ====================================================================
# 🟢 OPTIONAL - EXTERNAL SERVICES
# ====================================================================

# Elasticsearch
ELASTIC_URL=https://localhost:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=your-elastic-password
ELASTIC_API_KEY=your-elastic-api-key
ELASTIC_CLOUD_ID=your-elastic-cloud-id

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Communication Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
TEAMS_WEBHOOK_URL=https://your-teams-webhook-url

# HelpScout Integration
HELPSCOUT_API_KEY=your-helpscout-api-key
HELPSCOUT_MAILBOX_ID=your-mailbox-id

# Microsoft 365 Integration
M365_CLIENT_ID=your-azure-app-client-id
M365_CLIENT_SECRET=your-azure-app-client-secret
M365_TENANT_ID=your-azure-tenant-id
M365_POLL_INTERVAL_MS=300000

# ====================================================================
# 🔵 OPTIONAL - PERFORMANCE & DEBUGGING
# ====================================================================

# Logging
LOG_LEVEL=info
LOG_RETENTION_DAYS=30
DEBUG_SQL=false
DEBUG_CORS=false

# Redis Cache TTL
REDIS_CONVERSATION_TTL=3600

# AI Processing
CONVERSATION_HISTORY_LIMIT=50
CONTEXT_WINDOW_SIZE=4000
AI_PROCESSING_QUEUE_SIZE=100
AI_PROCESSING_BATCH_SIZE=10

# Elasticsearch Performance
ELASTIC_REQUEST_TIMEOUT=30000
ELASTIC_MAX_RETRIES=3

# ====================================================================
# 🎨 UI CONFIGURABLE (Can be managed via Admin Interface)
# These can be set here as fallbacks, but are better managed via UI
# ====================================================================

# Organization Branding
ORGANIZATION_NAME="Your Company Name"
LOGO_URL="/assets/your-logo.png"
FAVICON_URL="/assets/your-favicon.ico"
PRIMARY_COLOR="#3b82f6"
SECONDARY_COLOR="#64748b"

# Welcome Messages
WELCOME_MESSAGE="Welcome to our helpdesk system"
HELP_MESSAGE="Contact IT support for assistance"

# Status Messages
STATUS_OPEN_MSG="We're here to help!"
STATUS_CLOSED_MSG="Support is currently closed"
STATUS_ERROR_MSG="We're experiencing technical difficulties"
STATUS_MEETING_MSG="Currently in a meeting"
STATUS_BRB_MSG="Be right back"
STATUS_LUNCH_MSG="Out for lunch"
STATUS_UNAVAILABLE_MSG="Currently unavailable"

# Security Policies
MIN_PIN_LENGTH=4
MAX_PIN_LENGTH=8
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
SUBMIT_TICKET_LIMIT=5
API_LOGIN_LIMIT=10

# Feature Toggles
DIRECTORY_ENABLED=true
COSMO_ENABLED=true
AI_TICKET_PROCESSING_ENABLED=false
ML_SENTIMENT_ANALYSIS_ENABLED=false

# Integration Settings
DIRECTORY_PROVIDER=local
COSMO_MODEL_PROVIDER=openai
COSMO_PERSONALITY=professional

# Email Settings
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME="Your Company Support"

# ====================================================================
# 🚀 ADMIN USER (Required for initial setup only)
# ====================================================================

ADMIN_EMAIL=admin@yourcompany.com
ADMIN_NAME="System Administrator"
ADMIN_PASSWORD=TempPassword123!

# Note: Change the admin password immediately after first login!
```

## Required Variables by Environment

### Development Environment
```bash
# Minimal setup for development
NODE_ENV=development
CORE_DATABASE_URL=postgresql://localhost:5432/nova_core_dev
JWT_SECRET=dev-jwt-secret-32-chars-minimum
SESSION_SECRET=dev-session-secret-32-chars-minimum
ASSET_ENCRYPTION_KEY=dev-encryption-key-64-chars
SCIM_TOKEN=dev-scim-token
KIOSK_TOKEN=dev-kiosk-token
```

### Production Environment
```bash
# All critical infrastructure variables required
NODE_ENV=production
# ... (all required variables from template above)
```

### Testing Environment
```bash
# Testing-specific overrides
NODE_ENV=test
CORE_DATABASE_URL=postgresql://localhost:5432/nova_core_test
# ... (minimal required set for tests)
```

## Security Best Practices

### 1. Secret Generation
```bash
# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Generate secure session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Generate encryption key (64-character hex)
ASSET_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Generate secure database password
DB_PASSWORD=$(openssl rand -base64 32)
```

### 2. Environment File Security
```bash
# Set proper permissions on .env file
chmod 600 .env

# Add .env to .gitignore (should already be there)
echo ".env" >> .gitignore
```

### 3. Production Deployment
- Use environment-specific secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly
- Use different secrets for each environment
- Never commit secrets to version control

## Validation Commands

```bash
# Check if all required variables are set
node apps/api/config/validate-env.js

# Test database connections
node apps/api/test/test-connections.js

# Verify configuration system
node scripts/test-configuration.js
```

## Common Issues & Solutions

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U nova_user -d nova_core

# Test MongoDB connection
mongosh "mongodb://localhost:27017/nova_audit"
```

### Missing Environment Variables
The application will show specific error messages for missing required variables. Check the logs for details.

### SSL/TLS Issues
For production deployments with SSL:
```bash
# PostgreSQL SSL
POSTGRES_SSL_MODE=require
POSTGRES_SSL_CERT=/path/to/client-cert.pem

# API HTTPS
TLS_CERT_PATH=/path/to/ssl-cert.pem
TLS_KEY_PATH=/path/to/ssl-key.pem
```

This reference guide provides everything needed to configure Nova Universe for any environment while maintaining security best practices.
