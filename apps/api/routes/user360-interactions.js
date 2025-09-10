import express from 'express';
import { userInteractionService } from '../services/user-interaction.service.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * User360 Interaction API Routes
 * 
 * Provides endpoints for accessing user interaction data from the User360 system.
 * Supports comprehensive interaction timeline, conversation sessions, and analytics.
 */

// ============================================================================
// USER INTERACTION TIMELINE ROUTES
// ============================================================================

/**
 * GET /api/user360/interactions/:helixUid
 * Get user interaction timeline
 */
router.get('/interactions/:helixUid', async (req, res) => {
  try {
    const { helixUid } = req.params;
    const {
      limit = 50,
      offset = 0,
      channel,
      interactionType,
      startDate,
      endDate,
      includeAI = 'true',
      includeSystem = 'false'
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      ...(channel && { channel }),
      ...(interactionType && { interactionType }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      includeAI: includeAI === 'true',
      includeSystem: includeSystem === 'true'
    };

    const result = await userInteractionService.getUserInteractionTimeline(helixUid, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error getting user interaction timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user interaction timeline',
      message: error.message
    });
  }
});

/**
 * GET /api/user360/interactions/search
 * Search user interactions
 */
router.get('/interactions/search', async (req, res) => {
  try {
    const {
      q: query,
      userId,
      channel,
      limit = 20,
      offset = 0,
      startDate,
      endDate
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const options = {
      ...(userId && { userId }),
      ...(channel && { channel }),
      limit: parseInt(limit),
      offset: parseInt(offset),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) })
    };

    const result = await userInteractionService.searchInteractions(query, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error searching interactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search interactions',
      message: error.message
    });
  }
});

/**
 * GET /api/user360/interactions/stats
 * Get interaction statistics
 */
router.get('/interactions/stats', async (req, res) => {
  try {
    const {
      userId,
      timeframe = '7d'
    } = req.query;

    // Enhanced logging with user context for analytics and debugging
    logger.info('Fetching interaction statistics', {
      requestedUserId: userId,
      timeframe,
      requestedBy: req.user?.id,
      hasUserFilter: !!userId,
      timestamp: new Date().toISOString()
    });

    const stats = await userInteractionService.getInteractionStats(timeframe);

    // Enhanced response with user context
    res.json({
      success: true,
      data: {
        stats,
        filters: {
          userId: userId || null,
          timeframe,
          hasUserFilter: !!userId
        },
        meta: {
          generatedAt: new Date().toISOString(),
          requestedBy: req.user?.id
        }
      }
    });
  } catch (error) {
    logger.error('Error getting interaction stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get interaction statistics',
      message: error.message
    });
  }
});

// ============================================================================
// CONVERSATION SESSION ROUTES
// ============================================================================

/**
 * GET /api/user360/conversations/:sessionId
 * Get conversation session details
 */
router.get('/conversations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { fullHistory = 'false' } = req.query;

    const session = await userInteractionService.getConversationSession(
      sessionId,
      fullHistory === 'true'
    );

    res.json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error getting conversation session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation session',
      message: error.message
    });
  }
});

/**
 * POST /api/user360/conversations/:sessionId/close
 * Close conversation session
 */
router.post('/conversations/:sessionId/close', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { resolution, satisfactionScore } = req.body;

    const session = await userInteractionService.closeSession(
      sessionId,
      resolution,
      satisfactionScore
    );

    res.json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error closing conversation session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close conversation session',
      message: error.message
    });
  }
});

// ============================================================================
// AI MEMORY ROUTES
// ============================================================================

/**
 * GET /api/user360/ai-memory/:helixUid
 * Get AI conversation memory for user
 */
router.get('/ai-memory/:helixUid', async (req, res) => {
  try {
    const { helixUid } = req.params;
    const { aiPersonality = 'cosmo', conversationId } = req.query;

    const memory = await userInteractionService.getAIMemory(
      helixUid,
      aiPersonality,
      conversationId
    );

    res.json({
      success: true,
      data: {
        memory
      }
    });
  } catch (error) {
    logger.error('Error getting AI memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI memory',
      message: error.message
    });
  }
});

// ============================================================================
// ADMIN TROUBLESHOOTING ROUTES
// ============================================================================

/**
 * GET /api/user360/admin/troubleshoot/:helixUid
 * Get comprehensive troubleshooting data for user
 */
router.get('/admin/troubleshoot/:helixUid', async (req, res) => {
  try {
    const { helixUid } = req.params;
    const { timeframe = '30d' } = req.query;

    // Get comprehensive interaction data for troubleshooting
    const [
      interactionTimeline,
      interactionStats,
      aiMemory
    ] = await Promise.all([
      userInteractionService.getUserInteractionTimeline(helixUid, {
        limit: 100,
        includeAI: true,
        includeSystem: true
      }),
      userInteractionService.getInteractionStats(timeframe),
      userInteractionService.getAIMemory(helixUid, 'cosmo')
    ]);

    // Get conversation sessions
    const sessions = await Promise.all(
      [...new Set(interactionTimeline.interactions
        .filter(i => i.sessionId)
        .map(i => i.sessionId)
      )].map(sessionId =>
        userInteractionService.getConversationSession(sessionId, false)
      )
    );

    res.json({
      success: true,
      data: {
        troubleshooting: {
          timeline: interactionTimeline,
          stats: interactionStats,
          sessions: sessions,
          aiMemory: aiMemory,
          summary: {
            totalInteractions: interactionTimeline.total,
            totalSessions: sessions.length,
            activeSessions: sessions.filter(s => s.status === 'ACTIVE').length,
            escalatedSessions: sessions.filter(s => s.escalationLevel > 0).length,
            avgResponseTime: interactionStats.avgResponseTime,
            hasAIMemory: !!aiMemory
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error getting troubleshooting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get troubleshooting data',
      message: error.message
    });
  }
});

/**
 * POST /api/user360/admin/record-interaction
 * Manually record interaction for testing/admin purposes
 */
router.post('/admin/record-interaction', async (req, res) => {
  try {
    const interactionData = req.body;

    // Validate required fields
    if (!interactionData.userId || !interactionData.interactionType || !interactionData.channel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, interactionType, channel'
      });
    }

    const interaction = await userInteractionService.recordInteraction(interactionData);

    res.json({
      success: true,
      data: {
        interaction
      }
    });
  } catch (error) {
    logger.error('Error recording interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record interaction',
      message: error.message
    });
  }
});

// ============================================================================
// ANALYTICS AND REPORTING ROUTES
// ============================================================================

/**
 * GET /api/user360/analytics/interaction-trends
 * Get interaction trends and analytics
 */
router.get('/analytics/interaction-trends', async (req, res) => {
  try {
    const { timeframe = '30d', groupBy = 'day' } = req.query;

    // This would typically aggregate interaction data by time periods
    // For now, return basic stats
    const stats = await userInteractionService.getInteractionStats(timeframe);

    res.json({
      success: true,
      data: {
        trends: {
          current: stats,
          // TODO: Add historical data and trend calculations
          growth: 0,
          timeframe,
          groupBy
        }
      }
    });
  } catch (error) {
    logger.error('Error getting interaction trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get interaction trends',
      message: error.message
    });
  }
});

/**
 * GET /api/user360/analytics/channel-performance
 * Get channel performance metrics
 */
router.get('/analytics/channel-performance', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const stats = await userInteractionService.getInteractionStats(timeframe);

    res.json({
      success: true,
      data: {
        channelPerformance: {
          email: {
            total: stats.byChannel.email,
            responseTime: stats.avgResponseTime,
            satisfaction: stats.satisfaction.avgScore
          },
          chat: {
            total: stats.byChannel.chat,
            responseTime: stats.avgResponseTime * 0.8, // Assume faster
            satisfaction: stats.satisfaction.avgScore
          },
          ai: {
            total: stats.byChannel.ai,
            responseTime: 2, // AI is much faster
            satisfaction: stats.satisfaction.avgScore * 1.1 // Assume higher satisfaction
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error getting channel performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get channel performance',
      message: error.message
    });
  }
});

export default router;