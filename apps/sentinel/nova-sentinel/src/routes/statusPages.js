// Nova Sentinel - Status Pages Routes
// Complete 1:1 Uptime Kuma Status Page Feature Parity

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for status page operations
const statusPageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Higher limit for public status pages
  message: 'Too many status page requests, please try again later.'
});

router.use(statusPageRateLimit);

// Authentication middleware for protected routes
async function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const user = await req.services.helix.validateToken(token);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next(); // Continue without auth for public pages
  }
}

// Required auth for admin operations
async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const user = await req.services.helix.validateToken(token);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
}

// ========================================================================
// STATUS PAGE MANAGEMENT - 1:1 UPTIME KUMA PARITY
// ========================================================================

/**
 * @swagger
 * /api/v1/status-pages:
 *   get:
 *     tags: [Status Pages]
 *     summary: Get all status pages (admin only)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, published, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Get status pages from Uptime Kuma
    const statusPages = await req.services.uptimeKuma.getAllStatusPages();
    
    // Apply filters
    let filteredPages = statusPages;
    
    if (search) {
      filteredPages = filteredPages.filter(page => 
        page.title?.toLowerCase().includes(search.toLowerCase()) ||
        page.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (published !== undefined) {
      filteredPages = filteredPages.filter(page => page.published === (published === 'true'));
    }

    // Apply pagination
    const paginatedPages = filteredPages.slice(offset, offset + parseInt(limit));

    // Enrich with Helix user preferences
    const enrichedPages = await Promise.all(
      paginatedPages.map(async (page) => {
        const preferences = await req.services.helix.getUserPreference(
          userId, 
          `sentinel.status-page.${page.id}`,
          { favorite: false, lastViewed: null }
        );

        // Get page statistics
        const stats = await req.services.statusPages.getPageStats(page.id);

        return {
          ...page,
          userPreferences: preferences,
          stats,
          publicUrl: `/api/v1/status-pages/public/${page.slug || page.id}`
        };
      })
    );

    res.json({
      success: true,
      statusPages: enrichedPages,
      pagination: {
        total: filteredPages.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + parseInt(limit) < filteredPages.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status pages list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve status pages',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/status-pages:
 *   post:
 *     tags: [Status Pages]
 *     summary: Create new status page
 */
router.post('/', requireAuth,
  [
    body('title').isString().isLength({ min: 1, max: 150 }).withMessage('Status page title required (1-150 chars)'),
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Description too long (max 500 chars)'),
    body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
    body('published').optional().isBoolean(),
    body('showTags').optional().isBoolean(),
    body('showPoweredBy').optional().isBoolean(),
    body('customCSS').optional().isString().isLength({ max: 10000 }).withMessage('Custom CSS too long (max 10000 chars)'),
    body('footerText').optional().isString().isLength({ max: 200 }).withMessage('Footer text too long (max 200 chars)'),
    body('icon').optional().isString().isLength({ max: 500 }).withMessage('Icon URL too long'),
    body('domainNameList').optional().isArray(),
    body('publicGroupList').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      
      // Create slug if not provided
      if (!req.body.slug) {
        req.body.slug = req.body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Create status page in Uptime Kuma
      const statusPage = await req.services.uptimeKuma.createStatusPage(req.body);

      // Store in Nova database for correlation
      await req.services.database.createStatusPage({
        uptimeKumaId: statusPage.id,
        createdBy: userId,
        tenantId: req.user.tenantId,
        title: statusPage.title,
        slug: statusPage.slug,
        config: statusPage
      });

      // Set default user preferences in Helix
      await req.services.helix.setUserPreference(
        userId,
        `sentinel.status-page.${statusPage.id}`,
        { 
          favorite: false, 
          createdAt: new Date().toISOString()
        }
      );

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('status_page_created', statusPage);

      res.status(201).json({
        success: true,
        statusPage: {
          ...statusPage,
          publicUrl: `/api/v1/status-pages/public/${statusPage.slug || statusPage.id}`
        },
        message: 'Status page created successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status page creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create status page',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/status-pages/{id}:
 *   get:
 *     tags: [Status Pages]
 *     summary: Get status page details (admin only)
 */
router.get('/:id', requireAuth,
  [param('id').isString().withMessage('Status page ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get status page from Uptime Kuma
      const statusPage = await req.services.uptimeKuma.getStatusPage(id);
      if (!statusPage) {
        return res.status(404).json({
          success: false,
          error: 'Status page not found'
        });
      }

      // Get user preferences
      const preferences = await req.services.helix.getUserPreference(
        userId,
        `sentinel.status-page.${id}`,
        { favorite: false, lastViewed: null }
      );

      // Update last viewed timestamp
      await req.services.helix.setUserPreference(
        userId,
        `sentinel.status-page.${id}`,
        { ...preferences, lastViewed: new Date().toISOString() }
      );

      // Get page statistics and monitor data
      const [stats, monitors] = await Promise.all([
        req.services.statusPages.getPageStats(id),
        req.services.statusPages.getPageMonitors(id)
      ]);

      res.json({
        success: true,
        statusPage: {
          ...statusPage,
          userPreferences: preferences,
          stats,
          monitors,
          publicUrl: `/api/v1/status-pages/public/${statusPage.slug || id}`
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status page details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve status page details',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/status-pages/{id}:
 *   put:
 *     tags: [Status Pages]
 *     summary: Update status page
 */
router.put('/:id', requireAuth,
  [
    param('id').isString().withMessage('Status page ID required'),
    body('title').optional().isString().isLength({ min: 1, max: 150 }),
    body('description').optional().isString().isLength({ max: 500 }),
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('customCSS').optional().isString().isLength({ max: 10000 })
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Update status page in Uptime Kuma
      const statusPage = await req.services.uptimeKuma.updateStatusPage(id, req.body);

      // Update in Nova database
      await req.services.database.updateStatusPage(id, {
        updatedBy: userId,
        config: statusPage,
        updatedAt: new Date().toISOString()
      });

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('status_page_updated', statusPage);

      res.json({
        success: true,
        statusPage,
        message: 'Status page updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status page update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update status page',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/status-pages/{id}:
 *   delete:
 *     tags: [Status Pages]
 *     summary: Delete status page
 */
router.delete('/:id', requireAuth,
  [param('id').isString().withMessage('Status page ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Delete from Uptime Kuma
      await req.services.uptimeKuma.deleteStatusPage(id);

      // Delete from Nova database
      await req.services.database.deleteStatusPage(id);

      // Clean up user preferences
      await req.services.helix.deleteUserPreference(userId, `sentinel.status-page.${id}`);

      // Emit real-time update
      req.io.to(`tenant_${req.user.tenantId}`).emit('status_page_deleted', { id });

      res.json({
        success: true,
        message: 'Status page deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status page deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete status page',
        details: error.message
      });
    }
  }
);

// ========================================================================
// PUBLIC STATUS PAGE ACCESS (No Authentication Required)
// ========================================================================

/**
 * @swagger
 * /api/v1/status-pages/public/{slugOrId}:
 *   get:
 *     tags: [Status Pages]
 *     summary: Get public status page (no auth required)
 */
router.get('/public/:slugOrId', optionalAuth, async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const { format = 'html' } = req.query;

    // Get status page (try by slug first, then by ID)
    let statusPage = await req.services.statusPages.getBySlug(slugOrId);
    if (!statusPage) {
      statusPage = await req.services.uptimeKuma.getStatusPage(slugOrId);
    }

    if (!statusPage || !statusPage.published) {
      return res.status(404).json({
        success: false,
        error: 'Status page not found or not published'
      });
    }

    // Get monitors and their current status
    const monitors = await req.services.statusPages.getPageMonitors(statusPage.id);
    
    // Enrich monitors with current status and uptime
    const enrichedMonitors = await Promise.all(
      monitors.map(async (monitor) => {
        const heartbeat = req.services.monitoring.getLatestHeartbeat(monitor.id);
        const uptime = await req.services.monitoring.getUptimeStats(monitor.id, '30d');
        
        return {
          id: monitor.id,
          name: monitor.name,
          status: heartbeat?.status === 1 ? 'up' : 'down',
          uptime: uptime,
          lastHeartbeat: heartbeat?.time,
          responseTime: heartbeat?.ping,
          type: monitor.type,
          tags: monitor.tags || []
        };
      })
    );

    // Get active incidents and maintenance
    const [incidents, maintenance] = await Promise.all([
      req.services.statusPages.getPageIncidents(statusPage.id),
      req.services.statusPages.getPageMaintenance(statusPage.id)
    ]);

    // Calculate overall status
    const overallStatus = req.services.statusPages.calculateOverallStatus(enrichedMonitors);

    // Track view if user is authenticated (store in Helix)
    if (req.user) {
      await req.services.helix.setUserPreference(
        req.user.id,
        `sentinel.status-page.${statusPage.id}`,
        { lastPublicView: new Date().toISOString() }
      );
    }

    // Return JSON format
    if (format === 'json') {
      return res.json({
        success: true,
        statusPage: {
          id: statusPage.id,
          title: statusPage.title,
          description: statusPage.description,
          theme: statusPage.theme || 'light',
          icon: statusPage.icon,
          footerText: statusPage.footerText,
          showPoweredBy: statusPage.showPoweredBy !== false,
          overallStatus,
          monitors: enrichedMonitors,
          incidents,
          maintenance,
          lastUpdated: new Date().toISOString()
        }
      });
    }

    // Return HTML format (default)
    const html = await req.services.statusPages.generateHTML(statusPage, {
      monitors: enrichedMonitors,
      incidents,
      maintenance,
      overallStatus
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Public status page error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load status page',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/status-pages/public/{slugOrId}/embed:
 *   get:
 *     tags: [Status Pages]
 *     summary: Get embeddable status page widget
 */
router.get('/public/:slugOrId/embed', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const { theme = 'light', compact = false } = req.query;

    // Get status page
    let statusPage = await req.services.statusPages.getBySlug(slugOrId);
    if (!statusPage) {
      statusPage = await req.services.uptimeKuma.getStatusPage(slugOrId);
    }

    if (!statusPage || !statusPage.published) {
      return res.status(404).send('<div>Status page not found</div>');
    }

    // Get monitors and calculate status
    const monitors = await req.services.statusPages.getPageMonitors(statusPage.id);
    const enrichedMonitors = await Promise.all(
      monitors.map(async (monitor) => {
        const heartbeat = req.services.monitoring.getLatestHeartbeat(monitor.id);
        return {
          name: monitor.name,
          status: heartbeat?.status === 1 ? 'up' : 'down'
        };
      })
    );

    const overallStatus = req.services.statusPages.calculateOverallStatus(enrichedMonitors);

    // Generate embed HTML
    const embedHTML = await req.services.statusPages.generateEmbedHTML(statusPage, {
      monitors: enrichedMonitors,
      overallStatus,
      theme,
      compact: compact === 'true'
    });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.send(embedHTML);

  } catch (error) {
    console.error('Status page embed error:', error);
    res.status(500).send('<div>Error loading status page</div>');
  }
});

/**
 * @swagger
 * /api/v1/status-pages/public/{slugOrId}/subscribe:
 *   post:
 *     tags: [Status Pages]
 *     summary: Subscribe to status page updates
 */
router.post('/public/:slugOrId/subscribe',
  [
    param('slugOrId').isString().withMessage('Status page ID or slug required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('types').optional().isArray().withMessage('Notification types must be array')
  ],
  async (req, res) => {
    try {
      const { slugOrId } = req.params;
      const { email, types = ['incidents', 'maintenance'] } = req.body;

      // Get status page
      let statusPage = await req.services.statusPages.getBySlug(slugOrId);
      if (!statusPage) {
        statusPage = await req.services.uptimeKuma.getStatusPage(slugOrId);
      }

      if (!statusPage || !statusPage.published) {
        return res.status(404).json({
          success: false,
          error: 'Status page not found'
        });
      }

      // Create subscription
      await req.services.statusPages.createSubscription({
        statusPageId: statusPage.id,
        email,
        types,
        confirmed: false
      });

      // Send confirmation email
      await req.services.notifications.sendSubscriptionConfirmation({
        email,
        statusPageTitle: statusPage.title,
        confirmationUrl: `${req.protocol}://${req.get('host')}/api/v1/status-pages/confirm-subscription`
      });

      res.json({
        success: true,
        message: 'Subscription created. Please check your email to confirm.',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status page subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create subscription',
        details: error.message
      });
    }
  }
);

// ========================================================================
// STATUS PAGE INCIDENT MANAGEMENT
// ========================================================================

/**
 * @swagger
 * /api/v1/status-pages/{id}/incidents:
 *   post:
 *     tags: [Status Pages]
 *     summary: Create status page incident
 */
router.post('/:id/incidents', requireAuth,
  [
    param('id').isString().withMessage('Status page ID required'),
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Incident title required'),
    body('content').isString().isLength({ min: 1, max: 2000 }).withMessage('Incident content required'),
    body('style').optional().isIn(['info', 'warning', 'danger', 'primary']).withMessage('Invalid incident style')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Create incident in Uptime Kuma
      const incident = await req.services.uptimeKuma.createIncident({
        ...req.body,
        statusPageList: [id]
      });

      // Store in Nova database
      await req.services.database.createIncident({
        uptimeKumaId: incident.id,
        statusPageId: id,
        createdBy: userId,
        title: incident.title,
        content: incident.content,
        style: incident.style
      });

      // Notify subscribers
      await req.services.notifications.notifyStatusPageSubscribers(id, {
        type: 'incident',
        title: incident.title,
        content: incident.content
      });

      // Emit real-time update
      req.io.to(`status_page_${id}`).emit('incident_created', incident);

      res.status(201).json({
        success: true,
        incident,
        message: 'Incident created successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Incident creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create incident',
        details: error.message
      });
    }
  }
);

// ========================================================================
// USER PREFERENCES (Helix Integration)
// ========================================================================

/**
 * @swagger
 * /api/v1/status-pages/{id}/favorite:
 *   post:
 *     tags: [Status Pages]
 *     summary: Add status page to favorites (stored in Helix)
 */
router.post('/:id/favorite', requireAuth,
  [param('id').isString().withMessage('Status page ID required')],
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const preferences = await req.services.helix.getUserPreference(
        userId,
        `sentinel.status-page.${id}`,
        { favorite: false }
      );

      await req.services.helix.setUserPreference(
        userId,
        `sentinel.status-page.${id}`,
        { ...preferences, favorite: true, favoritedAt: new Date().toISOString() }
      );

      res.json({
        success: true,
        message: 'Status page added to favorites',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Favorite status page error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to favorite status page',
        details: error.message
      });
    }
  }
);

export default router;
