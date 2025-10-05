# API Security Implementation Guide

## Quick Start: Securing Your Endpoints

This guide provides practical examples for implementing the security recommendations from our API audit.

## Table of Contents

1. [Adding Authentication](#adding-authentication)
2. [Implementing Authorization (RBAC)](#implementing-authorization)
3. [Applying Security Headers](#applying-security-headers)
4. [Input Validation](#input-validation)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)
7. [Audit Logging](#audit-logging)
8. [Migration Guide](#migration-guide)

## Adding Authentication

### Current Issue
578 out of 926 endpoints (62.4%) lack authentication.

### Solution: Use Enhanced Security Middleware

#### Step 1: Import the middleware

```javascript
import { ensureAuthenticated } from '../middleware/enhanced-security.js';
```

#### Step 2: Apply to routes

**Before (INSECURE)**:
```javascript
// routes/analytics.js
router.get('/dashboard', getDashboard);
router.get('/real-time', getRealTimeData);
```

**After (SECURE)**:
```javascript
// routes/analytics.js
import { ensureAuthenticated } from '../middleware/enhanced-security.js';

router.get('/dashboard', ensureAuthenticated, getDashboard);
router.get('/real-time', ensureAuthenticated, getRealTimeData);
```

#### Step 3: Apply to entire router (recommended)

```javascript
// routes/analytics.js
import { ensureAuthenticated } from '../middleware/enhanced-security.js';

const router = express.Router();

// Apply authentication to all routes in this router
router.use(ensureAuthenticated);

// Now all routes are automatically protected
router.get('/dashboard', getDashboard);
router.get('/real-time', getRealTimeData);
router.get('/executive', getExecutiveReport);
```

### Priority Endpoints to Secure Immediately

1. **Dashboard endpoints** (8 instances)
```javascript
router.get('/dashboard', ensureAuthenticated, getDashboard);
router.get('/analytics/dashboard', ensureAuthenticated, getAnalytics);
```

2. **Configuration endpoints**
```javascript
router.get('/config', ensureAuthenticated, getConfig);
router.put('/config/:key', ensureAuthenticated, updateConfig);
```

3. **User management**
```javascript
router.get('/users/:userId/permissions', ensureAuthenticated, getPermissions);
router.put('/users/:userId/permissions', ensureAuthenticated, updatePermissions);
```

4. **Workflow execution**
```javascript
router.post('/workflows/trigger', ensureAuthenticated, triggerWorkflow);
router.post('/workflows/:id/execute', ensureAuthenticated, executeWorkflow);
```

## Implementing Authorization

### Role-Based Access Control (RBAC)

#### Example 1: Require specific role

```javascript
import { ensureAuthenticated, requireRole } from '../middleware/enhanced-security.js';

// Only admins can access
router.get('/admin/analytics', 
  ensureAuthenticated, 
  requireRole('admin'), 
  getAdminAnalytics
);

// Admins or tech leads
router.post('/experiments/:id/start', 
  ensureAuthenticated, 
  requireRole(['admin', 'tech_lead']), 
  startExperiment
);
```

#### Example 2: Require specific permission

```javascript
import { ensureAuthenticated, requirePermission } from '../middleware/enhanced-security.js';

// Require 'tickets.delete' permission
router.delete('/tickets/:id', 
  ensureAuthenticated, 
  requirePermission('tickets.delete'), 
  deleteTicket
);

// Require 'config.write' permission
router.put('/config/:key', 
  ensureAuthenticated, 
  requirePermission('config.write'), 
  updateConfig
);
```

#### Example 3: Resource ownership check

```javascript
import { ensureAuthenticated, ensureOwnershipOrAdmin } from '../middleware/enhanced-security.js';

// User can only access their own tickets unless they're admin
router.get('/tickets/:id', 
  ensureAuthenticated,
  ensureOwnershipOrAdmin(async (req) => {
    const ticket = await getTicket(req.params.id);
    return ticket.userId;
  }),
  getTicket
);
```

### Permission Matrix

| Endpoint | Required Permission | Allowed Roles |
|----------|-------------------|---------------|
| `GET /analytics/*` | `analytics.read` | admin, tech_lead |
| `POST /tickets` | `tickets.create` | all authenticated |
| `DELETE /tickets/:id` | `tickets.delete` | admin, tech_lead, owner |
| `PUT /config/*` | `config.write` | admin |
| `POST /experiments/*` | `experiments.manage` | admin, tech_lead |

## Applying Security Headers

### Global Application (Recommended)

Add to `apps/api/index.js`:

```javascript
import { securityHeaders } from './middleware/enhanced-security.js';

// Apply to all routes
app.use(securityHeaders);
```

### Per-Route Application

```javascript
import { securityHeaders } from '../middleware/enhanced-security.js';

router.get('/sensitive-data', securityHeaders, getSensitiveData);
```

### Expected Headers

All responses should include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

And should NOT include:
```
X-Powered-By: Express (should be removed)
```

## Input Validation

### Using Joi Schema Validation

#### Step 1: Install Joi (if not already installed)

```bash
npm install joi
```

#### Step 2: Define schemas

```javascript
// schemas/ticket.js
import Joi from 'joi';

export const createTicketSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(5000).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  category: Joi.string().required(),
  assigneeId: Joi.number().integer().positive().optional(),
});

export const updateTicketSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(5000).optional(),
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
});
```

#### Step 3: Apply validation

```javascript
import { validateBody } from '../middleware/enhanced-security.js';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticket.js';

router.post('/tickets', 
  ensureAuthenticated,
  validateBody(createTicketSchema),
  createTicket
);

router.put('/tickets/:id', 
  ensureAuthenticated,
  validateBody(updateTicketSchema),
  updateTicket
);
```

### Manual Validation Example

```javascript
router.post('/search', ensureAuthenticated, (req, res) => {
  const { query, limit = 10, offset = 0 } = req.body;
  
  // Validate inputs
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Query must be a non-empty string',
    });
  }
  
  if (limit > 100) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Limit cannot exceed 100',
    });
  }
  
  // Process validated input
  // ...
});
```

## Rate Limiting

### Endpoint-Specific Limits

```javascript
import { createRateLimit } from '../middleware/rateLimiter.js';

// Stricter limits for sensitive endpoints
const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 per 15 min
const uploadRateLimit = createRateLimit(60 * 60 * 1000, 10); // 10 per hour

router.post('/auth/login', authRateLimit, login);
router.post('/files/upload', uploadRateLimit, uploadFile);
```

### Recommended Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 | 15 minutes |
| Password reset | 3 | 1 hour |
| File upload | 10 | 1 hour |
| General API | 100 | 15 minutes |
| Public endpoints | 200 | 15 minutes |
| SCIM provisioning | 100 | 1 minute |

## Error Handling

### Consistent Error Response Format

```javascript
// middleware/error-handler.js
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Build error response
  const errorResponse = {
    error: err.name || 'Internal Server Error',
    message: err.userMessage || 'An error occurred processing your request',
    ...(err.code && { code: err.code }),
  };

  // Only include details in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.message;
  }

  res.status(statusCode).json(errorResponse);
};

// Apply globally in index.js
app.use(errorHandler);
```

### Custom Error Classes

```javascript
// utils/errors.js
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.userMessage = message;
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.userMessage = message;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.userMessage = message;
  }
}

// Usage
throw new ValidationError('Invalid ticket data', [
  { field: 'title', message: 'Title is required' },
  { field: 'priority', message: 'Priority must be low, medium, high, or critical' },
]);
```

## Audit Logging

### Log Sensitive Operations

```javascript
import { auditLog } from '../middleware/enhanced-security.js';

// Log configuration changes
router.put('/config/:key', 
  ensureAuthenticated,
  requirePermission('config.write'),
  auditLog('config.update'),
  updateConfig
);

// Log user deletions
router.delete('/users/:id', 
  ensureAuthenticated,
  requireRole('admin'),
  auditLog('user.delete'),
  deleteUser
);

// Log permission changes
router.put('/users/:id/permissions', 
  ensureAuthenticated,
  requirePermission('permissions.manage'),
  auditLog('permissions.update'),
  updatePermissions
);
```

### Manual Audit Logging

```javascript
import { logger } from '../logger.js';

router.post('/experiments/:id/start', ensureAuthenticated, async (req, res) => {
  try {
    const experiment = await startExperiment(req.params.id);
    
    // Log the action
    logger.info('Experiment started', {
      action: 'experiment.start',
      experimentId: req.params.id,
      userId: req.user.id,
      userEmail: req.user.email,
      timestamp: new Date().toISOString(),
    });
    
    res.json({ success: true, data: experiment });
  } catch (error) {
    // Error logging handled by error handler
    throw error;
  }
});
```

## Migration Guide

### Step-by-Step Endpoint Security Migration

#### Phase 1: Critical Endpoints (Week 1)

1. **Identify critical endpoints** (use API_INVENTORY.md)
2. **Add authentication**:
   ```bash
   # Find unprotected critical endpoints
   grep "🔓 No" docs/API_INVENTORY.md | grep -E "dashboard|config|admin|permissions"
   ```
3. **Apply middleware**:
   ```javascript
   router.use(ensureAuthenticated); // Add to router
   ```
4. **Test endpoints**:
   ```bash
   npm test -- test/api-comprehensive-audit.test.js
   ```

#### Phase 2: Add Authorization (Week 2)

1. **Define permission matrix** (see above)
2. **Add role checks**:
   ```javascript
   router.put('/config/:key', 
     ensureAuthenticated,
     requireRole('admin'),
     updateConfig
   );
   ```
3. **Test authorization**:
   ```bash
   npm test -- test/auth-comprehensive.test.js
   ```

#### Phase 3: Security Headers & Validation (Week 3)

1. **Apply security headers globally**:
   ```javascript
   app.use(securityHeaders); // Add to index.js
   ```
2. **Add input validation**:
   ```javascript
   router.post('/', validateBody(schema), handler);
   ```
3. **Test security**:
   ```bash
   npm test -- test/security-testing.test.js
   ```

#### Phase 4: Audit & Documentation (Week 4)

1. **Enable audit logging**:
   ```javascript
   router.use(auditLog('module.action'));
   ```
2. **Update OpenAPI spec**
3. **Run full test suite**:
   ```bash
   npm test
   ```
4. **Generate updated inventory**:
   ```bash
   node scripts/generate-api-inventory.js
   ```

### Testing Checklist

After applying security changes:

- [ ] All tests pass (`npm test`)
- [ ] Authentication works on protected endpoints
- [ ] Authorization correctly denies unauthorized access
- [ ] Security headers present in all responses
- [ ] Input validation rejects invalid data
- [ ] Rate limiting triggers at expected thresholds
- [ ] Error messages don't expose sensitive info
- [ ] Audit logs capture all sensitive operations
- [ ] API documentation updated
- [ ] No duplicate endpoints remain

### Rollback Plan

If issues occur:

1. **Backup route files exist** (`.backup` extension)
2. **Restore from backup**:
   ```bash
   git checkout <commit-before-changes>
   ```
3. **Remove security middleware** temporarily:
   ```javascript
   // Comment out
   // router.use(ensureAuthenticated);
   ```
4. **Re-test and fix issues**
5. **Reapply changes incrementally**

## Quick Reference

### Import Statement

```javascript
import {
  ensureAuthenticated,
  requirePermission,
  requireRole,
  ensureOwnershipOrAdmin,
  validateBody,
  auditLog,
  deprecationWarning,
  securityHeaders,
} from '../middleware/enhanced-security.js';
```

### Common Patterns

```javascript
// Public endpoint (no auth)
router.get('/public/articles', getArticles);

// Authenticated endpoint
router.get('/my/tickets', ensureAuthenticated, getMyTickets);

// Admin only
router.delete('/users/:id', ensureAuthenticated, requireRole('admin'), deleteUser);

// Permission-based
router.put('/config/:key', ensureAuthenticated, requirePermission('config.write'), updateConfig);

// Ownership or admin
router.get('/tickets/:id', 
  ensureAuthenticated,
  ensureOwnershipOrAdmin(req => getTicketOwnerId(req.params.id)),
  getTicket
);

// Full security stack
router.post('/experiments/:id/start',
  ensureAuthenticated,
  requirePermission('experiments.manage'),
  validateBody(experimentSchema),
  auditLog('experiment.start'),
  startExperiment
);
```

## Support

- **Documentation**: See `docs/API_SECURITY_AUDIT.md`
- **Examples**: Check existing secure endpoints in `routes/helix.js`
- **Testing**: Run `npm test -- test/security-testing.test.js`
- **Questions**: Contact API team

---

**Last Updated**: 2025-10-05  
**Version**: 1.0
