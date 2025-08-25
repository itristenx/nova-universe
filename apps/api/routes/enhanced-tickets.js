import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateJWT, requirePermission } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { TicketService } from '../services/enhanced-ticket.service.js';
import { NotificationService } from '../services/notification.service.js';
import { AuditService } from '../services/audit.service.js';

const router = express.Router();

// Enhanced Ticket Management API - Production Ready
// Based on ITIL standards and industry best practices

/**
 * @route GET /api/v1/tickets
 * @description Get tickets with advanced filtering, sorting, and pagination
 * @access Protected
 */
router.get(
  '/',
  authenticateJWT,
  requirePermission('ticket:read'),
  createRateLimit(60 * 1000, 240),
  [
    // Pagination
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    // Filtering
    query('status')
      .optional()
      .isIn([
        'new',
        'assigned',
        'in_progress',
        'pending',
        'on_hold',
        'resolved',
        'closed',
        'cancelled',
        'reopened',
      ]),
    query('priority').optional().isIn(['critical', 'high', 'medium', 'low']),
    query('type')
      .optional()
      .isIn(['incident', 'request', 'problem', 'change', 'task', 'hr', 'ops', 'isac', 'feedback']),
    query('urgency').optional().isIn(['high', 'medium', 'low']),
    query('impact').optional().isIn(['high', 'medium', 'low']),
    query('assignedToUserId').optional().isUUID(),
    query('assignedToGroupId').optional().isUUID(),
    query('assignedToQueueId').optional().isUUID(),
    query('requesterId').optional().isUUID(),
    query('category').optional().isString(),
    query('subcategory').optional().isString(),
    query('tags').optional().isString(), // Comma-separated
    query('slaBreached').optional().isBoolean(),
    query('isVip').optional().isBoolean(),
    query('isEscalated').optional().isBoolean(),
    query('dueDate').optional().isISO8601(),
    query('createdAfter').optional().isISO8601(),
    query('createdBefore').optional().isISO8601(),
    query('source')
      .optional()
      .isIn(['portal', 'email', 'phone', 'slack', 'chat', 'api', 'kiosk', 'walk_in']),

    // Sorting
    query('sortBy')
      .optional()
      .isIn(['created_at', 'updated_at', 'priority', 'due_date', 'ticket_number', 'title']),
    query('sortOrder').optional().isIn(['asc', 'desc']),

    // Search
    query('search').optional().isString().isLength({ max: 500 }),
    query('searchFields').optional().isString(), // Comma-separated: title,description,ticket_number

    // Advanced filters
    query('businessService').optional().isString(),
    query('configurationItem').optional().isString(),
    query('costCenter').optional().isString(),
    query('location').optional().isString(),
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

      const filters = req.query;
      const result = await TicketService.getTickets(filters, req.user);

      res.json({
        success: true,
        data: result.tickets,
        pagination: result.pagination,
        meta: {
          totalFiltered: result.totalFiltered,
          totalUnfiltered: result.totalUnfiltered,
          appliedFilters: result.appliedFilters,
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
  requirePermission('ticket:read'),
  createRateLimit(60 * 1000, 300),
  [
    param('id').isInt().withMessage('Ticket ID must be an integer'),
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

      const ticketId = parseInt(req.params.id);
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
      await AuditService.logTicketAccess(ticketId, req.user.id, req.ip);

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
  requirePermission('ticket:create'),
  uploadMiddleware.array('attachments', 10),
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
      .isIn(['incident', 'request', 'problem', 'change', 'task', 'hr', 'ops', 'isac', 'feedback'])
      .withMessage('Invalid ticket type'),
    body('priority')
      .optional()
      .isIn(['critical', 'high', 'medium', 'low'])
      .withMessage('Invalid priority'),
    body('urgency').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid urgency'),
    body('impact').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid impact'),
    body('category').optional().isString().isLength({ max: 100 }),
    body('subcategory').optional().isString().isLength({ max: 100 }),
    body('businessService').optional().isString().isLength({ max: 100 }),
    body('configurationItem').optional().isString().isLength({ max: 100 }),
    body('assignedToUserId').optional().isUUID(),
    body('assignedToGroupId').optional().isUUID(),
    body('assignedToQueueId').optional().isUUID(),
    body('requesterId').optional().isUUID(), // For creating on behalf of someone
    body('location').optional().isString().isLength({ max: 100 }),
    body('costCenter').optional().isString().isLength({ max: 50 }),
    body('businessJustification').optional().isString(),
    body('dueDate').optional().isISO8601(),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().isLength({ max: 50 }),
    body('customFields').optional().isObject(),
    body('source')
      .optional()
      .isIn(['portal', 'email', 'phone', 'slack', 'chat', 'api', 'kiosk', 'walk_in']),
    body('confidentialityLevel')
      .optional()
      .isIn(['public', 'internal', 'confidential', 'restricted']),
    body('parentTicketId').optional().isInt(),
    body('templateId').optional().isUUID(), // Create from template
    body('workflowId').optional().isUUID(), // Initiate specific workflow
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
        ...req.body,
        userId: req.body.requesterId || req.user.id, // Requester
        createdBy: req.user.id, // Who created the ticket
        source: req.body.source || 'portal',
        attachments: req.files || [],
      };

      // Apply automatic classification if enabled
      if (req.body.enableAutoClassification !== false) {
        const classification = await TicketService.autoClassifyTicket(ticketData);
        if (classification) {
          ticketData.category = ticketData.category || classification.category;
          ticketData.subcategory = ticketData.subcategory || classification.subcategory;
          ticketData.priority = ticketData.priority || classification.priority;
          ticketData.urgency = ticketData.urgency || classification.urgency;
          ticketData.impact = ticketData.impact || classification.impact;
        }
      }

      const ticket = await TicketService.createTicket(ticketData, req.user);

      // Send notifications
      await NotificationService.sendTicketCreatedNotifications(ticket);

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
  requirePermission('ticket:update'),
  createRateLimit(60 * 1000, 60),
  [
    param('id').isInt().withMessage('Ticket ID must be an integer'),
    body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().trim(),
    body('shortDescription').optional().isString().isLength({ max: 160 }),
    body('state')
      .optional()
      .isIn([
        'new',
        'assigned',
        'in_progress',
        'pending',
        'on_hold',
        'resolved',
        'closed',
        'cancelled',
        'reopened',
      ]),
    body('priority').optional().isIn(['critical', 'high', 'medium', 'low']),
    body('urgency').optional().isIn(['high', 'medium', 'low']),
    body('impact').optional().isIn(['high', 'medium', 'low']),
    body('category').optional().isString().isLength({ max: 100 }),
    body('subcategory').optional().isString().isLength({ max: 100 }),
    body('businessService').optional().isString().isLength({ max: 100 }),
    body('configurationItem').optional().isString().isLength({ max: 100 }),
    body('assignedToUserId').optional().isUUID(),
    body('assignedToGroupId').optional().isUUID(),
    body('assignedToQueueId').optional().isUUID(),
    body('location').optional().isString().isLength({ max: 100 }),
    body('costCenter').optional().isString().isLength({ max: 50 }),
    body('businessJustification').optional().isString(),
    body('resolution').optional().isString(),
    body('closeNotes').optional().isString(),
    body('dueDate').optional().isISO8601(),
    body('tags').optional().isArray(),
    body('customFields').optional().isObject(),
    body('workflowStage').optional().isString(),
    body('confidentialityLevel')
      .optional()
      .isIn(['public', 'internal', 'confidential', 'restricted']),
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

      const ticketId = parseInt(req.params.id);
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
 * @route POST /api/v1/tickets/:id/assign
 * @description Assign ticket to user, group, or queue
 * @access Protected
 */
router.post(
  '/:id/assign',
  authenticateJWT,
  requirePermission('ticket:assign'),
  [
    param('id').isInt(),
    body('assignedToUserId').optional().isUUID(),
    body('assignedToGroupId').optional().isUUID(),
    body('assignedToQueueId').optional().isUUID(),
    body('reason').optional().isString().isLength({ max: 500 }),
    body('notifyAssignee').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const {
        assignedToUserId,
        assignedToGroupId,
        assignedToQueueId,
        reason,
        notifyAssignee = true,
      } = req.body;

      if (!assignedToUserId && !assignedToGroupId && !assignedToQueueId) {
        return res.status(400).json({
          success: false,
          error: 'Must specify at least one assignment target',
        });
      }

      const ticket = await TicketService.assignTicket(ticketId, {
        assignedToUserId,
        assignedToGroupId,
        assignedToQueueId,
        assignedBy: req.user.id,
        reason,
      });

      if (notifyAssignee) {
        await NotificationService.sendTicketAssignedNotifications(ticket);
      }

      res.json({
        success: true,
        data: ticket,
        message: 'Ticket assigned successfully',
      });
    } catch (error) {
      logger.error('Error assigning ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign ticket',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/comments
 * @description Add comment to ticket
 * @access Protected
 */
router.post(
  '/:id/comments',
  authenticateJWT,
  requirePermission('ticket:comment'),
  uploadMiddleware.array('attachments', 5),
  [
    param('id').isInt(),
    body('content').isString().trim().isLength({ min: 1, max: 10000 }),
    body('isInternal').optional().isBoolean(),
    body('notifyWatchers').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { content, isInternal = false, notifyWatchers = true } = req.body;

      const comment = await TicketService.addComment(ticketId, {
        content,
        isInternal,
        userId: req.user.id,
        attachments: req.files || [],
      });

      if (notifyWatchers && !isInternal) {
        await NotificationService.sendCommentNotifications(comment);
      }

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
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/watchers
 * @description Add watcher to ticket
 * @access Protected
 */
router.post(
  '/:id/watchers',
  authenticateJWT,
  requirePermission('ticket:update'),
  [
    param('id').isInt(),
    body('userId').isUUID(),
    body('watchType')
      .optional()
      .isIn(['manual', 'auto_assignee', 'auto_requester', 'auto_group', 'auto_escalation']),
  ],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { userId, watchType = 'manual' } = req.body;

      await TicketService.addWatcher(ticketId, userId, watchType, req.user.id);

      res.json({
        success: true,
        message: 'Watcher added successfully',
      });
    } catch (error) {
      logger.error('Error adding watcher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add watcher',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/escalate
 * @description Escalate ticket
 * @access Protected
 */
router.post(
  '/:id/escalate',
  authenticateJWT,
  requirePermission('ticket:escalate'),
  [
    param('id').isInt(),
    body('escalatedTo').optional().isUUID(),
    body('escalatedToGroup').optional().isUUID(),
    body('reason').isString().isLength({ min: 1, max: 1000 }),
    body('escalationLevel').optional().isInt({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const escalationData = {
        ...req.body,
        escalatedBy: req.user.id,
      };

      const escalation = await TicketService.escalateTicket(ticketId, escalationData);

      await NotificationService.sendEscalationNotifications(escalation);

      res.json({
        success: true,
        data: escalation,
        message: 'Ticket escalated successfully',
      });
    } catch (error) {
      logger.error('Error escalating ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to escalate ticket',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/resolve
 * @description Resolve ticket
 * @access Protected
 */
router.post(
  '/:id/resolve',
  authenticateJWT,
  requirePermission('ticket:resolve'),
  [
    param('id').isInt(),
    body('resolution').isString().isLength({ min: 1 }),
    body('resolutionCode').optional().isString(),
    body('notifyRequester').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { resolution, resolutionCode, notifyRequester = true } = req.body;

      const ticket = await TicketService.resolveTicket(ticketId, {
        resolution,
        resolutionCode,
        resolvedBy: req.user.id,
      });

      if (notifyRequester) {
        await NotificationService.sendTicketResolvedNotifications(ticket);
      }

      res.json({
        success: true,
        data: ticket,
        message: 'Ticket resolved successfully',
      });
    } catch (error) {
      logger.error('Error resolving ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve ticket',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/close
 * @description Close ticket
 * @access Protected
 */
router.post(
  '/:id/close',
  authenticateJWT,
  requirePermission('ticket:close'),
  [
    param('id').isInt(),
    body('closeNotes').optional().isString(),
    body('satisfactionRating').optional().isInt({ min: 1, max: 5 }),
    body('satisfactionComment').optional().isString(),
    body('notifyRequester').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const closeData = {
        ...req.body,
        closedBy: req.user.id,
      };

      const ticket = await TicketService.closeTicket(ticketId, closeData);

      if (req.body.notifyRequester !== false) {
        await NotificationService.sendTicketClosedNotifications(ticket);
      }

      res.json({
        success: true,
        data: ticket,
        message: 'Ticket closed successfully',
      });
    } catch (error) {
      logger.error('Error closing ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to close ticket',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/reopen
 * @description Reopen closed ticket
 * @access Protected
 */
router.post(
  '/:id/reopen',
  authenticateJWT,
  requirePermission('ticket:reopen'),
  [param('id').isInt(), body('reason').isString().isLength({ min: 1, max: 500 })],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { reason } = req.body;

      const ticket = await TicketService.reopenTicket(ticketId, {
        reason,
        reopenedBy: req.user.id,
      });

      res.json({
        success: true,
        data: ticket,
        message: 'Ticket reopened successfully',
      });
    } catch (error) {
      logger.error('Error reopening ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reopen ticket',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/links
 * @description Link tickets together
 * @access Protected
 */
router.post(
  '/:id/links',
  authenticateJWT,
  requirePermission('ticket:link'),
  [
    param('id').isInt(),
    body('targetTicketId').isInt(),
    body('relationshipType').isIn([
      'blocks',
      'is_blocked_by',
      'duplicates',
      'is_duplicated_by',
      'relates_to',
      'parent_of',
      'child_of',
      'caused_by',
      'causes',
    ]),
  ],
  async (req, res) => {
    try {
      const sourceTicketId = parseInt(req.params.id);
      const { targetTicketId, relationshipType } = req.body;

      const link = await TicketService.linkTickets(
        sourceTicketId,
        targetTicketId,
        relationshipType,
        req.user.id,
      );

      res.json({
        success: true,
        data: link,
        message: 'Tickets linked successfully',
      });
    } catch (error) {
      logger.error('Error linking tickets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to link tickets',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/:id/time-entries
 * @description Add time entry to ticket
 * @access Protected
 */
router.post(
  '/:id/time-entries',
  authenticateJWT,
  requirePermission('ticket:time_tracking'),
  [
    param('id').isInt(),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be positive integer (minutes)'),
    body('description').optional().isString(),
    body('timeType')
      .optional()
      .isIn(['work', 'research', 'travel', 'training', 'documentation', 'testing', 'break']),
    body('billable').optional().isBoolean(),
    body('startTime').isISO8601(),
    body('endTime').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const timeData = {
        ...req.body,
        userId: req.user.id,
      };

      const timeEntry = await TicketService.addTimeEntry(ticketId, timeData);

      res.status(201).json({
        success: true,
        data: timeEntry,
        message: 'Time entry added successfully',
      });
    } catch (error) {
      logger.error('Error adding time entry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add time entry',
      });
    }
  },
);

/**
 * @route GET /api/v1/tickets/search
 * @description Advanced ticket search with full-text search
 * @access Protected
 */
router.get(
  '/search',
  authenticateJWT,
  requirePermission('ticket:read'),
  [
    query('q').isString().isLength({ min: 1, max: 500 }).withMessage('Search query is required'),
    query('fields').optional().isString(), // title,description,comments,attachments
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('includeArchived').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const { q: query, fields, page = 1, limit = 25, includeArchived = false } = req.query;

      const searchFields = fields ? fields.split(',') : ['title', 'description'];

      const results = await TicketService.searchTickets({
        query,
        fields: searchFields,
        page: parseInt(page),
        limit: parseInt(limit),
        includeArchived,
        user: req.user,
      });

      res.json({
        success: true,
        data: results.tickets,
        pagination: results.pagination,
        meta: {
          searchQuery: query,
          searchFields,
          totalResults: results.total,
          searchTime: results.searchTime,
        },
      });
    } catch (error) {
      logger.error('Error searching tickets:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
      });
    }
  },
);

/**
 * @route GET /api/v1/tickets/stats
 * @description Get ticket statistics and metrics
 * @access Protected
 */
router.get(
  '/stats',
  authenticateJWT,
  requirePermission('ticket:read'),
  [
    query('period').optional().isIn(['1d', '7d', '30d', '90d', '1y']),
    query('groupBy')
      .optional()
      .isIn(['status', 'priority', 'type', 'assignee', 'queue', 'day', 'week', 'month']),
    query('assignedToMe').optional().isBoolean(),
    query('createdByMe').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const { period = '30d', groupBy, assignedToMe, createdByMe } = req.query;

      const stats = await TicketService.getTicketStats({
        period,
        groupBy,
        assignedToMe: assignedToMe ? req.user.id : null,
        createdByMe: createdByMe ? req.user.id : null,
        user: req.user,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error fetching ticket stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
      });
    }
  },
);

/**
 * @route POST /api/v1/tickets/bulk
 * @description Bulk operations on tickets
 * @access Protected
 */
router.post(
  '/bulk',
  authenticateJWT,
  requirePermission('ticket:bulk_update'),
  [
    body('ticketIds').isArray({ min: 1, max: 100 }).withMessage('Must provide 1-100 ticket IDs'),
    body('ticketIds.*').isInt(),
    body('operation').isIn(['update', 'assign', 'close', 'delete', 'escalate']),
    body('data').isObject().withMessage('Operation data is required'),
  ],
  async (req, res) => {
    try {
      const { ticketIds, operation, data } = req.body;

      const result = await TicketService.bulkOperation({
        ticketIds,
        operation,
        data,
        performedBy: req.user.id,
      });

      res.json({
        success: true,
        data: result,
        message: `Bulk ${operation} completed`,
      });
    } catch (error) {
      logger.error('Error performing bulk operation:', error);
      res.status(500).json({
        success: false,
        error: 'Bulk operation failed',
      });
    }
  },
);

/**
 * @route GET /api/v1/tickets/export
 * @description Export tickets to various formats
 * @access Protected
 */
router.get(
  '/export',
  authenticateJWT,
  requirePermission('ticket:export'),
  [
    query('format').isIn(['csv', 'excel', 'pdf']).withMessage('Invalid export format'),
    query('filters').optional().isString(), // JSON string of filters
    query('fields').optional().isString(), // Comma-separated list of fields
  ],
  async (req, res) => {
    try {
      const { format, filters, fields } = req.query;

      const filterObj = filters ? JSON.parse(filters) : {};
      const fieldList = fields ? fields.split(',') : null;

      const exportData = await TicketService.exportTickets({
        format,
        filters: filterObj,
        fields: fieldList,
        user: req.user,
      });

      res.setHeader('Content-Type', exportData.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      res.send(exportData.buffer);
    } catch (error) {
      logger.error('Error exporting tickets:', error);
      res.status(500).json({
        success: false,
        error: 'Export failed',
      });
    }
  },
);

/**
 * @route GET /api/v1/tickets/templates
 * @description Get available ticket templates
 * @access Protected
 */
router.get('/templates', authenticateJWT, requirePermission('ticket:read'), async (req, res) => {
  try {
    const templates = await TicketService.getTicketTemplates(req.user);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
    });
  }
});

/**
 * @route POST /api/v1/tickets/templates/:id/apply
 * @description Create ticket from template
 * @access Protected
 */
router.post(
  '/templates/:id/apply',
  authenticateJWT,
  requirePermission('ticket:create'),
  [param('id').isUUID(), body('overrides').optional().isObject()],
  async (req, res) => {
    try {
      const templateId = req.params.id;
      const overrides = req.body.overrides || {};

      const ticket = await TicketService.createFromTemplate(templateId, overrides, req.user);

      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Ticket created from template successfully',
      });
    } catch (error) {
      logger.error('Error creating ticket from template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create ticket from template',
      });
    }
  },
);

export default router;
