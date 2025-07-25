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
      SELECT u.*, 
             GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.disabled = 0
    `;
    const params = [];

    // Handle SCIM filters
    if (filter) {
      const filterMatch = filter.match(/(\w+)\s+(eq|ne|co|sw|ew)\s+"([^"]+)"/);
      if (filterMatch) {
        const [, field, operator, value] = filterMatch;
        const dbField = mapSCIMFieldToDBField(field);
        
        switch (operator) {
          case 'eq':
            query += ` AND ${dbField} = ?`;
            params.push(value);
            break;
          case 'co':
            query += ` AND ${dbField} LIKE ?`;
            params.push(`%${value}%`);
            break;
          case 'sw':
            query += ` AND ${dbField} LIKE ?`;
            params.push(`${value}%`);
            break;
          case 'ew':
            query += ` AND ${dbField} LIKE ?`;
            params.push(`%${value}`);
            break;
        }
      }
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    // Get total count
    const countQuery = query.replace(/SELECT.*GROUP BY u\.id/, 'SELECT COUNT(DISTINCT u.id) as total');
    
    db.get(countQuery, params, (countErr, countResult) => {
      if (countErr) {
        logger.error('Error counting SCIM users:', countErr);
        return res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Internal server error',
          status: '500'
        });
      }

      const totalResults = countResult?.total || 0;
      
      // Add pagination
      const offset = Math.max(0, parseInt(startIndex) - 1);
      const limit = Math.min(parseInt(count), 200); // Max 200 results
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) {
          logger.error('Error fetching SCIM users:', err);
          return res.status(500).json({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'Internal server error',
            status: '500'
          });
        }

        const resources = (rows || []).map(row => formatUserForSCIM(row));

        res.json({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:ListResponse'],
          totalResults,
          startIndex: parseInt(startIndex),
          itemsPerPage: resources.length,
          Resources: resources
        });
      });
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
      SELECT u.*, 
             GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = ? AND u.disabled = 0
      GROUP BY u.id
    `;

    db.get(query, [id], (err, row) => {
      if (err) {
        logger.error('Error fetching SCIM user:', err);
        return res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Internal server error',
          status: '500'
        });
      }

      if (!row) {
        return res.status(404).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'User not found',
          status: '404'
        });
      }

      res.json(formatUserForSCIM(row));
    });
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
      
      // Use primary email or userName
      const primaryEmail = emails?.find(e => e.primary)?.value || userName;
      const displayName = name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() : userName;

      // Check if user already exists
      db.get('SELECT id FROM users WHERE email = ? AND disabled = 0', [primaryEmail], (checkErr, existingUser) => {
        if (checkErr) {
          logger.error('Error checking existing user:', checkErr);
          return res.status(500).json({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'Internal server error',
            status: '500'
          });
        }

        if (existingUser) {
          return res.status(409).json({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'User already exists',
            status: '409',
            scimType: 'uniqueness'
          });
        }

        // Create new user
        const userId = require('uuid').v4();
        const now = new Date().toISOString();

        const insertQuery = `
          INSERT INTO users (
            id, email, name, auth_method, active, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [
          userId,
          primaryEmail,
          displayName,
          'scim',
          active ? 1 : 0,
          now,
          now
        ], function(insertErr) {
          if (insertErr) {
            logger.error('Error creating SCIM user:', insertErr);
            return res.status(500).json({
              schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
              detail: 'Internal server error',
              status: '500'
            });
          }

          // Get created user for response
          db.get('SELECT * FROM users WHERE id = ?', [userId], (getUserErr, newUser) => {
            if (getUserErr) {
              logger.error('Error fetching created SCIM user:', getUserErr);
              return res.status(500).json({
                schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                detail: 'Internal server error',
                status: '500'
              });
            }

            logger.info('SCIM user created successfully', { userId, email: primaryEmail });

            res.status(201).json(formatUserForSCIM(newUser));
          });
        });
      });
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

    // Check if user exists
    db.get('SELECT * FROM users WHERE id = ? AND disabled = 0', [id], (checkErr, existingUser) => {
      if (checkErr) {
        logger.error('Error checking user for update:', checkErr);
        return res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Internal server error',
          status: '500'
        });
      }

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

      if (userName) {
        updates.push('email = ?');
        params.push(userName);
      }

      if (name) {
        const displayName = `${name.givenName || ''} ${name.familyName || ''}`.trim();
        updates.push('name = ?');
        params.push(displayName);
      }

      if (typeof active === 'boolean') {
        updates.push('active = ?');
        params.push(active ? 1 : 0);
      }

      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

      db.run(updateQuery, params, function(updateErr) {
        if (updateErr) {
          logger.error('Error updating SCIM user:', updateErr);
          return res.status(500).json({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'Internal server error',
            status: '500'
          });
        }

        // Get updated user for response
        db.get('SELECT * FROM users WHERE id = ?', [id], (getUserErr, updatedUser) => {
          if (getUserErr) {
            logger.error('Error fetching updated SCIM user:', getUserErr);
            return res.status(500).json({
              schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
              detail: 'Internal server error',
              status: '500'
            });
          }

          logger.info('SCIM user updated successfully', { userId: id });

          res.json(formatUserForSCIM(updatedUser));
        });
      });
    });
  } catch (error) {
    logger.error('Error in SCIM User PUT:', error);
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
    db.get('SELECT id FROM users WHERE id = ? AND disabled = 0', [id], (checkErr, existingUser) => {
      if (checkErr) {
        logger.error('Error checking user for deletion:', checkErr);
        return res.status(500).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Internal server error',
          status: '500'
        });
      }

      if (!existingUser) {
        return res.status(404).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'User not found',
          status: '404'
        });
      }

      // Soft delete user
      db.run(
        'UPDATE users SET disabled = 1, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), id],
        function(deleteErr) {
          if (deleteErr) {
            logger.error('Error deleting SCIM user:', deleteErr);
            return res.status(500).json({
              schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
              detail: 'Internal server error',
              status: '500'
            });
          }

          logger.info('SCIM user deleted successfully', { userId: id });

          res.status(204).send();
        }
      );
    });
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
 * Format user data for SCIM response
 */
function formatUserForSCIM(user) {
  const nameParts = (user.name || '').split(' ');
  const givenName = nameParts[0] || '';
  const familyName = nameParts.slice(1).join(' ') || '';

  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
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
    meta: {
      resourceType: 'User',
      created: user.created_at,
      lastModified: user.updated_at,
      location: `/api/v1/scim/Users/${user.id}`
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
