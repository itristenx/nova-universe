// Nova Sentinel - Status Page Service
// Complete status page management with HTML generation and subscription handling

import crypto from 'crypto';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

export class StatusPageService {
  constructor(database) {
    this.database = database;
    this.pageCache = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Load status pages into cache
      await this.loadStatusPages(); // TODO-LINT: move to async function
      
      this.isInitialized = true;
      logger.info('Status page service initialized');
    } catch (error) {
      logger.error('Failed to initialize status page service:', error);
      throw error;
    }
  }

  async loadStatusPages() {
    try {
      const statusPages = await this.database.db.prepare(`
        SELECT * FROM status_pages WHERE published = true
      `).all(); // TODO-LINT: move to async function

      for (const page of statusPages) {
        this.pageCache.set(page.slug, {
          ...page,
          config: JSON.parse(page.config)
        });
      }

      logger.info(`Loaded ${statusPages.length} status pages into cache`);
    } catch (error) {
      logger.error('Failed to load status pages:', error);
    }
  }

  // ========================================================================
  // STATUS PAGE OPERATIONS
  // ========================================================================

  async getBySlug(slug) {
    // Try cache first
    if (this.pageCache.has(slug)) {
      return this.pageCache.get(slug);
    }

    // Fallback to database
    return await this.database.getStatusPageBySlug(slug); // TODO-LINT: move to async function
  }

  async getPageStats(statusPageId) {
    try {
      const stmt = this.database.db.prepare(`
        SELECT 
          COUNT(DISTINCT m.uptime_kuma_id) as total_monitors,
          SUM(CASE WHEN h.status = 1 THEN 1 ELSE 0 END) as up_monitors,
          SUM(CASE WHEN h.status = 0 THEN 1 ELSE 0 END) as down_monitors,
          AVG(h.ping) as avg_response_time,
          (SELECT COUNT(*) FROM status_page_subscriptions WHERE status_page_id = ? AND confirmed = true) as subscribers
        FROM monitors m
        LEFT JOIN heartbeats h ON m.uptime_kuma_id = h.monitor_id
        WHERE m.uptime_kuma_id IN (
          SELECT json_extract(value, '$') 
          FROM json_each((SELECT config FROM status_pages WHERE uptime_kuma_id = ?), '$.publicGroupList')
        )
        AND h.id IN (
          SELECT id FROM heartbeats h2 
          WHERE h2.monitor_id = h.monitor_id 
          ORDER BY h2.time DESC LIMIT 1
        )
      `);

      const stats = stmt.get(statusPageId, statusPageId);
      
      return {
        totalMonitors: stats.total_monitors || 0,
        upMonitors: stats.up_monitors || 0,
        downMonitors: stats.down_monitors || 0,
        avgResponseTime: Math.round(stats.avg_response_time || 0),
        subscribers: stats.subscribers || 0,
        overallUptime: stats.total_monitors > 0 ? 
          (stats.up_monitors / stats.total_monitors) * 100 : 100
      };
    } catch (error) {
      logger.error('Error getting page stats:', error);
      return {
        totalMonitors: 0,
        upMonitors: 0,
        downMonitors: 0,
        avgResponseTime: 0,
        subscribers: 0,
        overallUptime: 100
      };
    }
  }

  async getPageMonitors(statusPageId) {
    try {
      // Get status page configuration
      const statusPage = await this.database.db.prepare(`
        SELECT config FROM status_pages WHERE uptime_kuma_id = ?
      `).get(statusPageId); // TODO-LINT: move to async function

      if (!statusPage) return [];

      const config = JSON.parse(statusPage.config);
      const monitorIds = config.publicGroupList || [];

      if (monitorIds.length === 0) return [];

      // Get monitors
      const placeholders = monitorIds.map(() => '?').join(',');
      const monitors = await this.database.db.prepare(`
        SELECT * FROM monitors WHERE uptime_kuma_id IN (${placeholders})
      `).all(...monitorIds); // TODO-LINT: move to async function

      return monitors.map(monitor => ({
        ...monitor,
        config: JSON.parse(monitor.config)
      }));
    } catch (error) {
      logger.error('Error getting page monitors:', error);
      return [];
    }
  }

  async getPageIncidents(statusPageId) {
    try {
      const incidents = await this.database.db.prepare(`
        SELECT * FROM incidents 
        WHERE status_page_id = ? 
        AND resolved_at IS NULL 
        ORDER BY created_at DESC
      `).all(statusPageId); // TODO-LINT: move to async function

      return incidents;
    } catch (error) {
      logger.error('Error getting page incidents:', error);
      return [];
    }
  }

  async getPageMaintenance(statusPageId) {
    try {
      const now = new Date().toISOString();
      const maintenance = await this.database.db.prepare(`
        SELECT * FROM maintenance 
        WHERE json_extract(affected_status_pages, '$') LIKE '%' || ? || '%'
        AND (status = 'active' OR (status = 'scheduled' AND start_time > ?))
        ORDER BY start_time ASC
      `).all(statusPageId, now); // TODO-LINT: move to async function

      return maintenance.map(m => ({
        ...m,
        affectedMonitors: JSON.parse(m.affected_monitors || '[]'),
        affectedStatusPages: JSON.parse(m.affected_status_pages || '[]')
      }));
    } catch (error) {
      logger.error('Error getting page maintenance:', error);
      return [];
    }
  }

  calculateOverallStatus(monitors) {
    if (monitors.length === 0) return 'operational';

    const downMonitors = monitors.filter(m => m.status === 'down').length;
    const upMonitors = monitors.filter(m => m.status === 'up').length;

    if (downMonitors === 0) return 'operational';
    if (downMonitors === monitors.length) return 'major_outage';
    if (downMonitors / monitors.length > 0.5) return 'partial_outage';
    return 'degraded_performance';
  }

  // ========================================================================
  // HTML GENERATION
  // ========================================================================

  async generateHTML(statusPage, data) {
    const { monitors, incidents, maintenance, overallStatus } = data;
    
    const statusColors = {
      operational: '#10b981',
      degraded_performance: '#f59e0b',
      partial_outage: '#ef4444',
      major_outage: '#dc2626'
    };

    const statusMessages = {
      operational: 'All Systems Operational',
      degraded_performance: 'Degraded Performance',
      partial_outage: 'Partial System Outage',
      major_outage: 'Major System Outage'
    };

    const theme = statusPage.theme || 'light';
    const isDark = theme === 'dark';

    return `
<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusPage.title}</title>
  <meta name="description" content="${statusPage.description || 'Service status page'}">
  
  <!-- Favicon -->
  <link rel="icon" href="${statusPage.icon || '/favicon.ico'}" type="image/x-icon">
  
  <!-- Meta tags for social sharing -->
  <meta property="og:title" content="${statusPage.title}">
  <meta property="og:description" content="${statusPage.description || 'Service status page'}">
  <meta property="og:type" content="website">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg-primary: ${isDark ? '#0f172a' : '#ffffff'};
      --bg-secondary: ${isDark ? '#1e293b' : '#f8fafc'};
      --text-primary: ${isDark ? '#f1f5f9' : '#0f172a'};
      --text-secondary: ${isDark ? '#94a3b8' : '#64748b'};
      --border-color: ${isDark ? '#334155' : '#e2e8f0'};
      --status-color: ${statusColors[overallStatus]};
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: var(--bg-secondary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    
    .logo {
      width: 60px;
      height: 60px;
      margin: 0 auto 1rem;
      background: var(--status-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    }
    
    .title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .description {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
    
    .overall-status {
      background: var(--status-color);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      margin-bottom: 2rem;
      font-size: 1.2rem;
    }
    
    .section {
      background: var(--bg-secondary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;
      overflow: hidden;
    }
    
    .section-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 1.4rem;
      font-weight: 600;
    }
    
    .monitor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .monitor-item:last-child {
      border-bottom: none;
    }
    
    .monitor-name {
      font-weight: 500;
    }
    
    .monitor-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
    
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .status-up { background: #10b981; }
    .status-down { background: #ef4444; }
    
    .incident {
      padding: 1.5rem;
      border-left: 4px solid #ef4444;
      background: ${isDark ? '#1e1b23' : '#fef2f2'};
      margin-bottom: 1rem;
      border-radius: 0 8px 8px 0;
    }
    
    .incident-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #ef4444;
    }
    
    .incident-time {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    
    .maintenance {
      padding: 1.5rem;
      border-left: 4px solid #f59e0b;
      background: ${isDark ? '#23221e' : '#fffbeb'};
      margin-bottom: 1rem;
      border-radius: 0 8px 8px 0;
    }
    
    .maintenance-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #f59e0b;
    }
    
    .footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
      border-top: 1px solid var(--border-color);
      margin-top: 3rem;
    }
    
    .subscribe-form {
      display: flex;
      gap: 0.5rem;
      max-width: 400px;
      margin: 1rem auto 0;
    }
    
    .subscribe-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    
    .subscribe-button {
      padding: 0.75rem 1.5rem;
      background: var(--status-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .title { font-size: 2rem; }
      .monitor-item { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .subscribe-form { flex-direction: column; }
    }
    
    ${statusPage.customCSS || ''}
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        ${statusPage.icon ? `<img src="${statusPage.icon}" alt="Logo" style="width: 100%; height: 100%; border-radius: 50%;">` : '🔍'}
      </div>
      <h1 class="title">${statusPage.title}</h1>
      ${statusPage.description ? `<p class="description">${statusPage.description}</p>` : ''}
    </div>

    <!-- Overall Status -->
    <div class="overall-status">
      ${statusMessages[overallStatus]}
    </div>

    <!-- Active Incidents -->
    ${incidents.length > 0 ? `
    <div class="section">
      <div class="section-header">🚨 Active Incidents</div>
      ${incidents.map(incident => `
        <div class="incident">
          <div class="incident-title">${incident.title}</div>
          <div class="incident-time">${new Date(incident.created_at).toLocaleString()}</div>
          <div>${incident.content}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Scheduled Maintenance -->
    ${maintenance.length > 0 ? `
    <div class="section">
      <div class="section-header">🔧 Scheduled Maintenance</div>
      ${maintenance.map(m => `
        <div class="maintenance">
          <div class="maintenance-title">${m.title}</div>
          <div class="incident-time">${new Date(m.start_time).toLocaleString()} - ${new Date(m.end_time).toLocaleString()}</div>
          <div>${m.description || 'Scheduled maintenance window'}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Services Status -->
    <div class="section">
      <div class="section-header">📊 Services Status</div>
      ${monitors.map(monitor => `
        <div class="monitor-item">
          <div class="monitor-name">${monitor.name}</div>
          <div class="monitor-status">
            <span class="status-indicator status-${monitor.status}"></span>
            <span>${monitor.status === 'up' ? 'Operational' : 'Down'}</span>
            ${monitor.responseTime ? `<span>(${monitor.responseTime}ms)</span>` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Subscription Form -->
    <div class="section">
      <div class="section-header">📧 Get Notified</div>
      <div style="padding: 1.5rem; text-align: center;">
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
          Subscribe to receive notifications about incidents and maintenance.
        </p>
        <form class="subscribe-form" onsubmit="handleSubscribe(event)">
          <input type="email" class="subscribe-input" placeholder="Enter your email" required>
          <button type="submit" class="subscribe-button">Subscribe</button>
        </form>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>Last updated: ${new Date().toLocaleString()}</div>
      ${statusPage.footerText ? `<div>${statusPage.footerText}</div>` : ''}
      ${statusPage.showPoweredBy !== false ? '<div>Powered by Nova Universe</div>' : ''}
    </div>
  </div>

  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => {
      window.location.reload();
    }, 30000);

    // Handle subscription
    function handleSubscribe(event) {
      event.preventDefault();
      const email = event.target.querySelector('input[type="email"]').value;
      
      fetch(window.location.pathname + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, types: ['incidents', 'maintenance'] })
      })
      .then(response => response.json())
      .then(data => {
        alert(data.success ? 'Subscription successful! Please check your email.' : 'Subscription failed.');
        if (data.success) event.target.reset();
      })
      .catch(() => alert('Subscription failed. Please try again.'));
    }
  </script>
</body>
</html>`;
  }

  async generateEmbedHTML(statusPage, data) {
    const { monitors, overallStatus, theme = 'light', compact = false } = data;
    
    const statusColors = {
      operational: '#10b981',
      degraded_performance: '#f59e0b',
      partial_outage: '#ef4444',
      major_outage: '#dc2626'
    };

    const statusMessages = {
      operational: 'All Systems Operational',
      degraded_performance: 'Degraded Performance',
      partial_outage: 'Partial System Outage',
      major_outage: 'Major System Outage'
    };

    const isDark = theme === 'dark';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${isDark ? '#1e293b' : '#ffffff'};
      color: ${isDark ? '#f1f5f9' : '#0f172a'};
      padding: ${compact ? '0.5rem' : '1rem'};
    }
    .embed-container {
      border-radius: 8px;
      border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
      overflow: hidden;
    }
    .embed-header {
      background: ${statusColors[overallStatus]};
      color: white;
      padding: ${compact ? '0.5rem' : '1rem'};
      text-align: center;
      font-weight: 600;
      font-size: ${compact ? '0.9rem' : '1rem'};
    }
    .embed-content {
      background: ${isDark ? '#0f172a' : '#f8fafc'};
    }
    .monitor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${compact ? '0.5rem' : '0.75rem'};
      border-bottom: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
      font-size: ${compact ? '0.8rem' : '0.9rem'};
    }
    .monitor-item:last-child { border-bottom: none; }
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
    .status-up { background: #10b981; }
    .status-down { background: #ef4444; }
  </style>
</head>
<body>
  <div class="embed-container">
    <div class="embed-header">
      ${statusMessages[overallStatus]}
    </div>
    <div class="embed-content">
      ${monitors.slice(0, compact ? 3 : 10).map(monitor => `
        <div class="monitor-item">
          <span>${monitor.name}</span>
          <span>
            <span class="status-indicator status-${monitor.status}"></span>
            ${monitor.status === 'up' ? 'Up' : 'Down'}
          </span>
        </div>
      `).join('')}
      ${monitors.length > (compact ? 3 : 10) ? `
        <div class="monitor-item" style="text-align: center; color: ${isDark ? '#94a3b8' : '#64748b'};">
          +${monitors.length - (compact ? 3 : 10)} more services
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
  }

  // ========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ========================================================================

  async createSubscription(subscriptionData) {
    return await this.database.createSubscription(subscriptionData); // TODO-LINT: move to async function
  }

  async confirmSubscription(token) {
    return await this.database.confirmSubscription(token); // TODO-LINT: move to async function
  }

  async getSubscribers(statusPageId, notificationType) {
    return await this.database.getSubscribers(statusPageId, notificationType); // TODO-LINT: move to async function
  }

  async updateAllStatusPages() {
    try {
      // Update cache from database
      await this.loadStatusPages(); // TODO-LINT: move to async function
      
      // Emit update event for real-time updates
      logger.debug('Status pages cache updated');
    } catch (error) {
      logger.error('Error updating status pages:', error);
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  async healthCheck() {
    return this.isInitialized && this.database && await this.database.healthCheck(); // TODO-LINT: move to async function
  }

  async close() {
    this.pageCache.clear();
    this.isInitialized = false;
    logger.info('Status page service closed');
  }
}

export default StatusPageService;
