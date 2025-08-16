import { apiClient } from './api'

export interface MailroomPackage {
  id: string
  trackingNumber?: string
  internalPackageId: string
  sender?: string
  recipient: {
    id: string
    name: string
    email?: string
    department?: string
    location?: string
  }
  carrier?: 'fedex' | 'ups' | 'usps' | 'dhl' | 'amazon' | 'internal' | 'other'
  packageType: 'box' | 'envelope' | 'large' | 'fragile' | 'document' | 'equipment' | 'other'
  status: 'intake' | 'staged' | 'in_transit' | 'delivered' | 'picked_up' | 'lost' | 'returned' | 'escalated'
  priority: 'normal' | 'urgent' | 'critical'
  flags: PackageFlag[]
  location: {
    current: string
    zone?: string
    locker?: string
    shelf?: string
  }
  linkedTicketId?: string
  linkedAssetId?: string
  photos: PackagePhoto[]
  signatures: PackageSignature[]
  dimensions?: {
    length: number
    width: number
    height: number
    weight: number
    unit: 'in' | 'cm'
    weightUnit: 'lbs' | 'kg'
  }
  specialInstructions?: string
  slaDeadline?: string
  proxyAuthorizations: ProxyAuthorization[]
  deliveryEvents: DeliveryEvent[]
  notifications: PackageNotification[]
  createdAt: string
  updatedAt: string
  intakeBy: string
  deliveredBy?: string
  deliveredAt?: string
  pickedUpAt?: string
}

export interface PackageFlag {
  type: 'sensitive' | 'hardware' | 'vip' | 'urgent' | 'fragile' | 'confidential' | 'security_concern'
  note?: string
  addedBy: string
  addedAt: string
}

export interface PackagePhoto {
  id: string
  url: string
  type: 'intake' | 'damage' | 'delivery' | 'pickup' | 'staging'
  description?: string
  takenBy: string
  takenAt: string
}

export interface PackageSignature {
  id: string
  type: 'delivery' | 'pickup' | 'proxy'
  signatureData: string // Base64 encoded signature
  signedBy: string
  witnessedBy?: string
  timestamp: string
  deviceInfo?: {
    type: 'kiosk' | 'mobile' | 'tablet'
    location: string
  }
}

export interface ProxyAuthorization {
  id: string
  recipientId: string
  proxyUserId: string
  packageId: string
  authorizedBy: string
  expiration?: string
  status: 'active' | 'used' | 'expired' | 'revoked'
  notes?: string
  createdAt: string
  usedAt?: string
}

export interface DeliveryEvent {
  id: string
  eventType: 'scanned' | 'moved' | 'staged' | 'delivered' | 'picked_up' | 'returned' | 'damaged' | 'escalated'
  description: string
  performedBy: string
  location: string
  timestamp: string
  metadata?: Record<string, unknown>
  photoUrls?: string[]
}

export interface PackageNotification {
  id: string
  type: 'arrival' | 'ready_pickup' | 'reminder' | 'escalation' | 'delivered'
  channel: 'email' | 'sms' | 'slack' | 'in_app'
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: string
  recipientId: string
  metadata?: Record<string, unknown>
}

export interface DeliveryBatch {
  id: string
  agentId: string
  agentName: string
  mailroomLocation: string
  packages: MailroomPackage[]
  routeHint?: string
  status: 'created' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  startedAt?: string
  completedAt?: string
  estimatedDuration?: number
  actualDuration?: number
}

export interface InterOfficeMail {
  id: string
  senderId: string
  recipientId: string
  fromLocation: string
  toLocation: string
  description?: string
  requestedDeliveryTime?: string
  priority: 'normal' | 'urgent'
  status: 'requested' | 'approved' | 'printed' | 'in_transit' | 'delivered'
  printedLabelUrl?: string
  trackingCode?: string
  deliveredAt?: string
  deliveredBy?: string
  createdAt: string
}

export interface MailroomLocation {
  id: string
  name: string
  type: 'intake' | 'staging' | 'delivery' | 'locker' | 'storage'
  building?: string
  floor?: string
  zone?: string
  capacity?: number
  isActive: boolean
  metadata?: Record<string, unknown>
}

export interface MailroomStats {
  today: {
    packagesReceived: number
    packagesDelivered: number
    packagesPickedUp: number
    pendingPickups: number
    overduePackages: number
  }
  week: {
    totalPackages: number
    averageDeliveryTime: number
    slaCompliance: number
    topCarriers: Array<{ carrier: string; count: number }>
  }
  overall: {
    totalPackagesProcessed: number
    averagePickupTime: number
    lostPackageRate: number
    customerSatisfaction: number
  }
}

export interface MailroomConfig {
  enableLockerSupport: boolean
  enablePhotoVerification: boolean
  maxPackageRetentionDays: number
  enableSMSAlerts: boolean
  allowedCarriers: string[]
  proxyPickupEnabled: boolean
  autoEscalationDays: number
  requiredFields: string[]
  defaultSLAHours: number
}

class MailroomService {
  /**
   * Register a new package
   */
  async createPackage(data: {
    trackingNumber?: string
    sender?: string
    recipientId: string
    carrier?: string
    packageType: string
    description?: string
    photos?: File[]
    specialInstructions?: string
    linkedTicketId?: string
    linkedAssetId?: string
    flags?: string[]
    priority?: 'normal' | 'urgent' | 'critical'
  }): Promise<MailroomPackage> {
    const formData = new FormData()
    
    // Add package data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'photos') return
      if (value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    })
    
    // Add photos
    if (data.photos) {
      data.photos.forEach((file, index) => {
        formData.append(`photos[${index}]`, file)
      })
    }
    
    const response = await apiClient.post<MailroomPackage>('/mailroom/packages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data!
  }

  /**
   * Get package by ID
   */
  async getPackage(id: string): Promise<MailroomPackage> {
    const response = await apiClient.get<MailroomPackage>(`/mailroom/packages/${id}`)
    return response.data!
  }

  /**
   * Search packages
   */
  async searchPackages(filters: {
    query?: string
    status?: string[]
    carrier?: string[]
    recipient?: string
    trackingNumber?: string
    dateRange?: {
      start: string
      end: string
    }
    flags?: string[]
    location?: string
    overdue?: boolean
  }, page = 1, perPage = 25): Promise<{
    packages: MailroomPackage[]
    total: number
    page: number
    perPage: number
  }> {
    const params = {
      ...filters,
      page,
      perPage
    }
    
    const response = await apiClient.get('/mailroom/packages/search', { params })
    return response.data!
  }

  /**
   * Update package status
   */
  async updatePackageStatus(
    id: string,
    status: string,
    notes?: string,
    location?: string,
    photo?: File
  ): Promise<MailroomPackage> {
    const formData = new FormData()
    formData.append('status', status)
    
    if (notes) formData.append('notes', notes)
    if (location) formData.append('location', location)
    if (photo) formData.append('photo', photo)
    
    const response = await apiClient.patch<MailroomPackage>(
      `/mailroom/packages/${id}/status`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    return response.data!
  }

  /**
   * Assign proxy authorization
   */
  async assignProxy(packageId: string, data: {
    proxyUserId: string
    expiration?: string
    notes?: string
  }): Promise<ProxyAuthorization> {
    const response = await apiClient.post<ProxyAuthorization>(
      `/mailroom/packages/${packageId}/assign-proxy`,
      data
    )
    return response.data!
  }

  /**
   * Revoke proxy authorization
   */
  async revokeProxy(authorizationId: string): Promise<void> {
    await apiClient.delete(`/mailroom/proxy-authorizations/${authorizationId}`)
  }

  /**
   * Link package to ticket
   */
  async linkToTicket(packageId: string, ticketId: string): Promise<MailroomPackage> {
    const response = await apiClient.post<MailroomPackage>(
      `/mailroom/packages/${packageId}/link-ticket`,
      { ticketId }
    )
    return response.data!
  }

  /**
   * Link package to asset
   */
  async linkToAsset(packageId: string, assetId: string): Promise<MailroomPackage> {
    const response = await apiClient.post<MailroomPackage>(
      `/mailroom/packages/${packageId}/link-asset`,
      { assetId }
    )
    return response.data!
  }

  /**
   * Capture delivery signature
   */
  async captureSignature(packageId: string, data: {
    signatureData: string
    signedBy: string
    type: 'delivery' | 'pickup' | 'proxy'
    witnessedBy?: string
    deviceInfo?: {
      type: 'kiosk' | 'mobile' | 'tablet'
      location: string
    }
  }): Promise<PackageSignature> {
    const response = await apiClient.post<PackageSignature>(
      `/mailroom/packages/${packageId}/signature`,
      data
    )
    return response.data!
  }

  /**
   * Create delivery batch
   */
  async createDeliveryBatch(data: {
    packageIds: string[]
    agentId: string
    routeHint?: string
  }): Promise<DeliveryBatch> {
    const response = await apiClient.post<DeliveryBatch>('/mailroom/delivery-batches', data)
    return response.data!
  }

  /**
   * Get delivery batch
   */
  async getDeliveryBatch(id: string): Promise<DeliveryBatch> {
    const response = await apiClient.get<DeliveryBatch>(`/mailroom/delivery-batches/${id}`)
    return response.data!
  }

  /**
   * Update delivery batch status
   */
  async updateDeliveryBatchStatus(id: string, status: string): Promise<DeliveryBatch> {
    const response = await apiClient.patch<DeliveryBatch>(
      `/mailroom/delivery-batches/${id}`,
      { status }
    )
    return response.data!
  }

  /**
   * Create inter-office mail request
   */
  async createInterOfficeMail(data: {
    recipientId: string
    fromLocation: string
    toLocation: string
    description?: string
    requestedDeliveryTime?: string
    priority?: 'normal' | 'urgent'
  }): Promise<InterOfficeMail> {
    const response = await apiClient.post<InterOfficeMail>('/mailroom/inter-office-mail', data)
    return response.data!
  }

  /**
   * Generate shipping label for inter-office mail
   */
  async generateShippingLabel(mailId: string): Promise<{ labelUrl: string; trackingCode: string }> {
    const response = await apiClient.post<{ labelUrl: string; trackingCode: string }>(
      `/mailroom/inter-office-mail/${mailId}/generate-label`
    )
    return response.data!
  }

  /**
   * Bulk import packages
   */
  async bulkImportPackages(file: File, options?: {
    skipDuplicates?: boolean
    defaultCarrier?: string
    defaultLocation?: string
  }): Promise<{
    imported: number
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
    
    const response = await apiClient.post('/mailroom/packages/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data!
  }

  /**
   * Get mailroom locations
   */
  async getLocations(): Promise<MailroomLocation[]> {
    const response = await apiClient.get<MailroomLocation[]>('/mailroom/locations')
    return response.data!
  }

  /**
   * Create mailroom location
   */
  async createLocation(data: {
    name: string
    type: 'intake' | 'staging' | 'delivery' | 'locker' | 'storage'
    building?: string
    floor?: string
    zone?: string
    capacity?: number
  }): Promise<MailroomLocation> {
    const response = await apiClient.post<MailroomLocation>('/mailroom/locations', data)
    return response.data!
  }

  /**
   * Get mailroom statistics
   */
  async getStats(): Promise<MailroomStats> {
    const response = await apiClient.get<MailroomStats>('/mailroom/stats')
    return response.data!
  }

  /**
   * Get mailroom configuration
   */
  async getConfig(): Promise<MailroomConfig> {
    const response = await apiClient.get<MailroomConfig>('/mailroom/config')
    return response.data!
  }

  /**
   * Update mailroom configuration
   */
  async updateConfig(config: Partial<MailroomConfig>): Promise<MailroomConfig> {
    const response = await apiClient.patch<MailroomConfig>('/mailroom/config', config)
    return response.data!
  }

  /**
   * Trigger workflow for package
   */
  async triggerWorkflow(packageId: string, workflowType: string, data?: Record<string, unknown>): Promise<void> {
    await apiClient.post(`/mailroom/packages/${packageId}/trigger-workflow`, {
      workflowType,
      data
    })
  }

  /**
   * Send notification for package
   */
  async sendNotification(packageId: string, data: {
    type: 'arrival' | 'ready_pickup' | 'reminder' | 'escalation'
    channels: ('email' | 'sms' | 'slack' | 'in_app')[]
    customMessage?: string
  }): Promise<PackageNotification[]> {
    const response = await apiClient.post<PackageNotification[]>(
      `/mailroom/packages/${packageId}/notify`,
      data
    )
    return response.data!
  }

  /**
   * Get package history/audit trail
   */
  async getPackageHistory(packageId: string): Promise<DeliveryEvent[]> {
    const response = await apiClient.get<DeliveryEvent[]>(`/mailroom/packages/${packageId}/history`)
    return response.data!
  }

  /**
   * Check for duplicate packages
   */
  async checkDuplicates(trackingNumber: string): Promise<{
    isDuplicate: boolean
    existingPackages: MailroomPackage[]
  }> {
    const response = await apiClient.get(`/mailroom/packages/check-duplicate/${trackingNumber}`)
    return response.data!
  }

  /**
   * Generate QR codes for packages
   */
  async generateQRCodes(packageIds: string[]): Promise<{ url: string; filename: string }> {
    const response = await apiClient.post<{ url: string; filename: string }>('/mailroom/packages/qr-codes', {
      packageIds
    })
    return response.data!
  }

  /**
   * Export package data
   */
  async exportPackages(
    format: 'csv' | 'excel' | 'pdf',
    filters?: Record<string, unknown>
  ): Promise<{ downloadUrl: string; filename: string }> {
    const response = await apiClient.post<{ downloadUrl: string; filename: string }>('/mailroom/export', {
      format,
      filters
    })
    return response.data!
  }

  /**
   * Get overdue packages
   */
  async getOverduePackages(): Promise<MailroomPackage[]> {
    const response = await apiClient.get<MailroomPackage[]>('/mailroom/packages/overdue')
    return response.data!
  }

  /**
   * Get packages by recipient
   */
  async getPackagesByRecipient(recipientId: string): Promise<MailroomPackage[]> {
    const response = await apiClient.get<MailroomPackage[]>(`/mailroom/packages/recipient/${recipientId}`)
    return response.data!
  }

  /**
   * Auto-detect carrier from tracking number
   */
  async detectCarrier(trackingNumber: string): Promise<{ carrier: string; confidence: number }> {
    const response = await apiClient.post<{ carrier: string; confidence: number }>('/mailroom/detect-carrier', {
      trackingNumber
    })
    return response.data!
  }

  /**
   * Scan package barcode/QR code
   */
  async scanPackage(scanData: string, scanType: 'barcode' | 'qr' | 'tracking'): Promise<{
    package?: MailroomPackage
    suggestions: MailroomPackage[]
    actions: string[]
  }> {
    const response = await apiClient.post('/mailroom/scan', {
      scanData,
      scanType
    })
    return response.data!
  }

  /**
   * Get delivery route optimization
   */
  async optimizeDeliveryRoute(packageIds: string[]): Promise<{
    optimizedOrder: string[]
    estimatedTime: number
    totalDistance: number
    route: Array<{
      packageId: string
      location: string
      estimatedArrival: string
    }>
  }> {
    const response = await apiClient.post('/mailroom/optimize-route', {
      packageIds
    })
    return response.data!
  }
}

export const mailroomService = new MailroomService()