import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createProblemSchema = z.object({
  short_description: z.string().min(1).max(160),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string(),
  subcategory: z.string().optional(),
  root_cause: z.string().optional(),
  workaround: z.string().optional(),
  fix_communications: z.string().optional(),
  business_justification: z.string().optional(),
});

const updateProblemSchema = z.object({
  state: z.enum(['NEW', 'ASSIGNED', 'WORK_IN_PROGRESS', 'PENDING', 'ROOT_CAUSE_ANALYSIS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigned_to_id: z.string().optional(),
  root_cause: z.string().optional(),
  workaround: z.string().optional(),
  fix_communications: z.string().optional(),
  resolution_code: z.string().optional(),
  resolution_notes: z.string().optional(),
});

// GET /api/v1/problems - List problems
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      state, 
      priority, 
      category,
      assigned_to,
      search 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Apply filters
    if (state) where.state = state;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assigned_to) where.assigned_to_id = assigned_to;
    if (search) {
      where.OR = [
        { short_description: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        include: {
          requested_by: {
            select: { id: true, email: true, first_name: true, last_name: true }
          },
          assigned_to: {
            select: { id: true, email: true, first_name: true, last_name: true }
          },
          _count: {
            select: { related_incidents: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { created_at: 'desc' }
        ],
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.problem.count({ where })
    ]);

    res.json({
      success: true,
      data: problems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching problems:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch problems',
      message: error.message 
    });
  }
});

// GET /api/v1/problems/:id - Get problem by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
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
        related_incidents: {
          include: {
            requested_by: {
              select: { id: true, email: true, first_name: true, last_name: true }
            }
          }
        },
        known_errors: true
      }
    });

    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Problem not found' 
      });
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    logger.error('Error fetching problem:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch problem',
      message: error.message 
    });
  }
});

// POST /api/v1/problems - Create new problem
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const validatedData = createProblemSchema.parse(req.body);
    const userId = req.user.id;

    // Generate problem number
    const count = await prisma.problem.count();
    const number = `PRB${String(count + 1).padStart(7, '0')}`;

    const problem = await prisma.problem.create({
      data: {
        ...validatedData,
        number,
        requested_by_id: userId,
        state: 'NEW'
      },
      include: {
        requested_by: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Problem created: ${number} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: problem,
      message: 'Problem created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error creating problem:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create problem',
      message: error.message 
    });
  }
});

// PUT /api/v1/problems/:id - Update problem
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const validatedData = updateProblemSchema.parse(req.body);
    const userId = req.user.id;

    const existingProblem = await prisma.problem.findUnique({
      where: { id: req.params.id }
    });

    if (!existingProblem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Problem not found' 
      });
    }

    // If resolving, set resolved_at timestamp
    const updateData = { ...validatedData, updated_by_id: userId };
    if (validatedData.state === 'RESOLVED' && existingProblem.state !== 'RESOLVED') {
      updateData.resolved_at = new Date();
    }

    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        requested_by: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        assigned_to: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Problem updated: ${problem.number} by user ${userId}`);

    res.json({
      success: true,
      data: problem,
      message: 'Problem updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error updating problem:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update problem',
      message: error.message 
    });
  }
});

// POST /api/v1/problems/:id/link-incident/:incidentId - Link incident to problem
router.post('/:id/link-incident/:incidentId', authenticateJWT, async (req, res) => {
  try {
    const { id: problemId, incidentId } = req.params;
    const userId = req.user.id;

    // Verify problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Problem not found' 
      });
    }

    // Verify incident exists
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId }
    });

    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found' 
      });
    }

    // Link incident to problem
    await prisma.incident.update({
      where: { id: incidentId },
      data: {
        problem_id: problemId,
        updated_by_id: userId
      }
    });

    logger.info(`Incident ${incident.number} linked to problem ${problem.number} by user ${userId}`);

    res.json({
      success: true,
      message: 'Incident linked to problem successfully'
    });
  } catch (error) {
    logger.error('Error linking incident to problem:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to link incident to problem',
      message: error.message 
    });
  }
});

// GET /api/v1/problems/analytics/dashboard - Problem analytics
router.get('/analytics/dashboard', authenticateJWT, async (req, res) => {
  try {
    const [
      totalProblems,
      openProblems,
      problemsByPriority,
      problemsByState,
      topCategories
    ] = await Promise.all([
      // Total problems
      prisma.problem.count(),
      
      // Open problems
      prisma.problem.count({
        where: {
          state: {
            in: ['NEW', 'ASSIGNED', 'WORK_IN_PROGRESS', 'PENDING', 'ROOT_CAUSE_ANALYSIS']
          }
        }
      }),
      
      // Problems by priority
      prisma.problem.groupBy({
        by: ['priority'],
        _count: true
      }),
      
      // Problems by state
      prisma.problem.groupBy({
        by: ['state'],
        _count: true
      }),
      
      // Average resolution time
      // We'll calculate this differently since Prisma doesn't support date arithmetic
      
      // Top categories
      prisma.problem.groupBy({
        by: ['category'],
        _count: true,
        orderBy: {
          _count: {
            category: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        total_problems: totalProblems,
        open_problems: openProblems,
        resolved_problems: totalProblems - openProblems,
        problems_by_priority: problemsByPriority.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {}),
        problems_by_state: problemsByState.reduce((acc, item) => {
          acc[item.state] = item._count;
          return acc;
        }, {}),
        top_categories: topCategories.map(cat => ({
          category: cat.category,
          count: cat._count
        }))
      }
    });
  } catch (error) {
    logger.error('Error fetching problem analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch problem analytics',
      message: error.message 
    });
  }
});

export default router;