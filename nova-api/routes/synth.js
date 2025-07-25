// nova-api/routes/synth.js
// Nova Synth - AI Engine Routes
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
 *     AIInsight:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [ticket_suggestion, resolution_recommendation, pattern_detection, resource_optimization]
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *         relevantTickets:
 *           type: array
 *           items:
 *             type: string
 *         actionable:
 *           type: boolean
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/synth/analyze/ticket/{ticketId}:
 *   post:
 *     summary: Analyze ticket with AI
 *     description: Analyze a ticket using AI to provide insights and suggestions
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID to analyze
 *     responses:
 *       200:
 *         description: AI analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     suggestedCategory:
 *                       type: string
 *                     suggestedPriority:
 *                       type: string
 *                     estimatedResolutionTime:
 *                       type: integer
 *                     similarTickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ticketId:
 *                             type: string
 *                           similarity:
 *                             type: number
 *                           resolution:
 *                             type: string
 *                     recommendedActions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     knowledgeBaseRecommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           kbId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           relevance:
 *                             type: number
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 */
router.post('/analyze/ticket/:ticketId',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 analyses per 15 minutes
  async (req, res) => {
    try {
      const { ticketId } = req.params;

      // Check if ticket exists
      db.get('SELECT * FROM tickets WHERE ticket_id = ? AND deleted_at IS NULL', [ticketId], async (err, ticket) => {
        if (err) {
          logger.error('Error fetching ticket for analysis:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to analyze ticket',
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

        // Simulate AI analysis (in production, this would call actual AI services)
        const analysis = await performTicketAnalysis(ticket);

        // Store analysis results
        const analysisId = require('uuid').v4();
        db.run(
          'INSERT INTO ai_analyses (id, ticket_id, analysis_type, results, confidence, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [analysisId, ticketId, 'ticket_analysis', JSON.stringify(analysis), analysis.confidence || 0.8, new Date().toISOString()],
          (insertErr) => {
            if (insertErr) {
              logger.error('Error storing AI analysis:', insertErr);
            }
          }
        );

        res.json({
          success: true,
          analysis
        });
      });
    } catch (error) {
      logger.error('Error in ticket analysis endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze ticket',
        errorCode: 'ANALYSIS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/insights:
 *   get:
 *     summary: Get AI insights
 *     description: Returns AI-generated insights about tickets, patterns, and system performance
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ticket_suggestion, resolution_recommendation, pattern_detection, resource_optimization]
 *         description: Filter by insight type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of insights to return
 *     responses:
 *       200:
 *         description: List of AI insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 insights:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIInsight'
 *       401:
 *         description: Unauthorized
 */
router.get('/insights',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const { type, limit = 20 } = req.query;

      // Generate or retrieve AI insights
      const insights = await generateAIInsights(type, parseInt(limit));

      res.json({
        success: true,
        insights
      });
    } catch (error) {
      logger.error('Error in insights endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch insights',
        errorCode: 'INSIGHTS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/predict/workload:
 *   get:
 *     summary: Predict workload
 *     description: Predict future ticket workload using AI
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: weekly
 *         description: Prediction period
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Workload prediction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 prediction:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                     confidence:
 *                       type: number
 *                     expectedTickets:
 *                       type: integer
 *                     peakDays:
 *                       type: array
 *                       items:
 *                         type: string
 *                     categoryBreakdown:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     recommendedStaffing:
 *                       type: object
 *                       properties:
 *                         currentStaff:
 *                           type: integer
 *                         recommendedStaff:
 *                           type: integer
 *                         justification:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/predict/workload',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30), // 30 predictions per 15 minutes
  async (req, res) => {
    try {
      const { period = 'weekly', department } = req.query;

      // Get historical data
      db.all(`
        SELECT 
          DATE(created_at) as date,
          category,
          COUNT(*) as count,
          AVG(JULIANDAY(COALESCE(resolved_at, datetime('now'))) - JULIANDAY(created_at)) * 24 as avg_resolution_hours
        FROM tickets 
        WHERE created_at >= datetime('now', '-30 days')
        ${department ? 'AND department = ?' : ''}
        GROUP BY DATE(created_at), category
        ORDER BY date DESC
      `, department ? [department] : [], async (err, historicalData) => {
        if (err) {
          logger.error('Error fetching historical data:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to generate workload prediction',
            errorCode: 'HISTORICAL_DATA_ERROR'
          });
        }

        // Generate prediction based on historical data
        const prediction = await generateWorkloadPrediction(historicalData, period, department);

        res.json({
          success: true,
          prediction
        });
      });
    } catch (error) {
      logger.error('Error in workload prediction endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate workload prediction',
        errorCode: 'PREDICTION_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/optimize/assignment:
 *   post:
 *     summary: Get optimal ticket assignment
 *     description: Use AI to determine the best technician for a ticket assignment
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *             properties:
 *               ticketId:
 *                 type: string
 *               availableTechnicians:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of technician user IDs
 *     responses:
 *       200:
 *         description: Optimal assignment recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 recommendation:
 *                   type: object
 *                   properties:
 *                     recommendedTechnician:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         score:
 *                           type: number
 *                         reasoning:
 *                           type: string
 *                     alternatives:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           score:
 *                             type: number
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 */
router.post('/optimize/assignment',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 optimizations per 15 minutes
  [
    body('ticketId').isString().withMessage('Ticket ID is required'),
    body('availableTechnicians').optional().isArray().withMessage('Available technicians must be an array')
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

      const { ticketId, availableTechnicians } = req.body;

      // Get ticket details
      db.get('SELECT * FROM tickets WHERE ticket_id = ? AND deleted_at IS NULL', [ticketId], async (err, ticket) => {
        if (err) {
          logger.error('Error fetching ticket for assignment optimization:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to optimize assignment',
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

        // Get technician data
        let technicianQuery = `
          SELECT u.id, u.name, u.email,
                 COUNT(t.id) as current_tickets,
                 AVG(t.actual_time_minutes) as avg_resolution_time,
                 STRING_AGG(DISTINCT t.category, ',') as categories_handled
          FROM users u
          LEFT JOIN tickets t ON u.id = t.assigned_to_id AND t.status IN ('open', 'in_progress')
          WHERE u.role = 'technician' AND u.active = 1
        `;
        
        const params = [];
        if (availableTechnicians && availableTechnicians.length > 0) {
          const placeholders = availableTechnicians.map(() => '?').join(',');
          technicianQuery += ` AND u.id IN (${placeholders})`;
          params.push(...availableTechnicians);
        }
        
        technicianQuery += ' GROUP BY u.id, u.name, u.email';

        db.all(technicianQuery, params, async (techErr, technicians) => {
          if (techErr) {
            logger.error('Error fetching technicians:', techErr);
            return res.status(500).json({
              success: false,
              error: 'Failed to optimize assignment',
              errorCode: 'TECHNICIANS_FETCH_ERROR'
            });
          }

          // Generate assignment recommendation
          const recommendation = await optimizeAssignment(ticket, technicians);

          res.json({
            success: true,
            recommendation
          });
        });
      });
    } catch (error) {
      logger.error('Error in assignment optimization endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to optimize assignment',
        errorCode: 'OPTIMIZATION_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/synth/patterns:
 *   get:
 *     summary: Detect patterns in tickets
 *     description: Use AI to detect patterns and trends in ticket data
 *     tags: [Synth - AI Engine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Timeframe for pattern detection
 *     responses:
 *       200:
 *         description: Detected patterns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 patterns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       impact:
 *                         type: string
 *                         enum: [low, medium, high]
 *                       recommendation:
 *                         type: string
 *                       relatedTickets:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/patterns',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 pattern detections per 15 minutes
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;

      // Convert timeframe to days
      const days = parseInt(timeframe.replace('d', ''));

      // Get ticket data for pattern analysis
      db.all(`
        SELECT 
          category,
          subcategory,
          priority,
          status,
          location,
          DATE(created_at) as date,
          STRFTIME('%H', created_at) as hour,
          STRFTIME('%w', created_at) as day_of_week,
          description,
          title
        FROM tickets 
        WHERE created_at >= datetime('now', '-${days} days')
        AND deleted_at IS NULL
        ORDER BY created_at DESC
      `, [], async (err, tickets) => {
        if (err) {
          logger.error('Error fetching tickets for pattern detection:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to detect patterns',
            errorCode: 'PATTERN_DATA_ERROR'
          });
        }

        // Analyze patterns
        const patterns = await detectPatterns(tickets, timeframe);

        res.json({
          success: true,
          patterns
        });
      });
    } catch (error) {
      logger.error('Error in pattern detection endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to detect patterns',
        errorCode: 'PATTERN_ERROR'
      });
    }
  }
);

// Helper functions for AI processing (simulated)

async function performTicketAnalysis(ticket) {
  // Simulate AI analysis
  const keywords = ticket.description.toLowerCase().split(' ');
  
  // Simulate category suggestion based on keywords
  let suggestedCategory = ticket.category;
  let suggestedPriority = ticket.priority;
  
  if (keywords.includes('urgent') || keywords.includes('critical') || keywords.includes('down')) {
    suggestedPriority = 'high';
  }
  
  if (keywords.includes('password') || keywords.includes('login')) {
    suggestedCategory = 'Account & Access';
  } else if (keywords.includes('printer') || keywords.includes('hardware')) {
    suggestedCategory = 'Hardware';
  } else if (keywords.includes('software') || keywords.includes('application')) {
    suggestedCategory = 'Software';
  }

  return {
    suggestedCategory,
    suggestedPriority,
    estimatedResolutionTime: suggestedPriority === 'high' ? 240 : 480, // minutes
    similarTickets: [
      { ticketId: 'TKT-00123', similarity: 0.85, resolution: 'Password reset via admin portal' },
      { ticketId: 'TKT-00098', similarity: 0.72, resolution: 'Account unlocked after security verification' }
    ],
    recommendedActions: [
      'Check user account status',
      'Verify user identity',
      'Reset password if needed',
      'Test account access'
    ],
    knowledgeBaseRecommendations: [
      { kbId: 'KB-00001', title: 'Password Reset Procedures', relevance: 0.95 },
      { kbId: 'KB-00045', title: 'Account Lockout Troubleshooting', relevance: 0.78 }
    ],
    confidence: 0.82
  };
}

async function generateAIInsights(type, limit) {
  // Simulate AI-generated insights
  const insights = [
    {
      id: require('uuid').v4(),
      type: 'pattern_detection',
      title: 'Recurring Network Issues on Fridays',
      description: 'Pattern detected: Network connectivity issues spike by 40% on Friday afternoons',
      confidence: 0.89,
      relevantTickets: ['TKT-00234', 'TKT-00256', 'TKT-00278'],
      actionable: true,
      metadata: {
        frequency: 'weekly',
        impact: 'medium',
        affectedUsers: 45
      },
      createdAt: new Date().toISOString()
    },
    {
      id: require('uuid').v4(),
      type: 'resource_optimization',
      title: 'Technician Workload Imbalance',
      description: 'AI detected workload imbalance: Tech A has 15 tickets, Tech B has 3 tickets',
      confidence: 0.95,
      relevantTickets: [],
      actionable: true,
      metadata: {
        suggestion: 'redistribute_workload',
        efficiency_gain: '23%'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: require('uuid').v4(),
      type: 'resolution_recommendation',
      title: 'Knowledge Base Gap Identified',
      description: 'Frequent tickets about VPN setup suggest missing KB article',
      confidence: 0.76,
      relevantTickets: ['TKT-00301', 'TKT-00315', 'TKT-00332'],
      actionable: true,
      metadata: {
        topic: 'VPN Setup',
        frequency: 8,
        avg_resolution_time: 45
      },
      createdAt: new Date().toISOString()
    }
  ];

  if (type) {
    return insights.filter(insight => insight.type === type).slice(0, limit);
  }

  return insights.slice(0, limit);
}

async function generateWorkloadPrediction(historicalData, period, department) {
  // Simulate workload prediction based on historical data
  const avgTicketsPerDay = historicalData.length > 0 ? 
    historicalData.reduce((sum, d) => sum + d.count, 0) / historicalData.length : 10;

  const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  const expectedTickets = Math.round(avgTicketsPerDay * multiplier * 1.1); // 10% growth assumption

  return {
    period,
    confidence: 0.78,
    expectedTickets,
    peakDays: period === 'weekly' ? ['Monday', 'Wednesday'] : ['Monday', 'Tuesday', 'Wednesday'],
    categoryBreakdown: {
      'Hardware': Math.round(expectedTickets * 0.3),
      'Software': Math.round(expectedTickets * 0.25),
      'Network': Math.round(expectedTickets * 0.2),
      'Account & Access': Math.round(expectedTickets * 0.15),
      'Other': Math.round(expectedTickets * 0.1)
    },
    recommendedStaffing: {
      currentStaff: 5,
      recommendedStaff: expectedTickets > 50 ? 6 : 5,
      justification: expectedTickets > 50 ? 
        'Predicted workload increase requires additional technician' : 
        'Current staffing adequate for predicted workload'
    }
  };
}

async function optimizeAssignment(ticket, technicians) {
  // Simulate AI assignment optimization
  const scores = technicians.map(tech => {
    let score = 100;
    
    // Reduce score based on current workload
    score -= (tech.current_tickets || 0) * 10;
    
    // Boost score if technician has handled this category before
    if (tech.categories_handled && tech.categories_handled.includes(ticket.category)) {
      score += 20;
    }
    
    // Adjust for average resolution time (lower is better)
    if (tech.avg_resolution_time) {
      score -= (tech.avg_resolution_time / 60) * 2; // penalty for longer resolution times
    }
    
    return {
      id: tech.id,
      name: tech.name,
      score: Math.max(0, Math.min(100, score)),
      currentWorkload: tech.current_tickets || 0,
      expertise: tech.categories_handled ? tech.categories_handled.split(',') : []
    };
  });

  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const reasoning = `Recommended based on: ${best.currentWorkload < 5 ? 'low workload, ' : ''}${best.expertise.includes(ticket.category) ? 'category expertise, ' : ''}optimal balance of availability and skills`;

  return {
    recommendedTechnician: {
      id: best.id,
      name: best.name,
      score: best.score,
      reasoning
    },
    alternatives: scores.slice(1, 3).map(tech => ({
      id: tech.id,
      name: tech.name,
      score: tech.score
    }))
  };
}

async function detectPatterns(tickets, timeframe) {
  // Simulate pattern detection
  const patterns = [];

  // Time-based patterns
  const hourCounts = {};
  const dayOfWeekCounts = {};
  const categoryLocationCounts = {};

  tickets.forEach(ticket => {
    // Hour patterns
    hourCounts[ticket.hour] = (hourCounts[ticket.hour] || 0) + 1;
    
    // Day of week patterns
    dayOfWeekCounts[ticket.day_of_week] = (dayOfWeekCounts[ticket.day_of_week] || 0) + 1;
    
    // Category-location patterns
    const key = `${ticket.category}-${ticket.location}`;
    categoryLocationCounts[key] = (categoryLocationCounts[key] || 0) + 1;
  });

  // Find peak hour
  const peakHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
  if (hourCounts[peakHour] > tickets.length * 0.2) {
    patterns.push({
      type: 'temporal',
      description: `Peak ticket volume occurs at ${peakHour}:00`,
      frequency: 'daily',
      impact: 'medium',
      recommendation: 'Consider staffing adjustments during peak hours',
      relatedTickets: tickets.filter(t => t.hour === peakHour).slice(0, 5).map(t => t.id || 'TKT-XXXX')
    });
  }

  // Find problematic location-category combinations
  Object.entries(categoryLocationCounts).forEach(([key, count]) => {
    if (count > 3) {
      const [category, location] = key.split('-');
      patterns.push({
        type: 'location_category',
        description: `High frequency of ${category} issues in ${location}`,
        frequency: `${count} times in ${timeframe}`,
        impact: count > 10 ? 'high' : count > 5 ? 'medium' : 'low',
        recommendation: `Investigate infrastructure or training needs for ${category} in ${location}`,
        relatedTickets: tickets.filter(t => t.category === category && t.location === location).slice(0, 5).map(t => t.id || 'TKT-XXXX')
      });
    }
  });

  return patterns;
}

export default router;
