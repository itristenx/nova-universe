import express from 'express';
import { v4 as uuid } from 'uuid';

const router = express.Router();

// Mock data store (in production, this would be replaced with proper database)
const mockData = {
  dashboards: new Map(),
  devices: new Map(),
  templates: new Map(),
  content: new Map(),
  analytics: new Map(),
  authSessions: new Map()
};

// Auth middleware (basic implementation)
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
      creator: req.user
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
      updatedAt: new Date().toISOString()
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
      creator: req.user
    };
    
    mockData.dashboards.set(newDashboard.id, newDashboard);
    
    res.status(201).json(newDashboard);
  } catch (error) {
    console.error('Error duplicating dashboard:', error);
    res.status(500).json({ error: 'Failed to duplicate dashboard' });
  }
});

// Device routes
router.get('/devices', requireAuth, async (req: any, res: any) => {
  try {
    const { department, connectionStatus, dashboardId } = req.query;
    
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
    
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.get('/devices/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const device = mockData.devices.get(id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

router.post('/devices/register', async (req: any, res: any) => {
  try {
    const deviceData = {
      ...req.body,
      id: uuid(),
      connectionStatus: 'connected',
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.devices.set(deviceData.id, deviceData);
    
    res.status(201).json(deviceData);
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

router.put('/devices/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existingDevice = mockData.devices.get(id);
    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const updatedDevice = {
      ...existingDevice,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    mockData.devices.set(id, updatedDevice);
    
    res.json(updatedDevice);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/devices/:id/revoke', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    if (!mockData.devices.has(id)) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    mockData.devices.delete(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error revoking device:', error);
    res.status(500).json({ error: 'Failed to revoke device' });
  }
});

router.post('/devices/:deviceId/assign', requireAuth, async (req: any, res: any) => {
  try {
    const { deviceId } = req.params;
    const { dashboardId } = req.body;
    
    const device = mockData.devices.get(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const updatedDevice = {
      ...device,
      dashboardId,
      updatedAt: new Date().toISOString()
    };
    
    mockData.devices.set(deviceId, updatedDevice);
    
    res.json(updatedDevice);
  } catch (error) {
    console.error('Error assigning dashboard:', error);
    res.status(500).json({ error: 'Failed to assign dashboard' });
  }
});

// Authentication routes
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
      isVerified: false
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
    const availableDashboards = Array.from(mockData.dashboards.values()).filter((d: any) => d.isActive);
    
    // Clean up the session after short delay to allow status check
    setTimeout(() => {
      mockData.authSessions.delete(sessionId);
    }, 3000);
    
    res.json({
      success: true,
      user,
      availableDashboards,
      sessionToken: 'mock-session-token'
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
      isExpired: false 
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
      refreshToken: 'new-refresh-token'
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
        Operations: 2
      },
      recentTickets: [
        {
          id: 'TK-001',
          title: 'Email server issues',
          priority: 'high',
          department: 'IT',
          createdAt: new Date().toISOString()
        }
      ]
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
        Operations: 54
      },
      recentCheckouts: [
        {
          id: 'AS-001',
          name: 'Laptop Dell XPS',
          checkedOutBy: 'John Doe',
          checkedOutAt: new Date().toISOString()
        }
      ]
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching asset metrics:', error);
    res.status(500).json({ error: 'Failed to fetch asset metrics' });
  }
});

export default router;
