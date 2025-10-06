import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth.js';
import { logger } from '../logger.js';
import { getWithCache, invalidateCache } from '../db.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createKnowledgeArticleSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  summary: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(['PUBLIC', 'INTERNAL', 'RESTRICTED']).default('INTERNAL'),
  approval_required: z.boolean().default(true),
});

const updateKnowledgeArticleSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  summary: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['PUBLIC', 'INTERNAL', 'RESTRICTED']).optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'RETIRED']).optional(),
});

// GET /api/v1/knowledge-articles - List knowledge articles
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      category,
      visibility,
      search,
      tags 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Apply filters
    if (status) where.status = status;
    if (category) where.category = category;
    if (visibility) where.visibility = visibility;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        hasSome: tagArray
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Non-admin users can only see published articles or their own drafts
    if (!req.user.roles?.includes('admin')) {
      where.OR = [
        { status: 'PUBLISHED' },
        { 
          AND: [
            { author_id: req.user.id },
            { status: { in: ['DRAFT', 'PENDING_APPROVAL'] } }
          ]
        }
      ];
    }

    // Build cache key from filter parameters
    const cacheKey = `nova:kb:articles:list:page:${page}:status:${status || 'all'}:category:${category || 'all'}:search:${search || 'none'}:user:${req.user.id}:v1`;

    // Cache KB article lists for 15 minutes (mostly static content)
    const result = await getWithCache(
      cacheKey,
      async () => {
        const [articles, total] = await Promise.all([
          prisma.knowledgeArticle.findMany({
            where,
            include: {
              author: {
                select: { id: true, email: true, first_name: true, last_name: true }
              },
              approved_by: {
                select: { id: true, email: true, first_name: true, last_name: true }
              },
              _count: {
                select: { ratings: true, views: true }
              }
            },
            orderBy: [
              { updated_at: 'desc' }
            ],
            skip: offset,
            take: parseInt(limit)
          }),
          prisma.knowledgeArticle.count({ where })
        ]);

        return { articles, total };
      },
      900 // 15 minutes TTL
    );

    res.json({
      success: true,
      data: result.articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        pages: Math.ceil(result.total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching knowledge articles:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch knowledge articles',
      message: error.message 
    });
  }
});

// GET /api/v1/knowledge-articles/:id - Get knowledge article by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    // Build cache key for this article
    const cacheKey = `nova:kb:article:${req.params.id}:v1`;

    // Cache individual KB articles for 2 hours (very stable content)
    const article = await getWithCache(
      cacheKey,
      async () => {
        return await prisma.knowledgeArticle.findUnique({
          where: { id: req.params.id },
          include: {
            author: {
              select: { id: true, email: true, first_name: true, last_name: true }
            },
            approved_by: {
              select: { id: true, email: true, first_name: true, last_name: true }
            },
            ratings: {
              include: {
                user: {
                  select: { id: true, email: true, first_name: true, last_name: true }
                }
              }
            },
            views: {
              include: {
                user: {
                  select: { id: true, email: true, first_name: true, last_name: true }
                }
              },
              orderBy: { viewed_at: 'desc' },
              take: 50
            }
          }
        });
      },
      7200 // 2 hours TTL
    );

    if (!article) {
      return res.status(404).json({ 
        success: false, 
        error: 'Knowledge article not found' 
      });
    }

    // Check visibility permissions
    if (article.status !== 'PUBLISHED' && 
        article.author_id !== req.user.id && 
        !req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    // Record view if article is published
    if (article.status === 'PUBLISHED') {
      await prisma.knowledgeArticleView.upsert({
        where: {
          article_id_user_id: {
            article_id: article.id,
            user_id: req.user.id
          }
        },
        update: {
          viewed_at: new Date(),
          view_count: {
            increment: 1
          }
        },
        create: {
          article_id: article.id,
          user_id: req.user.id,
          view_count: 1
        }
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    logger.error('Error fetching knowledge article:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch knowledge article',
      message: error.message 
    });
  }
});

// POST /api/v1/knowledge-articles - Create new knowledge article
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const validatedData = createKnowledgeArticleSchema.parse(req.body);
    const userId = req.user.id;

    const article = await prisma.knowledgeArticle.create({
      data: {
        ...validatedData,
        author_id: userId,
        status: validatedData.approval_required ? 'DRAFT' : 'PUBLISHED'
      },
      include: {
        author: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    // Invalidate KB article list caches after creation
    await invalidateCache('nova:kb:articles:list:*');

    logger.info(`Knowledge article created: ${article.title} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: article,
      message: 'Knowledge article created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error creating knowledge article:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create knowledge article',
      message: error.message 
    });
  }
});

// PUT /api/v1/knowledge-articles/:id - Update knowledge article
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const validatedData = updateKnowledgeArticleSchema.parse(req.body);
    const userId = req.user.id;

    const existingArticle = await prisma.knowledgeArticle.findUnique({
      where: { id: req.params.id }
    });

    if (!existingArticle) {
      return res.status(404).json({ 
        success: false, 
        error: 'Knowledge article not found' 
      });
    }

    // Check permissions - only author or admin can edit
    if (existingArticle.author_id !== userId && !req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Permission denied' 
      });
    }

    const article = await prisma.knowledgeArticle.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        updated_by_id: userId
      },
      include: {
        author: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        approved_by: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    // Invalidate KB article caches after update
    await Promise.all([
      invalidateCache(`nova:kb:article:${req.params.id}:*`), // Specific article
      invalidateCache('nova:kb:articles:list:*'), // All article lists
    ]);

    logger.info(`Knowledge article updated: ${article.title} by user ${userId}`);

    res.json({
      success: true,
      data: article,
      message: 'Knowledge article updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: error.errors 
      });
    }
    
    logger.error('Error updating knowledge article:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update knowledge article',
      message: error.message 
    });
  }
});

// POST /api/v1/knowledge-articles/:id/approve - Approve knowledge article
router.post('/:id/approve', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has approval authority
    if (!req.user.roles?.includes('admin') && !req.user.roles?.includes('knowledge_manager')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Approval authority required' 
      });
    }

    const article = await prisma.knowledgeArticle.update({
      where: { id: req.params.id },
      data: {
        status: 'PUBLISHED',
        approved_by_id: userId,
        approved_at: new Date()
      },
      include: {
        author: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Knowledge article approved: ${article.title} by user ${userId}`);

    res.json({
      success: true,
      data: article,
      message: 'Knowledge article approved and published'
    });
  } catch (error) {
    logger.error('Error approving knowledge article:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to approve knowledge article',
      message: error.message 
    });
  }
});

// POST /api/v1/knowledge-articles/:id/rate - Rate knowledge article
router.post('/:id/rate', authenticateJWT, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const articleRating = await prisma.knowledgeArticleRating.upsert({
      where: {
        article_id_user_id: {
          article_id: req.params.id,
          user_id: userId
        }
      },
      update: {
        rating,
        comment,
        updated_at: new Date()
      },
      create: {
        article_id: req.params.id,
        user_id: userId,
        rating,
        comment
      },
      include: {
        user: {
          select: { id: true, email: true, first_name: true, last_name: true }
        }
      }
    });

    logger.info(`Knowledge article rated: ${req.params.id} by user ${userId} - rating: ${rating}`);

    res.json({
      success: true,
      data: articleRating,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    logger.error('Error rating knowledge article:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to rate knowledge article',
      message: error.message 
    });
  }
});

// GET /api/v1/knowledge-articles/categories - Get categories with counts
router.get('/categories', authenticateJWT, async (req, res) => {
  try {
    const categories = await prisma.knowledgeArticle.groupBy({
      by: ['category', 'subcategory'],
      where: {
        status: 'PUBLISHED'
      },
      _count: true,
      orderBy: {
        category: 'asc'
      }
    });

    const categoriesMap = {};
    categories.forEach(cat => {
      if (!categoriesMap[cat.category]) {
        categoriesMap[cat.category] = {
          name: cat.category,
          count: 0,
          subcategories: {}
        };
      }
      categoriesMap[cat.category].count += cat._count;
      
      if (cat.subcategory) {
        categoriesMap[cat.category].subcategories[cat.subcategory] = cat._count;
      }
    });

    res.json({
      success: true,
      data: Object.values(categoriesMap)
    });
  } catch (error) {
    logger.error('Error fetching knowledge article categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories',
      message: error.message 
    });
  }
});

export default router;