import { apiClient } from './api'
import type { 
  Asset, 
  AssetType, 
  AssetLocation, 
  AssetCategory, 
  MaintenanceRecord,
  PaginatedResponse, 
  SearchFilters, 
  SortOption 
} from '@/types'

export interface CreateAssetData {
  name: string
  description?: string
  assetTag: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  categoryId: string
  typeId: string
  locationId?: string
  assignedUserId?: string
  purchaseDate?: string
  purchasePrice?: number
  warrantyExpiration?: string
  status: 'active' | 'inactive' | 'maintenance' | 'retired' | 'lost' | 'stolen'
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  customFields?: Record<string, unknown>
  attachments?: File[]
}

export interface UpdateAssetData {
  name?: string
  description?: string
  assetTag?: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  categoryId?: string
  typeId?: string
  locationId?: string
  assignedUserId?: string
  status?: 'active' | 'inactive' | 'maintenance' | 'retired' | 'lost' | 'stolen'
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  customFields?: Record<string, unknown>
}

export interface AssetFilters extends SearchFilters {
  status?: string[]
  condition?: string[]
  category?: string[]
  type?: string[]
  location?: string[]
  assignee?: string[]
  manufacturer?: string[]
  warrantyExpiring?: boolean
  maintenanceDue?: boolean
  unassigned?: boolean
}

export interface BulkAssetAction {
  assetIds: string[]
  action: 'assign' | 'unassign' | 'relocate' | 'retire' | 'activate' | 'maintenance'
  data?: {
    userId?: string
    locationId?: string
    notes?: string
  }
}

export interface AssetDiscoveryResult {
  id: string
  name: string
  type: string
  networkAddress?: string
  macAddress?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  location?: string
  discovered: boolean
  lastSeen: string
  confidence: number
}

class AssetService {
  /**
   * Get paginated list of assets with filters
   */
  async getAssets(
    page = 1,
    perPage = 25,
    filters?: AssetFilters,
    sort?: SortOption[]
  ): Promise<PaginatedResponse<Asset>> {
    const params = {
      page,
      perPage,
      ...filters,
      sort: sort?.map(s => `${s.field}:${s.direction}`).join(','),
    }

    return await apiClient.getPaginated<Asset>('/assets', params)
  }

  /**
   * Get single asset by ID
   */
  async getAsset(id: string): Promise<Asset> {
    const response = await apiClient.get<Asset>(`/assets/${id}`)
    return response.data!
  }

  /**
   * Create new asset
   */
  async createAsset(data: CreateAssetData): Promise<Asset> {
    const formData = new FormData()
    
    // Add asset data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachments') return // Handle separately
      if (value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    })

    // Add attachments
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file)
      })
    }

    const response = await apiClient.post<Asset>('/assets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data!
  }

  /**
   * Update existing asset
   */
  async updateAsset(id: string, data: UpdateAssetData): Promise<Asset> {
    const response = await apiClient.patch<Asset>(`/assets/${id}`, data)
    return response.data!
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`)
  }

  /**
   * Bulk update multiple assets
   */
  async bulkUpdateAssets(action: BulkAssetAction): Promise<{ updated: number; failed: number }> {
    const response = await apiClient.post<{ updated: number; failed: number }>('/assets/bulk-action', action)
    return response.data!
  }

  /**
   * Assign asset to user
   */
  async assignAsset(assetId: string, userId: string, notes?: string): Promise<Asset> {
    const response = await apiClient.post<Asset>(`/assets/${assetId}/assign`, {
      userId,
      notes,
    })
    return response.data!
  }

  /**
   * Unassign asset from user
   */
  async unassignAsset(assetId: string, notes?: string): Promise<Asset> {
    const response = await apiClient.post<Asset>(`/assets/${assetId}/unassign`, {
      notes,
    })
    return response.data!
  }

  /**
   * Move asset to different location
   */
  async relocateAsset(assetId: string, locationId: string, notes?: string): Promise<Asset> {
    const response = await apiClient.post<Asset>(`/assets/${assetId}/relocate`, {
      locationId,
      notes,
    })
    return response.data!
  }

  /**
   * Check out asset to user (temporary assignment)
   */
  async checkoutAsset(assetId: string, userId: string, dueDate?: string, notes?: string): Promise<Asset> {
    const response = await apiClient.post<Asset>(`/assets/${assetId}/checkout`, {
      userId,
      dueDate,
      notes,
    })
    return response.data!
  }

  /**
   * Check in asset from user
   */
  async checkinAsset(assetId: string, condition?: string, notes?: string): Promise<Asset> {
    const response = await apiClient.post<Asset>(`/assets/${assetId}/checkin`, {
      condition,
      notes,
    })
    return response.data!
  }

  /**
   * Get asset history/audit trail
   */
  async getAssetHistory(assetId: string): Promise<Array<{
    id: string
    action: string
    description: string
    user: { id: string; name: string }
    createdAt: string
    metadata?: Record<string, unknown>
  }>> {
    const response = await apiClient.get<Array<{
      id: string
      action: string
      description: string
      user: { id: string; name: string }
      createdAt: string
      metadata?: Record<string, unknown>
    }>>(`/assets/${assetId}/history`)
    return response.data!
  }

  /**
   * Get maintenance records for asset
   */
  async getMaintenanceRecords(assetId: string): Promise<MaintenanceRecord[]> {
    const response = await apiClient.get<MaintenanceRecord[]>(`/assets/${assetId}/maintenance`)
    return response.data!
  }

  /**
   * Create maintenance record
   */
  async createMaintenanceRecord(assetId: string, data: {
    type: 'preventive' | 'corrective' | 'inspection' | 'upgrade'
    description: string
    scheduledDate: string
    completedDate?: string
    technician?: string
    cost?: number
    notes?: string
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  }): Promise<MaintenanceRecord> {
    const response = await apiClient.post<MaintenanceRecord>(`/assets/${assetId}/maintenance`, data)
    return response.data!
  }

  /**
   * Get asset categories
   */
  async getCategories(): Promise<AssetCategory[]> {
    const response = await apiClient.get<AssetCategory[]>('/assets/categories')
    return response.data!
  }

  /**
   * Get asset types
   */
  async getTypes(): Promise<AssetType[]> {
    const response = await apiClient.get<AssetType[]>('/assets/types')
    return response.data!
  }

  /**
   * Get asset locations
   */
  async getLocations(): Promise<AssetLocation[]> {
    const response = await apiClient.get<AssetLocation[]>('/assets/locations')
    return response.data!
  }

  /**
   * Search assets with advanced query
   */
  async searchAssets(
    query: string,
    page = 1,
    perPage = 25
  ): Promise<PaginatedResponse<Asset & { score: number; highlights: Record<string, string[]> }>> {
    const params = { query, page, perPage }
    return await apiClient.getPaginated<Asset & { score: number; highlights: Record<string, string[]> }>('/assets/search', params)
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(): Promise<{
    total: number
    active: number
    inactive: number
    maintenance: number
    retired: number
    assigned: number
    unassigned: number
    overdue: number
    totalValue: number
    byCategory: Record<string, number>
    byLocation: Record<string, number>
    byStatus: Record<string, number>
    maintenanceDue: number
    warrantyExpiring: number
  }> {
    const response = await apiClient.get<{
      total: number
      active: number
      inactive: number
      maintenance: number
      retired: number
      assigned: number
      unassigned: number
      overdue: number
      totalValue: number
      byCategory: Record<string, number>
      byLocation: Record<string, number>
      byStatus: Record<string, number>
      maintenanceDue: number
      warrantyExpiring: number
    }>('/assets/stats')
    return response.data!
  }

  /**
   * Generate asset QR codes
   */
  async generateQRCodes(assetIds: string[]): Promise<{ url: string; filename: string }> {
    const response = await apiClient.post<{ url: string; filename: string }>('/assets/qr-codes', {
      assetIds,
    })
    return response.data!
  }

  /**
   * Export assets to various formats
   */
  async exportAssets(
    format: 'csv' | 'excel' | 'pdf',
    filters?: AssetFilters
  ): Promise<void> {
    await apiClient.downloadFile(`/assets/export?format=${format}`, `assets.${format}`)
  }

  /**
   * Import assets from file
   */
  async importAssets(file: File, options?: {
    skipDuplicates?: boolean
    updateExisting?: boolean
    validateOnly?: boolean
  }): Promise<{
    imported: number
    updated: number
    skipped: number
    errors: Array<{ row: number; message: string }>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const response = await apiClient.post<{
      imported: number
      updated: number
      skipped: number
      errors: Array<{ row: number; message: string }>
    }>('/assets/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data!
  }

  /**
   * Discover assets on network
   */
  async discoverAssets(options?: {
    networkRange?: string
    discoveryType?: 'network' | 'active-directory' | 'snmp' | 'wmi'
    credentials?: Record<string, string>
  }): Promise<AssetDiscoveryResult[]> {
    const response = await apiClient.post<AssetDiscoveryResult[]>('/assets/discover', options)
    return response.data!
  }

  /**
   * Get depreciation schedules
   */
  async getDepreciationSchedules(): Promise<Array<{
    assetId: string
    assetName: string
    purchasePrice: number
    currentValue: number
    depreciationMethod: string
    yearlyDepreciation: number
    remainingValue: number
    fullyDepreciatedDate: string
  }>> {
    const response = await apiClient.get<Array<{
      assetId: string
      assetName: string
      purchasePrice: number
      currentValue: number
      depreciationMethod: string
      yearlyDepreciation: number
      remainingValue: number
      fullyDepreciatedDate: string
    }>>('/assets/depreciation')
    return response.data!
  }

  /**
   * Calculate asset depreciation
   */
  async calculateDepreciation(assetId: string, method: 'straight-line' | 'declining-balance' | 'sum-of-years'): Promise<{
    currentValue: number
    yearlyDepreciation: number
    schedule: Array<{
      year: number
      depreciation: number
      bookValue: number
    }>
  }> {
    const response = await apiClient.post<{
      currentValue: number
      yearlyDepreciation: number
      schedule: Array<{
        year: number
        depreciation: number
        bookValue: number
      }>
    }>(`/assets/${assetId}/depreciation`, { method })
    return response.data!
  }

  /**
   * Get assets due for maintenance
   */
  async getMaintenanceDue(): Promise<Array<Asset & {
    maintenanceType: string
    dueDate: string
    daysPastDue: number
  }>> {
    const response = await apiClient.get<Array<Asset & {
      maintenanceType: string
      dueDate: string
      daysPastDue: number
    }>>('/assets/maintenance-due')
    return response.data!
  }

  /**
   * Get assets with expiring warranties
   */
  async getExpiringWarranties(daysAhead = 30): Promise<Array<Asset & {
    warrantyExpiration: string
    daysUntilExpiration: number
    warrantyProvider: string
  }>> {
    const response = await apiClient.get<Array<Asset & {
      warrantyExpiration: string
      daysUntilExpiration: number
      warrantyProvider: string
    }>>(`/assets/warranty-expiring?days=${daysAhead}`)
    return response.data!
  }

  /**
   * Schedule maintenance for asset
   */
  async scheduleMaintenance(assetId: string, data: {
    type: 'preventive' | 'corrective' | 'inspection' | 'upgrade'
    description: string
    scheduledDate: string
    assignedTechnician?: string
    estimatedCost?: number
    priority: 'low' | 'normal' | 'high' | 'urgent'
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
      interval: number
      endDate?: string
    }
  }): Promise<MaintenanceRecord> {
    const response = await apiClient.post<MaintenanceRecord>(`/assets/${assetId}/schedule-maintenance`, data)
    return response.data!
  }
}

export const assetService = new AssetService()