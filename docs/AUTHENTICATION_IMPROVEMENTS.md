# Authentication Flow Improvements for Multi-Tenant Environment

## Executive Summary

This document outlines improvements, changes, and removals for Nova Universe's authentication system based on industry standards review for multi-tenant SaaS applications.

## Industry Standards Reviewed

1. **OAuth 2.0 Framework** (RFC 6749)
2. **OpenID Connect Core 1.0**
3. **JWT Best Practices** (RFC 7519, RFC 8725)
4. **OWASP Authentication Guidelines**
5. **NIST Digital Identity Guidelines** (SP 800-63B)
6. **Multi-Tenant SaaS Security Best Practices**

## Current State Assessment

### ✅ What's Working Well

1. **Multi-Factor Authentication**
   - TOTP implementation with speakeasy
   - WebAuthn/Passkey support
   - SMS and Email MFA options
   - Risk-based MFA triggers
   - Tenant-level MFA requirements

2. **Tenant Isolation**
   - Tenant ID in database schema
   - Per-tenant SSO configurations (SAML, OIDC)
   - Tenant-specific branding
   - Isolated audit logging per tenant
   - Tenant discovery by email/domain

3. **Password Security**
   - bcrypt with 12 rounds (industry standard)
   - Password complexity validation
   - Rate limiting on authentication endpoints
   - Secure password reset flow

4. **Session Management**
   - Comprehensive session tracking (auth_sessions table)
   - Session metadata (IP, device, location, user agent)
   - Session activity tracking

5. **Audit Logging**
   - Authentication event logging
   - Failed login attempt tracking
   - Comprehensive audit trail with tenant context

### ❌ Critical Security Gaps

1. **Weak Development Secrets**
   - `JWT_SECRET=dev` in development environment
   - `SESSION_SECRET=dev` in development environment
   - Risk: Tokens can be forged in dev environment

2. **No Token Revocation**
   - No mechanism to revoke active JWT tokens
   - No token blacklist implementation
   - Risk: Compromised tokens remain valid until expiration

3. **No Refresh Token Rotation**
   - Refresh tokens not rotated on use
   - No refresh token expiration tracking
   - Risk: Token replay attacks

4. **Missing PKCE for OAuth2**
   - No Proof Key for Code Exchange implementation
   - Risk: Authorization code interception attacks

5. **No API Key Rotation**
   - API keys cannot be rotated
   - No API key expiration mechanism
   - Risk: Long-lived credentials compromise

6. **Insufficient Session Controls**
   - No concurrent session limits
   - No session timeout configuration per tenant
   - Risk: Session hijacking, unlimited active sessions

### ⚠️ Areas Needing Improvement

1. **Token Configuration**
   - Fixed 1-hour token expiration (should be configurable)
   - No distinction between access and refresh token lifetime
   - No tenant-specific token policies

2. **Password Policy**
   - No password history to prevent reuse
   - No configurable password expiration
   - Limited password complexity options

3. **Scope-Based Access Control**
   - Limited implementation of OAuth2 scopes
   - No fine-grained permission model
   - Missing scope validation in token

4. **Admin Authentication**
   - Simple token-based admin auth in MCP server
   - No separate admin MFA requirements
   - Risk: Admin account compromise

## Improvement Plan

### Phase 1: Critical Security Fixes (Immediate)

#### 1.1 Strengthen Development Secrets
**Change:** Replace weak development secrets with secure generated values

**Implementation:**
```javascript
// Environment validation
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (process.env.JWT_SECRET === 'dev' || process.env.JWT_SECRET === 'secret') {
    throw new Error('Cannot use default JWT_SECRET in production');
  }
}

// Generate secure secrets for development
if (process.env.NODE_ENV === 'development' && !process.env.JWT_SECRET) {
  const crypto = require('crypto');
  process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
  console.warn('Generated temporary JWT_SECRET for development');
}
```

**Files to Update:**
- `apps/api/lib/mcp-server.ts` - Add secret validation
- `.env.example` - Update with secure example
- `setup.sh` - Generate secure secrets on setup

#### 1.2 Implement Token Revocation
**Addition:** Token blacklist mechanism for JWT revocation

**Implementation:**
```sql
-- Token revocation table
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_jti VARCHAR(255) UNIQUE NOT NULL,
  user_id TEXT,
  tenant_id UUID,
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(100)
);

CREATE INDEX idx_revoked_tokens_jti ON revoked_tokens(token_jti);
CREATE INDEX idx_revoked_tokens_expires ON revoked_tokens(expires_at);
```

**Files to Create:**
- `apps/api/migrations/postgresql/20250106_token_revocation.sql`
- `apps/api/lib/token-revocation.js`

#### 1.3 Add Session Limits
**Addition:** Concurrent session management per user/tenant

**Implementation:**
```javascript
// Session limit configuration
const SESSION_LIMITS = {
  default: 5,
  perTenant: true,
  enforceLimit: true
};

// Check session limit before creating new session
async function enforceSessionLimit(userId, tenantId, limit = 5) {
  const activeSessions = await db.query(
    'SELECT COUNT(*) FROM auth_sessions WHERE user_id = ? AND tenant_id = ? AND is_active = true',
    [userId, tenantId]
  );
  
  if (activeSessions[0].count >= limit) {
    // Revoke oldest session
    await db.query(
      'UPDATE auth_sessions SET is_active = false WHERE id IN (SELECT id FROM auth_sessions WHERE user_id = ? AND tenant_id = ? AND is_active = true ORDER BY last_accessed_at ASC LIMIT 1)',
      [userId, tenantId]
    );
  }
}
```

**Files to Update:**
- `apps/api/routes/helix-universal-login.js` - Add session limit enforcement

### Phase 2: Standards Compliance (High Priority)

#### 2.1 Refresh Token Rotation
**Addition:** Automatic refresh token rotation on use

**Implementation:**
```javascript
// Refresh token rotation
async function rotateRefreshToken(oldToken) {
  const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
  
  // Generate new refresh token
  const newRefreshToken = jwt.sign(
    { userId: decoded.userId, type: 'refresh', rotation: (decoded.rotation || 0) + 1 },
    process.env.JWT_SECRET,
    { expiresIn: '7d', jti: uuidv4() }
  );
  
  // Invalidate old token
  await revokeToken(oldToken);
  
  return newRefreshToken;
}
```

**Files to Create:**
- `apps/api/lib/token-rotation.js`

#### 2.2 Configurable Token Expiration
**Change:** Make token expiration configurable per tenant

**Implementation:**
```javascript
// Tenant-specific token configuration
const tokenConfig = {
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  tenantOverrides: {} // Loaded from database
};

// Get tenant-specific token expiry
async function getTokenExpiry(tenantId, tokenType) {
  const tenant = await db.query('SELECT token_config FROM tenants WHERE id = ?', [tenantId]);
  const config = tenant[0]?.token_config || {};
  return config[`${tokenType}Expiry`] || tokenConfig[`${tokenType}Expiry`];
}
```

**Files to Update:**
- `apps/api/routes/helix-universal-login.js` - Use configurable expiry
- `apps/api/migrations/postgresql/20250805_universal_login_schema.sql` - Add token_config column

#### 2.3 PKCE for OAuth2
**Addition:** Implement PKCE for authorization code flow

**Implementation:**
```javascript
// PKCE implementation
function generatePKCE() {
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

// Store code challenge
async function storeAuthorizationCode(code, challenge, clientId) {
  await db.query(
    'INSERT INTO oauth_codes (code, code_challenge, client_id, expires_at) VALUES (?, ?, ?, ?)',
    [code, challenge, clientId, new Date(Date.now() + 10 * 60000)]
  );
}

// Verify code verifier
async function verifyPKCE(code, verifier) {
  const stored = await db.query('SELECT code_challenge FROM oauth_codes WHERE code = ?', [code]);
  const expectedChallenge = base64URLEncode(crypto.createHash('sha256').update(verifier).digest());
  return stored[0]?.code_challenge === expectedChallenge;
}
```

**Files to Create:**
- `apps/api/lib/oauth-pkce.js`

### Phase 3: Enhanced Security (Medium Priority)

#### 3.1 API Key Rotation
**Addition:** API key rotation mechanism with grace period

**Implementation:**
```sql
-- API key versioning
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  client_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  rotated_at TIMESTAMP WITH TIME ZONE
);
```

**Files to Create:**
- `apps/api/migrations/postgresql/20250106_api_key_rotation.sql`
- `apps/api/lib/api-key-rotation.js`

#### 3.2 Password History
**Addition:** Track password history to prevent reuse

**Implementation:**
```sql
-- Password history table
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_history_user ON password_history(user_id);
```

**Files to Create:**
- `apps/api/migrations/postgresql/20250106_password_history.sql`

#### 3.3 Enhanced Admin Authentication
**Change:** Improve admin authentication with MFA requirement

**Implementation:**
```typescript
// Enhanced admin authentication
private async authenticateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Admin authentication required' });
    return;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    if (!decoded.role || !['admin', 'superadmin'].includes(decoded.role)) {
      res.status(403).json({ error: 'Admin role required' });
      return;
    }
    
    // Verify MFA if required
    if (decoded.mfaRequired && !decoded.mfaVerified) {
      res.status(403).json({ error: 'MFA verification required' });
      return;
    }
    
    (req as any).admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid admin token' });
  }
}
```

**Files to Update:**
- `apps/api/lib/mcp-server.ts` - Enhance admin authentication

### Phase 4: Testing & Validation

#### 4.1 New Authentication Tests
**Addition:** Comprehensive authentication test suite

**Tests to Add:**
1. Token revocation tests
2. Refresh token rotation tests
3. PKCE flow tests
4. Concurrent session limit tests
5. API key rotation tests
6. Password history validation tests
7. Cross-tenant isolation tests
8. Admin authentication tests

**Files to Create:**
- `test/auth-token-revocation.test.js`
- `test/auth-session-management.test.js`
- `test/auth-pkce.test.js`

#### 4.2 Enhanced Security Tests
**Update:** Extend existing security tests

**Files to Update:**
- `test/security-testing.test.js` - Add new test cases

## Removals

### Items to Remove

1. **Weak Default Secrets**
   - Remove hardcoded `JWT_SECRET=dev` from scripts
   - Remove `SESSION_SECRET=dev` from development configs
   - Files: `.env.example`, development scripts

2. **Simple Admin Token Auth**
   - Remove `ADMIN_TOKEN` environment variable approach
   - Replace with proper JWT-based admin authentication
   - Files: `apps/api/lib/mcp-server.ts`

3. **Redundant Auth Code**
   - Remove `configureSAMLSecondary` duplicate function
   - Consolidate SAML configuration
   - Files: `apps/api/middleware/saml.js`

## Success Criteria

1. ✅ All authentication tests passing (100%)
2. ✅ No weak secrets in any environment
3. ✅ Token revocation implemented and tested
4. ✅ Session limits enforced and tested
5. ✅ PKCE flow implemented for OAuth2
6. ✅ API key rotation available
7. ✅ Password history tracked
8. ✅ Admin authentication enhanced with MFA
9. ✅ No security vulnerabilities in auth flow
10. ✅ Documentation updated

## Migration Plan

### Database Migrations
1. Token revocation table
2. Password history table
3. API key versioning table
4. Tenant token configuration column

### Configuration Updates
1. Generate secure secrets for all environments
2. Update .env files with new variables
3. Add tenant-specific token configuration
4. Configure session limits

### Code Updates
1. Update JWT generation with JTI
2. Implement token revocation checks
3. Add session limit enforcement
4. Implement PKCE flow
5. Add API key rotation endpoints
6. Track password history on changes
7. Enhance admin authentication

### Testing Updates
1. Add token revocation tests
2. Add session management tests
3. Add PKCE tests
4. Add cross-tenant isolation tests
5. Update security test suite

## Timeline

- **Phase 1 (Critical):** 2-3 days
- **Phase 2 (High Priority):** 3-4 days  
- **Phase 3 (Medium Priority):** 2-3 days
- **Phase 4 (Testing):** 2-3 days

**Total:** 9-13 days for full implementation

## References

- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [RFC 8725 - JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)
