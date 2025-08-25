import express from 'express';
import { v4 as uuid } from 'uuid';

const router = express.Router();

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

    const filters: any = {};
    if (department) filters.department = department;
    if (createdBy) filters.createdBy = createdBy;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const dashboards = await prisma.novaTVDashboard.findMany({
      where: filters,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        template: true,
        devices: true,
        content: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
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
          select: { id: true, name: true, email: true },
        },
        template: true,
        devices: true,
        content: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

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
      createdBy: req.user.id,
      id: nanoid(),
    };

    const dashboard = await prisma.novaTVDashboard.create({
      data: dashboardData,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        template: true,
      },
    });

    res.status(201).json(dashboard);
  } catch (error) {
    console.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
});

router.put('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dashboard = await prisma.novaTVDashboard.update({
      where: { id },
      data: updates,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        template: true,
        devices: true,
        content: true,
      },
    });

    res.json(dashboard);
  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

router.delete('/dashboards/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.novaTVDashboard.delete({
      where: { id },
    });

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

    const originalDashboard = await prisma.novaTVDashboard.findUnique({
      where: { id },
      include: { content: true },
    });

    if (!originalDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const newDashboard = await prisma.novaTVDashboard.create({
      data: {
        ...originalDashboard,
        id: nanoid(),
        name,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        template: true,
      },
    });

    // Duplicate content
    if (originalDashboard.content.length > 0) {
      await prisma.novaTVContent.createMany({
        data: originalDashboard.content.map((content) => ({
          ...content,
          id: nanoid(),
          dashboardId: newDashboard.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      });
    }

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

    const filters: any = {};
    if (department) filters.department = department;
    if (connectionStatus) filters.connectionStatus = connectionStatus;
    if (dashboardId) filters.dashboardId = dashboardId;

    const devices = await prisma.novaTVDevice.findMany({
      where: filters,
      include: {
        dashboard: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
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
      },
    });

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
      id: nanoid(),
      connectionStatus: 'connected',
      lastActiveAt: new Date(),
    };

    const device = await prisma.novaTVDevice.create({
      data: deviceData,
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

router.put('/devices/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const device = await prisma.novaTVDevice.update({
      where: { id },
      data: updates,
      include: {
        dashboard: true,
      },
    });

    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/devices/:id/revoke', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.novaTVDevice.delete({
      where: { id },
    });

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

    const device = await prisma.novaTVDevice.update({
      where: { id: deviceId },
      data: { dashboardId },
      include: {
        dashboard: true,
      },
    });

    res.json(device);
  } catch (error) {
    console.error('Error assigning dashboard:', error);
    res.status(500).json({ error: 'Failed to assign dashboard' });
  }
});

// Authentication routes
router.post('/auth/generate-code', async (req: any, res: any) => {
  try {
    const sessionId = nanoid();
    const sixDigitCode = Math.floor(100000 + Math.random() * 900000).toString();
    const qrCode = `nova-tv://auth?session=${sessionId}&code=${sixDigitCode}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.novaTVAuthSession.create({
      data: {
        sessionId,
        qrCode,
        sixDigitCode,
        expiresAt,
      },
    });

    res.json({
      sessionId,
      qrCode,
      sixDigitCode,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating auth code:', error);
    res.status(500).json({ error: 'Failed to generate auth code' });
  }
});

router.post('/auth/verify-code', async (req: any, res: any) => {
  try {
    const { sessionId, code } = req.body;

    const session = await prisma.novaTVAuthSession.findUnique({
      where: { sessionId },
    });

    if (!session || session.expiresAt < new Date() || session.sixDigitCode !== code) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    // Mock user and dashboards for now
    const user = { id: 'user-1', email: 'admin@nova.com', name: 'Nova Admin' };
    const availableDashboards = await prisma.novaTVDashboard.findMany({
      where: { isActive: true },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Clean up the session
    await prisma.novaTVAuthSession.delete({
      where: { sessionId },
    });

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

// Template routes
router.get('/templates', requireAuth, async (req: any, res: any) => {
  try {
    const { category, departmentType, isSystemTemplate } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (departmentType) filters.departmentType = departmentType;
    if (isSystemTemplate !== undefined) filters.isSystemTemplate = isSystemTemplate === 'true';

    const templates = await prisma.novaTVTemplate.findMany({
      where: { ...filters, isActive: true },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.get('/templates/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const template = await prisma.novaTVTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

router.post('/templates', requireAuth, async (req: any, res: any) => {
  try {
    const templateData = {
      ...req.body,
      id: nanoid(),
      createdBy: req.user.id,
    };

    const template = await prisma.novaTVTemplate.create({
      data: templateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.put('/templates/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await prisma.novaTVTemplate.update({
      where: { id },
      data: updates,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.delete('/templates/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.novaTVTemplate.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

router.get('/templates/:id/preview', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data = req.query;

    const template = await prisma.novaTVTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Mock preview data
    res.json({
      template,
      previewData: data,
      renderedPreview: 'Mock rendered template preview',
    });
  } catch (error) {
    console.error('Error previewing template:', error);
    res.status(500).json({ error: 'Failed to preview template' });
  }
});

// Content routes
router.get('/dashboards/:dashboardId/content', requireAuth, async (req: any, res: any) => {
  try {
    const { dashboardId } = req.params;

    const content = await prisma.novaTVContent.findMany({
      where: { dashboardId },
      orderBy: { displayOrder: 'asc' },
    });

    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

router.post('/content', requireAuth, async (req: any, res: any) => {
  try {
    const contentData = {
      ...req.body,
      id: nanoid(),
    };

    const content = await prisma.novaTVContent.create({
      data: contentData,
    });

    res.status(201).json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

router.put('/content/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const content = await prisma.novaTVContent.update({
      where: { id },
      data: updates,
    });

    res.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

router.delete('/content/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.novaTVContent.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

router.post('/dashboards/:dashboardId/content/reorder', requireAuth, async (req: any, res: any) => {
  try {
    const { dashboardId } = req.params;
    const { contentIds } = req.body;

    // Update display order for each content item
    const updatePromises = contentIds.map((contentId: string, index: number) =>
      prisma.novaTVContent.update({
        where: { id: contentId },
        data: { displayOrder: index },
      }),
    );

    await Promise.all(updatePromises);

    const reorderedContent = await prisma.novaTVContent.findMany({
      where: { dashboardId },
      orderBy: { displayOrder: 'asc' },
    });

    res.json(reorderedContent);
  } catch (error) {
    console.error('Error reordering content:', error);
    res.status(500).json({ error: 'Failed to reorder content' });
  }
});

// Analytics routes
router.get('/analytics/dashboard/:dashboardId', requireAuth, async (req: any, res: any) => {
  try {
    const { dashboardId } = req.params;
    const { timeRange, department } = req.query;

    // Mock analytics data for now
    const analytics = {
      viewership: {
        uniqueViews: 245,
        averageViewDuration: 180,
        peakViewingHours: [
          { start: '09:00', end: '11:00' },
          { start: '14:00', end: '16:00' },
        ],
        departmentBreakdown: {
          IT: 45,
          HR: 32,
          Finance: 28,
          Operations: 41,
        },
      },
      contentEffectiveness: {
        mostEngagingContent: [],
        leastEngagingContent: [],
        optimalRefreshIntervals: [30, 60, 120],
        contentTypePerformance: {
          announcements: { engagement: 0.85, retention: 0.72 },
          metrics: { engagement: 0.68, retention: 0.81 },
          news: { engagement: 0.74, retention: 0.65 },
        },
      },
      technicalMetrics: {
        loadTimes: [1.2, 0.8, 1.5, 0.9, 1.1],
        errorRates: 0.02,
        devicePerformance: {},
        bandwidthUsage: {
          average: 2.5,
          peak: 4.8,
          unit: 'MB/hour',
        },
      },
      aiRecommendations: {
        contentOptimization: [
          'Consider adding more visual elements to announcements',
          'Metrics dashboards perform best with 60-second refresh intervals',
        ],
        layoutSuggestions: [],
        timingRecommendations: [],
      },
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.post('/analytics/events', async (req: any, res: any) => {
  try {
    const eventData = {
      ...req.body,
      id: nanoid(),
      timestamp: new Date(),
    };

    await prisma.novaTVAnalytics.create({
      data: eventData,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

router.get('/analytics/device/:deviceId', requireAuth, async (req: any, res: any) => {
  try {
    const { deviceId } = req.params;
    const { timeRange } = req.query;

    // Mock device analytics
    const analytics = {
      performance: {
        uptime: 0.985,
        averageLoadTime: 1.2,
        errorCount: 3,
        lastError: null,
      },
      usage: {
        totalSessions: 157,
        averageSessionDuration: 240,
        mostActiveHours: ['09:00-10:00', '14:00-15:00'],
      },
      health: {
        cpuUsage: 0.35,
        memoryUsage: 0.62,
        diskSpace: 0.78,
        networkLatency: 45,
      },
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching device analytics:', error);
    res.status(500).json({ error: 'Failed to fetch device analytics' });
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

router.get('/live-data/hr', requireAuth, async (req: any, res: any) => {
  try {
    // Mock HR metrics
    const metrics = {
      employeeCount: 245,
      todayBirthdays: [
        { name: 'Sarah Johnson', department: 'HR' },
        { name: 'Mike Chen', department: 'IT' },
      ],
      newEmployees: [
        { name: 'Alex Rodriguez', department: 'Finance', startDate: new Date().toISOString() },
      ],
      upcomingEvents: [
        {
          title: 'Team Building Workshop',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          department: 'All',
        },
      ],
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching HR metrics:', error);
    res.status(500).json({ error: 'Failed to fetch HR metrics' });
  }
});

router.get('/live-data/system-health', requireAuth, async (req: any, res: any) => {
  try {
    // Mock system health metrics
    const metrics = {
      overallStatus: 'healthy',
      services: [
        { name: 'API Server', status: 'healthy', uptime: 0.999 },
        { name: 'Database', status: 'healthy', uptime: 0.995 },
        { name: 'File Storage', status: 'warning', uptime: 0.987 },
        { name: 'Email Service', status: 'healthy', uptime: 0.998 },
      ],
      performance: {
        cpu: 0.45,
        memory: 0.68,
        disk: 0.72,
        network: 0.23,
      },
      alerts: [
        {
          message: 'High disk usage on storage server',
          severity: 'warning',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

router.get('/live-data/announcements', requireAuth, async (req: any, res: any) => {
  try {
    const { department } = req.query;

    // Mock announcements
    const announcements = [
      {
        id: 'ANN-001',
        title: 'System Maintenance Scheduled',
        content: 'Planned maintenance window: Saturday 2-4 AM',
        priority: 'high',
        department: 'All',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ANN-002',
        title: 'New Coffee Machine in Break Room',
        content: 'Enjoy fresh coffee on the 3rd floor!',
        priority: 'low',
        department: 'All',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    // Filter by department if specified
    const filteredAnnouncements =
      department && department !== 'All'
        ? announcements.filter((ann) => ann.department === department || ann.department === 'All')
        : announcements;

    res.json(filteredAnnouncements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

export default router;
