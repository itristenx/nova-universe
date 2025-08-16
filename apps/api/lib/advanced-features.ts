// Nova Sentinel - Tag System and Maintenance Windows
// Implementing Uptime Kuma's advanced features for complete parity

import { logger } from '../logger.js';

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  recurring: boolean;
  recurring_pattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    days_of_week?: number[]; // 0 = Sunday, 1 = Monday, etc.
    day_of_month?: number;
  };
  affected_monitors: string[];
  affected_tags: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notification_sent: boolean;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProxyConfiguration {
  id: string;
  name: string;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  hostname: string;
  port: number;
  username?: string;
  password?: string;
  active: boolean;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateInfo {
  monitor_id: string;
  hostname: string;
  port: number;
  issuer: string;
  subject: string;
  serial_number: string;
  valid_from: string;
  valid_to: string;
  days_remaining: number;
  fingerprint: string;
  fingerprint256: string;
  signature_algorithm: string;
  is_self_signed: boolean;
  is_expired: boolean;
  is_valid: boolean;
  chain_length: number;
  last_checked: string;
}

/**
 * Advanced Features Service
 * Implements tags, maintenance windows, proxy support, and certificate monitoring
 */
export class AdvancedFeaturesService {

  /**
   * Tag Management
   */
  async createTag(tagData: Partial<Tag>): Promise<Tag> {
    const tag: Tag = {
      id: this.generateId(),
      name: tagData.name!,
      color: tagData.color || this.getRandomColor(),
      description: tagData.description,
      tenant_id: tagData.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to database
    await this.saveTag(tag); // TODO-LINT: move to async function
    logger.info(`Created tag: ${tag.name}`);
    
    return tag;
  }

  async getTagsByTenant(tenantId?: string): Promise<Tag[]> {
    // Query database for tags by tenant
    return this.queryTagsByTenant(tenantId);
  }

  async assignTagsToMonitor(monitorId: string, tagIds: string[]): Promise<void> {
    // Assign tags to monitor in database
    await this.assignMonitorTags(monitorId, tagIds); // TODO-LINT: move to async function
    logger.info(`Assigned ${tagIds.length} tags to monitor: ${monitorId}`);
  }

  async getMonitorsByTag(tagId: string): Promise<string[]> {
    // Get monitors that have this tag
    return this.queryMonitorsByTag(tagId);
  }

  /**
   * Maintenance Window Management
   */
  async createMaintenanceWindow(windowData: Partial<MaintenanceWindow>): Promise<MaintenanceWindow> {
    const window: MaintenanceWindow = {
      id: this.generateId(),
      title: windowData.title!,
      description: windowData.description,
      start_time: windowData.start_time!,
      end_time: windowData.end_time!,
      timezone: windowData.timezone || 'UTC',
      recurring: windowData.recurring || false,
      recurring_pattern: windowData.recurring_pattern,
      affected_monitors: windowData.affected_monitors || [],
      affected_tags: windowData.affected_tags || [],
      status: 'scheduled',
      notification_sent: false,
      tenant_id: windowData.tenant_id,
      created_by: windowData.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.saveMaintenanceWindow(window); // TODO-LINT: move to async function
    
    // Schedule notifications
    await this.scheduleMaintenanceNotifications(window); // TODO-LINT: move to async function
    
    logger.info(`Created maintenance window: ${window.title}`);
    return window;
  }

  async getActiveMaintenanceWindows(): Promise<MaintenanceWindow[]> {
    const now = new Date();
    const windows = await this.queryMaintenanceWindows(); // TODO-LINT: move to async function
    
    return windows.filter(window => {
      const startTime = new Date(window.start_time);
      const endTime = new Date(window.end_time);
      return startTime <= now && endTime >= now && window.status === 'active';
    });
  }

  async getScheduledMaintenanceWindows(daysAhead: number = 7): Promise<MaintenanceWindow[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
    const windows = await this.queryMaintenanceWindows(); // TODO-LINT: move to async function
    
    return windows.filter(window => {
      const startTime = new Date(window.start_time);
      return startTime > now && startTime <= futureDate && window.status === 'scheduled';
    });
  }

  async isMonitorInMaintenance(monitorId: string): Promise<boolean> {
    const activeWindows = await this.getActiveMaintenanceWindows(); // TODO-LINT: move to async function
    
    return activeWindows.some(window => {
      // Check if monitor is directly affected
      if (window.affected_monitors.includes(monitorId)) {
        return true;
      }
      
      // Check if monitor has any affected tags
      // This would require querying monitor tags from database
      return false;
    });
  }

  private async scheduleMaintenanceNotifications(window: MaintenanceWindow): Promise<void> {
    // Schedule notifications 24 hours, 1 hour, and 15 minutes before maintenance
    const startTime = new Date(window.start_time);
    const now = new Date();
    
    const notifications = [
      { offset: 24 * 60 * 60 * 1000, message: '24 hours before maintenance' },
      { offset: 60 * 60 * 1000, message: '1 hour before maintenance' },
      { offset: 15 * 60 * 1000, message: '15 minutes before maintenance' }
    ];
    
    for (const notification of notifications) {
      const notificationTime = new Date(startTime.getTime() - notification.offset);
      
      if (notificationTime > now) {
        // Schedule notification (this would use a job queue in production)
        setTimeout(async () => {
          await this.sendMaintenanceNotification(window, notification.message); // TODO-LINT: move to async function
        }, notificationTime.getTime() - now.getTime());
      }
    }
  }

  private async sendMaintenanceNotification(window: MaintenanceWindow, timing: string): Promise<void> {
    logger.info(`Sending maintenance notification: ${window.title} - ${timing}`);
    
    // Send notification to all subscribers
    // This would integrate with the notification system
  }

  /**
   * Proxy Configuration Management
   */
  async createProxyConfiguration(proxyData: Partial<ProxyConfiguration>): Promise<ProxyConfiguration> {
    const proxy: ProxyConfiguration = {
      id: this.generateId(),
      name: proxyData.name!,
      protocol: proxyData.protocol!,
      hostname: proxyData.hostname!,
      port: proxyData.port!,
      username: proxyData.username,
      password: proxyData.password,
      active: proxyData.active || true,
      tenant_id: proxyData.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.saveProxyConfiguration(proxy); // TODO-LINT: move to async function
    logger.info(`Created proxy configuration: ${proxy.name}`);
    
    return proxy;
  }

  async getProxyConfiguration(proxyId: string): Promise<ProxyConfiguration | null> {
    return this.queryProxyConfiguration(proxyId);
  }

  async testProxyConnection(proxy: ProxyConfiguration): Promise<boolean> {
    try {
      // Test proxy connection
      const axios = await import('axios'); // TODO-LINT: move to async function
      const HttpsProxyAgent = await import('https-proxy-agent'); // TODO-LINT: move to async function
      
      const proxyUrl = `${proxy.protocol}://${proxy.username ? `${proxy.username}:${proxy.password}@` : ''}${proxy.hostname}:${proxy.port}`;
      const agent = new HttpsProxyAgent.HttpsProxyAgent(proxyUrl);
      
      const response = await axios.default.get('https://httpbin.org/ip', {
        httpsAgent: agent,
        timeout: 10000
      }); // TODO-LINT: move to async function
      
      return response.status === 200;
    } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
      logger.error(`Proxy test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Certificate Monitoring
   */
  async checkCertificate(hostname: string, port: number = 443): Promise<CertificateInfo> {
    try {
      const tls = await import('tls'); // TODO-LINT: move to async function
      
      return new Promise((resolve, reject) => {
        const socket = tls.connect(port, hostname, { servername: hostname }, () => {
          const cert = socket.getPeerCertificate(true);
          const now = new Date();
          const validTo = new Date(cert.valid_to);
          const validFrom = new Date(cert.valid_from);
          const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const certInfo: CertificateInfo = {
            monitor_id: '', // This would be set by the caller
            hostname,
            port,
            issuer: cert.issuer?.CN || 'Unknown',
            subject: cert.subject?.CN || 'Unknown',
            serial_number: cert.serialNumber || '',
            valid_from: cert.valid_from,
            valid_to: cert.valid_to,
            days_remaining: daysRemaining,
            fingerprint: cert.fingerprint || '',
            fingerprint256: cert.fingerprint256 || '',
            signature_algorithm: 'Unknown', // cert.sigalg is not available in Node.js types
            is_self_signed: cert.issuer?.CN === cert.subject?.CN,
            is_expired: now > validTo,
            is_valid: now >= validFrom && now <= validTo,
            chain_length: 1, // This would require parsing the full chain
            last_checked: new Date().toISOString()
          };
          
          socket.destroy();
          resolve(certInfo);
        });

        socket.on('error', (error) => {
          reject(error);
        });

        socket.setTimeout(10000, () => {
          socket.destroy();
          reject(new Error('Certificate check timeout'));
        });
      });
    } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
      throw new Error(`Certificate check failed: ${error.message}`);
    }
  }

  async getCertificateExpiringSoon(days: number = 30): Promise<CertificateInfo[]> {
    // Query database for certificates expiring within specified days
    return this.queryCertificatesExpiringSoon(days);
  }

  /**
   * 2FA Support
   */
  async generateTotpSecret(): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const speakeasy = await import('speakeasy'); // TODO-LINT: move to async function
    const qrcode = await import('qrcode'); // TODO-LINT: move to async function
    
    const secret = speakeasy.generateSecret({
      name: 'Nova Sentinel'
    });
    
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!); // TODO-LINT: move to async function
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
    
    return {
      secret: secret.base32!,
      qrCode: qrCodeUrl,
      backupCodes
    };
  }

  async verifyTotpToken(secret: string, token: string): Promise<boolean> {
    const speakeasy = await import('speakeasy'); // TODO-LINT: move to async function
    
    return speakeasy.totp.verify({
      secret,
      token,
      encoding: 'base32',
      window: 2 // Allow 2 time steps of variance
    });
  }

  /**
   * Ping Chart Data
   */
  async generatePingChartData(monitorId: string, hours: number = 24): Promise<any[]> {
    // Query monitor results for the specified time period
    const results = await this.queryMonitorResults(monitorId, hours); // TODO-LINT: move to async function
    
    return results.map(result => ({
      timestamp: result.timestamp,
      responseTime: result.response_time,
      status: result.success ? 'up' : 'down'
    }));
  }

  /**
   * Utility Methods
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getRandomColor(): string {
    const colors = [
      '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
      '#FF2D92', '#5AC8FA', '#FFCC00', '#FF9F0A', '#30D158'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Database-backed methods
  private async saveTag(tag: Tag): Promise<void> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    await db.query(`
      INSERT INTO tags (id, tenant_id, name, color, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color, updated_at = NOW()
    `, [tag.id, tag.tenantId || null, tag.name, tag.color || this.getRandomColor()]); // TODO-LINT: move to async function
  }

  private async queryTagsByTenant(tenantId?: string): Promise<Tag[]> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    const res = tenantId
      ? await db.query('SELECT id, name, color FROM tags WHERE tenant_id = $1 ORDER BY name', [tenantId])
      : await db.query('SELECT id, name, color FROM tags ORDER BY name'); // TODO-LINT: move to async function
    return (res.rows || []).map((r: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => ({ id: r.id, name: r.name, color: r.color, tenantId }));
  }

  private async assignMonitorTags(monitorId: string, tagIds: string[]): Promise<void> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    await db.query('DELETE FROM monitor_tags WHERE monitor_id = $1', [monitorId]); // TODO-LINT: move to async function
    for (const tagId of tagIds) {
      await db.query('INSERT INTO monitor_tags (monitor_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [monitorId, tagId]); // TODO-LINT: move to async function
    }
  }

  private async queryMonitorsByTag(tagId: string): Promise<string[]> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    const res = await db.query('SELECT monitor_id FROM monitor_tags WHERE tag_id = $1', [tagId]); // TODO-LINT: move to async function
    return (res.rows || []).map((r: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => r.monitor_id);
  }

  private async saveMaintenanceWindow(window: MaintenanceWindow): Promise<void> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    await db.query(`
      INSERT INTO maintenance_windows (id, tenant_id, title, status, scheduled_start, scheduled_end, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, scheduled_start = EXCLUDED.scheduled_start, scheduled_end = EXCLUDED.scheduled_end, updated_at = NOW()
    `, [window.id, window.tenantId || null, window.title, window.status || 'scheduled', window.startTime, window.endTime]); // TODO-LINT: move to async function
  }

  private async queryMaintenanceWindows(): Promise<MaintenanceWindow[]> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    const res = await db.query('SELECT id, title, status, scheduled_start as "startTime", scheduled_end as "endTime", tenant_id as "tenantId" FROM maintenance_windows ORDER BY scheduled_start DESC'); // TODO-LINT: move to async function
    return res.rows || [];
  }

  private async saveProxyConfiguration(proxy: ProxyConfiguration): Promise<void> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    await db.query(`
      INSERT INTO proxy_configurations (id, tenant_id, name, target_url, auth_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, target_url = EXCLUDED.target_url, auth_type = EXCLUDED.auth_type, updated_at = NOW()
    `, [proxy.id, proxy.tenantId || null, proxy.name, proxy.targetUrl, proxy.authType || 'none']); // TODO-LINT: move to async function
  }

  private async queryProxyConfiguration(proxyId: string): Promise<ProxyConfiguration | null> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    const res = await db.query('SELECT id, tenant_id as "tenantId", name, target_url as "targetUrl", auth_type as "authType" FROM proxy_configurations WHERE id = $1', [proxyId]); // TODO-LINT: move to async function
    return res.rows?.[0] || null;
  }

  private async queryCertificatesExpiringSoon(days: number): Promise<CertificateInfo[]> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    const res = await db.query(`
      SELECT id, monitor_id as "monitorId", days_remaining as "daysRemaining", is_expired as "isExpired", issuer
      FROM certificate_info
      WHERE days_remaining <= $1
      ORDER BY days_remaining ASC
    `, [days]); // TODO-LINT: move to async function
    return res.rows || [];
  }

  private async queryMonitorResults(monitorId: string, hours: number): Promise<any[]> {
    const db = (await import('../db.js')).default; // TODO-LINT: move to async function
    const res = await db.query(`
      SELECT checked_at as timestamp, response_time_ms as response_time, (status = 'up') as success
      FROM monitor_heartbeats
      WHERE monitor_id = $1 AND checked_at >= NOW() - ($2 || ' hours')::interval
      ORDER BY checked_at ASC
    `, [monitorId, String(hours)]); // TODO-LINT: move to async function
    return res.rows || [];
  }
}

export const _advancedFeaturesService = new AdvancedFeaturesService();
