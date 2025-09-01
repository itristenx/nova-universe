import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateJWT, requirePermission } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { TicketService } from '../services/enhanced-ticket.service.js';
import { NotificationService } from '../services/notification-simple.service.js';
import { AuditService } from '../services/audit-simple.service.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Configure multer for ticket file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads/tickets';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Security: restrict file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

/**
 * Enhanced Tickets API - Using ITSM Industry Standards
 * This replaces the basic ticket implementation with full ITSM features
 */

/**
 * @route GET /api/v1/tickets
 * @description Get tickets with advanced filtering, sorting, and pagination
 * @access Protected
 */
router.get(
  '/',
  authenticateJWT,
  createRateLimit(60 * 1000, 240),
  [
    // Pagination
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('perPage')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('PerPage must be between 1 and 100'),

    // Filtering
    query('status')
      .optional()
      .isIn([
        'NEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'PENDING',
        'ON_HOLD',
        'RESOLVED',
        'CLOSED',
        'CANCELLED',
        'REOPENED',
      ]),
    query('priority').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    query('type')
      .optional()
      .isIn(['INCIDENT', 'REQUEST', 'PROBLEM', 'CHANGE', 'TASK', 'HR', 'OPS', 'ISAC', 'FEEDBACK']),
    query('assignee').optional().isString(),
    query('requester').optional().isString(),
    query('category').optional().isString(),
    query('search').optional().isString(),
    query('slaBreached').optional().isBoolean(),
    query('overdue').optional().isBoolean(),

    // Sorting
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'priority', 'state', 'ticketNumber']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.perPage) || 25,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        search: req.query.search,
        status: req.query.status,
        priority: req.query.priority,
        type: req.query.type,
        assignee: req.query.assignee,
        requester: req.query.requester,
        category: req.query.category,
        slaBreached: req.query.slaBreached === 'true',
        overdue: req.query.overdue === 'true',
      };

      const result = await TicketService.getTickets(filters, req.user);

      res.json({
        success: true,
        data: result.tickets,
        meta: {
          page: result.pagination.currentPage,
          perPage: result.pagination.itemsPerPage,
          total: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
          hasNext: result.pagination.hasNextPage,
          hasPrev: result.pagination.hasPreviousPage,
        },
      });
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tickets',
        errorCode: 'TICKETS_FETCH_ERROR',
      });
    }
  },
);

/**
 * @route GET /api/v1/tickets/:id
 * @description Get detailed ticket information
 * @access Protected
 */
router.get(
  '/:id',
  authenticateJWT,
  createRateLimit(60 * 1000, 300),
  [
    param('id').isString().withMessage('Ticket ID must be a string'),
    query('include').optional().isString(), // comments,attachments,history,time_entries,watchers,links
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const ticketId = req.params.id;
      const include = req.query.include ? req.query.include.split(',') : [];

      const ticket = await TicketService.getTicketById(ticketId, include, req.user);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          errorCode: 'TICKET_NOT_FOUND',
        });
      }

      // Log access for audit
      try {
        await AuditService.logTicketAccess(ticketId, req.user.id, req.ip);
      } catch (auditError) {
        logger.warn('Failed to log ticket access:', auditError);
      }

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Error fetching ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ticket',
        errorCode: 'TICKET_FETCH_ERROR',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets
 * @description Create a new ticket
 * @access Protected
 */
router.post(
  '/',
  authenticateJWT,
  requirePermission('tickets:create'), // Add permission check for ticket creation
  upload.array('attachments', 10),
  createRateLimit(60 * 1000, 30),
  [
    body('title')
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title is required and must be under 255 characters'),
    body('description')
      .isString()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Description is required'),
    body('shortDescription').optional().isString().isLength({ max: 160 }),
    body('type')
      .optional()
      .isIn(['INCIDENT', 'REQUEST', 'PROBLEM', 'CHANGE', 'TASK', 'HR', 'OPS', 'ISAC', 'FEEDBACK']),
    body('priority').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    body('urgency').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    body('impact').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    body('category').optional().isString(),
    body('subcategory').optional().isString(),
    body('assigneeId').optional().isString(),
    body('assignedGroupId').optional().isString(),
    body('tags').optional().isArray(),
    body('customFields').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const ticketData = {
        title: req.body.title,
        description: req.body.description,
        shortDescription: req.body.shortDescription,
        type: req.body.type || 'REQUEST',
        priority: req.body.priority || 'MEDIUM',
        urgency: req.body.urgency || 'MEDIUM',
        impact: req.body.impact || 'MEDIUM',
        category: req.body.category,
        subcategory: req.body.subcategory,
        userId: req.user.id, // requester
        assignedToUserId: req.body.assigneeId,
        assignedToGroupId: req.body.assignedGroupId,
        tags: req.body.tags || [],
        customFields: req.body.customFields,
        source: 'PORTAL',
      };

      const ticket = await TicketService.createTicket(ticketData, req.files || [], req.user);

      // Send notifications for new ticket creation
      try {
        // Notify the assignee if ticket is assigned
        if (ticket.assignedToUserId) {
          await NotificationService.sendNotification({
            userId: ticket.assignedToUserId,
            type: 'TICKET_ASSIGNED',
            title: 'New Ticket Assigned',
            message: `You have been assigned ticket #${ticket.number}: ${ticket.title}`,
            data: { ticketId: ticket.id, ticketNumber: ticket.number }
          });
        }

        // Notify requester of successful creation
        await NotificationService.sendNotification({
          userId: req.user.id,
          type: 'TICKET_CREATED',
          title: 'Ticket Created Successfully',
          message: `Your ticket #${ticket.number} has been created and is being processed.`,
          data: { ticketId: ticket.id, ticketNumber: ticket.number }
        });

        // If high priority, notify managers
        if (ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL') {
          await NotificationService.notifyManagers({
            type: 'HIGH_PRIORITY_TICKET',
            title: `${ticket.priority} Priority Ticket Created`,
            message: `Ticket #${ticket.number} requires immediate attention: ${ticket.title}`,
            data: { ticketId: ticket.id, ticketNumber: ticket.number, priority: ticket.priority }
          });
        }
      } catch (notificationError) {
        // Log notification failures but don't fail the ticket creation
        logger.warn('Failed to send ticket creation notifications:', notificationError);
      }

      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Ticket created successfully',
      });
    } catch (error) {
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
 * @route PUT /api/v1/tickets/:id
 * @description Update a ticket
 * @access Protected
 */
router.put(
  '/:id',
  authenticateJWT,
  createRateLimit(60 * 1000, 120),
  [
    param('id').isString().withMessage('Ticket ID must be a string'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().trim().isLength({ min: 1 }),
    body('state')
      .optional()
      .isIn(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED', 'REOPENED']),
    body('priority').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    body('assigneeId').optional().isString(),
    body('assignedGroupId').optional().isString(),
    body('resolution').optional().isString(),
    body('closeNotes').optional().isString(),
    body('tags').optional().isArray(),
    body('customFields').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const ticketId = req.params.id;
      const updateData = req.body;

      const ticket = await TicketService.updateTicket(ticketId, updateData, req.user);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          errorCode: 'TICKET_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        data: ticket,
        message: 'Ticket updated successfully',
      });
    } catch (error) {
      logger.error('Error updating ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update ticket',
        errorCode: 'TICKET_UPDATE_ERROR',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/comments
 * @description Add a comment to a ticket
 * @access Protected
 */
router.post(
  '/:id/comments',
  authenticateJWT,
  createRateLimit(60 * 1000, 60),
  [
    param('id').isString().withMessage('Ticket ID must be a string'),
    body('content').isString().trim().isLength({ min: 1 }).withMessage('Comment content is required'),
    body('isInternal').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const ticketId = req.params.id;
      const { content, isInternal = false } = req.body;

      const comment = await TicketService.addComment(ticketId, {
        content,
        isInternal,
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully',
      });
    } catch (error) {
      logger.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add comment',
        errorCode: 'COMMENT_CREATE_ERROR',
      });
    }
  },
);

/**
 * @route GET /api/v1/tickets/stats
 * @description Get ticket statistics for dashboard
 * @access Protected
 */
router.get(
  '/stats',
  authenticateJWT,
  createRateLimit(60 * 1000, 60),
  async (req, res) => {
    try {
      const stats = await TicketService.getTicketStats(req.user);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error fetching ticket stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ticket statistics',
        errorCode: 'STATS_FETCH_ERROR',
      });
    }
  },
);

export default router;