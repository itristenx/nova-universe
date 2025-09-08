import express from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { logger } from '../logger.js';

const router = express.Router();

// Production data access layer - uses database instead of mock data
async function getDashboardsFromDB(filters = {}) {
  try {
    let query = 'SELECT * FROM nova_tv_dashboards';
    const params = [];
    const conditions = [];

    if (filters.department) {
      conditions.push(`department = $${params.length + 1}`);
      params.push(filters.department);
    }

    if (filters.isPublic !== undefined) {
      conditions.push(`is_public = $${params.length + 1}`);
      params.push(filters.isPublic);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows.map(transformDashboardFromDB);
  } catch (error) {
    logger.error('Error fetching dashboards from database:', error);
    return [];
  }
}

async function getDashboardFromDB(id) {
  try {
    const result = await db.query('SELECT * FROM nova_tv_dashboards WHERE id = $1', [id]);
    return result.rows && result.rows.length > 0 ? transformDashboardFromDB(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error fetching dashboard from database:', error);
    return null;
  }
}

async function createDashboardInDB(dashboardData) {
  try {
    const query = `
      INSERT INTO nova_tv_dashboards 
      (id, name, description, department, created_by, configuration, is_active, is_public, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    
    const params = [
      dashboardData.id,
      dashboardData.name,
      dashboardData.description,
      dashboardData.department,
      dashboardData.createdBy,
      JSON.stringify(dashboardData.configuration),
      dashboardData.isActive,
      dashboardData.isPublic,
      dashboardData.createdAt,
      dashboardData.updatedAt
    ];

    await db.query(query, params);
    return dashboardData;
  } catch (error) {
    logger.error('Error creating dashboard in database:', error);
    throw error;
  }
}

async function updateDashboardInDB(id, updates) {
  try {
    // Convert SQLite-style placeholders to PostgreSQL-style ($1, $2, etc.)
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const params = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => {
        if (key === 'configuration') {
          return JSON.stringify(updates[key]);
        }
        return updates[key];
      });
    params.push(id);

    const query = `UPDATE nova_tv_dashboards SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length}`;
    await db.query(query, params);
    
    return await getDashboardFromDB(id);
  } catch (error) {
    logger.error('Error updating dashboard in database:', error);
    throw error;
  }
}

async function deleteDashboardFromDB(id) {
  try {
    await db.query('DELETE FROM nova_tv_dashboards WHERE id = $1', [id]);
    return true;
  } catch (error) {
    logger.error('Error deleting dashboard from database:', error);
    throw error;
  }
}

// Production data access layer - devices
async function getDevicesFromDB(filters = {}) {
  try {
    let query = 'SELECT * FROM nova_tv_devices';
    const params = [];
    const conditions = [];

    if (filters.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(filters.status);
    }

    if (filters.location) {
      conditions.push(`location = $${params.length + 1}`);
      params.push(filters.location);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows.map(transformDeviceFromDB);
  } catch (error) {
    logger.error('Error fetching devices from database:', error);
    return [];
  }
}

async function getDeviceFromDB(id) {
  try {
    const result = await db.query('SELECT * FROM nova_tv_devices WHERE id = $1', [id]);
    return result.rows && result.rows.length > 0 ? transformDeviceFromDB(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error fetching device from database:', error);
    return null;
  }
}

async function getDeviceByDeviceIdFromDB(deviceId) {
  try {
    const result = await db.query('SELECT * FROM nova_tv_devices WHERE device_id = $1', [deviceId]);
    return result.rows && result.rows.length > 0 ? transformDeviceFromDB(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error fetching device by device_id from database:', error);
    return null;
  }
}

async function createDeviceInDB(deviceData) {
  try {
    const query = `
      INSERT INTO nova_tv_devices 
      (id, name, device_id, location, status, last_ping, configuration, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const params = [
      deviceData.id,
      deviceData.name,
      deviceData.deviceId,
      deviceData.location,
      deviceData.status,
      deviceData.lastPing,
      JSON.stringify(deviceData.configuration || {}),
      deviceData.createdAt,
      deviceData.updatedAt
    ];

    await db.query(query, params);
    return deviceData;
  } catch (error) {
    logger.error('Error creating device in database:', error);
    throw error;
  }
}

async function updateDeviceInDB(id, updates) {
  try {
    // Convert SQLite-style placeholders to PostgreSQL-style ($1, $2, etc.)
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const params = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => {
        if (key === 'configuration') {
          return JSON.stringify(updates[key]);
        }
        return updates[key];
      });
    params.push(id);

    const query = `UPDATE nova_tv_devices SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length}`;
    await db.query(query, params);
    
    return await getDeviceFromDB(id);
  } catch (error) {
    logger.error('Error updating device in database:', error);
    throw error;
  }
}

function transformDeviceFromDB(dbRow) {
  return {
    id: dbRow.id,
    name: dbRow.name,
    deviceId: dbRow.device_id,
    location: dbRow.location,
    status: dbRow.status,
    lastPing: dbRow.last_ping,
    configuration: typeof dbRow.configuration === 'string' 
      ? JSON.parse(dbRow.configuration) 
      : dbRow.configuration,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
}

function transformDashboardFromDB(dbRow) {
  return {
    id: dbRow.id,
    name: dbRow.name,
    description: dbRow.description,
    department: dbRow.department,
    createdBy: dbRow.created_by,
    configuration: typeof dbRow.configuration === 'string' 
      ? JSON.parse(dbRow.configuration) 
      : dbRow.configuration,
    isActive: Boolean(dbRow.is_active),
    isPublic: Boolean(dbRow.is_public),
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
}

// Enhanced auth middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // For now, we'll use a simple user ID extraction
  // In production, this would verify JWT tokens
  req.user = { id: 'user-1', email: 'admin@nova.com', name: 'Nova Admin' };
  next();
};

// ====================================
// DASHBOARD (CHANNELS) MANAGEMENT
// ====================================

// Dashboard routes
router.get('/dashboards', requireAuth, async (req, res) => {
  try {
    const { department, createdBy, isActive } = req.query;
    
    const filters = {};
    if (department) filters.department = department;
    if (isActive !== undefined) filters.isPublic = isActive === 'true';

    const dashboards = await getDashboardsFromDB(filters);

    // Apply additional filters that aren't in DB query
    let filteredDashboards = dashboards;
    if (createdBy) {
      filteredDashboards = dashboards.filter((d) => d.createdBy === createdBy);
    }

    res.json(filteredDashboards);
  } catch (error) {
    logger.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
});

router.get('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const dashboard = await getDashboardFromDB(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json(dashboard);
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.post('/dashboards', requireAuth, async (req, res) => {
  try {
    const dashboardData = {
      ...req.body,
      id: uuid(),
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdDashboard = await createDashboardInDB(dashboardData);

    logger.info('Created Nova TV dashboard:', {
      dashboardId: dashboardData.id,
      name: dashboardData.name,
    });
    res.status(201).json(createdDashboard);
  } catch (error) {
    logger.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

router.put('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingDashboard = await getDashboardFromDB(id);
    if (!existingDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const updatedDashboard = await updateDashboardInDB(id, updates);

    logger.info('Updated Nova TV dashboard:', { dashboardId: id });
    res.json(updatedDashboard);
  } catch (error) {
    logger.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

router.delete('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existingDashboard = await getDashboardFromDB(id);
    if (!existingDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    await deleteDashboardFromDB(id);

    logger.info('Deleted Nova TV dashboard:', { dashboardId: id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting dashboard:', error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
});

router.post('/dashboards/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const originalDashboard = await getDashboardFromDB(id);

    if (!originalDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const newDashboard = {
      ...originalDashboard,
      id: uuid(),
      name,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdDashboard = await createDashboardInDB(newDashboard);

    logger.info('Duplicated Nova TV dashboard:', { originalId: id, newId: newDashboard.id });
    res.status(201).json(createdDashboard);
  } catch (error) {
    logger.error('Error duplicating dashboard:', error);
    res.status(500).json({ error: 'Failed to duplicate dashboard' });
  }
});

// ====================================
// DEVICE MANAGEMENT WITH DATABASE
// ====================================

// Get all devices
router.get('/devices', requireAuth, async (req, res) => {
  try {
    const { department, connectionStatus, dashboardId } = req.query;

    // Try database first
    try {
      const whereConditions = [];
      const params = [];
      let paramIndex = 1;

      if (department) {
        whereConditions.push(`d.department = $${paramIndex++}`);
        params.push(department);
      }
      if (connectionStatus) {
        whereConditions.push(`d.connection_status = $${paramIndex++}`);
        params.push(connectionStatus);
      }
      if (dashboardId) {
        whereConditions.push(`d.dashboard_id = $${paramIndex++}`);
        params.push(dashboardId);
      }

      const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT d.*, 
               db.name as dashboard_name,
               db.department as dashboard_department
        FROM nova_tv_devices d
        LEFT JOIN nova_tv_dashboards db ON d.dashboard_id = db.id
        WHERE 1=1 ${whereClause}
        ORDER BY d.created_at DESC
      `;

      const result = await db.query(query, params);
      return res.json(result.rows || []);
    } catch (dbError) {
      logger.error('Database error fetching devices:', dbError.message);
      return res.status(500).json({ error: 'Failed to fetch devices' });
    }
  } catch (error) {
    logger.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get single device
router.get('/devices/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Try database first
    try {
      const query = `
        SELECT d.*, 
               db.name as dashboard_name,
               db.department as dashboard_department,
               u.name as activated_by_name
        FROM nova_tv_devices d
        LEFT JOIN nova_tv_dashboards db ON d.dashboard_id = db.id
        LEFT JOIN users u ON d.activated_by = u.id
        WHERE d.id = $1
      `;

      const result = await db.query(query, [id]);
      const device = result.rows?.[0];

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      return res.json(device);
    } catch (dbError) {
      logger.error('Database error fetching device:', dbError.message);
      return res.status(500).json({ error: 'Failed to fetch device' });
    }
  } catch (error) {
    logger.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Register/update device (called by TV during activation)
router.post('/devices/register', async (req, res) => {
  try {
    const {
      name,
      location,
      department,
      deviceFingerprint,
      ipAddress,
      browserInfo,
      settings = {},
      metadata = {},
    } = req.body;

    if (!deviceFingerprint) {
      return res.status(400).json({ error: 'Device fingerprint is required' });
    }

    // Try database first
    try {
      // Check if device already exists
      const existingQuery = `SELECT * FROM nova_tv_devices WHERE device_fingerprint = $1`;
      const existingResult = await db.query(existingQuery, [deviceFingerprint]);
      const existingDevice = existingResult.rows?.[0];

      if (existingDevice) {
        // Update existing device
        const updateQuery = `
          UPDATE nova_tv_devices 
          SET last_active_at = NOW(),
              connection_status = 'connected',
              ip_address = $2,
              browser_info = $3,
              settings = $4,
              metadata = $5,
              updated_at = NOW()
          WHERE device_fingerprint = $1
          RETURNING *
        `;

        const updateResult = await db.query(updateQuery, [
          deviceFingerprint,
          ipAddress,
          browserInfo,
          JSON.stringify(settings),
          JSON.stringify(metadata),
        ]);

        return res.json(updateResult.rows[0]);
      } else {
        // Create new device
        const insertQuery = `
          INSERT INTO nova_tv_devices (
            id, name, location, department, device_fingerprint, 
            ip_address, browser_info, connection_status, settings, 
            metadata, last_active_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
          RETURNING *
        `;

        const deviceId = uuid();
        const deviceName = name || `TV-${deviceFingerprint.slice(-6)}`;

        const insertResult = await db.query(insertQuery, [
          deviceId,
          deviceName,
          location,
          department,
          deviceFingerprint,
          ipAddress,
          browserInfo,
          'connected',
          JSON.stringify(settings),
          JSON.stringify(metadata),
        ]);

        logger.info('Registered Nova TV device:', { deviceId, fingerprint: deviceFingerprint });
        return res.status(201).json(insertResult.rows[0]);
      }
    } catch (dbError) {
      logger.error('Database error registering device:', dbError.message);
      return res.status(500).json({ error: 'Failed to register device' });
    }
  } catch (error) {
    logger.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Update device
router.put('/devices/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Try database first
    try {
      const updateFields = [];
      const params = [id];
      let paramIndex = 2;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        params.push(updates.name);
      }
      if (updates.location !== undefined) {
        updateFields.push(`location = $${paramIndex++}`);
        params.push(updates.location);
      }
      if (updates.department !== undefined) {
        updateFields.push(`department = $${paramIndex++}`);
        params.push(updates.department);
      }
      if (updates.dashboardId !== undefined) {
        updateFields.push(`dashboard_id = $${paramIndex++}`);
        params.push(updates.dashboardId);
      }
      if (updates.settings !== undefined) {
        updateFields.push(`settings = $${paramIndex++}`);
        params.push(JSON.stringify(updates.settings));
      }
      if (updates.metadata !== undefined) {
        updateFields.push(`metadata = $${paramIndex++}`);
        params.push(JSON.stringify(updates.metadata));
      }
      if (updates.brandingConfig !== undefined) {
        updateFields.push(`branding_config = $${paramIndex++}`);
        params.push(JSON.stringify(updates.brandingConfig));
      }
      if (updates.displayConfig !== undefined) {
        updateFields.push(`display_config = $${paramIndex++}`);
        params.push(JSON.stringify(updates.displayConfig));
      }
      if (updates.logoUrl !== undefined) {
        updateFields.push(`logo_url = $${paramIndex++}`);
        params.push(updates.logoUrl);
      }
      if (updates.bgUrl !== undefined) {
        updateFields.push(`bg_url = $${paramIndex++}`);
        params.push(updates.bgUrl);
      }

      updateFields.push('updated_at = NOW()');

      const updateQuery = `
        UPDATE nova_tv_devices 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, params);

      if (!result.rows?.[0]) {
        return res.status(404).json({ error: 'Device not found' });
      }

      logger.info('Updated Nova TV device:', { deviceId: id });
      return res.json(result.rows[0]);
    } catch (dbError) {
      logger.error('Database error updating device:', dbError.message);
      return res.status(500).json({ error: 'Failed to update device' });
    }
  } catch (error) {
    logger.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Assign dashboard to device (activate device)
router.post('/devices/:deviceId/assign', requireAuth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const {
      dashboardId,
      name,
      location,
      department,
      brandingConfig = {},
      displayConfig = {},
    } = req.body;

    // Try database first
    try {
      // Verify dashboard exists
      const dashboardQuery = `SELECT id, name FROM nova_tv_dashboards WHERE id = $1`;
      const dashboardResult = await db.query(dashboardQuery, [dashboardId]);

      if (!dashboardResult.rows?.[0]) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      // Update device with assignment
      const updateQuery = `
        UPDATE nova_tv_devices 
        SET dashboard_id = $2,
            name = COALESCE($3, name),
            location = COALESCE($4, location),
            department = COALESCE($5, department),
            branding_config = $6,
            display_config = $7,
            is_activated = true,
            activated_by = $8,
            activated_at = NOW(),
            connection_status = 'connected',
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, [
        deviceId,
        dashboardId,
        name,
        location,
        department,
        JSON.stringify(brandingConfig),
        JSON.stringify(displayConfig),
        req.user.id,
      ]);

      if (!result.rows?.[0]) {
        return res.status(404).json({ error: 'Device not found' });
      }

      logger.info('Assigned dashboard to Nova TV device:', { deviceId, dashboardId });
      return res.json(result.rows[0]);
    } catch (dbError) {
      logger.error('Database error assigning dashboard:', dbError.message);
      return res.status(500).json({ error: 'Failed to assign dashboard' });
    }
  } catch (error) {
    logger.error('Error assigning dashboard:', error);
    res.status(500).json({ error: 'Failed to assign dashboard' });
  }
});

// Device heartbeat
router.post('/devices/:deviceId/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status = 'connected', metadata = {} } = req.body;

    // Try database first
    try {
      const updateQuery = `
        UPDATE nova_tv_devices 
        SET connection_status = $2,
            last_active_at = NOW(),
            last_ping_at = NOW(),
            metadata = $3,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, [
        deviceId,
        status,
        JSON.stringify({
          ...metadata,
          lastHeartbeat: new Date().toISOString(),
        }),
      ]);

      return res.json({ success: true, device: result.rows?.[0] });
    } catch (error) {
      logger.error('Device heartbeat DB error:', error.message);
      return res.status(500).json({ error: 'Failed to update device heartbeat' });
    }
  } catch (error) {
    logger.error('Error updating device heartbeat:', error);
    res.status(500).json({ error: 'Failed to update device heartbeat' });
  }
});

// ====================================
// DEVICE ACTIVATION FLOW
// ====================================

// Generate activation code/QR for admin to scan
router.post('/activations/generate', requireAuth, async (req, res) => {
  try {
    const { deviceFingerprint } = req.body || {};
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const activationId = uuid();
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host').replace(/\/api$/, '')}` || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/admin/tv-activate?device=${encodeURIComponent(deviceFingerprint || '')}&code=${activationCode}`;
    const qrCodeDataURL = `data:text/plain;base64,${Buffer.from(activationUrl).toString('base64')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      `INSERT INTO nova_tv_activations (id, code, qr_code, expires_at, used, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [activationId, activationCode, qrCodeDataURL, expiresAt],
    );

    return res.json({
      activationId,
      code: activationCode,
      qrCode: qrCodeDataURL,
      activationUrl,
      expiresAt,
    });
  } catch (error) {
    logger.error('Error generating activation code:', error);
    return res.status(500).json({ error: 'Failed to generate activation code' });
  }
});

// Verify activation code (called by TV)
router.post('/activations/verify', async (req, res) => {
  try {
    const { code, deviceFingerprint } = req.body || {};
    if (!code || !deviceFingerprint) {
      return res.status(400).json({ error: 'Code and device fingerprint are required' });
    }

    const actRes = await db.query(
      `SELECT * FROM nova_tv_activations WHERE code = $1 AND used = false AND expires_at > NOW() LIMIT 1`,
      [code],
    );
    const activation = actRes.rows?.[0];
    if (!activation) {
      return res.status(400).json({ error: 'Invalid or expired activation code' });
    }

    // Find or create device by fingerprint
    let device = null;
    const devRes = await db.query(
      `SELECT * FROM nova_tv_devices WHERE device_fingerprint = $1 LIMIT 1`,
      [deviceFingerprint],
    );
    if (devRes.rows?.[0]) {
      device = devRes.rows[0];
    } else {
      const deviceId = uuid();
      const name = `TV-${deviceFingerprint.slice(-6)}`;
      await db.query(
        `INSERT INTO nova_tv_devices (id, name, device_fingerprint, connection_status, last_active_at, created_at, updated_at)
         VALUES ($1, $2, $3, 'connected', NOW(), NOW(), NOW())`,
        [deviceId, name, deviceFingerprint],
      );
      const newRes = await db.query(`SELECT * FROM nova_tv_devices WHERE id = $1`, [deviceId]);
      device = newRes.rows?.[0];
    }

    // Mark activation as used and link device
    await db.query(
      `UPDATE nova_tv_activations SET used = true, used_at = NOW(), device_id = $2 WHERE id = $1`,
      [activation.id, device.id],
    );

    return res.json({ success: true, device, message: 'Device activation verified.' });
  } catch (error) {
    logger.error('Error verifying activation code:', error);
    return res.status(500).json({ error: 'Failed to verify activation code' });
  }
});

// ====================================
// AUTHENTICATION ROUTES
// ====================================

router.post('/auth/generate-code', async (req, res) => {
  try {
    const { deviceFingerprint } = req.body || {};
    const sessionId = uuid();
    const sixDigitCode = Math.floor(100000 + Math.random() * 900000).toString();
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host').replace(/\/api$/, '')}` || 'http://localhost:3000';
    const qrCode = `${baseUrl}/admin/tv-activate?session=${encodeURIComponent(sessionId)}&code=${encodeURIComponent(sixDigitCode)}${deviceFingerprint ? `&device=${encodeURIComponent(deviceFingerprint)}` : ''}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      `INSERT INTO nova_tv_auth_sessions (session_id, qr_code, six_digit_code, expires_at, is_used, device_id, created_at)
       VALUES ($1, $2, $3, $4, false, $5, NOW())`,
      [sessionId, qrCode, sixDigitCode, expiresAt, null],
    );

    return res.json({ sessionId, qrCode, sixDigitCode, expiresAt });
  } catch (error) {
    logger.error('Error generating auth code:', error);
    return res.status(500).json({ error: 'Failed to generate auth code' });
  }
});

router.post('/auth/verify-code', async (req, res) => {
  try {
    const { sessionId, code } = req.body || {};
    if (!sessionId || !code) return res.status(400).json({ error: 'Invalid request' });

    const sRes = await db.query(
      `SELECT * FROM nova_tv_auth_sessions WHERE session_id = $1 LIMIT 1`,
      [sessionId],
    );
    const session = sRes.rows?.[0];
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.is_used) return res.status(400).json({ error: 'Code already used' });
    if (new Date(session.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });
    if (session.six_digit_code !== code) return res.status(401).json({ error: 'Invalid code' });

    await db.query(
      `UPDATE nova_tv_auth_sessions SET is_used = true, used_at = NOW() WHERE session_id = $1`,
      [sessionId],
    );

    // Return available active dashboards for selection
    const dRes = await db.query(
      `SELECT id, name, department FROM nova_tv_dashboards WHERE is_active = true ORDER BY created_at DESC LIMIT 50`,
    );

    return res.json({ success: true, availableDashboards: dRes.rows || [], sessionToken: uuid() });
  } catch (error) {
    logger.error('Auth verify-code error:', error);
    return res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Check authentication status
router.get('/auth/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sRes = await db.query(
      `SELECT session_id, expires_at, is_used FROM nova_tv_auth_sessions WHERE session_id = $1 LIMIT 1`,
      [sessionId],
    );
    const session = sRes.rows?.[0];
    if (!session) return res.json({ isVerified: false, isExpired: true });
    const expired = new Date(session.expires_at) < new Date();
    return res.json({ isVerified: !!session.is_used, isExpired: expired });
  } catch (error) {
    logger.error('Auth status error:', error);
    return res.status(500).json({ error: 'Failed to check auth status' });
  }
});

router.post('/auth/refresh', async (req, res) => {
  return res.status(501).json({ error: 'Auth refresh not implemented' });
});

// Live data integration routes
router.get('/live-data/tickets', requireAuth, async (req, res) => {
  try {
    const { department } = req.query;
    const where = [];
    const params = [];
    if (department) {
      where.push(`department = $${params.length + 1}`);
      params.push(department);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalRes = await db.query(`SELECT COUNT(*) FROM tickets ${whereClause}`, params);
    const openRes = await db.query(
      `SELECT COUNT(*) FROM tickets ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = 'open'`,
      params,
    );
    const criticalRes = await db.query(
      `SELECT COUNT(*) FROM tickets ${whereClause}${whereClause ? ' AND' : ' WHERE'} priority = 'critical'`,
      params,
    );
    const recentRes = await db.query(
      `SELECT id, title, priority, department, created_at FROM tickets ${whereClause} ORDER BY created_at DESC LIMIT 5`,
      params,
    );
    const breakdownRes = await db.query(
      `SELECT COALESCE(category, 'Uncategorized') AS category, COUNT(*) FROM tickets ${whereClause} GROUP BY category ORDER BY COUNT(*) DESC LIMIT 10`,
      params,
    );

    return res.json({
      openTickets: parseInt(openRes.rows?.[0]?.count || '0'),
      ticketsToday: 0,
      avgResponseTime: null,
      criticalTickets: parseInt(criticalRes.rows?.[0]?.count || '0'),
      departmentBreakdown: Object.fromEntries(breakdownRes.rows.map((r) => [r.category, parseInt(r.count)])),
      recentTickets: recentRes.rows.map((r) => ({ id: r.id, title: r.title, priority: r.priority, department: r.department, createdAt: r.created_at })),
      total: parseInt(totalRes.rows?.[0]?.count || '0'),
    });
  } catch (error) {
    logger.error('Live ticket metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket metrics' });
  }
});

router.get('/live-data/assets', requireAuth, async (req, res) => {
  try {
    const { department } = req.query;
    const where = [];
    const params = [];
    if (department) {
      where.push(`department = $${params.length + 1}`);
      params.push(department);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalRes = await db.query(`SELECT COUNT(*) FROM inventory_assets ${whereClause}`, params);
    const inUseRes = await db.query(
      `SELECT COUNT(*) FROM inventory_assets ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = 'IN_USE'`,
      params,
    );
    const maintenanceRes = await db.query(
      `SELECT COUNT(*) FROM inventory_assets ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = 'MAINTENANCE'`,
      params,
    );
    const criticalRes = await db.query(
      `SELECT COUNT(*) FROM inventory_assets ${whereClause}${whereClause ? ' AND' : ' WHERE'} status = 'CRITICAL'`,
      params,
    );
    const breakdownRes = await db.query(
      `SELECT COALESCE(department, 'Unassigned') AS department, COUNT(*) FROM inventory_assets ${whereClause} GROUP BY department ORDER BY COUNT(*) DESC LIMIT 10`,
      params,
    );

    return res.json({
      totalAssets: parseInt(totalRes.rows?.[0]?.count || '0'),
      assetsInUse: parseInt(inUseRes.rows?.[0]?.count || '0'),
      assetsUnderMaintenance: parseInt(maintenanceRes.rows?.[0]?.count || '0'),
      criticalAssets: parseInt(criticalRes.rows?.[0]?.count || '0'),
      departmentBreakdown: Object.fromEntries(breakdownRes.rows.map((r) => [r.department, parseInt(r.count)])),
      recentCheckouts: [],
    });
  } catch (error) {
    logger.error('Live asset metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch asset metrics' });
  }
});

export default router;
