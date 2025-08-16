// Nova Sentinel - Enhanced Status Pages
// Multi-page status pages with domain mapping and custom branding to match Uptime Kuma

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../logger.js';

export interface StatusPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  theme: 'light' | 'dark' | 'auto';
  custom_css?: string;
  custom_js?: string;
  logo_url?: string;
  favicon_url?: string;
  background_image_url?: string;
  background_color?: string;
  text_color?: string;
  header_color?: string;
  footer_text?: string;
  domain_name?: string; // Custom domain mapping
  password_protected: boolean;
  password_hash?: string;
  published: boolean;
  show_powered_by: boolean;
  show_tags: boolean;
  monitor_list_sort: 'alphabetical' | 'recent' | 'status';
  incident_history_days: number;
  refresh_interval: number; // seconds
  search_engine_visible: boolean;
  google_analytics_id?: string;
  language: string;
  timezone: string;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  created_by?: string;
}

export interface StatusPageMonitor {
  status_page_id: string;
  monitor_id: string;
  display_name?: string;
  order_index: number;
  show_uptime: boolean;
  show_response_time: boolean;
  send_notifications: boolean;
}

export interface StatusPageIncident {
  id: string;
  status_page_id: string;
  title: string;
  content: string;
  severity: 'maintenance' | 'minor' | 'major' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  affected_monitors: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  created_by?: string;
}

export interface StatusPageSubscription {
  id: string;
  status_page_id: string;
  email: string;
  verified: boolean;
  verification_token?: string;
  notification_types: string[];
  created_at: string;
}

export interface StatusPageBadge {
  status_page_id: string;
  monitor_id?: string;
  type: 'shield' | 'flat' | 'plastic' | 'flat-square' | 'for-the-badge';
  style: 'uptime' | 'status' | 'response-time';
  label?: string;
  color_up?: string;
  color_down?: string;
  color_pending?: string;
}

/**
 * Enhanced Status Page Service
 * Supports multiple status pages, custom domains, branding, and all Uptime Kuma features
 */
export class StatusPageService {
  private readonly cacheDir = '/tmp/nova-status-cache';
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();

  constructor() {
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error: any) {
      logger.error(`Failed to initialize status page cache: ${error.message}`);
    }
  }

  /**
   * Get status page by slug or domain
   */
  async getStatusPage(slugOrDomain: string): Promise<StatusPage | null> {
    // Check cache first
    const cacheKey = `page:${slugOrDomain}`;
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > Date.now()) {
      return this.cache.get(cacheKey);
    }

    try {
      // Query database for status page by slug or domain
      // This would be implemented with actual database queries
      const statusPage = await this.queryStatusPageBySlugOrDomain(slugOrDomain);
      
      if (statusPage) {
        // Cache for 5 minutes
        this.cache.set(cacheKey, statusPage);
        this.cacheExpiry.set(cacheKey, Date.now() + 300000);
      }

      return statusPage;
    } catch (error: any) {
      logger.error(`Failed to get status page: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate status page HTML with custom branding
   */
  async generateStatusPageHTML(statusPage: StatusPage, monitors: any[], incidents: StatusPageIncident[]): Promise<string> {
    const uptime7d = await this.calculateUptime(statusPage.id, 7);
    const uptime30d = await this.calculateUptime(statusPage.id, 30);
    const uptime90d = await this.calculateUptime(statusPage.id, 90);

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(monitors);
    
    // Group monitors by status
    const monitorsByStatus = this.groupMonitorsByStatus(monitors);

    const html = `
<!DOCTYPE html>
<html lang="${statusPage.language || 'en'}" data-theme="${statusPage.theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${statusPage.title}</title>
    <meta name="description" content="${statusPage.description || 'System status page'}">
    
    ${statusPage.favicon_url ? `<link rel="icon" href="${statusPage.favicon_url}">` : ''}
    ${!statusPage.search_engine_visible ? '<meta name="robots" content="noindex, nofollow">' : ''}
    ${statusPage.google_analytics_id ? this.generateGoogleAnalytics(statusPage.google_analytics_id) : ''}
    
    <!-- Apple-inspired CSS -->
    <style>
        ${this.generateAppleInspiredCSS(statusPage)}
        ${statusPage.custom_css || ''}
    </style>

    <script>
        // Auto-refresh functionality
        const REFRESH_INTERVAL = ${statusPage.refresh_interval || 60} * 1000;
        
        function refreshPage() {
            if (!document.hidden) {
                location.reload();
            }
        }
        
        // Set up auto-refresh
        setInterval(refreshPage, REFRESH_INTERVAL);
        
        // Pause refresh when page is hidden
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearInterval(refreshInterval);
            } else {
                refreshInterval = setInterval(refreshPage, REFRESH_INTERVAL);
            }
        });
        
        ${statusPage.custom_js || ''}
    </script>
</head>
<body style="${statusPage.background_color ? `background-color: ${statusPage.background_color};` : ''} 
             ${statusPage.background_image_url ? `background-image: url('${statusPage.background_image_url}');` : ''}">
    
    <!-- Header -->
    <header class="status-header" style="${statusPage.header_color ? `background-color: ${statusPage.header_color};` : ''}">
        <div class="container">
            ${statusPage.logo_url ? `<img src="${statusPage.logo_url}" alt="Logo" class="logo">` : ''}
            <h1 class="status-title" style="${statusPage.text_color ? `color: ${statusPage.text_color};` : ''}">${statusPage.title}</h1>
            ${statusPage.description ? `<p class="status-description">${statusPage.description}</p>` : ''}
        </div>
    </header>

    <!-- Overall Status -->
    <section class="overall-status ${overallStatus.class}">
        <div class="container">
            <div class="status-indicator">
                <div class="status-icon">${overallStatus.icon}</div>
                <div class="status-text">
                    <h2>${overallStatus.title}</h2>
                    <p>${overallStatus.message}</p>
                </div>
            </div>
            
            <!-- Uptime Statistics -->
            <div class="uptime-stats">
                <div class="uptime-stat">
                    <span class="uptime-value">${uptime7d.toFixed(2)}%</span>
                    <span class="uptime-label">7 days</span>
                </div>
                <div class="uptime-stat">
                    <span class="uptime-value">${uptime30d.toFixed(2)}%</span>
                    <span class="uptime-label">30 days</span>
                </div>
                <div class="uptime-stat">
                    <span class="uptime-value">${uptime90d.toFixed(2)}%</span>
                    <span class="uptime-label">90 days</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Current Incidents -->
    ${incidents.filter(i => i.status !== 'resolved').length > 0 ? this.generateIncidentsHTML(incidents.filter(i => i.status !== 'resolved'), 'Active Incidents') : ''}

    <!-- Monitors -->
    <section class="monitors-section">
        <div class="container">
            <h2>Services</h2>
            
            <!-- Operational Services -->
            ${monitorsByStatus.operational.length > 0 ? this.generateMonitorGroupHTML('Operational', monitorsByStatus.operational, 'operational') : ''}
            
            <!-- Degraded Services -->
            ${monitorsByStatus.degraded.length > 0 ? this.generateMonitorGroupHTML('Degraded Performance', monitorsByStatus.degraded, 'degraded') : ''}
            
            <!-- Down Services -->
            ${monitorsByStatus.down.length > 0 ? this.generateMonitorGroupHTML('Service Outages', monitorsByStatus.down, 'down') : ''}
            
            <!-- Maintenance -->
            ${monitorsByStatus.maintenance.length > 0 ? this.generateMonitorGroupHTML('Under Maintenance', monitorsByStatus.maintenance, 'maintenance') : ''}
        </div>
    </section>

    <!-- Incident History -->
    ${incidents.filter(i => i.status === 'resolved').length > 0 ? this.generateIncidentsHTML(incidents.filter(i => i.status === 'resolved'), 'Recent Incidents') : ''}

    <!-- Subscription Form -->
    <section class="subscription-section">
        <div class="container">
            <h2>Get Status Updates</h2>
            <p>Subscribe to receive notifications when service status changes.</p>
            <form class="subscription-form" onsubmit="subscribeToUpdates(event)">
                <input type="email" placeholder="Enter your email address" required>
                <button type="submit">Subscribe</button>
            </form>
        </div>
    </section>

    <!-- Footer -->
    <footer class="status-footer">
        <div class="container">
            <p>${statusPage.footer_text || 'System Status'}</p>
            ${statusPage.show_powered_by ? '<p class="powered-by">Powered by <a href="https://nova-universe.com" target="_blank">Nova Sentinel</a></p>' : ''}
            <p class="last-updated">Last updated: <span id="last-updated-time">${new Date().toLocaleString()}</span></p>
        </div>
    </footer>

    <script>
        function subscribeToUpdates(event) {
            event.preventDefault();
            const email = event.target.querySelector('input[type="email"]').value;
            
            fetch('/api/status-pages/${statusPage.slug}/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Successfully subscribed! Please check your email to confirm.');
                } else {
                    alert('Subscription failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Subscription error:', error);
                alert('Subscription failed. Please try again.');
            });
        }
        
        // Update last updated time
        document.getElementById('last-updated-time').textContent = new Date().toLocaleString();
    </script>
</body>
</html>`;

    return html;
  }

  /**
   * Generate Apple-inspired CSS with customizable branding
   */
  private generateAppleInspiredCSS(statusPage: StatusPage): string {
    return `
        :root {
            --primary-color: ${statusPage.text_color || '#007AFF'};
            --background-color: ${statusPage.background_color || '#FFFFFF'};
            --surface-color: #F9F9F9;
            --border-color: #E5E5E7;
            --text-primary: #1D1D1F;
            --text-secondary: #86868B;
            --success-color: #28CD41;
            --warning-color: #FF9500;
            --error-color: #FF3B30;
            --border-radius: 12px;
            --shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
            --background-color: #000000;
            --surface-color: #1C1C1E;
            --border-color: #38383A;
            --text-primary: #FFFFFF;
            --text-secondary: #8E8E93;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background-color);
            color: var(--text-primary);
            line-height: 1.6;
            font-size: 16px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .status-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 0;
            text-align: center;
        }

        .logo {
            height: 60px;
            margin-bottom: 20px;
        }

        .status-title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.02em;
        }

        .status-description {
            font-size: 1.25rem;
            opacity: 0.9;
        }

        .overall-status {
            padding: 40px 0;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
        }

        .overall-status.operational {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }

        .overall-status.degraded {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }

        .overall-status.down {
            background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
            color: white;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;
        }

        .status-icon {
            font-size: 3rem;
        }

        .status-text h2 {
            font-size: 2rem;
            margin-bottom: 5px;
        }

        .uptime-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 30px;
            max-width: 600px;
            margin: 0 auto;
        }

        .uptime-stat {
            display: flex;
            flex-direction: column;
        }

        .uptime-value {
            font-size: 2rem;
            font-weight: 700;
        }

        .uptime-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .monitors-section,
        .subscription-section {
            padding: 60px 0;
        }

        .monitor-group {
            margin-bottom: 40px;
        }

        .monitor-group h3 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: var(--text-primary);
        }

        .monitor-list {
            display: grid;
            gap: 16px;
        }

        .monitor-item {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s ease;
        }

        .monitor-item:hover {
            box-shadow: var(--shadow);
            transform: translateY(-2px);
        }

        .monitor-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .monitor-status {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .monitor-status.operational { background-color: var(--success-color); }
        .monitor-status.degraded { background-color: var(--warning-color); }
        .monitor-status.down { background-color: var(--error-color); }
        .monitor-status.maintenance { background-color: var(--text-secondary); }

        .monitor-name {
            font-weight: 600;
            font-size: 1.1rem;
        }

        .monitor-metrics {
            display: flex;
            gap: 20px;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .incidents-section {
            padding: 40px 0;
            border-top: 1px solid var(--border-color);
        }

        .incident-item {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 24px;
            margin-bottom: 16px;
        }

        .incident-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }

        .incident-title {
            font-weight: 600;
            font-size: 1.1rem;
        }

        .incident-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;
        }

        .incident-status.investigating { background: #FFF3CD; color: #856404; }
        .incident-status.identified { background: #F8D7DA; color: #721C24; }
        .incident-status.monitoring { background: #D4EDDA; color: #155724; }
        .incident-status.resolved { background: #CCE5FF; color: #004085; }

        .subscription-form {
            display: flex;
            gap: 12px;
            max-width: 400px;
            margin: 20px auto 0;
        }

        .subscription-form input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 1rem;
            background: var(--surface-color);
            color: var(--text-primary);
        }

        .subscription-form button {
            padding: 12px 24px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s ease;
        }

        .subscription-form button:hover {
            opacity: 0.9;
        }

        .status-footer {
            background: var(--surface-color);
            border-top: 1px solid var(--border-color);
            padding: 40px 0;
            text-align: center;
            color: var(--text-secondary);
        }

        .powered-by {
            margin-top: 10px;
        }

        .powered-by a {
            color: var(--primary-color);
            text-decoration: none;
        }

        .last-updated {
            margin-top: 20px;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .status-title {
                font-size: 2rem;
            }
            
            .status-indicator {
                flex-direction: column;
            }
            
            .monitor-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            
            .subscription-form {
                flex-direction: column;
            }
        }
    `;
  }

  // Helper methods for status page generation
  private async queryStatusPageBySlugOrDomain(slugOrDomain: string): Promise<StatusPage | null> {
    try {
      const { default: db } = await import('../db.js');
      const res = await db.query?.(
        `SELECT * FROM nova_status_pages WHERE slug = $1 OR domain_name = $1 LIMIT 1`,
        [slugOrDomain]
      );
      if (res?.rows && res.rows.length > 0) {
        return res.rows[0] as unknown as StatusPage;
      }
      return null;
    } catch (error: any) {
      logger.warn('Status page lookup fallback (db unavailable)', { error: error.message });
      return null;
    }
  }

  private async calculateUptime(statusPageId: string, days: number): Promise<number> {
    try {
      const { default: db } = await import('../db.js');
      const res = await db.query?.(
        `SELECT AVG(CASE WHEN is_up THEN 100.0 ELSE 0.0 END) AS uptime
         FROM nova_monitor_summary sms
         JOIN nova_status_page_monitors spm ON spm.monitor_id = sms.id
         WHERE spm.status_page_id = $1
           AND sms.last_check_time >= NOW() - ($2 || ' days')::INTERVAL`,
        [statusPageId, days]
      );
      const value = parseFloat(res?.rows?.[0]?.uptime ?? '0');
      return isFinite(value) ? value : 0;
    } catch (error: any) {
      logger.warn('Uptime calculation fallback (db unavailable)', { error: error.message });
      return 0;
    }
  }

  private calculateOverallStatus(monitors: any[]): any {
    const downCount = monitors.filter(m => m.status === 'down').length;
    const degradedCount = monitors.filter(m => m.status === 'degraded').length;
    
    if (downCount > 0) {
      return {
        class: 'down',
        icon: '🔴',
        title: 'Major Service Outage',
        message: `${downCount} service${downCount > 1 ? 's are' : ' is'} currently down`
      };
    } else if (degradedCount > 0) {
      return {
        class: 'degraded',
        icon: '🟡',
        title: 'Degraded Performance',
        message: `${degradedCount} service${degradedCount > 1 ? 's are' : ' is'} experiencing issues`
      };
    } else {
      return {
        class: 'operational',
        icon: '🟢',
        title: 'All Systems Operational',
        message: 'All services are running normally'
      };
    }
  }

  private groupMonitorsByStatus(monitors: any[]): any {
    return {
      operational: monitors.filter(m => m.status === 'operational'),
      degraded: monitors.filter(m => m.status === 'degraded'),
      down: monitors.filter(m => m.status === 'down'),
      maintenance: monitors.filter(m => m.status === 'maintenance')
    };
  }

  private generateMonitorGroupHTML(title: string, monitors: any[], status: string): string {
    return `
      <div class="monitor-group">
        <h3>${title}</h3>
        <div class="monitor-list">
          ${monitors.map(monitor => `
            <div class="monitor-item">
              <div class="monitor-info">
                <div class="monitor-status ${status}"></div>
                <span class="monitor-name">${monitor.display_name || monitor.name}</span>
              </div>
              <div class="monitor-metrics">
                ${monitor.uptime ? `<span>Uptime: ${monitor.uptime}%</span>` : ''}
                ${monitor.response_time ? `<span>Response: ${monitor.response_time}ms</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private generateIncidentsHTML(incidents: StatusPageIncident[], title: string): string {
    return `
      <section class="incidents-section">
        <div class="container">
          <h2>${title}</h2>
          ${incidents.map(incident => `
            <div class="incident-item">
              <div class="incident-header">
                <h3 class="incident-title">${incident.title}</h3>
                <span class="incident-status ${incident.status}">${incident.status}</span>
              </div>
              <p class="incident-content">${incident.content}</p>
              <p class="incident-time">${new Date(incident.created_at).toLocaleString()}</p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  private generateGoogleAnalytics(gaId: string): string {
    return `
      <!-- Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      </script>
    `;
  }

  /**
   * Generate status badge SVG
   */
  async generateStatusBadge(badge: StatusPageBadge, monitorStatus: string, uptime?: number): Promise<string> {
    const colors = {
      up: badge.color_up || '#4c1',
      down: badge.color_down || '#e05d44',
      pending: badge.color_pending || '#dfb317'
    };

    const color = monitorStatus === 'up' ? colors.up : 
                  monitorStatus === 'down' ? colors.down : colors.pending;

    const label = badge.label || 'status';
    let message = '';

    switch (badge.style) {
      case 'uptime':
        message = uptime ? `${uptime.toFixed(1)}%` : 'unknown';
        break;
      case 'status':
        message = monitorStatus;
        break;
      case 'response-time':
        message = '< 100ms'; // This would be calculated from actual data
        break;
    }

    // Generate SVG badge (simplified version)
    const width = label.length * 7 + message.length * 7 + 20;
    const labelWidth = label.length * 7 + 10;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
        <linearGradient id="b" x2="0" y2="100%">
          <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
          <stop offset="1" stop-opacity=".1"/>
        </linearGradient>
        <mask id="a">
          <rect width="${width}" height="20" rx="3" fill="#fff"/>
        </mask>
        <g mask="url(#a)">
          <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
          <path fill="${color}" d="M${labelWidth} 0h${width - labelWidth}v20H${labelWidth}z"/>
          <path fill="url(#b)" d="M0 0h${width}v20H0z"/>
        </g>
        <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
          <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
          <text x="${labelWidth / 2}" y="14">${label}</text>
          <text x="${labelWidth + (width - labelWidth) / 2}" y="15" fill="#010101" fill-opacity=".3">${message}</text>
          <text x="${labelWidth + (width - labelWidth) / 2}" y="14">${message}</text>
        </g>
      </svg>
    `;
  }
}

export const statusPageService = new StatusPageService();
