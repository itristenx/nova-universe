// nova-api/routes/lore.js
// Nova Lore - Knowledge Base Routes
import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     KnowledgeArticle:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         kbId:
 *           type: string
 *           description: Knowledge base ID in format KB-00001
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         excerpt:
 *           type: string
 *         visibility:
 *           type: string
 *           enum: [public, internal, restricted, department_only]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         systemContext:
 *           type: string
 *         verifiedSolution:
 *           type: boolean
 *         helpfulCount:
 *           type: integer
 *         unhelpfulCount:
 *           type: integer
 *         viewCount:
 *           type: integer
 *         createdBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/lore/articles:
 *   get:
 *     summary: Get knowledge base articles
 *     description: Returns a list of knowledge base articles filtered by visibility and user permissions
 *     tags: [Lore - Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title and content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter by
 *       - in: query
 *         name: systemContext
 *         schema:
 *           type: string
 *         description: Filter by system context
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [public, internal, restricted, department_only]
 *         description: Filter by visibility level
 *       - in: query
 *         name: verifiedOnly
 *         schema:
 *           type: boolean
 *         description: Return only verified solutions
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of articles to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of articles to skip
 *     responses:
 *       200:
 *         description: List of knowledge base articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KnowledgeArticle'
 *                 total:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/articles',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  async (req, res) => {
    try {
      const {
        search,
        tags,
        visibility,
        limit = 50,
        offset = 0
      } = req.query;

      const userRoles = req.user.roles || [];
      const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

      // Build Prisma filters
      const where = {
        AND: [
          !isAdmin ? {
            OR: [
              { isPublished: true },
              { isPublished: false, authorId: req.user.id }
            ]
          } : {},
          search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { versions: { some: { content: { contains: search, mode: 'insensitive' } } } }
            ]
          } : {},
          tags ? { tags: { hasSome: tags.split(',').map(t => t.trim()) } } : {},
          visibility ? { visibility } : {},
        ]
      };

      const [articles, total] = await Promise.all([
        prisma.kbArticle.findMany({
          where,
          include: {
            author: { select: { id: true, name: true } },
            currentVersion: true
          },
          orderBy: { updatedAt: 'desc' },
          skip: parseInt(offset),
          take: parseInt(limit)
        }),
        prisma.kbArticle.count({ where })
      ]);

      res.json({
        success: true,
        articles: articles.map(a => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          content: a.currentVersion?.content || '',
          excerpt: a.currentVersion?.content?.substring(0, 200) + '...' || '',
          tags: a.tags,
          isPublished: a.isPublished,
          createdBy: a.author ? { id: a.author.id, name: a.author.name } : null,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt
        })),
        total,
        hasMore: parseInt(offset) + parseInt(limit) < total
      });
    } catch (error) {
      logger.error('Error fetching knowledge articles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch articles',
        errorCode: 'ARTICLES_FETCH_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/lore/articles/{kbId}:
 *   get:
 *     summary: Get a specific knowledge base article
 *     description: Returns a specific knowledge base article by KB ID
 *     tags: [Lore - Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kbId
 *         required: true
 *         schema:
 *           type: string
 *         description: Knowledge base ID (e.g., KB-00001)
 *     responses:
 *       200:
 *         description: Knowledge base article
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 article:
 *                   $ref: '#/components/schemas/KnowledgeArticle'
 *       404:
 *         description: Article not found
 *       401:
 *         description: Unauthorized
 */
router.get('/articles/:kbId',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 200), // 200 requests per 15 minutes
  async (req, res) => {
    try {
      const { kbId } = req.params;
      const userRoles = req.user.roles || [];
      const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

      let query = `
        SELECT kb.*, u.name as author_name, u.email as author_email
        FROM kb_articles kb
        LEFT JOIN users u ON kb.created_by_id = u.id
        WHERE kb.kb_id = $1 AND kb.deleted_at IS NULL
      `;
      const params = [kbId];

      // Add visibility restrictions for non-admin users
      if (!isAdmin) {
        query += ` AND (kb.visibility = 'public' OR kb.visibility = 'internal')`;
      }

      const row = await prisma.$queryRaw(query, params);

      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'Article not found',
          errorCode: 'ARTICLE_NOT_FOUND'
        });
      }

      // Increment view count
      db.none('UPDATE kb_articles SET access_count = access_count + 1 WHERE id = $1', [row.id]);

      const article = {
        id: row.id,
        kbId: row.kb_id,
        title: row.title,
        content: row.body_markdown,
        visibility: row.visibility,
        tags: row.tags ? JSON.parse(row.tags) : [],
        systemContext: row.system_context,
        verifiedSolution: row.verified_solution,
        helpfulCount: row.helpful_count,
        unhelpfulCount: row.unhelpful_count,
        viewCount: (row.access_count || 0) + 1,
        createdBy: {
          id: row.created_by_id,
          name: row.author_name
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.json({
        success: true,
        article
      });
    } catch (error) {
      logger.error('Error in article detail endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article',
        errorCode: 'ARTICLE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/lore/articles:
 *   post:
 *     summary: Create a new knowledge base article
 *     description: Creates a new knowledge base article
 *     tags: [Lore - Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - visibility
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               content:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, internal, restricted, department_only]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               systemContext:
 *                 type: string
 *               verifiedSolution:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 article:
 *                   $ref: '#/components/schemas/KnowledgeArticle'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/articles',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  [
    body('title').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').isLength({ min: 1 }).withMessage('Content is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
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
      const { title, content, tags = [] } = req.body;
      const userId = req.user.id;
      // Only allow users with editor/admin roles
      const userRoles = req.user.roles || [];
      if (!userRoles.includes('admin') && !userRoles.includes('superadmin') && !userRoles.includes('kb_editor')) {
        return res.status(403).json({ success: false, error: 'Forbidden', errorCode: 'FORBIDDEN' });
      }
      // Generate unique slug
      const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = slugBase;
      let i = 1;
      while (await prisma.kbArticle.findUnique({ where: { slug } })) {
        slug = `${slugBase}-${i++}`;
      }
      // Create article and initial version
      const article = await prisma.kbArticle.create({
        data: {
          slug,
          title,
          tags,
          authorId: userId,
          isPublished: false,
          versions: {
            create: [{
              content,
              authorId: userId,
              version: 1,
              isApproved: false
            }]
          }
        },
        include: {
          author: { select: { id: true, name: true } },
          versions: true
        }
      });
      res.status(201).json({
        success: true,
        article: {
          id: article.id,
          slug: article.slug,
          title: article.title,
          content: article.versions[0]?.content || '',
          tags: article.tags,
          isPublished: article.isPublished,
          createdBy: article.author ? { id: article.author.id, name: article.author.name } : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt
        }
      });
    } catch (error) {
      logger.error('Error creating article:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create article',
        errorCode: 'ARTICLE_CREATE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/lore/articles/{kbId}/feedback:
 *   post:
 *     summary: Submit feedback for a knowledge base article
 *     description: Submit helpful/unhelpful feedback for an article
 *     tags: [Lore - Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kbId
 *         required: true
 *         schema:
 *           type: string
 *         description: Knowledge base ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - helpful
 *             properties:
 *               helpful:
 *                 type: boolean
 *                 description: true for helpful, false for unhelpful
 *               comment:
 *                 type: string
 *                 description: Optional feedback comment
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       404:
 *         description: Article not found
 *       401:
 *         description: Unauthorized
 */
router.post('/articles/:kbId/feedback',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 feedback submissions per 15 minutes
  [
    body('helpful').isBoolean().withMessage('Helpful must be true or false'),
    body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
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

      const { kbId } = req.params;
      const { helpful, comment } = req.body;

      // Check if article exists
      const article = await db.oneOrNone('SELECT id FROM kb_articles WHERE kb_id = $1 AND deleted_at IS NULL', [kbId]);

      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found',
          errorCode: 'ARTICLE_NOT_FOUND'
        });
      }

      // Update feedback counts
      const updateField = helpful ? 'helpful_count' : 'unhelpful_count';
      await db.none(`UPDATE kb_articles SET ${updateField} = ${updateField} + 1 WHERE id = $1`, [article.id]);

      // If there's a comment, store it in the feedback table
      if (comment) {
        db.run(
          'INSERT INTO feedback (name, message, user_id, timestamp) VALUES ($1, $2, $3, $4)',
          [`KB Feedback: ${kbId}`, comment, req.user.id, new Date().toISOString()],
          (feedbackErr) => {
            if (feedbackErr) {
              logger.error('Error storing feedback comment:', feedbackErr);
            }
          }
        );
      }

      res.json({
        success: true,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      logger.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
        errorCode: 'FEEDBACK_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/lore/search:
 *   get:
 *     summary: Search knowledge base articles
 *     description: Perform full-text search on knowledge base articles
 *     tags: [Lore - Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KnowledgeArticle'
 *       401:
 *         description: Unauthorized
 */
router.get('/search',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 searches per 15 minutes
  async (req, res) => {
    try {
      const { q, limit = 20 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          errorCode: 'QUERY_REQUIRED'
        });
      }

      const userRoles = req.user.roles || [];
      const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

      let query = `
        SELECT kb.*, u.name as author_name,
               (CASE 
                 WHEN kb.title ILIKE $1 THEN 3
                 WHEN kb.body_markdown ILIKE $2 THEN 2
                 WHEN kb.tags ILIKE $3 THEN 1
                 ELSE 0
               END) as relevance_score
        FROM kb_articles kb
        LEFT JOIN users u ON kb.created_by_id = u.id
        WHERE kb.deleted_at IS NULL
        AND (kb.title ILIKE $4 OR kb.body_markdown ILIKE $5 OR kb.tags ILIKE $6)
      `;

      const searchTerm = `%${q}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      // Add visibility restrictions for non-admin users
      if (!isAdmin) {
        query += ` AND (kb.visibility = 'public' OR kb.visibility = 'internal')`;
      }

      query += ` ORDER BY relevance_score DESC, kb.helpful_count DESC, kb.updated_at DESC LIMIT $7`;
      params.push(parseInt(limit));

      const rows = await db.any(query, params);

      const results = (rows || []).map(row => ({
        id: row.id,
        kbId: row.kb_id,
        title: row.title,
        content: row.body_markdown,
        excerpt: row.body_markdown ? row.body_markdown.substring(0, 200) + '...' : '',
        visibility: row.visibility,
        tags: row.tags ? JSON.parse(row.tags) : [],
        systemContext: row.system_context,
        verifiedSolution: row.verified_solution,
        helpfulCount: row.helpful_count,
        unhelpfulCount: row.unhelpful_count,
        viewCount: row.access_count,
        relevanceScore: row.relevance_score,
        createdBy: {
          id: row.created_by_id,
          name: row.author_name
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.json({
        success: true,
        results
      });
    } catch (error) {
      logger.error('Error in search endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        errorCode: 'SEARCH_ERROR'
      });
    }
  }
);

// --- New: Article Versions ---
// List all versions for an article
router.get('/articles/:articleId/versions', authenticateJWT, async (req, res) => {
  try {
    const { articleId } = req.params;
    const versions = await prisma.kbArticleVersion.findMany({
      where: { articleId: parseInt(articleId) },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, versions });
  } catch (error) {
    logger.error('Error fetching article versions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch versions' });
  }
});

// Get a specific version
router.get('/articles/:articleId/versions/:versionId', authenticateJWT, async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await prisma.kbArticleVersion.findUnique({
      where: { id: parseInt(versionId) },
      include: { author: { select: { id: true, name: true } } }
    });
    if (!version) return res.status(404).json({ success: false, error: 'Version not found' });
    res.json({ success: true, version });
  } catch (error) {
    logger.error('Error fetching article version:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch version' });
  }
});

// Create a new version (edit)
router.post('/articles/:articleId/versions', authenticateJWT, [
  body('content').isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() });
    }
    const { articleId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    // Only allow users with editor/admin roles
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('admin') && !userRoles.includes('superadmin') && !userRoles.includes('kb_editor')) {
      return res.status(403).json({ success: false, error: 'Forbidden', errorCode: 'FORBIDDEN' });
    }
    // Get latest version number
    const lastVersion = await prisma.kbArticleVersion.findFirst({
      where: { articleId: parseInt(articleId) },
      orderBy: { version: 'desc' }
    });
    const newVersionNum = lastVersion ? lastVersion.version + 1 : 1;
    const version = await prisma.kbArticleVersion.create({
      data: {
        articleId: parseInt(articleId),
        content,
        authorId: userId,
        version: newVersionNum,
        isApproved: false
      },
      include: { author: { select: { id: true, name: true } } }
    });
    res.status(201).json({ success: true, version });
  } catch (error) {
    logger.error('Error creating article version:', error);
    res.status(500).json({ success: false, error: 'Failed to create version' });
  }
});

// --- New: Comments on Article Versions ---
// List comments for an article
router.get('/articles/:articleId/comments', authenticateJWT, async (req, res) => {
  try {
    const { articleId } = req.params;
    const comments = await prisma.kbArticleComment.findMany({
      where: { articleId: parseInt(articleId) },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, comments });
  } catch (error) {
    logger.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
});

// Add a comment to an article
router.post('/articles/:articleId/comments', authenticateJWT, [
  body('content').isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() });
    }
    const { articleId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const comment = await prisma.kbArticleComment.create({
      data: {
        articleId: parseInt(articleId),
        userId,
        content
      },
      include: { user: { select: { id: true, name: true } } }
    });
    res.status(201).json({ success: true, comment });
  } catch (error) {
    logger.error('Error creating comment:', error);
    res.status(500).json({ success: false, error: 'Failed to create comment' });
  }
});

export default router;
