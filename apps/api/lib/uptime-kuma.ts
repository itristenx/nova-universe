// Nova Sentinel - Uptime Kuma Integration Layer
// Handles communication with Uptime Kuma headless monitoring backend

import axios from 'axios';

export interface KumaMonitor {
  id: number;
  name: string;
  type: string;
  url?: string;
  hostname?: string;
  port?: number;
  interval: number;
  timeout: number;
  active: boolean;
  tags: string[];
}

export interface KumaHeartbeat {
  id: number;
  monitor_id: number;
  status: boolean;
  time: string;
  msg: string;
  important: boolean;
  duration: number;
  down_count: number;
  up_count: number;
}

export interface KumaStatus {
  ok: boolean;
  monitor: KumaMonitor;
  heartbeat: KumaHeartbeat;
}

export interface KumaUptimeData {
  monitor_id: number;
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  avg_response_time: number;
  total_down_time: number;
}

export class UptimeKumaClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = process.env.KUMA_URL || 'http://localhost:3001', apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey || process.env.KUMA_API_KEY;
  }

  /**
   * Get all monitors from Uptime Kuma
   */
  async getMonitors(): Promise<KumaMonitor[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/monitor`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data.monitors || [];
    } catch (error) {
      console.error('Failed to fetch monitors from Kuma:', error);
      throw new Error('Unable to connect to monitoring service');
    }
  }

  /**
   * Create a new monitor in Uptime Kuma
   */
  async createMonitor(monitor: Partial<KumaMonitor>): Promise<KumaMonitor> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/monitor`, monitor, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data.monitor;
    } catch (error) {
      console.error('Failed to create monitor in Kuma:', error);
      throw new Error('Failed to create monitor');
    }
  }

  /**
   * Update an existing monitor in Uptime Kuma
   */
  async updateMonitor(id: number, updates: Partial<KumaMonitor>): Promise<KumaMonitor> {
    try {
      const response = await axios.put(`${this.baseUrl}/api/monitor/${id}`, updates, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data.monitor;
    } catch (error) {
      console.error('Failed to update monitor in Kuma:', error);
      throw new Error('Failed to update monitor');
    }
  }

  /**
   * Delete a monitor from Uptime Kuma
   */
  async deleteMonitor(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/api/monitor/${id}`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
    } catch (error) {
      console.error('Failed to delete monitor in Kuma:', error);
      throw new Error('Failed to delete monitor');
    }
  }

  /**
   * Get monitor status and latest heartbeat
   */
  async getMonitorStatus(id: number): Promise<KumaStatus> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/monitor/${id}/status`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get monitor status from Kuma:', error);
      throw new Error('Failed to get monitor status');
    }
  }

  /**
   * Get heartbeat history for a monitor
   */
  async getHeartbeats(monitorId: number, limit: number = 100): Promise<KumaHeartbeat[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/monitor/${monitorId}/heartbeats`, {
        params: { limit },
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data.heartbeats || [];
    } catch (error) {
      console.error('Failed to get heartbeats from Kuma:', error);
      return [];
    }
  }

  /**
   * Get uptime statistics for a monitor
   */
  async getUptimeStats(monitorId: number): Promise<KumaUptimeData> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/monitor/${monitorId}/uptime`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get uptime stats from Kuma:', error);
      throw new Error('Failed to get uptime statistics');
    }
  }

  /**
   * Pause a monitor
   */
  async pauseMonitor(id: number): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/api/monitor/${id}/pause`,
        {},
        {
          headers: this.getHeaders(),
          timeout: 10000,
        },
      );
    } catch (error) {
      console.error('Failed to pause monitor in Kuma:', error);
      throw new Error('Failed to pause monitor');
    }
  }

  /**
   * Resume a monitor
   */
  async resumeMonitor(id: number): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/api/monitor/${id}/resume`,
        {},
        {
          headers: this.getHeaders(),
          timeout: 10000,
        },
      );
    } catch (error) {
      console.error('Failed to resume monitor in Kuma:', error);
      throw new Error('Failed to resume monitor');
    }
  }

  /**
   * Test connection to Uptime Kuma
   */
  async ping(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/ping`, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return response.data.ok === true;
    } catch (error) {
      console.error('Kuma ping failed:', error);
      return false;
    }
  }

  /**
   * Get server info and statistics
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/info`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get server info from Kuma:', error);
      throw new Error('Failed to get server information');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Nova-Sentinel/1.0',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}

// Singleton instance for use throughout the application
export const kumaClient = new UptimeKumaClient();

/**
 * Sync Nova Sentinel monitors with Uptime Kuma
 */
export async function syncMonitorWithKuma(monitor: any): Promise<void> {
  try {
    if (monitor.kuma_id) {
      // Update existing monitor in Kuma
      await kumaClient.updateMonitor(monitor.kuma_id, {
        name: monitor.name,
        type: monitor.type,
        url: monitor.url,
        hostname: monitor.hostname,
        port: monitor.port,
        interval: monitor.interval,
        timeout: monitor.timeout,
        active: monitor.status === 'active',
      });
    } else {
      // Create new monitor in Kuma
      const kumaMonitor = await kumaClient.createMonitor({
        name: monitor.name,
        type: monitor.type,
        url: monitor.url,
        hostname: monitor.hostname,
        port: monitor.port,
        interval: monitor.interval,
        timeout: monitor.timeout,
        active: monitor.status === 'active',
      });

      // Update Nova monitor with Kuma ID
      // This would be handled by the API layer
      console.log(`Created Kuma monitor ${kumaMonitor.id} for Nova monitor ${monitor.id}`);
    }
  } catch (error) {
    console.error('Failed to sync monitor with Kuma:', error);
    throw error;
  }
}

/**
 * Pull latest status from Kuma and update Nova monitors
 */
export async function syncStatusFromKuma(): Promise<void> {
  try {
    const kumaMonitors = await kumaClient.getMonitors();

    for (const kumaMonitor of kumaMonitors) {
      try {
        const status = await kumaClient.getMonitorStatus(kumaMonitor.id);
        const uptimeStats = await kumaClient.getUptimeStats(kumaMonitor.id);

        // Update Nova monitor status
        // This would trigger the API to update the database
        console.log(`Syncing status for monitor ${kumaMonitor.id}:`, {
          status: status.heartbeat.status ? 'up' : 'down',
          response_time: status.heartbeat.duration,
          uptime_24h: uptimeStats.uptime_24h,
          uptime_7d: uptimeStats.uptime_7d,
          uptime_30d: uptimeStats.uptime_30d,
          avg_response_time: uptimeStats.avg_response_time,
        });
      } catch (error) {
        console.error(`Failed to sync status for monitor ${kumaMonitor.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync status from Kuma:', error);
    throw error;
  }
}

/**
 * Process webhook from Uptime Kuma
 */
export function processKumaWebhook(payload: any): void {
  try {
    const { monitor, heartbeat, incident } = payload;

    if (incident) {
      // Handle incident creation/update
      console.log('Processing incident from Kuma webhook:', {
        monitor_id: monitor.id,
        status: heartbeat.status ? 'resolved' : 'open',
        severity: monitor.important ? 'critical' : 'medium',
        message: heartbeat.msg,
      });
    } else {
      // Handle status update
      console.log('Processing status update from Kuma webhook:', {
        monitor_id: monitor.id,
        status: heartbeat.status,
        response_time: heartbeat.duration,
        timestamp: heartbeat.time,
      });
    }

    // This would trigger updates to the Nova database
    // and send notifications to subscribers
  } catch (error) {
    console.error('Failed to process Kuma webhook:', error);
  }
}
