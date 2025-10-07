import express from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { prisma, getWithCache } from '../db.js';

const router = express.Router();

/**
 * Knowledge Base API - Enhanced endpoints for Self-Service Portal
 * Provides article search, popular articles, and categories
 */

/**
 * @route GET /api/v1/knowledge/popular
 * @description Get popular knowledge base articles
 * @access Public (but can be personalized if authenticated)
 * @returns {Array} Array of popular articles
 */
router.get(
  '/popular',
  createRateLimit(60 * 1000, 120),
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category;

      const cacheKey = `nova:knowledge:popular:limit:${limit}:category:${category || 'all'}:v1`;

      const articles = await getWithCache(
        cacheKey,
        async () => {
          const where = {
            published: true,
            ...(category && { category }),
          };

          const popularArticles = await prisma.kbArticle.findMany({
            where,
            orderBy: [
              { viewCount: 'desc' }, // Most viewed first
              { helpfulCount: 'desc' }, // Most helpful second
              { createdAt: 'desc' }, // Newest third
            ],
            take: limit,
            select: {
              id: true,
              title: true,
              summary: true,
              category: true,
              tags: true,
              viewCount: true,
              helpfulCount: true,
              createdAt: true,
              updatedAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          });

          return popularArticles.map((article) => ({
            id: article.id,
            title: article.title,
            summary: article.summary,
            category: article.category,
            tags: article.tags || [],
            views: article.viewCount || 0,
            helpful: article.helpfulCount || 0,
            author: article.author
              ? {
                  id: article.author.id,
                  name: article.author.name,
                  avatar: article.author.avatarUrl,
                }
              : null,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          }));
        },
        600 // 10 minutes TTL - popular articles don't change frequently
      );

      res.json({
        success: true,
        data: articles,
        meta: {
          count: articles.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error fetching popular articles:', error);

      // Graceful degradation if knowledge base not set up
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Knowledge base feature not yet implemented in database');
        return res.json({
          success: true,
          data: [],
          meta: {
            count: 0,
            message: 'Knowledge base coming soon',
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular articles',
        message: error.message,
      });
    }
  }
);

/**
 * @route GET /api/v1/knowledge/search
 * @description Search knowledge base articles
 * @access Public
 * @returns {Array} Array of matching articles
 */
router.get(
  '/search',
  createRateLimit(60 * 1000, 120),
  [
    query('q').isString().isLength({ min: 1 }).withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const searchQuery = req.query.q.toLowerCase();
      const limit = parseInt(req.query.limit) || 20;
      const category = req.query.category;

      const where = {
        published: true,
        ...(category && { category }),
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { summary: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { hasSome: [searchQuery] } },
        ],
      };

      const articles = await prisma.kbArticle.findMany({
        where,
        orderBy: [
          { viewCount: 'desc' }, // Popular articles ranked higher
          { updatedAt: 'desc' }, // Recent updates ranked higher
        ],
        take: limit,
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          tags: true,
          viewCount: true,
          helpfulCount: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: articles.map((article) => ({
          id: article.id,
          title: article.title,
          summary: article.summary,
          category: article.category,
          tags: article.tags || [],
          views: article.viewCount || 0,
          helpful: article.helpfulCount || 0,
          author: article.author
            ? {
                id: article.author.id,
                name: article.author.name,
                avatar: article.author.avatarUrl,
              }
            : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        })),
        meta: {
          query: req.query.q,
          count: articles.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error searching knowledge base:', error);

      // Graceful degradation
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        logger.warn('Knowledge base feature not yet implemented in database');
        return res.json({
          success: true,
          data: [],
          meta: {
            query: req.query.q,
            count: 0,
            message: 'Knowledge base coming soon',
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to search knowledge base',
        message: error.message,
      });
    }
  }
);

/**
 * @route GET /api/v1/knowledge/categories
 * @description Get all knowledge base categories
 * @access Public
 * @returns {Array} Array of categories with article counts
 */
router.get('/categories', createRateLimit(60 * 1000, 60), async (req, res) => {
  try {
    const cacheKey = 'nova:knowledge:categories:v1';

    const categories = await getWithCache(
      cacheKey,
      async () => {
        const categoryStats = await prisma.kbArticle.groupBy({
          by: ['category'],
          where: { published: true },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        });

        return categoryStats.map((stat) => ({
          name: stat.category,
          articleCount: stat._count.id,
        }));
      },
      900 // 15 minutes TTL - categories don't change often
    );

    res.json({
      success: true,
      data: categories,
      meta: {
        count: categories.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching knowledge categories:', error);

    // Graceful degradation
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      logger.warn('Knowledge base feature not yet implemented in database');
      return res.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          message: 'Knowledge base coming soon',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge categories',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/v1/knowledge/:id
 * @description Get a specific knowledge article by ID
 * @access Public
 * @returns {Object} Full article content
 */
router.get('/:id', createRateLimit(60 * 1000, 120), async (req, res) => {
  try {
    const articleId = req.params.id;

    const article = await prisma.kbArticle.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    if (!article.published) {
      return res.status(403).json({
        success: false,
        error: 'Article is not published',
      });
    }

    // Increment view count (fire and forget)
    prisma.kbArticle
      .update({
        where: { id: articleId },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => logger.warn('Failed to increment view count:', err));

    res.json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        tags: article.tags || [],
        views: article.viewCount || 0,
        helpful: article.helpfulCount || 0,
        author: article.author
          ? {
              id: article.author.id,
              name: article.author.name,
              email: article.author.email,
              avatar: article.author.avatarUrl,
            }
          : null,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error fetching knowledge article:', error);

    // Graceful degradation
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      logger.warn('Knowledge base feature not yet implemented in database');
      return res.status(404).json({
        success: false,
        error: 'Knowledge base coming soon',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
      message: error.message,
    });
  }
});

export default router;
