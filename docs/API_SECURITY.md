# API Security Guidelines

## Overview

This document outlines the security measures implemented in the Nova Universe API and provides guidelines for secure API usage.

## Authentication & Authorization

### JWT Authentication

All API endpoints (except public endpoints) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

**Security Features:**
- Tokens expire after 12 hours
- Tokens include IP address verification (optional, enabled via `STRICT_IP_VERIFICATION=true`)
- Failed authentication attempts are logged and monitored
- Account lockout after multiple failed attempts
- All authentication events are audited

### Permission-Based Access Control

Sensitive endpoints require specific permissions:

#### VIP Management Endpoints

- `GET /api/v1/vip/proxies` - Requires `vip:read` permission
- `POST /api/v1/vip/proxies` - Requires `vip:write` permission
- `DELETE /api/v1/vip/proxies/:id` - Requires `vip:write` permission
- `GET /api/v1/vip/metrics` - Requires `vip:read` permission

#### Permission Checks

The API implements fine-grained permission checks using the `requirePermission` middleware:

```javascript
router.get('/sensitive-data', authenticateJWT, requirePermission('data:read'), handler);
```

### Role-Based Access Control (RBAC)

Available roles:
- `user` - Standard user access
- `technician` - Technician portal access
- `admin` - Administrative access
- `superadmin` - Full system access

Use `requireRole` or `requireAnyRole` middleware for role-based restrictions.

## Rate Limiting

### Global Rate Limits

- **Authenticated requests**: 1000 requests per hour per user
- **Unauthenticated requests**: 100 requests per hour per IP

### Endpoint-Specific Rate Limits

Critical endpoints have stricter limits:

- Authentication endpoints: 5 requests per 15 minutes
- VIP endpoints: 50 reads per 15 minutes, 20 writes per 15 minutes
- AI/ML endpoints: 20 requests per minute

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1640995200
```

## Input Validation

### Request Validation

All user input is validated using `express-validator`:

```javascript
[
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('vipId').isString().trim().escape()
]
```

### SQL Injection Prevention

All database queries use parameterized statements:

```javascript
// ✅ SAFE - Uses parameterized query
await db.none('DELETE FROM vip_proxies WHERE id = $1', [req.params.id]);

// ❌ UNSAFE - String concatenation
await db.none(`DELETE FROM vip_proxies WHERE id = '${req.params.id}'`);
```

### XSS Prevention

- All user input is sanitized via the `sanitizeInput` middleware
- Response headers include XSS protection
- Content-Security-Policy headers are set

## Security Headers

The API automatically sets the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## API Versioning Security

### Version Deprecation

Deprecated API versions include sunset warnings:

**v1 API (Deprecated)**
```
Deprecation: true
Sunset: 2024-12-31T23:59:59Z
X-API-Deprecation-Notice: This version will be sunset on 2024-12-31
```

**Unversioned Routes (Legacy)**
```
Deprecation: true
Sunset: 2025-06-30T23:59:59Z
X-API-Deprecation-Notice: Unversioned routes will be removed on 2025-06-30
```

**v2 API (Current)**
```
X-API-Version: v2
X-API-Status: stable
```

### Migration Path

All clients should migrate to v2 endpoints:

- Old: `GET /api/tickets`
- New: `GET /api/v2/pulse/tickets` (or appropriate v2 endpoint)

## Audit Logging

### Security Events Logged

1. **Authentication Events**
   - Login attempts (success/failure)
   - Token validation failures
   - IP address changes during session

2. **Authorization Events**
   - Permission denied events
   - Role escalation attempts
   - Resource access violations

3. **Data Access Events**
   - Sensitive data access (VIP, admin endpoints)
   - Bulk data exports
   - Configuration changes

### Audit Log Format

```json
{
  "eventType": "UNAUTHORIZED_ACCESS",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "resource": "/api/v1/vip/proxies/123",
  "action": "DELETE",
  "outcome": "FAILURE",
  "reason": "Insufficient permissions"
}
```

## Vulnerability Protection

### Information Disclosure Prevention

1. **Error Messages**
   - Production mode: Generic error messages
   - Development mode: Detailed error information

2. **Resource Existence**
   - 404 responses for non-existent or unauthorized resources
   - No differentiation between "not found" and "forbidden"

Example:
```javascript
// Check existence before deletion
const existing = await db.oneOrNone('SELECT id FROM vip_proxies WHERE id = $1', [id]);
if (!existing) {
  return res.status(404).json({ error: 'Proxy not found' });
}
```

### CSRF Protection

- Session-based endpoints use CSRF tokens
- JWT-based API endpoints are not vulnerable to CSRF

### CORS Configuration

CORS is configured to only allow trusted origins:

```javascript
origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*'
```

**Production recommendation**: Always set specific `CORS_ORIGINS` in production.

## Monitoring & Alerting

### Real-Time Security Monitoring

Security events trigger real-time alerts for:

- Multiple failed authentication attempts
- Privilege escalation attempts
- Unusual API usage patterns
- Rate limit violations
- Suspicious IP addresses

### Security Metrics

Track the following metrics:

1. Failed authentication rate
2. Authorization denial rate
3. Rate limit hit rate
4. Average response time per endpoint
5. Error rate per endpoint

## Best Practices for API Consumers

### 1. Token Management

- Store tokens securely (never in localStorage for web apps)
- Use HttpOnly cookies when possible
- Rotate tokens regularly
- Clear tokens on logout

### 2. Error Handling

- Don't expose error details to end users
- Log errors for debugging
- Implement retry logic with exponential backoff

### 3. Rate Limit Handling

```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await sleep(retryAfter * 1000);
  return retry();
}
```

### 4. API Version Headers

Always specify the API version you're using:

```javascript
headers: {
  'X-API-Version': 'v2',
  'Accept': 'application/json'
}
```

## Security Checklist for New Endpoints

When creating new API endpoints, ensure:

- [ ] Authentication required (unless public endpoint)
- [ ] Authorization/permission checks implemented
- [ ] Input validation using express-validator
- [ ] Parameterized database queries (no SQL injection)
- [ ] Rate limiting configured appropriately
- [ ] Error messages don't leak sensitive information
- [ ] Audit logging for sensitive operations
- [ ] Swagger/OpenAPI documentation updated
- [ ] Security review completed

## Environment Variables

### Required Security Configuration

```bash
# JWT Configuration
JWT_SECRET=<strong-random-string>
JWT_EXPIRATION=12h

# Session Configuration
SESSION_SECRET=<strong-random-string>

# Authentication
DISABLE_AUTH=false  # NEVER set to true in production

# IP Verification
STRICT_IP_VERIFICATION=false  # Set to true for high-security environments

# CORS
CORS_ORIGINS=https://app.example.com,https://admin.example.com

# Rate Limiting
RATE_LIMIT_WINDOW=3600000  # 1 hour in ms
RATE_LIMIT_MAX=1000

# SCIM Token (for SCIM 2.0 provisioning)
SCIM_TOKEN=<scim-auth-token>

# Kiosk Token (for kiosk authentication)
KIOSK_TOKEN=<kiosk-auth-token>
```

### Security Validation

The API validates security configuration on startup:

```javascript
if (process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV === 'production') {
  logger.error('DISABLE_AUTH cannot be true when NODE_ENV is production');
  process.exit(1);
}
```

## Incident Response

### In Case of Security Incident

1. **Immediate Actions**
   - Rotate all API keys and tokens
   - Review audit logs for suspicious activity
   - Block malicious IP addresses
   - Notify affected users

2. **Investigation**
   - Identify the attack vector
   - Determine the scope of the breach
   - Document findings

3. **Remediation**
   - Patch vulnerabilities
   - Update security controls
   - Conduct security review

4. **Prevention**
   - Update security guidelines
   - Enhance monitoring
   - Conduct security training

## Contact

For security concerns or to report vulnerabilities:

- **Security Team**: security@nova-universe.com
- **Bug Bounty**: bugbounty@nova-universe.com
- **PGP Key**: Available at `/security.txt`

## References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 8594 - Sunset Header](https://tools.ietf.org/html/rfc8594)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
