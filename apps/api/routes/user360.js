/**
 * User 360 API Routes
 * Provides comprehensive user profile aggregation and management
 * 
 * @author Nova Team
 * @version 1.0.0
 */

import express from 'express';
import { logger } from '../logger.js';
// import { novaIntegrationLayer } from '../../lib/integration/nova-integration-layer.js';
import { authenticateJWT } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

let nilPromise;
async function getIntegrationLayer() {
  if (!nilPromise) {
    nilPromise = import('../../lib/integration/nova-integration-layer.js')
      .then(m => m.novaIntegrationLayer)
      .catch(err => {
        logger.warn('Integration layer unavailable; continuing in degraded mode', { error: err?.message });
        return null;
      });
  }
  return nilPromise;
}

const router = express.Router();

// Rate limiting for User 360 API
const user360RateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many User 360 requests from this IP'
});

router.use(user360RateLimit);

/**
 * @swagger
 * /api/v2/user360/profile/{helix_uid}:
 *   get:
 *     summary: Get comprehensive user profile (User 360 view)
 *     description: Returns aggregated user data from all connected systems
 *     parameters:
 *       - in: path
 *         name: helix_uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Nova Helix User ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *           enum: [identity,devices,apps,security,tickets,alerts,hr,all]
 *         description: Comma-separated list of data categories to include
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User360Profile'
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/profile/:helix_uid', authenticateJWT, async (req, res) => {
  try {
    const { helix_uid } = req.params;
    const { include = 'all' } = req.query;
    
    const integration = await getIntegrationLayer(); // TODO-LINT: move to async function
    if (!integration) {
      return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });
    }

    // Check authorization (RBAC)
    const hasAccess = await checkUserAccess(req.user, helix_uid, 'read'); // TODO-LINT: move to async function
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied', 
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
    }

    // Get comprehensive user profile
    const profile = await integration.getUserProfile(helix_uid); // TODO-LINT: move to async function
    
    // Filter data based on include parameter
    const filteredProfile = filterProfileData(profile, include, req.user.role);
    
    logger.info(`User 360 profile accessed for ${helix_uid} by ${req.user.id}`);
    
    res.json({
      profile: filteredProfile,
      meta: {
        requestedBy: req.user.id,
        timestamp: new Date().toISOString(),
        dataFreshness: profile.lastUpdated
      }
    });

  } catch (error) {
    logger.error(`Failed to get User 360 profile: ${error.message}`);
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({ 
        error: 'User not found', 
        code: 'USER_NOT_FOUND' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to retrieve user profile', 
      code: 'PROFILE_FETCH_ERROR' 
    });
  }
});

/**
 * @swagger
 * /api/v2/user360/assets/{helix_uid}:
 *   get:
 *     summary: Get user's assets and devices
 *     parameters:
 *       - in: path
 *         name: helix_uid
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [devices,licenses,software,all]
 *         description: Type of assets to retrieve
 *     responses:
 *       200:
 *         description: User assets
 */
router.get('/assets/:helix_uid', authenticateJWT, async (req, res) => {
  try {
    const { helix_uid } = req.params;
    const { type = 'all' } = req.query;
    
    const integration = await getIntegrationLayer(); // TODO-LINT: move to async function
    if (!integration) {
      return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });
    }

    const hasAccess = await checkUserAccess(req.user, helix_uid, 'read'); // TODO-LINT: move to async function
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied', 
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
    }

    // Get assets from integration layer
    const assets = await integration.getUserAssets(helix_uid, type); // TODO-LINT: move to async function
    
    res.json({
      assets,
      meta: {
        total: assets.length,
        type: type,
        lastSync: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`Failed to get user assets: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to retrieve user assets', 
      code: 'ASSETS_FETCH_ERROR' 
    });
  }
});

/**
 * @swagger
 * /api/v2/user360/tickets/{helix_uid}:
 *   get:
 *     summary: Get user's tickets and service requests
 *     parameters:
 *       - in: path
 *         name: helix_uid
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open,closed,all]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: User tickets
 */
router.get('/tickets/:helix_uid', authenticateJWT, async (req, res) => {
  try {
    const { helix_uid } = req.params;
    const { status = 'all', limit = 20 } = req.query;
    
    const integration = await getIntegrationLayer(); // TODO-LINT: move to async function
    if (!integration) {
      return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });
    }

    const hasAccess = await checkUserAccess(req.user, helix_uid, 'read'); // TODO-LINT: move to async function
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied', 
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
    }

    const tickets = await integration.getUserTickets(helix_uid, {
      status,
      limit: parseInt(limit)
    }); // TODO-LINT: move to async function
    
    res.json({
      tickets,
      meta: {
        total: tickets.length,
        status: status,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error(`Failed to get user tickets: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to retrieve user tickets', 
      code: 'TICKETS_FETCH_ERROR' 
    });
  }
});

/**
 * @swagger
 * /api/v2/user360/activity/{helix_uid}:
 *   get:
 *     summary: Get user's activity logs and security events
 *     parameters:
 *       - in: path
 *         name: helix_uid
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 168
 *           default: 24
 *         description: Hours of activity to retrieve
 *     responses:
 *       200:
 *         description: User activity logs
 */
router.get('/activity/:helix_uid', authenticateJWT, async (req, res) => {
  try {
    const { helix_uid } = req.params;
    const { hours = 24 } = req.query;
    
    const hasAccess = await checkUserAccess(req.user, helix_uid, 'read_activity'); // TODO-LINT: move to async function
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied - activity logs require elevated permissions', 
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
    }

    const since = new Date(Date.now() - (parseInt(hours) * 60 * 60 * 1000));
    const integration = await getIntegrationLayer(); // TODO-LINT: move to async function
  if (!integration) {
    return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });
  }
    if (!integration) {
      return res.status(503).json({ error: 'Integration layer unavailable', code: 'NIL_UNAVAILABLE' });
    }
    const activity = await integration.getUserActivity(helix_uid, since); // TODO-LINT: move to async function
    
    res.json({
      activity,
      meta: {
        total: activity.length,
        since: since.toISOString(),
        hours: parseInt(hours)
      }
    });

  } catch (error) {
    logger.error(`Failed to get user activity: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to retrieve user activity', 
      code: 'ACTIVITY_FETCH_ERROR' 
    });
  }
});

/**
 * @swagger
 * /api/v2/user360/profile/{helix_uid}:
 *   patch:
 *     summary: Update user profile fields
 *     parameters:
 *       - in: path
 *         name: helix_uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: object
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/profile/:helix_uid', authenticateJWT, async (req, res) => {
  try {
    const { helix_uid } = req.params;
    const { updates, reason } = req.body;
    
    const hasAccess = await checkUserAccess(req.user, helix_uid, 'write'); // TODO-LINT: move to async function
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied - profile updates require write permissions', 
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
    }

    // Validate update fields
    const allowedFields = ['department', 'manager', 'title', 'location', 'phone'];
    const sanitizedUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({ 
        error: 'No valid update fields provided', 
        code: 'INVALID_UPDATE_FIELDS' 
      });
    }

    const result = await novaIntegrationLayer.updateUserProfile(helix_uid, sanitizedUpdates, {
      updatedBy: req.user.id,
      reason: reason || 'Profile update via API'
    }); // TODO-LINT: move to async function
    
    logger.info(`User profile updated for ${helix_uid} by ${req.user.id}: ${Object.keys(sanitizedUpdates).join(', ')}`);
    
    res.json({
      success: true,
      updated: sanitizedUpdates,
      meta: {
        updatedBy: req.user.id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`Failed to update user profile: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to update user profile', 
      code: 'PROFILE_UPDATE_ERROR' 
    });
  }
});

/**
 * @swagger
 * /api/v2/user360/merge:
 *   post:
 *     summary: Merge user profiles (admin only)
 *     security:
 *       - AdminToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - primary_uid
 *               - secondary_uid
 *             properties:
 *               primary_uid:
 *                 type: string
 *               secondary_uid:
 *                 type: string
 *               merge_strategy:
 *                 type: string
 *                 enum: [replace,merge,keep_primary]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profiles merged successfully
 */
router.post('/merge', authenticateJWT, async (req, res) => {
  try {
    const { primary_uid, secondary_uid, merge_strategy = 'merge', reason } = req.body;
    
    // Only admins can merge profiles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Profile merging requires admin privileges', 
        code: 'ADMIN_REQUIRED' 
      });
    }

    if (!primary_uid || !secondary_uid) {
      return res.status(400).json({ 
        error: 'Both primary_uid and secondary_uid are required', 
        code: 'MISSING_REQUIRED_FIELDS' 
      });
    }

    const result = await novaIntegrationLayer.mergeUserProfiles(primary_uid, secondary_uid, {
      strategy: merge_strategy,
      mergedBy: req.user.id,
      reason: reason || 'Profile merge via API'
    }); // TODO-LINT: move to async function
    
    logger.warn(`User profiles merged: ${secondary_uid} -> ${primary_uid} by ${req.user.id}`);
    
    res.json({
      success: true,
      primary_uid,
      secondary_uid,
      merge_strategy,
      result,
      meta: {
        mergedBy: req.user.id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`Failed to merge user profiles: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to merge user profiles', 
      code: 'PROFILE_MERGE_ERROR' 
    });
  }
});

// Helper _functions

/**
 * Check if the _requesting user _has access to the _target user's data
 */
async function checkUserAccess(requestingUser, targetUserId, accessType) {
  // Admin users have full access
  if (requestingUser.role === 'admin') {
    return true;
  }
  
  // Users can access their own data
  if (requestingUser.id === targetUserId) {
    return true;
  }
  
  // Technicians can access user data within their scope
  if (requestingUser.role === 'technician') {
    return accessType === 'read' || accessType === 'read_activity';
  }
  
  // Managers can access their direct reports (basic check; integrate with org directory when available)
  if (requestingUser.role === 'manager') {
    const managesTarget = await isManagerOf(requestingUser.id, targetUserId); // TODO-LINT: move to async function
    return managesTarget && (accessType === 'read' || accessType === 'read_activity');
  }
  
  return false;
}

async function isManagerOf(managerUserId, reportUserId) {
  try {
    // Simple in-memory cache; can be hydrated by an external service
    if (!globalThis.__managerReportMap) {
      globalThis.__managerReportMap = Object.create(null);
    }
    const map = globalThis.__managerReportMap;
    const reports = map[managerUserId];

    if (Array.isArray(reports)) {
      return reports.includes(reportUserId);
    }

    // Fallback: attempt to resolve via integration layer if available
    try {
      const integration = await getIntegrationLayer(); // TODO-LINT: move to async function
      if (integration?.getDirectReports) {
        const list = await integration.getDirectReports(managerUserId); // TODO-LINT: move to async function
        if (Array.isArray(list)) {
          map[managerUserId] = list;
          return list.includes(reportUserId);
        }
      }
    } catch {}
    
    // Default deny if unknown
    return false;
  } catch {
    return false;
  }
}

/**
 * Filter profile data based on inclusion rules and user permissions
 */
function filterProfileData(profile, includeParam, userRole) {
  const includeCategories = includeParam === 'all' 
    ? ['identity', 'devices', 'apps', 'security', 'tickets', 'alerts', 'hr']
    : includeParam.split(',');
  
  const filtered = {
    userId: profile.userId,
    email: profile.email,
    lastUpdated: profile.lastUpdated
  };
  
  // Apply role-based filtering
  includeCategories.forEach(category => {
    if (profile[category]) {
      switch (category) {
        case 'security':
          // Only admins and technicians see full security data
          if (userRole === 'admin' || userRole === 'technician') {
            filtered[category] = profile[category];
          } else {
            filtered[category] = {
              mfa: profile[category].mfa,
              riskScore: profile[category].riskScore > 7 ? 'high' : 'normal'
            };
          }
          break;
        
        case 'alerts':
          // Filter sensitive alerts for non-technical users
          if (userRole === 'admin' || userRole === 'technician') {
            filtered[category] = profile[category];
          } else {
            filtered[category] = profile[category].filter(alert => 
              alert.severity !== 'critical' && !alert.securityRelated
            );
          }
          break;
        
        case 'hr':
          // HR data is sensitive - limit access
          if (userRole === 'admin' || userRole === 'hr') {
            filtered[category] = profile[category];
          } else {
            filtered[category] = {
              department: profile[category].department,
              title: profile[category].title
            };
          }
          break;
        
        default:
          filtered[category] = profile[category];
      }
    }
  });
  
  return filtered;
}

export default router;
