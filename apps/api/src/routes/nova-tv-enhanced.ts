import express from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import QRCodeLib from 'qrcode';

const router = express.Router();
const prisma = new PrismaClient();

// Auth middleware
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // For now, we'll use a simple user extraction
  // In production, this would verify JWT tokens properly
  req.user = { id: 'user-1', email: 'admin@nova.com', name: 'Nova Admin' };
  next();
};

// ================================
// DASHBOARD (CHANNELS) MANAGEMENT
// ================================

router.get('/dashboards', requireAuth, async (req: any, res: any) => {
  try {
    const { department, createdBy, isActive } = req.query;
    
    const where: any = {};
    if (department) where.department = department;
    if (createdBy) where.createdBy = createdBy;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const dashboards = await prisma.novaTVDashboard.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        template: true,
        devices: {
          select: { id: true, name: true, connectionStatus: true }
        },
        _count: {
          select: { devices: true, content: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(dashboards);
  } catch (error) {
    logger.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
});

router.get('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const dashboard = await prisma.novaTVDashboard.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        template: true,
        devices: true,
        content: {
          orderBy: { displayOrder: 'asc' }
        },
        sharedWith: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    res.json(dashboard);
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.post('/dashboards', requireAuth, async (req: any, res: any) => {
  try {
    const {
      name,
      description,
      department,
      templateId,
      configuration,
      isActive = true,
      isPublic = false
    } = req.body;
    
    const dashboard = await prisma.novaTVDashboard.create({
      data: {
        name,
        description,
        department,
        createdBy: req.user.id,
        templateId,
        configuration,
        isActive,
        isPublic
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        template: true
      }
    });
    
    logger.info('Created Nova TV dashboard:', { dashboardId: dashboard.id, name });
    res.status(201).json(dashboard);
  } catch (error) {
    logger.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

router.put('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const dashboard = await prisma.novaTVDashboard.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        template: true,
        devices: true
      }
    });
    
    logger.info('Updated Nova TV dashboard:', { dashboardId: id });
    res.json(dashboard);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    logger.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

router.delete('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    await prisma.novaTVDashboard.delete({
      where: { id }
    });
    
    logger.info('Deleted Nova TV dashboard:', { dashboardId: id });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    logger.error('Error deleting dashboard:', error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
});

router.post('/dashboards/:id/duplicate', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const originalDashboard = await prisma.novaTVDashboard.findUnique({
      where: { id },
      include: {
        content: true
      }
    });
    
    if (!originalDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    const newDashboard = await prisma.novaTVDashboard.create({
      data: {
        name,
        description: `Copy of ${originalDashboard.description || originalDashboard.name}`,
        department: originalDashboard.department,
        createdBy: req.user.id,
        templateId: originalDashboard.templateId,
        configuration: originalDashboard.configuration,
        isActive: true,
        isPublic: originalDashboard.isPublic
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        template: true
      }
    });
    
    // Duplicate content
    if (originalDashboard.content.length > 0) {
      await prisma.novaTVContent.createMany({
        data: originalDashboard.content.map(content => ({
          dashboardId: newDashboard.id,
          contentType: content.contentType,
          title: content.title,
          contentData: content.contentData,
          displayOrder: content.displayOrder,
          isActive: content.isActive,
          metadata: content.metadata
        }))
      });
    }
    
    logger.info('Duplicated Nova TV dashboard:', { originalId: id, newId: newDashboard.id });
    res.status(201).json(newDashboard);
  } catch (error) {
    logger.error('Error duplicating dashboard:', error);
    res.status(500).json({ error: 'Failed to duplicate dashboard' });
  }
});

// ================================
// DEVICE MANAGEMENT
// ================================

router.get('/devices', requireAuth, async (req: any, res: any) => {
  try {
    const { department, connectionStatus, dashboardId } = req.query;
    
    const where: any = {};
    if (department) where.department = department;
    if (connectionStatus) where.connectionStatus = connectionStatus;
    if (dashboardId) where.dashboardId = dashboardId;
    
    const devices = await prisma.novaTVDevice.findMany({
      where,
      include: {
        dashboard: {
          select: { id: true, name: true, department: true }
        },
        activatedByUser: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(devices);
  } catch (error) {
    logger.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.get('/devices/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const device = await prisma.novaTVDevice.findUnique({
      where: { id },
      include: {
        dashboard: true,
        activatedByUser: {
          select: { id: true, name: true, email: true }
        },
        analytics: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        }
      }
    });
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    logger.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

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
      metadata = {}
    } = req.body;
    
    // Check if device already exists
    const existingDevice = await prisma.novaTVDevice.findUnique({
      where: { deviceFingerprint }
    });
    
    if (existingDevice) {
      // Update existing device
      const updatedDevice = await prisma.novaTVDevice.update({
        where: { deviceFingerprint },
        data: {
          lastActiveAt: new Date(),
          connectionStatus: 'connected',
          ipAddress,
          browserInfo,
          settings,
          metadata
        }
      });
      
      return res.json(updatedDevice);
    }
    
    // Create new device
    const device = await prisma.novaTVDevice.create({
      data: {
        name: name || `TV-${deviceFingerprint.slice(-6)}`,
        location,
        department,
        deviceFingerprint,
        ipAddress,
        browserInfo,
        connectionStatus: 'connected',
        lastActiveAt: new Date(),
        settings,
        metadata
      }
    });
    
    logger.info('Registered Nova TV device:', { deviceId: device.id, fingerprint: deviceFingerprint });
    res.status(201).json(device);
  } catch (error) {
    logger.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

router.put('/devices/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const device = await prisma.novaTVDevice.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      },
      include: {
        dashboard: true,
        activatedByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    logger.info('Updated Nova TV device:', { deviceId: id });
    res.json(device);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Device not found' });
    }
    logger.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/devices/:id/revoke', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    await prisma.novaTVDevice.delete({
      where: { id }
    });
    
    logger.info('Revoked Nova TV device:', { deviceId: id });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Device not found' });
    }
    logger.error('Error revoking device:', error);
    res.status(500).json({ error: 'Failed to revoke device' });
  }
});

// ================================
// DEVICE ACTIVATION & ASSIGNMENT
// ================================

router.post('/devices/:deviceId/assign', requireAuth, async (req: any, res: any) => {
  try {
    const { deviceId } = req.params;
    const { dashboardId } = req.body;
    
    // Verify dashboard exists
    const dashboard = await prisma.novaTVDashboard.findUnique({
      where: { id: dashboardId }
    });
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    const device = await prisma.novaTVDevice.update({
      where: { id: deviceId },
      data: {
        dashboardId,
        isActivated: true,
        activatedBy: req.user.id,
        activatedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        dashboard: true,
        activatedByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    logger.info('Assigned dashboard to Nova TV device:', { deviceId, dashboardId });
    res.json(device);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Device not found' });
    }
    logger.error('Error assigning dashboard:', error);
    res.status(500).json({ error: 'Failed to assign dashboard' });
  }
});

router.post('/devices/:deviceId/activate', requireAuth, async (req: any, res: any) => {
  try {
    const { deviceId } = req.params;
    const { 
      dashboardId, 
      name, 
      location, 
      department,
      brandingConfig = {},
      displayConfig = {}
    } = req.body;
    
    const device = await prisma.novaTVDevice.update({
      where: { id: deviceId },
      data: {
        name: name || `TV-${deviceId.slice(-6)}`,
        location,
        department,
        dashboardId,
        brandingConfig,
        displayConfig,
        isActivated: true,
        activatedBy: req.user.id,
        activatedAt: new Date(),
        connectionStatus: 'connected',
        updatedAt: new Date()
      },
      include: {
        dashboard: true,
        activatedByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    logger.info('Activated Nova TV device:', { deviceId, dashboardId });
    res.json(device);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Device not found' });
    }
    logger.error('Error activating device:', error);
    res.status(500).json({ error: 'Failed to activate device' });
  }
});

router.post('/devices/:deviceId/update-branding', requireAuth, async (req: any, res: any) => {
  try {
    const { deviceId } = req.params;
    const { logoUrl, bgUrl, brandingConfig = {} } = req.body;
    
    const device = await prisma.novaTVDevice.update({
      where: { id: deviceId },
      data: {
        logoUrl,
        bgUrl,
        brandingConfig,
        updatedAt: new Date()
      },
      include: {
        dashboard: true
      }
    });
    
    logger.info('Updated Nova TV device branding:', { deviceId });
    res.json(device);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Device not found' });
    }
    logger.error('Error updating device branding:', error);
    res.status(500).json({ error: 'Failed to update device branding' });
  }
});

// ================================
// DEVICE ACTIVATION FLOW
// ================================

router.post('/activations/generate', requireAuth, async (req: any, res: any) => {
  try {
    const { deviceFingerprint } = req.body;
    
    // Generate unique codes
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const activationId = uuid();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/admin/tv-activate?device=${deviceFingerprint}&code=${activationCode}`;
    
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(activationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    });
    
    // Store activation in database
    const activation = await prisma.novaTVActivation.create({
      data: {
        id: activationId,
        code: activationCode,
        qrCode: qrCodeDataURL,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }
    });
    
    res.json({
      activationId: activation.id,
      code: activationCode,
      qrCode: qrCodeDataURL,
      activationUrl,
      expiresAt: activation.expiresAt
    });
  } catch (error) {
    logger.error('Error generating activation code:', error);
    res.status(500).json({ error: 'Failed to generate activation code' });
  }
});

router.post('/activations/verify', async (req: any, res: any) => {
  try {
    const { code, deviceFingerprint } = req.body;
    
    const activation = await prisma.novaTVActivation.findFirst({
      where: {
        code,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!activation) {
      return res.status(400).json({ error: 'Invalid or expired activation code' });
    }
    
    // Find or create device
    let device = await prisma.novaTVDevice.findUnique({
      where: { deviceFingerprint }
    });
    
    if (!device) {
      device = await prisma.novaTVDevice.create({
        data: {
          name: `TV-${deviceFingerprint.slice(-6)}`,
          deviceFingerprint,
          connectionStatus: 'connected',
          lastActiveAt: new Date()
        }
      });
    }
    
    // Mark activation as used and link to device
    await prisma.novaTVActivation.update({
      where: { id: activation.id },
      data: {
        used: true,
        usedAt: new Date(),
        deviceId: device.id
      }
    });
    
    logger.info('Verified activation code:', { code, deviceId: device.id });
    res.json({
      success: true,
      device,
      message: 'Device activation verified. Admin can now assign a channel.'
    });
  } catch (error) {
    logger.error('Error verifying activation code:', error);
    res.status(500).json({ error: 'Failed to verify activation code' });
  }
});

// ================================
// DEVICE HEARTBEAT & STATUS
// ================================

router.post('/devices/:deviceId/heartbeat', async (req: any, res: any) => {
  try {
    const { deviceId } = req.params;
    const { status = 'connected', metadata = {} } = req.body;
    
    const device = await prisma.novaTVDevice.update({
      where: { id: deviceId },
      data: {
        connectionStatus: status,
        lastActiveAt: new Date(),
        lastPingAt: new Date(),
        metadata: {
          ...metadata,
          lastHeartbeat: new Date().toISOString()
        }
      }
    });
    
    res.json({ success: true, device });
  } catch (error) {
    logger.error('Error updating device heartbeat:', error);
    res.status(500).json({ error: 'Failed to update device heartbeat' });
  }
});

export default router;
