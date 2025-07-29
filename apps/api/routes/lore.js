// nova-api/routes/lore.js
// Nova Lore - Knowledge Base Routes
import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

function parseTags(json) {
  try {
    return json ? JSON.parse(json) : [];
  } catch (err) {
    logger.warn('Failed to parse tags:', err);
    return [];
  }
}

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
        systemContext,
        visibility,
        verifiedOnly,
        limit = 50,
        offset = 0
      } = req.query;

      const userRoles = req.user.roles || [];
      const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

      // Build query based on user permissions and filters
      let query = `
        SELECT kb.*, u.name as author_name, u.email as author_email,
               COUNT(*) OVER() as total_count
        FROM kb_articles kb
        LEFT JOIN users u ON kb.created_by_id = u.id
        WHERE kb.deleted_at IS NULL
      `;
      const params = [];
      let paramIndex = 1;

      // Visibility filters based on user permissions
      if (!isAdmin) {
        query += ` AND (kb.visibility = 'public' OR kb.visibility = 'internal')`;
      }

      if (search) {
        query += ` AND (kb.title ILIKE $${paramIndex} OR kb.body_markdown ILIKE $${paramIndex + 1})`;
        params.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
      }

      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        query += ` AND kb.tags && $${paramIndex}`;
        params.push(JSON.stringify(tagList));
        paramIndex++;
      }

      if (systemContext) {
        query += ` AND kb.system_context = $${paramIndex}`;
        params.push(systemContext);
        paramIndex++;
      }

      if (visibility) {
        query += ` AND kb.visibility = $${paramIndex}`;
        params.push(visibility);
        paramIndex++;
      }

      if (verifiedOnly === 'true') {
        query += ` AND kb.verified_solution = true`;
      }

      query += ` ORDER BY kb.helpful_count DESC, kb.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const rows = await db.any(query, params);

      const articles = (rows || []).map(row => ({
        id: row.id,
        kbId: row.kb_id,
        title: row.title,
        content: row.body_markdown,
        excerpt: row.body_markdown ? row.body_markdown.substring(0, 200) + '...' : '',
        visibility: row.visibility,
        tags: parseTags(row.tags),
        systemContext: row.system_context,
        verifiedSolution: row.verified_solution,
        helpfulCount: row.helpful_count,
        unhelpfulCount: row.unhelpful_count,
        viewCount: row.access_count,
        createdBy: {
          id: row.created_by_id,
          name: row.author_name
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      const total = rows.length > 0 ? rows[0].total_count : 0;
      const hasMore = parseInt(offset) + parseInt(limit) < total;

      res.json({
        success: true,
        articles,
        total,
        hasMore
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

      const row = await db.oneOrNone(query, params);

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
        tags: parseTags(row.tags),
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
  createRateLimit(15 * 60 * 1000, 20), // 20 articles per 15 minutes
  [
    body('title').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    body('content').isLength({ min: 1 }).withMessage('Content is required'),
    body('visibility').isIn(['public', 'internal', 'restricted', 'department_only']).withMessage('Invalid visibility level'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('systemContext').optional().isString(),
    body('verifiedSolution').optional().isBoolean()
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

      const {
        title,
        content,
        visibility,
        tags = [],
        systemContext,
        verifiedSolution = false
      } = req.body;

      const userId = req.user.id;
      const userRoles = req.user.roles || [];
      const canCreate = userRoles.some(r => ['technician','hr_user','ops_user','tech_lead','admin','superadmin'].includes(r));
      if (!canCreate) {
        return res.status(403).json({ success:false, error:'Insufficient permissions', errorCode:'INSUFFICIENT_PERMISSIONS' });
      }

      // Generate KB ID
      const row = await db.one(`
        SELECT COALESCE(MAX(CAST(SUBSTR(kb_id, 4) AS INTEGER)), 0) + 1 AS next_id
        FROM kb_articles
      `);

      const nextId = row.next_id;
      const kbId = `KB-${nextId.toString().padStart(5, '0')}`;

      // Insert new article
      const insertQuery = `
        INSERT INTO kb_articles (
          id, kb_id, title, body_markdown, visibility, tags, system_context,
          verified_solution, created_by_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      const articleId = require('uuid').v4();
      const now = new Date().toISOString();

      await db.none(insertQuery, [
        articleId,
        kbId,
        title,
        content,
        visibility,
        JSON.stringify(tags),
        systemContext || null,
        verifiedSolution,
        userId,
        now,
        now
      ]);

      // Fetch the created article with author info
      const newArticle = await db.one(`
        SELECT kb.*, u.name as author_name
        FROM kb_articles kb
        LEFT JOIN users u ON kb.created_by_id = u.id
        WHERE kb.id = $1
      `, [articleId]);

      const article = {
        id: newArticle.id,
        kbId: newArticle.kb_id,
        title: newArticle.title,
        content: newArticle.body_markdown,
        visibility: newArticle.visibility,
        tags: parseTags(newArticle.tags),
        systemContext: newArticle.system_context,
        verifiedSolution: newArticle.verified_solution,
        helpfulCount: 0,
        unhelpfulCount: 0,
        viewCount: 0,
        createdBy: {
          id: newArticle.created_by_id,
          name: newArticle.author_name
        },
        createdAt: newArticle.created_at,
        updatedAt: newArticle.updated_at
      };

      res.status(201).json({
        success: true,
        article
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
 * /api/v1/lore/articles/{kbId}:
 *   put:
 *     summary: Update a knowledge base article
 *     description: Edit an existing knowledge base article
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
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               visibility:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               systemContext:
 *                 type: string
 *               verifiedSolution:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Article updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Article not found
 */
router.put('/articles/:kbId',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20),
  async (req, res) => {
    try {
      const { kbId } = req.params;
      const userRoles = req.user.roles || [];
      const canEditAll = userRoles.some(r => ['admin', 'superadmin', 'tech_lead'].includes(r));
      const canEditOwn = userRoles.some(r => ['technician', 'hr_user', 'ops_user'].includes(r));

      const article = await db.oneOrNone('SELECT * FROM kb_articles WHERE kb_id = $1 AND deleted_at IS NULL', [kbId]);

      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found', errorCode: 'ARTICLE_NOT_FOUND' });
      }

      if (!canEditAll && !(canEditOwn && article.created_by_id === req.user.id)) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions', errorCode: 'INSUFFICIENT_PERMISSIONS' });
      }

      const {
        title = article.title,
        content = article.body_markdown,
        visibility = article.visibility,
        tags = parseTags(article.tags),
        systemContext = article.system_context,
        verifiedSolution = article.verified_solution
      } = req.body;

      const now = new Date().toISOString();

      const updateRow = await db.one(
        `UPDATE kb_articles SET title=$1, body_markdown=$2, visibility=$3, tags=$4, system_context=$5, verified_solution=$6, last_modified_by_id=$7, version=version+1, updated_at=$8 WHERE id=$9 RETURNING version`,
        [title, content, visibility, JSON.stringify(tags), systemContext, verifiedSolution, req.user.id, now, article.id]
      );

      await db.none(
        'INSERT INTO kb_article_versions (id, article_id, version, body_markdown, modified_by_id, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [require('uuid').v4(), article.id, updateRow.version, content, req.user.id, now]
      );

      res.json({ success: true });
    } catch (error) {
      logger.error('Error updating article:', error);
      res.status(500).json({ success: false, error: 'Failed to update article', errorCode: 'ARTICLE_UPDATE_ERROR' });
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
        tags: parseTags(row.tags),
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

export default router;
