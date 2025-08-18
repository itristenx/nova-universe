/**
 * Admin Notifications Service
 * Handles system-wide admin notifications
 */

import { api } from './api'

export interface AdminNotification {
  id: number
  message: string
  type: 'system' | 'maintenance' | 'security' | 'announcement'
  level: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
  targetRoles?: string[]
}

export interface AdminNotificationForm {
  message: string
  type: 'system' | 'maintenance' | 'security' | 'announcement'
  level: 'info' | 'warning' | 'error' | 'success'
  expiresAt?: string
  targetRoles?: string[]
}

export class AdminNotificationsService {
  static async getAll(): Promise<AdminNotification[]> {
    const response = await api.get<AdminNotification[]>('/admin/notifications')
    return response.data || []
  }

  static async create(data: AdminNotificationForm): Promise<AdminNotification> {
    const response = await api.post<AdminNotification>('/admin/notifications', data)
    if (!response.data) {
      throw new Error('Failed to create notification')
    }
    return response.data
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/admin/notifications/${id}`)
  }

  static async markAsRead(id: number): Promise<void> {
    await api.patch(`/admin/notifications/${id}/read`)
  }

  static async broadcast(notificationId: number): Promise<void> {
    await api.post(`/admin/notifications/${notificationId}/broadcast`)
  }
}
