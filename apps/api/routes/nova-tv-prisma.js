import express from 'express';
// Use the Nova TV-specific Prisma client output
import { PrismaClient } from '../../../prisma/generated/nova-tv/index.js';
import { v4 as uuid } from 'uuid';
import { logger } from '../logger.js';

const prisma = new PrismaClient();
const router = express.Router();

// Simple auth middleware passthrough; index.js already applies ensureAuth in some cases
const requireAuth = (req, res, next) => next();

// ================================
// DASHBOARDS (Channels)
// ================================

router.get('/dashboards', requireAuth, async (req, res) => {
  try {
    const { department, createdBy, isActive } = req.query;
    const where = {};
    if (department) where.department = department;
    if (createdBy) where.createdBy = createdBy;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const dashboards = await prisma.novaTVDashboard.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        template: true,
        devices: { select: { id: true, name: true, connectionStatus: true } },
        _count: { select: { devices: true, content: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(dashboards);
  } catch (error) {
    logger.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
});

router.get('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const dashboard = await prisma.novaTVDashboard.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        template: true,
        devices: true,
        content: { orderBy: { displayOrder: 'asc' } },
      },
    });
    if (!dashboard) return res.status(404).json({ error: 'Dashboard not found' });
    res.json(dashboard);
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.post('/dashboards', requireAuth, async (req, res) => {
  try {
    const { name, description, department, templateId, configuration, isActive = true, isPublic = false } = req.body;
    const dashboard = await prisma.novaTVDashboard.create({
      data: {
        name,
        description,
        department,
        createdBy: req.user?.id || 'system',
        templateId,
        configuration,
        isActive,
        isPublic,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        template: true,
      },
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
    const updates = req.body;
    const dashboard = await prisma.novaTVDashboard.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        template: true,
        devices: true,
      },
    });
    res.json(dashboard);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Dashboard not found' });
    logger.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

router.delete('/dashboards/:id', requireAuth, async (req, res) => {
  try {
    await prisma.novaTVDashboard.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Dashboard not found' });
    logger.error('Error deleting dashboard:', error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
});

router.post('/dashboards/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const original = await prisma.novaTVDashboard.findUnique({ where: { id }, include: { content: true } });
    if (!original) return res.status(404).json({ error: 'Dashboard not found' });

    const duplicate = await prisma.novaTVDashboard.create({
      data: {
        name,
        description: `Copy of ${original.description || original.name}`,
        department: original.department,
        createdBy: req.user?.id || 'system',
        templateId: original.templateId,
        configuration: original.configuration,
        isActive: true,
        isPublic: original.isPublic,
      },
    });

    if (original.content?.length) {
      await prisma.novaTVContent.createMany({
        data: original.content.map((c) => ({
          dashboardId: duplicate.id,
          contentType: c.contentType,
          title: c.title,
          contentData: c.contentData,
          displayOrder: c.displayOrder,
          isActive: c.isActive,
          metadata: c.metadata,
        })),
      });
    }

    res.status(201).json(duplicate);
  } catch (error) {
    logger.error('Error duplicating dashboard:', error);
    res.status(500).json({ error: 'Failed to duplicate dashboard' });
  }
});

// ================================
// DEVICES
// ================================

router.get('/devices', requireAuth, async (req, res) => {
  try {
    const { department, connectionStatus, dashboardId } = req.query;
    const where = {};
    if (department) where.department = department;
    if (connectionStatus) where.connectionStatus = connectionStatus;
    if (dashboardId) where.dashboardId = dashboardId;

    const devices = await prisma.novaTVDevice.findMany({
      where,
      include: {
        dashboard: { select: { id: true, name: true, department: true } },
        activatedByUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(devices);
  } catch (error) {
    logger.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.get('/devices/:id', requireAuth, async (req, res) => {
  try {
    const device = await prisma.novaTVDevice.findUnique({
      where: { id: req.params.id },
      include: {
        dashboard: true,
        activatedByUser: { select: { id: true, name: true, email: true } },
        analytics: { take: 10, orderBy: { timestamp: 'desc' } },
      },
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (error) {
    logger.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

router.post('/devices/register', async (req, res) => {
  try {
    const { name, location, department, deviceFingerprint, ipAddress, browserInfo, settings = {}, metadata = {} } = req.body;
    if (!deviceFingerprint) return res.status(400).json({ error: 'Device fingerprint is required' });

    const existing = await prisma.novaTVDevice.findUnique({ where: { deviceFingerprint } });
    if (existing) {
      const updated = await prisma.novaTVDevice.update({
        where: { deviceFingerprint },
        data: { lastActiveAt: new Date(), connectionStatus: 'connected', ipAddress, browserInfo, settings, metadata },
      });
      return res.json(updated);
    }

    const device = await prisma.novaTVDevice.create({
      data: {
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
        lastActiveAt: new Date(),
      },
    });
    res.status(201).json(device);
  } catch (error) {
    logger.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

router.put('/devices/:id', requireAuth, async (req, res) => {
  try {
    const device = await prisma.novaTVDevice.update({
      where: { id: req.params.id },
      data: { ...req.body, updatedAt: new Date() },
    });
    res.json(device);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Device not found' });
    logger.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.post('/devices/:deviceId/assign', requireAuth, async (req, res) => {
  try {
    const { dashboardId, name, location, department, brandingConfig = {}, displayConfig = {} } = req.body;
    const { deviceId } = req.params;

    const dashboard = await prisma.novaTVDashboard.findUnique({ where: { id: dashboardId } });
    if (!dashboard) return res.status(404).json({ error: 'Dashboard not found' });

    const updated = await prisma.novaTVDevice.update({
      where: { id: deviceId },
      data: {
        dashboardId,
        name,
        location,
        department,
        brandingConfig,
        displayConfig,
        isActivated: true,
        activatedBy: req.user?.id || 'system',
        activatedAt: new Date(),
        connectionStatus: 'connected',
        updatedAt: new Date(),
      },
      include: { dashboard: true },
    });
    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Device not found' });
    logger.error('Error assigning dashboard:', error);
    res.status(500).json({ error: 'Failed to assign dashboard' });
  }
});

router.post('/devices/:deviceId/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status = 'connected', metadata = {} } = req.body;
    const updated = await prisma.novaTVDevice.update({
      where: { id: deviceId },
      data: {
        connectionStatus: status,
        lastActiveAt: new Date(),
        lastPingAt: new Date(),
        metadata: { ...(metadata || {}), lastHeartbeat: new Date().toISOString() },
        updatedAt: new Date(),
      },
    });
    res.json({ success: true, device: updated });
  } catch (error) {
    logger.error('Error updating device heartbeat:', error);
    res.status(500).json({ error: 'Failed to update device heartbeat' });
  }
});

export default router;

// ================================
// ACTIVATION + AUTH (Prisma-backed)
// ================================

router.post('/activations/generate', requireAuth, async (req, res) => {
  try {
    const { deviceFingerprint } = req.body || {};
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const activationId = uuid();
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host').replace(/\/api$/, '')}` || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/admin/tv-activate?device=${encodeURIComponent(deviceFingerprint || '')}&code=${activationCode}`;
    const qrCodeDataURL = `data:text/plain;base64,${Buffer.from(activationUrl).toString('base64')}`;

    const activation = await prisma.novaTVActivation.create({
      data: {
        id: activationId,
        code: activationCode,
        qrCode: qrCodeDataURL,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
      },
    });

    return res.json({ activationId: activation.id, code: activationCode, qrCode: qrCodeDataURL, activationUrl, expiresAt: activation.expiresAt });
  } catch (error) {
    logger.error('Error generating activation code (prisma):', error);
    return res.status(500).json({ error: 'Failed to generate activation code' });
  }
});

router.post('/activations/verify', async (req, res) => {
  try {
    const { code, deviceFingerprint } = req.body || {};
    if (!code || !deviceFingerprint) return res.status(400).json({ error: 'Code and device fingerprint are required' });

    const activation = await prisma.novaTVActivation.findFirst({ where: { code, used: false, expiresAt: { gt: new Date() } } });
    if (!activation) return res.status(400).json({ error: 'Invalid or expired activation code' });

    let device = await prisma.novaTVDevice.findUnique({ where: { deviceFingerprint } });
    if (!device) {
      device = await prisma.novaTVDevice.create({ data: { id: uuid(), name: `TV-${deviceFingerprint.slice(-6)}`, deviceFingerprint, connectionStatus: 'connected', lastActiveAt: new Date() } });
    }

    await prisma.novaTVActivation.update({ where: { id: activation.id }, data: { used: true, usedAt: new Date(), deviceId: device.id } });
    return res.json({ success: true, device, message: 'Device activation verified.' });
  } catch (error) {
    logger.error('Error verifying activation code (prisma):', error);
    return res.status(500).json({ error: 'Failed to verify activation code' });
  }
});

router.post('/auth/generate-code', async (req, res) => {
  try {
    const { deviceFingerprint } = req.body || {};
    const sessionId = uuid();
    const sixDigitCode = Math.floor(100000 + Math.random() * 900000).toString();
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host').replace(/\/api$/, '')}` || 'http://localhost:3000';
    const qrCode = `${baseUrl}/admin/tv-activate?session=${encodeURIComponent(sessionId)}&code=${encodeURIComponent(sixDigitCode)}${deviceFingerprint ? `&device=${encodeURIComponent(deviceFingerprint)}` : ''}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.novaTVAuthSession.create({ data: { sessionId, qrCode, sixDigitCode, expiresAt, isUsed: false } });
    return res.json({ sessionId, qrCode, sixDigitCode, expiresAt });
  } catch (error) {
    logger.error('Error generating auth code (prisma):', error);
    return res.status(500).json({ error: 'Failed to generate auth code' });
  }
});

router.post('/auth/verify-code', async (req, res) => {
  try {
    const { sessionId, code } = req.body || {};
    if (!sessionId || !code) return res.status(400).json({ error: 'Invalid request' });

    const session = await prisma.novaTVAuthSession.findUnique({ where: { sessionId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.isUsed) return res.status(400).json({ error: 'Code already used' });
    if (new Date(session.expiresAt) < new Date()) return res.status(400).json({ error: 'Code expired' });
    if (session.sixDigitCode !== code) return res.status(401).json({ error: 'Invalid code' });

    await prisma.novaTVAuthSession.update({ where: { sessionId }, data: { isUsed: true, usedAt: new Date() } });
    const dashboards = await prisma.novaTVDashboard.findMany({ where: { isActive: true }, select: { id: true, name: true, department: true }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, availableDashboards: dashboards, sessionToken: uuid() });
  } catch (error) {
    logger.error('Error verifying auth code (prisma):', error);
    return res.status(500).json({ error: 'Failed to verify code' });
  }
});

router.get('/auth/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.novaTVAuthSession.findUnique({ where: { sessionId } });
    if (!session) return res.json({ isVerified: false, isExpired: true });
    const expired = new Date(session.expiresAt) < new Date();
    return res.json({ isVerified: !!session.isUsed, isExpired: expired });
  } catch (error) {
    logger.error('Auth status error (prisma):', error);
    return res.status(500).json({ error: 'Failed to check auth status' });
  }
});
