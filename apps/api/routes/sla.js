import express from 'express';
import { SLAService } from '../services/sla.service.js';
import { SLAMatrixService } from '../services/sla-matrix.service.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * Enhanced SLA Management API Routes
 * Provides industry-standard Impact vs Urgency matrix calculations
 */

/**
 * GET /api/sla/calculate
 * Calculate SLA for a ticket using Impact vs Urgency matrix
 */
router.post('/calculate', async (req, res) => {
  try {
    const ticketData = req.body;
    
    if (!ticketData.title && !ticketData.description) {
      return res.status(400).json({
        error: 'Title or description is required for SLA calculation'
      });
    }

    const slaCalculation = SLAMatrixService.calculateTicketSLA(ticketData);
    
    res.json({
      success: true,
      data: slaCalculation,
      message: 'SLA calculated successfully using Impact vs Urgency matrix'
    });
  } catch (error) {
    logger.error('Error calculating SLA:', error);
    res.status(500).json({
      error: 'Failed to calculate SLA',
      details: error.message
    });
  }
});

/**
 * GET /api/sla/recommendations
 * Get SLA recommendations for a ticket
 */
router.post('/recommendations', async (req, res) => {
  try {
    const ticketData = req.body;
    
    const recommendations = await SLAService.getSLARecommendations(ticketData);
    
    res.json({
      success: true,
      data: recommendations,
      message: 'SLA recommendations generated successfully'
    });
  } catch (error) {
    logger.error('Error getting SLA recommendations:', error);
    res.status(500).json({
      error: 'Failed to get SLA recommendations',
      details: error.message
    });
  }
});

/**
 * GET /api/sla/matrix
 * Get the current priority matrix configuration
 */
router.get('/matrix', async (req, res) => {
  try {
    const matrix = SLAMatrixService.DEFAULT_PRIORITY_MATRIX;
    
    res.json({
      success: true,
      data: {
        matrix: matrix.matrix,
        impactLevels: matrix.impactLevels,
        urgencyLevels: matrix.urgencyLevels,
        priorityLevels: matrix.priorityLevels
      },
      message: 'Priority matrix retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting priority matrix:', error);
    res.status(500).json({
      error: 'Failed to get priority matrix',
      details: error.message
    });
  }
});

/**
 * GET /api/sla/templates
 * Get available SLA policy templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = SLAMatrixService.DEFAULT_SLA_TEMPLATES;
    
    res.json({
      success: true,
      data: templates,
      message: 'SLA templates retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting SLA templates:', error);
    res.status(500).json({
      error: 'Failed to get SLA templates',
      details: error.message
    });
  }
});

/**
 * POST /api/sla/policies/create-standard
 * Create standard SLA policies from templates
 */
router.post('/policies/create-standard', async (req, res) => {
  try {
    const createdPolicies = await SLAService.createStandardSLAPolicies();
    
    res.json({
      success: true,
      data: {
        createdPolicies: createdPolicies.length,
        policies: createdPolicies
      },
      message: `Created ${createdPolicies.length} standard SLA policies`
    });
  } catch (error) {
    logger.error('Error creating standard SLA policies:', error);
    res.status(500).json({
      error: 'Failed to create standard SLA policies',
      details: error.message
    });
  }
});

/**
 * GET /api/sla/dashboard
 * Get SLA compliance dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      slaId: req.query.slaId,
      priority: req.query.priority,
      category: req.query.category
    };

    const dashboardData = await SLAService.getSLADashboardData(filters);
    
    res.json({
      success: true,
      data: dashboardData,
      message: 'SLA dashboard data retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting SLA dashboard data:', error);
    res.status(500).json({
      error: 'Failed to get SLA dashboard data',
      details: error.message
    });
  }
});

/**
 * POST /api/sla/matrix/validate
 * Validate a custom priority matrix configuration
 */
router.post('/matrix/validate', async (req, res) => {
  try {
    const customMatrix = req.body;
    
    const isValid = SLAMatrixService.validateMatrix(customMatrix);
    
    if (isValid) {
      res.json({
        success: true,
        data: { valid: true },
        message: 'Custom matrix configuration is valid'
      });
    } else {
      res.status(400).json({
        success: false,
        data: { valid: false },
        message: 'Custom matrix configuration is invalid'
      });
    }
  } catch (error) {
    logger.error('Error validating custom matrix:', error);
    res.status(500).json({
      error: 'Failed to validate custom matrix',
      details: error.message
    });
  }
});

/**
 * POST /api/sla/impact/analyze
 * Analyze impact level for given ticket data
 */
router.post('/impact/analyze', async (req, res) => {
  try {
    const ticketData = req.body;
    
    const impact = SLAMatrixService.analyzeImpact(ticketData);
    const impactLabel = SLAMatrixService.getImpactLabel(impact);
    
    res.json({
      success: true,
      data: {
        impact,
        impactLabel,
        factors: {
          title: ticketData.title,
          description: ticketData.description,
          affectedUsers: ticketData.affectedUsers,
          businessService: ticketData.businessService,
          severity: ticketData.severity
        }
      },
      message: 'Impact analysis completed successfully'
    });
  } catch (error) {
    logger.error('Error analyzing impact:', error);
    res.status(500).json({
      error: 'Failed to analyze impact',
      details: error.message
    });
  }
});

/**
 * POST /api/sla/urgency/analyze
 * Analyze urgency level for given ticket data
 */
router.post('/urgency/analyze', async (req, res) => {
  try {
    const ticketData = req.body;
    
    const urgency = SLAMatrixService.analyzeUrgency(ticketData);
    const urgencyLabel = SLAMatrixService.getUrgencyLabel(urgency);
    
    res.json({
      success: true,
      data: {
        urgency,
        urgencyLabel,
        factors: {
          title: ticketData.title,
          description: ticketData.description,
          isVip: ticketData.isVip,
          vipLevel: ticketData.vipLevel,
          dueDate: ticketData.dueDate,
          businessHours: ticketData.businessHours,
          explicitUrgency: ticketData.urgency
        }
      },
      message: 'Urgency analysis completed successfully'
    });
  } catch (error) {
    logger.error('Error analyzing urgency:', error);
    res.status(500).json({
      error: 'Failed to analyze urgency',
      details: error.message
    });
  }
});

/**
 * POST /api/sla/vip/identification
 * Get VIP identification information for agents
 */
router.post('/vip/identification', async (req, res) => {
  try {
    const ticketData = req.body;
    
    const vipInfo = SLAMatrixService.getVipIdentification(ticketData);
    
    res.json({
      success: true,
      data: vipInfo,
      message: 'VIP identification retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting VIP identification:', error);
    res.status(500).json({
      error: 'Failed to get VIP identification',
      details: error.message
    });
  }
});

/**
 * POST /api/sla/priority/boost
 * Calculate priority boost for VIP users
 */
router.post('/priority/boost', async (req, res) => {
  try {
    const { basePriority, isVip, vipLevel } = req.body;
    
    if (basePriority === undefined) {
      return res.status(400).json({
        error: 'basePriority is required'
      });
    }
    
    const boostResult = SLAMatrixService.applyVipPriorityBoost(basePriority, isVip, vipLevel);
    
    res.json({
      success: true,
      data: {
        ...boostResult,
        basePriorityLabel: SLAMatrixService.getPriorityLabel(basePriority),
        finalPriorityLabel: SLAMatrixService.getPriorityLabel(boostResult.finalPriority)
      },
      message: 'VIP priority boost calculated successfully'
    });
  } catch (error) {
    logger.error('Error calculating VIP priority boost:', error);
    res.status(500).json({
      error: 'Failed to calculate VIP priority boost',
      details: error.message
    });
  }
});

export default router;