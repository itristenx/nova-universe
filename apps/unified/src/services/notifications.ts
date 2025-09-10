import { apiClient } from './api';
import type { PaginatedResponse } from '@/types';
import { io, Socket } from 'socket.io-client';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  categories: {
    tickets: boolean;
    assets: boolean;
    spaces: boolean;
    alerts: boolean;
    system: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'ticket'
  | 'asset'
  | 'space'
  | 'alert'
  | 'system'
  | 'announcement'
  | 'reminder';

export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationFilters {
  type?: NotificationType[];
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  unreadOnly?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Notification Service
export const notificationService = {
  // Notification CRUD operations
  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();

    if (filters?.type) {
      filters.type.forEach((type) => params.append('type', type));
    }
    if (filters?.status) {
      filters.status.forEach((status) => params.append('status', status));
    }
    if (filters?.priority) {
      filters.priority.forEach((priority) => params.append('priority', priority));
    }
    if (filters?.unreadOnly) {
      params.append('unread_only', 'true');
    }
    if (filters?.fromDate) {
      params.append('from_date', filters.fromDate);
    }
    if (filters?.toDate) {
      params.append('to_date', filters.toDate);
    }

    return await apiClient.getPaginated<Notification>(
      '/api/v1/notifications',
      Object.fromEntries(params),
    );
  },

  async getNotification(id: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(`/api/v1/notifications/${id}`);
    return response.data!;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/api/v1/notifications/${id}/read`);
  },

  async markAsUnread(id: string): Promise<void> {
    await apiClient.patch(`/api/v1/notifications/${id}/unread`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/v1/notifications/mark-all-read');
  },

  async archiveNotification(id: string): Promise<void> {
    await apiClient.patch(`/api/v1/notifications/${id}/archive`);
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${id}`);
  },

  async bulkAction(
    action: 'read' | 'unread' | 'archive' | 'delete',
    notificationIds: string[],
  ): Promise<void> {
    await apiClient.post('/api/v1/notifications/bulk', {
      action,
      notificationIds,
    });
  },

  // Notification statistics
  async getStats(): Promise<NotificationStats> {
    const response = await apiClient.get<NotificationStats>('/api/v1/notifications/stats');
    return response.data!;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/api/v1/notifications/unread-count');
    return response.data!.count;
  },

  // Real-time notifications with enhanced connection management
  async subscribeToNotifications(
    callback: (notification: Notification) => void,
  ): Promise<() => void> {
    // Socket.IO connection for real-time notifications with proper typing
    const socket: Socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Notifications WebSocket connected:', {
        socketId: socket.id,
        transport: socket.io.engine.transport.name,
        timestamp: new Date().toISOString()
      });
      
      // Subscribe to user-specific notifications
      socket.emit('subscribe_notifications');
    });

    socket.on('notification', (notification: Notification) => {
      console.log('Real-time notification received:', {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        timestamp: new Date().toISOString()
      });
      callback(notification);
    });

    socket.on('notification_update', (data: { id: string; status: NotificationStatus }) => {
      console.log('Notification status updated:', data);
      // Emit custom event for UI updates
      window.dispatchEvent(new CustomEvent('notification_updated', { detail: data }));
    });

    socket.on('bulk_notification_update', (data: { ids: string[]; action: string }) => {
      console.log('Bulk notification update:', data);
      window.dispatchEvent(new CustomEvent('bulk_notifications_updated', { detail: data }));
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Notifications WebSocket connection error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Notifications WebSocket disconnected:', {
        reason,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('Notifications WebSocket reconnected:', {
        attempt: attemptNumber,
        timestamp: new Date().toISOString()
      });
    });

    // Return cleanup function
    return () => {
      socket.emit('unsubscribe_notifications');
      socket.disconnect();
      console.log('Notifications WebSocket disconnected and cleaned up');
    };
  },

  // Notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<NotificationPreferences>('/api/v1/notifications/preferences');
    return response.data!;
  },

  async updatePreferences(
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const response = await apiClient.patch<NotificationPreferences>(
      '/api/v1/notifications/preferences',
      preferences,
    );
    return response.data!;
  },

  // Push notification registration
  async registerDevice(deviceToken: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    await apiClient.post('/api/v1/notifications/devices', {
      deviceToken,
      platform,
    });
  },

  async unregisterDevice(deviceToken: string): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/devices/${deviceToken}`);
  },

  // Test notifications
  async sendTestNotification(type: NotificationType): Promise<void> {
    await apiClient.post('/api/v1/notifications/test', { type });
  },
};

export default notificationService;
