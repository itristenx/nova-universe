// nova-api/routes/orbit.js
// Nova Orbit - End-User Portal Routes
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { calculateVipWeight } from '../utils/utils.js';
import { generateTypedTicketId, getSlaTargets, computeDueDate } from '../utils/dbUtils.js';
import { triggerWorkflow } from './workflows.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         ticketId:
 *           type: string
 *           description: Ticket ID in format INC000001 / REQ000001
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         status:
 *           type: string
 *           enum: [open, in_progress, resolved, closed, on_hold]
 *         category:
 *           type: string
 *         subcategory:
 *           type: string
 *         assignedTo:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         location:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         estimatedResolution:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/orbit/tickets:
 *   get:
 *     summary: Get user's tickets
 *     description: Returns tickets submitted by the authenticated user
 *     tags: [Orbit - End-User Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed, on_hold]
 *         description: Filter by ticket status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tickets to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of tickets to skip
 *     responses:
 *       200:
 *         description: List of user's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserTicket'
 *                 total:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/tickets',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;

      let query = `
        SELECT t.*, 
               a.name as assignee_name,
               COUNT(*) OVER() as total_count
        FROM tickets t
        LEFT JOIN users a ON t.assigned_to_id = a.id
        WHERE t.requested_by_id = $1 AND t.deleted_at IS NULL
      `;
      const params = [userId];
      let paramIndex = 2;

      if (status) {
        query += ` AND t.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await db.query(query, params);
      const rows = result?.rows || [];

      const tickets = rows.map((row) => ({
        id: row.id,
        ticketId: row.ticket_id,
        title: row.title,
        description: row.description,
        priority: row.priority,
        status: row.status,
        category: row.category,
        subcategory: row.subcategory,
        location: row.location,
        assignedTo: row.assigned_to_id ? { id: row.assigned_to_id, name: row.assignee_name } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        estimatedResolution: row.due_date,
      }));

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const hasMore = parseInt(offset) + parseInt(limit) < total;

      res.json({ success: true, tickets, total, hasMore });
    } catch (_error) {
      logger.error('Error in user tickets endpoint:', error);
      res
        .status(500)
        .json({ success: false, error: 'Failed to fetch tickets', errorCode: 'TICKETS_ERROR' });
    }
  },
);

/**
 * @swagger
 * /api/v1/orbit/tickets:
 *   post:
 *     summary: Submit a new ticket
 *     description: Submit a new support ticket
 *     tags: [Orbit - End-User Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - priority
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               location:
 *                 type: string
 *               contactMethod:
 *                 type: string
 *                 enum: [email, phone, in_person]
 *               contactInfo:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of attachment file paths
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ticket:
 *                   $ref: '#/components/schemas/UserTicket'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/tickets',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10), // 10 ticket submissions per 15 minutes
  [
    body('title')
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('description').isLength({ min: 1 }).withMessage('Description is required'),
    body('category').isLength({ min: 1 }).withMessage('Category is required'),
    body('priority')
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority level'),
    body('location').optional().isString(),
    body('contactMethod')
      .optional()
      .isIn(['email', 'phone', 'in_person'])
      .withMessage('Invalid contact method'),
    body('contactInfo').optional().isString(),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
    body('type')
      .optional()
      .isString()
      .isIn(['INC', 'REQ', 'PRB', 'CHG', 'TASK', 'HR', 'OPS', 'ISAC', 'FB'])
      .withMessage('Invalid type code'),
    body('urgency').optional().isString(),
    body('impact').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR',
        });
      }

      const {
        title,
        description,
        category,
        subcategory,
        priority,
        location,
        contactMethod = 'email',
        contactInfo,
        attachments = [],
        type: requestedType,
        urgency,
        impact,
      } = req.body;
      const userId = req.user.id;

      const vipRow = await db.get('SELECT is_vip, vip_level FROM users WHERE id = $1', [userId]);

      // Optional AI classification to refine category/priority
      let refinedCategory = category;
      let refinedPriority = priority;
      try {
        const mod = await import('../services/cosmo-ticket-processor.js');
        const Processor = mod?.CosmoTicketProcessor || mod?.default;
        if (Processor) {
          const tp = new Processor({
            enableAI: true,
            enableTrendAnalysis: false,
            enableDuplicateDetection: false,
            autoClassifyPriority: true,
            autoMatchCustomers: false,
          });
          const enriched = await tp.enrichTicketData({ title, description, userRole: 'end_user' });
          if (!refinedCategory && enriched?.aiClassification?.category)
            refinedCategory = enriched.aiClassification.category;
          if (!refinedPriority && enriched?.aiClassification?.priority)
            refinedPriority = enriched.aiClassification.priority;
        }
      } catch {}

      // Determine type (fallback to REQ for request-like categories, else INC)
      const categoryForType = (refinedCategory || category || '').toLowerCase();
      const isRequestLike = ['access', 'request', 'catalog'].some((k) =>
        categoryForType.includes(k),
      );
      const typeCode = (requestedType || (isRequestLike ? 'REQ' : 'INC')).toUpperCase();

      // Generate type-based ticket ID
      const ticketId = await generateTypedTicketId(typeCode);

      const now = new Date();
      const sla = await getSlaTargets(typeCode, urgency, impact);
      let dueDate = computeDueDate(now, refinedPriority || priority, sla);

      if (vipRow?.is_vip) {
        switch (vipRow.vip_level) {
          case 'exec':
            dueDate.setHours(now.getHours() + 2);
            break;
          case 'gold':
            dueDate.setHours(now.getHours() + 4);
            break;
          default:
            dueDate.setHours(now.getHours() + 8);
        }
      }

      const vipWeight = calculateVipWeight(vipRow?.is_vip, vipRow?.vip_level);

      // Insert new ticket
      const insertQuery = `
        INSERT INTO tickets (
          id, ticket_id, type_code, title, description, priority, urgency, impact, status, category, subcategory,
          location, contact_method, contact_info, requested_by_id, due_date,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `;

      const newTicketId = uuidv4();
      const now_iso = now.toISOString();

      await db.query(insertQuery, [
        newTicketId,
        ticketId,
        typeCode,
        title,
        description,
        refinedPriority || priority,
        urgency || null,
        impact || null,
        'open',
        refinedCategory || category,
        subcategory || null,
        location || null,
        contactMethod,
        contactInfo || req.user.email,
        userId,
        dueDate.toISOString(),
        now_iso,
        now_iso,
      ]);

      // Best-effort search indexing
      try {
        const elastic = (await import('../database/elastic.js')).default;
        await elastic.indexDocument(elastic.indices?.tickets || 'nova-tickets', newTicketId, {
          id: newTicketId,
          title,
          description,
          status: 'open',
          priority: refinedPriority || priority,
          category: refinedCategory || category,
          created_at: now_iso,
          updated_at: now_iso,
        });
      } catch {}

      // Handle attachments if any
      if (attachments.length > 0) {
        const attachmentPromises = attachments.map((attachment, index) => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO ticket_attachments (id, ticket_id, file_path, file_name, uploaded_by_id, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6)',
              [uuidv4(), ticketId, attachment, `attachment_${index + 1}`, userId, now_iso],
              (attachErr) => {
                if (attachErr) {
                  logger.error('Error saving attachment:', attachErr);
                  reject(attachErr);
                } else {
                  resolve();
                }
              },
            );
          });
        });
        await Promise.allSettled(attachmentPromises);
      }

      // Log ticket creation
      db.run(
        'INSERT INTO ticket_logs (id, ticket_id, user_id, action, timestamp) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), ticketId, userId, `Ticket created (${typeCode})`, now_iso],
      );

      const ticket = {
        id: newTicketId,
        ticketId: ticketId,
        type: typeCode,
        title,
        description,
        priority,
        status: 'open',
        category,
        subcategory,
        location,
        assignedTo: null,
        createdAt: now_iso,
        updatedAt: now_iso,
        estimatedResolution: dueDate.toISOString(),
        vipWeight,
      };

      res.status(201).json({ success: true, ticket });
    } catch (_error) {
      logger.error('Error creating ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create ticket',
        errorCode: 'TICKET_CREATE_ERROR',
      });
    }
  },
);

/**
 * @swagger
 * /api/v1/orbit/tickets/{ticketId}:
 *   get:
 *     summary: Get ticket details
 *     description: Get detailed information about a specific ticket
 *     tags: [Orbit - End-User Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ticket:
 *                   $ref: '#/components/schemas/UserTicket'
 *                 updates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       action:
 *                         type: string
 *                       details:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/tickets/:ticketId',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 200), // 200 requests per 15 minutes
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const userId = req.user.id;

      // Get ticket details
      db.get(
        `
        SELECT t.*, a.name as assignee_name, a.email as assignee_email
        FROM tickets t
        LEFT JOIN users a ON t.assigned_to_id = a.id
        WHERE t.ticket_id = $1 AND t.requested_by_id = $2 AND t.deleted_at IS NULL
      `,
        [ticketId, userId],
        (err, ticket) => {
          if (err) {
            logger.error('Error fetching ticket:', err);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch ticket',
              errorCode: 'TICKET_FETCH_ERROR',
            });
          }

          if (!ticket) {
            return res.status(404).json({
              success: false,
              error: 'Ticket not found',
              errorCode: 'TICKET_NOT_FOUND',
            });
          }

          // Get ticket updates/logs
          db.all(
            `
          SELECT tl.action, tl.details, tl.timestamp, u.name as user_name
          FROM ticket_logs tl
          LEFT JOIN users u ON tl.user_id = u.id
          WHERE tl.ticket_id = $1
          ORDER BY tl.timestamp ASC
        `,
            [ticketId],
            (updatesErr, updates) => {
              if (updatesErr) {
                logger.error('Error fetching ticket updates:', updatesErr);
                return res.status(500).json({
                  success: false,
                  error: 'Failed to fetch ticket updates',
                  errorCode: 'UPDATES_FETCH_ERROR',
                });
              }

              const ticketData = {
                id: ticket.id,
                ticketId: ticket.ticket_id,
                title: ticket.title,
                description: ticket.description,
                priority: ticket.priority,
                status: ticket.status,
                category: ticket.category,
                subcategory: ticket.subcategory,
                location: ticket.location,
                assignedTo: ticket.assigned_to_id
                  ? {
                      id: ticket.assigned_to_id,
                      name: ticket.assignee_name,
                      email: ticket.assignee_email,
                    }
                  : null,
                resolution: ticket.resolution,
                createdAt: ticket.created_at,
                updatedAt: ticket.updated_at,
                estimatedResolution: ticket.due_date,
                resolvedAt: ticket.resolved_at,
              };

              const ticketUpdates = (updates || []).map((update) => ({
                action: update.action,
                details: update.details,
                timestamp: update.timestamp,
                user: update.user_name,
              }));

              res.json({
                success: true,
                ticket: ticketData,
                updates: ticketUpdates,
              });
            },
          );
        },
      );
    } catch (_error) {
      logger.error('Error in ticket detail endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ticket',
        errorCode: 'TICKET_ERROR',
      });
    }
  },
);

/**
 * @swagger
 * /api/v1/orbit/categories:
 *   get:
 *     summary: Get available categories
 *     description: Returns list of available ticket categories and subcategories
 *     tags: [Orbit - End-User Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       subcategories:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/categories',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      // Get categories from tickets table or return predefined list
      const categories = [
        {
          name: 'Hardware',
          subcategories: [
            'Desktop Computer',
            'Laptop',
            'Printer',
            'Monitor',
            'Network Equipment',
            'Mobile Device',
            'Other Hardware',
          ],
        },
        {
          name: 'Software',
          subcategories: [
            'Operating System',
            'Application Software',
            'Email',
            'Web Browser',
            'Security Software',
            'Other Software',
          ],
        },
        {
          name: 'Network',
          subcategories: [
            'Internet Connectivity',
            'WiFi Issues',
            'VPN',
            'File Sharing',
            'Network Performance',
            'Other Network',
          ],
        },
        {
          name: 'Account & Access',
          subcategories: [
            'Password Reset',
            'Account Creation',
            'Permission Issues',
            'Two-Factor Authentication',
            'Other Access',
          ],
        },
        {
          name: 'Training & Support',
          subcategories: [
            'Software Training',
            'How-To Questions',
            'Best Practices',
            'Documentation Request',
            'Other Training',
          ],
        },
        {
          name: 'Security',
          subcategories: [
            'Suspicious Activity',
            'Malware/Virus',
            'Data Breach',
            'Security Policy',
            'Other Security',
          ],
        },
        {
          name: 'General',
          subcategories: ['General Inquiry', 'Feedback', 'Feature Request', 'Other'],
        },
      ];

      res.json({
        success: true,
        categories,
      });
    } catch (_error) {
      logger.error('Error in categories endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        errorCode: 'CATEGORIES_ERROR',
      });
    }
  },
);

/**
 * List request catalog items
 */
router.get('/catalog', authenticateJWT, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, form_schema, workflow_id FROM request_catalog_items',
    );
    res.json({ success: true, items: result.rows });
  } catch (_error) {
    logger.error('Error fetching catalog items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch catalog items' });
  }
});

/**
 * Submit a catalog request item
 */
router.post('/catalog/:id', authenticateJWT, async (req, res) => {
  const catalogId = parseInt(req.params.id, 10);
  const { reqId } = req.body || {};
  if (!reqId) {
    return res.status(400).json({ success: false, error: 'reqId is required in the request body' });
  }
  try {
    const itemRes = await db.query('SELECT workflow_id FROM request_catalog_items WHERE id = $1', [
      catalogId,
    ]);
    if (itemRes.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Catalog item not found' });
    }
    const insert = await db.query(
      'INSERT INTO ritms (req_id, catalog_item_id, status) VALUES ($1,$2,$3) RETURNING id',
      [reqId || null, catalogId, 'open'],
    );
    const ritmId = insert.rows[0].id;
    const workflowId = itemRes.rows[0].workflow_id;
    // Ensure workflowId is a string before passing it to triggerWorkflow
    if (workflowId) {
      triggerWorkflow(String(workflowId));
    }
    res.status(201).json({ success: true, ritmId });
  } catch (_error) {
    logger.error('Error submitting catalog item:', error);
    res.status(500).json({ success: false, error: 'Failed to submit request item' });
  }
});

/**
 * @swagger
 * /api/v1/orbit/feedback:
 *   post:
 *     summary: Submit feedback
 *     description: Submit general feedback or suggestions
 *     tags: [Orbit - End-User Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *               - type
 *             properties:
 *               subject:
 *                 type: string
 *                 maxLength: 255
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [feedback, suggestion, complaint, compliment]
 *               anonymous:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/feedback',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 feedback submissions per 15 minutes
  [
    body('subject')
      .isLength({ min: 1, max: 255 })
      .withMessage('Subject must be between 1 and 255 characters'),
    body('message').isLength({ min: 1 }).withMessage('Message is required'),
    body('type')
      .isIn(['feedback', 'suggestion', 'complaint', 'compliment'])
      .withMessage('Invalid feedback type'),
    body('anonymous').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR',
        });
      }

      const { subject, message, type, anonymous = false } = req.body;
      const userId = anonymous ? null : req.user.id;

      db.run(
        'INSERT INTO feedback (name, message, user_id, feedback_type, timestamp) VALUES ($1, $2, $3, $4, $5)',
        [subject, message, userId, type, new Date().toISOString()],
        function (err) {
          if (err) {
            logger.error('Error submitting feedback:', err);
            return res.status(500).json({
              success: false,
              error: 'Failed to submit feedback',
              errorCode: 'FEEDBACK_ERROR',
            });
          }

          res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
          });
        },
      );
    } catch (_error) {
      logger.error('Error in feedback endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
        errorCode: 'FEEDBACK_ERROR',
      });
    }
  },
);

router.get('/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // For now return a simple dynamic form definition; in production, fetch from DB
    const form = {
      id,
      title: 'Incident Report',
      fields: [
        { id: 'title', type: 'text', label: 'Title', required: true, maxLength: 200 },
        { id: 'description', type: 'textarea', label: 'Description', required: true },
        {
          id: 'category',
          type: 'select',
          label: 'Category',
          options: ['Hardware', 'Software', 'Network', 'Access'],
        },
        {
          id: 'priority',
          type: 'radio',
          label: 'Priority',
          options: ['low', 'medium', 'high', 'critical'],
          default: 'medium',
        },
        { id: 'location', type: 'text', label: 'Location' },
      ],
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, form });
  } catch (_error) {
    res.status(500).json({ success: false, error: 'Failed to fetch form' });
  }
});

export default router;
