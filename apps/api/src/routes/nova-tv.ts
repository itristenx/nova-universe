import express from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { logger } from '../logger.js';

const router = express.Router();

// Production database operations for Nova TV dashboards

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

    // Build WHERE conditions
    const whereConditions = [];
    const params = [];
    let paramCount = 0;

    if (department) {
      paramCount++;
      whereConditions.push(`department = $${paramCount}`);
      params.push(department);
    }
    if (createdBy) {
      paramCount++;
      whereConditions.push(`created_by = $${paramCount}`);
      params.push(createdBy);
    }
    if (isActive !== undefined) {
      paramCount++;
      whereConditions.push(`is_active = $${paramCount}`);
      params.push(isActive === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT d.*, u.name as creator_name, u.email as creator_email
      FROM nova_tv_dashboards d
      LEFT JOIN users u ON d.created_by = u.id
      ${whereClause}
      ORDER BY d.created_at DESC
    `;

    const result = await db.query(query, params);
    res.json(result.rows || []);
  } catch (error) {
    logger.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
});

router.get('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT d.*, u.name as creator_name, u.email as creator_email
      FROM nova_tv_dashboards d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.id = $1
    `;

    const result = await db.query(query, [id]);
    const dashboard = result.rows?.[0];

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
    const { name, description, department, configuration, isActive, isPublic } = req.body;
    const dashboardId = uuid();

    const query = `
      INSERT INTO nova_tv_dashboards (
        id, name, description, department, configuration, 
        is_active, is_public, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(query, [
      dashboardId,
      name,
      description,
      department,
      JSON.stringify(configuration),
      isActive !== false,
      isPublic === true,
      req.user.id
    ]);

    const dashboard = result.rows?.[0];

    logger.info('Created Nova TV dashboard:', {
      dashboardId: dashboard.id,
      name: dashboard.name,
    });
    res.status(201).json(dashboard);
  } catch (error) {
    logger.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

router.put('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, department, configuration, isActive, isPublic } = req.body;

    // Build update fields dynamically
    const updateFields = [];
    const params = [id]; // id is always first parameter
    let paramCount = 1;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      params.push(description);
    }
    if (department !== undefined) {
      paramCount++;
      updateFields.push(`department = $${paramCount}`);
      params.push(department);
    }
    if (configuration !== undefined) {
      paramCount++;
      updateFields.push(`configuration = $${paramCount}`);
      params.push(JSON.stringify(configuration));
    }
    if (isActive !== undefined) {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      params.push(isActive);
    }
    if (isPublic !== undefined) {
      paramCount++;
      updateFields.push(`is_public = $${paramCount}`);
      params.push(isPublic);
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) { // Only updated_at
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const query = `
      UPDATE nova_tv_dashboards 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (!result.rows?.[0]) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    logger.info('Updated Nova TV dashboard:', { dashboardId: id });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

router.delete('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM nova_tv_dashboards WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);

    if (!result.rows?.[0]) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

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

    // First, get the original dashboard
    const selectQuery = `SELECT * FROM nova_tv_dashboards WHERE id = $1`;
    const selectResult = await db.query(selectQuery, [id]);
    const originalDashboard = selectResult.rows?.[0];

    if (!originalDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Create the duplicate with a new ID
    const newDashboardId = uuid();
    const insertQuery = `
      INSERT INTO nova_tv_dashboards (
        id, name, description, department, configuration, 
        is_active, is_public, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const insertResult = await db.query(insertQuery, [
      newDashboardId,
      name,
      originalDashboard.description,
      originalDashboard.department,
      originalDashboard.configuration,
      originalDashboard.is_active,
      originalDashboard.is_public,
      req.user.id
    ]);

    const newDashboard = insertResult.rows?.[0];

    logger.info('Duplicated Nova TV dashboard:', { originalId: id, newId: newDashboard.id });
    res.status(201).json(newDashboard);
  } catch (error) {
    logger.error('Error duplicating dashboard:', error);
    res.status(500).json({ error: 'Failed to duplicate dashboard' });
  }
});

// ====================================
// DEVICE MANAGEMENT  
// ====================================

// Get all devices
router.get('/devices', requireAuth, async (req, res) => {
  try {
    const { department, connectionStatus, dashboardId } = req.query;

    // Build WHERE conditions
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
    res.json(result.rows || []);
  } catch (error) {
    logger.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get single device
router.get('/devices/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

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

    res.json(device);
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

    // Check if device already exists
    const existingQuery = `SELECT * FROM nova_tv_devices WHERE device_fingerprint = $1`;
    const existingResult = await db.query(existingQuery, [deviceFingerprint]);
    const existingDevice = existingResult.rows?.[0];

    if (existingDevice) {
      // Update existing device
      const updateQuery = `
        UPDATE nova_tv_devices 
        SET ip_address = $2,
            browser_info = $3,
            settings = $4,
            metadata = $5,
            last_active_at = NOW(),
            connection_status = 'connected',
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

      logger.info('Updated Nova TV device:', { deviceId: existingDevice.id, fingerprint: deviceFingerprint });
      res.json(updateResult.rows[0]);
    } else {
      // Create new device
      const insertQuery = `
        INSERT INTO nova_tv_devices (
          id, name, location, department, device_fingerprint, ip_address,
          browser_info, connection_status, settings, metadata, is_activated,
          last_active_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'connected', $8, $9, false, NOW(), NOW(), NOW())
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
        JSON.stringify(settings),
        JSON.stringify(metadata),
      ]);

      logger.info('Registered Nova TV device:', { deviceId, fingerprint: deviceFingerprint });
      res.status(201).json(insertResult.rows[0]);
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
    res.json(result.rows[0]);
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

    // Verify dashboard exists
    const dashboardQuery = `SELECT id, name FROM nova_tv_dashboards WHERE id = $1`;
    const dashboardResult = await db.query(dashboardQuery, [dashboardId]);

    if (!dashboardResult.rows?.[0]) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Update device with dashboard assignment
    const updateQuery = `
      UPDATE nova_tv_devices 
      SET dashboard_id = $2,
          name = $3,
          location = $4,
          department = $5,
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
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error assigning dashboard:', error);
    res.status(500).json({ error: 'Failed to assign dashboard' });
  }
});

// Device heartbeat (called periodically by TV)
router.post('/devices/:deviceId/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status = 'connected', metadata = {} } = req.body;

    const updateQuery = `
      UPDATE nova_tv_devices 
      SET connection_status = $2,
          last_active_at = NOW(),
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

    res.json({ success: true, device: result.rows?.[0] });
  } catch (error) {
    logger.error('Error updating device heartbeat:', error);
    res.status(500).json({ error: 'Failed to update device heartbeat' });
  }
});

export default router;