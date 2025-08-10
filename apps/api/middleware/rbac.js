import { logger } from '../logger.js';

export function checkPermissions(requiredPermissions = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];

    const missing = requiredPermissions.filter((p) => !userPermissions.includes(p));
    if (missing.length > 0) {
      logger.warn('Access denied - missing permissions', {
        userId: req.user.id,
        required: requiredPermissions,
        missing
      });
      return res.status(403).json({ error: 'Forbidden: insufficient permissions', missing });
    }

    return next();
  };
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
    const ok = roles.some((r) => userRoles.includes(r));
    if (!ok) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    return next();
  };
}
