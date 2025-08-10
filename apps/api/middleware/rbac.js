import { logger } from '../logger.js';

/**
 * Basic permission middleware. Until fine-grained permissions are populated on JWT,
 * we map required permissions to privileged roles.
 */
export function checkPermissions(requiredPermissions = []) {
  const privilegedRoles = new Set([
    'superadmin',
    'admin',
    'core_admin',
    'pulse_admin',
    'pulse_lead',
  ]);

  return (req, res, next) => {
    try {
      const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
      const isPrivileged = roles.some((r) => privilegedRoles.has(String(r).toLowerCase()));

      if (!isPrivileged) {
        logger.warn('RBAC denied request', {
          userId: req.user?.id,
          roles,
          requiredPermissions,
          path: req.originalUrl,
        });
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      logger.error('RBAC middleware error', { error: err?.message });
      return res.status(500).json({ error: 'RBAC processing error' });
    }
  };
<<<<<<< Current (Your changes)
};
=======
}
>>>>>>> Incoming (Background Agent changes)
