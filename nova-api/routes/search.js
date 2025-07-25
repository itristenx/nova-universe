// nova-api/routes/search.js
// Search API routes for end-user functionality
import express from 'express';
import elasticManager from '../database/elastic.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { body, query, validationResult } from 'express-validator';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         score:
 *           type: number
 *         highlight:
 *           type: object
 *         metadata:
 *           type: object
 *     
 *     SearchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SearchResult'
 *         total:
 *           type: object
 *           properties:
 *             value:
 *               type: number
 *             relation:
 *               type: string
 *         maxScore:
 *           type: number
 *         searchType:
 *           type: string
 *           enum: [lexical, semantic, hybrid]
 *         responseTime:
 *           type: number
 */

/**
 * @swagger
 * /api/v1/search/tickets:
 *   get:
 *     summary: Search tickets
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by priority
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Filter by assignee ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, newest, oldest, updated, priority]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Results per page
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     took:
 *                       type: integer
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Search service error
 */
router.get('/tickets', 
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  [
    query('q')
      .isLength({ min: 1, max: 500 })
      .withMessage('Query must be between 1 and 500 characters')
      .trim(),
    query('size')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Size must be between 1 and 100'),
    query('from')
      .optional()
      .isInt({ min: 0 })
      .withMessage('From must be a non-negative integer'),
    query('status')
      .optional()
      .isIn(['open', 'closed', 'in_progress', 'resolved'])
      .withMessage('Invalid status value'),
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority value'),
    query('sort')
      .optional()
      .isIn(['relevance', 'date_desc', 'date_asc', 'priority'])
      .withMessage('Invalid sort value')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
          details: errors.array(),
          errorCode: 'INVALID_SEARCH_PARAMS'
        });
      }

      const { q, status, priority, category, size = 20, from = 0, sort = 'relevance' } = req.query;
      const userId = req.user?.id;

      const startTime = Date.now();

      // Build filters
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (category) filters.category = category;
      if (userId) filters.userId = userId; // Optional: filter by user's tickets

      // Build sort options
      let sortOptions;
      switch (sort) {
        case 'date_desc':
          sortOptions = [{ updatedAt: { order: 'desc' } }];
          break;
        case 'date_asc':
          sortOptions = [{ updatedAt: { order: 'asc' } }];
          break;
        case 'priority':
          sortOptions = [
            { priority: { order: 'desc' } },
            { _score: { order: 'desc' } }
          ];
          break;
        default: // relevance
          sortOptions = [
            { _score: { order: 'desc' } },
            { updatedAt: { order: 'desc' } }
          ];
      }

      const options = {
        size: parseInt(size),
        from: parseInt(from),
        sort: sortOptions
      };

      const results = await elasticManager.searchTickets(q, filters, options);
      const responseTime = Date.now() - startTime;

      logger.info(`Ticket search completed`, {
        query: q,
        userId,
        resultsCount: results.hits.length,
        responseTime,
        filters,
        sort
      });

      res.json({
        success: true,
        results: results.hits,
        total: results.total,
        maxScore: results.maxScore,
        searchType: 'lexical',
        responseTime,
        filters,
        sort
      });

    } catch (error) {
      logger.error('Ticket search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Ticket search failed',
        errorCode: 'TICKET_SEARCH_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/search/knowledge-base:
 *   get:
 *     summary: Search knowledge base articles
 *     description: Search through knowledge base articles with enhanced semantic capabilities
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *         description: Search query string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by article category
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [public, private, internal]
 *           default: public
 *         description: Filter by article visibility
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results to return
 *       - in: query
 *         name: from
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Offset for pagination
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [lexical, semantic, hybrid]
 *           default: hybrid
 *         description: Type of search to perform
 *     responses:
 *       200:
 *         description: Knowledge base search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Search failed
 */
router.get('/knowledge-base',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 60), // 60 requests per 15 minutes
  [
    query('q')
      .isLength({ min: 1, max: 500 })
      .withMessage('Query must be between 1 and 500 characters')
      .trim(),
    query('size')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Size must be between 1 and 50'),
    query('from')
      .optional()
      .isInt({ min: 0 })
      .withMessage('From must be a non-negative integer'),
    query('visibility')
      .optional()
      .isIn(['public', 'private', 'internal'])
      .withMessage('Invalid visibility value'),
    query('type')
      .optional()
      .isIn(['lexical', 'semantic', 'hybrid'])
      .withMessage('Invalid search type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
          details: errors.array(),
          errorCode: 'INVALID_SEARCH_PARAMS'
        });
      }

      const { q, category, visibility = 'public', size = 10, from = 0, type = 'hybrid' } = req.query;
      const userId = req.user?.id;

      const startTime = Date.now();

      // Build filters
      const filters = { visibility };
      if (category) filters.category = category;
      if (userId) filters.userId = userId;

      const options = {
        size: parseInt(size),
        from: parseInt(from),
        searchType: type
      };

      let results;
      if (type === 'semantic') {
        results = await elasticManager.semanticSearchKnowledgeBase(q, filters, options);
      } else if (type === 'hybrid') {
        results = await elasticManager.hybridSearchKnowledgeBase(q, filters, options);
      } else {
        results = await elasticManager.searchKnowledgeBase(q, filters, options);
      }

      const responseTime = Date.now() - startTime;

      logger.info(`Knowledge base search completed`, {
        query: q,
        userId,
        searchType: type,
        resultsCount: results.hits.length,
        responseTime,
        filters
      });

      res.json({
        success: true,
        results: results.hits,
        total: results.total,
        maxScore: results.maxScore,
        searchType: type,
        responseTime,
        filters
      });

    } catch (error) {
      logger.error('Knowledge base search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Knowledge base search failed',
        errorCode: 'KB_SEARCH_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/search/global:
 *   get:
 *     summary: Global search across all content types
 *     description: Search across tickets, knowledge base, and other content with aggregated results
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *         description: Search query string
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           default: tickets,knowledge_base
 *         description: Comma-separated list of content types to search (tickets,knowledge_base,logs)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results per content type
 *     responses:
 *       200:
 *         description: Global search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       $ref: '#/components/schemas/SearchResponse'
 *                     knowledge_base:
 *                       $ref: '#/components/schemas/SearchResponse'
 *                 responseTime:
 *                   type: number
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Search failed
 */
router.get('/global',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 requests per 15 minutes
  [
    query('q')
      .isLength({ min: 1, max: 500 })
      .withMessage('Query must be between 1 and 500 characters')
      .trim(),
    query('size')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Size must be between 1 and 100'),
    query('types')
      .optional()
      .custom((value) => {
        const validTypes = ['tickets', 'knowledge_base', 'logs'];
        const types = value.split(',').map(t => t.trim());
        return types.every(type => validTypes.includes(type));
      })
      .withMessage('Invalid content types')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
          details: errors.array(),
          errorCode: 'INVALID_SEARCH_PARAMS'
        });
      }

      const { q, types = 'tickets,knowledge_base', size = 20 } = req.query;
      const userId = req.user?.id;
      const contentTypes = types.split(',').map(t => t.trim());

      const startTime = Date.now();
      const results = {};

      // Search across different content types in parallel
      const searchPromises = [];

      if (contentTypes.includes('tickets')) {
        searchPromises.push(
          elasticManager.searchTickets(q, { userId }, { size: parseInt(size) })
            .then(result => ({ type: 'tickets', result }))
            .catch(error => ({ type: 'tickets', error: error.message }))
        );
      }

      if (contentTypes.includes('knowledge_base')) {
        searchPromises.push(
          elasticManager.hybridSearchKnowledgeBase(q, { visibility: 'public' }, { size: parseInt(size) })
            .then(result => ({ type: 'knowledge_base', result }))
            .catch(error => ({ type: 'knowledge_base', error: error.message }))
        );
      }

      if (contentTypes.includes('logs')) {
        searchPromises.push(
          elasticManager.searchLogs(q, { userId }, { size: parseInt(size) })
            .then(result => ({ type: 'logs', result }))
            .catch(error => ({ type: 'logs', error: error.message }))
        );
      }

      const searchResults = await Promise.allSettled(searchPromises);
      
      // Process results
      searchResults.forEach(({ status, value }) => {
        if (status === 'fulfilled' && value) {
          if (value.error) {
            results[value.type] = { error: value.error };
          } else {
            results[value.type] = {
              hits: value.result.hits,
              total: value.result.total,
              maxScore: value.result.maxScore
            };
          }
        }
      });

      const responseTime = Date.now() - startTime;

      logger.info(`Global search completed`, {
        query: q,
        userId,
        contentTypes,
        responseTime,
        resultsCount: Object.keys(results).length
      });

      res.json({
        success: true,
        results,
        responseTime,
        searchTypes: contentTypes
      });

    } catch (error) {
      logger.error('Global search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Global search failed',
        errorCode: 'GLOBAL_SEARCH_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/search/suggestions:
 *   get:
 *     summary: Get search suggestions and autocomplete
 *     description: Get search term suggestions based on popular queries and content
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Partial search query for suggestions
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [tickets, knowledge_base, all]
 *           default: all
 *         description: Content type for suggestions
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Maximum number of suggestions
 *     responses:
 *       200:
 *         description: Search suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                       score:
 *                         type: number
 *                       type:
 *                         type: string
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Suggestions failed
 */
router.get('/suggestions',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 200), // 200 requests per 15 minutes
  [
    query('q')
      .isLength({ min: 1, max: 100 })
      .withMessage('Query must be between 1 and 100 characters')
      .trim(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be between 1 and 20'),
    query('type')
      .optional()
      .isIn(['tickets', 'knowledge_base', 'all'])
      .withMessage('Invalid suggestion type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: errors.array(),
          errorCode: 'INVALID_SUGGESTION_PARAMS'
        });
      }

      const { q, type = 'all', limit = 10 } = req.query;
      const userId = req.user?.id;

      const suggestions = await elasticManager.getSearchSuggestions(q, {
        type,
        limit: parseInt(limit),
        userId
      });

      res.json({
        success: true,
        suggestions,
        query: q,
        type
      });

    } catch (error) {
      logger.error('Search suggestions failed:', error);
      res.status(500).json({
        success: false,
        error: 'Suggestions failed',
        errorCode: 'SUGGESTIONS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/search/analytics:
 *   get:
 *     summary: Get search analytics and metrics
 *     description: Get analytics data about search usage and performance (admin only)
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *           default: 7d
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Search analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Analytics failed
 */
router.get('/analytics',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 30), // 30 requests per 15 minutes
  async (req, res) => {
    try {
      // Check if user has admin role
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('superadmin')) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          errorCode: 'ADMIN_ACCESS_REQUIRED'
        });
      }

      const { timeRange = '7d' } = req.query;

      const analytics = await elasticManager.getSearchAnalytics(timeRange);

      res.json({
        success: true,
        analytics,
        timeRange
      });

    } catch (error) {
      logger.error('Search analytics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Analytics failed',
        errorCode: 'ANALYTICS_ERROR'
      });
    }
  }
);

export default router;
