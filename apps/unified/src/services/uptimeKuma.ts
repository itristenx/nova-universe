import { apiClient } from './api';

// Uptime Kuma Monitor Types from Official API
export interface UptimeKumaMonitor {
  id: number;
  name: string;
  type: string;
  url?: string;
  hostname?: string;
  port?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  expectedStatus?: number[];
  expectedResponse?: string;
  timeout: number;
  interval: number;
  retryInterval: number;
  resendInterval: number;
  maxretries: number;
  active: boolean;
  tags: Array<{
    tag_id: number;
    monitor_id: number;
    value?: string;
    name: string;
    color: string;
  }>;
  notificationIDList: Record<string, boolean>;
  accepted_statuscodes_json: string;
  conditions: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UptimeKumaHeartbeat {
  monitorID: number;
  status: 0 | 1 | 2 | 3; // 0=DOWN, 1=UP, 2=PENDING, 3=MAINTENANCE
  time: string;
  msg: string;
  ping: number | null;
  important: boolean;
  duration: number;
  localDateTime: string;
  timezone: string;
  retries: number;
  downCount: number;
}

export interface UptimeKumaStatus {
  ok: boolean;
  monitor: UptimeKumaMonitor;
  heartbeat: UptimeKumaHeartbeat;
}

export interface UptimeKumaServerInfo {
  version: string;
  latestVersion: string;
  primaryBaseURL: string;
  serverTimezone: string;
}

export interface UptimeKumaUptimeData {
  monitor_id: number;
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  avg_response_time: number;
  total_down_time: number;
}

export interface UptimeKumaNotification {
  id: number;
  name: string;
  active: boolean;
  isDefault: boolean;
  userID: number;
  config: string; // JSON string containing provider config
}

export interface UptimeKumaTag {
  id: number;
  name: string;
  color: string;
  created_date: string;
  modified_date: string;
}

export interface UptimeKumaStatusPage {
  id: number;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  theme: 'light' | 'dark' | 'auto';
  published: boolean;
  showTags: boolean;
  domainNameList: string[];
  customCSS: string;
  footerText?: string;
  showPoweredBy: boolean;
  googleAnalyticsId?: string;
}

export interface UptimeKumaMaintenance {
  id: number;
  title: string;
  description: string;
  strategy:
    | 'single'
    | 'recurring-interval'
    | 'recurring-weekday'
    | 'recurring-day-of-month'
    | 'manual'
    | 'cron';
  active: boolean;
  status: 'scheduled' | 'under-maintenance' | 'ended' | 'inactive';
  timeslotList: Array<{
    startDate: string;
    endDate: string;
  }>;
  timezone: string;
  weekdays?: number[];
  daysOfMonth?: number[];
  intervalDay?: number;
  cron?: string;
}

export interface UptimeKumaIncident {
  id: number;
  title: string;
  content: string;
  style: 'info' | 'warning' | 'danger' | 'primary' | 'light' | 'dark';
  createdDate: string;
  lastUpdatedDate: string;
  pin: boolean;
}

// Nova-compatible interfaces (transformation layer)
export interface NovaMonitor {
  id: string;
  name: string;
  type: string;
  status: 'up' | 'down' | 'degraded' | 'maintenance' | 'unknown';
  url?: string;
  hostname?: string;
  port?: number;
  method?: string;
  interval: number;
  timeout: number;
  isActive: boolean;
  tags: string[];
  description?: string;
  uptime24h?: number;
  uptime7d?: number;
  uptime30d?: number;
  averageResponseTime?: number;
  lastChecked?: string;
  nextCheck?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NovaHeartbeat {
  id: string;
  monitorId: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode?: number;
  error?: string;
  message?: string;
  checkedAt: string;
}

export interface NovaSystemHealth {
  overall: 'up' | 'down' | 'degraded';
  monitors: {
    total: number;
    up: number;
    down: number;
    degraded: number;
    maintenance: number;
    averageResponseTime: number;
    uptime: number;
  };
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    lastChecked: string;
  }>;
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

// Uptime Kuma Service - Direct Integration with Backend
export const uptimeKumaService = {
  // Monitor Management
  async getMonitors(): Promise<NovaMonitor[]> {
    const response = await apiClient.get<UptimeKumaMonitor[]>('/v1/uptime-kuma/monitors');
    return response.data!.map(transformUptimeKumaMonitor);
  },

  async getMonitor(id: string): Promise<NovaMonitor> {
    const response = await apiClient.get<UptimeKumaMonitor>(`/v1/uptime-kuma/monitors/${id}`);
    return transformUptimeKumaMonitor(response.data!);
  },

  async createMonitor(
    monitor: Omit<
      NovaMonitor,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'status'
      | 'uptime24h'
      | 'uptime7d'
      | 'uptime30d'
      | 'averageResponseTime'
    >,
  ): Promise<NovaMonitor> {
    const kumaMonitor = transformNovaMonitorToKuma(monitor);
    const response = await apiClient.post<UptimeKumaMonitor>(
      '/v1/uptime-kuma/monitors',
      kumaMonitor,
    );
    return transformUptimeKumaMonitor(response.data!);
  },

  async updateMonitor(id: string, updates: Partial<NovaMonitor>): Promise<NovaMonitor> {
    const kumaUpdates = transformNovaMonitorToKuma(updates);
    const response = await apiClient.patch<UptimeKumaMonitor>(
      `/v1/uptime-kuma/monitors/${id}`,
      kumaUpdates,
    );
    return transformUptimeKumaMonitor(response.data!);
  },

  async deleteMonitor(id: string): Promise<void> {
    await apiClient.delete(`/v1/uptime-kuma/monitors/${id}`);
  },

  async pauseMonitor(id: string): Promise<void> {
    await apiClient.post(`/v1/uptime-kuma/monitors/${id}/pause`);
  },

  async resumeMonitor(id: string): Promise<void> {
    await apiClient.post(`/v1/uptime-kuma/monitors/${id}/resume`);
  },

  async testMonitor(id: string): Promise<NovaHeartbeat> {
    const response = await apiClient.post<UptimeKumaHeartbeat>(
      `/v1/uptime-kuma/monitors/${id}/test`,
    );
    return transformUptimeKumaHeartbeat(response.data!);
  },

  // Monitor Data & Analytics
  async getMonitorHeartbeats(
    monitorId: string,
    period: '1h' | '24h' | '7d' | '30d' = '24h',
  ): Promise<NovaHeartbeat[]> {
    const response = await apiClient.get<UptimeKumaHeartbeat[]>(
      `/v1/uptime-kuma/monitors/${monitorId}/heartbeats`,
      {
        params: { period },
      },
    );
    return response.data!.map(transformUptimeKumaHeartbeat);
  },

  async getMonitorUptime(
    monitorId: string,
    period: '24h' | '7d' | '30d' | '90d' = '30d',
  ): Promise<{
    uptime: number;
    totalChecks: number;
    successfulChecks: number;
    averageResponseTime: number;
  }> {
    const response = await apiClient.get<UptimeKumaUptimeData>(
      `/v1/uptime-kuma/monitors/${monitorId}/uptime`,
      {
        params: { period },
      },
    );

    const data = response.data!;
    return {
      uptime: data.uptime_24h, // Use appropriate period
      totalChecks: 0, // Calculate from heartbeats if needed
      successfulChecks: 0, // Calculate from heartbeats if needed
      averageResponseTime: data.avg_response_time,
    };
  },

  // System Health & Overview
  async getSystemHealth(): Promise<NovaSystemHealth> {
    const response = await apiClient.get<{
      monitors: UptimeKumaMonitor[];
      serverInfo: UptimeKumaServerInfo;
      systemStats: {
        totalMonitors: number;
        upMonitors: number;
        downMonitors: number;
        avgResponseTime: number;
      };
    }>('/v1/uptime-kuma/health');

    const { monitors, systemStats } = response.data!;

    return {
      overall: systemStats.downMonitors > 0 ? 'degraded' : 'up',
      monitors: {
        total: systemStats.totalMonitors,
        up: systemStats.upMonitors,
        down: systemStats.downMonitors,
        degraded: 0, // Calculate if needed
        maintenance: 0, // Calculate if needed
        averageResponseTime: systemStats.avgResponseTime,
        uptime: (systemStats.upMonitors / systemStats.totalMonitors) * 100,
      },
      services: monitors.slice(0, 5).map((monitor) => ({
        name: monitor.name,
        status: monitor.active ? 'up' : ('down' as any),
        responseTime: 0, // Get from latest heartbeat
        lastChecked: monitor.updatedAt || new Date().toISOString(),
      })),
      performance: {
        cpu: 0, // Get from API response
        memory: 0,
        disk: 0,
        network: 0,
      },
    };
  },

  // Tags Management
  async getTags(): Promise<Array<{ id: string; name: string; color: string; count: number }>> {
    const response = await apiClient.get<UptimeKumaTag[]>('/v1/uptime-kuma/tags');
    return response.data!.map((tag) => ({
      id: tag.id.toString(),
      name: tag.name,
      color: tag.color,
      count: 0, // Calculate from monitors if needed
    }));
  },

  async createTag(
    name: string,
    color: string,
  ): Promise<{ id: string; name: string; color: string }> {
    const response = await apiClient.post<UptimeKumaTag>('/v1/uptime-kuma/tags', { name, color });
    const tag = response.data!;
    return {
      id: tag.id.toString(),
      name: tag.name,
      color: tag.color,
    };
  },

  // Notifications Management
  async getNotifications(): Promise<
    Array<{
      id: string;
      name: string;
      type: string;
      isActive: boolean;
      isDefault: boolean;
    }>
  > {
    const response = await apiClient.get<UptimeKumaNotification[]>('/v1/uptime-kuma/notifications');
    return response.data!.map((notification) => {
      const config = JSON.parse(notification.config);
      return {
        id: notification.id.toString(),
        name: notification.name,
        type: config.type || 'unknown',
        isActive: notification.active,
        isDefault: notification.isDefault,
      };
    });
  },

  // Status Pages
  async getStatusPages(): Promise<
    Array<{
      id: string;
      slug: string;
      title: string;
      description?: string;
      isPublic: boolean;
      theme: string;
    }>
  > {
    const response = await apiClient.get<UptimeKumaStatusPage[]>('/v1/uptime-kuma/status-pages');
    return response.data!.map((page) => ({
      id: page.id.toString(),
      slug: page.slug,
      title: page.title,
      description: page.description,
      isPublic: page.published,
      theme: page.theme,
    }));
  },

  // Real-time Events
  async subscribeToEvents(
    callback: (event: {
      type: 'monitor_up' | 'monitor_down' | 'heartbeat' | 'monitor_created' | 'monitor_updated';
      data: any;
    }) => void,
  ): Promise<() => void> {
    // WebSocket connection for real-time Uptime Kuma events
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/uptime-kuma`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const kumaEvent = JSON.parse(event.data);

        // Transform Uptime Kuma events to Nova format
        let transformedEvent;
        switch (kumaEvent.type) {
          case 'heartbeat':
            transformedEvent = {
              type: kumaEvent.data.status === 1 ? 'monitor_up' : 'monitor_down',
              data: transformUptimeKumaHeartbeat(kumaEvent.data),
            };
            break;
          case 'monitor':
            transformedEvent = {
              type: 'monitor_updated',
              data: transformUptimeKumaMonitor(kumaEvent.data),
            };
            break;
          default:
            transformedEvent = kumaEvent;
        }

        callback(transformedEvent);
      } catch (_error) {
        console.error('Failed to parse Uptime Kuma event:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Uptime Kuma WebSocket error:', error);
    };

    // Return cleanup function
    return () => {
      ws.close();
    };
  },
};

// Transformation functions
function transformUptimeKumaMonitor(kumaMonitor: UptimeKumaMonitor): NovaMonitor {
  let status: NovaMonitor['status'] = 'unknown';

  // Transform status based on monitor's active state and recent heartbeats
  if (!kumaMonitor.active) {
    status = 'maintenance';
  }
  // Status would be determined by latest heartbeat in a real implementation

  return {
    id: kumaMonitor.id.toString(),
    name: kumaMonitor.name,
    type: kumaMonitor.type,
    status,
    url: kumaMonitor.url,
    hostname: kumaMonitor.hostname,
    port: kumaMonitor.port,
    method: kumaMonitor.method,
    interval: kumaMonitor.interval,
    timeout: kumaMonitor.timeout,
    isActive: kumaMonitor.active,
    tags: kumaMonitor.tags?.map((tag) => tag.name) || [],
    description: '', // Not directly available in Kuma
    createdAt: kumaMonitor.createdAt || new Date().toISOString(),
    updatedAt: kumaMonitor.updatedAt || new Date().toISOString(),
  };
}

function transformNovaMonitorToKuma(novaMonitor: Partial<NovaMonitor>): Partial<UptimeKumaMonitor> {
  return {
    name: novaMonitor.name,
    type: novaMonitor.type,
    url: novaMonitor.url,
    hostname: novaMonitor.hostname,
    port: novaMonitor.port,
    method: novaMonitor.method as any,
    interval: novaMonitor.interval,
    timeout: novaMonitor.timeout,
    active: novaMonitor.isActive,
    // Tags would need to be handled separately in the API layer
  };
}

function transformUptimeKumaHeartbeat(kumaHeartbeat: UptimeKumaHeartbeat): NovaHeartbeat {
  let status: NovaHeartbeat['status'];
  switch (kumaHeartbeat.status) {
    case 1:
      status = 'up';
      break;
    case 0:
      status = 'down';
      break;
    case 2:
      status = 'degraded'; // PENDING
      break;
    case 3:
      status = 'up'; // MAINTENANCE - treat as up in Nova
      break;
    default:
      status = 'down';
  }

  return {
    id: `${kumaHeartbeat.monitorID}-${Date.now()}`,
    monitorId: kumaHeartbeat.monitorID.toString(),
    status,
    responseTime: kumaHeartbeat.ping || 0,
    statusCode: undefined, // Not available in Kuma heartbeat
    error: kumaHeartbeat.status === 0 ? kumaHeartbeat.msg : undefined,
    message: kumaHeartbeat.msg,
    checkedAt: kumaHeartbeat.time,
  };
}

export default uptimeKumaService;
