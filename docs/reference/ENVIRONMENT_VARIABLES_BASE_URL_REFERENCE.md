# Nova Universe Environment Variables Reference

## Base URL Configuration

This document outlines all the environment variables used for configuring base URLs throughout the Nova Universe application.

### 🎯 Primary URL Configuration

| Variable          | Purpose                       | Example                           | Used By                                    |
| ----------------- | ----------------------------- | --------------------------------- | ------------------------------------------ |
| `BASE_URL`        | Main application base URL     | `https://nova.yourorg.com`        | API routes, email templates, SSO callbacks |
| `PUBLIC_URL`      | Public-facing application URL | `https://nova.yourorg.com`        | Frontend routing, public links             |
| `API_URL`         | API server URL                | `https://api.nova.yourorg.com`    | Frontend API calls                         |
| `WEB_BASE_URL`    | Web interface base URL        | `https://app.nova.yourorg.com`    | Email templates, customer portals          |
| `PORTAL_BASE_URL` | Customer portal base URL      | `https://portal.nova.yourorg.com` | Email delays, unsubscribe links            |

### 🔧 Service-Specific URL Configuration

#### API Services

- `API_BASE_URL` - Swagger documentation, SSO callbacks
- Used by: `apps/api/index.js`, `apps/api/services/enhancedAppSwitcher.js`

#### Frontend Applications

- `VITE_API_URL` - Vite-based frontend API endpoint
- `VITE_API_BASE_URL` - Alternative API base URL for Vite
- `VITE_BASE_URL` - Frontend application base URL
- `VITE_WS_URL` - WebSocket connection URL
- Used by: `apps/unified/` React/Vite application

#### Email Services

- `EMAIL_TRACKING_DOMAIN` - Domain for email tracking pixels and links
- Used by: Email communication service, tracking pixels

### 🔄 Fallback Chain

The application uses a robust fallback chain to ensure URLs are always available:

1. **Email Templates**: `WEB_BASE_URL` → `BASE_URL` → `PUBLIC_URL` → `http://localhost:3000`
2. **Email Delays**: `PORTAL_BASE_URL` → `WEB_BASE_URL` → `BASE_URL` → `http://localhost:3000`
3. **API Documentation**: `API_BASE_URL` → `BASE_URL` → `http://localhost:PORT`
4. **SSO Callbacks**: `API_BASE_URL` → `BASE_URL` → `PUBLIC_URL` → `http://localhost:3000`

### 📝 Environment File Configuration

#### Development (.env)

```bash
# Development URLs - all localhost
BASE_URL=http://localhost:3000
PUBLIC_URL=http://localhost:3000
API_URL=http://localhost:3000
WEB_BASE_URL=http://localhost:3000
PORTAL_BASE_URL=http://localhost:3000

# Vite Frontend
VITE_API_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080
VITE_BASE_URL=http://localhost:5173
VITE_WS_URL=ws://localhost:8080
```

#### Production (.env.production)

```bash
# Production URLs - your domain
BASE_URL=https://nova.yourorg.com
PUBLIC_URL=https://nova.yourorg.com
API_URL=https://api.nova.yourorg.com
WEB_BASE_URL=https://app.nova.yourorg.com
PORTAL_BASE_URL=https://portal.nova.yourorg.com

# API-specific
API_BASE_URL=https://api.nova.yourorg.com

# Vite Frontend
VITE_API_URL=https://api.nova.yourorg.com
VITE_API_BASE_URL=https://api.nova.yourorg.com
VITE_BASE_URL=https://app.nova.yourorg.com
VITE_WS_URL=wss://api.nova.yourorg.com
```

### 🔍 Files Updated for Environment Variable Consistency

1. **Email Template Service** (`apps/api/services/email-template.service.js`)
   - Uses: `WEB_BASE_URL` → `BASE_URL` → `PUBLIC_URL` fallback
   - Purpose: Generate proper links in email templates

2. **Email Delay Service** (`apps/api/services/email-delay.service.js`)
   - Uses: `PORTAL_BASE_URL` → `WEB_BASE_URL` → `BASE_URL` fallback
   - Purpose: Generate unsubscribe URLs

3. **API Documentation** (`apps/api/index.js`)
   - Uses: `API_BASE_URL` → `BASE_URL` fallback
   - Purpose: Swagger/OpenAPI server URLs

4. **Enhanced App Switcher** (`apps/api/services/enhancedAppSwitcher.js`)
   - Uses: `API_BASE_URL` → `BASE_URL` → `PUBLIC_URL` fallback
   - Purpose: SSO callback URLs for Okta and Azure AD

5. **Setup Wizard** (`apps/unified/src/components/setup-wizard/hooks/useSetupWizard.ts`)
   - Uses: Multiple Vite environment variables with fallbacks
   - Purpose: Frontend API connections

6. **Environment Examples**
   - `.env.example` - Updated with comprehensive URL configuration
   - `apps/unified/.env.example` - Updated with Vite-specific URLs

### ✅ Benefits of This Configuration

1. **Consistency**: All services use the same environment variable pattern
2. **Flexibility**: Multiple URL types for different purposes (API, web, portal)
3. **Fallbacks**: Robust fallback chains prevent broken links
4. **Security**: Environment-based configuration prevents hardcoded URLs
5. **Deployment**: Easy to configure for different environments

### 🚀 Migration from Hardcoded URLs

**Before:**

```javascript
const baseUrl = 'https://portal.nova.com'; // Hardcoded
```

**After:**

```javascript
const baseUrl =
  process.env.PORTAL_BASE_URL ||
  process.env.WEB_BASE_URL ||
  process.env.BASE_URL ||
  'http://localhost:3000';
```

This ensures that all URLs are configurable and no hardcoded URLs remain in the codebase.

### 📋 Deployment Checklist

- [ ] Set `BASE_URL` for your main domain
- [ ] Set `API_BASE_URL` if using separate API domain
- [ ] Set `WEB_BASE_URL` for customer-facing interfaces
- [ ] Set `PORTAL_BASE_URL` for customer portal
- [ ] Configure Vite variables for frontend builds
- [ ] Verify email templates generate correct links
- [ ] Test SSO callback URLs work correctly
- [ ] Validate email tracking and unsubscribe links

All baseURL references are now properly configured as environment variables! 🎉
