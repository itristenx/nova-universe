import { api } from './api';

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  department: string;
  createdBy: string;
  templateId?: string;
  configuration: any;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  template?: Template;
  devices?: Device[];
  content?: Content[];
}

export interface Device {
  id: string;
  name: string;
  location?: string;
  department?: string;
  ipAddress?: string;
  browserInfo?: string;
  deviceFingerprint: string;
  dashboardId?: string;
  lastActiveAt?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  settings: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  dashboard?: Dashboard;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  departmentType?: string;
  templateConfig: any;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdBy?: string;
  previewImageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Content {
  id: string;
  dashboardId: string;
  contentType: string;
  title?: string;
  contentData: any;
  displayOrder?: number;
  isActive: boolean;
  expiresAt?: string;
  scheduledAt?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  sessionId: string;
  qrCode: string;
  sixDigitCode: string;
  expiresAt: string;
}

export interface AuthVerification {
  success: boolean;
  user: any;
  availableDashboards: Dashboard[];
  sessionToken: string;
  dashboardId?: string;
}

export interface DashboardAnalytics {
  viewership: {
    uniqueViews: number;
    averageViewDuration: number;
    peakViewingHours: { start: string; end: string }[];
    departmentBreakdown: Record<string, number>;
  };
  contentEffectiveness: {
    mostEngagingContent: any[];
    leastEngagingContent: any[];
    optimalRefreshIntervals: number[];
    contentTypePerformance: Record<string, any>;
  };
  technicalMetrics: {
    loadTimes: number[];
    errorRates: number;
    devicePerformance: Record<string, any>;
    bandwidthUsage: any;
  };
  aiRecommendations: {
    contentOptimization: string[];
    layoutSuggestions: any[];
    timingRecommendations: any[];
  };
}

class NovaTVService {
  // Dashboard Management
  async getDashboards(filters?: {
    department?: string;
    createdBy?: string;
    isActive?: boolean;
  }): Promise<Dashboard[]> {
    const response = await api.get('/nova-tv/dashboards', { params: filters });
    return response.data;
  }

  async getDashboard(id: string): Promise<Dashboard> {
    const response = await api.get(`/nova-tv/dashboards/${id}`);
    return response.data;
  }

  async createDashboard(
    dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Dashboard> {
    const response = await api.post('/nova-tv/dashboards', dashboard);
    return response.data;
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.put(`/nova-tv/dashboards/${id}`, updates);
    return response.data;
  }

  async deleteDashboard(id: string): Promise<void> {
    await api.delete(`/nova-tv/dashboards/${id}`);
  }

  async duplicateDashboard(id: string, name: string): Promise<Dashboard> {
    const response = await api.post(`/nova-tv/dashboards/${id}/duplicate`, { name });
    return response.data;
  }

  // Device Management
  async getDevices(filters?: {
    department?: string;
    connectionStatus?: string;
    dashboardId?: string;
  }): Promise<Device[]> {
    const response = await api.get('/nova-tv/devices', { params: filters });
    return response.data;
  }

  async getDevice(id: string): Promise<Device> {
    const response = await api.get(`/nova-tv/devices/${id}`);
    return response.data;
  }

  async registerDevice(device: {
    name: string;
    location?: string;
    department?: string;
    deviceFingerprint: string;
    settings?: any;
  }): Promise<Device> {
    const response = await api.post('/nova-tv/devices/register', device);
    return response.data;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device> {
    const response = await api.put(`/nova-tv/devices/${id}`, updates);
    return response.data;
  }

  async revokeDevice(id: string): Promise<void> {
    await api.delete(`/nova-tv/devices/${id}/revoke`);
  }

  async assignDashboard(deviceId: string, dashboardId: string): Promise<Device> {
    const response = await api.post(`/nova-tv/devices/${deviceId}/assign`, { dashboardId });
    return response.data;
  }

  // Authentication
  async generateAuthCode(): Promise<AuthSession> {
    const response = await api.post('/nova-tv/auth/generate-code');
    return response.data;
  }

  async verifyAuthCode(sessionId: string, code: string): Promise<AuthVerification> {
    const response = await api.post('/nova-tv/auth/verify-code', { sessionId, code });
    return response.data;
  }

  async checkAuthStatus(sessionId: string): Promise<{ isVerified: boolean; isExpired: boolean }> {
    const response = await api.get(`/nova-tv/auth/status/${sessionId}`);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post('/nova-tv/auth/refresh', { refreshToken });
    return response.data;
  }

  // Template Management
  async getTemplates(filters?: {
    category?: string;
    departmentType?: string;
    isSystemTemplate?: boolean;
  }): Promise<Template[]> {
    const response = await api.get('/nova-tv/templates', { params: filters });
    return response.data;
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await api.get(`/nova-tv/templates/${id}`);
    return response.data;
  }

  async createTemplate(
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Template> {
    const response = await api.post('/nova-tv/templates', template);
    return response.data;
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const response = await api.put(`/nova-tv/templates/${id}`, updates);
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/nova-tv/templates/${id}`);
  }

  async previewTemplate(id: string, data?: any): Promise<any> {
    const response = await api.get(`/nova-tv/templates/${id}/preview`, { params: data });
    return response.data;
  }

  // Content Management
  async getContent(dashboardId: string): Promise<Content[]> {
    const response = await api.get(`/nova-tv/dashboards/${dashboardId}/content`);
    return response.data;
  }

  async createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content> {
    const response = await api.post('/nova-tv/content', content);
    return response.data;
  }

  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    const response = await api.put(`/nova-tv/content/${id}`, updates);
    return response.data;
  }

  async deleteContent(id: string): Promise<void> {
    await api.delete(`/nova-tv/content/${id}`);
  }

  async reorderContent(dashboardId: string, contentIds: string[]): Promise<Content[]> {
    const response = await api.post(`/nova-tv/dashboards/${dashboardId}/content/reorder`, {
      contentIds,
    });
    return response.data;
  }

  // Analytics
  async getDashboardAnalytics(
    dashboardId: string,
    filters?: {
      timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
      department?: string;
    },
  ): Promise<DashboardAnalytics> {
    const response = await api.get(`/nova-tv/analytics/dashboard/${dashboardId}`, {
      params: filters,
    });
    return response.data;
  }

  async trackEvent(event: {
    dashboardId?: string;
    deviceId?: string;
    sessionId?: string;
    eventType: string;
    eventData?: any;
  }): Promise<void> {
    await api.post('/nova-tv/analytics/events', event);
  }

  async getDeviceAnalytics(deviceId: string, timeRange?: string): Promise<any> {
    const response = await api.get(`/nova-tv/analytics/device/${deviceId}`, {
      params: { timeRange },
    });
    return response.data;
  }

  // Live Data Integration
  async getLiveTicketMetrics(department?: string): Promise<any> {
    const response = await api.get('/nova-tv/live-data/tickets', { params: { department } });
    return response.data;
  }

  async getLiveAssetMetrics(department?: string): Promise<any> {
    const response = await api.get('/nova-tv/live-data/assets', { params: { department } });
    return response.data;
  }

  async getLiveHRMetrics(): Promise<any> {
    const response = await api.get('/nova-tv/live-data/hr');
    return response.data;
  }

  async getLiveSystemHealth(): Promise<any> {
    const response = await api.get('/nova-tv/live-data/system-health');
    return response.data;
  }

  async getLiveAnnouncements(department?: string): Promise<any> {
    const response = await api.get('/nova-tv/live-data/announcements', { params: { department } });
    return response.data;
  }

  // Real-time WebSocket methods (these would connect to socket.io)
  subscribeToUpdates(_dashboardId: string, _callback: (data: any) => void): () => void {
    // Implementation would use socket.io-client
    // WebSocket connection for real-time updates
    // WebSocket connection implementation will be added based on environment configuration
    const unsubscribe = () => {
      // Cleanup WebSocket connection
    };
    return unsubscribe;
  }

  subscribeToDeviceStatus(_deviceId: string, _callback: (status: any) => void): () => void {
    // Implementation would use socket.io-client for real-time device status
    const unsubscribe = () => {
      // Cleanup WebSocket connection
    };
    return unsubscribe;
  }
}

export const novaTVService = new NovaTVService();
