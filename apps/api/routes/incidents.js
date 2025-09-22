import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createIncidentSchema = z.object({
  short_description: z.string().min(1).max(160),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string(),
  subcategory: z.string().optional(),
  caller_id: z.string().optional(),
  location: z.string().optional(),
  business_service: z.string().optional(),
});

const updateIncidentSchema = z.object({
  state: z.enum(['NEW', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigned_to_id: z.string().optional(),
  resolution_notes: z.string().optional(),
  close_code: z.string().optional(),
  resolved_at: z.string().datetime().optional(),
});

// GET /api/v1/incidents - List incidents
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      state, 
      priority, 
      urgency,
      impact,
      category,
      assigned_to,
      caller,
      search 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Apply filters
    if (state) where.state = state;
    if (priority) where.priority = priority;
    if (urgency) where.urgency = urgency;
    if (impact) where.impact = impact;
    if (category) where.category = category;
    if (assigned_to) where.assigned_to_id = assigned_to;
    if (caller) where.caller_id = caller;
    if (search) {
      where.OR = [
        { short_description: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          caller: {
            select: { id: true, email: true, first_name: true, last_name: true }
          },
          assigned_to: {
            select: { id: true, email: true, first_name: true, last_name: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { created_at: 'desc' }
        ],
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.incident.count({ where })
    ]);

    res.json({
      success: true,
      data: incidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching incidents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch incidents',
      message: error.message 
    });
  }
});

// GET /api/v1/incidents/stats - Get incident statistics
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const [
      totalIncidents,
      openIncidents,
      criticalIncidents,
      avgResolutionTime
    ] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({
        where: { state: { in: ['NEW', 'IN_PROGRESS', 'ON_HOLD'] } }
      }),
      prisma.incident.count({
        where: { 
          priority: 'CRITICAL',
          state: { in: ['NEW', 'IN_PROGRESS', 'ON_HOLD'] }
        }
      }),
      prisma.incident.aggregate({
        where: { 
          resolved_at: { not: null },
          state: 'RESOLVED'
        },
        _avg: {
          resolution_time_hours: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalIncidents,
        open: openIncidents,
        critical: criticalIncidents,
        avgResolutionTimeHours: avgResolutionTime._avg.resolution_time_hours || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching incident stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch incident statistics',
      message: error.message 
    });
  }
});

// GET /api/v1/incidents/:id - Get incident by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        caller: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        assigned_to: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        work_notes: {
          include: {
            created_by: {
              select: { id: true, email: true, first_name: true, last_name: true }
            }
          },
          orderBy: { created_at: 'desc' }
        },
        related_changes: true,
        related_problems: true
      }
    });

    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found' 
      });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    logger.error('Error fetching incident:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch incident',
      message: error.message 
    });
  }
});

// POST /api/v1/incidents - Create new incident
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const validatedData = createIncidentSchema.parse(req.body);
    const userId = req.user.id;

    // Generate incident number
    const count = await prisma.incident.count();
    const number = `INC${String(count + 1).padStart(7, '0')}`;

    // Calculate priority based on urgency and impact matrix
    const priorityMatrix = {
      'CRITICAL-CRITICAL': 'CRITICAL',
      'CRITICAL-HIGH': 'CRITICAL', 
      'CRITICAL-MEDIUM': 'HIGH',
      'CRITICAL-LOW': 'MEDIUM',
      'HIGH-CRITICAL': 'CRITICAL',
      'HIGH-HIGH': 'HIGH',
      'HIGH-MEDIUM': 'MEDIUM',
      'HIGH-LOW': 'LOW',
      'MEDIUM-CRITICAL': 'HIGH',
      'MEDIUM-HIGH': 'MEDIUM',
      'MEDIUM-MEDIUM': 'MEDIUM',
      'MEDIUM-LOW': 'LOW',
      'LOW-CRITICAL': 'MEDIUM',
      'LOW-HIGH': 'LOW',
      'LOW-MEDIUM': 'LOW',
      'LOW-LOW': 'LOW'
    };

    const calculatedPriority = priorityMatrix[`${validatedData.urgency}-${validatedData.impact}`] || 'MEDIUM';

    const incident = await prisma.incident.create({
      data: {
        ...validatedData,
        number,
        caller_id: validatedData.caller_id || userId,
        priority: calculatedPriority,
        state: 'NEW',
        opened_at: new Date(),
        opened_by_id: userId
      },
      include: {
        caller: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Incident created: ${number} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: incident,
      message: 'Incident created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error creating incident:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create incident',
      message: error.message 
    });
  }
});

// PUT /api/v1/incidents/:id - Update incident
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const validatedData = updateIncidentSchema.parse(req.body);
    const userId = req.user.id;

    const existingIncident = await prisma.incident.findUnique({
      where: { id: req.params.id }
    });

    if (!existingIncident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found' 
      });
    }

    // Calculate resolution time if being resolved
    const updateData = { ...validatedData, updated_by_id: userId };
    if (validatedData.state === 'RESOLVED' && !existingIncident.resolved_at) {
      updateData.resolved_at = new Date();
      const resolutionTimeMs = new Date() - new Date(existingIncident.opened_at);
      updateData.resolution_time_hours = Math.round(resolutionTimeMs / (1000 * 60 * 60) * 100) / 100;
    }

    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        caller: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        assigned_to: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Incident updated: ${incident.number} by user ${userId}`);

    res.json({
      success: true,
      data: incident,
      message: 'Incident updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error updating incident:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update incident',
      message: error.message 
    });
  }
});

// DELETE /api/v1/incidents/:id - Delete incident (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // Check if user has admin role
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const existingIncident = await prisma.incident.findUnique({
      where: { id: req.params.id }
    });

    if (!existingIncident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found' 
      });
    }

    await prisma.incident.delete({
      where: { id: req.params.id }
    });

    logger.info(`Incident deleted: ${existingIncident.number} by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting incident:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete incident',
      message: error.message 
    });
  }
});

export default router;