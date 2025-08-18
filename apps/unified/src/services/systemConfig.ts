/**
 * System Configuration Service
 * Handles all system configuration related API operations
 */

import { api } from './api'

export interface SystemConfig {
  general: {
    systemName: string
    systemDescription: string
    timezone: string
    defaultLanguage: string
    maintenanceMode: boolean
    debugMode: boolean
    logLevel: 'error' | 'warn' | 'info' | 'debug'
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
    twoFactorEnabled: boolean
    ipWhitelist: string[]
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    smtpSecure: boolean
    fromEmail: string
    fromName: string
  }
  notifications: {
    emailNotifications: boolean
    slackWebhook: string
    discordWebhook: string
    teamsWebhook: string
    criticalAlerts: boolean
    systemUpdates: boolean
  }
  storage: {
    maxFileSize: number
    allowedFileTypes: string[]
    storageQuota: number
    backupRetention: number
  }
}

export class SystemConfigService {
  static async getConfiguration(): Promise<SystemConfig> {
    const response = await api.get<SystemConfig>('/admin/system/configuration')
    if (!response.data) {
      throw new Error('Failed to load system configuration')
    }
    return response.data
  }

  static async updateConfiguration(config: SystemConfig): Promise<SystemConfig> {
    const response = await api.put<SystemConfig>('/admin/system/configuration', config)
    if (!response.data) {
      throw new Error('Failed to update system configuration')
    }
    return response.data
  }

  static async updateSection(section: keyof SystemConfig, data: any): Promise<SystemConfig> {
    const response = await api.patch<SystemConfig>(`/admin/system/configuration/${section}`, data)
    if (!response.data) {
      throw new Error(`Failed to update ${section} configuration`)
    }
    return response.data
  }

  static async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/admin/system/test-email')
    if (!response.data) {
      throw new Error('Failed to test email configuration')
    }
    return response.data
  }

  static async testWebhook(type: 'slack' | 'discord' | 'teams', webhook: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(`/admin/system/test-webhook/${type}`, { webhook })
    if (!response.data) {
      throw new Error(`Failed to test ${type} webhook`)
    }
    return response.data
  }

  static async resetToDefaults(): Promise<SystemConfig> {
    const response = await api.post<SystemConfig>('/admin/system/configuration/reset')
    if (!response.data) {
      throw new Error('Failed to reset configuration to defaults')
    }
    return response.data
  }

  static async exportConfiguration(): Promise<Blob> {
    const response = await api.get('/admin/system/configuration/export', { responseType: 'blob' })
    return response.data as Blob
  }

  static async importConfiguration(file: File): Promise<SystemConfig> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<SystemConfig>('/admin/system/configuration/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (!response.data) {
      throw new Error('Failed to import configuration')
    }
    return response.data
  }
}
