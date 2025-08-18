import { apiClient } from './api'
import type { PaginatedResponse } from '@/types'

// Space Management Types
export interface Space {
  id: string
  name: string
  type: SpaceType
  capacity: number
  status: SpaceStatus
  location: string
  floor: string
  building: string
  amenities: string[]
  isBookable: boolean
  description?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface SpaceBooking {
  id: string
  spaceId: string
  userId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: BookingStatus
  attendees: number
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly'
    until?: string
  }
  createdAt: string
  updatedAt: string
}

export interface SpaceOccupancy {
  spaceId: string
  occupiedCount: number
  capacity: number
  lastUpdated: string
  sensorData?: {
    temperature: number
    humidity: number
    airQuality: number
  }
}

export type SpaceType = 
  | 'conference_room' 
  | 'meeting_room' 
  | 'hot_desk' 
  | 'office' 
  | 'phone_booth' 
  | 'focus_room' 
  | 'collaboration_space' 
  | 'break_room' 
  | 'training_room'

export type SpaceStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'out_of_service'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

export interface SpaceFilters {
  type?: SpaceType[]
  status?: SpaceStatus[]
  capacity?: { min?: number; max?: number }
  building?: string[]
  floor?: string[]
  amenities?: string[]
  available?: boolean
  dateTime?: string
}

export interface SpaceMetrics {
  totalSpaces: number
  availableSpaces: number
  occupiedSpaces: number
  maintenanceSpaces: number
  utilizationRate: number
  peakOccupancyTime: string
  averageBookingDuration: number
  mostPopularSpaces: Array<{
    spaceId: string
    name: string
    bookingCount: number
  }>
}

// Space Management API Service
export const spaceService = {
  // Space CRUD operations
  async getSpaces(filters?: SpaceFilters): Promise<PaginatedResponse<Space>> {
    const params = new URLSearchParams()
    
    if (filters?.type) {
      filters.type.forEach(type => params.append('type', type))
    }
    if (filters?.status) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters?.capacity?.min) {
      params.append('capacity_min', filters.capacity.min.toString())
    }
    if (filters?.capacity?.max) {
      params.append('capacity_max', filters.capacity.max.toString())
    }
    if (filters?.building) {
      filters.building.forEach(building => params.append('building', building))
    }
    if (filters?.floor) {
      filters.floor.forEach(floor => params.append('floor', floor))
    }
    if (filters?.amenities) {
      filters.amenities.forEach(amenity => params.append('amenity', amenity))
    }
    if (filters?.available !== undefined) {
      params.append('available', filters.available.toString())
    }
    if (filters?.dateTime) {
      params.append('datetime', filters.dateTime)
    }

    return await apiClient.getPaginated<Space>('/v1/spaces', Object.fromEntries(params))
  },

  async getSpace(id: string): Promise<Space> {
    const response = await apiClient.get<Space>(`/v1/spaces/${id}`)
    return response.data!
  },

  async createSpace(data: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>): Promise<Space> {
    const response = await apiClient.post<Space>('/v1/spaces', data)
    return response.data!
  },

  async updateSpace(id: string, data: Partial<Space>): Promise<Space> {
    const response = await apiClient.patch<Space>(`/v1/spaces/${id}`, data)
    return response.data!
  },

  async deleteSpace(id: string): Promise<void> {
    await apiClient.delete(`/v1/spaces/${id}`)
  },

  // Space booking operations
  async getBookings(spaceId?: string, userId?: string): Promise<PaginatedResponse<SpaceBooking>> {
    const params: Record<string, string> = {}
    if (spaceId) params.spaceId = spaceId
    if (userId) params.userId = userId
    
    return await apiClient.getPaginated<SpaceBooking>('/v1/spaces/bookings', params)
  },

  async createBooking(data: Omit<SpaceBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpaceBooking> {
    const response = await apiClient.post<SpaceBooking>('/v1/spaces/bookings', data)
    return response.data!
  },

  async updateBooking(id: string, data: Partial<SpaceBooking>): Promise<SpaceBooking> {
    const response = await apiClient.patch<SpaceBooking>(`/v1/spaces/bookings/${id}`, data)
    return response.data!
  },

  async cancelBooking(id: string): Promise<void> {
    await apiClient.delete(`/v1/spaces/bookings/${id}`)
  },

  // Space availability
  async checkAvailability(spaceId: string, startTime: string, endTime: string): Promise<{ available: boolean; conflicts: SpaceBooking[] }> {
    const response = await apiClient.get<{ available: boolean; conflicts: SpaceBooking[] }>(`/v1/spaces/${spaceId}/availability`, {
      params: { startTime, endTime }
    })
    return response.data!
  },

  async getAvailableSpaces(startTime: string, endTime: string, filters?: SpaceFilters): Promise<Space[]> {
    const params: Record<string, string> = { startTime, endTime }
    
    if (filters?.type) {
      params.types = filters.type.join(',')
    }
    if (filters?.capacity?.min) {
      params.capacityMin = filters.capacity.min.toString()
    }
    if (filters?.building) {
      params.buildings = filters.building.join(',')
    }

    const response = await apiClient.get<Space[]>('/v1/spaces/available', { params })
    return response.data!
  },

  // Space occupancy and sensors
  async getOccupancy(spaceId?: string): Promise<SpaceOccupancy[]> {
    const endpoint = spaceId ? `/v1/spaces/${spaceId}/occupancy` : '/v1/spaces/occupancy'
    const response = await apiClient.get<SpaceOccupancy[]>(endpoint)
    return response.data!
  },

  async updateOccupancy(spaceId: string, occupiedCount: number): Promise<void> {
    await apiClient.post(`/v1/spaces/${spaceId}/occupancy`, { occupiedCount })
  },

  // Space metrics and analytics
  async getMetrics(period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<SpaceMetrics> {
    const response = await apiClient.get<SpaceMetrics>('/v1/spaces/metrics', {
      params: { period }
    })
    return response.data!
  },

  async getUtilizationReport(spaceId?: string, startDate?: string, endDate?: string): Promise<Array<{
    spaceId: string
    spaceName: string
    totalHours: number
    bookedHours: number
    utilizationRate: number
    bookingCount: number
    averageDuration: number
    peakHours: Array<{ hour: number; bookingCount: number }>
  }>> {
    const params: Record<string, string> = {}
    if (spaceId) params.spaceId = spaceId
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await apiClient.get<Array<{
      spaceId: string
      spaceName: string
      totalHours: number
      bookedHours: number
      utilizationRate: number
      bookingCount: number
      averageDuration: number
      peakHours: Array<{ hour: number; bookingCount: number }>
    }>>('/v1/spaces/utilization', { params })
    return response.data!
  },

  // Floor plans and visualization
  async getFloorPlan(building: string, floor: string): Promise<{
    id: string
    building: string
    floor: string
    imageUrl: string
    spaces: Array<{
      spaceId: string
      coordinates: { x: number; y: number; width: number; height: number }
      status: SpaceStatus
    }>
  }> {
    const response = await apiClient.get<{
      id: string
      building: string
      floor: string
      imageUrl: string
      spaces: Array<{
        spaceId: string
        coordinates: { x: number; y: number; width: number; height: number }
        status: SpaceStatus
      }>
    }>(`/v1/spaces/floorplan/${building}/${floor}`)
    return response.data!
  },

  async updateFloorPlan(building: string, floor: string, data: {
    imageUrl?: string
    spaces?: Array<{
      spaceId: string
      coordinates: { x: number; y: number; width: number; height: number }
    }>
  }): Promise<void> {
    await apiClient.patch(`/v1/spaces/floorplan/${building}/${floor}`, data)
  },

  // Integration with external systems
  async syncWithCalendar(provider: 'outlook' | 'google' | 'exchange'): Promise<{ synced: number; errors: string[] }> {
    const response = await apiClient.post<{ synced: number; errors: string[] }>(`/v1/spaces/sync/${provider}`)
    return response.data!
  },

  async exportBookings(format: 'csv' | 'xlsx' | 'ics', filters?: {
    startDate?: string
    endDate?: string
    spaceId?: string
    userId?: string
  }): Promise<void> {
    const params = new URLSearchParams()
    params.append('format', format)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.spaceId) params.append('spaceId', filters.spaceId)
    if (filters?.userId) params.append('userId', filters.userId)

    await apiClient.downloadFile(`/v1/spaces/export?${params.toString()}`, `bookings.${format}`)
  }
}

export default spaceService
