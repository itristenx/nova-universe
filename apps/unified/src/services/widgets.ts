import { apiClient } from './api';
import type {
  Widget,
  DashboardLayout,
  DashboardTemplate,
  DashboardStats,
  RealTimeEvent,
  CollaborationEvent,
  UserPresence,
} from '../types/dashboard';

class WidgetService {
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<string, Set<(event: RealTimeEvent) => void>> = new Map();
  private collaborationHandlers: Set<(event: CollaborationEvent) => void> = new Set();
  private presenceHandlers: Set<(users: UserPresence[]) => void> = new Set();

  // Widget Management
  async getWidgets(): Promise<Widget[]> {
    const response = await apiClient.get('/widgets');
    return response.data as Widget[];
  }

  async getWidget(id: string): Promise<Widget> {
    const response = await apiClient.get(`/widgets/${id}`);
    return response.data as Widget;
  }

  async createWidget(widget: Omit<Widget, 'id' | 'lastUpdated'>): Promise<Widget> {
    const response = await apiClient.post('/widgets', widget);
    return response.data as Widget;
  }

  async updateWidget(id: string, updates: Partial<Widget>): Promise<Widget> {
    const response = await apiClient.patch(`/widgets/${id}`, updates);
    return response.data as Widget;
  }

  async deleteWidget(id: string): Promise<void> {
    await apiClient.delete(`/widgets/${id}`);
  }

  async refreshWidget(id: string): Promise<Widget> {
    const response = await apiClient.post(`/widgets/${id}/refresh`);
    return response.data as Widget;
  }

  // Dashboard Layout Management
  async getDashboardLayouts(userId?: string): Promise<DashboardLayout[]> {
    const params = userId ? { userId } : {};
    const response = await apiClient.get('/dashboard/layouts', { params });
    return response.data as DashboardLayout[];
  }

  async getDashboardLayout(id: string): Promise<DashboardLayout> {
    const response = await apiClient.get(`/dashboard/layouts/${id}`);
    return response.data as DashboardLayout;
  }

  async createDashboardLayout(
    layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DashboardLayout> {
    const response = await apiClient.post('/dashboard/layouts', layout);
    return response.data as DashboardLayout;
  }

  async updateDashboardLayout(
    id: string,
    updates: Partial<DashboardLayout>,
  ): Promise<DashboardLayout> {
    const response = await apiClient.patch(`/dashboard/layouts/${id}`, updates);
    return response.data as DashboardLayout;
  }

  async deleteDashboardLayout(id: string): Promise<void> {
    await apiClient.delete(`/dashboard/layouts/${id}`);
  }

  async duplicateDashboardLayout(id: string, name: string): Promise<DashboardLayout> {
    const response = await apiClient.post(`/dashboard/layouts/${id}/duplicate`, { name });
    return response.data as DashboardLayout;
  }

  // Dashboard Templates
  async getDashboardTemplates(category?: string): Promise<DashboardTemplate[]> {
    const params = category ? { category } : {};
    const response = await apiClient.get('/dashboard/templates', { params });
    return response.data as DashboardTemplate[];
  }

  async createDashboardFromTemplate(
    templateId: string,
    name: string,
    userId?: string,
  ): Promise<DashboardLayout> {
    const response = await apiClient.post(`/dashboard/templates/${templateId}/create`, {
      name,
      userId,
    });
    return response.data as DashboardLayout;
  }

  // Dashboard Statistics
  async getDashboardStats(filters?: {
    timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
    department?: string;
    role?: string;
  }): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats', { params: filters });
    return response.data as DashboardStats;
  }

  async getWidgetData(widgetId: string, config: any): Promise<any> {
    const response = await apiClient.post(`/widgets/${widgetId}/data`, { config });
    return response.data;
  }

  // Real-time Events
  subscribeToEvents(resourceType?: string, resourceId?: string): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const params = new URLSearchParams();
    if (resourceType) params.append('type', resourceType);
    if (resourceId) params.append('id', resourceId);

    const url = `/api/events/stream?${params.toString()}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data: RealTimeEvent = JSON.parse(event.data);
        this.notifyEventHandlers(data);
      } catch (_error) {
        console.error('Error parsing real-time event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setTimeout(() => this.subscribeToEvents(resourceType, resourceId), 5000);
    };
  }

  unsubscribeFromEvents(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  onEvent(eventType: string, handler: (event: RealTimeEvent) => void): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);

    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  private notifyEventHandlers(event: RealTimeEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  // Collaboration Features
  async joinCollaboration(resourceType: string, resourceId: string): Promise<void> {
    await apiClient.post('/collaboration/join', {
      resourceType,
      resourceId,
    });
  }

  async leaveCollaboration(resourceType: string, resourceId: string): Promise<void> {
    await apiClient.post('/collaboration/leave', {
      resourceType,
      resourceId,
    });
  }

  async sendCollaborationEvent(
    event: Omit<CollaborationEvent, 'id' | 'timestamp' | 'userId' | 'userName' | 'userAvatar'>,
  ): Promise<void> {
    await apiClient.post('/collaboration/events', event);
  }

  onCollaborationEvent(handler: (event: CollaborationEvent) => void): () => void {
    this.collaborationHandlers.add(handler);
    return () => {
      this.collaborationHandlers.delete(handler);
    };
  }

  onPresenceUpdate(handler: (users: UserPresence[]) => void): () => void {
    this.presenceHandlers.add(handler);
    return () => {
      this.presenceHandlers.delete(handler);
    };
  }

  // Widget Data Providers
  async getTicketMetrics(timeRange: string = '24h'): Promise<any> {
    const response = await apiClient.get(`/analytics/tickets/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  async getAssetMetrics(timeRange: string = '24h'): Promise<any> {
    const response = await apiClient.get(`/analytics/assets/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  async getSpaceMetrics(timeRange: string = '24h'): Promise<any> {
    const response = await apiClient.get(`/analytics/spaces/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  async getSystemMetrics(timeRange: string = '24h'): Promise<any> {
    const response = await apiClient.get(`/analytics/system/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  async getUserActivity(timeRange: string = '24h'): Promise<any> {
    const response = await apiClient.get(`/analytics/users/activity?timeRange=${timeRange}`);
    return response.data;
  }

  async getRecentAlerts(limit: number = 10): Promise<any> {
    const response = await apiClient.get(`/alerts/recent?limit=${limit}`);
    return response.data;
  }

  // Widget Export/Import
  async exportWidget(id: string): Promise<Blob> {
    const response = await apiClient.get(`/widgets/${id}/export`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  async importWidget(file: File): Promise<Widget> {
    const formData = new FormData();
    formData.append('widget', file);

    const response = await apiClient.post('/widgets/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as Widget;
  }

  async exportDashboard(id: string): Promise<Blob> {
    const response = await apiClient.get(`/dashboard/layouts/${id}/export`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  async importDashboard(file: File, name?: string): Promise<DashboardLayout> {
    const formData = new FormData();
    formData.append('dashboard', file);
    if (name) formData.append('name', name);

    const response = await apiClient.post('/dashboard/layouts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as DashboardLayout;
  }
}

export const widgetService = new WidgetService();
export default widgetService;
