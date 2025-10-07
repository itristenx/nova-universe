import express from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateJWT, requirePermission } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { prisma, getWithCache } from '../db.js';

const router = express.Router();

/**
 * Agent Portal API - Endpoints for the Pulse agent workspace
 * Provides queue management, performance metrics, team collaboration, and gamification
 */

/**
 * @route GET /api/v1/agent/queue
 * @description Get agent's ticket queue with priority sorting
 * @access Protected - Requires agent role
 * @returns {Array} Array of tickets assigned to the agent
 */
router.get(
  '/queue',
  authenticateJWT,
  requirePermission('agent'),
  createRateLimit(60 * 1000, 120),
  [
    query('status').optional().isIn(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'ON_HOLD']),
    query('priority').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
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

      const agentId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      const status = req.query.status;
      const priority = req.query.priority;

      // Build cache key
      const cacheKey = `nova:agent:queue:${agentId}:status:${status || 'all'}:priority:${priority || 'all'}:v1`;

      const queueData = await getWithCache(
        cacheKey,
        async () => {
          // Build where clause for filtering
          const where = {
            assigneeId: agentId,
            state: status ? status : { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'ON_HOLD'] },
          };

          if (priority) {
            where.priority = priority;
          }

          // Fetch tickets from database
          const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: [
              { priority: 'desc' }, // CRITICAL first, then HIGH, MEDIUM, LOW
              { createdAt: 'asc' }, // Oldest first within same priority
            ],
            take: limit,
            include: {
              requester: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          // Calculate SLA breach information
          const enrichedTickets = tickets.map((ticket) => {
            const now = new Date();
            const createdAt = new Date(ticket.createdAt);
            const ageMinutes = Math.floor((now - createdAt) / 60000);

            // SLA targets by priority (in minutes)
            const slaTargets = {
              CRITICAL: 60, // 1 hour
              HIGH: 240, // 4 hours
              MEDIUM: 480, // 8 hours
              LOW: 1440, // 24 hours
            };

            const slaTarget = slaTargets[ticket.priority] || 1440;
            const slaBreached = ageMinutes > slaTarget;
            const slaTimeRemaining = slaTarget - ageMinutes;

            return {
              id: ticket.id,
              ticketNumber: ticket.ticketNumber,
              title: ticket.title,
              description: ticket.description,
              status: ticket.state,
              priority: ticket.priority,
              type: ticket.type,
              requester: ticket.requester
                ? {
                    id: ticket.requester.id,
                    name: ticket.requester.name,
                    email: ticket.requester.email,
                    avatar: ticket.requester.avatarUrl,
                  }
                : null,
              assignee: ticket.assignee
                ? {
                    id: ticket.assignee.id,
                    name: ticket.assignee.name,
                    email: ticket.assignee.email,
                    avatar: ticket.assignee.avatarUrl,
                  }
                : null,
              category: ticket.category?.name || 'Uncategorized',
              createdAt: ticket.createdAt,
              updatedAt: ticket.updatedAt,
              sla: {
                breached: slaBreached,
                targetMinutes: slaTarget,
                timeRemainingMinutes: slaTimeRemaining,
                ageMinutes,
              },
            };
          });

          return enrichedTickets;
        },
        120 // 2 minutes TTL - queue data should be relatively fresh
      );

      res.json({
        success: true,
        data: queueData,
        meta: {
          count: queueData.length,
          agentId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching agent queue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent queue',
        message: error.message,
      });
    }
  }
);

/**
 * @route GET /api/v1/agent/stats
 * @description Get agent performance statistics
 * @access Protected - Requires agent role
 * @returns {Object} Performance metrics for the agent
 */
router.get(
  '/stats',
  authenticateJWT,
  requirePermission('agent'),
  createRateLimit(60 * 1000, 60),
  async (req, res) => {
    try {
      const agentId = req.user.id;
      const cacheKey = `nova:agent:stats:${agentId}:v1`;

      const stats = await getWithCache(
        cacheKey,
        async () => {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          // Get total tickets assigned (all time)
          const totalTickets = await prisma.supportTicket.count({
            where: { assigneeId: agentId },
          });

          // Get resolved tickets today
          const resolvedToday = await prisma.supportTicket.count({
            where: {
              assigneeId: agentId,
              state: { in: ['RESOLVED', 'CLOSED'] },
              resolvedAt: { gte: todayStart },
            },
          });

          // Get average response time (in minutes) - calculated from first response
          const ticketsWithResponse = await prisma.supportTicketActivity.groupBy({
            by: ['ticketId'],
            where: {
              ticket: { assigneeId: agentId },
              type: 'COMMENT',
              userId: agentId,
            },
            _min: { createdAt: true },
          });

          let totalResponseTime = 0;
          let responseCount = 0;

          for (const response of ticketsWithResponse) {
            const ticket = await prisma.supportTicket.findUnique({
              where: { id: response.ticketId },
              select: { createdAt: true },
            });

            if (ticket && response._min.createdAt) {
              const responseTime = (response._min.createdAt - ticket.createdAt) / 60000; // minutes
              totalResponseTime += responseTime;
              responseCount++;
            }
          }

          const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

          // Get satisfaction rating (from resolved tickets with ratings)
          const ratingsResult = await prisma.supportTicketRating.aggregate({
            where: {
              ticket: { assigneeId: agentId },
            },
            _avg: { rating: true },
            _count: { rating: true },
          });

          const satisfactionRating = ratingsResult._avg.rating
            ? Math.round(ratingsResult._avg.rating * 10) / 10
            : null;

          // Get open tickets count
          const openTickets = await prisma.supportTicket.count({
            where: {
              assigneeId: agentId,
              state: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'ON_HOLD'] },
            },
          });

          // Get tickets resolved this week
          const resolvedThisWeek = await prisma.supportTicket.count({
            where: {
              assigneeId: agentId,
              state: { in: ['RESOLVED', 'CLOSED'] },
              resolvedAt: { gte: weekStart },
            },
          });

          // Get tickets resolved this month
          const resolvedThisMonth = await prisma.supportTicket.count({
            where: {
              assigneeId: agentId,
              state: { in: ['RESOLVED', 'CLOSED'] },
              resolvedAt: { gte: monthStart },
            },
          });

          return {
            totalTickets,
            openTickets,
            resolvedToday,
            resolvedThisWeek,
            resolvedThisMonth,
            avgResponseTimeMinutes: avgResponseTime,
            satisfactionRating,
            totalRatings: ratingsResult._count.rating,
          };
        },
        300 // 5 minutes TTL - stats don't need to be real-time
      );

      res.json({
        success: true,
        data: stats,
        meta: {
          agentId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching agent stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent stats',
        message: error.message,
      });
    }
  }
);

/**
 * @route GET /api/v1/agent/team
 * @description Get team member status and availability
 * @access Protected - Requires agent role
 * @returns {Array} Array of team members with their current status
 */
router.get(
  '/team',
  authenticateJWT,
  requirePermission('agent'),
  createRateLimit(60 * 1000, 60),
  async (req, res) => {
    try {
      const agentId = req.user.id;

      // Get agent's team/department
      const agent = await prisma.user.findUnique({
        where: { id: agentId },
        select: { department: true },
      });

      if (!agent || !agent.department) {
        return res.json({
          success: true,
          data: [],
          meta: {
            message: 'Agent has no department assigned',
            timestamp: new Date().toISOString(),
          },
        });
      }

      const cacheKey = `nova:agent:team:${agent.department}:v1`;

      const teamMembers = await getWithCache(
        cacheKey,
        async () => {
          // Find all agents in the same department
          const members = await prisma.user.findMany({
            where: {
              department: agent.department,
              role: { in: ['AGENT', 'SUPERVISOR', 'MANAGER'] },
              active: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              role: true,
              status: true, // Assumes status field exists (AVAILABLE, BUSY, AWAY, OFFLINE)
            },
            orderBy: { name: 'asc' },
          });

          // Get active ticket count for each team member
          const enrichedMembers = await Promise.all(
            members.map(async (member) => {
              const activeTickets = await prisma.supportTicket.count({
                where: {
                  assigneeId: member.id,
                  state: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING'] },
                },
              });

              return {
                id: member.id,
                name: member.name,
                email: member.email,
                avatar: member.avatarUrl,
                role: member.role,
                status: member.status || 'OFFLINE',
                activeTickets,
                isCurrentUser: member.id === agentId,
              };
            })
          );

          return enrichedMembers;
        },
        180 // 3 minutes TTL - team status should be relatively fresh
      );

      res.json({
        success: true,
        data: teamMembers,
        meta: {
          department: agent.department,
          count: teamMembers.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching team members:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team members',
        message: error.message,
      });
    }
  }
);

/**
 * @route GET /api/v1/agent/achievements
 * @description Get agent gamification achievements and badges
 * @access Protected - Requires agent role
 * @returns {Array} Array of achievements earned by the agent
 */
router.get(
  '/achievements',
  authenticateJWT,
  requirePermission('agent'),
  createRateLimit(60 * 1000, 60),
  async (req, res) => {
    try {
      const agentId = req.user.id;
      const cacheKey = `nova:agent:achievements:${agentId}:v1`;

      const achievements = await getWithCache(
        cacheKey,
        async () => {
          // Get agent's achievement records
          const userAchievements = await prisma.userAchievement.findMany({
            where: { userId: agentId },
            include: {
              achievement: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  icon: true,
                  category: true,
                  points: true,
                },
              },
            },
            orderBy: { earnedAt: 'desc' },
            take: 20, // Latest 20 achievements
          });

          return userAchievements.map((ua) => ({
            id: ua.achievement.id,
            name: ua.achievement.name,
            description: ua.achievement.description,
            icon: ua.achievement.icon || '🏆',
            category: ua.achievement.category,
            points: ua.achievement.points,
            earnedAt: ua.earnedAt,
            progress: ua.progress || 100, // Percentage completion
          }));
        },
        600 // 10 minutes TTL - achievements don't change frequently
      );

      // Calculate total points
      const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);

      res.json({
        success: true,
        data: achievements,
        meta: {
          totalPoints,
          achievementCount: achievements.length,
          agentId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching agent achievements:', error);

      // If achievements table doesn't exist, return empty array with graceful degradation
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Achievements feature not yet implemented in database');
        return res.json({
          success: true,
          data: [],
          meta: {
            totalPoints: 0,
            achievementCount: 0,
            agentId: req.user.id,
            message: 'Achievements feature coming soon',
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent achievements',
        message: error.message,
      });
    }
  }
);

export default router;
