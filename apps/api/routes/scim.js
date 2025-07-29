// nova-api/routes/scim.js
// Nova Helix SCIM 2.0 User Provisioning Routes
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * SCIM Bearer Token Authentication Middleware
 */
function authenticateSCIM(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Authorization header missing or invalid',
      status: '401'
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (token !== process.env.SCIM_BEARER_TOKEN) {
    return res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Invalid SCIM token',
      status: '401'
    });
  }

  next();
}

/**
 * @swagger
 * /api/v1/scim/Users:
 *   get:
 *     summary: Get users (SCIM 2.0)
 *     description: Retrieve users using SCIM 2.0 protocol
 *     tags: [Helix - SCIM Provisioning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: SCIM filter expression
 *       - in: query
 *         name: startIndex
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 1-based index of the first result
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: SCIM users response
 *         content:
 *           application/scim+json:
 *             schema:
 *               type: object
 *               properties:
 *                 schemas:
 *                   type: array
 *                   items:
 *                     type: string
 *                 totalResults:
 *                   type: integer
 *                 startIndex:
 *                   type: integer
 *                 itemsPerPage:
 *                   type: integer
 *                 Resources:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/Users', authenticateSCIM, async (req, res) => {
  try {
    const { filter, startIndex = 1, count = 50 } = req.query;
    
    let query = `
      SELECT u.*, u.is_vip, u.vip_level,
             string_agg(r.name, ',') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.disabled = 0
    `;
    const params = [];
    let paramIndex = 1;

    // Handle SCIM filters
    if (filter) {
      const filterMatch = filter.match(/(\w+)\s+(eq|ne|co|sw|ew)\s+"([^"]+)"/);
      if (filterMatch) {
        const [, field, operator, value] = filterMatch;
        const dbField = mapSCIMFieldToDBField(field);
        
        switch (operator) {
          case 'eq':
            query += ` AND ${dbField} = $${paramIndex}`;
            params.push(value);
            paramIndex++;
            break;
          case 'co':
            query += ` AND ${dbField} LIKE $${paramIndex}`;
            params.push(`%${value}%`);
            paramIndex++;
            break;
          case 'sw':
            query += ` AND ${dbField} LIKE $${paramIndex}`;
            params.push(`${value}%`);
            paramIndex++;
            break;
          case 'ew':
            query += ` AND ${dbField} LIKE $${paramIndex}`;
            params.push(`%${value}`);
            paramIndex++;
            break;
        }
      }
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    // Get total count
    const countQuery = query.replace(/SELECT.*GROUP BY u\.id/, 'SELECT COUNT(DISTINCT u.id) as total');
    
    // Use async/await with PostgreSQL client
    const countResult = await db.oneOrNone(countQuery, params);
    const totalResults = countResult?.total || 0;
    
    // Add pagination
    const offset = Math.max(0, parseInt(startIndex) - 1);
    const limit = Math.min(parseInt(count), 200); // Max 200 results
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const rows = await db.any(query, params);
    const resources = (rows || []).map(row => formatUserForSCIM(row));

    res.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:ListResponse'],
      totalResults,
      startIndex: parseInt(startIndex),
      itemsPerPage: resources.length,
      Resources: resources
    });
  } catch (error) {
    logger.error('Error in SCIM Users GET:', error);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500'
    });
  }
});

/**
 * @swagger
 * /api/v1/scim/Users/{id}:
 *   get:
 *     summary: Get user by ID (SCIM 2.0)
 *     description: Retrieve a specific user using SCIM 2.0 protocol
 *     tags: [Helix - SCIM Provisioning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: SCIM user
 *       404:
 *         description: User not found
 */
router.get('/Users/:id', authenticateSCIM, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT u.*, u.is_vip, u.vip_level,
             string_agg(r.name, ',') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1 AND u.disabled = 0
      GROUP BY u.id
    `;

    const row = await db.oneOrNone(query, [id]);

    if (!row) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found',
        status: '404'
      });
    }

    res.json(formatUserForSCIM(row));
  } catch (error) {
    logger.error('Error in SCIM User GET:', error);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500'
    });
  }
});

/**
 * @swagger
 * /api/v1/scim/Users:
 *   post:
 *     summary: Create user (SCIM 2.0)
 *     description: Create a new user using SCIM 2.0 protocol
 *     tags: [Helix - SCIM Provisioning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/scim+json:
 *           schema:
 *             type: object
 *             properties:
 *               schemas:
 *                 type: array
 *                 items:
 *                   type: string
 *               userName:
 *                 type: string
 *               name:
 *                 type: object
 *                 properties:
 *                   givenName:
 *                     type: string
 *                   familyName:
 *                     type: string
 *               emails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                     primary:
 *                       type: boolean
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid request
 *       409:
 *         description: User already exists
 */
router.post('/Users', 
  authenticateSCIM,
  [
    body('userName').isEmail().withMessage('userName must be a valid email'),
    body('name.givenName').optional().isString(),
    body('name.familyName').optional().isString(),
    body('emails').isArray().withMessage('emails must be an array'),
    body('active').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Invalid request data',
          status: '400',
          scimType: 'invalidValue'
        });
      }

      const { userName, name, emails, active = true } = req.body;
      const vipExt = req.body['urn:nova:vip:1.0:User'] || {};
      const isVip = !!vipExt.isVip;
      const vipLevel = vipExt.vipLevel || null;
      const primaryEmail = emails?.find(e => e.primary)?.value || userName;
      const displayName = name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() : userName;
      const now = new Date().toISOString();
      const userId = (await import('uuid')).v4();

      try {
        // Check if user already exists
        const existingUser = await db.oneOrNone('SELECT id FROM users WHERE email = $1 AND disabled = 0', [primaryEmail]);
        if (existingUser) {
          return res.status(409).json({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'User already exists',
            status: '409',
            scimType: 'uniqueness'
          });
        }

        // Create new user
        const insertQuery = `
          INSERT INTO users (
            id, email, name, auth_method, active,
            is_vip, vip_level,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await db.none(insertQuery, [
          userId,
          primaryEmail,
          displayName,
          'scim',
          active ? 1 : 0,
          isVip ? 1 : 0,
          vipLevel,
          now,
          now
        ]);

        // Get created user for response
        const newUser = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
        logger.info('SCIM user created successfully', { userId, email: primaryEmail });
        res.status(201).json(formatUserForSCIM(newUser));
      } catch (error) {
        logger.error('Error in SCIM User POST:', error, error?.stack);
        res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Internal server error',
          error: error?.message,
          stack: error?.stack,
          status: '500'
        });
      }
    } catch (error) {
      logger.error('Error in SCIM User POST:', error);
      res.status(500).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Internal server error',
        status: '500'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/scim/Users/{id}:
 *   put:
 *     summary: Update user (SCIM 2.0)
 *     description: Update a user using SCIM 2.0 protocol
 *     tags: [Helix - SCIM Provisioning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put('/Users/:id', authenticateSCIM, async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, name, emails, active } = req.body;
    const vipExt = req.body['urn:nova:vip:1.0:User'] || {};
    const isVip = vipExt.isVip;
    const vipLevel = vipExt.vipLevel;
    const now = new Date().toISOString();

    // Check if user exists
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE id = $1 AND disabled = 0', [id]);
    if (!existingUser) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found',
        status: '404'
      });
    }

    // Prepare update data
    const updates = [];
    const params = [];
    let paramIndex = 1;
    if (userName) {
      updates.push(`email = $${paramIndex++}`);
      params.push(userName);
    }
    if (name) {
      const displayName = `${name.givenName || ''} ${name.familyName || ''}`.trim();
      updates.push(`name = $${paramIndex++}`);
      params.push(displayName);
    }
    if (typeof active === 'boolean') {
      updates.push(`active = $${paramIndex++}`);
      params.push(active ? 1 : 0);
    }
    if (typeof isVip === 'boolean') {
      updates.push(`is_vip = $${paramIndex++}`);
      params.push(isVip ? 1 : 0);
    }
    if (vipLevel !== undefined) {
      updates.push(`vip_level = $${paramIndex++}`);
      params.push(vipLevel);
    }
    updates.push(`updated_at = $${paramIndex++}`);
    params.push(now);
    params.push(id);
    if (updates.length === 0) {
      return res.status(400).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'No fields to update',
        status: '400'
      });
    }
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    await db.none(updateQuery, params);
    // Get updated user for response
    const updatedUser = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [id]);
    logger.info('SCIM user updated successfully', { userId: id });
    res.json(formatUserForSCIM(updatedUser));
  } catch (error) {
    logger.error('Error in SCIM User PUT:', error, error?.stack);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      error: error?.message,
      stack: error?.stack,
      status: '500'
    });
  }
});

/**
 * @swagger
 * /api/v1/scim/Users/{id}:
 *   delete:
 *     summary: Delete user (SCIM 2.0)
 *     description: Delete a user using SCIM 2.0 protocol
 *     tags: [Helix - SCIM Provisioning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/Users/:id', authenticateSCIM, async (req, res) => {
  try {
    const { id } = req.params;
    // Check if user exists
    const existingUser = await db.oneOrNone('SELECT id FROM users WHERE id = $1 AND disabled = 0', [id]);
    if (!existingUser) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found',
        status: '404'
      });
    }
    // Soft delete user
    await db.none('UPDATE users SET disabled = 1, updated_at = $1 WHERE id = $2', [new Date().toISOString(), id]);
    logger.info('SCIM user deleted successfully', { userId: id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error in SCIM User DELETE:', error);
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500'
    });
  }
});

/**
 * SCIM Group list
 */
router.get('/Groups', authenticateSCIM, async (req, res) => {
  try {
    const groups = await db.any('SELECT id, name FROM roles ORDER BY id');
    const resources = [];
    for (const g of groups) {
      const members = await db.any(
        `SELECT u.id, u.name FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         WHERE ur.role_id = $1`,
        [g.id]
      );
      resources.push(formatGroupForSCIM({ ...g, members }));
    }
    res.json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      Resources: resources,
      totalResults: resources.length,
      startIndex: 1,
      itemsPerPage: resources.length
    });
  } catch (err) {
    logger.error('Error fetching SCIM groups:', err);
    res.status(500).json({ detail: 'Internal error' });
  }
});

router.post('/Groups', authenticateSCIM, async (req, res) => {
  try {
    const name = req.body.displayName;
    const { id } = await db.one(
      'INSERT INTO roles (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id',
      [name]
    );
    const role = await db.one('SELECT id, name FROM roles WHERE id=$1', [id]);
    res.status(201).json(formatGroupForSCIM({ ...role, members: [] }));
  } catch (err) {
    logger.error('Error creating SCIM group:', err);
    res.status(500).json({ detail: 'Internal error' });
  }
});

router.get('/Groups/:id', authenticateSCIM, async (req, res) => {
  try {
    const { id } = req.params;
    const role = await db.oneOrNone('SELECT id, name FROM roles WHERE id=$1', [id]);
    if (!role) return res.status(404).json({ detail: 'Group not found' });
    const members = await db.any(
      `SELECT u.id, u.name FROM users u JOIN user_roles ur ON u.id=ur.user_id WHERE ur.role_id=$1`,
      [id]
    );
    res.json(formatGroupForSCIM({ ...role, members }));
  } catch (err) {
    logger.error('Error fetching SCIM group:', err);
    res.status(500).json({ detail: 'Internal error' });
  }
});

router.put('/Groups/:id', authenticateSCIM, async (req, res) => {
  try {
    const { id } = req.params;
    const name = req.body.displayName;
    await db.none('UPDATE roles SET name=$1, updated_at=NOW() WHERE id=$2', [name, id]);
    const role = await db.one('SELECT id, name FROM roles WHERE id=$1', [id]);
    const members = await db.any(
      `SELECT u.id, u.name FROM users u JOIN user_roles ur ON u.id=ur.user_id WHERE ur.role_id=$1`,
      [id]
    );
    res.json(formatGroupForSCIM({ ...role, members }));
  } catch (err) {
    logger.error('Error updating SCIM group:', err);
    res.status(500).json({ detail: 'Internal error' });
  }
});

router.delete('/Groups/:id', authenticateSCIM, async (req, res) => {
  try {
    const { id } = req.params;
    await db.none('DELETE FROM user_roles WHERE role_id=$1', [id]);
    await db.none('DELETE FROM role_permissions WHERE role_id=$1', [id]);
    await db.none('DELETE FROM roles WHERE id=$1', [id]);
    res.status(204).send();
  } catch (err) {
    logger.error('Error deleting SCIM group:', err);
    res.status(500).json({ detail: 'Internal error' });
  }
});

/**
 * Format user data for SCIM response
 */
function formatUserForSCIM(user) {
  const nameParts = (user.name || '').split(' ');
  const givenName = nameParts[0] || '';
  const familyName = nameParts.slice(1).join(' ') || '';

  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User', 'urn:nova:vip:1.0:User'],
    id: user.id,
    userName: user.email,
    name: {
      givenName,
      familyName,
      formatted: user.name
    },
    emails: [{
      value: user.email,
      primary: true
    }],
    active: user.active === 1,
    'urn:nova:vip:1.0:User': {
      isVip: !!user.is_vip,
      vipLevel: user.vip_level || null
    },
    meta: {
      resourceType: 'User',
      created: user.created_at,
      lastModified: user.updated_at,
      location: `/api/v1/scim/Users/${user.id}`
    }
  };
}

/**
 * Format role/permission data for SCIM Group response
 */
function formatGroupForSCIM(group) {
  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    id: String(group.id),
    displayName: group.name,
    members: (group.members || []).map(m => ({
      value: m.id,
      display: m.name
    })),
    meta: {
      resourceType: 'Group'
    }
  };
}

/**
 * Map SCIM fields to database fields
 */
function mapSCIMFieldToDBField(scimField) {
  const fieldMap = {
    'userName': 'u.email',
    'name.givenName': 'u.name',
    'name.familyName': 'u.name',
    'emails.value': 'u.email',
    'active': 'u.active'
  };

  return fieldMap[scimField] || 'u.email';
}

export default router;
