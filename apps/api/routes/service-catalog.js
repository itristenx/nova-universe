import express from 'express';
import db from '../db.js';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = express.Router();

// Get Prisma client
let prisma = null;
async function getPrismaClient() {
  if (!prisma) {
    prisma = await db.getPrismaClient();
  }
  return prisma;
}

// Validation schemas
const createCatalogItemSchema = z.object({
  name: z.string().min(1).max(100),
  short_description: z.string().min(1).max(160),
  description: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  price: z.number().min(0).optional(),
  icon: z.string().optional(),
  is_active: z.boolean().default(true),
  approval_required: z.boolean().default(false),
  fulfillment_time_days: z.number().min(0).optional(),
  form_fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.string(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional()
  })).optional()
});

// GET /api/v1/service-catalog - List catalog items
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category, 
      subcategory,
      active_only = 'true',
      search 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Apply filters
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (active_only === 'true') where.is_active = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { short_description: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [catalogItems, total] = await Promise.all([
      prisma.catalogItem.findMany({
        where,
        orderBy: [
          { popularity_score: 'desc' },
          { name: 'asc' }
        ],
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.catalogItem.count({ where })
    ]);

    res.json({
      success: true,
      data: catalogItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching catalog items:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch catalog items',
      message: error.message 
    });
  }
});

// GET /api/v1/service-catalog/categories - Get available categories
router.get('/categories', authenticateJWT, async (req, res) => {
  try {
    const categories = await prisma.catalogItem.findMany({
      where: { is_active: true },
      select: { 
        category: true, 
        subcategory: true 
      },
      distinct: ['category', 'subcategory']
    });

    // Group by category
    const categorizedItems = categories.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = new Set();
      }
      if (item.subcategory) {
        acc[item.category].add(item.subcategory);
      }
      return acc;
    }, {});

    // Convert sets to arrays
    const result = Object.keys(categorizedItems).map(category => ({
      category,
      subcategories: Array.from(categorizedItems[category])
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching catalog categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch catalog categories',
      message: error.message 
    });
  }
});

// GET /api/v1/service-catalog/popular - Get popular catalog items
router.get('/popular', authenticateJWT, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularItems = await prisma.catalogItem.findMany({
      where: { is_active: true },
      orderBy: { popularity_score: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: popularItems
    });
  } catch (error) {
    logger.error('Error fetching popular catalog items:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch popular catalog items',
      message: error.message 
    });
  }
});

// GET /api/v1/service-catalog/:id - Get catalog item by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const catalogItem = await prisma.catalogItem.findUnique({
      where: { id: req.params.id }
    });

    if (!catalogItem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Catalog item not found' 
      });
    }

    // Increment view count for analytics
    await prisma.catalogItem.update({
      where: { id: req.params.id },
      data: { 
        popularity_score: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: catalogItem
    });
  } catch (error) {
    logger.error('Error fetching catalog item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch catalog item',
      message: error.message 
    });
  }
});

// POST /api/v1/service-catalog - Create new catalog item (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    // Check if user has admin role
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const validatedData = createCatalogItemSchema.parse(req.body);

    const catalogItem = await prisma.catalogItem.create({
      data: {
        ...validatedData,
        popularity_score: 0,
        average_rating: 0
      }
    });

    logger.info(`Catalog item created: ${catalogItem.name} by admin ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: catalogItem,
      message: 'Catalog item created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error creating catalog item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create catalog item',
      message: error.message 
    });
  }
});

// PUT /api/v1/service-catalog/:id - Update catalog item (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    // Check if user has admin role
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const validatedData = createCatalogItemSchema.partial().parse(req.body);

    const existingItem = await prisma.catalogItem.findUnique({
      where: { id: req.params.id }
    });

    if (!existingItem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Catalog item not found' 
      });
    }

    const catalogItem = await prisma.catalogItem.update({
      where: { id: req.params.id },
      data: validatedData
    });

    logger.info(`Catalog item updated: ${catalogItem.name} by admin ${req.user.id}`);

    res.json({
      success: true,
      data: catalogItem,
      message: 'Catalog item updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error updating catalog item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update catalog item',
      message: error.message 
    });
  }
});

// DELETE /api/v1/service-catalog/:id - Delete catalog item (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // Check if user has admin role
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const existingItem = await prisma.catalogItem.findUnique({
      where: { id: req.params.id }
    });

    if (!existingItem) {
      return res.status(404).json({ 
        success: false, 
        error: 'Catalog item not found' 
      });
    }

    // Soft delete by marking as inactive
    await prisma.catalogItem.update({
      where: { id: req.params.id },
      data: { is_active: false }
    });

    logger.info(`Catalog item deactivated: ${existingItem.name} by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'Catalog item deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting catalog item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete catalog item',
      message: error.message 
    });
  }
});

export default router;