import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';

const router = express.Router();

// ================== ROLES ==================

// Get all roles
router.get('/roles', authenticateJWT, checkPermission('rbac:read'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        r.id, r.name, r.description, r.permissions, r.is_system_role,
        r.created_at, r.updated_at,
        COUNT(uru.user_id) as user_count
      FROM rbac_roles r
      LEFT JOIN rbac_user_role_assignments ura ON r.id = ura.role_id
      LEFT JOIN users uru ON ura.user_id = uru.id AND uru.status = 'active'
      WHERE r.status = 'active'
      GROUP BY r.id, r.name, r.description, r.permissions, r.is_system_role, r.created_at, r.updated_at
      ORDER BY r.name
    `);
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get single role
router.get('/roles/:id', authenticateJWT, checkPermission('rbac:read'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT r.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'user_id', u.id,
              'name', u.name,
              'email', u.email,
              'assigned_at', ura.assigned_at
            )
          ) FILTER (WHERE u.id IS NOT NULL), 
          '[]'::json
        ) as assigned_users
      FROM rbac_roles r
      LEFT JOIN rbac_user_role_assignments ura ON r.id = ura.role_id
      LEFT JOIN users u ON ura.user_id = u.id AND u.status = 'active'
      WHERE r.id = $1
      GROUP BY r.id
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error fetching role:', err);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Create role
router.post('/roles', authenticateJWT, checkPermission('rbac:write'), async (req, res) => {
  const { name, description, permissions } = req.body;
  try {
    const result = await db.query(
      `
      INSERT INTO rbac_roles (name, description, permissions, is_system_role, status)
      VALUES ($1, $2, $3, false, 'active')
      RETURNING *
    `,
      [name, description, JSON.stringify(permissions || [])],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating role:', err);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
router.put('/roles/:id', authenticateJWT, checkPermission('rbac:write'), async (req, res) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;
  try {
    const result = await db.query(
      `
      UPDATE rbac_roles 
      SET name = $1, description = $2, permissions = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND is_system_role = false
      RETURNING *
    `,
      [name, description, JSON.stringify(permissions || []), id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found or is system role' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating role:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
router.delete('/roles/:id', authenticateJWT, checkPermission('rbac:write'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      UPDATE rbac_roles 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_system_role = false
      RETURNING id
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found or is system role' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    logger.error('Error deleting role:', err);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// ================== PERMISSIONS ==================

// Get all permissions
router.get('/permissions', authenticateJWT, checkPermission('rbac:read'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, resource, action, created_at
      FROM rbac_permissions
      ORDER BY resource, action
    `);
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching permissions:', err);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Create permission
router.post('/permissions', authenticateJWT, checkPermission('rbac:write'), async (req, res) => {
  const { name, description, resource, action } = req.body;
  try {
    const result = await db.query(
      `
      INSERT INTO rbac_permissions (name, description, resource, action)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [name, description, resource, action],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating permission:', err);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

// ================== GROUPS ==================

// Get all groups
router.get('/groups', authenticateJWT, checkPermission('rbac:read'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        g.id, g.name, g.description, g.group_type, g.parent_group_id, g.metadata,
        g.created_at, g.updated_at,
        COUNT(ugm.user_id) as member_count,
        pg.name as parent_group_name
      FROM rbac_groups g
      LEFT JOIN rbac_user_group_memberships ugm ON g.id = ugm.group_id
      LEFT JOIN rbac_groups pg ON g.parent_group_id = pg.id
      WHERE g.status = 'active'
      GROUP BY g.id, g.name, g.description, g.group_type, g.parent_group_id, 
               g.metadata, g.created_at, g.updated_at, pg.name
      ORDER BY g.name
    `);
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get single group with members
router.get('/groups/:id', authenticateJWT, checkPermission('rbac:read'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT g.*,
        COALESCE(
          json_agg(
            json_build_object(
              'user_id', u.id,
              'name', u.name,
              'email', u.email,
              'joined_at', ugm.joined_at
            )
          ) FILTER (WHERE u.id IS NOT NULL), 
          '[]'::json
        ) as members
      FROM rbac_groups g
      LEFT JOIN rbac_user_group_memberships ugm ON g.id = ugm.group_id
      LEFT JOIN users u ON ugm.user_id = u.id AND u.status = 'active'
      WHERE g.id = $1
      GROUP BY g.id
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error fetching group:', err);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create group
router.post('/groups', authenticateJWT, checkPermission('rbac:write'), async (req, res) => {
  const { name, description, group_type, parent_group_id, metadata } = req.body;
  try {
    const result = await db.query(
      `
      INSERT INTO rbac_groups (name, description, group_type, parent_group_id, metadata, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `,
      [name, description, group_type || 'custom', parent_group_id, JSON.stringify(metadata || {})],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating group:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
router.put('/groups/:id', authenticateJWT, checkPermission('rbac:write'), async (req, res) => {
  const { id } = req.params;
  const { name, description, group_type, parent_group_id, metadata } = req.body;
  try {
    const result = await db.query(
      `
      UPDATE rbac_groups 
      SET name = $1, description = $2, group_type = $3, parent_group_id = $4, 
          metadata = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `,
      [name, description, group_type, parent_group_id, JSON.stringify(metadata || {}), id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating group:', err);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// ================== USER ASSIGNMENTS ==================

// Assign role to user
router.post(
  '/users/:userId/roles',
  authenticateJWT,
  checkPermission('rbac:write'),
  async (req, res) => {
    const { userId } = req.params;
    const { role_id, assigned_by } = req.body;
    try {
      const result = await db.query(
        `
      INSERT INTO rbac_user_role_assignments (user_id, role_id, assigned_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role_id) DO NOTHING
      RETURNING *
    `,
        [userId, role_id, assigned_by || req.user?.id],
      );

      res.status(201).json(result.rows[0] || { message: 'Role already assigned' });
    } catch (err) {
      logger.error('Error assigning role to user:', err);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  },
);

// Remove role from user
router.delete(
  '/users/:userId/roles/:roleId',
  authenticateJWT,
  checkPermission('rbac:write'),
  async (req, res) => {
    const { userId, roleId } = req.params;
    try {
      const result = await db.query(
        `
      DELETE FROM rbac_user_role_assignments
      WHERE user_id = $1 AND role_id = $2
      RETURNING *
    `,
        [userId, roleId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Role assignment not found' });
      }

      res.json({ message: 'Role removed successfully' });
    } catch (err) {
      logger.error('Error removing role from user:', err);
      res.status(500).json({ error: 'Failed to remove role' });
    }
  },
);

// Add user to group
router.post(
  '/users/:userId/groups',
  authenticateJWT,
  checkPermission('rbac:write'),
  async (req, res) => {
    const { userId } = req.params;
    const { group_id } = req.body;
    try {
      const result = await db.query(
        `
      INSERT INTO rbac_user_group_memberships (user_id, group_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, group_id) DO NOTHING
      RETURNING *
    `,
        [userId, group_id],
      );

      res.status(201).json(result.rows[0] || { message: 'User already in group' });
    } catch (err) {
      logger.error('Error adding user to group:', err);
      res.status(500).json({ error: 'Failed to add user to group' });
    }
  },
);

// Remove user from group
router.delete(
  '/users/:userId/groups/:groupId',
  authenticateJWT,
  checkPermission('rbac:write'),
  async (req, res) => {
    const { userId, groupId } = req.params;
    try {
      const result = await db.query(
        `
      DELETE FROM rbac_user_group_memberships
      WHERE user_id = $1 AND group_id = $2
      RETURNING *
    `,
        [userId, groupId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Group membership not found' });
      }

      res.json({ message: 'User removed from group successfully' });
    } catch (err) {
      logger.error('Error removing user from group:', err);
      res.status(500).json({ error: 'Failed to remove user from group' });
    }
  },
);

// Get user permissions
router.get(
  '/users/:userId/permissions',
  authenticateJWT,
  checkPermission('rbac:read'),
  async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await db.query(
        `
      WITH user_permissions AS (
        -- Direct role permissions
        SELECT DISTINCT unnest(r.permissions) as permission
        FROM rbac_user_role_assignments ura
        JOIN rbac_roles r ON ura.role_id = r.id
        WHERE ura.user_id = $1 AND r.status = 'active'
        
        UNION
        
        -- Group-based role permissions (if needed)
        SELECT DISTINCT unnest(r.permissions) as permission
        FROM rbac_user_group_memberships ugm
        JOIN rbac_groups g ON ugm.group_id = g.id
        JOIN rbac_user_role_assignments ura ON g.id = ura.role_id -- Assuming groups can have roles
        JOIN rbac_roles r ON ura.role_id = r.id
        WHERE ugm.user_id = $1 AND g.status = 'active' AND r.status = 'active'
      )
      SELECT p.id, p.name, p.description, p.resource, p.action
      FROM user_permissions up
      JOIN rbac_permissions p ON up.permission = p.name
      ORDER BY p.resource, p.action
    `,
        [userId],
      );

      res.json(result.rows);
    } catch (err) {
      logger.error('Error fetching user permissions:', err);
      res.status(500).json({ error: 'Failed to fetch user permissions' });
    }
  },
);

export default router;
