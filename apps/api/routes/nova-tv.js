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
      logger.warn('Database not available, using mock data:', dbError.message);

      // Fallback to mock data
      let devices = Array.from(mockData.devices.values());

      // Apply filters
      if (department) {
        devices = devices.filter((d) => d.department === department);
      }
      if (connectionStatus) {
        devices = devices.filter((d) => d.connectionStatus === connectionStatus);
      }
      if (dashboardId) {
        devices = devices.filter((d) => d.dashboardId === dashboardId);
      }

      return res.json(devices);
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
      logger.warn('Database not available, using mock data:', dbError.message);

      // Fallback to mock data
      const device = mockData.devices.get(id);

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      return res.json(device);
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
      logger.warn('Database not available, using mock data:', dbError.message);

      // Fallback to mock data
      const existingDevice = Array.from(mockData.devices.values()).find(
        (d) => d.deviceFingerprint === deviceFingerprint,
      );

      if (existingDevice) {
        // Update existing device
        const updatedDevice = {
          ...existingDevice,
          lastActiveAt: new Date().toISOString(),
          connectionStatus: 'connected',
          ipAddress,
          browserInfo,
          settings,
          metadata,
          updatedAt: new Date().toISOString(),
        };

        mockData.devices.set(existingDevice.id, updatedDevice);
        return res.json(updatedDevice);
      } else {
        // Create new device
        const deviceData = {
          id: uuid(),
          name: name || `TV-${deviceFingerprint.slice(-6)}`,
          location,
          department,
          deviceFingerprint,
          ipAddress,
          browserInfo,
          connectionStatus: 'connected',
          settings,
          metadata,
          isActivated: false,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockData.devices.set(deviceData.id, deviceData);
        logger.info('Registered Nova TV device (mock):', {
          deviceId: deviceData.id,
          fingerprint: deviceFingerprint,
        });
        return res.status(201).json(deviceData);
      }
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
      logger.warn('Database not available, using mock data:', dbError.message);

      // Fallback to mock data
      const existingDevice = mockData.devices.get(id);
      if (!existingDevice) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const updatedDevice = {
        ...existingDevice,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      mockData.devices.set(id, updatedDevice);
      return res.json(updatedDevice);
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
      logger.warn('Database not available, using mock data:', dbError.message);

      // Fallback to mock data
      const device = mockData.devices.get(deviceId);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const dashboard = mockData.dashboards.get(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }

      const updatedDevice = {
        ...device,
        dashboardId,
        name: name || device.name,
        location: location || device.location,
        department: department || device.department,
        brandingConfig,
        displayConfig,
        isActivated: true,
        activatedBy: req.user.id,
        activatedAt: new Date().toISOString(),
        connectionStatus: 'connected',
        updatedAt: new Date().toISOString(),
      };

      mockData.devices.set(deviceId, updatedDevice);
      logger.info('Assigned dashboard to Nova TV device (mock):', { deviceId, dashboardId });
      return res.json(updatedDevice);
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
      logger.warn('Device heartbeat failed, using fallback:', error.message);
      // Fallback to mock data when DB unavailable
      const device = mockData.devices.get(deviceId);
      if (device) {
        device.connectionStatus = status;
        device.lastActiveAt = new Date().toISOString();
        device.metadata = {
          ...device.metadata,
          ...metadata,
          lastHeartbeat: new Date().toISOString(),
        };
        mockData.devices.set(deviceId, device);
      }

      return res.json({ success: true, device });
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
    const { deviceFingerprint } = req.body;

    // Generate unique codes
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const activationId = uuid();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/admin/tv-activate?device=${deviceFingerprint}&code=${activationCode}`;

    // For now, we'll skip QR code generation to avoid dependencies
    const qrCodeDataURL = `data:text/plain;base64,${Buffer.from(activationUrl).toString('base64')}`;

    // Store activation
    const activation = {
      id: activationId,
      code: activationCode,
      qrCode: qrCodeDataURL,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      used: false,
      createdAt: new Date().toISOString(),
    };

    mockData.activations.set(activationId, activation);

    logger.info('Generated activation code:', { activationId, code: activationCode });
    res.json({
      activationId: activation.id,
      code: activationCode,
      qrCode: qrCodeDataURL,
      activationUrl,
      expiresAt: activation.expiresAt,
    });
  } catch (error) {
    logger.error('Error generating activation code:', error);
    res.status(500).json({ error: 'Failed to generate activation code' });
  }
});

// Verify activation code (called by TV)
router.post('/activations/verify', async (req, res) => {
  try {
    const { code, deviceFingerprint } = req.body;

    if (!code || !deviceFingerprint) {
      return res.status(400).json({ error: 'Code and device fingerprint are required' });
    }

    // Find activation
    const activation = Array.from(mockData.activations.values()).find(
      (a) => a.code === code && !a.used && new Date(a.expiresAt) > new Date(),
    );

    if (!activation) {
      return res.status(400).json({ error: 'Invalid or expired activation code' });
    }

    // Mark activation as used
    activation.used = true;
    activation.usedAt = new Date().toISOString();
    mockData.activations.set(activation.id, activation);

    // Find or create device
    let device = Array.from(mockData.devices.values()).find(
      (d) => d.deviceFingerprint === deviceFingerprint,
    );

    if (!device) {
      device = {
        id: uuid(),
        name: `TV-${deviceFingerprint.slice(-6)}`,
        deviceFingerprint,
        connectionStatus: 'connected',
        isActivated: false,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {},
        metadata: {},
      };
      mockData.devices.set(device.id, device);
    }

    logger.info('Verified activation code:', { code, deviceId: device.id });
    res.json({
      success: true,
      device,
      message: 'Device activation verified. Admin can now assign a channel.',
    });
  } catch (error) {
    logger.error('Error verifying activation code:', error);
    res.status(500).json({ error: 'Failed to verify activation code' });
  }
});

// ====================================
// AUTHENTICATION ROUTES
// ====================================

router.post('/auth/generate-code', async (req, res) => {
  try {
    const sessionId = uuid();
    const sixDigitCode = Math.floor(100000 + Math.random() * 900000).toString();
    const qrCode = `nova-tv://auth?session=${sessionId}&code=${sixDigitCode}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const authSession = {
      sessionId,
      qrCode,
      sixDigitCode,
      expiresAt: expiresAt.toISOString(),
      isVerified: false,
    };

    mockData.authSessions.set(sessionId, authSession);

    res.json(authSession);
  } catch (error) {
    logger.error('Error generating auth code:', error);
    res.status(500).json({ error: 'Failed to generate auth code' });
  }
});

router.post('/auth/verify-code', async (req, res) => {
  try {
    const { sessionId, code } = req.body;

    const session = mockData.authSessions.get(sessionId);

    if (!session || new Date(session.expiresAt) < new Date() || session.sixDigitCode !== code) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    // Mark session as verified before cleanup (for status checking)
    session.isVerified = true;

    // Mock user and dashboards for now
    const user = { id: 'user-1', email: 'admin@nova.com', name: 'Nova Admin' };
    const availableDashboards = Array.from(mockData.dashboards.values()).filter((d) => d.isActive);

    // Clean up the session after short delay to allow status check
    setTimeout(() => {
      mockData.authSessions.delete(sessionId);
    }, 3000);

    res.json({
      success: true,
      user,
      availableDashboards,
      sessionToken: 'mock-session-token',
    });
  } catch (error) {
    logger.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Check authentication status
router.get('/auth/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = mockData.authSessions.get(sessionId);

    if (!session) {
      return res.json({ isVerified: false, isExpired: true });
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < now) {
      // Clean up expired session
      mockData.authSessions.delete(sessionId);
      return res.json({ isVerified: false, isExpired: true });
    }

    // Check if session has been verified (we could track this in session.isVerified)
    res.json({
      isVerified: session.isVerified || false,
      isExpired: false,
    });
  } catch (error) {
    logger.error('Error checking auth status:', error);
    res.status(500).json({ error: 'Failed to check auth status' });
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    // Mock token refresh
    res.json({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Live data integration routes
router.get('/live-data/tickets', requireAuth, async (req, res) => {
  try {
    // Mock ticket metrics
    const metrics = {
      openTickets: 23,
      ticketsToday: 8,
      avgResponseTime: '2.5 hours',
      criticalTickets: 3,
      departmentBreakdown: {
        IT: 12,
        HR: 5,
        Finance: 4,
        Operations: 2,
      },
      recentTickets: [
        {
          id: 'TK-001',
          title: 'Email server issues',
          priority: 'high',
          department: 'IT',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching ticket metrics:', error);
    res.status(500).json({ error: 'Failed to fetch ticket metrics' });
  }
});

router.get('/live-data/assets', requireAuth, async (req, res) => {
  try {
    // Mock asset metrics
    const metrics = {
      totalAssets: 156,
      assetsInUse: 134,
      assetsUnderMaintenance: 8,
      criticalAssets: 3,
      departmentBreakdown: {
        IT: 45,
        HR: 23,
        Finance: 34,
        Operations: 54,
      },
      recentCheckouts: [
        {
          id: 'AS-001',
          name: 'Laptop Dell XPS',
          checkedOutBy: 'John Doe',
          checkedOutAt: new Date().toISOString(),
        },
      ],
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching asset metrics:', error);
    res.status(500).json({ error: 'Failed to fetch asset metrics' });
  }
});

export default router;
