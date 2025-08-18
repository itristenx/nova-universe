import { apiClient } from './api'
import type { PaginatedResponse } from '@/types'

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  status: NotificationStatus
  priority: NotificationPriority
  data?: Record<string, any>
  actionUrl?: string
  actionText?: string
  readAt?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferences {
  id: string
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
  categories: {
    tickets: boolean
    assets: boolean
    spaces: boolean
    alerts: boolean
    system: boolean
  }
  quietHours?: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
  }
  createdAt: string
  updatedAt: string
}

export type NotificationType = 
  | 'ticket' 
  | 'asset' 
  | 'space' 
  | 'alert' 
  | 'system' 
  | 'announcement' 
  | 'reminder'

export type NotificationStatus = 'unread' | 'read' | 'archived'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationFilters {
  type?: NotificationType[]
  status?: NotificationStatus[]
  priority?: NotificationPriority[]
  unreadOnly?: boolean
  fromDate?: string
  toDate?: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

// Notification Service
export const notificationService = {
  // Notification CRUD operations
  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams()
    
    if (filters?.type) {
      filters.type.forEach(type => params.append('type', type))
    }
    if (filters?.status) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters?.priority) {
      filters.priority.forEach(priority => params.append('priority', priority))
    }
    if (filters?.unreadOnly) {
      params.append('unread_only', 'true')
    }
    if (filters?.fromDate) {
      params.append('from_date', filters.fromDate)
    }
    if (filters?.toDate) {
      params.append('to_date', filters.toDate)
    }

    return await apiClient.getPaginated<Notification>('/v1/notifications', Object.fromEntries(params))
  },

  async getNotification(id: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(`/v1/notifications/${id}`)
    return response.data!
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/v1/notifications/${id}/read`)
  },

  async markAsUnread(id: string): Promise<void> {
    await apiClient.patch(`/v1/notifications/${id}/unread`)
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/v1/notifications/mark-all-read')
  },

  async archiveNotification(id: string): Promise<void> {
    await apiClient.patch(`/v1/notifications/${id}/archive`)
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/v1/notifications/${id}`)
  },

  async bulkAction(action: 'read' | 'unread' | 'archive' | 'delete', notificationIds: string[]): Promise<void> {
    await apiClient.post('/v1/notifications/bulk', {
      action,
      notificationIds
    })
  },

  // Notification statistics
  async getStats(): Promise<NotificationStats> {
    const response = await apiClient.get<NotificationStats>('/v1/notifications/stats')
    return response.data!
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/v1/notifications/unread-count')
    return response.data!.count
  },

  // Real-time notifications
  async subscribeToNotifications(callback: (notification: Notification) => void): Promise<() => void> {
    // WebSocket connection for real-time notifications
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`
    
    const ws = new WebSocket(wsUrl)
    
    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification
        callback(notification)
      } catch (error) {
        console.error('Failed to parse notification:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    // Return cleanup function
    return () => {
      ws.close()
    }
  },

  // Notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<NotificationPreferences>('/v1/notifications/preferences')
    return response.data!
  },

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await apiClient.patch<NotificationPreferences>('/v1/notifications/preferences', preferences)
    return response.data!
  },

  // Push notification registration
  async registerDevice(deviceToken: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    await apiClient.post('/v1/notifications/devices', {
      deviceToken,
      platform
    })
  },

  async unregisterDevice(deviceToken: string): Promise<void> {
    await apiClient.delete(`/v1/notifications/devices/${deviceToken}`)
  },

  // Test notifications
  async sendTestNotification(type: NotificationType): Promise<void> {
    await apiClient.post('/v1/notifications/test', { type })
  }
}

export default notificationService
