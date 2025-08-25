import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../../db.js';
import { logger } from '../../logger.js';
import { authenticateJWT } from '../../middleware/auth.js';
import { createRateLimit } from '../../middleware/rateLimiter.js';
import digitalSignageRoutes from './nova-tv-digital-signage.js';

const router = express.Router();

// In-memory stores for environments without full DB schema
const memoryDashboards = new Map();
const memoryDevices = new Map();
const memoryTemplates = new Map();
const memoryActivations = new Map();

// Initialize memory stores with demo data
function initializeMemoryStores() {
  // Demo templates
  memoryTemplates.set('template_it_dashboard', {
    id: 'template_it_dashboard',
    name: 'IT Department Dashboard',
    description: 'Standard IT department dashboard with tickets, system health, and announcements',
    category: 'departmental',
    departmentType: 'IT',
    templateConfig: {
      layout: 'grid',
      theme: 'dark',
      refreshInterval: 30000,
      widgets: [
        { type: 'tickets', position: { x: 0, y: 0, w: 6, h: 4 } },
        { type: 'system-health', position: { x: 6, y: 0, w: 6, h: 4 } },
        { type: 'announcements', position: { x: 0, y: 4, w: 12, h: 3 } },
      ],
    },
    isSystemTemplate: true,
    isActive: true,
    tags: ['tickets', 'monitoring', 'announcements', 'it'],
    createdAt: new Date().toISOString(),
  });

  memoryTemplates.set('template_hr_dashboard', {
    id: 'template_hr_dashboard',
    name: 'HR Department Dashboard',
    description: 'HR dashboard with employee metrics, announcements, and events',
    category: 'departmental',
    departmentType: 'HR',
    templateConfig: {
      layout: 'grid',
      theme: 'light',
      refreshInterval: 60000,
      widgets: [
        { type: 'employee-count', position: { x: 0, y: 0, w: 4, h: 3 } },
        { type: 'upcoming-events', position: { x: 4, y: 0, w: 8, h: 3 } },
        { type: 'announcements', position: { x: 0, y: 3, w: 12, h: 4 } },
      ],
    },
    isSystemTemplate: true,
    isActive: true,
    tags: ['hr', 'employees', 'events', 'announcements'],
    createdAt: new Date().toISOString(),
  });

  memoryTemplates.set('template_generic_dashboard', {
    id: 'template_generic_dashboard',
    name: 'Generic Dashboard',
    description: 'Basic dashboard template suitable for any department',
    category: 'generic',
    departmentType: null,
    templateConfig: {
      layout: 'grid',
      theme: 'dark',
      refreshInterval: 30000,
      widgets: [
        { type: 'clock', position: { x: 0, y: 0, w: 4, h: 2 } },
        { type: 'weather', position: { x: 4, y: 0, w: 4, h: 2 } },
        { type: 'announcements', position: { x: 8, y: 0, w: 4, h: 2 } },
        { type: 'calendar', position: { x: 0, y: 2, w: 12, h: 4 } },
      ],
    },
    isSystemTemplate: true,
    isActive: true,
    tags: ['generic', 'clock', 'weather', 'calendar'],
    createdAt: new Date().toISOString(),
  });

  // Demo dashboard
  memoryDashboards.set('demo-dashboard', {
    id: 'demo-dashboard',
    name: 'IT Department Demo Dashboard',
    description: 'Demo dashboard for IT department showing tickets and system health',
    department: 'IT',
    createdBy: 'user-1',
    templateId: 'template_it_dashboard',
    configuration: {
      layout: 'grid',
      theme: 'dark',
      refreshInterval: 30000,
      widgets: [
        { type: 'tickets', position: { x: 0, y: 0, w: 6, h: 4 } },
        { type: 'system-health', position: { x: 6, y: 0, w: 6, h: 4 } },
        { type: 'announcements', position: { x: 0, y: 4, w: 12, h: 3 } },
      ],
    },
    isActive: true,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// Initialize memory stores
initializeMemoryStores();

// Utility functions
function generateId(prefix = 'ntv') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateActivationCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Database helper functions
async function queryDatabase(query, params = []) {
  try {
    const result = await db.query(query, params);
    return result.rows || [];
  } catch (error) {
    logger.warn('Database query failed, using memory fallback', { error: error.message });
    return null;
  }
}

// Dashboard Routes

// List dashboards
router.get('/dashboards', authenticateJWT, createRateLimit(60 * 1000, 100), async (req, res) => {
  try {
    const { department, createdBy, isActive } = req.query;

    // Try database first
    let dashboards = await queryDatabase(
      `
      SELECT * FROM nova_tv_dashboards 
      WHERE ($1::text IS NULL OR department = $1)
      AND ($2::text IS NULL OR created_by = $2)
      AND ($3::boolean IS NULL OR is_active = $3)
      ORDER BY created_at DESC
    `,
      [department || null, createdBy || null, isActive ? JSON.parse(isActive) : null],
    );

    // Fallback to memory
    if (dashboards === null) {
      dashboards = Array.from(memoryDashboards.values()).filter((d) => {
        return (
          (!department || d.department === department) &&
          (!createdBy || d.createdBy === createdBy) &&
          (isActive === undefined || d.isActive === JSON.parse(isActive))
        );
      });
    }

    res.json({ dashboards });
  } catch (error) {
    logger.error('List dashboards error', { error: error.message });
    res.status(500).json({ error: 'Failed to list dashboards' });
  }
});

// Get dashboard by ID
router.get(
  '/dashboards/:id',
  authenticateJWT,
  createRateLimit(60 * 1000, 100),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Try database first
      let dashboards = await queryDatabase('SELECT * FROM nova_tv_dashboards WHERE id = $1', [id]);
      let dashboard = dashboards?.[0];

      // Fallback to memory
      if (!dashboard) {
        dashboard = memoryDashboards.get(id);
      }

      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      res.json({ dashboard });
    } catch (error) {
      logger.error('Get dashboard error', { error: error.message });
      res.status(500).json({ error: 'Failed to get dashboard' });
    }
  },
);

// Create dashboard
router.post(
  '/dashboards',
  authenticateJWT,
  createRateLimit(60 * 1000, 20),
  [
    body('name')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name is required and must be 1-255 characters'),
    body('department').optional().isLength({ max: 100 }),
    body('templateId').optional().isString(),
    body('configuration').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, department, templateId, configuration } = req.body;
      const userId = req.user?.id || req.headers['x-user-id'] || 'anonymous';

      const dashboard = {
        id: generateId('ntv'),
        name,
        description: description || null,
        department: department || null,
        createdBy: userId,
        templateId: templateId || null,
        configuration: configuration || {},
        isActive: true,
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Try database first
      try {
        await db.query(
          `
          INSERT INTO nova_tv_dashboards 
          (id, name, description, department, created_by, template_id, configuration, is_active, is_public)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
          [
            dashboard.id,
            dashboard.name,
            dashboard.description,
            dashboard.department,
            dashboard.createdBy,
            dashboard.templateId,
            JSON.stringify(dashboard.configuration),
            dashboard.isActive,
            dashboard.isPublic,
          ],
        );
      } catch (dbError) {
        logger.warn('Database insert failed, using memory fallback', { error: dbError.message });
        memoryDashboards.set(dashboard.id, dashboard);
      }

      res.status(201).json({ dashboard });
    } catch (error) {
      logger.error('Create dashboard error', { error: error.message });
      res.status(500).json({ error: 'Failed to create dashboard' });
    }
  },
);

// Update dashboard
router.put(
  '/dashboards/:id',
  authenticateJWT,
  createRateLimit(60 * 1000, 50),
  [
    body('name').optional().isLength({ min: 1, max: 255 }),
    body('department').optional().isLength({ max: 100 }),
    body('configuration').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;
      updates.updatedAt = new Date().toISOString();

      // Try database first
      try {
        const setClause = Object.keys(updates)
          .filter((key) => key !== 'id')
          .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
          .join(', ');

        const values = [
          id,
          ...Object.keys(updates)
            .filter((key) => key !== 'id')
            .map((key) => {
              const value = updates[key];
              return typeof value === 'object' ? JSON.stringify(value) : value;
            }),
        ];

        const result = await db.query(
          `
          UPDATE nova_tv_dashboards SET ${setClause} WHERE id = $1 RETURNING *
        `,
          values,
        );

        if (result.rows?.length) {
          return res.json({ dashboard: result.rows[0] });
        }
      } catch (dbError) {
        logger.warn('Database update failed, using memory fallback', { error: dbError.message });
      }

      // Fallback to memory
      const dashboard = memoryDashboards.get(id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      Object.assign(dashboard, updates);
      memoryDashboards.set(id, dashboard);

      res.json({ dashboard });
    } catch (error) {
      logger.error('Update dashboard error', { error: error.message });
      res.status(500).json({ error: 'Failed to update dashboard' });
    }
  },
);

// Delete dashboard
router.delete(
  '/dashboards/:id',
  authenticateJWT,
  createRateLimit(60 * 1000, 20),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Try database first
      try {
        const result = await db.query('DELETE FROM nova_tv_dashboards WHERE id = $1 RETURNING id', [
          id,
        ]);
        if (result.rows?.length) {
          return res.json({ message: 'Dashboard deleted successfully' });
        }
      } catch (dbError) {
        logger.warn('Database delete failed, using memory fallback', { error: dbError.message });
      }

      // Fallback to memory
      if (memoryDashboards.has(id)) {
        memoryDashboards.delete(id);
        res.json({ message: 'Dashboard deleted successfully' });
      } else {
        res.status(404).json({ error: 'Dashboard not found' });
      }
    } catch (error) {
      logger.error('Delete dashboard error', { error: error.message });
      res.status(500).json({ error: 'Failed to delete dashboard' });
    }
  },
);

// Device Routes

// List devices
router.get('/devices', authenticateJWT, createRateLimit(60 * 1000, 100), async (req, res) => {
  try {
    const { department, connectionStatus, isActivated } = req.query;

    // Try database first
    let devices = await queryDatabase(
      `
      SELECT * FROM nova_tv_devices 
      WHERE ($1::text IS NULL OR department = $1)
      AND ($2::text IS NULL OR connection_status = $2)
      AND ($3::boolean IS NULL OR is_activated = $3)
      ORDER BY created_at DESC
    `,
      [department || null, connectionStatus || null, isActivated ? JSON.parse(isActivated) : null],
    );

    // Fallback to memory
    if (devices === null) {
      devices = Array.from(memoryDevices.values()).filter((d) => {
        return (
          (!department || d.department === department) &&
          (!connectionStatus || d.connectionStatus === connectionStatus) &&
          (isActivated === undefined || d.isActivated === JSON.parse(isActivated))
        );
      });
    }

    res.json({ devices });
  } catch (error) {
    logger.error('List devices error', { error: error.message });
    res.status(500).json({ error: 'Failed to list devices' });
  }
});

// Get device by ID
router.get('/devices/:id', authenticateJWT, createRateLimit(60 * 1000, 100), async (req, res) => {
  try {
    const { id } = req.params;

    // Try database first
    let devices = await queryDatabase('SELECT * FROM nova_tv_devices WHERE id = $1', [id]);
    let device = devices?.[0];

    // Fallback to memory
    if (!device) {
      device = memoryDevices.get(id);
    }

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ device });
  } catch (error) {
    logger.error('Get device error', { error: error.message });
    res.status(500).json({ error: 'Failed to get device' });
  }
});

// Register device
router.post(
  '/devices/register',
  createRateLimit(60 * 1000, 10),
  [
    body('name').isLength({ min: 1, max: 255 }).withMessage('Name is required'),
    body('deviceFingerprint').isLength({ min: 1 }).withMessage('Device fingerprint is required'),
    body('location').optional().isLength({ max: 255 }),
    body('department').optional().isLength({ max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, location, department, deviceFingerprint, browserInfo, brandingConfig } =
        req.body;

      const device = {
        id: generateId('ntvd'),
        name,
        location: location || null,
        department: department || null,
        deviceFingerprint,
        browserInfo: browserInfo || null,
        dashboardId: null,
        connectionStatus: 'disconnected',
        settings: {},
        metadata: {},
        logoUrl: brandingConfig?.logoUrl || null,
        bgUrl: brandingConfig?.bgUrl || null,
        brandingConfig: brandingConfig || {},
        displayConfig: {},
        isActivated: false,
        activatedBy: null,
        activatedAt: null,
        lastPingAt: null,
        version: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Try database first
      try {
        await db.query(
          `
          INSERT INTO nova_tv_devices 
          (id, name, location, department, device_fingerprint, browser_info, 
           connection_status, settings, metadata, logo_url, bg_url, branding_config, 
           display_config, is_activated)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `,
          [
            device.id,
            device.name,
            device.location,
            device.department,
            device.deviceFingerprint,
            device.browserInfo,
            device.connectionStatus,
            JSON.stringify(device.settings),
            JSON.stringify(device.metadata),
            device.logoUrl,
            device.bgUrl,
            JSON.stringify(device.brandingConfig),
            JSON.stringify(device.displayConfig),
            device.isActivated,
          ],
        );
      } catch (dbError) {
        logger.warn('Database insert failed, using memory fallback', { error: dbError.message });
        memoryDevices.set(device.id, device);
      }

      res.status(201).json({ device });
    } catch (error) {
      logger.error('Register device error', { error: error.message });
      res.status(500).json({ error: 'Failed to register device' });
    }
  },
);

// Update device dashboard assignment
router.put(
  '/devices/:id/dashboard',
  authenticateJWT,
  createRateLimit(60 * 1000, 50),
  [body('dashboardId').isString().withMessage('Dashboard ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { dashboardId } = req.body;

      // Try database first
      try {
        const result = await db.query(
          `
          UPDATE nova_tv_devices SET dashboard_id = $1, updated_at = NOW() 
          WHERE id = $2 RETURNING *
        `,
          [dashboardId, id],
        );

        if (result.rows?.length) {
          return res.json({ device: result.rows[0] });
        }
      } catch (dbError) {
        logger.warn('Database update failed, using memory fallback', { error: dbError.message });
      }

      // Fallback to memory
      const device = memoryDevices.get(id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      device.dashboardId = dashboardId;
      device.updatedAt = new Date().toISOString();
      memoryDevices.set(id, device);

      res.json({ device });
    } catch (error) {
      logger.error('Update device dashboard error', { error: error.message });
      res.status(500).json({ error: 'Failed to update device dashboard' });
    }
  },
);

// Update device branding
router.put(
  '/devices/:id/branding',
  authenticateJWT,
  createRateLimit(60 * 1000, 50),
  [
    body('logoUrl').optional().isURL(),
    body('bgUrl').optional().isURL(),
    body('brandingConfig').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { logoUrl, bgUrl, brandingConfig } = req.body;

      // Try database first
      try {
        const result = await db.query(
          `
          UPDATE nova_tv_devices 
          SET logo_url = COALESCE($1, logo_url), 
              bg_url = COALESCE($2, bg_url),
              branding_config = COALESCE($3, branding_config),
              updated_at = NOW()
          WHERE id = $4 RETURNING *
        `,
          [logoUrl, bgUrl, JSON.stringify(brandingConfig), id],
        );

        if (result.rows?.length) {
          return res.json({ device: result.rows[0] });
        }
      } catch (dbError) {
        logger.warn('Database update failed, using memory fallback', { error: dbError.message });
      }

      // Fallback to memory
      const device = memoryDevices.get(id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      if (logoUrl !== undefined) device.logoUrl = logoUrl;
      if (bgUrl !== undefined) device.bgUrl = bgUrl;
      if (brandingConfig !== undefined) device.brandingConfig = brandingConfig;
      device.updatedAt = new Date().toISOString();
      memoryDevices.set(id, device);

      res.json({ device });
    } catch (error) {
      logger.error('Update device branding error', { error: error.message });
      res.status(500).json({ error: 'Failed to update device branding' });
    }
  },
);

// Device heartbeat
router.post(
  '/devices/:id/heartbeat',
  createRateLimit(60 * 1000, 200),
  [body('status').optional().isString(), body('metadata').optional().isObject()],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, metadata } = req.body;

      // Try database first
      try {
        const result = await db.query(
          `
          UPDATE nova_tv_devices 
          SET connection_status = COALESCE($1, connection_status),
              metadata = COALESCE($2, metadata),
              last_ping_at = NOW(),
              updated_at = NOW()
          WHERE id = $3 RETURNING *
        `,
          [status, JSON.stringify(metadata), id],
        );

        if (result.rows?.length) {
          return res.json({ device: result.rows[0], timestamp: new Date().toISOString() });
        }
      } catch (dbError) {
        logger.warn('Database update failed, using memory fallback', { error: dbError.message });
      }

      // Fallback to memory
      const device = memoryDevices.get(id);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      if (status !== undefined) device.connectionStatus = status;
      if (metadata !== undefined) device.metadata = { ...device.metadata, ...metadata };
      device.lastPingAt = new Date().toISOString();
      device.updatedAt = new Date().toISOString();
      memoryDevices.set(id, device);

      res.json({ device, timestamp: new Date().toISOString() });
    } catch (error) {
      logger.error('Device heartbeat error', { error: error.message });
      res.status(500).json({ error: 'Failed to process heartbeat' });
    }
  },
);

// Delete device
router.delete('/devices/:id', authenticateJWT, createRateLimit(60 * 1000, 20), async (req, res) => {
  try {
    const { id } = req.params;

    // Try database first
    try {
      const result = await db.query('DELETE FROM nova_tv_devices WHERE id = $1 RETURNING id', [id]);
      if (result.rows?.length) {
        return res.json({ message: 'Device deleted successfully' });
      }
    } catch (dbError) {
      logger.warn('Database delete failed, using memory fallback', { error: dbError.message });
    }

    // Fallback to memory
    if (memoryDevices.has(id)) {
      memoryDevices.delete(id);
      res.json({ message: 'Device deleted successfully' });
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    logger.error('Delete device error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

// Activation Routes

// Generate activation code
router.post(
  '/devices/activation/generate',
  authenticateJWT,
  createRateLimit(60 * 1000, 10),
  async (req, res) => {
    try {
      const code = generateActivationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const activation = {
        id: generateId('ntva'),
        code,
        qrCode: `nova-tv://activate?code=${code}`,
        expiresAt: expiresAt.toISOString(),
        used: false,
        usedAt: null,
        deviceId: null,
        createdAt: new Date().toISOString(),
      };

      // Try database first
      try {
        await db.query(
          `
          INSERT INTO nova_tv_activations (id, code, qr_code, expires_at, used)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            activation.id,
            activation.code,
            activation.qrCode,
            activation.expiresAt,
            activation.used,
          ],
        );
      } catch (dbError) {
        logger.warn('Database insert failed, using memory fallback', { error: dbError.message });
        memoryActivations.set(activation.code, activation);
      }

      res.json({
        code: activation.code,
        qrCode: activation.qrCode,
        expiresAt: activation.expiresAt,
      });
    } catch (error) {
      logger.error('Generate activation code error', { error: error.message });
      res.status(500).json({ error: 'Failed to generate activation code' });
    }
  },
);

// Validate activation code
router.post(
  '/devices/activation/validate',
  createRateLimit(60 * 1000, 20),
  [
    body('code').isLength({ min: 1 }).withMessage('Activation code is required'),
    body('deviceFingerprint').isLength({ min: 1 }).withMessage('Device fingerprint is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code, deviceFingerprint } = req.body;

      // Try database first
      let activation = null;
      try {
        const result = await db.query(
          `
          SELECT * FROM nova_tv_activations 
          WHERE code = $1 AND expires_at > NOW() AND used = false
        `,
          [code],
        );
        activation = result.rows?.[0];
      } catch (dbError) {
        logger.warn('Database query failed, using memory fallback', { error: dbError.message });
        activation = memoryActivations.get(code);
        if (activation && (new Date(activation.expiresAt) <= new Date() || activation.used)) {
          activation = null;
        }
      }

      if (!activation) {
        return res.status(400).json({ error: 'Invalid or expired activation code' });
      }

      // Find or create device
      let device = null;
      try {
        const deviceResult = await db.query(
          `
          SELECT * FROM nova_tv_devices WHERE device_fingerprint = $1
        `,
          [deviceFingerprint],
        );
        device = deviceResult.rows?.[0];
      } catch (dbError) {
        logger.warn('Database query failed, using memory fallback', { error: dbError.message });
        device = Array.from(memoryDevices.values()).find(
          (d) => d.deviceFingerprint === deviceFingerprint,
        );
      }

      if (!device) {
        return res
          .status(400)
          .json({ error: 'Device not found. Please register the device first.' });
      }

      // Mark activation as used and activate device
      try {
        await db.query(
          `
          UPDATE nova_tv_activations SET used = true, used_at = NOW(), device_id = $1 
          WHERE code = $2
        `,
          [device.id, code],
        );

        await db.query(
          `
          UPDATE nova_tv_devices SET is_activated = true, activated_at = NOW() 
          WHERE id = $1
        `,
          [device.id],
        );
      } catch (dbError) {
        logger.warn('Database update failed, using memory fallback', { error: dbError.message });
        activation.used = true;
        activation.usedAt = new Date().toISOString();
        activation.deviceId = device.id;
        memoryActivations.set(code, activation);

        device.isActivated = true;
        device.activatedAt = new Date().toISOString();
        memoryDevices.set(device.id, device);
      }

      res.json({
        success: true,
        device: {
          id: device.id,
          name: device.name,
          isActivated: true,
        },
      });
    } catch (error) {
      logger.error('Validate activation code error', { error: error.message });
      res.status(500).json({ error: 'Failed to validate activation code' });
    }
  },
);

// Template Routes

// List templates
router.get('/templates', createRateLimit(60 * 1000, 100), async (req, res) => {
  try {
    const { category, departmentType, isActive } = req.query;

    // Try database first
    let templates = await queryDatabase(
      `
      SELECT * FROM nova_tv_templates 
      WHERE ($1::text IS NULL OR category = $1)
      AND ($2::text IS NULL OR department_type = $2)
      AND ($3::boolean IS NULL OR is_active = $3)
      ORDER BY created_at DESC
    `,
      [category || null, departmentType || null, isActive ? JSON.parse(isActive) : null],
    );

    // Fallback to memory
    if (templates === null) {
      templates = Array.from(memoryTemplates.values()).filter((t) => {
        return (
          (!category || t.category === category) &&
          (!departmentType || t.departmentType === departmentType) &&
          (isActive === undefined || t.isActive === JSON.parse(isActive))
        );
      });
    }

    res.json({ templates });
  } catch (error) {
    logger.error('List templates error', { error: error.message });
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

// Get template by ID
router.get('/templates/:id', createRateLimit(60 * 1000, 100), async (req, res) => {
  try {
    const { id } = req.params;

    // Try database first
    let templates = await queryDatabase('SELECT * FROM nova_tv_templates WHERE id = $1', [id]);
    let template = templates?.[0];

    // Fallback to memory
    if (!template) {
      template = memoryTemplates.get(id);
    }

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    logger.error('Get template error', { error: error.message });
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// Analytics Routes

// Record analytics event
router.post(
  '/analytics',
  createRateLimit(60 * 1000, 500),
  [
    body('eventType').isString().withMessage('Event type is required'),
    body('dashboardId').optional().isString(),
    body('deviceId').optional().isString(),
    body('eventData').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { dashboardId, deviceId, eventType, eventData } = req.body;
      const sessionId = req.headers['x-session-id'] || generateId('session');
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      const analytics = {
        id: generateId('ntva'),
        dashboardId: dashboardId || null,
        deviceId: deviceId || null,
        sessionId,
        eventType,
        eventData: eventData || {},
        userAgent,
        ipAddress,
        timestamp: new Date().toISOString(),
      };

      // Try database first
      try {
        await db.query(
          `
          INSERT INTO nova_tv_analytics 
          (id, dashboard_id, device_id, session_id, event_type, event_data, user_agent, ip_address)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            analytics.id,
            analytics.dashboardId,
            analytics.deviceId,
            analytics.sessionId,
            analytics.eventType,
            JSON.stringify(analytics.eventData),
            analytics.userAgent,
            analytics.ipAddress,
          ],
        );
      } catch (dbError) {
        logger.warn('Analytics database insert failed', { error: dbError.message });
        // For analytics, we don't need memory fallback as it's not critical
      }

      res.json({ success: true, timestamp: analytics.timestamp });
    } catch (error) {
      logger.error('Record analytics error', { error: error.message });
      res.status(500).json({ error: 'Failed to record analytics' });
    }
  },
);

// Mount digital signage routes
router.use('/digital-signage', digitalSignageRoutes);

export default router;
