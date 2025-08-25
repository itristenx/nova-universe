// Nova Sentinel - Uptime Kuma Integration Layer
// Handles communication with Uptime Kuma headless monitoring backend

import axios from 'axios';

/**
 * Uptime Kuma client for Nova integration
 */
export class UptimeKumaClient {
  constructor(baseUrl = process.env.KUMA_URL || 'http://localhost:3001', apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
    });
  }

  async getMonitors() {
    try {
      const response = await this.axios.get('/api/getMonitorList');
      if (response.data.ok) {
        return Object.values(response.data.monitorList || {}).map((monitor) =>
          this.transformMonitor(monitor),
        );
      }
      throw new Error('Failed to fetch monitors');
    } catch (error) {
      console.error('Error fetching monitors:', error.message);
      return [];
    }
  }

  async createMonitor(monitor) {
    try {
      const response = await this.axios.post('/api/add', {
        type: monitor.type,
        name: monitor.name,
        url: monitor.url,
        hostname: monitor.hostname,
        port: monitor.port,
        interval: monitor.interval || 60,
        timeout: monitor.timeout || 30,
        active: monitor.active !== false,
        tags: monitor.tags || [],
      });

      if (response.data.ok) {
        return this.transformMonitor(response.data.monitor);
      }
      throw new Error(response.data.msg || 'Failed to create monitor');
    } catch (error) {
      console.error('Error creating monitor:', error.message);
      throw error;
    }
  }

  async updateMonitor(id, updates) {
    try {
      const response = await this.axios.post('/api/editMonitor', {
        id,
        ...updates,
      });

      if (response.data.ok) {
        return this.transformMonitor(response.data.monitor);
      }
      throw new Error(response.data.msg || 'Failed to update monitor');
    } catch (error) {
      console.error('Error updating monitor:', error.message);
      throw error;
    }
  }

  async deleteMonitor(id) {
    try {
      const response = await this.axios.post('/api/deleteMonitor', { id });
      if (!response.data.ok) {
        throw new Error(response.data.msg || 'Failed to delete monitor');
      }
    } catch (error) {
      console.error('Error deleting monitor:', error.message);
      throw error;
    }
  }

  async getMonitorStatus(id) {
    try {
      const response = await this.axios.get(`/api/getMonitor/${id}`);
      if (response.data.ok) {
        return this.transformStatus(response.data);
      }
      throw new Error('Failed to fetch monitor status');
    } catch (error) {
      console.error('Error fetching monitor status:', error.message);
      return { status: 'error', uptime: 0 };
    }
  }

  async getHeartbeats(monitorId, hours = 24) {
    try {
      const response = await this.axios.get(`/api/getMonitorBeats/${monitorId}/${hours}`);
      if (response.data.ok) {
        return response.data.data.map((beat) => this.transformHeartbeat(beat));
      }
      return [];
    } catch (error) {
      console.error('Error fetching heartbeats:', error.message);
      return [];
    }
  }

  async getSystemInfo() {
    try {
      const response = await this.axios.get('/api/info');
      if (response.data.ok) {
        return response.data;
      }
      return { version: 'unknown', isConnected: false };
    } catch (error) {
      console.error('Error fetching system info:', error.message);
      return { version: 'unknown', isConnected: false };
    }
  }

  // Transformation helpers to convert Kuma data to Nova format
  transformMonitor(kumaMonitor) {
    return {
      id: kumaMonitor.id,
      name: kumaMonitor.name,
      type: kumaMonitor.type,
      url: kumaMonitor.url,
      hostname: kumaMonitor.hostname,
      port: kumaMonitor.port,
      interval: kumaMonitor.interval,
      timeout: kumaMonitor.timeout,
      active: kumaMonitor.active,
      tags: kumaMonitor.tags || [],
      status: kumaMonitor.active ? 'up' : 'down',
      uptime: kumaMonitor.uptime || 0,
      responseTime: kumaMonitor.ping || 0,
      lastCheck: kumaMonitor.lastCheck ? new Date(kumaMonitor.lastCheck).toISOString() : null,
      createdAt: kumaMonitor.created_date ? new Date(kumaMonitor.created_date).toISOString() : null,
    };
  }

  transformStatus(kumaData) {
    return {
      status: kumaData.monitor?.active ? 'up' : 'down',
      uptime: kumaData.uptime || 0,
      responseTime: kumaData.ping || 0,
      certExpiry: kumaData.certExpiry || null,
      lastCheck: kumaData.lastCheck ? new Date(kumaData.lastCheck).toISOString() : null,
    };
  }

  transformHeartbeat(kumaHeartbeat) {
    return {
      id: kumaHeartbeat.id,
      monitorId: kumaHeartbeat.monitor_id,
      status: kumaHeartbeat.status,
      responseTime: kumaHeartbeat.ping || 0,
      message: kumaHeartbeat.msg || '',
      timestamp: kumaHeartbeat.time ? new Date(kumaHeartbeat.time).toISOString() : null,
    };
  }
}

// Create and export default client instance
export const uptimeKumaClient = new UptimeKumaClient();

// Export Nova-compatible monitor management functions
export async function getNovaMonitors() {
  const monitors = await uptimeKumaClient.getMonitors();
  return monitors.map((monitor) => ({
    ...monitor,
    source: 'uptime-kuma',
    managedBy: 'nova',
  }));
}

export async function createNovaMonitor(monitorData) {
  const monitor = await uptimeKumaClient.createMonitor(monitorData);
  return {
    ...monitor,
    source: 'uptime-kuma',
    managedBy: 'nova',
  };
}

export async function updateNovaMonitor(id, updates) {
  const monitor = await uptimeKumaClient.updateMonitor(id, updates);
  return {
    ...monitor,
    source: 'uptime-kuma',
    managedBy: 'nova',
  };
}

export async function deleteNovaMonitor(id) {
  return await uptimeKumaClient.deleteMonitor(id);
}

export async function getNovaMonitorStatus(id) {
  const status = await uptimeKumaClient.getMonitorStatus(id);
  return {
    ...status,
    source: 'uptime-kuma',
    managedBy: 'nova',
  };
}

export async function getNovaSystemHealth() {
  const info = await uptimeKumaClient.getSystemInfo();
  const monitors = await getNovaMonitors();

  const totalMonitors = monitors.length;
  const activeMonitors = monitors.filter((m) => m.active).length;
  const upMonitors = monitors.filter((m) => m.status === 'up').length;

  return {
    service: 'uptime-kuma',
    version: info.version,
    isConnected: info.isConnected !== false,
    totalMonitors,
    activeMonitors,
    upMonitors,
    downMonitors: activeMonitors - upMonitors,
    uptime: totalMonitors > 0 ? (upMonitors / totalMonitors) * 100 : 100,
  };
}

export default UptimeKumaClient;
