// nova-api/routes/pulse.js
// Nova Pulse - Technician Portal Routes
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
 *     TechnicianTicket:
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
 *             email:
 *               type: string
 *         requestedBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         location:
 *           type: string
 *         estimatedTime:
 *           type: integer
 *           description: Estimated time in minutes
 *         actualTime:
 *           type: integer
 *           description: Actual time spent in minutes
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         dueDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/pulse/dashboard:
 *   get:
 *     summary: Get technician dashboard data
 *     description: Returns summary data for the technician dashboard
 *     tags: [Pulse - Technician Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     myTickets:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         open:
 *                           type: integer
 *                         inProgress:
 *                           type: integer
 *                         resolved:
 *                           type: integer
 *                     todayStats:
 *                       type: object
 *                       properties:
 *                         ticketsResolved:
 *                           type: integer
 *                         avgResolutionTime:
 *                           type: integer
 *                         totalTimeLogged:
 *                           type: integer
 *                     upcomingTasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TechnicianTicket'
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ticketId:
 *                             type: string
 *                           action:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];

      // Get my tickets summary
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
        FROM tickets 
        WHERE assigned_to_id = $1 AND deleted_at IS NULL
      `, [userId], (err, ticketStats) => {
        if (err) {
          logger.error('Error fetching ticket stats:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data',
            errorCode: 'DASHBOARD_ERROR'
          });
        }

        // Get today's stats
        db.get(`
          SELECT 
            COUNT(*) as tickets_resolved,
            AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60) as avg_resolution_time,
            SUM(actual_time_minutes) as total_time_logged
          FROM tickets 
          WHERE assigned_to_id = $1 
          AND status = 'resolved' 
          AND DATE(resolved_at) = $2
        `, [userId, today], (todayErr, todayStats) => {
          if (todayErr) {
            logger.error('Error fetching today stats:', todayErr);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch dashboard data',
              errorCode: 'DASHBOARD_ERROR'
            });
          }

          // Get upcoming tasks (high priority or due soon)
          db.all(`
            SELECT t.*, u.name as requester_name, u.email as requester_email
            FROM tickets t
            LEFT JOIN users u ON t.requested_by_id = u.id
            WHERE t.assigned_to_id = $1 
            AND t.status IN ('open', 'in_progress')
            AND t.deleted_at IS NULL
            ORDER BY 
              CASE t.priority 
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
              END,
              t.due_date ASC
            LIMIT 5
          `, [userId], (upcomingErr, upcomingTasks) => {
            if (upcomingErr) {
              logger.error('Error fetching upcoming tasks:', upcomingErr);
              return res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard data',
                errorCode: 'DASHBOARD_ERROR'
              });
            }

            // Get recent activity
            db.all(`
              SELECT ticket_id, action, timestamp
              FROM ticket_logs 
              WHERE user_id = $1
              ORDER BY timestamp DESC
              LIMIT 10
            `, [userId], (activityErr, recentActivity) => {
              if (activityErr) {
                logger.error('Error fetching recent activity:', activityErr);
                return res.status(500).json({
                  success: false,
                  error: 'Failed to fetch dashboard data',
                  errorCode: 'DASHBOARD_ERROR'
                });
              }

              const dashboard = {
                myTickets: {
                  total: ticketStats?.total || 0,
                  open: ticketStats?.open || 0,
                  inProgress: ticketStats?.in_progress || 0,
                  resolved: ticketStats?.resolved || 0
                },
                todayStats: {
                  ticketsResolved: todayStats?.tickets_resolved || 0,
                  avgResolutionTime: Math.round(todayStats?.avg_resolution_time || 0),
                  totalTimeLogged: todayStats?.total_time_logged || 0
                },
                upcomingTasks: (upcomingTasks || []).map(task => ({
                  id: task.id,
                  ticketId: task.ticket_id,
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  status: task.status,
                  category: task.category,
                  subcategory: task.subcategory,
                  location: task.location,
                  estimatedTime: task.estimated_time_minutes,
                  actualTime: task.actual_time_minutes,
                  requestedBy: {
                    id: task.requested_by_id,
                    name: task.requester_name,
                    email: task.requester_email
                  },
                  createdAt: task.created_at,
                  updatedAt: task.updated_at,
                  dueDate: task.due_date
                })),
                recentActivity: (recentActivity || []).map(activity => ({
                  ticketId: activity.ticket_id,
                  action: activity.action,
                  timestamp: activity.timestamp
                }))
              };

              res.json({
                success: true,
                dashboard
              });
            });
          });
        });
      });
    } catch (error) {
      logger.error('Error in dashboard endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard data',
        errorCode: 'DASHBOARD_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/tickets:
 *   get:
 *     summary: Get tickets assigned to technician
 *     description: Returns tickets assigned to the authenticated technician
 *     tags: [Pulse - Technician Portal]
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
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of tickets to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of tickets to skip
 *     responses:
 *       200:
 *         description: List of assigned tickets
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
 *                     $ref: '#/components/schemas/TechnicianTicket'
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
        priority,
        category,
        limit = 50,
        offset = 0
      } = req.query;

      let query = `
        SELECT t.*, 
               u.name as requester_name, u.email as requester_email,
               a.name as assignee_name,
               COUNT(*) OVER() as total_count
        FROM tickets t
        LEFT JOIN users u ON t.requested_by_id = u.id
        LEFT JOIN users a ON t.assigned_to_id = a.id
        WHERE t.assigned_to_id = $1 AND t.deleted_at IS NULL
      `;
      const params = [userId];

      if (status) {
        query += ` AND t.status = $2`;
        params.push(status);
      }

      if (priority) {
        query += ` AND t.priority = $3`;
        params.push(priority);
      }

      if (category) {
        query += ` AND t.category = $4`;
        params.push(category);
      }

      query += ` ORDER BY 
        CASE t.priority 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.created_at DESC
        LIMIT $5 OFFSET $6
      `;
      params.push(parseInt(limit), parseInt(offset));

      db.all(query, params, (err, rows) => {
        if (err) {
          logger.error('Error fetching technician tickets:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch tickets',
            errorCode: 'TICKETS_FETCH_ERROR'
          });
        }

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
          estimatedTime: row.estimated_time_minutes,
          actualTime: row.actual_time_minutes,
          assignedTo: {
            id: row.assigned_to_id,
            name: row.assignee_name
          },
          requestedBy: {
            id: row.requested_by_id,
            name: row.requester_name,
            email: row.requester_email
          },
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          dueDate: row.due_date
        }));

        const total = rows.length > 0 ? rows[0].total_count : 0;
        const hasMore = parseInt(offset) + parseInt(limit) < total;

        res.json({
          success: true,
          tickets,
          total,
          hasMore
        });
      });
    } catch (error) {
      logger.error('Error in technician tickets endpoint:', error);
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
 * /api/v1/pulse/tickets/{ticketId}/update:
 *   put:
 *     summary: Update ticket status and details
 *     description: Update ticket status, add work notes, log time
 *     tags: [Pulse - Technician Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed, on_hold]
 *               workNote:
 *                 type: string
 *                 description: Work note to add
 *               timeSpent:
 *                 type: integer
 *                 description: Time spent in minutes
 *               resolution:
 *                 type: string
 *                 description: Resolution details (required when status is resolved)
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 */
router.put('/tickets/:ticketId/update',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 updates per 15 minutes
  [
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed', 'on_hold']).withMessage('Invalid status'),
    body('workNote').optional().isString().isLength({ max: 5000 }).withMessage('Work note must be less than 5000 characters'),
    body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive integer'),
    body('resolution').optional().isString().isLength({ max: 5000 }).withMessage('Resolution must be less than 5000 characters')
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

      const { ticketId } = req.params;
      const { status, workNote, timeSpent, resolution } = req.body;
      const userId = req.user.id;

      // Check if ticket exists and is assigned to this user
      db.get('SELECT * FROM tickets WHERE ticket_id = $1 AND assigned_to_id = $2 AND deleted_at IS NULL', 
        [ticketId, userId], (err, ticket) => {
        if (err) {
          logger.error('Error checking ticket:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to update ticket',
            errorCode: 'TICKET_CHECK_ERROR'
          });
        }

        if (!ticket) {
          return res.status(404).json({
            success: false,
            error: 'Ticket not found or not assigned to you',
            errorCode: 'TICKET_NOT_FOUND'
          });
        }

        const updates = [];
        const params = [];

        if (status) {
          updates.push('status = $1');
          params.push(status);

          if (status === 'resolved') {
            updates.push('resolved_at = $2');
            params.push(new Date().toISOString());
            
            if (resolution) {
              updates.push('resolution = $3');
              params.push(resolution);
            }
          }

          if (status === 'in_progress' && ticket.status === 'open') {
            updates.push('started_at = $4');
            params.push(new Date().toISOString());
          }
        }

        if (timeSpent) {
          updates.push('actual_time_minutes = COALESCE(actual_time_minutes, 0) + $5');
          params.push(timeSpent);
        }

        updates.push('updated_at = $6');
        params.push(new Date().toISOString());

        if (updates.length > 0) {
          params.push(ticket.id);
          const updateQuery = `UPDATE tickets SET ${updates.join(', ')} WHERE id = $7`;

          db.run(updateQuery, params, (updateErr) => {
            if (updateErr) {
              logger.error('Error updating ticket:', updateErr);
              return res.status(500).json({
                success: false,
                error: 'Failed to update ticket',
                errorCode: 'TICKET_UPDATE_ERROR'
              });
            }

            // Log the activity
            const logEntry = {
              id: require('uuid').v4(),
              ticket_id: ticketId,
              user_id: userId,
              action: status ? `Status changed to ${status}` : 'Ticket updated',
              details: workNote || null,
              timestamp: new Date().toISOString()
            };

            db.run(
              'INSERT INTO ticket_logs (id, ticket_id, user_id, action, details, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
              [logEntry.id, logEntry.ticket_id, logEntry.user_id, logEntry.action, logEntry.details, logEntry.timestamp],
              (logErr) => {
                if (logErr) {
                  logger.error('Error logging ticket activity:', logErr);
                }
              }
            );

            res.json({
              success: true,
              message: 'Ticket updated successfully'
            });
          });
        } else {
          res.json({
            success: true,
            message: 'No changes made'
          });
        }
      });
    } catch (error) {
      logger.error('Error updating ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update ticket',
        errorCode: 'TICKET_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/tickets/{ticketId}/claim:
 *   post:
 *     summary: Claim an unassigned ticket
 *     description: Assign an unassigned ticket to the authenticated technician
 *     tags: [Pulse - Technician Portal]
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
 *         description: Ticket claimed successfully
 *       404:
 *         description: Ticket not found
 *       400:
 *         description: Ticket already assigned
 *       401:
 *         description: Unauthorized
 */
router.post('/tickets/:ticketId/claim',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 claims per 15 minutes
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const userId = req.user.id;

      // Check if ticket exists and is unassigned
      db.get('SELECT * FROM tickets WHERE ticket_id = $1 AND deleted_at IS NULL', [ticketId], (err, ticket) => {
        if (err) {
          logger.error('Error checking ticket:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to claim ticket',
            errorCode: 'TICKET_CHECK_ERROR'
          });
        }

        if (!ticket) {
          return res.status(404).json({
            success: false,
            error: 'Ticket not found',
            errorCode: 'TICKET_NOT_FOUND'
          });
        }

        if (ticket.assigned_to_id) {
          return res.status(400).json({
            success: false,
            error: 'Ticket is already assigned',
            errorCode: 'TICKET_ALREADY_ASSIGNED'
          });
        }

        // Assign ticket to user
        db.run(
          'UPDATE tickets SET assigned_to_id = $1, status = $2, updated_at = $3 WHERE id = $4',
          [userId, 'in_progress', new Date().toISOString(), ticket.id],
          (updateErr) => {
            if (updateErr) {
              logger.error('Error claiming ticket:', updateErr);
              return res.status(500).json({
                success: false,
                error: 'Failed to claim ticket',
                errorCode: 'TICKET_CLAIM_ERROR'
              });
            }

            // Log the activity
            db.run(
              'INSERT INTO ticket_logs (id, ticket_id, user_id, action, timestamp) VALUES ($1, $2, $3, $4, $5)',
              [require('uuid').v4(), ticketId, userId, 'Ticket claimed', new Date().toISOString()],
              (logErr) => {
                if (logErr) {
                  logger.error('Error logging ticket claim:', logErr);
                }
              }
            );

            res.json({
              success: true,
              message: 'Ticket claimed successfully'
            });
          }
        );
      });
    } catch (error) {
      logger.error('Error claiming ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to claim ticket',
        errorCode: 'TICKET_CLAIM_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/timesheet:
 *   get:
 *     summary: Get technician timesheet
 *     description: Returns time tracking data for the technician
 *     tags: [Pulse - Technician Portal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for timesheet (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for timesheet (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Timesheet data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 timesheet:
 *                   type: object
 *                   properties:
 *                     totalHours:
 *                       type: number
 *                     ticketsWorked:
 *                       type: integer
 *                     entries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ticketId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           timeSpent:
 *                             type: integer
 *                           date:
 *                             type: string
 *                             format: date
 *       401:
 *         description: Unauthorized
 */
router.get('/timesheet',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      const rows = await db.any(`
        SELECT t.ticket_id, t.title, t.actual_time_minutes, DATE(t.updated_at) as work_date
        FROM tickets t
        WHERE t.assigned_to_id = $1 
        AND t.actual_time_minutes > 0
        AND DATE(t.updated_at) BETWEEN $2 AND $3
        ORDER BY t.updated_at DESC
      `, [userId, start, end]);

      const timesheet = (rows || []).map(row => ({
        ticketId: row.ticket_id,
        title: row.title,
        timeSpent: row.actual_time_minutes,
        date: row.work_date
      }));

      res.json({
        success: true,
        timesheet
      });
    } catch (error) {
      logger.error('Error fetching timesheet:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch timesheet',
        errorCode: 'TIMESHEET_ERROR'
      });
    }
  }
);

export default router;
