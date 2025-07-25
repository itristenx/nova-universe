// nova-api/routes/lore.js
// Nova Lore - Knowledge Base Routes
import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
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

      // Visibility filters based on user permissions
      if (!isAdmin) {
        query += ` AND (kb.visibility = 'public' OR kb.visibility = 'internal')`;
      }

      if (search) {
        query += ` AND (kb.title ILIKE ? OR kb.body_markdown ILIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        query += ` AND kb.tags && ?`;
        params.push(JSON.stringify(tagList));
      }

      if (systemContext) {
        query += ` AND kb.system_context = ?`;
        params.push(systemContext);
      }

      if (visibility) {
        query += ` AND kb.visibility = ?`;
        params.push(visibility);
      }

      if (verifiedOnly === 'true') {
        query += ` AND kb.verified_solution = true`;
      }

      query += ` ORDER BY kb.helpful_count DESC, kb.updated_at DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));

      db.all(query, params, (err, rows) => {
        if (err) {
          logger.error('Error fetching knowledge articles:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch articles',
            errorCode: 'ARTICLES_FETCH_ERROR'
          });
        }

        const articles = (rows || []).map(row => ({
          id: row.id,
          kbId: row.kb_id,
          title: row.title,
          content: row.body_markdown,
          excerpt: row.body_markdown ? row.body_markdown.substring(0, 200) + '...' : '',
          visibility: row.visibility,
          tags: row.tags ? JSON.parse(row.tags) : [],
          systemContext: row.system_context,
          verifiedSolution: row.verified_solution,
          helpfulCount: row.helpful_count || 0,
          unhelpfulCount: row.unhelpful_count || 0,
          viewCount: row.access_count || 0,
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
      });
    } catch (error) {
      logger.error('Error in articles endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch articles',
        errorCode: 'ARTICLES_ERROR'
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
        WHERE kb.kb_id = ? AND kb.deleted_at IS NULL
      `;
      const params = [kbId];

      // Add visibility restrictions for non-admin users
      if (!isAdmin) {
        query += ` AND (kb.visibility = 'public' OR kb.visibility = 'internal')`;
      }

      db.get(query, params, (err, row) => {
        if (err) {
          logger.error('Error fetching knowledge article:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch article',
            errorCode: 'ARTICLE_FETCH_ERROR'
          });
        }

        if (!row) {
          return res.status(404).json({
            success: false,
            error: 'Article not found',
            errorCode: 'ARTICLE_NOT_FOUND'
          });
        }

        // Increment view count
        db.run('UPDATE kb_articles SET access_count = access_count + 1 WHERE id = ?', [row.id]);

        const article = {
          id: row.id,
          kbId: row.kb_id,
          title: row.title,
          content: row.body_markdown,
          visibility: row.visibility,
          tags: row.tags ? JSON.parse(row.tags) : [],
          systemContext: row.system_context,
          verifiedSolution: row.verified_solution,
          helpfulCount: row.helpful_count || 0,
          unhelpfulCount: row.unhelpful_count || 0,
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

      // Generate KB ID
      db.get('SELECT MAX(CAST(SUBSTR(kb_id, 4) AS INTEGER)) as max_id FROM kb_articles', [], (err, row) => {
        if (err) {
          logger.error('Error generating KB ID:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to create article',
            errorCode: 'KB_ID_ERROR'
          });
        }

        const nextId = (row?.max_id || 0) + 1;
        const kbId = `KB-${nextId.toString().padStart(5, '0')}`;

        // Insert new article
        const insertQuery = `
          INSERT INTO kb_articles (
            id, kb_id, title, body_markdown, visibility, tags, system_context,
            verified_solution, created_by_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const articleId = require('uuid').v4();
        const now = new Date().toISOString();

        db.run(insertQuery, [
          articleId,
          kbId,
          title,
          content,
          visibility,
          JSON.stringify(tags),
          systemContext || null,
          verifiedSolution ? 1 : 0,
          userId,
          now,
          now
        ], function(insertErr) {
          if (insertErr) {
            logger.error('Error creating article:', insertErr);
            return res.status(500).json({
              success: false,
              error: 'Failed to create article',
              errorCode: 'ARTICLE_CREATE_ERROR'
            });
          }

          // Fetch the created article with author info
          db.get(`
            SELECT kb.*, u.name as author_name
            FROM kb_articles kb
            LEFT JOIN users u ON kb.created_by_id = u.id
            WHERE kb.id = ?
          `, [articleId], (fetchErr, newArticle) => {
            if (fetchErr) {
              logger.error('Error fetching created article:', fetchErr);
              return res.status(500).json({
                success: false,
                error: 'Article created but failed to fetch',
                errorCode: 'ARTICLE_FETCH_ERROR'
              });
            }

            const article = {
              id: newArticle.id,
              kbId: newArticle.kb_id,
              title: newArticle.title,
              content: newArticle.body_markdown,
              visibility: newArticle.visibility,
              tags: newArticle.tags ? JSON.parse(newArticle.tags) : [],
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
          });
        });
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
      db.get('SELECT id FROM kb_articles WHERE kb_id = ? AND deleted_at IS NULL', [kbId], (err, article) => {
        if (err) {
          logger.error('Error checking article:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to submit feedback',
            errorCode: 'ARTICLE_CHECK_ERROR'
          });
        }

        if (!article) {
          return res.status(404).json({
            success: false,
            error: 'Article not found',
            errorCode: 'ARTICLE_NOT_FOUND'
          });
        }

        // Update feedback counts
        const updateField = helpful ? 'helpful_count' : 'unhelpful_count';
        db.run(`UPDATE kb_articles SET ${updateField} = ${updateField} + 1 WHERE id = ?`, [article.id], (updateErr) => {
          if (updateErr) {
            logger.error('Error updating feedback:', updateErr);
            return res.status(500).json({
              success: false,
              error: 'Failed to submit feedback',
              errorCode: 'FEEDBACK_UPDATE_ERROR'
            });
          }

          // If there's a comment, store it in the feedback table
          if (comment) {
            db.run(
              'INSERT INTO feedback (name, message, user_id, timestamp) VALUES (?, ?, ?, ?)',
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
        });
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
                 WHEN kb.title ILIKE ? THEN 3
                 WHEN kb.body_markdown ILIKE ? THEN 2
                 WHEN kb.tags ILIKE ? THEN 1
                 ELSE 0
               END) as relevance_score
        FROM kb_articles kb
        LEFT JOIN users u ON kb.created_by_id = u.id
        WHERE kb.deleted_at IS NULL
        AND (kb.title ILIKE ? OR kb.body_markdown ILIKE ? OR kb.tags ILIKE ?)
      `;

      const searchTerm = `%${q}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      // Add visibility restrictions for non-admin users
      if (!isAdmin) {
        query += ` AND (kb.visibility = 'public' OR kb.visibility = 'internal')`;
      }

      query += ` ORDER BY relevance_score DESC, kb.helpful_count DESC, kb.updated_at DESC LIMIT ?`;
      params.push(parseInt(limit));

      db.all(query, params, (err, rows) => {
        if (err) {
          logger.error('Error searching articles:', err);
          return res.status(500).json({
            success: false,
            error: 'Search failed',
            errorCode: 'SEARCH_ERROR'
          });
        }

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
          helpfulCount: row.helpful_count || 0,
          unhelpfulCount: row.unhelpful_count || 0,
          viewCount: row.access_count || 0,
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
