/**
 * Unified Device Management Service
 * Handles all device types (Kiosks, Nova TVs) with unified activation system
 */

import { api } from './api'

export type DeviceType = 'kiosk' | 'nova-tv'
export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'pending_activation'
export type ConnectionStatus = 'connected' | 'disconnected' | 'error'

export interface BaseDevice {
  id: string
  name: string
  location: string
  type: DeviceType
  status: DeviceStatus
  connectionStatus: ConnectionStatus
  active: boolean
  lastSeen: string
  ipAddress?: string
  assetTag: string
  serialNumber: string
  deviceFingerprint?: string
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
}

export interface KioskDevice extends BaseDevice {
  type: 'kiosk'
  version: string
  todayTickets: number
  totalTickets: number
  uptime: string
  health: number
}

export interface NovaTV extends BaseDevice {
  type: 'nova-tv'
  dashboardId?: string
  department?: string
  browserInfo?: string
  screenResolution?: string
  settings: Record<string, any>
}

export type Device = KioskDevice | NovaTV

export interface DeviceActivation {
  id: string
  type: DeviceType
  code: string
  qrCode: string
  deviceData: {
    name: string
    location: string
    assetTag: string
    serialNumber: string
    department?: string // For Nova TVs
  }
  expiresAt: string
  createdAt: string
  used: boolean
  deviceFingerprint?: string
}

export interface NewDeviceData {
  name: string
  location: string
  assetTag: string
  serialNumber: string
  type: DeviceType
  department?: string // For Nova TVs
}

export class UnifiedDeviceService {
  // Get all devices with optional filtering
  static async getAllDevices(filters?: {
    type?: DeviceType
    status?: DeviceStatus
    department?: string
    location?: string
  }): Promise<Device[]> {
    const response = await api.get<Device[]>('/admin/devices', { params: filters })
    return response.data || []
  }

  // Get devices by type
  static async getKiosks(): Promise<KioskDevice[]> {
    const devices = await this.getAllDevices({ type: 'kiosk' })
    return devices as KioskDevice[]
  }

  static async getNovaTVs(): Promise<NovaTV[]> {
    const devices = await this.getAllDevices({ type: 'nova-tv' })
    return devices as NovaTV[]
  }

  // Get single device
  static async getDevice(id: string): Promise<Device> {
    const response = await api.get<Device>(`/admin/devices/${id}`)
    if (!response.data) {
      throw new Error('Device not found')
    }
    return response.data
  }

  // Update device status
  static async updateDeviceStatus(id: string, active: boolean): Promise<Device> {
    const response = await api.patch<Device>(`/admin/devices/${id}/status`, { active })
    if (!response.data) {
      throw new Error('Failed to update device status')
    }
    return response.data
  }

  // Delete device
  static async deleteDevice(id: string): Promise<void> {
    await api.delete(`/admin/devices/${id}`)
  }

  // Activation management
  static async getActivations(type?: DeviceType): Promise<DeviceActivation[]> {
    const params = type ? { type } : {}
    const response = await api.get<DeviceActivation[]>('/admin/devices/activations', { params })
    return response.data || []
  }

  static async generateActivationCode(deviceData: NewDeviceData): Promise<DeviceActivation> {
    const response = await api.post<DeviceActivation>('/admin/devices/activations', deviceData)
    if (!response.data) {
      throw new Error('Failed to generate activation code')
    }
    return response.data
  }

  static async revokeActivation(id: string): Promise<void> {
    await api.delete(`/admin/devices/activations/${id}`)
  }

  // Device registration (called by devices during activation)
  static async registerDevice(activationCode: string, deviceFingerprint: string): Promise<Device> {
    const response = await api.post<Device>('/admin/devices/register', {
      activationCode,
      deviceFingerprint
    })
    if (!response.data) {
      throw new Error('Failed to register device')
    }
    return response.data
  }

  // Check activation status (for QR code polling)
  static async checkActivationStatus(deviceFingerprint: string): Promise<{
    isActivated: boolean
    device?: Device
  }> {
    const response = await api.get<{ isActivated: boolean; device?: Device }>(
      `/admin/devices/activation-status/${deviceFingerprint}`
    )
    return response.data || { isActivated: false }
  }

  // Activate device via admin interface (QR scan)
  static async activateDevice(deviceFingerprint: string, dashboardId?: string): Promise<Device> {
    const response = await api.post<Device>('/admin/devices/activate', {
      deviceFingerprint,
      dashboardId
    })
    if (!response.data) {
      throw new Error('Failed to activate device')
    }
    return response.data
  }

  // Device configuration
  static async getDeviceConfiguration(id: string): Promise<any> {
    const response = await api.get(`/admin/devices/${id}/configuration`)
    return response.data
  }

  static async updateDeviceConfiguration(id: string, config: any): Promise<void> {
    await api.put(`/admin/devices/${id}/configuration`, config)
  }

  // Statistics
  static async getDeviceStats(): Promise<{
    total: number
    byType: Record<DeviceType, number>
    byStatus: Record<DeviceStatus, number>
    recentActivations: number
  }> {
    const response = await api.get('/admin/devices/stats')
    return response.data || {
      total: 0,
      byType: { kiosk: 0, 'nova-tv': 0 },
      byStatus: { online: 0, offline: 0, maintenance: 0, pending_activation: 0 },
      recentActivations: 0
    }
  }
}

// Export individual services for backward compatibility
export { KioskService } from './kiosk'
export { novaTVService } from './nova-tv'
