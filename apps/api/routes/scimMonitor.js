// nova-api/routes/scimMonitor.js
// SCIM Monitoring and Logging Routes
import express from 'express';
import { PrismaClient } from '../../../prisma/generated/core/index.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiter for SCIM monitoring endpoints
const scimMonitorRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many SCIM monitoring requests from this IP, please try again later.',
  },
});

/**
 * @swagger
 * /api/scim/monitor/logs:
 *   get:
 *     summary: Get SCIM provisioning logs
 *     description: Retrieve SCIM operation logs with filtering and pagination
 *     tags: [SCIM Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: operation
 *         schema:
 *           type: string
 *           enum: [create, update, delete, get, list]
 *         description: Filter by SCIM operation type
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type (e.g., user, group)
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: integer
 *         description: Filter by HTTP status code
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date onwards
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs up to this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of logs per page
 *     responses:
 *       200:
 *         description: SCIM logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       operation:
 *                         type: string
 *                       entityType:
 *                         type: string
 *                       entityId:
 *                         type: string
 *                       statusCode:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *                       ipAddress:
 *                         type: string
 *                       duration:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.get('/logs', authenticateJWT, scimMonitorRateLimit, async (req, res) => {
  try {
    const {
      operation,
      entityType,
      statusCode,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build where clause for filtering
    const where = {};
    
    if (operation) {
      where.operation = operation;
    }
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (statusCode) {
      where.statusCode = parseInt(statusCode);
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await prisma.scimLog.count({ where });

    // Get logs with pagination
    const logs = await prisma.scimLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum,
      select: {
        id: true,
        operation: true,
        entityType: true,
        entityId: true,
        statusCode: true,
        message: true,
        userAgent: true,
        ipAddress: true,
        duration: true,
        createdAt: true
        // Exclude requestBody and responseBody for security
      }
    });

    const totalPages = Math.ceil(total / limitNum);

    logger.info(`SCIM monitor logs retrieved: ${logs.length} logs for user ${req.user.id}`);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });

  } catch (error) {
    logger.error('Error retrieving SCIM logs:', error);
    res.status(500).json({
      error: 'Failed to retrieve SCIM logs',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/scim/monitor/status:
 *   get:
 *     summary: Get SCIM provisioning status and statistics
 *     description: Retrieve SCIM system status, operation statistics, and health metrics
 *     tags: [SCIM Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *           default: 24h
 *         description: Timeframe for statistics
 *     responses:
 *       200:
 *         description: SCIM status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, error]
 *                 lastActivity:
 *                   type: string
 *                   format: date-time
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalOperations:
 *                       type: integer
 *                     operationsByType:
 *                       type: object
 *                     operationsByStatus:
 *                       type: object
 *                     averageResponseTime:
 *                       type: number
 *                     errorRate:
 *                       type: number
 *                 healthMetrics:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: string
 *                     lastErrorTime:
 *                       type: string
 *                       format: date-time
 *                     recentErrors:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.get('/status', authenticateJWT, scimMonitorRateLimit, async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    // Calculate timeframe in hours
    const timeframeHours = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    };

    const hours = timeframeHours[timeframe] || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Get statistics for the specified timeframe
    const totalOperations = await prisma.scimLog.count({
      where: {
        createdAt: {
          gte: startTime
        }
      }
    });

    // Get operations by type
    const operationsByType = await prisma.scimLog.groupBy({
      by: ['operation'],
      where: {
        createdAt: {
          gte: startTime
        }
      },
      _count: {
        _all: true
      }
    });

    // Get operations by status code ranges
    const operationsByStatus = await prisma.scimLog.groupBy({
      by: ['statusCode'],
      where: {
        createdAt: {
          gte: startTime
        }
      },
      _count: {
        _all: true
      }
    });

    // Calculate average response time
    const avgDuration = await prisma.scimLog.aggregate({
      where: {
        createdAt: {
          gte: startTime
        },
        duration: {
          not: null
        }
      },
      _avg: {
        duration: true
      }
    });

    // Get last activity
    const lastActivity = await prisma.scimLog.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        createdAt: true
      }
    });

    // Count recent errors (4xx and 5xx status codes)
    const recentErrors = await prisma.scimLog.count({
      where: {
        createdAt: {
          gte: startTime
        },
        statusCode: {
          gte: 400
        }
      }
    });

    // Get last error
    const lastError = await prisma.scimLog.findFirst({
      where: {
        statusCode: {
          gte: 400
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        createdAt: true
      }
    });

    // Calculate error rate
    const errorRate = totalOperations > 0 ? (recentErrors / totalOperations) * 100 : 0;

    // Determine system status
    let status = 'healthy';
    if (errorRate > 10) {
      status = 'error';
    } else if (errorRate > 5 || (avgDuration._avg && avgDuration._avg > 5000)) {
      status = 'degraded';
    }

    // Format operations by type
    const operationTypeStats = {};
    operationsByType.forEach(op => {
      operationTypeStats[op.operation] = op._count._all;
    });

    // Format operations by status
    const statusStats = {
      success: 0,
      clientError: 0,
      serverError: 0
    };

    operationsByStatus.forEach(op => {
      const statusCode = op.statusCode;
      const count = op._count._all;
      
      if (statusCode >= 200 && statusCode < 300) {
        statusStats.success += count;
      } else if (statusCode >= 400 && statusCode < 500) {
        statusStats.clientError += count;
      } else if (statusCode >= 500) {
        statusStats.serverError += count;
      }
    });

    const response = {
      status,
      lastActivity: lastActivity?.createdAt || null,
      statistics: {
        totalOperations,
        operationsByType: operationTypeStats,
        operationsByStatus: statusStats,
        averageResponseTime: avgDuration._avg || 0,
        errorRate: Math.round(errorRate * 100) / 100
      },
      healthMetrics: {
        uptime: process.uptime(),
        lastErrorTime: lastError?.createdAt || null,
        recentErrors
      }
    };

    logger.info(`SCIM monitor status retrieved for user ${req.user.id}`);

    res.json(response);

  } catch (error) {
    logger.error('Error retrieving SCIM status:', error);
    res.status(500).json({
      error: 'Failed to retrieve SCIM status',
      message: error.message
    });
  }
});

// Helper function to log SCIM operations (can be used by other SCIM routes)
export async function logScimOperation({
  operation,
  entityType,
  entityId = null,
  statusCode,
  message = null,
  requestBody = null,
  responseBody = null,
  userAgent = null,
  ipAddress = null,
  duration = null
}) {
  try {
    await prisma.scimLog.create({
      data: {
        operation,
        entityType,
        entityId,
        statusCode,
        message,
        requestBody,
        responseBody,
        userAgent,
        ipAddress,
        duration
      }
    });
  } catch (error) {
    logger.error('Failed to log SCIM operation:', error);
  }
}

export default router;
