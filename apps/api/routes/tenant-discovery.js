// Nova Universe Enhanced Tenant Discovery
// Industry-standard tenant discovery for API-only and UI usage with cross-tenant support

import express from 'express';
import { body, query, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import jwt from 'jsonwebtoken';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/tenants/discover:
 *   post:
 *     summary: Enhanced tenant discovery for API and UI usage
 *     description: Industry-standard tenant discovery supporting multiple methods
 *     tags: [Tenant Discovery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [email, domain, subdomain, api_key, jwt]
 *               email:
 *                 type: string
 *               domain:
 *                 type: string
 *               subdomain:
 *                 type: string
 *               api_key:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tenant discovered successfully
 *       404:
 *         description: Tenant not found
 */
router.post(
  '/discover',
  [
    body('method').isIn(['email', 'domain', 'subdomain', 'api_key', 'jwt', 'header']),
    body('email').optional().isEmail(),
    body('domain').optional().isLength({ min: 1 }),
    body('subdomain').optional().isLength({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { method, email, domain, subdomain, api_key, token } = req.body;
      let tenant = null;
      let discoveryMethod = method;

      // Discover tenant based on method
      switch (method) {
        case 'email':
          if (!email) {
            return res.status(400).json({
              success: false,
              error: 'Email required for email-based discovery',
            });
          }
          tenant = await discoverByEmail(email);
          break;

        case 'domain':
          if (!domain) {
            return res.status(400).json({
              success: false,
              error: 'Domain required for domain-based discovery',
            });
          }
          tenant = await discoverByDomain(domain);
          break;

        case 'subdomain':
          if (!subdomain) {
            return res.status(400).json({
              success: false,
              error: 'Subdomain required for subdomain-based discovery',
            });
          }
          tenant = await discoverBySubdomain(subdomain);
          break;

        case 'api_key':
          if (!api_key) {
            return res.status(400).json({
              success: false,
              error: 'API key required for API key-based discovery',
            });
          }
          tenant = await discoverByAPIKey(api_key);
          break;

        case 'jwt':
          if (!token) {
            return res.status(400).json({
              success: false,
              error: 'Token required for JWT-based discovery',
            });
          }
          tenant = await discoverByJWT(token);
          break;

        case 'header':
          // Check X-Tenant-ID header
          const tenantIdHeader = req.headers['x-tenant-id'];
          if (!tenantIdHeader) {
            return res.status(400).json({
              success: false,
              error: 'X-Tenant-ID header required for header-based discovery',
            });
          }
          tenant = await discoverByTenantId(tenantIdHeader);
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid discovery method',
          });
      }

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
        });
      }

      // Get discovery configuration
      const discoveryConfig = await getDiscoveryConfig(tenant.id);

      // Check if this discovery method is allowed
      if (!isDiscoveryMethodAllowed(discoveryConfig, method, req)) {
        return res.status(403).json({
          success: false,
          error: 'This discovery method is not allowed for this tenant',
          code: 'DISCOVERY_METHOD_NOT_ALLOWED',
        });
      }

      // Get available authentication methods for this tenant
      const authMethods = await getAuthenticationMethods(tenant.id);

      // Return tenant information
      res.json({
        success: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug || tenant.subdomain,
          domain: tenant.domain,
          subdomain: tenant.subdomain,
        },
        discoveryMethod,
        authMethods,
        discoveryConfig: {
          apiEnabled: discoveryConfig.api_discovery_enabled,
          uiEnabled: discoveryConfig.ui_discovery_enabled,
          allowedMethods: getAllowedMethods(discoveryConfig),
        },
      });
    } catch (error) {
      logger.error('Tenant discovery error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during tenant discovery',
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/tenants/discover/header:
 *   get:
 *     summary: Discover tenant from request headers
 *     description: Automatically discover tenant from X-Tenant-ID or Authorization header
 *     tags: [Tenant Discovery]
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant discovered successfully
 */
router.get('/discover/header', async (req, res) => {
  try {
    let tenant = null;
    let discoveryMethod = null;

    // Try X-Tenant-ID header first
    const tenantIdHeader = req.headers['x-tenant-id'];
    if (tenantIdHeader) {
      tenant = await discoverByTenantId(tenantIdHeader);
      discoveryMethod = 'header';
    }

    // Try to extract from Authorization header (JWT)
    if (!tenant && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        tenant = await discoverByJWT(token);
        discoveryMethod = 'jwt';
      }
    }

    // Try to extract from subdomain
    if (!tenant && req.headers.host) {
      const host = req.headers.host;
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'api' && subdomain !== 'www' && subdomain !== 'localhost') {
        tenant = await discoverBySubdomain(subdomain);
        discoveryMethod = 'subdomain';
      }
    }

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Could not discover tenant from request headers',
        code: 'TENANT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
      },
      discoveryMethod,
    });
  } catch (error) {
    logger.error('Header-based tenant discovery error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/tenants/{tenantId}/relationships:
 *   get:
 *     summary: Get tenant relationships
 *     description: Get all cross-tenant access relationships for a tenant
 *     tags: [Tenant Relationships]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *     responses:
 *       200:
 *         description: Relationships retrieved successfully
 */
router.get('/:tenantId/relationships', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verify user has access to this tenant
    if (req.user.tenant_id !== tenantId && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    // Get outgoing relationships (this tenant can access others)
    const outgoing = await db.query(
      `SELECT tr.*, t.name as target_tenant_name, t.domain as target_tenant_domain
       FROM tenant_relationships tr
       JOIN tenants t ON tr.target_tenant_id = t.id
       WHERE tr.source_tenant_id = $1 AND tr.active = true`,
      [tenantId]
    );

    // Get incoming relationships (others can access this tenant)
    const incoming = await db.query(
      `SELECT tr.*, t.name as source_tenant_name, t.domain as source_tenant_domain
       FROM tenant_relationships tr
       JOIN tenants t ON tr.source_tenant_id = t.id
       WHERE tr.target_tenant_id = $1 AND tr.active = true`,
      [tenantId]
    );

    res.json({
      success: true,
      outgoing: outgoing.rows,
      incoming: incoming.rows,
    });
  } catch (error) {
    logger.error('Get tenant relationships error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/tenants/{tenantId}/relationships:
 *   post:
 *     summary: Create cross-tenant relationship
 *     description: Grant access from source tenant to target tenant
 *     tags: [Tenant Relationships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetTenantId:
 *                 type: string
 *               relationshipType:
 *                 type: string
 *               accessLevel:
 *                 type: string
 */
router.post('/:tenantId/relationships', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { targetTenantId, relationshipType, accessLevel, scopedResources, description } = req.body;

    // Verify user has admin access to source tenant
    if (req.user.tenant_id !== tenantId || !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Admin permissions required',
      });
    }

    // Validate target tenant exists
    const targetTenant = await db.query('SELECT id FROM tenants WHERE id = $1 AND active = true', [
      targetTenantId,
    ]);

    if (targetTenant.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Target tenant not found',
      });
    }

    // Create relationship
    const result = await db.query(
      `INSERT INTO tenant_relationships (
        source_tenant_id, target_tenant_id, relationship_type, access_level,
        scoped_resources, created_by, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        tenantId,
        targetTenantId,
        relationshipType || 'read_only',
        accessLevel || 'read_only',
        JSON.stringify(scopedResources || []),
        req.user.id,
        description || null,
      ]
    );

    // Log the relationship creation
    await db.query(
      `INSERT INTO cross_tenant_access_logs (
        source_tenant_id, target_tenant_id, user_id, action, access_granted, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        tenantId,
        targetTenantId,
        req.user.id,
        'create_relationship',
        true,
        JSON.stringify({ relationshipType, accessLevel }),
      ]
    );

    res.json({
      success: true,
      relationship: result.rows[0],
    });
  } catch (error) {
    logger.error('Create tenant relationship error:', error);
    
    if (error.code === '23505') {
      // Duplicate relationship
      return res.status(409).json({
        success: false,
        error: 'Relationship already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/tenants/{tenantId}/access-check:
 *   post:
 *     summary: Check cross-tenant access
 *     description: Verify if current user can access resources in target tenant
 *     tags: [Tenant Relationships]
 */
router.post('/:tenantId/access-check', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { targetTenantId, action, resourceType } = req.body;

    const access = await checkCrossTenantAccess(
      req.user.tenant_id,
      targetTenantId,
      action,
      resourceType
    );

    // Log the access check
    await db.query(
      `INSERT INTO cross_tenant_access_logs (
        source_tenant_id, target_tenant_id, user_id, action, resource_type, access_granted
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.tenant_id, targetTenantId, req.user.id, action, resourceType, access.granted]
    );

    res.json({
      success: true,
      accessGranted: access.granted,
      accessLevel: access.accessLevel,
      reason: access.reason,
    });
  } catch (error) {
    logger.error('Access check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Helper functions

async function discoverByEmail(email) {
  const emailDomain = email.split('@')[1];
  
  // Try to find user first
  const userResult = await db.query(
    `SELECT u.tenant_id, t.* FROM users u
     JOIN tenants t ON u.tenant_id = t.id
     WHERE u.email = $1 AND t.active = true`,
    [email]
  );

  if (userResult.rows.length > 0) {
    return userResult.rows[0];
  }

  // Try to find tenant by email domain
  const tenantResult = await db.query(
    'SELECT * FROM tenants WHERE domain = $1 AND active = true',
    [emailDomain]
  );

  return tenantResult.rows[0] || null;
}

async function discoverByDomain(domain) {
  const result = await db.query(
    'SELECT * FROM tenants WHERE (domain = $1 OR subdomain = $1) AND active = true',
    [domain]
  );
  return result.rows[0] || null;
}

async function discoverBySubdomain(subdomain) {
  const result = await db.query(
    'SELECT * FROM tenants WHERE subdomain = $1 AND active = true',
    [subdomain]
  );
  return result.rows[0] || null;
}

async function discoverByAPIKey(apiKey) {
  // Hash the API key to compare with stored hash
  const crypto = await import('crypto');
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  const result = await db.query(
    `SELECT t.* FROM api_keys ak
     JOIN tenants t ON ak.tenant_id = t.id
     WHERE ak.key_hash = $1 AND ak.is_active = true AND t.active = true`,
    [keyHash]
  );
  return result.rows[0] || null;
}

async function discoverByJWT(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tenant_id || decoded.tenantId) {
      const tenantId = decoded.tenant_id || decoded.tenantId;
      return await discoverByTenantId(tenantId);
    }
  } catch (error) {
    logger.warn('JWT verification failed during tenant discovery:', error.message);
  }
  return null;
}

async function discoverByTenantId(tenantId) {
  const result = await db.query('SELECT * FROM tenants WHERE id = $1 AND active = true', [tenantId]);
  return result.rows[0] || null;
}

async function getDiscoveryConfig(tenantId) {
  const result = await db.query(
    'SELECT * FROM tenant_discovery_configs WHERE tenant_id = $1',
    [tenantId]
  );
  
  // Return default config if none exists
  if (result.rows.length === 0) {
    return {
      api_discovery_enabled: true,
      ui_discovery_enabled: true,
      allow_email_domain_discovery: true,
      allow_subdomain_discovery: true,
      api_discovery_methods: ['header', 'subdomain', 'query_param'],
      ui_discovery_methods: ['subdomain', 'email'],
    };
  }
  
  return result.rows[0];
}

function isDiscoveryMethodAllowed(config, method, req) {
  // Check if discovery is enabled for API vs UI usage
  const isAPIRequest = req.path.includes('/api/') || req.headers['x-api-key'] || req.headers['authorization'];
  
  if (isAPIRequest && !config.api_discovery_enabled) {
    return false;
  }
  
  if (!isAPIRequest && !config.ui_discovery_enabled) {
    return false;
  }
  
  // Check specific method allowances
  const allowedMethods = isAPIRequest ? config.api_discovery_methods : config.ui_discovery_methods;
  
  if (!allowedMethods || !Array.isArray(allowedMethods)) {
    return true; // Default to allowing if not configured
  }
  
  return allowedMethods.includes(method);
}

function getAllowedMethods(config) {
  const methods = new Set();
  
  if (config.allow_email_domain_discovery) {
    methods.add('email');
  }
  
  if (config.allow_subdomain_discovery) {
    methods.add('subdomain');
  }
  
  if (config.api_discovery_enabled && config.api_discovery_methods) {
    config.api_discovery_methods.forEach(m => methods.add(m));
  }
  
  if (config.ui_discovery_enabled && config.ui_discovery_methods) {
    config.ui_discovery_methods.forEach(m => methods.add(m));
  }
  
  return Array.from(methods);
}

async function getAuthenticationMethods(tenantId) {
  const methods = [{ type: 'password', name: 'Password', primary: true }];
  
  try {
    // Check for SSO
    const ssoResult = await db.query(
      'SELECT provider, provider_name FROM sso_configs WHERE tenant_id = $1 AND enabled = true',
      [tenantId]
    );
    
    ssoResult.rows.forEach(sso => {
      methods.push({
        type: 'sso',
        provider: sso.provider,
        name: sso.provider_name,
      });
    });
  } catch (error) {
    logger.warn('Failed to fetch SSO methods:', error.message);
  }
  
  return methods;
}

async function checkCrossTenantAccess(sourceTenantId, targetTenantId, action, resourceType) {
  // Check if source tenant has a relationship with target tenant
  const result = await db.query(
    `SELECT * FROM tenant_relationships
     WHERE source_tenant_id = $1 AND target_tenant_id = $2 AND active = true
     AND (expires_at IS NULL OR expires_at > NOW())`,
    [sourceTenantId, targetTenantId]
  );

  if (result.rows.length === 0) {
    return {
      granted: false,
      reason: 'No relationship exists between tenants',
    };
  }

  const relationship = result.rows[0];

  // Check access level
  const actionRequirements = {
    read: ['read_only', 'read_write', 'full_admin'],
    write: ['read_write', 'full_admin'],
    delete: ['full_admin'],
    admin: ['full_admin'],
  };

  const requiredLevels = actionRequirements[action] || ['full_admin'];
  
  if (!requiredLevels.includes(relationship.access_level)) {
    return {
      granted: false,
      accessLevel: relationship.access_level,
      reason: `Insufficient access level for action: ${action}`,
    };
  }

  // Check scoped resources if applicable
  if (resourceType && relationship.scoped_resources && relationship.scoped_resources.length > 0) {
    if (!relationship.scoped_resources.includes(resourceType)) {
      return {
        granted: false,
        accessLevel: relationship.access_level,
        reason: `Resource type ${resourceType} not in scope`,
      };
    }
  }

  return {
    granted: true,
    accessLevel: relationship.access_level,
    relationshipType: relationship.relationship_type,
  };
}

export default router;
