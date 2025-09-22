import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/v1/workflow-analytics/dashboard - Main workflow analytics dashboard
router.get('/dashboard', authenticateJWT, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range based on timeframe
    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      ticketsByPriority,
      ticketsByCategory,
      resolutionTimes,
      slaCompliance,
      userProductivity
    ] = await Promise.all([
      // Total tickets in timeframe
      prisma.serviceRequest.count({
        where: {
          created_at: { gte: startDate }
        }
      }) + await prisma.incident.count({
        where: {
          created_at: { gte: startDate }
        }
      }),

      // Open tickets
      prisma.serviceRequest.count({
        where: {
          state: {
            in: ['NEW', 'IN_PROGRESS', 'PENDING', 'ON_HOLD']
          }
        }
      }) + await prisma.incident.count({
        where: {
          state: {
            in: ['NEW', 'IN_PROGRESS', 'PENDING', 'ON_HOLD']
          }
        }
      }),

      // Resolved tickets in timeframe
      prisma.serviceRequest.count({
        where: {
          state: 'RESOLVED',
          resolved_at: { gte: startDate }
        }
      }) + await prisma.incident.count({
        where: {
          state: 'RESOLVED',
          resolved_at: { gte: startDate }
        }
      }),

      // Tickets by priority
      prisma.serviceRequest.groupBy({
        by: ['priority'],
        where: {
          created_at: { gte: startDate }
        },
        _count: true
      }),

      // Tickets by category
      prisma.serviceRequest.groupBy({
        by: ['category'],
        where: {
          created_at: { gte: startDate }
        },
        _count: true,
        orderBy: {
          _count: {
            category: 'desc'
          }
        },
        take: 10
      }),

      // Average resolution times (we'll calculate this client-side for now)
      prisma.serviceRequest.findMany({
        where: {
          resolved_at: { gte: startDate },
          state: 'RESOLVED'
        },
        select: {
          created_at: true,
          resolved_at: true,
          priority: true
        }
      }),

      // SLA compliance (simplified calculation)
      prisma.serviceRequest.count({
        where: {
          resolved_at: { gte: startDate },
          state: 'RESOLVED',
          // This would need proper SLA field in schema
        }
      }),

      // User productivity
      prisma.serviceRequest.groupBy({
        by: ['assigned_to_id'],
        where: {
          resolved_at: { gte: startDate },
          assigned_to_id: { not: null }
        },
        _count: true,
        orderBy: {
          _count: {
            assigned_to_id: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Calculate average resolution times
    const avgResolutionTimes = {};
    resolutionTimes.forEach(ticket => {
      if (ticket.resolved_at && ticket.created_at) {
        const resolutionTime = (new Date(ticket.resolved_at) - new Date(ticket.created_at)) / (1000 * 60 * 60); // hours
        if (!avgResolutionTimes[ticket.priority]) {
          avgResolutionTimes[ticket.priority] = { total: 0, count: 0 };
        }
        avgResolutionTimes[ticket.priority].total += resolutionTime;
        avgResolutionTimes[ticket.priority].count += 1;
      }
    });

    // Calculate averages
    Object.keys(avgResolutionTimes).forEach(priority => {
      const data = avgResolutionTimes[priority];
      avgResolutionTimes[priority] = data.total / data.count;
    });

    res.json({
      success: true,
      data: {
        summary: {
          total_tickets: totalTickets,
          open_tickets: openTickets,
          resolved_tickets: resolvedTickets,
          resolution_rate: totalTickets > 0 ? (resolvedTickets / totalTickets * 100).toFixed(1) : 0
        },
        tickets_by_priority: ticketsByPriority.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {}),
        tickets_by_category: ticketsByCategory.map(cat => ({
          category: cat.category,
          count: cat._count
        })),
        avg_resolution_times: avgResolutionTimes,
        sla_compliance: {
          total: resolvedTickets,
          compliant: slaCompliance,
          percentage: resolvedTickets > 0 ? (slaCompliance / resolvedTickets * 100).toFixed(1) : 0
        },
        top_performers: userProductivity.map(user => ({
          user_id: user.assigned_to_id,
          resolved_count: user._count
        })),
        timeframe
      }
    });
  } catch (error) {
    logger.error('Error fetching workflow analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workflow analytics',
      message: error.message 
    });
  }
});

// GET /api/v1/workflow-analytics/performance - Performance metrics
router.get('/performance', authenticateJWT, async (req, res) => {
  try {
    const { user_id, timeframe = '30d' } = req.query;
    
    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const whereClause = {
      created_at: { gte: startDate }
    };

    if (user_id) {
      whereClause.assigned_to_id = user_id;
    }

    const [
      assignedTickets,
      resolvedTickets,
      avgResolutionTime,
      customerSatisfaction
    ] = await Promise.all([
      // Assigned tickets
      prisma.serviceRequest.count({
        where: whereClause
      }),

      // Resolved tickets
      prisma.serviceRequest.count({
        where: {
          ...whereClause,
          state: 'RESOLVED'
        }
      }),

      // Average resolution time
      prisma.serviceRequest.findMany({
        where: {
          ...whereClause,
          state: 'RESOLVED',
          resolved_at: { not: null }
        },
        select: {
          created_at: true,
          resolved_at: true
        }
      }),

      // Customer satisfaction (if we had ratings)
      // This would need proper rating field in schema
      4.2 // Mock value for now
    ]);

    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    avgResolutionTime.forEach(ticket => {
      if (ticket.resolved_at && ticket.created_at) {
        const resolutionTime = (new Date(ticket.resolved_at) - new Date(ticket.created_at)) / (1000 * 60 * 60); // hours
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    const avgResolutionHours = resolvedCount > 0 ? (totalResolutionTime / resolvedCount).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        assigned_tickets: assignedTickets,
        resolved_tickets: resolvedTickets,
        resolution_rate: assignedTickets > 0 ? (resolvedTickets / assignedTickets * 100).toFixed(1) : 0,
        avg_resolution_time_hours: avgResolutionHours,
        customer_satisfaction: customerSatisfaction,
        timeframe
      }
    });
  } catch (error) {
    logger.error('Error fetching performance analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch performance analytics',
      message: error.message 
    });
  }
});

// GET /api/v1/workflow-analytics/trends - Trend analysis
router.get('/trends', authenticateJWT, async (req, res) => {
  try {
    const { timeframe = '30d', metric = 'tickets' } = req.query;
    
    let startDate = new Date();
    let interval = 'day';
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        interval = 'day';
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        interval = 'day';
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        interval = 'week';
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        interval = 'month';
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        interval = 'day';
    }

    // For PostgreSQL, we'll use date_trunc to group by intervals
    const trends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${interval}, created_at) as period,
        COUNT(*) as count
      FROM service_requests 
      WHERE created_at >= ${startDate}
      GROUP BY DATE_TRUNC(${interval}, created_at)
      ORDER BY period ASC
    `;

    res.json({
      success: true,
      data: {
        trends: trends.map(trend => ({
          period: trend.period,
          count: parseInt(trend.count)
        })),
        metric,
        timeframe,
        interval
      }
    });
  } catch (error) {
    logger.error('Error fetching trend analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trend analytics',
      message: error.message 
    });
  }
});

// GET /api/v1/workflow-analytics/team-performance - Team performance metrics
router.get('/team-performance', authenticateJWT, async (req, res) => {
  try {
    const { team_id, timeframe = '30d' } = req.query;
    
    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const whereClause = {
      created_at: { gte: startDate },
      assigned_to_id: { not: null }
    };

    if (team_id) {
      // This would need proper team relationship in schema
      whereClause.assigned_to = {
        team_id: team_id
      };
    }

    const teamPerformance = await prisma.serviceRequest.groupBy({
      by: ['assigned_to_id'],
      where: whereClause,
      _count: {
        id: true
      },
      _avg: {
        // This would need proper calculation of resolution time
      }
    });

    res.json({
      success: true,
      data: {
        team_performance: teamPerformance.map(member => ({
          user_id: member.assigned_to_id,
          tickets_handled: member._count.id,
          // Additional metrics would go here
        })),
        timeframe
      }
    });
  } catch (error) {
    logger.error('Error fetching team performance analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch team performance analytics',
      message: error.message 
    });
  }
});

export default router;