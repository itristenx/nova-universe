import { logger } from '../logger.js';
import db from '../db.js';

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
}

/**
 * Check specific permission for service catalog RBAC
 */
export function checkPermission(permission) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // For now, allow superadmin and admin roles to access everything
      const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
      const privilegedRoles = ['superadmin', 'admin', 'core_admin', 'pulse_admin'];
      const isPrivileged = roles.some((r) => privilegedRoles.includes(String(r).toLowerCase()));

      if (isPrivileged) {
        return next();
      }

      // Check if user has the specific permission through RBAC system
      try {
        const hasPermission = await checkUserPermission(userId, permission);
        if (hasPermission) {
          return next();
        }
      } catch (dbError) {
        logger.warn('Database permission check failed, falling back to role-based check', {
          error: dbError.message,
        });
      }

      // Fallback permission mapping for basic functionality
      const permissionRoleMap = {
        'catalog:read': ['user', 'requester', 'approver'],
        'catalog:write': ['catalog_admin', 'approver'],
        'requests:read': ['user', 'requester', 'approver'],
        'requests:write': ['user', 'requester'],
        'approvals:read': ['approver', 'manager'],
        'approvals:write': ['approver', 'manager'],
        'rbac:read': ['admin', 'rbac_admin'],
        'rbac:write': ['admin', 'rbac_admin'],
        'feature_flags:read': ['admin', 'developer'],
        'feature_flags:write': ['admin', 'developer'],
        'ab_testing:read': ['admin', 'developer', 'analyst'],
        'ab_testing:write': ['admin', 'developer'],
        'cost_centers:read': ['manager', 'finance'],
        'cost_centers:write': ['manager', 'finance'],
      };

      const allowedRoles = permissionRoleMap[permission] || [];
      const hasRoleAccess = roles.some((r) => allowedRoles.includes(String(r).toLowerCase()));

      if (hasRoleAccess) {
        return next();
      }

      logger.warn('Permission denied', {
        userId,
        permission,
        userRoles: roles,
        path: req.originalUrl,
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        hint: `Required roles: ${allowedRoles.join(', ')}`,
      });
    } catch (err) {
      logger.error('Permission check error', { error: err.message });
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Check if user has specific permission through RBAC database
 */
async function checkUserPermission(userId, permission) {
  try {
    const result = await db.query(
      `
      WITH user_permissions AS (
        -- Get permissions from direct role assignments
        SELECT DISTINCT unnest(r.permissions) as permission
        FROM rbac_user_role_assignments ura
        JOIN rbac_roles r ON ura.role_id = r.id
        WHERE ura.user_id = $1 AND r.status = 'active'
        
        UNION
        
        -- Get permissions from group-based role assignments
        SELECT DISTINCT unnest(r.permissions) as permission
        FROM rbac_user_group_memberships ugm
        JOIN rbac_groups g ON ugm.group_id = g.id
        JOIN rbac_user_role_assignments ura ON g.id = ura.role_id
        JOIN rbac_roles r ON ura.role_id = r.id
        WHERE ugm.user_id = $1 AND g.status = 'active' AND r.status = 'active'
      )
      SELECT 1 FROM user_permissions WHERE permission = $2
      LIMIT 1
    `,
      [userId, permission],
    );

    return result.rows.length > 0;
  } catch (err) {
    logger.error('Database permission check error', { error: err.message });
    throw err;
  }
}
