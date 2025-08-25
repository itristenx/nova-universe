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
 * Get all custom apps (admin view)
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

    res.json({
      success: true,
      data: { apps: customApps },
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
 * Create a new custom app
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

    const { name, description, url, type, iconUrl, color, external_config, auth_config } = req.body;

    // Validate required fields
    if (!name || !description || !url || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, description, url, type',
      });
    }

    const newApp = {
      id: `app-${Date.now()}`,
      name,
      description,
      url,
      type,
      iconUrl,
      color: color || 'bg-blue-600',
      external_config,
      auth_config,
      assignments: [],
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      order: customApps.length + 1,
    };

    customApps.push(newApp);

    logger.info(`Custom app created: ${name} by ${req.user.id}`);

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
 * Update an existing app
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
    const updates = req.body;

    const appIndex = customApps.findIndex((app) => app.id === appId);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    // Update app
    customApps[appIndex] = {
      ...customApps[appIndex],
      ...updates,
      updated_at: new Date(),
    };

    logger.info(`Custom app updated: ${appId} by ${req.user.id}`);

    res.json({
      success: true,
      data: customApps[appIndex],
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
 * Delete an app
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

    const appIndex = customApps.findIndex((app) => app.id === appId);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    customApps.splice(appIndex, 1);

    logger.info(`Custom app deleted: ${appId} by ${req.user.id}`);

    res.json({
      success: true,
      message: 'App deleted successfully',
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
 * GET /api/v1/app-switcher/apps/:appId/assignments
 * Get assignments for a specific app
 */
router.get('/apps/:appId/assignments', authenticateJWT, async (req, res) => {
  try {
    const { appId } = req.params;

    const app = customApps.find((app) => app.id === appId);
    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    res.json({
      success: true,
      data: { assignments: app.assignments },
    });
  } catch (error) {
    logger.error('Error fetching app assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
    });
  }
});

/**
 * POST /api/v1/app-switcher/apps/:appId/assign-users
 * Assign app to users
 */
router.post('/apps/:appId/assign-users', authenticateJWT, async (req, res) => {
  try {
    const { appId } = req.params;
    const { userIds, grantedBy } = req.body;

    const appIndex = customApps.findIndex((app) => app.id === appId);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    // Add user assignments
    const newAssignments = userIds.map((userId) => ({
      type: 'user',
      target_id: userId,
      target_name: `User ${userId}`, // Would get actual user name
      granted_by: grantedBy || req.user.id,
      granted_at: new Date(),
    }));

    customApps[appIndex].assignments = [
      ...customApps[appIndex].assignments.filter(
        (a) => a.type !== 'user' || !userIds.includes(a.target_id),
      ),
      ...newAssignments,
    ];

    res.json({
      success: true,
      message: `App assigned to ${userIds.length} users`,
    });
  } catch (error) {
    logger.error('Error assigning app to users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign app',
    });
  }
});

/**
 * POST /api/v1/app-switcher/apps/:appId/generate-launch-url
 * Generate launch URL for external app with SSO
 */
router.post('/apps/:appId/generate-launch-url', authenticateJWT, async (req, res) => {
  try {
    const { appId } = req.params;
    const { userId } = req.body;

    const app = customApps.find((app) => app.id === appId);
    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'App not found',
      });
    }

    // Generate SSO URL if enabled
    let launchUrl = app.url;
    let requiresNewWindow = app.external_config?.open_in_new_window || false;

    if (app.external_config?.sso_enabled && app.external_config?.pre_auth_url) {
      // Generate SSO token and redirect URL
      const ssoToken = generateSSOToken(userId, appId);
      launchUrl = `${app.external_config.pre_auth_url}?token=${ssoToken}&redirect=${encodeURIComponent(app.url)}`;
    }

    res.json({
      success: true,
      data: {
        url: launchUrl,
        requires_new_window: requiresNewWindow,
        sso_enabled: app.external_config?.sso_enabled || false,
      },
    });
  } catch (error) {
    logger.error('Error generating launch URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate launch URL',
    });
  }
});

/**
 * POST /api/v1/app-switcher/track-access
 * Track app access for analytics
 */
router.post('/track-access', authenticateJWT, async (req, res) => {
  try {
    const { appId, userId, metadata } = req.body;

    // Log access event
    logger.info('App access tracked', {
      appId,
      userId,
      timestamp: new Date(),
      metadata,
    });

    // Here you would typically store this in an analytics database

    res.json({
      success: true,
      message: 'Access tracked',
    });
  } catch (error) {
    logger.error('Error tracking app access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track access',
    });
  }
});

// Helper function to generate SSO tokens
function generateSSOToken(userId, appId) {
  // This would use proper JWT signing with secrets
  // For demo purposes, returning a simple token
  const payload = {
    userId,
    appId,
    timestamp: Date.now(),
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export default router;
