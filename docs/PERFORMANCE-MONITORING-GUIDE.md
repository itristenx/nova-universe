# Performance Monitoring Implementation Guide

**Date**: October 9, 2025  
**Status**: TODO  
**Estimated Time**: 1 hour

---

## Overview

This guide shows how to implement comprehensive performance monitoring using **Sentry** for error tracking, performance monitoring, and user analytics in Nova Universe.

---

## Why Sentry?

- ✅ **Error Tracking**: Automatic error capture with stack traces
- ✅ **Performance Monitoring**: Track page loads, API calls, database queries
- ✅ **Real User Monitoring**: Understand actual user experience
- ✅ **Release Tracking**: Connect errors to specific code releases
- ✅ **Source Maps**: See original source code in stack traces
- ✅ **Breadcrumbs**: Full context leading up to errors
- ✅ **Free Tier**: 5,000 errors/month, 10,000 performance units

**Alternative**: DataDog (more comprehensive but expensive)

---

## Implementation Plan

### Phase 1: Setup & Installation (10 min)

#### 1. Create Sentry Account

1. Go to https://sentry.io/signup/
2. Create account
3. Create new project: "Nova Universe"
4. Select "React" platform
5. Copy DSN (Data Source Name)

#### 2. Install Dependencies

```bash
# In /Users/tneibarger/nova-universe
pnpm add @sentry/react @sentry/tracing
```

---

### Phase 2: Frontend Integration (15 min)

#### File: `apps/unified/src/sentry.ts`

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry() {
  // Only in production or if explicitly enabled
  if (import.meta.env.VITE_ENABLE_SENTRY !== 'true') {
    console.log('[Sentry] Disabled (set VITE_ENABLE_SENTRY=true to enable)');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    
    // Environment
    environment: import.meta.env.MODE, // 'development' or 'production'
    
    // Release tracking (use git commit hash)
    release: `nova-universe@${import.meta.env.VITE_APP_VERSION || 'dev'}`,
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Track route changes
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
        
        // Track API calls
        traceFetch: true,
        traceXHR: true,
      }),
    ],
    
    // Performance sampling
    // 100% = track all transactions (use 10% in production to save quota)
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Session replay sampling
    // Capture 10% of sessions for replay
    replaysSessionSampleRate: 0.1,
    
    // Capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,
    
    // Filter out noise
    beforeSend(event, hint) {
      // Don't send certain errors
      if (event.exception) {
        const error = hint.originalException;
        
        // Filter out network errors (user offline)
        if (error?.message?.includes('Failed to fetch')) {
          return null;
        }
        
        // Filter out browser extension errors
        if (error?.message?.includes('chrome-extension://')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Add user context
    beforeBreadcrumb(breadcrumb) {
      // Don't log sensitive data
      if (breadcrumb.category === 'console' && breadcrumb.message?.includes('password')) {
        return null;
      }
      
      return breadcrumb;
    },
  });
  
  console.log('[Sentry] Initialized');
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: { id: string; email: string; name: string; role: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Manually capture an error
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb (for context)
 */
export function addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    data,
    level: 'info',
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}
```

---

#### Update `apps/unified/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSentry } from './sentry';
import './index.css';

// Initialize Sentry FIRST (before anything else)
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

#### Update `.env` files

```bash
# apps/unified/.env.local
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_SENTRY=false  # Set to true in production

# For release tracking
VITE_APP_VERSION=1.0.0
```

---

### Phase 3: Wrap App with Sentry (5 min)

#### Update `apps/unified/src/App.tsx`

```typescript
import * as Sentry from '@sentry/react';
import { BrowserRouter } from 'react-router-dom';

// Wrap Router with Sentry
const SentryRoutes = Sentry.withSentryRouting(Routes);

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
      showDialog
    >
      <BrowserRouter>
        <SentryRoutes>
          {/* Your routes */}
        </SentryRoutes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

// Error fallback component
function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          We've been notified and are working on a fix.
        </p>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto mb-4">
          {error.message}
        </pre>
        <button
          onClick={resetError}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default App;
```

---

### Phase 4: Track User Actions (10 min)

#### Update `apps/unified/src/context/AuthContext.tsx`

```typescript
import { setSentryUser, clearSentryUser } from '@/sentry';

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials) => {
    const response = await backendAPI.auth.login(credentials);
    const user = response.user;
    
    setUser(user);
    
    // Set Sentry user context
    setSentryUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    
    return user;
  };

  const logout = () => {
    setUser(null);
    
    // Clear Sentry user context
    clearSentryUser();
  };

  // ... rest
};
```

---

### Phase 5: Track API Performance (10 min)

#### Update `apps/unified/src/services/backend-api-client.ts`

```typescript
import * as Sentry from '@sentry/react';

// Wrap API calls with performance tracking
async function trackAPICall<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: `API: ${name}`,
    op: 'http.client',
  });

  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    
    // Capture API errors with context
    Sentry.captureException(error, {
      tags: {
        api_endpoint: name,
        api_method: 'POST', // or GET, etc.
      },
    });
    
    throw error;
  } finally {
    transaction.finish();
  }
}

// Example usage
export const backendAPI = {
  knowledge: {
    search: async (query: string) => {
      return trackAPICall('knowledge.search', async () => {
        const response = await axios.post('/api/v1/knowledge/search', { query });
        return response.data;
      });
    },
    
    // ... other methods
  },
};
```

---

### Phase 6: Custom Performance Metrics (10 min)

#### Track Page Load Performance

```typescript
// apps/unified/src/pages/admin/ChangeManagementPage.tsx

import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

export const ChangeManagementPage: React.FC = () => {
  useEffect(() => {
    // Start transaction
    const transaction = Sentry.startTransaction({
      name: 'ChangeManagementPage Load',
      op: 'pageload',
    });

    // Track data fetching
    const fetchSpan = transaction.startChild({
      op: 'http.client',
      description: 'Fetch changes',
    });

    fetchChanges()
      .then(() => {
        fetchSpan.setStatus('ok');
      })
      .catch((error) => {
        fetchSpan.setStatus('internal_error');
        Sentry.captureException(error);
      })
      .finally(() => {
        fetchSpan.finish();
        transaction.finish();
      });

    return () => {
      transaction.finish();
    };
  }, []);

  // ... rest
};
```

---

#### Track User Interactions

```typescript
import { addBreadcrumb } from '@/sentry';

const handleApprove = async (changeId: string) => {
  // Add breadcrumb for context
  addBreadcrumb('User approved change', 'user_action', { changeId });

  try {
    await backendAPI.changes.approve(changeId);
    toast.success('Change approved');
  } catch (error) {
    // Error automatically sent to Sentry with breadcrumb context
    toast.error('Failed to approve change');
  }
};
```

---

### Phase 7: Backend Integration (Optional, 5 min)

If you want backend error tracking:

```javascript
// apps/api/server.js

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

// Request handler (must be first)
app.use(Sentry.Handlers.requestHandler());

// Tracing handler
app.use(Sentry.Handlers.tracingHandler());

// Your routes
app.use('/api', routes);

// Error handler (must be last)
app.use(Sentry.Handlers.errorHandler());
```

---

## Viewing Metrics

### Sentry Dashboard

1. **Errors**: https://sentry.io/organizations/your-org/issues/
   - See all errors with stack traces
   - Group similar errors
   - See affected users
   
2. **Performance**: https://sentry.io/organizations/your-org/performance/
   - Page load times
   - API response times
   - Database query performance
   - Frontend transaction traces
   
3. **Releases**: https://sentry.io/organizations/your-org/releases/
   - Track errors by release version
   - See new errors introduced in each release
   - Compare performance across releases

---

## Custom Metrics

### Track Business Metrics

```typescript
import * as Sentry from '@sentry/react';

// Track when user creates a change
const handleCreateChange = async (data) => {
  const transaction = Sentry.startTransaction({
    name: 'Create Change Request',
    op: 'user_action',
  });

  try {
    await backendAPI.changes.create(data);
    
    transaction.setTag('change_type', data.type);
    transaction.setTag('priority', data.priority);
    transaction.setStatus('ok');
    
    // Track custom metric
    Sentry.metrics.increment('change_requests_created', 1, {
      tags: { type: data.type, priority: data.priority },
    });
  } catch (error) {
    transaction.setStatus('internal_error');
    Sentry.captureException(error);
  } finally {
    transaction.finish();
  }
};
```

---

## Alert Configuration

### Set up Alerts in Sentry

1. Go to **Alerts** → **Create Alert**
2. Choose conditions:
   - Error rate increases by 100%
   - New error introduced
   - Performance degradation (p95 > 3s)
3. Set notification channels:
   - Email
   - Slack
   - PagerDuty

---

## Production Optimization

### 1. Source Maps

Upload source maps to Sentry for readable stack traces:

```json
// apps/unified/vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    sentryVitePlugin({
      org: 'your-org',
      project: 'nova-universe',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

### 2. Release Tracking

```bash
# In CI/CD pipeline
export SENTRY_RELEASE=$(git rev-parse HEAD)

# Create release
sentry-cli releases new $SENTRY_RELEASE

# Upload source maps
sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps ./dist

# Finalize release
sentry-cli releases finalize $SENTRY_RELEASE
```

### 3. Performance Budget

Set performance budgets in Sentry to get alerts:
- Page load: < 2s
- API calls: < 500ms
- Database queries: < 100ms

---

## Testing

### Manual Testing

```typescript
// Test error tracking
throw new Error('Test Sentry error tracking');

// Test message capture
captureMessage('Test Sentry message', 'warning');

// Test performance tracking
const transaction = startTransaction('Test Transaction', 'test');
setTimeout(() => {
  transaction.finish();
}, 1000);
```

### Automated Testing

```typescript
// tests/integration/sentry.test.ts

import * as Sentry from '@sentry/react';

describe('Sentry Integration', () => {
  it('should capture errors', () => {
    const spy = vi.spyOn(Sentry, 'captureException');
    
    try {
      throw new Error('Test error');
    } catch (error) {
      Sentry.captureException(error);
    }
    
    expect(spy).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should track performance', () => {
    const spy = vi.spyOn(Sentry, 'startTransaction');
    
    const transaction = Sentry.startTransaction({
      name: 'Test',
      op: 'test',
    });
    
    expect(spy).toHaveBeenCalled();
    transaction.finish();
  });
});
```

---

## Cost Management

### Free Tier Limits

- **5,000 errors/month**
- **10,000 performance units/month**
- **1 GB attachments**

### Optimization Tips

1. **Sample Performance**: Use 10% sampling in production
2. **Filter Noise**: Filter out browser extensions, offline errors
3. **Throttle Events**: Don't send duplicate errors
4. **Use Environments**: Disable in development

```typescript
// Don't track in development
if (import.meta.env.MODE === 'development') {
  Sentry.init({ enabled: false });
}
```

---

## Alternative: DataDog (If Needed)

If you need more comprehensive monitoring:

```bash
pnpm add @datadog/browser-rum @datadog/browser-logs
```

```typescript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'YOUR_APP_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'nova-universe',
  env: 'production',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
});
```

---

## Checklist

- [ ] Create Sentry account
- [ ] Install dependencies
- [ ] Create `sentry.ts` utility file
- [ ] Initialize in `main.tsx`
- [ ] Wrap app with ErrorBoundary
- [ ] Add user context in AuthContext
- [ ] Track API performance
- [ ] Add custom breadcrumbs
- [ ] Test error tracking
- [ ] Configure alerts
- [ ] Set up source maps (production)
- [ ] Configure release tracking (production)

---

**Status**: TODO  
**Estimated Time**: 1 hour  
**Priority**: Low (nice-to-have, do after RBAC, E2E tests, real-time updates)

---

## Quick Start

```bash
# 1. Install
pnpm add @sentry/react @sentry/tracing

# 2. Add to .env.local
echo "VITE_SENTRY_DSN=https://your-dsn@sentry.io/project" >> apps/unified/.env.local
echo "VITE_ENABLE_SENTRY=true" >> apps/unified/.env.local

# 3. Create sentry.ts file (use code from Phase 2)

# 4. Update main.tsx (add initSentry())

# 5. Test
# Open app, throw an error, check Sentry dashboard
```
