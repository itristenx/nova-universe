import express from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db.js';
import { logger } from '../../logger.js';
import QRCodeLib from 'qrcode';

const router = express.Router();

// Mock data store (fallback when database not available)
const mockData = {
  dashboards: new Map(),
  devices: new Map(),
  templates: new Map(),
  content: new Map(),
  analytics: new Map(),
  authSessions: new Map(),
  activations: new Map(),
};

// Initialize with some demo data
initializeMockData();

function initializeMockData() {
  // Demo dashboard
  const demoDashboard = {
    id: 'demo-dashboard',
    name: 'IT Department Dashboard',
    description: 'Main dashboard for IT department',
    department: 'IT',
    createdBy: 'user-1',
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
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: 'user-1', name: 'Nova Admin', email: 'admin@nova.com' },
  };

  mockData.dashboards.set(demoDashboard.id, demoDashboard);
}

// Enhanced auth middleware
const requireAuth = (req: any, res: any, next: any) => {
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
router.get('/dashboards', requireAuth, async (req: any, res: any) => {
  try {
    const { department, createdBy, isActive } = req.query;

    let dashboards = Array.from(mockData.dashboards.values());

    // Apply filters
    if (department) {
      dashboards = dashboards.filter((d: any) => d.department === department);
    }
    if (createdBy) {
      dashboards = dashboards.filter((d: any) => d.createdBy === createdBy);
    }
    if (isActive !== undefined) {
      dashboards = dashboards.filter((d: any) => d.isActive === (isActive === 'true'));
    }

    res.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
});

router.get('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const dashboard = mockData.dashboards.get(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.post('/dashboards', requireAuth, async (req: any, res: any) => {
  try {
    const dashboardData = {
      ...req.body,
      id: uuid(),
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: req.user,
    };

    mockData.dashboards.set(dashboardData.id, dashboardData);

    res.status(201).json(dashboardData);
  } catch (error) {
    console.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

router.put('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingDashboard = mockData.dashboards.get(id);
    if (!existingDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const updatedDashboard = {
      ...existingDashboard,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockData.dashboards.set(id, updatedDashboard);

    res.json(updatedDashboard);
  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

router.delete('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!mockData.dashboards.has(id)) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    mockData.dashboards.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
});

router.post('/dashboards/:id/duplicate', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const originalDashboard = mockData.dashboards.get(id);

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
      creator: req.user,
    };

    mockData.dashboards.set(newDashboard.id, newDashboard);

    res.status(201).json(newDashboard);
  } catch (error) {
    console.error('Error duplicating dashboard:', error);
    res.status(500).json({ error: 'Failed to duplicate dashboard' });
  }
});

// ====================================
// DEVICE MANAGEMENT WITH DATABASE
// ====================================

// Get all devices
router.get('/devices', requireAuth, async (req: any, res: any) => {
  try {
    const { department, connectionStatus, dashboardId } = req.query;

    // Try database first
    try {
      const query = `
        SELECT d.*, 
               db.name as dashboard_name,
               db.department as dashboard_department
        FROM nova_tv_devices d
        LEFT JOIN nova_tv_dashboards db ON d.dashboard_id = db.id
        WHERE 1=1
        ${department ? `AND d.department = $1` : ''}
        ${connectionStatus ? `AND d.connection_status = $2` : ''}
        ${dashboardId ? `AND d.dashboard_id = $3` : ''}
        ORDER BY d.created_at DESC
      `;

      const params = [];
      if (department) params.push(department);
      if (connectionStatus) params.push(connectionStatus);
      if (dashboardId) params.push(dashboardId);

      const result = await db.query(query, params);
      return res.json(result.rows || []);
    } catch (dbError) {
      // Fallback to mock data
      let devices = Array.from(mockData.devices.values());

      // Apply filters
      if (department) {
        devices = devices.filter((d: any) => d.department === department);
      }
      if (connectionStatus) {
        devices = devices.filter((d: any) => d.connectionStatus === connectionStatus);
      }
      if (dashboardId) {
        devices = devices.filter((d: any) => d.dashboardId === dashboardId);
      }

      return res.json(devices);
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get single device
router.get('/devices/:id', requireAuth, async (req: any, res: any) => {
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
      // Fallback to mock data
      const device = mockData.devices.get(id);

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      return res.json(device);
    }
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Register/update device (called by TV during activation)
router.post('/devices/register', async (req: any, res: any) => {
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
      const existingQuery = `
        SELECT * FROM nova_tv_devices WHERE device_fingerprint = $1
      `;

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
      console.warn('Database not available, using mock data:', dbError.message);

      // Fallback to mock data
      const existingDevice = Array.from(mockData.devices.values()).find(
        (d: any) => d.deviceFingerprint === deviceFingerprint,
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
        return res.status(201).json(deviceData);
      }
    }
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Update device
router.put('/devices/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Try database first
    try {
      const updateQuery = `
        UPDATE nova_tv_devices 
        SET name = COALESCE($2, name),
            location = COALESCE($3, location),
            department = COALESCE($4, department),
            dashboard_id = COALESCE($5, dashboard_id),
            settings = COALESCE($6, settings),
            metadata = COALESCE($7, metadata),
            branding_config = COALESCE($8, branding_config),
            display_config = COALESCE($9, display_config),
            logo_url = COALESCE($10, logo_url),
            bg_url = COALESCE($11, bg_url),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, [
        id,
        updates.name,
        updates.location,
        updates.department,
        updates.dashboardId,
        updates.settings ? JSON.stringify(updates.settings) : null,
        updates.metadata ? JSON.stringify(updates.metadata) : null,
        updates.brandingConfig ? JSON.stringify(updates.brandingConfig) : null,
        updates.displayConfig ? JSON.stringify(updates.displayConfig) : null,
        updates.logoUrl,
        updates.bgUrl,
      ]);

      if (!result.rows?.[0]) {
        return res.status(404).json({ error: 'Device not found' });
      }

      return res.json(result.rows[0]);
    } catch (dbError) {
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
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Assign dashboard to device (activate device)
router.post('/devices/:deviceId/assign', requireAuth, async (req: any, res: any) => {
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
      return res.json(updatedDevice);
    }
  } catch (error) {
    console.error('Error assigning dashboard:', error);
    res.status(500).json({ error: 'Failed to assign dashboard' });
  }
});

// Device heartbeat
router.post('/devices/:deviceId/heartbeat', async (req: any, res: any) => {
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
    } catch (dbError) {
      // Fallback to mock data
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
    console.error('Error updating device heartbeat:', error);
    res.status(500).json({ error: 'Failed to update device heartbeat' });
  }
});

// ====================================
// DEVICE ACTIVATION FLOW
// ====================================

// Generate activation code/QR for admin to scan
router.post('/activations/generate', requireAuth, async (req: any, res: any) => {
  try {
    const { deviceFingerprint } = req.body;

    // Generate unique codes
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const activationId = uuid();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/admin/tv-activate?device=${deviceFingerprint}&code=${activationCode}`;

    // Generate QR code
    let qrCodeDataURL = '';
    try {
      qrCodeDataURL = await QRCodeLib.toDataURL(activationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
      });
    } catch (qrError) {
      console.warn('QR code generation failed:', qrError);
      qrCodeDataURL = `data:text/plain;base64,${Buffer.from(activationUrl).toString('base64')}`;
    }

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

    res.json({
      activationId: activation.id,
      code: activationCode,
      qrCode: qrCodeDataURL,
      activationUrl,
      expiresAt: activation.expiresAt,
    });
  } catch (error) {
    console.error('Error generating activation code:', error);
    res.status(500).json({ error: 'Failed to generate activation code' });
  }
});

// Verify activation code (called by TV)
router.post('/activations/verify', async (req: any, res: any) => {
  try {
    const { code, deviceFingerprint } = req.body;

    if (!code || !deviceFingerprint) {
      return res.status(400).json({ error: 'Code and device fingerprint are required' });
    }

    // Find activation
    const activation = Array.from(mockData.activations.values()).find(
      (a: any) => a.code === code && !a.used && new Date(a.expiresAt) > new Date(),
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
      (d: any) => d.deviceFingerprint === deviceFingerprint,
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
    console.error('Error verifying activation code:', error);
    res.status(500).json({ error: 'Failed to verify activation code' });
  }
});

// ====================================
// AUTHENTICATION ROUTES
// ====================================
router.post('/auth/generate-code', async (req: any, res: any) => {
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
    console.error('Error generating auth code:', error);
    res.status(500).json({ error: 'Failed to generate auth code' });
  }
});

router.post('/auth/verify-code', async (req: any, res: any) => {
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
    const availableDashboards = Array.from(mockData.dashboards.values()).filter(
      (d: any) => d.isActive,
    );

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
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Check authentication status
router.get('/auth/status/:sessionId', async (req: any, res: any) => {
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
    console.error('Error checking auth status:', error);
    res.status(500).json({ error: 'Failed to check auth status' });
  }
});

router.post('/auth/refresh', async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;

    // Mock token refresh
    res.json({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Live data integration routes
router.get('/live-data/tickets', requireAuth, async (req: any, res: any) => {
  try {
    const { department } = req.query;

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
    console.error('Error fetching ticket metrics:', error);
    res.status(500).json({ error: 'Failed to fetch ticket metrics' });
  }
});

router.get('/live-data/assets', requireAuth, async (req: any, res: any) => {
  try {
    const { department } = req.query;

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
    console.error('Error fetching asset metrics:', error);
    res.status(500).json({ error: 'Failed to fetch asset metrics' });
  }
});

export default router;
