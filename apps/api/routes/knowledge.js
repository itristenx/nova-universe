import express from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { authenticateJWT } from '../middleware/auth.js';
import { prisma, getWithCache } from '../db.js';

const router = express.Router();

// Alias for consistency with other Week 2 files
const authenticateToken = authenticateJWT;

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

// =============================================================================
// WEEK 2: CRUD OPERATIONS, VERSIONING, AND COMMENTS
// =============================================================================

/**
 * POST /api/v1/knowledge/articles
 * Create new knowledge article (Authenticated users)
 */
router.post('/articles', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      categoryId,
      tags,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Title and content are required'
      });
    }

    // Create article
    const article = await prisma.kbArticle.create({
      data: {
        title,
        content,
        summary: summary || content.substring(0, 200),
        categoryId,
        tags: tags || [],
        status,
        authorId: req.user.id,
        viewCount: 0,
        helpfulCount: 0
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        category: true
      }
    });

    // Create initial version
    await prisma.kbArticleVersion.create({
      data: {
        articleId: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        version: 1,
        createdById: req.user.id,
        changeNotes: 'Initial version'
      }
    });

    res.status(201).json({
      success: true,
      data: article,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create article',
      message: error.message
    });
  }
});

/**
 * PUT /api/v1/knowledge/articles/:id
 * Update knowledge article (Author or Admin only)
 */
router.put('/articles/:id', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, categoryId, tags, status, changeNotes } = req.body;

    // Get existing article
    const existingArticle = await prisma.kbArticle.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check permissions (author or admin only)
    if (existingArticle.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only the author or admin can update this article'
      });
    }

    // Get current version number
    const latestVersion = await prisma.kbArticleVersion.findFirst({
      where: { articleId: id },
      orderBy: { version: 'desc' }
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Update article and create new version in a transaction
    const [updatedArticle] = await prisma.$transaction([
      prisma.kbArticle.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(summary && { summary }),
          ...(categoryId && { categoryId }),
          ...(tags && { tags }),
          ...(status && { status })
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          category: true
        }
      }),
      prisma.kbArticleVersion.create({
        data: {
          articleId: id,
          title: title || existingArticle.title,
          content: content || existingArticle.content,
          summary: summary || existingArticle.summary,
          version: newVersionNumber,
          createdById: req.user.id,
          changeNotes: changeNotes || `Updated by ${req.user.name}`
        }
      })
    ]);

    res.json({
      success: true,
      data: updatedArticle,
      version: newVersionNumber,
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update article',
      message: error.message
    });
  }
});

/**
 * DELETE /api/v1/knowledge/articles/:id
 * Delete/archive knowledge article (Author or Admin only)
 */
router.delete('/articles/:id', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing article
    const article = await prisma.kbArticle.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Check permissions (author or admin only)
    if (article.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only the author or admin can delete this article'
      });
    }

    // Soft delete (archive)
    await prisma.kbArticle.update({
      where: { id },
      data: {
        status: 'archived'
      }
    });

    res.json({
      success: true,
      message: 'Article archived successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete article',
      message: error.message
    });
  }
});

// =============================================================================
// ARTICLE VERSIONING
// =============================================================================

/**
 * GET /api/v1/knowledge/articles/:id/versions
 * List all versions of an article
 */
router.get('/articles/:id/versions', authenticateToken, createRateLimit(60 * 1000, 60), async (req, res) => {
  try {
    const { id } = req.params;

    const versions = await prisma.kbArticleVersion.findMany({
      where: { articleId: id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        version: 'desc'
      }
    });

    res.json({
      success: true,
      data: versions,
      count: versions.length
    });
  } catch (error) {
    console.error('Error fetching article versions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article versions',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/knowledge/articles/:id/versions/:versionId
 * Get specific version of an article
 */
router.get('/articles/:id/versions/:versionId', authenticateToken, createRateLimit(60 * 1000, 60), async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const version = await prisma.kbArticleVersion.findUnique({
      where: { id: versionId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!version || version.articleId !== id) {
      return res.status(404).json({
        success: false,
        error: 'Version not found'
      });
    }

    res.json({
      success: true,
      data: version
    });
  } catch (error) {
    console.error('Error fetching article version:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article version',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/knowledge/articles/:id/versions/:versionId/restore
 * Restore a previous version (creates new version with old content)
 */
router.post('/articles/:id/versions/:versionId/restore', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const { id, versionId } = req.params;

    // Get the version to restore
    const versionToRestore = await prisma.kbArticleVersion.findUnique({
      where: { id: versionId }
    });

    if (!versionToRestore || versionToRestore.articleId !== id) {
      return res.status(404).json({
        success: false,
        error: 'Version not found'
      });
    }

    // Get article to check permissions
    const article = await prisma.kbArticle.findUnique({
      where: { id }
    });

    if (article.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only the author or admin can restore versions'
      });
    }

    // Get latest version number
    const latestVersion = await prisma.kbArticleVersion.findFirst({
      where: { articleId: id },
      orderBy: { version: 'desc' }
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Update article and create new version
    const [restoredArticle] = await prisma.$transaction([
      prisma.kbArticle.update({
        where: { id },
        data: {
          title: versionToRestore.title,
          content: versionToRestore.content,
          summary: versionToRestore.summary
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          category: true
        }
      }),
      prisma.kbArticleVersion.create({
        data: {
          articleId: id,
          title: versionToRestore.title,
          content: versionToRestore.content,
          summary: versionToRestore.summary,
          version: newVersionNumber,
          createdById: req.user.id,
          changeNotes: `Restored version ${versionToRestore.version}`
        }
      })
    ]);

    res.json({
      success: true,
      data: restoredArticle,
      message: `Version ${versionToRestore.version} restored successfully`
    });
  } catch (error) {
    console.error('Error restoring article version:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore article version',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/knowledge/articles/:id/history
 * Get edit history timeline
 */
router.get('/articles/:id/history', authenticateToken, createRateLimit(60 * 1000, 60), async (req, res) => {
  try {
    const { id } = req.params;

    const history = await prisma.kbArticleVersion.findMany({
      where: { articleId: id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format as timeline
    const timeline = history.map(version => ({
      version: version.version,
      action: version.version === 1 ? 'created' : 'updated',
      author: version.createdBy,
      notes: version.changeNotes,
      timestamp: version.createdAt
    }));

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Error fetching article history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article history',
      message: error.message
    });
  }
});

// =============================================================================
// ARTICLE COMMENTS
// =============================================================================

/**
 * GET /api/v1/knowledge/articles/:id/comments
 * List all comments for an article
 */
router.get('/articles/:id/comments', createRateLimit(60 * 1000, 60), async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await prisma.kbArticleComment.findMany({
      where: {
        articleId: id,
        parentId: null // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Error fetching article comments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/knowledge/articles/:id/comments
 * Add comment to article (Authenticated users)
 */
router.post('/articles/:id/comments', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Comment content is required'
      });
    }

    const comment = await prisma.kbArticleComment.create({
      data: {
        articleId: id,
        authorId: req.user.id,
        content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/knowledge/articles/:id/comments/:commentId/reply
 * Reply to a comment (Authenticated users)
 */
router.post('/articles/:id/comments/:commentId/reply', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Reply content is required'
      });
    }

    const reply = await prisma.kbArticleComment.create({
      data: {
        articleId: id,
        parentId: commentId,
        authorId: req.user.id,
        content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: reply,
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add reply',
      message: error.message
    });
  }
});

/**
 * PUT /api/v1/knowledge/articles/:id/comments/:commentId
 * Update own comment (Author only)
 */
router.put('/articles/:id/comments/:commentId', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Get existing comment
    const existingComment = await prisma.kbArticleComment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user is the author
    if (existingComment.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only edit your own comments'
      });
    }

    const updatedComment = await prisma.kbArticleComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedComment,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update comment',
      message: error.message
    });
  }
});

/**
 * DELETE /api/v1/knowledge/articles/:id/comments/:commentId
 * Delete comment (Author or Admin only)
 */
router.delete('/articles/:id/comments/:commentId', authenticateToken, createRateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const { commentId } = req.params;

    // Get existing comment
    const comment = await prisma.kbArticleComment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check permissions (author or admin)
    if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'Only the author or admin can delete this comment'
      });
    }

    await prisma.kbArticleComment.delete({
      where: { id: commentId }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
      message: error.message
    });
  }
});

export default router;
