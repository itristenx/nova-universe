# OAuth 2.0 and SCIM API Documentation

## Overview

Nova Universe provides full OAuth 2.0 (RFC 6749) and SCIM 2.0 (RFC 7644) API support for enterprise integrations in multi-tenant environments.

## Table of Contents

1. [OAuth 2.0 Implementation](#oauth-20-implementation)
2. [SCIM 2.0 Implementation](#scim-20-implementation)
3. [Security Considerations](#security-considerations)
4. [Multi-Tenant Support](#multi-tenant-support)
5. [Quick Start Examples](#quick-start-examples)

---

## OAuth 2.0 Implementation

### Standards Compliance

Nova Universe's OAuth 2.0 implementation follows these RFCs:

- ✅ **RFC 6749** - OAuth 2.0 Authorization Framework
- ✅ **RFC 7636** - Proof Key for Code Exchange (PKCE)
- ✅ **RFC 7009** - Token Revocation
- ✅ **RFC 7662** - Token Introspection
- ✅ **RFC 7591** - Dynamic Client Registration
- ✅ **RFC 8414** - Authorization Server Metadata

### Supported Grant Types

1. **Authorization Code with PKCE** (Recommended)
2. **Refresh Token**
3. **Client Credentials** (Machine-to-Machine)

### Supported Scopes

- `read` - Read-only access to resources
- `write` - Write access to resources
- `admin` - Administrative access
- `scim` - SCIM API access for user provisioning
- `openid` - OpenID Connect support
- `profile` - Access to user profile information
- `email` - Access to user email

### OAuth 2.0 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/.well-known/oauth-authorization-server` | GET | Authorization server metadata |
| `/api/v1/oauth/register` | POST | Dynamic client registration |
| `/api/v1/oauth/authorize` | GET | Authorization endpoint |
| `/api/v1/oauth/token` | POST | Token endpoint |
| `/api/v1/oauth/revoke` | POST | Token revocation |
| `/api/v1/oauth/introspect` | POST | Token introspection |

### Authorization Code Flow with PKCE

#### Step 1: Client Registration

```bash
curl -X POST https://your-domain.com/api/v1/oauth/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My Application",
    "redirect_uris": ["https://my-app.com/callback"],
    "grant_types": ["authorization_code", "refresh_token"],
    "scope": "read write openid profile"
  }'
```

Response:
```json
{
  "client_id": "client_abc123...",
  "client_secret": "secret_xyz789...",
  "client_name": "My Application",
  "redirect_uris": ["https://my-app.com/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scope": "read write openid profile",
  "client_id_issued_at": 1704672000
}
```

**Important:** Save the `client_secret` securely. It cannot be retrieved later.

#### Step 2: Generate PKCE Parameters

```javascript
// Generate code verifier (random string 43-128 characters)
const codeVerifier = base64url(crypto.randomBytes(32));

// Generate code challenge (SHA256 hash of verifier)
const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
```

#### Step 3: Authorization Request

Redirect user to authorization endpoint:

```
https://your-domain.com/api/v1/oauth/authorize?
  response_type=code&
  client_id=client_abc123&
  redirect_uri=https://my-app.com/callback&
  scope=read write profile&
  state=random_state_value&
  code_challenge=CHALLENGE_HERE&
  code_challenge_method=S256
```

#### Step 4: Token Exchange

After user authorization, exchange the code for tokens:

```bash
curl -X POST https://your-domain.com/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=client_abc123" \
  -d "client_secret=secret_xyz789" \
  -d "code=AUTH_CODE_HERE" \
  -d "redirect_uri=https://my-app.com/callback" \
  -d "code_verifier=VERIFIER_HERE"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": "read write profile"
}
```

#### Step 5: Use Access Token

```bash
curl -X GET https://your-domain.com/api/v1/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Step 6: Refresh Access Token

```bash
curl -X POST https://your-domain.com/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "client_id=client_abc123" \
  -d "client_secret=secret_xyz789" \
  -d "refresh_token=REFRESH_TOKEN_HERE"
```

### Client Credentials Flow

For machine-to-machine authentication:

```bash
curl -X POST https://your-domain.com/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=client_abc123" \
  -d "client_secret=secret_xyz789" \
  -d "scope=read write"
```

### Token Revocation

```bash
curl -X POST https://your-domain.com/api/v1/oauth/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=ACCESS_TOKEN_HERE" \
  -d "token_type_hint=access_token"
```

### Token Introspection

Validate and inspect a token:

```bash
curl -X POST https://your-domain.com/api/v1/oauth/introspect \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=ACCESS_TOKEN_HERE"
```

Response:
```json
{
  "active": true,
  "scope": "read write profile",
  "client_id": "client_abc123",
  "username": "user_123",
  "token_type": "access",
  "exp": 1704673800,
  "iat": 1704672900,
  "sub": "user_123",
  "aud": "client_abc123",
  "iss": "https://nova-universe.com",
  "jti": "unique-token-id",
  "tenant_id": "tenant-456"
}
```

---

## SCIM 2.0 Implementation

### Standards Compliance

Nova Universe's SCIM implementation follows:

- ✅ **RFC 7643** - SCIM Core Schema
- ✅ **RFC 7644** - SCIM Protocol
- ✅ Multi-tenant support with tenant isolation
- ✅ VIP user extensions

### SCIM Authentication

SCIM endpoints require Bearer token authentication:

```bash
curl -X GET https://your-domain.com/scim/v2/Users \
  -H "Authorization: Bearer YOUR_SCIM_BEARER_TOKEN"
```

Configure SCIM bearer token in environment:
```bash
SCIM_BEARER_TOKEN=your-secure-token-here
```

### SCIM Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/scim/v2/Users` | GET | List users |
| `/scim/v2/Users/{id}` | GET | Get user by ID |
| `/scim/v2/Users` | POST | Create user |
| `/scim/v2/Users/{id}` | PUT | Update user (full replace) |
| `/scim/v2/Users/{id}` | DELETE | Delete/deactivate user |
| `/scim/v2/Groups` | GET | List groups |
| `/scim/v2/Groups/{id}` | GET | Get group by ID |
| `/scim/v2/Groups` | POST | Create group |
| `/scim/v2/Groups/{id}` | PUT | Update group |
| `/scim/v2/Groups/{id}` | DELETE | Delete group |

### List Users

```bash
curl -X GET "https://your-domain.com/scim/v2/Users?startIndex=1&count=50" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/scim+json"
```

With filtering:
```bash
curl -X GET 'https://your-domain.com/scim/v2/Users?filter=userName eq "user@example.com"' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  "totalResults": 100,
  "startIndex": 1,
  "itemsPerPage": 50,
  "Resources": [
    {
      "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
      "id": "user-123",
      "userName": "user@example.com",
      "name": {
        "givenName": "John",
        "familyName": "Doe"
      },
      "emails": [
        {
          "value": "user@example.com",
          "primary": true
        }
      ],
      "active": true,
      "meta": {
        "resourceType": "User",
        "created": "2024-01-01T00:00:00Z",
        "lastModified": "2024-01-01T00:00:00Z"
      }
    }
  ]
}
```

### Get User by ID

```bash
curl -X GET https://your-domain.com/scim/v2/Users/user-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create User

```bash
curl -X POST https://your-domain.com/scim/v2/Users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
    "userName": "newuser@example.com",
    "name": {
      "givenName": "Jane",
      "familyName": "Smith"
    },
    "emails": [
      {
        "value": "newuser@example.com",
        "primary": true
      }
    ],
    "active": true
  }'
```

### Update User

```bash
curl -X PUT https://your-domain.com/scim/v2/Users/user-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
    "id": "user-123",
    "userName": "user@example.com",
    "name": {
      "givenName": "John",
      "familyName": "Updated"
    },
    "emails": [
      {
        "value": "user@example.com",
        "primary": true
      }
    ],
    "active": true
  }'
```

### Deactivate User

```bash
curl -X DELETE https://your-domain.com/scim/v2/Users/user-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### VIP User Extension

Nova Universe supports a custom VIP extension:

```json
{
  "schemas": [
    "urn:ietf:params:scim:schemas:core:2.0:User",
    "urn:nova:vip:1.0:User"
  ],
  "userName": "vip@example.com",
  "urn:nova:vip:1.0:User": {
    "isVip": true,
    "vipLevel": 3
  }
}
```

---

## Security Considerations

### OAuth 2.0 Security

1. **PKCE Required** - All authorization code flows must use PKCE (code_challenge_method=S256)
2. **HTTPS Only** - OAuth endpoints must be accessed over HTTPS in production
3. **Short-Lived Tokens** - Access tokens expire in 15 minutes (configurable)
4. **Token Rotation** - Refresh tokens are rotated on use
5. **Token Revocation** - Revoked tokens are tracked in blacklist
6. **Client Secret Security** - Client secrets are hashed (SHA-256) in database

### SCIM Security

1. **Bearer Token Authentication** - All SCIM requests require valid bearer token
2. **Tenant Isolation** - Users and groups are isolated per tenant
3. **Rate Limiting** - SCIM endpoints are rate-limited to prevent abuse
4. **Audit Logging** - All SCIM operations are logged for compliance

### Rate Limits

| Endpoint Type | Window | Max Requests |
|--------------|--------|--------------|
| OAuth Registration | 1 minute | 10 |
| OAuth Authorize | 1 minute | 30 |
| OAuth Token | 1 minute | 60 |
| OAuth Revoke | 1 minute | 60 |
| OAuth Introspect | 1 minute | 120 |
| SCIM Operations | 15 minutes | 100 |

---

## Multi-Tenant Support

### Tenant Isolation

Both OAuth 2.0 and SCIM support tenant isolation:

**OAuth 2.0:**
- Each client can be associated with a tenant
- Tokens include `tenant_id` claim
- Authorization codes are tenant-scoped
- Cross-tenant access is prevented

**SCIM:**
- Users and groups are tenant-scoped
- SCIM bearer tokens are tenant-specific
- Filtering and queries are tenant-isolated

### Tenant Configuration

Set tenant ID during client registration:

```json
{
  "client_name": "Tenant A Application",
  "redirect_uris": ["https://tenant-a.com/callback"],
  "tenant_id": "tenant-a-uuid"
}
```

---

## Quick Start Examples

### JavaScript/Node.js OAuth 2.0 Client

```javascript
import crypto from 'crypto';
import fetch from 'node-fetch';

// PKCE helper functions
function base64url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generatePKCE() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

// OAuth 2.0 Client
class OAuth2Client {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.baseUrl = config.baseUrl;
  }

  getAuthorizationUrl(state) {
    const { verifier, challenge } = generatePKCE();
    // Store verifier for later use
    this.codeVerifier = verifier;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'read write profile',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    return `${this.baseUrl}/api/v1/oauth/authorize?${params}`;
  }

  async exchangeCode(code) {
    const response = await fetch(`${this.baseUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectUri,
        code_verifier: this.codeVerifier,
      }),
    });

    return response.json();
  }

  async refreshToken(refreshToken) {
    const response = await fetch(`${this.baseUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    return response.json();
  }
}

// Usage
const client = new OAuth2Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://your-app.com/callback',
  baseUrl: 'https://your-domain.com',
});

// Get authorization URL
const authUrl = client.getAuthorizationUrl('random-state');
console.log('Visit:', authUrl);

// Exchange code for tokens (after redirect)
const tokens = await client.exchangeCode('authorization-code');
console.log('Access Token:', tokens.access_token);
```

### Python SCIM Client

```python
import requests

class SCIMClient:
    def __init__(self, base_url, bearer_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/scim+json'
        }
    
    def list_users(self, start_index=1, count=50, filter_expr=None):
        params = {'startIndex': start_index, 'count': count}
        if filter_expr:
            params['filter'] = filter_expr
        
        response = requests.get(
            f'{self.base_url}/scim/v2/Users',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def get_user(self, user_id):
        response = requests.get(
            f'{self.base_url}/scim/v2/Users/{user_id}',
            headers=self.headers
        )
        return response.json()
    
    def create_user(self, user_data):
        response = requests.post(
            f'{self.base_url}/scim/v2/Users',
            headers=self.headers,
            json=user_data
        )
        return response.json()
    
    def update_user(self, user_id, user_data):
        response = requests.put(
            f'{self.base_url}/scim/v2/Users/{user_id}',
            headers=self.headers,
            json=user_data
        )
        return response.json()
    
    def delete_user(self, user_id):
        response = requests.delete(
            f'{self.base_url}/scim/v2/Users/{user_id}',
            headers=self.headers
        )
        return response.status_code == 204

# Usage
client = SCIMClient('https://your-domain.com', 'your-bearer-token')

# List users
users = client.list_users(filter_expr='userName eq "user@example.com"')
print(f'Found {users["totalResults"]} users')

# Create user
new_user = client.create_user({
    'schemas': ['urn:ietf:params:scim:schemas:core:2.0:User'],
    'userName': 'newuser@example.com',
    'name': {
        'givenName': 'New',
        'familyName': 'User'
    },
    'emails': [{
        'value': 'newuser@example.com',
        'primary': True
    }],
    'active': True
})
print(f'Created user: {new_user["id"]}')
```

---

## Testing

### OAuth 2.0 Testing

Use the development client credentials:
- **Client ID:** `nova-universe-dev`
- **Client Secret:** `dev-secret-change-in-production`
- **Redirect URIs:** `http://localhost:5173/callback`, `http://localhost:3000/callback`

### SCIM Testing

Set SCIM bearer token:
```bash
export SCIM_BEARER_TOKEN="test-scim-token"
```

Test SCIM endpoints:
```bash
curl -X GET http://localhost:3000/scim/v2/Users \
  -H "Authorization: Bearer test-scim-token"
```

---

## Troubleshooting

### Common OAuth 2.0 Issues

1. **Invalid redirect_uri**
   - Ensure redirect_uri matches exactly what was registered
   - Check for trailing slashes

2. **PKCE verification failed**
   - Verify code_verifier matches the code_challenge
   - Ensure code_challenge_method is 'S256'

3. **Token expired**
   - Access tokens expire in 15 minutes
   - Use refresh token to get new access token

### Common SCIM Issues

1. **401 Unauthorized**
   - Verify SCIM_BEARER_TOKEN is configured
   - Check Authorization header format

2. **User already exists (409)**
   - SCIM requires unique userNames (emails)
   - Check for existing user before creating

3. **Invalid request (400)**
   - Verify request body matches SCIM schema
   - Check Content-Type is 'application/scim+json'

---

## Support

For API support:
- **Documentation:** https://your-domain.com/docs
- **Email:** api-support@your-domain.com
- **GitHub:** https://github.com/itristenx/nova-universe

## References

- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [RFC 7643 - SCIM Core Schema](https://tools.ietf.org/html/rfc7643)
- [RFC 7644 - SCIM Protocol](https://tools.ietf.org/html/rfc7644)
- [OWASP OAuth 2.0 Security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Security_Cheat_Sheet.html)
