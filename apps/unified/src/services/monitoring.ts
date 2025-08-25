import { apiClient } from './api';
import type { PaginatedResponse } from '@/types';

// Monitoring Types
export interface Monitor {
  id: string;
  name: string;
  type: MonitorType;
  status: MonitorStatus;
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  expectedStatus?: number[];
  expectedResponse?: string;
  timeout: number;
  interval: number;
  retryAttempts: number;
  tags: string[];
  description?: string;
  isActive: boolean;
  lastChecked?: string;
  nextCheck?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorResult {
  id: string;
  monitorId: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode?: number;
  error?: string;
  message?: string;
  checkedAt: string;
}

export interface Alert {
  id: string;
  monitorId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  data?: Record<string, any>;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusPage {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  customDomain?: string;
  logoUrl?: string;
  theme: 'light' | 'dark' | 'auto';
  monitors: string[];
  incidents: Incident[];
  maintenances: Maintenance[];
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  statusPageId: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  affectedMonitors: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Maintenance {
  id: string;
  statusPageId: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  startTime: string;
  endTime: string;
  affectedMonitors: string[];
  createdAt: string;
  updatedAt: string;
}

export type MonitorType =
  | 'http'
  | 'https'
  | 'tcp'
  | 'ping'
  | 'dns'
  | 'ssl'
  | 'database'
  | 'api'
  | 'websocket';

export type MonitorStatus = 'up' | 'down' | 'degraded' | 'maintenance' | 'unknown';
export type AlertType = 'down' | 'slow_response' | 'ssl_expiry' | 'high_error_rate' | 'custom';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface MonitorFilters {
  type?: MonitorType[];
  status?: MonitorStatus[];
  tags?: string[];
  isActive?: boolean;
}

export interface MonitorStats {
  total: number;
  up: number;
  down: number;
  degraded: number;
  maintenance: number;
  averageResponseTime: number;
  uptime: number;
  incidents24h: number;
}

// Monitoring Service
export const monitoringService = {
  // Monitor CRUD operations
  async getMonitors(filters?: MonitorFilters): Promise<PaginatedResponse<Monitor>> {
    const params = new URLSearchParams();

    if (filters?.type) {
      filters.type.forEach((type) => params.append('type', type));
    }
    if (filters?.status) {
      filters.status.forEach((status) => params.append('status', status));
    }
    if (filters?.tags) {
      filters.tags.forEach((tag) => params.append('tag', tag));
    }
    if (filters?.isActive !== undefined) {
      params.append('active', filters.isActive.toString());
    }

    return await apiClient.getPaginated<Monitor>(
      '/v1/monitoring/monitors',
      Object.fromEntries(params),
    );
  },

  async getMonitor(id: string): Promise<Monitor> {
    const response = await apiClient.get<Monitor>(`/v1/monitoring/monitors/${id}`);
    return response.data!;
  },

  async createMonitor(data: Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Monitor> {
    const response = await apiClient.post<Monitor>('/v1/monitoring/monitors', data);
    return response.data!;
  },

  async updateMonitor(id: string, data: Partial<Monitor>): Promise<Monitor> {
    const response = await apiClient.patch<Monitor>(`/v1/monitoring/monitors/${id}`, data);
    return response.data!;
  },

  async deleteMonitor(id: string): Promise<void> {
    await apiClient.delete(`/v1/monitoring/monitors/${id}`);
  },

  async pauseMonitor(id: string): Promise<void> {
    await apiClient.post(`/v1/monitoring/monitors/${id}/pause`);
  },

  async resumeMonitor(id: string): Promise<void> {
    await apiClient.post(`/v1/monitoring/monitors/${id}/resume`);
  },

  async testMonitor(id: string): Promise<MonitorResult> {
    const response = await apiClient.post<MonitorResult>(`/v1/monitoring/monitors/${id}/test`);
    return response.data!;
  },

  // Monitor results and history
  async getMonitorResults(
    monitorId: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
  ): Promise<MonitorResult[]> {
    const response = await apiClient.get<MonitorResult[]>(
      `/v1/monitoring/monitors/${monitorId}/results`,
      {
        params: { timeRange },
      },
    );
    return response.data!;
  },

  async getMonitorUptime(
    monitorId: string,
    timeRange: '24h' | '7d' | '30d' | '90d' = '30d',
  ): Promise<{
    uptime: number;
    totalChecks: number;
    successfulChecks: number;
    averageResponseTime: number;
  }> {
    const response = await apiClient.get<{
      uptime: number;
      totalChecks: number;
      successfulChecks: number;
      averageResponseTime: number;
    }>(`/v1/monitoring/monitors/${monitorId}/uptime`, {
      params: { timeRange },
    });
    return response.data!;
  },

  // Alerts
  async getAlerts(monitorId?: string): Promise<PaginatedResponse<Alert>> {
    const params = monitorId ? { monitorId } : {};
    return await apiClient.getPaginated<Alert>('/v1/monitoring/alerts', params);
  },

  async acknowledgeAlert(id: string): Promise<void> {
    await apiClient.post(`/v1/monitoring/alerts/${id}/acknowledge`);
  },

  async resolveAlert(id: string): Promise<void> {
    await apiClient.post(`/v1/monitoring/alerts/${id}/resolve`);
  },

  // System health and statistics
  async getSystemHealth(): Promise<{
    overall: MonitorStatus;
    monitors: MonitorStats;
    services: Array<{
      name: string;
      status: MonitorStatus;
      responseTime?: number;
      lastChecked: string;
    }>;
    performance: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
  }> {
    const response = await apiClient.get<{
      overall: MonitorStatus;
      monitors: MonitorStats;
      services: Array<{
        name: string;
        status: MonitorStatus;
        responseTime?: number;
        lastChecked: string;
      }>;
      performance: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
      };
    }>('/v1/monitoring/health');
    return response.data!;
  },

  async getStats(): Promise<MonitorStats> {
    const response = await apiClient.get<MonitorStats>('/v1/monitoring/stats');
    return response.data!;
  },

  // Status pages
  async getStatusPages(): Promise<StatusPage[]> {
    const response = await apiClient.get<StatusPage[]>('/v1/monitoring/status-pages');
    return response.data!;
  },

  async getStatusPage(slug: string): Promise<StatusPage> {
    const response = await apiClient.get<StatusPage>(`/v1/monitoring/status-pages/${slug}`);
    return response.data!;
  },

  async createStatusPage(
    data: Omit<StatusPage, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StatusPage> {
    const response = await apiClient.post<StatusPage>('/v1/monitoring/status-pages', data);
    return response.data!;
  },

  async updateStatusPage(id: string, data: Partial<StatusPage>): Promise<StatusPage> {
    const response = await apiClient.patch<StatusPage>(`/v1/monitoring/status-pages/${id}`, data);
    return response.data!;
  },

  async deleteStatusPage(id: string): Promise<void> {
    await apiClient.delete(`/v1/monitoring/status-pages/${id}`);
  },

  // Incidents
  async createIncident(data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const response = await apiClient.post<Incident>('/v1/monitoring/incidents', data);
    return response.data!;
  },

  async updateIncident(id: string, data: Partial<Incident>): Promise<Incident> {
    const response = await apiClient.patch<Incident>(`/v1/monitoring/incidents/${id}`, data);
    return response.data!;
  },

  async resolveIncident(id: string): Promise<void> {
    await apiClient.post(`/v1/monitoring/incidents/${id}/resolve`);
  },

  // Maintenance windows
  async createMaintenance(
    data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Maintenance> {
    const response = await apiClient.post<Maintenance>('/v1/monitoring/maintenance', data);
    return response.data!;
  },

  async updateMaintenance(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
    const response = await apiClient.patch<Maintenance>(`/v1/monitoring/maintenance/${id}`, data);
    return response.data!;
  },

  async startMaintenance(id: string): Promise<void> {
    await apiClient.post(`/v1/monitoring/maintenance/${id}/start`);
  },

  async completeMaintenance(id: string): Promise<void> {
    await apiClient.post(`/v1/monitoring/maintenance/${id}/complete`);
  },

  // Real-time monitoring
  async subscribeToMonitorEvents(
    callback: (event: {
      type: 'monitor_up' | 'monitor_down' | 'alert_created' | 'alert_resolved';
      data: Monitor | Alert;
    }) => void,
  ): Promise<() => void> {
    // WebSocket connection for real-time monitoring events
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/monitoring`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const monitorEvent = JSON.parse(event.data);
        callback(monitorEvent);
      } catch (_error) {
        console.error('Failed to parse monitoring event:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Return cleanup function
    return () => {
      ws.close();
    };
  },
};

export default monitoringService;
