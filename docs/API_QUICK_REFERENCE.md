# Nova Universe API - Quick Reference Card

## 🚀 Quick Commands

```bash
# Generate API inventory
node scripts/generate-api-inventory.js

# Run API audit tests
npm test -- test/api-comprehensive-audit.test.js

# Run security tests
npm test -- test/security-testing.test.js

# Remove duplicate routes (with backup)
node scripts/remove-duplicate-routes.js

# Run all tests
npm test
```

## 📊 Current Status at a Glance

| Metric | Value | Status |
|--------|-------|--------|
| Total Endpoints | 926 | ⚠️ |
| Protected | 348 (37.6%) | ❌ Critical |
| Unprotected | 578 (62.4%) | ❌ Critical |
| Duplicates | 107 | ❌ High |
| Versioned | 2 (0.2%) | ❌ High |
| Security Score | 62/100 | ⚠️ Needs Work |
| OWASP Compliance | 45/100 | ❌ Critical |

## 🎯 Top Priorities

### 1️⃣ WEEK 1 - CRITICAL (16-24h)
- [ ] Add auth to dashboard endpoints
- [ ] Add auth to config endpoints  
- [ ] Add auth to analytics endpoints
- [ ] Apply security headers globally
- [ ] Remove duplicate registrations

### 2️⃣ WEEKS 2-3 - HIGH (24-32h)
- [ ] Implement RBAC
- [ ] Add input validation
- [ ] Enhance rate limiting

### 3️⃣ WEEK 4 - MEDIUM (20-28h)
- [ ] Consolidate routes
- [ ] Update OpenAPI spec
- [ ] Complete documentation

## 🔐 Security Middleware Cheat Sheet

```javascript
// Import
import {
  ensureAuthenticated,
  requirePermission,
  requireRole,
  validateBody,
  auditLog,
  securityHeaders,
} from '../middleware/enhanced-security.js';

// Basic auth
router.get('/protected', ensureAuthenticated, handler);

// Role-based
router.get('/admin', ensureAuthenticated, requireRole('admin'), handler);

// Permission-based
router.delete('/item/:id', ensureAuthenticated, requirePermission('items.delete'), handler);

// Full stack
router.post('/sensitive',
  ensureAuthenticated,
  requirePermission('sensitive.write'),
  validateBody(schema),
  auditLog('sensitive.create'),
  handler
);

// Apply to all routes
router.use(ensureAuthenticated);
```

## 📚 Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| [API_DOCUMENTATION_README.md](./API_DOCUMENTATION_README.md) | 📍 START HERE | Everyone |
| [API_REVIEW_EXECUTIVE_SUMMARY.md](./API_REVIEW_EXECUTIVE_SUMMARY.md) | Overview & ROI | Management |
| [API_SECURITY_AUDIT.md](./API_SECURITY_AUDIT.md) | Security issues | Security Team |
| [API_SECURITY_IMPLEMENTATION_GUIDE.md](./API_SECURITY_IMPLEMENTATION_GUIDE.md) | How to fix | Developers |
| [API_INVENTORY.md](./API_INVENTORY.md) | All endpoints | All Devs |
| [API_CONSOLIDATION_PLAN.md](./API_CONSOLIDATION_PLAN.md) | Cleanup plan | Tech Leads |
| [API_STANDARDS_COMPLIANCE.md](./API_STANDARDS_COMPLIANCE.md) | Benchmarking | Architects |

## ⚡ Common Tasks

### Secure an endpoint
1. Import middleware: `import { ensureAuthenticated } from '../middleware/enhanced-security.js'`
2. Apply: `router.get('/path', ensureAuthenticated, handler)`
3. Test: `npm test -- test/api-comprehensive-audit.test.js`

### Check for duplicates
```bash
node scripts/generate-api-inventory.js
grep "Registered in:" docs/API_INVENTORY.md
```

### Add RBAC
```javascript
router.post('/admin-action',
  ensureAuthenticated,
  requireRole(['admin', 'tech_lead']),
  handler
);
```

### Validate input
```javascript
import Joi from 'joi';
const schema = Joi.object({
  title: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
});

router.post('/tickets',
  ensureAuthenticated,
  validateBody(schema),
  createTicket
);
```

## 🎯 Success Criteria Quick Check

- [ ] Auth coverage > 95%
- [ ] Security score > 90/100
- [ ] OWASP compliance > 90%
- [ ] Zero duplicates
- [ ] 100% versioning
- [ ] All tests passing

## 💡 Key Contacts

- **Documentation**: `docs/API_DOCUMENTATION_README.md`
- **Security Issues**: `docs/API_SECURITY_AUDIT.md`
- **Implementation Help**: `docs/API_SECURITY_IMPLEMENTATION_GUIDE.md`
- **Tool Issues**: Check scripts/ directory

## 🔥 Emergency Response

### Security Breach Detected
1. Review `docs/API_SECURITY_AUDIT.md`
2. Prioritize critical issues
3. Apply fixes from implementation guide
4. Run security tests
5. Deploy immediately

### API Breaking
1. Check `docs/API_INVENTORY.md` for changes
2. Review consolidation plan
3. Restore from .backup files if needed
4. Run all tests
5. Check for duplicates

### Performance Issues
1. Check rate limiting configuration
2. Review endpoint consolidation
3. Optimize database queries
4. Monitor with analytics

---

**Last Updated**: 2025-10-05  
**Quick Help**: Start with `docs/API_DOCUMENTATION_README.md`
