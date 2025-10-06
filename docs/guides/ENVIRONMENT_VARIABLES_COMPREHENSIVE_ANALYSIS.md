# Nova Universe Environment Variables - Comprehensive Analysis

## Summary

This document analyzes all environment variables in the Nova Universe codebase and provides a complete classification of which ones can be moved to UI-based configuration versus those that must remain as environment variables.

## Environment Variable Categories

### 1. CRITICAL INFRASTRUCTURE (Must Remain Environment Variables)

These variables MUST stay as environment variables for security, deployment flexibility, and operational integrity:

#### Database Connection & Authentication

**Required Variables:**

- `CORE_DATABASE_URL` - PostgreSQL connection string for core data
- `AUTH_DATABASE_URL` - PostgreSQL connection string for auth data
- `AUDIT_DATABASE_URL` - MongoDB connection string for audit logs
- `CORE_DB_HOST`, `CORE_DB_PORT`, `CORE_DB_NAME`, `CORE_DB_USER`, `CORE_DB_PASSWORD`
- `AUTH_DB_HOST`, `AUTH_DB_PORT`, `AUTH_DB_NAME`, `AUTH_DB_USER`, `AUTH_DB_PASSWORD`
- `AUDIT_DB_USER`, `AUDIT_DB_PASSWORD`

**Optional Database Variables:**

- `POSTGRES_SSL_*` - SSL certificate paths and settings
- `MONGO_AUTH_SOURCE`, `MONGO_AUTH_MECHANISM`
- `ELASTIC_URL`, `ELASTIC_USERNAME`, `ELASTIC_PASSWORD`, `ELASTIC_API_KEY`, `ELASTIC_CLOUD_ID`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`

**Example:**

```bash
# Core PostgreSQL Database (Required)
CORE_DATABASE_URL=postgresql://nova_user:secure_password_123@localhost:5432/nova_core
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=nova_core
CORE_DB_USER=nova_user
CORE_DB_PASSWORD=secure_password_123

# Generate secure password: openssl rand -base64 32
```

#### Security & Cryptography

**Required Variables:**

- `JWT_SECRET` - Token signing secret (min 32 characters)
- `SESSION_SECRET` - Session encryption secret (min 32 characters)
- `ASSET_ENCRYPTION_KEY` - Asset encryption key (64 hex characters)

**Optional Security Variables:**

- `TLS_CERT_PATH`, `TLS_KEY_PATH` - SSL certificate paths
- `POSTGRES_SSL_*` - Database SSL configuration

**Example:**

```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ASSET_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Example values
JWT_SECRET=YourSecureJWTSecretMustBe32CharsMin
SESSION_SECRET=YourSecureSessionSecretMustBe32CharsMin
ASSET_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

#### External Service Credentials

**Required Variables:**

- `SCIM_TOKEN` - SCIM integration authentication token
- `KIOSK_TOKEN` - Kiosk authentication token

**Optional External Service Variables:**

- `SLACK_WEBHOOK_URL` - Slack integration webhook
- `TEAMS_WEBHOOK_URL` - Microsoft Teams webhook
- `OPENAI_API_KEY` - OpenAI API access
- `ANTHROPIC_API_KEY` - Anthropic API access
- `HELPSCOUT_API_KEY`, `HELPSCOUT_MAILBOX_ID` - HelpScout integration

**Example:**

```bash
# SCIM Integration (Required for directory sync)
SCIM_TOKEN=scim_token_from_your_identity_provider

# Kiosk Authentication (Required for kiosk operations)
KIOSK_TOKEN=secure_kiosk_token_123

# External Services (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Email/SMTP Configuration

**Required Variables (if email enabled):**

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (typically 587 or 25)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password

**Optional Email Variables:**

- `SMTP_SECURE` - Enable TLS (true/false)
- `FROM_EMAIL`, `FROM_NAME` - Default sender info
- `M365_CLIENT_ID`, `M365_CLIENT_SECRET`, `M365_TENANT_ID` - Microsoft 365 integration

**Example:**

```bash
# SMTP Configuration (Required for email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_SECURE=true

# Microsoft 365 (Optional)
M365_CLIENT_ID=your-azure-app-client-id
M365_CLIENT_SECRET=your-azure-app-client-secret
M365_TENANT_ID=your-azure-tenant-id
```

#### Deployment Environment

**Required Variables:**

- `NODE_ENV` - Environment mode (development/production/test)
- `PORT` - Server port (default: 3000)

**Optional Deployment Variables:**

- `HOST` - Server hostname (default: localhost)
- `PUBLIC_URL` - Public-facing URL
- `API_URL` - API base URL

**Example:**

```bash
# Deployment Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=https://helpdesk.yourcompany.com
API_URL=https://api.helpdesk.yourcompany.com
```

### 2. UI CONFIGURABLE (Can Move to Database/Admin UI)

These variables can be safely moved to UI-based configuration with environment variable fallbacks:

#### Organization Branding

- `ORGANIZATION_NAME` - Organization display name
- `LOGO_URL` - Organization logo URL/path
- `FAVICON_URL` - Browser favicon URL/path
- `PRIMARY_COLOR`, `SECONDARY_COLOR` - Brand colors

#### Application Messages & Content

- `WELCOME_MESSAGE` - Main welcome message
- `HELP_MESSAGE` - Help text displayed to users
- `STATUS_OPEN_MSG`, `STATUS_CLOSED_MSG`, `STATUS_ERROR_MSG` - Status messages
- `STATUS_MEETING_MSG`, `STATUS_BRB_MSG`, `STATUS_LUNCH_MSG`, `STATUS_UNAVAILABLE_MSG`

#### Security Policies

- `MIN_PIN_LENGTH`, `MAX_PIN_LENGTH` - PIN length requirements
- `RATE_LIMIT_WINDOW`, `RATE_LIMIT_MAX` - Rate limiting configuration
- `SUBMIT_TICKET_LIMIT`, `API_LOGIN_LIMIT`, `AUTH_LIMIT` - Request limits

#### Feature Toggles

- `DIRECTORY_ENABLED` - Enable directory integration
- `COSMO_ENABLED` - Enable Cosmo AI assistant
- `AI_TICKET_PROCESSING_ENABLED` - Enable AI ticket processing
- `ML_SENTIMENT_ANALYSIS_ENABLED` - Enable sentiment analysis
- Various AI/ML feature flags

#### Integration Settings (Non-Sensitive)

- `DIRECTORY_PROVIDER` - Directory provider type
- `COSMO_MODEL_PROVIDER` - AI model provider
- `COSMO_PERSONALITY` - AI assistant personality
- `M365_POLL_INTERVAL_MS` - Microsoft 365 polling interval

### 3. PERFORMANCE & OPERATIONAL (Environment with Sensible Defaults)

These should have robust defaults but allow environment override for advanced users:

#### Database Performance

- `POSTGRES_POOL_*` - PostgreSQL connection pool settings
- `MONGO_*_POOL_SIZE`, `MONGO_*_TIMEOUT` - MongoDB performance settings
- `ELASTIC_REQUEST_TIMEOUT`, `ELASTIC_MAX_RETRIES` - Elasticsearch settings

#### Application Performance

- `REDIS_CONVERSATION_TTL` - Conversation cache TTL
- `CONVERSATION_HISTORY_LIMIT` - Maximum conversation history
- `CONTEXT_WINDOW_SIZE` - AI context window size
- `AI_PROCESSING_QUEUE_SIZE`, `AI_PROCESSING_BATCH_SIZE` - AI processing limits

#### Debug & Development

- `DEBUG_SQL`, `DEBUG_CORS` - Debug flags
- `LOG_LEVEL`, `LOG_RETENTION_DAYS` - Logging configuration
- `CLI_MODE` - CLI mode flag

### 4. ADMIN USER CREDENTIALS (Environment Only for Initial Setup)

These are used for initial admin user creation and should only be environment variables:

**Required Variables:**

- `ADMIN_EMAIL` - Initial admin email
- `ADMIN_PASSWORD` - Initial admin password
- `ADMIN_NAME` - Initial admin display name

**Example:**

```bash
# Initial Admin User (Required for first setup)
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_NAME=System Administrator
ADMIN_PASSWORD=TempPassword123!

# Note: Change default password immediately after first login
```

## Recommended Implementation Strategy

### Phase 1: Enhanced Configuration Model

1. Extend the existing `Config` model to support:
   - Value types (string, number, boolean, JSON)
   - Categories for organization
   - UI visibility flags
   - Validation rules
   - Default values

### Phase 2: Configuration API

1. Create RESTful API endpoints for configuration management
2. Implement hierarchical configuration resolution:
   - Environment variables (highest priority)
   - Database configuration (admin configurable)
   - Built-in defaults (fallback)

### Phase 3: Admin UI

1. Create React/TypeScript configuration management interface
2. Organize settings by category
3. Implement real-time validation
4. Add import/export functionality

### Phase 4: Migration & Testing

1. Migrate existing environment-based settings to database
2. Update all code to use hierarchical configuration
3. Comprehensive testing of configuration system
4. Documentation and deployment guides

## Security Considerations

### Environment Variables Only

- Database credentials and connection strings
- API keys and tokens
- Encryption keys and secrets
- SSL certificates and private keys

### UI Configurable with Validation

- Organization branding and messages
- Feature toggles and policies
- Performance settings within safe ranges
- Integration settings (non-sensitive)

### Audit Requirements

- Log all configuration changes
- Track who made changes and when
- Provide configuration history
- Enable configuration rollback

## Environment Variable Validation

All environment variables should be validated with:

- Type checking (string, number, boolean)
- Range validation for numbers
- Format validation for URLs, emails, etc.
- Required vs optional classification
- Clear error messages for invalid values

## Migration Path

1. **Immediate**: Document all current environment variables
2. **Short-term**: Implement enhanced Config model and API
3. **Medium-term**: Create admin UI for configurable settings
4. **Long-term**: Full migration to hierarchical configuration system

This analysis provides a complete roadmap for modernizing Nova Universe's configuration management while maintaining security and operational integrity.
