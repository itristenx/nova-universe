# Environment Variables Migration Guide

## Overview

This document describes the implementation of the enhanced configuration management system for Nova Universe, which allows certain environment variables to be managed through a user-friendly interface while maintaining security for critical infrastructure settings.

## Implementation Status

✅ **COMPLETED: Environment Variable Analysis**
- Analyzed all environment variables in the codebase
- Categorized variables by security sensitivity and UI suitability
- Created comprehensive documentation with examples

✅ **COMPLETED: Enhanced Configuration Database Schema**
- Extended `Config` model with advanced metadata fields
- Added `ConfigHistory` for audit trails
- Added `ConfigTemplate` for configuration presets
- Enhanced validation rules and UI metadata

✅ **COMPLETED: Configuration Management API**
- RESTful API endpoints for configuration CRUD operations
- Hierarchical configuration resolution (environment → database → defaults)
- Bulk operations and configuration templates
- Comprehensive validation and error handling

✅ **COMPLETED: Modern UI Components (Native HTML/Tailwind)**
- React/TypeScript configuration management interface using native HTML elements
- Eliminated custom @nova-universe/ui components in favor of native HTML with Tailwind CSS
- Category-based organization with intuitive tab navigation
- Real-time validation and unsaved changes tracking
- Configuration history viewer and change audit
- Fully accessible with proper ARIA labels and semantic HTML

✅ **COMPLETED: Database Population**
- Automatic seeding script for configuration definitions
- Default values and validation rules
- Proper categorization and help text

## Architecture

### 1. Hierarchical Configuration Resolution

The system resolves configuration values in this order:

1. **Environment Variables** (highest priority)
2. **Database Configuration** (admin configurable)
3. **Built-in Defaults** (fallback)

This ensures that critical infrastructure settings can always be overridden via environment variables for security and deployment flexibility.

### 2. Configuration Categories

#### 🔒 **CRITICAL INFRASTRUCTURE** (Environment Variables Only)

These variables **MUST** remain as environment variables:

**Database Connections:**
```bash
# PostgreSQL Configuration (Required)
CORE_DATABASE_URL=postgresql://user:password@localhost:5432/nova_core
AUTH_DATABASE_URL=postgresql://user:password@localhost:5432/nova_auth
AUDIT_DATABASE_URL=mongodb://user:password@localhost:27017/nova_audit

# Individual Database Settings
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=nova_core
CORE_DB_USER=nova_user
CORE_DB_PASSWORD=your_secure_password

# Generate secure password: openssl rand -base64 32
```

**Security & Cryptography:**
```bash
# Required Security Secrets (64+ characters recommended)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ASSET_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Example values (NEVER use in production)
JWT_SECRET=YourSecureJWTSecretMustBe32CharsMinimum123
SESSION_SECRET=YourSecureSessionSecretMustBe32CharsMinimum456
ASSET_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

**External Service Credentials:**
```bash
# Required for integrations
SCIM_TOKEN=your_scim_integration_token
KIOSK_TOKEN=your_kiosk_authentication_token

# Optional external services
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Email/SMTP:**
```bash
# Required if email functionality is enabled
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-specific-password
SMTP_SECURE=true
```

**Deployment:**
```bash
# Required deployment settings
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=https://helpdesk.yourcompany.com
```

#### 🎨 **UI CONFIGURABLE** (Database + Admin Interface)

These settings can be managed through the admin interface:

**Organization Branding:**
- Organization Name
- Logo URL
- Primary/Secondary Colors
- Favicon URL

**Security Policies:**
- PIN length requirements
- Rate limiting settings
- Authentication policies

**Feature Toggles:**
- AI assistant (Cosmo) enabled/disabled
- Ticket processing features
- Integration enablement

**Application Messages:**
- Welcome messages
- Help text
- Status messages

## Usage Guide

### 1. Accessing Configuration Management

Navigate to `/admin/configuration` in the Orbit app to access the configuration management interface.

### 2. Managing Configurations

#### Via Web Interface:
1. Browse configurations by category (Branding, Security, Features, etc.)
2. Edit values with real-time validation
3. Save individual settings or bulk changes
4. View change history and audit trails

#### Via API:
```javascript
// Get all public configurations
GET /api/config

// Get admin configurations with metadata
GET /api/config/admin

// Update a configuration
PUT /api/config/ORGANIZATION_NAME
{
  "value": "My Company",
  "reason": "Updated company branding"
}

// Bulk update
POST /api/config/bulk
{
  "configs": [
    { "key": "ORGANIZATION_NAME", "value": "My Company" },
    { "key": "PRIMARY_COLOR", "value": "#3b82f6" }
  ],
  "reason": "Branding update"
}
```

### 3. Database Seeding

To populate the database with configuration definitions:

```bash
cd /path/to/nova-universe
node scripts/seed-configurations.js
```

### 4. Environment Variable Fallbacks

All UI-configurable settings support environment variable overrides:

```bash
# Override UI setting via environment
ORGANIZATION_NAME="Environment Override Company"
COSMO_ENABLED=false
```

## Migration Strategy

### Phase 1: Infrastructure Setup ✅
- Enhanced database schema
- Configuration management API
- Basic UI components

### Phase 2: Gradual Migration
1. Identify settings suitable for UI management
2. Move non-sensitive configurations to database
3. Update application code to use hierarchical resolution
4. Provide migration scripts for existing deployments

### Phase 3: Advanced Features
1. Configuration templates and presets
2. Role-based configuration access
3. Configuration validation rules
4. Import/export functionality

## Security Considerations

### Environment Variables Only
- Database credentials and connection strings
- API keys and authentication tokens
- Encryption keys and secrets
- SSL certificates and private keys

### UI Configurable with Validation
- Organization branding and messaging
- Feature toggles and policies
- Performance settings (within safe ranges)
- Integration settings (non-sensitive)

### Audit Requirements
- All configuration changes are logged
- Change history includes user ID and reason
- Configuration rollback capabilities
- Real-time change notifications

## Validation Rules

The system includes comprehensive validation:

```javascript
// Example validation rules
{
  "ORGANIZATION_NAME": {
    "type": "string",
    "minLength": 1,
    "maxLength": 100,
    "pattern": "^[a-zA-Z0-9\\s&.-]+$"
  },
  "PRIMARY_COLOR": {
    "type": "string",
    "pattern": "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
  },
  "MIN_PIN_LENGTH": {
    "type": "number",
    "min": 3,
    "max": 10
  }
}
```

## Troubleshooting

### Common Issues

**Configuration not updating:**
- Check if environment variable is overriding database value
- Verify user has admin permissions
- Check validation errors in API response

**API not responding:**
- Ensure database connection is working
- Check that Prisma client is generated
- Verify environment variables are set

**UI not loading configurations:**
- Check browser console for API errors
- Verify API server is running
- Check authentication status

### Debug Commands

```bash
# Check Prisma client status
npx prisma generate --schema=prisma/core/schema.prisma

# Verify database schema
npx prisma db push --schema=prisma/core/schema.prisma

# Test configuration API
curl http://localhost:3001/api/config

# Check configuration in database
npx prisma studio --schema=prisma/core/schema.prisma
```

## File Structure

```
nova-universe/
├── apps/
│   ├── orbit/
│   │   └── src/
│   │       ├── components/admin/
│   │       │   └── ConfigurationManagement.tsx  # Main UI component
│   │       └── app/admin/configuration/
│   │           └── page.tsx                      # Configuration page
│   └── api/
│       ├── routes/
│       │   └── config.js                         # Configuration API
│       └── utils/
│           └── configValidation.js               # Validation utilities
├── prisma/core/
│   └── schema.prisma                             # Enhanced Config model
├── scripts/
│   └── seed-configurations.js                   # Database seeding
└── docs/
    └── ENVIRONMENT_VARIABLES_COMPREHENSIVE_ANALYSIS.md
```

## Next Steps

1. **Production Deployment:**
   - Set up proper environment variables
   - Run database migrations
   - Seed configuration definitions
   - Test hierarchical resolution

2. **Team Training:**
   - Document configuration categories
   - Train administrators on UI usage
   - Establish change management procedures

3. **Monitoring:**
   - Set up configuration change alerts
   - Monitor validation failures
   - Track configuration performance impact

This enhanced configuration management system provides a modern, secure, and user-friendly approach to managing application settings while maintaining the security and flexibility of environment variables for critical infrastructure components.
