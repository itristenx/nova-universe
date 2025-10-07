import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getConfig, searchDirectory, createUser } from '../directory.js';
import { logger } from '../logger.js';
import { authenticateJWT, requirePermission } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { prisma, getWithCache } from '../db.js';
import { AuditService } from '../services/audit-simple.service.js';

const router = express.Router();

// Get directory config
/**
 * @swagger
 * /api/v1/directory/config:
 *   get:
 *     summary: Get directory config
 *     responses:
 *       200:
 *         description: Directory config
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/config', async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json(cfg);
  } catch {
    res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
  }
});

// Update directory config (stub, implement as needed)
// router.put('/config', ...)

/**
 * @swagger
 * /api/v1/directory/search:
 *   get:
 *     summary: Search the directory
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query string
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Directory search failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    const results = await searchDirectory(q);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Directory search failed', errorCode: 'DIRECTORY_SEARCH_ERROR' });
  }
});

/**
 * @swagger
 * /api/v1/directory/user:
 *   post:
 *     summary: Create a user in the local directory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Name and email are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *       500:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.post('/user', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res
      .status(400)
      .json({ error: 'Name and email are required', errorCode: 'NAME_EMAIL_REQUIRED' });
  }
  try {
    const id = await createUser(name, email);
    res.json({ id, name, email });
  } catch {
    res.status(500).json({ error: 'Failed to create user', errorCode: 'CREATE_USER_ERROR' });
  }
});

// ========================================
// Enhanced Directory Management Endpoints
// ========================================

/**
 * @route GET /api/v1/directory/users
 * @description Get all users with filtering and pagination
 * @access Protected - Requires admin role
 */
router.get(
  '/users',
  authenticateJWT,
  requirePermission('admin'),
  createRateLimit(60 * 1000, 120),
  [
    query('page').optional().isInt({ min: 1 }),
    query('perPage').optional().isInt({ min: 1, max: 100 }),
    query('department').optional().isString(),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    query('role').optional().isString(),
    query('search').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 25;
      const skip = (page - 1) * perPage;

      const where = {};
      if (req.query.department) where.department = req.query.department;
      if (req.query.status) where.status = req.query.status;
      if (req.query.role) where.role = req.query.role;
      if (req.query.search) {
        where.OR = [
          { name: { contains: req.query.search, mode: 'insensitive' } },
          { email: { contains: req.query.search, mode: 'insensitive' } },
        ];
      }

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: perPage,
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true,
            status: true,
            avatarUrl: true,
            lastLogin: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page,
          perPage,
          totalCount,
          totalPages: Math.ceil(totalCount / perPage),
        },
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }
);

/**
 * @route GET /api/v1/directory/groups
 * @description Get all user groups
 * @access Protected - Requires admin role
 */
router.get(
  '/groups',
  authenticateJWT,
  requirePermission('admin'),
  createRateLimit(60 * 1000, 120),
  async (req, res) => {
    try {
      const cacheKey = 'nova:directory:groups:v1';

      const groups = await getWithCache(
        cacheKey,
        async () => {
          const allGroups = await prisma.group.findMany({
            orderBy: { name: 'asc' },
            include: {
              _count: {
                select: { members: true },
              },
            },
          });

          return allGroups.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            memberCount: group._count.members,
            createdAt: group.createdAt,
          }));
        },
        300 // 5 minutes TTL
      );

      res.json({
        success: true,
        data: groups,
        meta: {
          count: groups.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching groups:', error);

      // Graceful degradation if groups table doesn't exist
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('User groups feature not yet implemented in database');
        return res.json({
          success: true,
          data: [],
          meta: { count: 0, message: 'User groups coming soon', timestamp: new Date().toISOString() },
        });
      }

      res.status(500).json({ success: false, error: 'Failed to fetch groups' });
    }
  }
);

/**
 * @route POST /api/v1/directory/users/bulk-activate
 * @description Bulk activate users
 * @access Protected - Requires admin role
 */
router.post(
  '/users/bulk-activate',
  authenticateJWT,
  requirePermission('admin'),
  createRateLimit(60 * 1000, 30),
  [body('userIds').isArray().withMessage('userIds must be an array')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      }

      const { userIds } = req.body;

      const result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status: 'ACTIVE' },
      });

      // Audit log
      await AuditService.log({
        action: 'BULK_ACTIVATE_USERS',
        userId: req.user.id,
        metadata: { userIds, count: result.count },
      });

      res.json({
        success: true,
        data: { updatedCount: result.count },
      });
    } catch (error) {
      logger.error('Error bulk activating users:', error);
      res.status(500).json({ success: false, error: 'Failed to bulk activate users' });
    }
  }
);

/**
 * @route POST /api/v1/directory/users/bulk-suspend
 * @description Bulk suspend users
 * @access Protected - Requires admin role
 */
router.post(
  '/users/bulk-suspend',
  authenticateJWT,
  requirePermission('admin'),
  createRateLimit(60 * 1000, 30),
  [body('userIds').isArray().withMessage('userIds must be an array')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      }

      const { userIds } = req.body;

      const result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status: 'SUSPENDED' },
      });

      // Audit log
      await AuditService.log({
        action: 'BULK_SUSPEND_USERS',
        userId: req.user.id,
        metadata: { userIds, count: result.count },
      });

      res.json({
        success: true,
        data: { updatedCount: result.count },
      });
    } catch (error) {
      logger.error('Error bulk suspending users:', error);
      res.status(500).json({ success: false, error: 'Failed to bulk suspend users' });
    }
  }
);

/**
 * @route DELETE /api/v1/directory/users/bulk-delete
 * @description Bulk delete users (soft delete)
 * @access Protected - Requires admin role
 */
router.delete(
  '/users/bulk-delete',
  authenticateJWT,
  requirePermission('admin'),
  createRateLimit(60 * 1000, 20),
  [body('userIds').isArray().withMessage('userIds must be an array')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      }

      const { userIds } = req.body;

      // Soft delete by marking as inactive
      const result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { active: false, status: 'INACTIVE' },
      });

      // Audit log
      await AuditService.log({
        action: 'BULK_DELETE_USERS',
        userId: req.user.id,
        metadata: { userIds, count: result.count },
      });

      res.json({
        success: true,
        data: { deletedCount: result.count },
      });
    } catch (error) {
      logger.error('Error bulk deleting users:', error);
      res.status(500).json({ success: false, error: 'Failed to bulk delete users' });
    }
  }
);

/**
 * @route GET /api/v1/directory/audit
 * @description Get directory activity audit log
 * @access Protected - Requires admin role
 */
router.get(
  '/audit',
  authenticateJWT,
  requirePermission('admin'),
  createRateLimit(60 * 1000, 60),
  [
    query('page').optional().isInt({ min: 1 }),
    query('perPage').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 25;
      const skip = (page - 1) * perPage;

      const where = {
        action: {
          in: [
            'CREATE_USER',
            'UPDATE_USER',
            'DELETE_USER',
            'BULK_ACTIVATE_USERS',
            'BULK_SUSPEND_USERS',
            'BULK_DELETE_USERS',
            'CREATE_GROUP',
            'UPDATE_GROUP',
            'DELETE_GROUP',
          ],
        },
      };

      if (req.query.action) {
        where.action = req.query.action;
      }

      const [auditLogs, totalCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: perPage,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.json({
        success: true,
        data: auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          user: log.user,
          metadata: log.metadata,
          timestamp: log.createdAt,
        })),
        pagination: {
          page,
          perPage,
          totalCount,
          totalPages: Math.ceil(totalCount / perPage),
        },
      });
    } catch (error) {
      logger.error('Error fetching audit logs:', error);

      // Graceful degradation
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Audit log feature not yet implemented in database');
        return res.json({
          success: true,
          data: [],
          pagination: { page: 1, perPage: 25, totalCount: 0, totalPages: 0 },
          meta: { message: 'Audit logs coming soon' },
        });
      }

      res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
  }
);

export default router;

