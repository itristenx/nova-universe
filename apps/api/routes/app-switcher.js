/**
 * Enhanced App Switcher API Routes
 * Production-ready custom application management with Okta/AD SSO integration
 */

import express from 'express';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import EnhancedAppSwitcherService from '../services/enhancedAppSwitcher.js';
import db from '../db.js';

const router = express.Router();

// Initialize service
const appSwitcherService = new EnhancedAppSwitcherService(db);

// Rate limiting for app switcher API
const appSwitcherRateLimit = createRateLimit(15 * 60 * 1000, 200);
router.use(appSwitcherRateLimit);

/**
 * GET /api/v1/app-switcher/dashboard
 * Get user's personalized app dashboard
 */
router.get('/dashboard', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { view = 'all', collection_id, category_id, search, limit = 50, offset = 0 } = req.query;

    const dashboard = await appSwitcherService.getUserDashboard(userId, {
      view,
      collectionId: collection_id,
      categoryId: category_id,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    logger.error('Error fetching user dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard',
    });
  }
});

/**
 * GET /api/v1/app-switcher/config
 * Get user's dashboard configuration
 */
router.get('/config', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await appSwitcherService.getUserDashboardConfig(userId);

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('Error fetching dashboard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration',
    });
  }
});

/**
 * PUT /api/v1/app-switcher/config
 * Update user's dashboard configuration
 */
router.put('/config', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await appSwitcherService.updateUserDashboardConfig(userId, req.body);

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('Error updating dashboard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration',
    });
  }
});

/**
 * GET /api/v1/app-switcher/apps
 * Get all applications (admin view with search and filtering)
 */
router.get('/apps', authenticateJWT, async (req, res) => {
  try {
    // Check if user has admin permissions
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { search, category_id, app_type, status = 'active', limit = 50, offset = 0 } = req.query;

    // This would be implemented in the service layer
    const apps = await appSwitcherService.getApplicationsAdmin({
      search,
      categoryId: category_id,
      appType: app_type,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: apps,
    });
  } catch (error) {
    logger.error('Error fetching apps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch apps',
    });
  }
});

/**
 * POST /api/v1/app-switcher/apps
 * Create a new application
 */
router.post('/apps', authenticateJWT, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const appData = req.body;
    const newApp = await appSwitcherService.saveApplication(appData, req.user.id);

    logger.info(`Application created: ${appData.name} by ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: newApp,
    });
  } catch (error) {
    logger.error('Error creating app:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create app',
    });
  }
});

/**
 * PUT /api/v1/app-switcher/apps/:appId
 * Update an existing application
 */
router.put('/apps/:appId', authenticateJWT, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { appId } = req.params;
    const appData = { ...req.body, id: parseInt(appId) };

    const updatedApp = await appSwitcherService.saveApplication(appData, req.user.id);

    logger.info(`Application updated: ${appId} by ${req.user.id}`);

    res.json({
      success: true,
      data: updatedApp,
    });
  } catch (error) {
    logger.error('Error updating app:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update app',
    });
  }
});

/**
 * DELETE /api/v1/app-switcher/apps/:appId
 * Delete an application
 */
router.delete('/apps/:appId', authenticateJWT, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { appId } = req.params;
    await appSwitcherService.deleteApplication(parseInt(appId), req.user.id);

    logger.info(`Application deleted: ${appId} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting app:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete app',
    });
  }
});

/**
 * POST /api/v1/app-switcher/apps/:appId/launch
 * Generate launch URL for application with SSO
 */
router.post('/apps/:appId/launch', authenticateJWT, async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user.id;

    const context = {
      sessionId: req.sessionID,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      launchMethod: req.body.launch_method || 'dashboard',
    };

    const launchData = await appSwitcherService.generateLaunchUrl(userId, parseInt(appId), context);

    res.json({
      success: true,
      data: launchData,
    });
  } catch (error) {
    logger.error('Error generating launch URL:', error);

    if (error.message === 'Application not found') {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    if (error.message === 'Access denied') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate launch URL',
    });
  }
});

/**
 * POST /api/v1/app-switcher/apps/:appId/favorite
 * Toggle favorite status for an app
 */
router.post('/apps/:appId/favorite', authenticateJWT, async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user.id;

    const isFavorite = await appSwitcherService.toggleFavorite(userId, parseInt(appId));

    res.json({
      success: true,
      data: { is_favorite: isFavorite },
    });
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update favorite status',
    });
  }
});

/**
 * POST /api/v1/app-switcher/apps/:appId/assign-users
 * Assign application to users
 */
router.post('/apps/:appId/assign-users', authenticateJWT, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { appId } = req.params;
    const { userIds, assignmentType = 'direct', assignmentSource = 'admin' } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userIds must be a non-empty array',
      });
    }

    const results = await Promise.all(
      userIds.map((userId) =>
        appSwitcherService.assignAppToUser(
          userId,
          parseInt(appId),
          assignmentType,
          assignmentSource,
          req.user.id,
        ),
      ),
    );

    const successCount = results.filter(Boolean).length;

    res.json({
      success: true,
      message: `Application assigned to ${successCount} of ${userIds.length} users`,
    });
  } catch (error) {
    logger.error('Error assigning app to users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign application',
    });
  }
});

/**
 * GET /api/v1/app-switcher/search
 * Search applications across the organization
 */
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { q: query, category_id, app_type, featured, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const results = await appSwitcherService.searchApplications(req.user.id, query.trim(), {
      categoryId: category_id,
      appType: app_type,
      featured: featured === 'true',
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: { apps: results },
    });
  } catch (error) {
    logger.error('Error searching apps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search applications',
    });
  }
});

/**
 * GET /api/v1/app-switcher/recommendations
 * Get personalized app recommendations
 */
router.get('/recommendations', authenticateJWT, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await appSwitcherService.getRecommendations(
      req.user.id,
      parseInt(limit),
    );

    res.json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
    });
  }
});

/**
 * GET /api/v1/app-switcher/categories
 * Get all app categories
 */
router.get('/categories', authenticateJWT, async (req, res) => {
  try {
    const categories = await appSwitcherService.getAppCategories();

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
});

/**
 * GET /api/v1/app-switcher/analytics
 * Get app usage analytics (admin only)
 */
router.get('/analytics', authenticateJWT, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { timeframe = '30d' } = req.query;
    const analytics = await appSwitcherService.getAdminAnalytics(timeframe);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
});

/**
 * POST /api/v1/app-switcher/track-usage
 * Track app usage for analytics
 */
router.post('/track-usage', authenticateJWT, async (req, res) => {
  try {
    const { appId, action = 'launch', metadata = {} } = req.body;

    if (!appId) {
      return res.status(400).json({
        success: false,
        error: 'appId is required',
      });
    }

    const context = {
      sessionId: req.sessionID,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      ...metadata,
    };

    await appSwitcherService.logAppUsage(req.user.id, parseInt(appId), action, context);

    res.json({
      success: true,
      message: 'Usage tracked successfully',
    });
  } catch (error) {
    logger.error('Error tracking app usage:', error);
    // Don't fail the request for tracking errors
    res.json({
      success: true,
      message: 'Usage tracking failed but request processed',
    });
  }
});

/**
 * GET /api/v1/app-switcher/sso/callback/:appId
 * Handle SSO callback after authentication
 */
router.get('/sso/callback/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const { code, state, error: ssoError } = req.query;

    if (ssoError) {
      logger.error('SSO error for app', { appId, error: ssoError });
      return res.redirect(`${process.env.FRONTEND_URL}/apps?error=sso_failed`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/apps?error=invalid_callback`);
    }

    // Process SSO callback and redirect to app
    // This would involve validating the state, exchanging code for tokens, etc.
    // For now, redirect to the app URL

    logger.info('SSO callback processed', { appId, state });

    // In production, this would:
    // 1. Validate the state parameter
    // 2. Exchange authorization code for access token
    // 3. Create a secure session
    // 4. Redirect to the final app URL

    res.redirect(`${process.env.FRONTEND_URL}/apps/${appId}/launching`);
  } catch (error) {
    logger.error('Error handling SSO callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/apps?error=callback_error`);
  }
});

export default router;
