import express from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import { prisma } from '../db.js';

const router = express.Router();

// Validation schemas
const createChangeSchema = z.object({
  short_description: z.string().min(1).max(160),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string(),
  subcategory: z.string().optional(),
  change_type: z.enum(['STANDARD', 'NORMAL', 'EMERGENCY']).default('NORMAL'),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).default('MEDIUM'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  justification: z.string().optional(),
  implementation_plan: z.string().optional(),
  backout_plan: z.string().optional(),
});

const updateChangeSchema = z.object({
  state: z.enum(['NEW', 'ASSESSMENT', 'AUTHORIZATION', 'SCHEDULED', 'IMPLEMENTATION', 'REVIEW', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigned_to_id: z.string().optional(),
  approval_status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  implementation_notes: z.string().optional(),
  review_notes: z.string().optional(),
});

// GET /api/v1/changes - List changes
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      state, 
      priority, 
      change_type,
      risk_level,
      category,
      assigned_to,
      search 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Apply filters
    if (state) where.state = state;
    if (priority) where.priority = priority;
    if (change_type) where.change_type = change_type;
    if (risk_level) where.risk_level = risk_level;
    if (category) where.category = category;
    if (assigned_to) where.assigned_to_id = assigned_to;
    if (search) {
      where.OR = [
        { short_description: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [changes, total] = await Promise.all([
      prisma.change.findMany({
        where,
        include: {
          requested_by: {
            select: { id: true, email: true, first_name: true, last_name: true }
          },
          assigned_to: {
            select: { id: true, email: true, first_name: true, last_name: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { start_date: 'asc' }
        ],
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.change.count({ where })
    ]);

    res.json({
      success: true,
      data: changes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching changes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch changes',
      message: error.message 
    });
  }
});

// GET /api/v1/changes/:id - Get change by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const change = await prisma.change.findUnique({
      where: { id: req.params.id },
      include: {
        requested_by: {
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
        affected_services: true,
        related_incidents: true
      }
    });

    if (!change) {
      return res.status(404).json({ 
        success: false, 
        error: 'Change not found' 
      });
    }

    res.json({
      success: true,
      data: change
    });
  } catch (error) {
    logger.error('Error fetching change:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch change',
      message: error.message 
    });
  }
});

// POST /api/v1/changes - Create new change
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const validatedData = createChangeSchema.parse(req.body);
    const userId = req.user.id;

    // Validate start/end dates
    const startDate = new Date(validatedData.start_date);
    const endDate = new Date(validatedData.end_date);
    
    if (endDate <= startDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'End date must be after start date' 
      });
    }

    // Generate change number
    const count = await prisma.change.count();
    const number = `CHG${String(count + 1).padStart(7, '0')}`;

    const change = await prisma.change.create({
      data: {
        ...validatedData,
        number,
        requested_by_id: userId,
        state: 'NEW',
        approval_status: 'PENDING'
      },
      include: {
        requested_by: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Change created: ${number} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: change,
      message: 'Change created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error creating change:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create change',
      message: error.message 
    });
  }
});

// PUT /api/v1/changes/:id - Update change
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const validatedData = updateChangeSchema.parse(req.body);
    const userId = req.user.id;

    const existingChange = await prisma.change.findUnique({
      where: { id: req.params.id }
    });

    if (!existingChange) {
      return res.status(404).json({ 
        success: false, 
        error: 'Change not found' 
      });
    }

    const change = await prisma.change.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        updated_by_id: userId
      },
      include: {
        requested_by: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        assigned_to: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Change updated: ${change.number} by user ${userId}`);

    res.json({
      success: true,
      data: change,
      message: 'Change updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error updating change:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update change',
      message: error.message 
    });
  }
});

// POST /api/v1/changes/:id/approve - Approve change
router.post('/:id/approve', authenticateJWT, async (req, res) => {
  try {
    const { notes } = req.body;
    const userId = req.user.id;

    // Check if user has approval authority (admin or change manager)
    if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('change_manager')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Approval authority required' 
      });
    }

    const change = await prisma.change.update({
      where: { id: req.params.id },
      data: {
        approval_status: 'APPROVED',
        state: 'SCHEDULED',
        approved_by_id: userId,
        approved_at: new Date(),
        approval_notes: notes
      },
      include: {
        requested_by: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Change approved: ${change.number} by user ${userId}`);

    res.json({
      success: true,
      data: change,
      message: 'Change approved successfully'
    });
  } catch (error) {
    logger.error('Error approving change:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to approve change',
      message: error.message 
    });
  }
});

// POST /api/v1/changes/:id/reject - Reject change
router.post('/:id/reject', authenticateJWT, async (req, res) => {
  try {
    const { notes } = req.body;
    const userId = req.user.id;

    // Check if user has approval authority
    if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('change_manager')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Approval authority required' 
      });
    }

    if (!notes) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rejection notes are required' 
      });
    }

    const change = await prisma.change.update({
      where: { id: req.params.id },
      data: {
        approval_status: 'REJECTED',
        state: 'CANCELLED',
        approved_by_id: userId,
        approved_at: new Date(),
        approval_notes: notes
      },
      include: {
        requested_by: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Change rejected: ${change.number} by user ${userId}`);

    res.json({
      success: true,
      data: change,
      message: 'Change rejected'
    });
  } catch (error) {
    logger.error('Error rejecting change:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject change',
      message: error.message 
    });
  }
});

export default router;