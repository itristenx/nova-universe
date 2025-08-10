// nova-api/routes/helix.js
// Nova Helix - Identity Engine Routes
import bcrypt from 'bcryptjs';
import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { sign } from '../jwt.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { configureSAML, generateSAMLMetadata } from '../middleware/saml.js';
import scimRouter from './scim.js';
import rolesRouter from './roles.js';
import {
    disable2FA,
    generate2FASecret,
    get2FAStatus,
    regenerateBackupCodes,
    verify2FASetup
} from '../middleware/twoFactor.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HelixUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/HelixUser'
 *         expiresIn:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/helix/session:
 *   get:
 *     summary: Get current user session information
 *     description: Returns information about the currently authenticated user
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current session information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/HelixUser'
 *                 session:
 *                   type: object
 *                   properties:
 *                     loginAt:
 *                       type: string
 *                       format: date-time
 *                     ipAddress:
 *                       type: string
 *                     userAgent:
 *                       type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/session',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100),
  async (req, res) => {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles || [],
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        session: {
          loginAt: user.loginAt || new Date().toISOString(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    } catch (error) {
      logger.error('Error getting session info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session information',
        errorCode: 'SESSION_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/login:
 *   post:
 *     summary: Authenticate user and create session
 *     description: Authenticate user with email/password and return JWT token
 *     tags: [Helix - Identity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
  createRateLimit(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { email, password } = req.body;

      // Get user from database
      db.get('SELECT * FROM users WHERE email = $1 AND disabled = false', [email], async (err, user) => {
        if (err) {
          logger.error('Database error during login:', err);
          return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            errorCode: 'DB_ERROR'
          });
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials',
            errorCode: 'INVALID_CREDENTIALS'
          });
        }

        // Debug logging
        console.log('User object keys:', Object.keys(user));
        console.log('User password_hash:', user.password_hash);

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials',
            errorCode: 'INVALID_CREDENTIALS'
          });
        }

        // Get user roles
        db.all(
          `SELECT r.name FROM roles r 
           JOIN user_roles ur ON r.id = ur.roleId 
           WHERE ur.userId = $1`,
          [user.id],
          (roleErr, roles) => {
            if (roleErr) {
              logger.error('Error fetching user roles:', roleErr);
              return res.status(500).json({
                success: false,
                error: 'Authentication failed',
                errorCode: 'ROLES_ERROR'
              });
            }

            const userRoles = roles ? roles.map(r => r.name) : [];

            // Update last login
            db.run('UPDATE users SET "lastLoginAt" = $1 WHERE id = $2', [new Date().toISOString(), user.id]);

            // Generate JWT token
            const token = sign({
              id: user.id,
              name: user.name,
              email: user.email,
              roles: userRoles
            });

            res.json({
              success: true,
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: userRoles,
                lastLogin: new Date().toISOString(),
                createdAt: user.created_at
              },
              expiresIn: process.env.JWT_EXPIRES_IN || '1h'
            });
          }
        );
      });
    } catch (error) {
      logger.error('Error during login:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        errorCode: 'LOGIN_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/me/roles:
 *   get:
 *     summary: Get current user's roles and permissions
 *     description: Returns detailed role and permission information for the authenticated user
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User roles and permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/me/roles',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Get user roles with permissions
      db.all(
        `SELECT r.name, r.description, p.name as permission_name
         FROM roles r
         JOIN user_roles ur ON r.id = ur.roleId
         LEFT JOIN role_permissions rp ON r.id = rp.roleId
         LEFT JOIN permissions p ON rp.permissionId = p.id
         WHERE ur.userId = $1
         ORDER BY r.name, p.name`,
        [userId],
        (err, rows) => {
          if (err) {
            logger.error('Error fetching user roles and permissions:', err);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch roles',
              errorCode: 'ROLES_ERROR'
            });
          }

          // Group permissions by role
          const rolesMap = {};
          rows.forEach(row => {
            if (!rolesMap[row.name]) {
              rolesMap[row.name] = {
                name: row.name,
                description: row.description,
                permissions: []
              };
            }
            if (row.permission_name) {
              rolesMap[row.name].permissions.push(row.permission_name);
            }
          });

          const roles = Object.values(rolesMap);

          res.json({
            success: true,
            roles
          });
        }
      );
    } catch (error) {
      logger.error('Error getting user roles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user roles',
        errorCode: 'ROLES_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/audit/logs:
 *   get:
 *     summary: Get audit logs for user activities
 *     description: Returns audit logs for user activities (admin only)
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by specific user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of logs to return
 *     responses:
 *       200:
 *         description: Audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get('/audit/logs',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50),
  async (req, res) => {
    try {
      // Check if user has admin role
      const userRoles = req.user.roles || [];
      if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      const { userId, action, startDate, endDate, limit = 100 } = req.query;

      let query = 'SELECT * FROM logs WHERE 1=1';
      const params = [];

      if (userId) {
        query += ' AND user_id = $' + (params.length + 1);
        params.push(userId);
      }

      if (action) {
        query += ' AND title LIKE $' + (params.length + 1);
        params.push(`%${action}%`);
      }

      if (startDate) {
        query += ' AND timestamp >= $' + (params.length + 1);
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND timestamp <= $' + (params.length + 1);
        params.push(endDate);
      }

      query += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1);
      params.push(parseInt(limit));

      db.all(query, params, (err, logs) => {
        if (err) {
          logger.error('Error fetching audit logs:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch audit logs',
            errorCode: 'AUDIT_ERROR'
          });
        }

        res.json({
          success: true,
          logs: logs || []
        });
      });
    } catch (error) {
      logger.error('Error getting audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get audit logs',
        errorCode: 'AUDIT_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/sso/configuration:
 *   get:
 *     summary: Get SSO configuration
 *     description: Returns SSO configuration for the system (admin only)
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SSO configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sso:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get('/sso/configuration',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  async (req, res) => {
    try {
      // Check if user has admin role
      const userRoles = req.user.roles || [];
      if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      // Get SSO configuration
      db.all('SELECT * FROM sso_configurations', [], (err, configs) => {
        if (err) {
          logger.error('Error fetching SSO configuration:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch SSO configuration',
            errorCode: 'SSO_CONFIG_ERROR'
          });
        }
        res.json({
          success: true,
          sso: configs || []
        });
      });
    } catch (error) {
      logger.error('Error getting SSO configuration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get SSO configuration',
        errorCode: 'SSO_CONFIG_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/2fa/setup:
 *   post:
 *     summary: Start 2FA setup process
 *     description: Generate QR code and secret for 2FA setup
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 setup:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                       description: QR code as data URL
 *                     manualEntryKey:
 *                       type: string
 *                       description: Secret key for manual entry
 *                     tempId:
 *                       type: string
 *                       description: Temporary setup ID
 *       401:
 *         description: Not authenticated
 */
router.post('/2fa/setup',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 5), // 5 setup attempts per 15 minutes
  async (req, res) => {
    try {
      const user = req.user;

      // Check if 2FA is already enabled
      const status = await get2FAStatus(user.id);
      if (status.enabled) {
        return res.status(400).json({
          success: false,
          error: '2FA is already enabled for this account',
          errorCode: '2FA_ALREADY_ENABLED'
        });
      }

      const setupData = await generate2FASecret(user);

      res.json({
        success: true,
        setup: {
          qrCode: setupData.qrCode,
          manualEntryKey: setupData.manualEntryKey,
          tempId: setupData.tempId
        }
      });
    } catch (error) {
      logger.error('Error setting up 2FA:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to setup 2FA',
        errorCode: '2FA_SETUP_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/2fa/verify:
 *   post:
 *     summary: Verify 2FA setup
 *     description: Verify the 2FA setup with a token from authenticator app
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tempId
 *               - token
 *             properties:
 *               tempId:
 *                 type: string
 *                 description: Temporary setup ID from setup endpoint
 *               token:
 *                 type: string
 *                 description: 6-digit code from authenticator app
 *     responses:
 *       200:
 *         description: 2FA verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Backup codes for account recovery
 *       400:
 *         description: Invalid verification code
 */
router.post('/2fa/verify',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10), // 10 verification attempts per 15 minutes
  [
    body('tempId').isUUID().withMessage('Valid tempId is required'),
    body('token').isLength({ min: 6, max: 6 }).withMessage('6-digit token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { tempId, token } = req.body;
      const userId = req.user.id;

      const result = await verify2FASetup(userId, tempId, token);

      res.json({
        success: true,
        message: '2FA setup completed successfully',
        backupCodes: result.backupCodes
      });
    } catch (error) {
      logger.error('Error verifying 2FA setup:', error);
      
      if (error.message === 'Invalid verification code') {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code',
          errorCode: 'INVALID_2FA_CODE'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA setup',
        errorCode: '2FA_VERIFY_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/2fa/status:
 *   get:
 *     summary: Get 2FA status
 *     description: Get current 2FA status for the authenticated user
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     setupDate:
 *                       type: string
 *                       format: date-time
 *                     backupCodesRemaining:
 *                       type: integer
 */
router.get('/2fa/status',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100),
  async (req, res) => {
    try {
      const status = await get2FAStatus(req.user.id);

      res.json({
        success: true,
        status
      });
    } catch (error) {
      logger.error('Error getting 2FA status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get 2FA status',
        errorCode: '2FA_STATUS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     description: Disable 2FA for the authenticated user
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User's current password for verification
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid password
 */
router.post('/2fa/disable',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 5), // 5 disable attempts per 15 minutes
  [
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { password } = req.body;
      const userId = req.user.id;

      // Verify user's password
      db.get('SELECT password_hash FROM users WHERE id = $1', [userId], async (err, user) => {
        if (err || !user) {
          return res.status(500).json({
            success: false,
            error: 'Failed to verify password',
            errorCode: 'PASSWORD_VERIFY_ERROR'
          });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            error: 'Invalid password',
            errorCode: 'INVALID_PASSWORD'
          });
        }

        try {
          await disable2FA(userId);

          res.json({
            success: true,
            message: '2FA disabled successfully'
          });
        } catch (disableError) {
          logger.error('Error disabling 2FA:', disableError);
          res.status(500).json({
            success: false,
            error: 'Failed to disable 2FA',
            errorCode: '2FA_DISABLE_ERROR'
          });
        }
      });
    } catch (error) {
      logger.error('Error in 2FA disable:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disable 2FA',
        errorCode: '2FA_DISABLE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/2fa/backup-codes:
 *   post:
 *     summary: Regenerate backup codes
 *     description: Generate new backup codes for 2FA recovery
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User's current password for verification
 *     responses:
 *       200:
 *         description: New backup codes generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post('/2fa/backup-codes',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 3), // 3 regenerations per 15 minutes
  [
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { password } = req.body;
      const userId = req.user.id;

      // Verify user's password
      db.get('SELECT password_hash FROM users WHERE id = $1', [userId], async (err, user) => {
        if (err || !user) {
          return res.status(500).json({
            success: false,
            error: 'Failed to verify password',
            errorCode: 'PASSWORD_VERIFY_ERROR'
          });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            error: 'Invalid password',
            errorCode: 'INVALID_PASSWORD'
          });
        }

        try {
          const backupCodes = await regenerateBackupCodes(userId);

          res.json({
            success: true,
            backupCodes,
            message: 'New backup codes generated successfully'
          });
        } catch (regenError) {
          logger.error('Error regenerating backup codes:', regenError);
          res.status(500).json({
            success: false,
            error: 'Failed to regenerate backup codes',
            errorCode: 'BACKUP_CODES_ERROR'
          });
        }
      });
    } catch (error) {
      logger.error('Error in backup codes regeneration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate backup codes',
        errorCode: 'BACKUP_CODES_ERROR'
      });
    }
  }
);

// SAML SSO Routes
/**
 * @swagger
 * /api/v1/helix/sso/saml/login:
 *   get:
 *     summary: Initiate SAML SSO login
 *     description: Redirects user to identity provider for SAML authentication
 *     tags: [Helix - SSO]
 *     responses:
 *       302:
 *         description: Redirect to identity provider
 *       500:
 *         description: SAML configuration error
 */
router.get('/sso/saml/login', (req, res, next) => {
  try {
    const passport = configureSAML();
    passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true })(req, res, next);
  } catch (error) {
    logger.error('SAML login initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'SAML configuration error',
      errorCode: 'SAML_CONFIG_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/helix/sso/saml/callback:
 *   post:
 *     summary: Handle SAML SSO callback
 *     description: Processes SAML assertion from identity provider
 *     tags: [Helix - SSO]
 *     responses:
 *       200:
 *         description: SAML authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/HelixUser'
 *       401:
 *         description: SAML authentication failed
 *       500:
 *         description: SAML processing error
 */
router.post('/sso/saml/callback', (req, res, next) => {
  try {
    const passport = configureSAML();
    passport.authenticate('saml', { session: false }, async (err, user, info) => {
      if (err) {
        logger.error('SAML authentication error:', err);
        return res.status(500).json({
          success: false,
          error: 'SAML authentication error',
          errorCode: 'SAML_AUTH_ERROR'
        });
      }

      if (!user) {
        logger.warn('SAML authentication failed:', info);
        return res.status(401).json({
          success: false,
          error: 'SAML authentication failed',
          errorCode: 'SAML_AUTH_FAILED'
        });
      }

      try {
        // Generate JWT token for authenticated user
        const token = sign({ userId: user.id, email: user.email, roles: user.roles });
        
        logger.info(`SAML SSO successful for user: ${user.email}`);
        
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            department: user.department,
            loginMethod: 'saml'
          }
        });
      } catch (tokenError) {
        logger.error('Token generation error:', tokenError);
        res.status(500).json({
          success: false,
          error: 'Token generation failed',
          errorCode: 'TOKEN_ERROR'
        });
      }
    })(req, res, next);
  } catch (error) {
    logger.error('SAML callback processing error:', error);
    res.status(500).json({
      success: false,
      error: 'SAML callback processing error',
      errorCode: 'SAML_CALLBACK_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/v1/helix/sso/saml/metadata:
 *   get:
 *     summary: Get SAML service provider metadata
 *     description: Returns SAML metadata XML for configuring identity provider
 *     tags: [Helix - SSO]
 *     responses:
 *       200:
 *         description: SAML metadata XML
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *       500:
 *         description: Metadata generation error
 */
router.get('/sso/saml/metadata', async (req, res) => {
  try {
    const metadata = await generateSAMLMetadata();
    res.set('Content-Type', 'application/xml');
    res.send(metadata);
  } catch (error) {
    logger.error('SAML metadata generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate SAML metadata',
      errorCode: 'METADATA_ERROR'
    });
  }
});

// Expose SCIM and role management within Helix namespace
router.use('/scim/v2', scimRouter);
router.use('/roles', rolesRouter);

// Update VIP status for a user
router.put('/users/:id/vip',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  [
    body('isVip').isBoolean().withMessage('isVip must be boolean'),
    body('vipLevel').optional().isIn(['gold', 'exec', 'priority']).withMessage('Invalid VIP level')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array(), errorCode: 'VALIDATION_ERROR' });
      }

      const adminRoles = req.user?.roles || [];
      if (!adminRoles.includes('admin') && !adminRoles.includes('superadmin')) {
        return res.status(403).json({ success: false, error: 'Admin access required', errorCode: 'ADMIN_ACCESS_REQUIRED' });
      }

      const { id } = req.params;
      const { isVip, vipLevel } = req.body;
      const now = new Date().toISOString();

      await db.none(
        'UPDATE users SET is_vip = $1, vip_level = $2, updated_at = $3 WHERE id = $4',
        [isVip ? 1 : 0, vipLevel || null, now, id]
      );

      await db.createAuditLog('VIP_ASSIGN', req.user.id, { targetUserId: id, isVip, vipLevel });

      res.json({ success: true });
    } catch (error) {
      logger.error('Error assigning VIP status:', error);
      res.status(500).json({ success: false, error: 'Failed to assign VIP', errorCode: 'VIP_ASSIGN_ERROR' });
    }
  }
);

// Ensure table for linked accounts exists (idempotent)
async function ensureLinkedAccountsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_linked_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        external_user_id TEXT NOT NULL,
        external_team_id TEXT,
        username TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, provider)
      );
    `);
    await db.query(
      `CREATE INDEX IF NOT EXISTS idx_linked_accounts_provider_external ON user_linked_accounts (provider, external_user_id)`
    );
    return true;
  } catch (e) {
    logger.error('Failed ensuring user_linked_accounts table', e);
    throw e;
  }
}

/**
 * @swagger
 * /api/v1/helix/link/slack:
 *   get:
 *     summary: Get Slack linking status for current user
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Slack link status
 */
router.get('/link/slack', authenticateJWT, async (req, res) => {
  try {
    await ensureLinkedAccountsTable();
    const userId = req.user.id;
    const result = await db.query(
      'SELECT id, external_user_id, external_team_id, username, created_at, updated_at FROM user_linked_accounts WHERE user_id = $1 AND provider = $2 LIMIT 1',
      [userId, 'slack']
    );
    const row = result?.rows?.[0];
    res.json({
      success: true,
      linked: !!row,
      account: row || null
    });
  } catch (error) {
    logger.error('Error getting Slack link status:', error);
    res.status(500).json({ success: false, error: 'Failed to get Slack link status', errorCode: 'SLACK_LINK_STATUS_ERROR' });
  }
});

/**
 * @swagger
 * /api/v1/helix/link/slack:
 *   post:
 *     summary: Link Slack account to current user
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slackUserId]
 *             properties:
 *               slackUserId:
 *                 type: string
 *               slackTeamId:
 *                 type: string
 *               slackUsername:
 *                 type: string
 *     responses:
 *       200:
 *         description: Slack account linked
 */
router.post('/link/slack',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  [
    body('slackUserId').isString().withMessage('slackUserId is required'),
    body('slackTeamId').optional().isString(),
    body('slackUsername').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array(), errorCode: 'VALIDATION_ERROR' });
      }
      await ensureLinkedAccountsTable();
      const userId = req.user.id;
      const { slackUserId, slackTeamId = null, slackUsername = null } = req.body;

      // Upsert by (user_id, provider)
      await db.query(
        `INSERT INTO user_linked_accounts (id, user_id, provider, external_user_id, external_team_id, username)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         ON CONFLICT (user_id, provider)
         DO UPDATE SET external_user_id = EXCLUDED.external_user_id,
                       external_team_id = EXCLUDED.external_team_id,
                       username = EXCLUDED.username,
                       updated_at = CURRENT_TIMESTAMP`,
        [userId, 'slack', slackUserId, slackTeamId, slackUsername]
      );

      res.json({ success: true, message: 'Slack account linked' });
    } catch (error) {
      logger.error('Error linking Slack account:', error);
      res.status(500).json({ success: false, error: 'Failed to link Slack account', errorCode: 'SLACK_LINK_ERROR' });
    }
  }
);

/**
 * @swagger
 * /api/v1/helix/link/slack:
 *   delete:
 *     summary: Unlink Slack account from current user
 *     tags: [Helix - Identity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Slack account unlinked
 */
router.delete('/link/slack', authenticateJWT, async (req, res) => {
  try {
    await ensureLinkedAccountsTable();
    const userId = req.user.id;
    await db.query('DELETE FROM user_linked_accounts WHERE user_id = $1 AND provider = $2', [userId, 'slack']);
    res.json({ success: true, message: 'Slack account unlinked' });
  } catch (error) {
    logger.error('Error unlinking Slack account:', error);
    res.status(500).json({ success: false, error: 'Failed to unlink Slack account', errorCode: 'SLACK_UNLINK_ERROR' });
  }
});

export default router;
