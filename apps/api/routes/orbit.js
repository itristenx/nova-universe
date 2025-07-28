// nova-api/routes/orbit.js
// Nova Orbit - End-User Portal Routes
import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';

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
 *           description: Ticket ID in format TKT-00001
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
router.get('/tickets',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        status,
        limit = 20,
        offset = 0
      } = req.query;

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

      const rows = await db.any(query, params);

      const tickets = (rows || []).map(row => ({
        id: row.id,
        ticketId: row.ticket_id,
        title: row.title,
        description: row.description,
        priority: row.priority,
        status: row.status,
        category: row.category,
        subcategory: row.subcategory,
        location: row.location,
        assignedTo: row.assigned_to_id ? {
          id: row.assigned_to_id,
          name: row.assignee_name
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        estimatedResolution: row.due_date
      }));

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const hasMore = parseInt(offset) + parseInt(limit) < total;

      res.json({
        success: true,
        tickets,
        total,
        hasMore
      });
    } catch (error) {
      logger.error('Error in user tickets endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tickets',
        errorCode: 'TICKETS_ERROR'
      });
    }
  }
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
router.post('/tickets',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10), // 10 ticket submissions per 15 minutes
  [
    body('title').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('description').isLength({ min: 1 }).withMessage('Description is required'),
    body('category').isLength({ min: 1 }).withMessage('Category is required'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
    body('location').optional().isString(),
    body('contactMethod').optional().isIn(['email', 'phone', 'in_person']).withMessage('Invalid contact method'),
    body('contactInfo').optional().isString(),
    body('attachments').optional().isArray().withMessage('Attachments must be an array')
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

      const {
        title,
        description,
        category,
        subcategory,
        priority,
        location,
        contactMethod = 'email',
        contactInfo,
        attachments = []
      } = req.body;

      const userId = req.user.id;

      // Generate ticket ID
      db.get('SELECT MAX(CAST(SUBSTR(ticket_id, 5) AS INTEGER)) as max_id FROM tickets', [], (err, row) => {
        if (err) {
          logger.error('Error generating ticket ID:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to create ticket',
            errorCode: 'TICKET_ID_ERROR'
          });
        }

        const nextId = (row?.max_id || 0) + 1;
        const ticketId = `TKT-${nextId.toString().padStart(5, '0')}`;

        // Calculate due date based on priority
        const now = new Date();
        let dueDate = new Date(now);
        switch (priority) {
          case 'critical':
            dueDate.setHours(now.getHours() + 4); // 4 hours
            break;
          case 'high':
            dueDate.setDate(now.getDate() + 1); // 1 day
            break;
          case 'medium':
            dueDate.setDate(now.getDate() + 3); // 3 days
            break;
          case 'low':
            dueDate.setDate(now.getDate() + 7); // 7 days
            break;
        }

        // Insert new ticket
        const insertQuery = `
          INSERT INTO tickets (
            id, ticket_id, title, description, priority, status, category, subcategory,
            location, contact_method, contact_info, requested_by_id, due_date,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `;

        const newTicketId = require('uuid').v4();
        const now_iso = now.toISOString();

        db.none(insertQuery, [
          newTicketId,
          ticketId,
          title,
          description,
          priority,
          'open',
          category,
          subcategory || null,
          location || null,
          contactMethod,
          contactInfo || req.user.email,
          userId,
          dueDate.toISOString(),
          now_iso,
          now_iso
        ])
          .then(() => {
            // Handle attachments if any
            if (attachments.length > 0) {
              const attachmentPromises = attachments.map((attachment, index) => {
                return new Promise((resolve, reject) => {
                  db.run(
                    'INSERT INTO ticket_attachments (id, ticket_id, file_path, file_name, uploaded_by_id, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                      require('uuid').v4(),
                      ticketId,
                      attachment,
                      `attachment_${index + 1}`,
                      userId,
                      now_iso
                    ],
                    (attachErr) => {
                      if (attachErr) {
                        logger.error('Error saving attachment:', attachErr);
                        reject(attachErr);
                      } else {
                        resolve();
                      }
                    }
                  );
                });
              });

              Promise.all(attachmentPromises).catch(attachErr => {
                logger.error('Error processing attachments:', attachErr);
              });
            }

            // Log ticket creation
            db.run(
              'INSERT INTO ticket_logs (id, ticket_id, user_id, action, timestamp) VALUES ($1, $2, $3, $4, $5)',
              [require('uuid').v4(), ticketId, userId, 'Ticket created', now_iso],
              (logErr) => {
                if (logErr) {
                  logger.error('Error logging ticket creation:', logErr);
                }
              }
            );

            const ticket = {
              id: newTicketId,
              ticketId: ticketId,
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
              estimatedResolution: dueDate.toISOString()
            };

            res.status(201).json({
              success: true,
              ticket
            });
          })
          .catch(error => {
            logger.error('Error creating ticket:', error);
            res.status(500).json({
              success: false,
              error: 'Failed to create ticket',
              errorCode: 'TICKET_CREATE_ERROR'
            });
          });
      });
    } catch (error) {
      logger.error('Error creating ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create ticket',
        errorCode: 'TICKET_CREATE_ERROR'
      });
    }
  }
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
router.get('/tickets/:ticketId',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 200), // 200 requests per 15 minutes
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const userId = req.user.id;

      // Get ticket details
      db.get(`
        SELECT t.*, a.name as assignee_name, a.email as assignee_email
        FROM tickets t
        LEFT JOIN users a ON t.assigned_to_id = a.id
        WHERE t.ticket_id = $1 AND t.requested_by_id = $2 AND t.deleted_at IS NULL
      `, [ticketId, userId], (err, ticket) => {
        if (err) {
          logger.error('Error fetching ticket:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch ticket',
            errorCode: 'TICKET_FETCH_ERROR'
          });
        }

        if (!ticket) {
          return res.status(404).json({
            success: false,
            error: 'Ticket not found',
            errorCode: 'TICKET_NOT_FOUND'
          });
        }

        // Get ticket updates/logs
        db.all(`
          SELECT tl.action, tl.details, tl.timestamp, u.name as user_name
          FROM ticket_logs tl
          LEFT JOIN users u ON tl.user_id = u.id
          WHERE tl.ticket_id = $1
          ORDER BY tl.timestamp ASC
        `, [ticketId], (updatesErr, updates) => {
          if (updatesErr) {
            logger.error('Error fetching ticket updates:', updatesErr);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch ticket updates',
              errorCode: 'UPDATES_FETCH_ERROR'
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
            assignedTo: ticket.assigned_to_id ? {
              id: ticket.assigned_to_id,
              name: ticket.assignee_name,
              email: ticket.assignee_email
            } : null,
            resolution: ticket.resolution,
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
            estimatedResolution: ticket.due_date,
            resolvedAt: ticket.resolved_at
          };

          const ticketUpdates = (updates || []).map(update => ({
            action: update.action,
            details: update.details,
            timestamp: update.timestamp,
            user: update.user_name
          }));

          res.json({
            success: true,
            ticket: ticketData,
            updates: ticketUpdates
          });
        });
      });
    } catch (error) {
      logger.error('Error in ticket detail endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ticket',
        errorCode: 'TICKET_ERROR'
      });
    }
  }
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
router.get('/categories',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      // Get categories from tickets table or return predefined list
      const categories = [
        {
          name: 'Hardware',
          subcategories: ['Desktop Computer', 'Laptop', 'Printer', 'Monitor', 'Network Equipment', 'Mobile Device', 'Other Hardware']
        },
        {
          name: 'Software',
          subcategories: ['Operating System', 'Application Software', 'Email', 'Web Browser', 'Security Software', 'Other Software']
        },
        {
          name: 'Network',
          subcategories: ['Internet Connectivity', 'WiFi Issues', 'VPN', 'File Sharing', 'Network Performance', 'Other Network']
        },
        {
          name: 'Account & Access',
          subcategories: ['Password Reset', 'Account Creation', 'Permission Issues', 'Two-Factor Authentication', 'Other Access']
        },
        {
          name: 'Training & Support',
          subcategories: ['Software Training', 'How-To Questions', 'Best Practices', 'Documentation Request', 'Other Training']
        },
        {
          name: 'Security',
          subcategories: ['Suspicious Activity', 'Malware/Virus', 'Data Breach', 'Security Policy', 'Other Security']
        },
        {
          name: 'General',
          subcategories: ['General Inquiry', 'Feedback', 'Feature Request', 'Other']
        }
      ];

      res.json({
        success: true,
        categories
      });
    } catch (error) {
      logger.error('Error in categories endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        errorCode: 'CATEGORIES_ERROR'
      });
    }
  }
);

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
router.post('/feedback',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 feedback submissions per 15 minutes
  [
    body('subject').isLength({ min: 1, max: 255 }).withMessage('Subject must be between 1 and 255 characters'),
    body('message').isLength({ min: 1 }).withMessage('Message is required'),
    body('type').isIn(['feedback', 'suggestion', 'complaint', 'compliment']).withMessage('Invalid feedback type'),
    body('anonymous').optional().isBoolean()
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

      const { subject, message, type, anonymous = false } = req.body;
      const userId = anonymous ? null : req.user.id;

      db.run(
        'INSERT INTO feedback (name, message, user_id, feedback_type, timestamp) VALUES ($1, $2, $3, $4, $5)',
        [subject, message, userId, type, new Date().toISOString()],
        function(err) {
          if (err) {
            logger.error('Error submitting feedback:', err);
            return res.status(500).json({
              success: false,
              error: 'Failed to submit feedback',
              errorCode: 'FEEDBACK_ERROR'
            });
          }

          res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully'
          });
        }
      );
    } catch (error) {
      logger.error('Error in feedback endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
        errorCode: 'FEEDBACK_ERROR'
      });
    }
  }
);

export default router;
