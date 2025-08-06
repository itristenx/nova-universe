# Nova Helix Universal Login Implementation

## Overview

Nova Helix Universal Login is a comprehensive authentication system designed to provide a modern, secure, and user-friendly login experience for Nova Universe applications. The system implements industry-standard authentication patterns similar to Okta, Microsoft, and other enterprise identity providers.

## Features

### 🎯 Core Features
- **Multi-step Authentication Flow**: Seamless user discovery → authentication → MFA
- **Tenant-aware Branding**: Customizable themes, logos, and messaging per organization
- **Multi-factor Authentication**: TOTP, SMS, Email verification support
- **Single Sign-On (SSO)**: SAML and OIDC integration
- **Enterprise Security**: Rate limiting, audit logging, device trust
- **Apple-aesthetic Design**: Modern, clean interface following Apple's design principles

### 🔐 Authentication Methods
- **Password-based**: Traditional username/password authentication
- **SSO Providers**: SAML, OIDC, Google, Microsoft integrations
- **Passkey Support**: WebAuthn/FIDO2 passwordless authentication
- **Multi-factor**: TOTP (Google Authenticator), SMS, Email verification

## Architecture

### Database Schema

The universal login system uses the following PostgreSQL tables:

```sql
-- Core Tables
tenants                 -- Organization/tenant configuration
sso_configs            -- SSO provider configurations
auth_sessions          -- Active user sessions
mfa_methods            -- User MFA configurations
auth_audit_logs        -- Comprehensive audit trail
mfa_challenges         -- Temporary MFA challenge storage
login_rate_limits      -- Rate limiting data
trusted_devices        -- Device fingerprinting
```

### API Endpoints

#### Discovery Phase
- `POST /api/v1/helix/login/tenant/discover`
  - Discovers tenant and available auth methods for email
  - Returns branding configuration and user existence

#### Authentication Phase
- `POST /api/v1/helix/login/authenticate`
  - Handles password, SSO, and passkey authentication
  - Initiates MFA flow if required

#### MFA Phase
- `POST /api/v1/helix/login/mfa/challenge`
  - Sends MFA challenges (SMS, Email)
- `POST /api/v1/helix/login/mfa/verify`
  - Verifies MFA codes and completes authentication

#### Session Management
- `POST /api/v1/helix/login/token/refresh`
  - Refreshes JWT tokens
- `POST /api/v1/helix/login/logout`
  - Invalidates sessions and logs out users

#### SSO Integration
- `GET /api/v1/helix/login/sso/initiate/{provider}`
  - Initiates SSO flow with external providers
- `POST /api/v1/helix/login/sso/callback/{provider}`
  - Handles SSO callback and token exchange

## Implementation Guide

### 1. Database Setup

Apply the database migration:

```bash
# PostgreSQL Migration
psql -h localhost -U nova_user -d nova_core -f apps/api/migrations/postgresql/20250805_universal_login_schema.sql
```

### 2. Environment Configuration

Configure the following environment variables:

```bash
# Database Configuration
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_NAME=nova_core
CORE_DB_USER=nova_user
CORE_DB_PASSWORD=your_secure_password

# Security Configuration
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Optional: SSO Configuration
SAML_ENTRY_POINT=https://your-idp.com/sso
SAML_ISSUER=nova-universe
SAML_CALLBACK_URL=https://your-domain.com/api/v1/helix/login/sso/callback/saml
SAML_CERT=your_idp_certificate
```

### 3. Frontend Integration

Update your apps to use the universal login:

```typescript
// Redirect unauthenticated users to universal login
if (!isAuthenticated) {
  const currentPath = window.location.pathname;
  const redirectUrl = encodeURIComponent(currentPath);
  window.location.href = `/auth/login?redirect=${redirectUrl}`;
}
```

### 4. Tenant Configuration

Configure tenants through the API or database:

```sql
INSERT INTO tenants (name, domain, theme_color, logo_url, sso_enabled, mfa_required)
VALUES (
  'Your Organization',
  'yourcompany.com',
  '#1f2937',
  'https://your-domain.com/logo.png',
  true,
  false
);
```

## Security Features

### Rate Limiting
- **Login Attempts**: 5 attempts per IP per 15 minutes
- **MFA Attempts**: 3 attempts per session
- **Token Refresh**: 10 requests per minute per user

### Audit Logging
All authentication events are logged with:
- User identification
- IP address and device fingerprint
- Authentication method used
- Success/failure status
- Security risk assessment
- Detailed metadata

### Session Security
- **JWT Token Expiry**: Configurable (default: 1 hour)
- **Refresh Token Rotation**: Automatic rotation on refresh
- **Device Fingerprinting**: Track and trust user devices
- **Session Invalidation**: Immediate logout across all devices

## Multi-Factor Authentication

### Supported Methods
1. **TOTP (Time-based One-Time Password)**
   - Compatible with Google Authenticator, Authy, 1Password
   - 6-digit codes with 30-second validity

2. **SMS Verification**
   - Sends verification codes via SMS
   - Rate limited to prevent abuse

3. **Email Verification**
   - Backup verification method
   - HTML and text format support

### Setup Flow
1. User enables MFA in profile settings
2. System generates secret/configuration
3. User scans QR code or enters secret
4. Verification with test code
5. Backup codes generated and displayed

## SSO Integration

### SAML Configuration
```javascript
const samlConfig = {
  entryPoint: process.env.SAML_ENTRY_POINT,
  issuer: process.env.SAML_ISSUER,
  callbackUrl: process.env.SAML_CALLBACK_URL,
  cert: process.env.SAML_CERT,
  nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  signatureAlgorithm: 'sha256'
};
```

### OIDC Configuration
```javascript
const oidcConfig = {
  issuer: 'https://your-oidc-provider.com',
  clientId: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  redirectUri: process.env.OIDC_REDIRECT_URI,
  scopes: ['openid', 'profile', 'email']
};
```

## Theming and Branding

### Tenant Branding Configuration
```sql
UPDATE tenants SET
  logo_url = 'https://your-domain.com/logo.png',
  theme_color = '#1f2937',
  background_image_url = 'https://your-domain.com/bg.jpg',
  login_message = 'Welcome to Your Organization',
  custom_css = '.login-container { /* custom styles */ }'
WHERE domain = 'yourcompany.com';
```

### CSS Custom Properties
The frontend automatically applies tenant branding using CSS custom properties:
```css
:root {
  --theme-color: #1f2937;
  --theme-color-10: #1f293710;
  --theme-color-30: #1f293730;
  --background-image: url('background.jpg');
}
```

## Testing

### Integration Tests
Run the comprehensive test suite:

```bash
npm test test/universal-login-integration.test.js
```

### Manual Testing
1. **Discovery Flow**: Test email discovery with various domains
2. **Authentication**: Verify password and SSO authentication
3. **MFA Flow**: Test TOTP, SMS, and email verification
4. **Session Management**: Verify token refresh and logout
5. **Error Handling**: Test invalid inputs and rate limiting

## API Reference

### Tenant Discovery
```http
POST /api/v1/helix/login/tenant/discover
Content-Type: application/json

{
  "email": "user@company.com",
  "redirectUrl": "https://app.company.com/dashboard"
}
```

**Response:**
```json
{
  "tenant": {
    "id": "uuid",
    "name": "Company Name",
    "domain": "company.com"
  },
  "authMethods": [
    {
      "type": "password",
      "name": "Password",
      "primary": true
    },
    {
      "type": "sso",
      "provider": "saml",
      "name": "Corporate SSO",
      "primary": false
    }
  ],
  "branding": {
    "logo": "https://company.com/logo.png",
    "themeColor": "#1f2937",
    "organizationName": "Company Name"
  },
  "userExists": true,
  "mfaRequired": false,
  "discoveryToken": "discovery-token-here"
}
```

### Authentication
```http
POST /api/v1/helix/login/authenticate
Content-Type: application/json

{
  "discoveryToken": "discovery-token-here",
  "email": "user@company.com",
  "authMethod": "password",
  "password": "user-password",
  "redirectUrl": "https://app.company.com/dashboard"
}
```

**Response (No MFA):**
```json
{
  "token": "jwt-token-here",
  "refreshToken": "refresh-token-here",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@company.com",
    "roles": ["user"]
  },
  "requiresMFA": false,
  "redirectUrl": "https://app.company.com/dashboard"
}
```

**Response (MFA Required):**
```json
{
  "requiresMFA": true,
  "tempSessionId": "temp-session-id",
  "availableMfaMethods": [
    {
      "type": "totp",
      "name": "Authenticator App",
      "primary": true
    },
    {
      "type": "sms",
      "name": "SMS to ***-***-1234",
      "primary": false
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check environment variables
   - Ensure database user has proper permissions

2. **SSO Configuration Issues**
   - Verify certificate format and validity
   - Check callback URL configuration
   - Validate metadata exchange

3. **MFA Problems**
   - Time synchronization for TOTP
   - SMS delivery configuration
   - Email service setup

### Debug Mode
Enable debug logging:
```bash
DEBUG=nova:auth:* npm start
```

## Performance Considerations

### Database Optimization
- **Indexes**: Ensure proper indexing on email, domain, and session tokens
- **Connection Pooling**: Configure appropriate pool sizes
- **Query Optimization**: Use prepared statements and efficient queries

### Caching Strategy
- **Session Data**: Cache active sessions in Redis
- **Tenant Configuration**: Cache tenant settings
- **MFA Secrets**: Secure in-memory caching

### Rate Limiting
- **Application Level**: Express rate limiting middleware
- **Database Level**: Track attempts in login_rate_limits table
- **Reverse Proxy**: Consider Nginx or Cloudflare rate limiting

## Deployment

### Production Checklist
- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring and alerts set up
- [ ] Backup and recovery procedures
- [ ] Security audit completed

### Monitoring
Monitor the following metrics:
- Authentication success/failure rates
- MFA adoption rates
- SSO usage patterns
- Session duration analytics
- Security incident detection

## Support and Maintenance

### Regular Tasks
- **Log Rotation**: Audit logs and session cleanup
- **Certificate Renewal**: SSO certificates and TLS
- **Security Updates**: Dependencies and vulnerability patches
- **Performance Monitoring**: Database and API performance

### Backup Strategy
- **Database Backups**: Regular PostgreSQL dumps
- **Configuration Backup**: Tenant and SSO configurations
- **Audit Trail Archival**: Long-term audit log storage

---

## Change Log

### Version 1.0.0 (2025-08-05)
- Initial implementation of Universal Login system
- Multi-step authentication flow
- Tenant-aware branding support
- MFA integration (TOTP, SMS, Email)
- SSO framework (SAML, OIDC)
- Comprehensive audit logging
- Apple-aesthetic frontend design
- Integration tests and documentation
