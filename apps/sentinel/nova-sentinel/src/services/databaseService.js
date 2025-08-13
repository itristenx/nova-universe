// Nova Sentinel - Database Service
// Complete data persistence for monitoring, status pages, and user preferences

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

export class DatabaseService {
  constructor(config) {
    this.config = config;
    this.db = null;
  }

  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = dirname(this.config.path);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Open SQLite database
      this.db = new Database(this.config.path);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');

      // Create tables
      await this.createTables();
      
      logger.info(`Database initialized: ${this.config.path}`);
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const schema = `
      -- ========================================================================
      -- NOVA SENTINEL DATABASE SCHEMA
      -- Complete 1:1 Uptime Kuma Feature Parity + Nova Enhancements
      -- ========================================================================

      -- Monitors table (Nova metadata for Uptime Kuma monitors)
      CREATE TABLE IF NOT EXISTS monitors (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT NOT NULL, -- JSON config from Uptime Kuma
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT
      );

      CREATE INDEX idx_monitors_uptime_kuma_id ON monitors(uptime_kuma_id);
      CREATE INDEX idx_monitors_tenant_id ON monitors(tenant_id);
      CREATE INDEX idx_monitors_type ON monitors(type);
      CREATE INDEX idx_monitors_created_by ON monitors(created_by);

      -- Status Pages table
      CREATE TABLE IF NOT EXISTS status_pages (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        config TEXT NOT NULL, -- JSON config from Uptime Kuma
        published BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT
      );

      CREATE INDEX idx_status_pages_uptime_kuma_id ON status_pages(uptime_kuma_id);
      CREATE INDEX idx_status_pages_tenant_id ON status_pages(tenant_id);
      CREATE INDEX idx_status_pages_slug ON status_pages(slug);
      CREATE INDEX idx_status_pages_published ON status_pages(published);

      -- Heartbeats table (cached from Uptime Kuma for faster queries)
      CREATE TABLE IF NOT EXISTS heartbeats (
        id TEXT PRIMARY KEY,
        monitor_id TEXT NOT NULL,
        status INTEGER NOT NULL, -- 0 = down, 1 = up
        time DATETIME NOT NULL,
        ping REAL,
        msg TEXT,
        important BOOLEAN DEFAULT false,
        duration REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (monitor_id) REFERENCES monitors(uptime_kuma_id)
      );

      CREATE INDEX idx_heartbeats_monitor_id ON heartbeats(monitor_id);
      CREATE INDEX idx_heartbeats_time ON heartbeats(time);
      CREATE INDEX idx_heartbeats_status ON heartbeats(status);
      CREATE INDEX idx_heartbeats_important ON heartbeats(important);

      -- Incidents table
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        status_page_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        style TEXT DEFAULT 'danger', -- info, warning, danger, primary
        pin BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        resolved_by TEXT,
        FOREIGN KEY (status_page_id) REFERENCES status_pages(uptime_kuma_id)
      );

      CREATE INDEX idx_incidents_uptime_kuma_id ON incidents(uptime_kuma_id);
      CREATE INDEX idx_incidents_status_page_id ON incidents(status_page_id);
      CREATE INDEX idx_incidents_created_at ON incidents(created_at);
      CREATE INDEX idx_incidents_resolved_at ON incidents(resolved_at);

      -- Maintenance windows table
      CREATE TABLE IF NOT EXISTS maintenance (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        created_by TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        strategy TEXT DEFAULT 'single', -- single, recurring
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        timezone TEXT DEFAULT 'UTC',
        affected_monitors TEXT, -- JSON array of monitor IDs
        affected_status_pages TEXT, -- JSON array of status page IDs
        status TEXT DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_maintenance_uptime_kuma_id ON maintenance(uptime_kuma_id);
      CREATE INDEX idx_maintenance_start_time ON maintenance(start_time);
      CREATE INDEX idx_maintenance_end_time ON maintenance(end_time);
      CREATE INDEX idx_maintenance_status ON maintenance(status);

      -- Notifications table (notification providers)
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- slack, discord, email, webhook, etc.
        config TEXT NOT NULL, -- JSON config
        is_default BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_notifications_uptime_kuma_id ON notifications(uptime_kuma_id);
      CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
      CREATE INDEX idx_notifications_type ON notifications(type);
      CREATE INDEX idx_notifications_active ON notifications(active);

      -- Tags table
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#007cba',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, name)
      );

      CREATE INDEX idx_tags_uptime_kuma_id ON tags(uptime_kuma_id);
      CREATE INDEX idx_tags_tenant_id ON tags(tenant_id);
      CREATE INDEX idx_tags_name ON tags(name);

      -- Monitor-Tag relationships
      CREATE TABLE IF NOT EXISTS monitor_tags (
        monitor_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (monitor_id, tag_id),
        FOREIGN KEY (monitor_id) REFERENCES monitors(uptime_kuma_id),
        FOREIGN KEY (tag_id) REFERENCES tags(uptime_kuma_id)
      );

      -- Status Page Subscriptions (for email notifications)
      CREATE TABLE IF NOT EXISTS status_page_subscriptions (
        id TEXT PRIMARY KEY,
        status_page_id TEXT NOT NULL,
        email TEXT NOT NULL,
        notification_types TEXT NOT NULL, -- JSON array: incidents, maintenance, etc.
        confirmed BOOLEAN DEFAULT false,
        confirmation_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        confirmed_at DATETIME,
        unsubscribed_at DATETIME,
        FOREIGN KEY (status_page_id) REFERENCES status_pages(uptime_kuma_id),
        UNIQUE(status_page_id, email)
      );

      CREATE INDEX idx_subscriptions_status_page_id ON status_page_subscriptions(status_page_id);
      CREATE INDEX idx_subscriptions_email ON status_page_subscriptions(email);
      CREATE INDEX idx_subscriptions_confirmed ON status_page_subscriptions(confirmed);

      -- SSL Certificate monitoring
      CREATE TABLE IF NOT EXISTS ssl_certificates (
        id TEXT PRIMARY KEY,
        monitor_id TEXT NOT NULL,
        domain TEXT NOT NULL,
        issuer TEXT,
        subject TEXT,
        valid_from DATETIME,
        valid_to DATETIME,
        fingerprint TEXT,
        algorithm TEXT,
        days_remaining INTEGER,
        is_valid BOOLEAN DEFAULT true,
        last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (monitor_id) REFERENCES monitors(uptime_kuma_id)
      );

      CREATE INDEX idx_ssl_monitor_id ON ssl_certificates(monitor_id);
      CREATE INDEX idx_ssl_domain ON ssl_certificates(domain);
      CREATE INDEX idx_ssl_valid_to ON ssl_certificates(valid_to);
      CREATE INDEX idx_ssl_days_remaining ON ssl_certificates(days_remaining);

      -- Docker Hosts (for Docker container monitoring)
      CREATE TABLE IF NOT EXISTS docker_hosts (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        docker_daemon TEXT NOT NULL, -- Docker daemon URL
        docker_type TEXT DEFAULT 'socket', -- socket, tcp
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_docker_hosts_uptime_kuma_id ON docker_hosts(uptime_kuma_id);
      CREATE INDEX idx_docker_hosts_tenant_id ON docker_hosts(tenant_id);

      -- Proxies table
      CREATE TABLE IF NOT EXISTS proxies (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        protocol TEXT NOT NULL, -- http, https, socks4, socks5
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        auth BOOLEAN DEFAULT false,
        username TEXT,
        password TEXT,
        active BOOLEAN DEFAULT true,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_proxies_uptime_kuma_id ON proxies(uptime_kuma_id);
      CREATE INDEX idx_proxies_tenant_id ON proxies(tenant_id);
      CREATE INDEX idx_proxies_active ON proxies(active);

      -- API Keys table
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        uptime_kuma_id TEXT UNIQUE NOT NULL,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL,
        expires_at DATETIME,
        active BOOLEAN DEFAULT true,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME
      );

      CREATE INDEX idx_api_keys_uptime_kuma_id ON api_keys(uptime_kuma_id);
      CREATE INDEX idx_api_keys_tenant_id ON api_keys(tenant_id);
      CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
      CREATE INDEX idx_api_keys_active ON api_keys(active);

      -- Settings table (system-wide settings)
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT DEFAULT 'string', -- string, number, boolean, json
        description TEXT,
        updated_by TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Analytics and Statistics
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL, -- monitor_up, monitor_down, status_page_view, etc.
        monitor_id TEXT,
        status_page_id TEXT,
        metadata TEXT, -- JSON metadata
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        tenant_id TEXT
      );

      CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
      CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
      CREATE INDEX idx_analytics_monitor_id ON analytics_events(monitor_id);
      CREATE INDEX idx_analytics_status_page_id ON analytics_events(status_page_id);
      CREATE INDEX idx_analytics_tenant_id ON analytics_events(tenant_id);

      -- Triggers for updated_at timestamps
      CREATE TRIGGER IF NOT EXISTS update_monitors_timestamp 
        AFTER UPDATE ON monitors
        BEGIN
          UPDATE monitors SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_status_pages_timestamp 
        AFTER UPDATE ON status_pages
        BEGIN
          UPDATE status_pages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_incidents_timestamp 
        AFTER UPDATE ON incidents
        BEGIN
          UPDATE incidents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_maintenance_timestamp 
        AFTER UPDATE ON maintenance
        BEGIN
          UPDATE maintenance SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_notifications_timestamp 
        AFTER UPDATE ON notifications
        BEGIN
          UPDATE notifications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
    `;

    // Execute schema
    this.db.exec(schema);
    logger.info('Database schema created successfully');
  }

  // ========================================================================
  // MONITOR OPERATIONS
  // ========================================================================

  async createMonitor(monitorData) {
    const stmt = this.db.prepare(`
      INSERT INTO monitors (id, uptime_kuma_id, tenant_id, created_by, name, type, config)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    stmt.run(
      id,
      monitorData.uptimeKumaId,
      monitorData.tenantId,
      monitorData.createdBy,
      monitorData.name,
      monitorData.type,
      JSON.stringify(monitorData.config)
    );
    
    return { id, ...monitorData };
  }

  async updateMonitor(uptimeKumaId, updateData) {
    const stmt = this.db.prepare(`
      UPDATE monitors 
      SET config = ?, updated_by = ?
      WHERE uptime_kuma_id = ?
    `);
    
    stmt.run(
      JSON.stringify(updateData.config),
      updateData.updatedBy,
      uptimeKumaId
    );
  }

  async deleteMonitor(uptimeKumaId) {
    const stmt = this.db.prepare('DELETE FROM monitors WHERE uptime_kuma_id = ?');
    stmt.run(uptimeKumaId);
  }

  async getMonitor(uptimeKumaId) {
    const stmt = this.db.prepare(`
      SELECT * FROM monitors WHERE uptime_kuma_id = ?
    `);
    const monitor = stmt.get(uptimeKumaId);
    
    if (monitor && monitor.config) {
      monitor.config = JSON.parse(monitor.config);
    }
    
    return monitor;
  }

  async getAllMonitors(tenantId = null) {
    let query = 'SELECT * FROM monitors';
    let params = [];
    
    if (tenantId) {
      query += ' WHERE tenant_id = ?';
      params.push(tenantId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = this.db.prepare(query);
    const monitors = stmt.all(...params);
    
    return monitors.map(monitor => ({
      ...monitor,
      config: monitor.config ? JSON.parse(monitor.config) : {}
    }));
  }

  // ========================================================================
  // HEARTBEAT OPERATIONS
  // ========================================================================

  async saveHeartbeat(heartbeatData) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO heartbeats (id, monitor_id, status, time, ping, msg, important, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    stmt.run(
      id,
      heartbeatData.monitorId,
      heartbeatData.status,
      heartbeatData.time,
      heartbeatData.ping,
      heartbeatData.msg,
      heartbeatData.important || false,
      heartbeatData.duration
    );
    
    return { id, ...heartbeatData };
  }

  async getHeartbeats(monitorId, limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM heartbeats 
      WHERE monitor_id = ? 
      ORDER BY time DESC 
      LIMIT ?
    `);
    
    return stmt.all(monitorId, limit);
  }

  async getLatestHeartbeat(monitorId) {
    const stmt = this.db.prepare(`
      SELECT * FROM heartbeats 
      WHERE monitor_id = ? 
      ORDER BY time DESC 
      LIMIT 1
    `);
    
    return stmt.get(monitorId);
  }

  // ========================================================================
  // STATUS PAGE OPERATIONS
  // ========================================================================

  async createStatusPage(statusPageData) {
    const stmt = this.db.prepare(`
      INSERT INTO status_pages (id, uptime_kuma_id, tenant_id, created_by, title, slug, config, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    stmt.run(
      id,
      statusPageData.uptimeKumaId,
      statusPageData.tenantId,
      statusPageData.createdBy,
      statusPageData.title,
      statusPageData.slug,
      JSON.stringify(statusPageData.config),
      statusPageData.published || false
    );
    
    return { id, ...statusPageData };
  }

  async getStatusPageBySlug(slug) {
    const stmt = this.db.prepare(`
      SELECT * FROM status_pages WHERE slug = ? AND published = true
    `);
    const page = stmt.get(slug);
    
    if (page && page.config) {
      page.config = JSON.parse(page.config);
    }
    
    return page;
  }

  async updateStatusPage(uptimeKumaId, updateData) {
    const stmt = this.db.prepare(`
      UPDATE status_pages 
      SET config = ?, updated_by = ?
      WHERE uptime_kuma_id = ?
    `);
    
    stmt.run(
      JSON.stringify(updateData.config),
      updateData.updatedBy,
      uptimeKumaId
    );
  }

  async deleteStatusPage(uptimeKumaId) {
    const stmt = this.db.prepare('DELETE FROM status_pages WHERE uptime_kuma_id = ?');
    stmt.run(uptimeKumaId);
  }

  // ========================================================================
  // SUBSCRIPTION OPERATIONS
  // ========================================================================

  async createSubscription(subscriptionData) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO status_page_subscriptions 
      (id, status_page_id, email, notification_types, confirmation_token)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    
    stmt.run(
      id,
      subscriptionData.statusPageId,
      subscriptionData.email,
      JSON.stringify(subscriptionData.types),
      token
    );
    
    return { id, confirmationToken: token, ...subscriptionData };
  }

  async confirmSubscription(token) {
    const stmt = this.db.prepare(`
      UPDATE status_page_subscriptions 
      SET confirmed = true, confirmed_at = CURRENT_TIMESTAMP
      WHERE confirmation_token = ?
    `);
    
    const result = stmt.run(token);
    return result.changes > 0;
  }

  async getSubscribers(statusPageId, notificationType) {
    const stmt = this.db.prepare(`
      SELECT email FROM status_page_subscriptions 
      WHERE status_page_id = ? 
      AND confirmed = true 
      AND unsubscribed_at IS NULL
      AND json_extract(notification_types, '$') LIKE ?
    `);
    
    return stmt.all(statusPageId, `%${notificationType}%`);
  }

  // ========================================================================
  // ANALYTICS OPERATIONS
  // ========================================================================

  async logEvent(eventData) {
    const stmt = this.db.prepare(`
      INSERT INTO analytics_events (id, event_type, monitor_id, status_page_id, metadata, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    stmt.run(
      id,
      eventData.type,
      eventData.monitorId || null,
      eventData.statusPageId || null,
      JSON.stringify(eventData.metadata || {}),
      eventData.tenantId || null
    );
    
    return { id, ...eventData };
  }

  async getAnalytics(query) {
    const { type, startDate, endDate, monitorId, statusPageId, tenantId } = query;
    
    let sql = 'SELECT * FROM analytics_events WHERE 1=1';
    const params = [];
    
    if (type) {
      sql += ' AND event_type = ?';
      params.push(type);
    }
    
    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }
    
    if (monitorId) {
      sql += ' AND monitor_id = ?';
      params.push(monitorId);
    }
    
    if (statusPageId) {
      sql += ' AND status_page_id = ?';
      params.push(statusPageId);
    }
    
    if (tenantId) {
      sql += ' AND tenant_id = ?';
      params.push(tenantId);
    }
    
    sql += ' ORDER BY timestamp DESC LIMIT 1000';
    
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  async healthCheck() {
    try {
      const stmt = this.db.prepare('SELECT 1 as health');
      const result = stmt.get();
      return result.health === 1;
    } catch (error) {
      return false;
    }
  }

  async getStats() {
    const stmt = this.db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM monitors) as monitors,
        (SELECT COUNT(*) FROM status_pages) as status_pages,
        (SELECT COUNT(*) FROM heartbeats WHERE time > datetime('now', '-1 hour')) as recent_heartbeats,
        (SELECT COUNT(*) FROM status_page_subscriptions WHERE confirmed = true) as subscribers
    `);
    
    return stmt.get();
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default DatabaseService;
