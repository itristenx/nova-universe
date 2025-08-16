import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { 
  createMonitor, 
  updateMonitor, 
  deleteMonitor, 
  getMonitors,
  getMonitorById,
  updateMonitorStatus
} from '../controllers/monitoring/monitors';
import {
  createIncident,
  updateIncident,
  getIncidents,
  getIncidentById,
  resolveIncident
} from '../controllers/monitoring/incidents';
import {
  createNotificationProvider,
  updateNotificationProvider,
  getNotificationProviders,
  testNotificationProvider
} from '../controllers/monitoring/notifications';
import {
  createStatusPage,
  updateStatusPage,
  getStatusPages,
  getStatusPageBySlug,
  getPublicStatusPage
} from '../controllers/monitoring/status-pages';
import {
  createMaintenanceWindow,
  updateMaintenanceWindow,
  getMaintenanceWindows,
  deleteMaintenanceWindow
} from '../controllers/monitoring/maintenance';
import {
  createTag,
  updateTag,
  getTags,
  deleteTag
} from '../controllers/monitoring/tags';

const router = Router();

// Enhanced Monitor Type definitions (matching frontend)
const MonitorTypes = [
  'http', 'https', 'tcp', 'ping', 'dns', 'docker', 'websocket',
  'keyword', 'port', 'grpc', 'mqtt', 'rabbitmq', 'redis',
  'mysql', 'postgres', 'mongodb', 'steam', 'gamedig'
] as const;

const NotificationProviders = [
  'email', 'discord', 'slack', 'teams', 'telegram', 'webhook',
  'pushover', 'gotify', 'apprise', 'matrix', 'rocket.chat',
  'mattermost', 'pushbullet', 'line', 'lunasea', 'feishu',
  'alerta', 'smseagle', 'clicksendsms', 'google-chat',
  'pagerduty', 'pagertree', 'twilio', 'octopush', 'promosms',
  'smsmanager', 'squadcast', 'signal', 'serwerysms',
  'stackfield', 'ntfy', 'opsgenie', 'wecom', 'goalert',
  'smsc', 'cellsynt', 'whapi', 'homeassistant', 'onebot',
  'notion', 'zoho-cliq', 'splunk', 'bark', 'smspartner',
  'gigachat', 'clickup', 'kook', 'high-mobil', 'dingding',
  'techulus-push', 'ntfy-sh', 'callmebot', 'pushdeer',
  'send-grid', 'nodemailer'
] as const;

// Validation schemas
const createMonitorSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(MonitorTypes),
  url: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']).default('GET'),
  interval: z.number().min(20).max(86400).default(60),
  timeout: z.number().min(1).max(3600).default(30),
  max_redirects: z.number().min(0).max(10).default(10),
  accepted_status_codes: z.array(z.number()).default([200]),
  headers: z.record(z.string()).default({}),
  body: z.string().optional(),
  keyword: z.string().optional(),
  invert_keyword: z.boolean().default(false),
  ignore_tls: z.boolean().default(false),
  auth_method: z.enum(['none', 'basic', 'ntlm', 'digest']).default('none'),
  auth_username: z.string().optional(),
  auth_password: z.string().optional(),
  tag_names: z.array(z.string()).default([]),
  notification_providers: z.array(z.string()).default([]),
  resend_interval: z.number().min(0).default(0),
  max_retries: z.number().min(0).max(10).default(3),
  retry_interval: z.number().min(20).default(60),
  upside_down: z.boolean().default(false),
  push_token: z.string().optional(),
  expiry_notification: z.boolean().default(false),
  port: z.number().min(1).max(65535).optional(),
  hostname: z.string().optional(),
  record_type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT']).optional(),
  expected_value: z.string().optional(),
  docker_container: z.string().optional(),
  docker_host: z.string().optional(),
  mqtt_topic: z.string().optional(),
  mqtt_username: z.string().optional(),
  mqtt_password: z.string().optional(),
  database_connection_string: z.string().optional(),
  sql_query: z.string().optional(),
  radius_username: z.string().optional(),
  radius_password: z.string().optional(),
  radius_calling_station_id: z.string().optional(),
  game_server_id: z.string().optional()
});

const updateMonitorSchema = createMonitorSchema.partial();

const createIncidentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).default('investigating'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  affected_monitors: z.array(z.string()).default([]),
  notify_subscribers: z.boolean().default(true)
});

const updateIncidentSchema = createIncidentSchema.partial();

const createNotificationProviderSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(NotificationProviders),
  is_default: z.boolean().default(false),
  apply_existing: z.boolean().default(false),
  config: z.record(z.any())
});

const createStatusPageSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  incident_history_days: z.number().min(1).max(365).default(90),
  custom_domain: z.string().optional(),
  monitors: z.array(z.string()).default([]),
  groups: z.array(z.object({
    name: z.string(),
    monitors: z.array(z.string())
  })).default([])
});

const createMaintenanceWindowSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  affected_monitors: z.array(z.string()).default([]),
  notify_affected_monitors: z.boolean().default(true),
  recurring: z.boolean().default(false),
  recurring_interval: z.enum(['daily', 'weekly', 'monthly']).optional()
});

const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#007bff')
});

// ===== MONITORS =====

// GET /api/enhanced-monitoring/monitors
router.get('/monitors', authenticateToken, async (req, res) => {
  try {
    const monitors = await getMonitors(req.user.id); // TODO-LINT: move to async function
    res.json({ monitors });
  } catch (error) {
    console.error('Failed to fetch monitors:', error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// GET /api/enhanced-monitoring/monitors/:id
router.get('/monitors/:id', authenticateToken, async (req, res) => {
  try {
    const monitor = await getMonitorById(req.params.id, req.user.id); // TODO-LINT: move to async function
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    res.json({ monitor });
  } catch (error) {
    console.error('Failed to fetch monitor:', error);
    res.status(500).json({ error: 'Failed to fetch monitor' });
  }
});

// POST /api/enhanced-monitoring/monitors
router.post('/monitors', 
  authenticateToken, 
  validateRequest(createMonitorSchema),
  async (req, res) => {
    try {
      const monitor = await createMonitor({
        ...req.body,
        user_id: req.user.id
      }); // TODO-LINT: move to async function
      res.status(201).json({ monitor });
    } catch (error) {
      console.error('Failed to create monitor:', error);
      res.status(500).json({ error: 'Failed to create monitor' });
    }
  }
);

// PUT /api/enhanced-monitoring/monitors/:id
router.put('/monitors/:id', 
  authenticateToken, 
  validateRequest(updateMonitorSchema),
  async (req, res) => {
    try {
      const monitor = await updateMonitor(req.params.id, req.body, req.user.id); // TODO-LINT: move to async function
      if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
      }
      res.json({ monitor });
    } catch (error) {
      console.error('Failed to update monitor:', error);
      res.status(500).json({ error: 'Failed to update monitor' });
    }
  }
);

// DELETE /api/enhanced-monitoring/monitors/:id
router.delete('/monitors/:id', authenticateToken, async (req, res) => {
  try {
    await deleteMonitor(req.params.id, req.user.id); // TODO-LINT: move to async function
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete monitor:', error);
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

// PATCH /api/enhanced-monitoring/monitors/:id/status
router.patch('/monitors/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const monitor = await updateMonitorStatus(req.params.id, status, req.user.id); // TODO-LINT: move to async function
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }
    res.json({ monitor });
  } catch (error) {
    console.error('Failed to update monitor status:', error);
    res.status(500).json({ error: 'Failed to update monitor status' });
  }
});

// ===== INCIDENTS =====

// GET /api/enhanced-monitoring/incidents
router.get('/incidents', authenticateToken, async (req, res) => {
  try {
    const incidents = await getIncidents(req.user.id); // TODO-LINT: move to async function
    res.json({ incidents });
  } catch (error) {
    console.error('Failed to fetch incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /api/enhanced-monitoring/incidents/:id
router.get('/incidents/:id', authenticateToken, async (req, res) => {
  try {
    const incident = await getIncidentById(req.params.id, req.user.id); // TODO-LINT: move to async function
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ incident });
  } catch (error) {
    console.error('Failed to fetch incident:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// POST /api/enhanced-monitoring/incidents
router.post('/incidents', 
  authenticateToken, 
  validateRequest(createIncidentSchema),
  async (req, res) => {
    try {
      const incident = await createIncident({
        ...req.body,
        user_id: req.user.id
      }); // TODO-LINT: move to async function
      res.status(201).json({ incident });
    } catch (error) {
      console.error('Failed to create incident:', error);
      res.status(500).json({ error: 'Failed to create incident' });
    }
  }
);

// PATCH /api/enhanced-monitoring/incidents/:id
router.patch('/incidents/:id', 
  authenticateToken, 
  validateRequest(updateIncidentSchema),
  async (req, res) => {
    try {
      const incident = await updateIncident(req.params.id, req.body, req.user.id); // TODO-LINT: move to async function
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      res.json({ incident });
    } catch (error) {
      console.error('Failed to update incident:', error);
      res.status(500).json({ error: 'Failed to update incident' });
    }
  }
);

// POST /api/enhanced-monitoring/incidents/:id/resolve
router.post('/incidents/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const incident = await resolveIncident(req.params.id, req.user.id); // TODO-LINT: move to async function
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ incident });
  } catch (error) {
    console.error('Failed to resolve incident:', error);
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

// ===== NOTIFICATION PROVIDERS =====

// GET /api/enhanced-monitoring/notification-providers
router.get('/notification-providers', authenticateToken, async (req, res) => {
  try {
    const providers = await getNotificationProviders(req.user.id); // TODO-LINT: move to async function
    res.json({ notification_providers: providers });
  } catch (error) {
    console.error('Failed to fetch notification providers:', error);
    res.status(500).json({ error: 'Failed to fetch notification providers' });
  }
});

// POST /api/enhanced-monitoring/notification-providers
router.post('/notification-providers', 
  authenticateToken, 
  validateRequest(createNotificationProviderSchema),
  async (req, res) => {
    try {
      const provider = await createNotificationProvider({
        ...req.body,
        user_id: req.user.id
      }); // TODO-LINT: move to async function
      res.status(201).json({ notification_provider: provider });
    } catch (error) {
      console.error('Failed to create notification provider:', error);
      res.status(500).json({ error: 'Failed to create notification provider' });
    }
  }
);

// PUT /api/enhanced-monitoring/notification-providers/:id
router.put('/notification-providers/:id', 
  authenticateToken, 
  validateRequest(createNotificationProviderSchema.partial()),
  async (req, res) => {
    try {
      const provider = await updateNotificationProvider(req.params.id, req.body, req.user.id); // TODO-LINT: move to async function
      if (!provider) {
        return res.status(404).json({ error: 'Notification provider not found' });
      }
      res.json({ notification_provider: provider });
    } catch (error) {
      console.error('Failed to update notification provider:', error);
      res.status(500).json({ error: 'Failed to update notification provider' });
    }
  }
);

// POST /api/enhanced-monitoring/notification-providers/:id/test
router.post('/notification-providers/:id/test', authenticateToken, async (req, res) => {
  try {
    const result = await testNotificationProvider(req.params.id, req.user.id); // TODO-LINT: move to async function
    res.json({ success: result });
  } catch (error) {
    console.error('Failed to test notification provider:', error);
    res.status(500).json({ error: 'Failed to test notification provider' });
  }
});

// ===== STATUS PAGES =====

// GET /api/enhanced-monitoring/status-pages
router.get('/status-pages', authenticateToken, async (req, res) => {
  try {
    const statusPages = await getStatusPages(req.user.id); // TODO-LINT: move to async function
    res.json({ status_pages: statusPages });
  } catch (error) {
    console.error('Failed to fetch status pages:', error);
    res.status(500).json({ error: 'Failed to fetch status pages' });
  }
});

// GET /api/enhanced-monitoring/status-pages/:slug (Public access)
router.get('/status-pages/:slug', async (req, res) => {
  try {
    const statusPage = await getPublicStatusPage(req.params.slug); // TODO-LINT: move to async function
    if (!statusPage) {
      return res.status(404).json({ error: 'Status page not found' });
    }
    res.json({ page: statusPage });
  } catch (error) {
    console.error('Failed to fetch status page:', error);
    res.status(500).json({ error: 'Failed to fetch status page' });
  }
});

// POST /api/enhanced-monitoring/status-pages
router.post('/status-pages', 
  authenticateToken, 
  validateRequest(createStatusPageSchema),
  async (req, res) => {
    try {
      const statusPage = await createStatusPage({
        ...req.body,
        user_id: req.user.id
      }); // TODO-LINT: move to async function
      res.status(201).json({ status_page: statusPage });
    } catch (error) {
      console.error('Failed to create status page:', error);
      res.status(500).json({ error: 'Failed to create status page' });
    }
  }
);

// PUT /api/enhanced-monitoring/status-pages/:id
router.put('/status-pages/:id', 
  authenticateToken, 
  validateRequest(createStatusPageSchema.partial()),
  async (req, res) => {
    try {
      const statusPage = await updateStatusPage(req.params.id, req.body, req.user.id); // TODO-LINT: move to async function
      if (!statusPage) {
        return res.status(404).json({ error: 'Status page not found' });
      }
      res.json({ status_page: statusPage });
    } catch (error) {
      console.error('Failed to update status page:', error);
      res.status(500).json({ error: 'Failed to update status page' });
    }
  }
);

// ===== MAINTENANCE WINDOWS =====

// GET /api/enhanced-monitoring/maintenance-windows
router.get('/maintenance-windows', authenticateToken, async (req, res) => {
  try {
    const maintenanceWindows = await getMaintenanceWindows(req.user.id); // TODO-LINT: move to async function
    res.json({ maintenance_windows: maintenanceWindows });
  } catch (error) {
    console.error('Failed to fetch maintenance windows:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance windows' });
  }
});

// POST /api/enhanced-monitoring/maintenance-windows
router.post('/maintenance-windows', 
  authenticateToken, 
  validateRequest(createMaintenanceWindowSchema),
  async (req, res) => {
    try {
      const maintenanceWindow = await createMaintenanceWindow({
        ...req.body,
        user_id: req.user.id
      }); // TODO-LINT: move to async function
      res.status(201).json({ maintenance_window: maintenanceWindow });
    } catch (error) {
      console.error('Failed to create maintenance window:', error);
      res.status(500).json({ error: 'Failed to create maintenance window' });
    }
  }
);

// PUT /api/enhanced-monitoring/maintenance-windows/:id
router.put('/maintenance-windows/:id', 
  authenticateToken, 
  validateRequest(createMaintenanceWindowSchema.partial()),
  async (req, res) => {
    try {
      const maintenanceWindow = await updateMaintenanceWindow(req.params.id, req.body, req.user.id); // TODO-LINT: move to async function
      if (!maintenanceWindow) {
        return res.status(404).json({ error: 'Maintenance window not found' });
      }
      res.json({ maintenance_window: maintenanceWindow });
    } catch (error) {
      console.error('Failed to update maintenance window:', error);
      res.status(500).json({ error: 'Failed to update maintenance window' });
    }
  }
);

// DELETE /api/enhanced-monitoring/maintenance-windows/:id
router.delete('/maintenance-windows/:id', authenticateToken, async (req, res) => {
  try {
    await deleteMaintenanceWindow(req.params.id, req.user.id); // TODO-LINT: move to async function
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete maintenance window:', error);
    res.status(500).json({ error: 'Failed to delete maintenance window' });
  }
});

// ===== TAGS =====

// GET /api/enhanced-monitoring/tags
router.get('/tags', authenticateToken, async (req, res) => {
  try {
    const tags = await getTags(req.user.id); // TODO-LINT: move to async function
    res.json({ tags });
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// POST /api/enhanced-monitoring/tags
router.post('/tags', 
  authenticateToken, 
  validateRequest(createTagSchema),
  async (req, res) => {
    try {
      const tag = await createTag({
        ...req.body,
        user_id: req.user.id
      }); // TODO-LINT: move to async function
      res.status(201).json({ tag });
    } catch (error) {
      console.error('Failed to create tag:', error);
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }
);

// PUT /api/enhanced-monitoring/tags/:id
router.put('/tags/:id', 
  authenticateToken, 
  validateRequest(createTagSchema.partial()),
  async (req, res) => {
    try {
      const tag = await updateTag(req.params.id, req.body, req.user.id); // TODO-LINT: move to async function
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      res.json({ tag });
    } catch (error) {
      console.error('Failed to update tag:', error);
      res.status(500).json({ error: 'Failed to update tag' });
    }
  }
);

// DELETE /api/enhanced-monitoring/tags/:id
router.delete('/tags/:id', authenticateToken, async (req, res) => {
  try {
    await deleteTag(req.params.id, req.user.id); // TODO-LINT: move to async function
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
