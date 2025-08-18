import { create } from 'zustand'
import { spaceService, type SpaceFilters, type Space, type SpaceBooking, type SpaceMetrics } from '@services/spaces'
import type { PaginatedResponse } from '@/types'

interface SpaceState {
  // State
  spaces: Space[]
  selectedSpaces: string[]
  currentSpace: Space | null
  bookings: SpaceBooking[]
  currentBooking: SpaceBooking | null
  metrics: SpaceMetrics | null
  isLoading: boolean
  error: string | null
  filters: SpaceFilters
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }

  // Actions
  loadSpaces: (page?: number) => Promise<void>
  loadSpace: (id: string) => Promise<void>
  createSpace: (data: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Space>
  updateSpace: (id: string, data: Partial<Space>) => Promise<Space>
  deleteSpace: (id: string) => Promise<void>
  loadBookings: (spaceId?: string, userId?: string) => Promise<void>
  createBooking: (data: Omit<SpaceBooking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SpaceBooking>
  updateBooking: (id: string, data: Partial<SpaceBooking>) => Promise<SpaceBooking>
  cancelBooking: (id: string) => Promise<void>
  loadMetrics: (period?: 'day' | 'week' | 'month' | 'year') => Promise<void>
  setFilters: (filters: Partial<SpaceFilters>) => void
  setSelectedSpaces: (spaceIds: string[]) => void
  addSelectedSpace: (spaceId: string) => void
  removeSelectedSpace: (spaceId: string) => void
  clearSelectedSpaces: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  refreshSpaces: () => Promise<void>
}

export const useSpaceStore = create<SpaceState>((set, get) => ({
  // Initial state
  spaces: [],
  selectedSpaces: [],
  currentSpace: null,
  bookings: [],
  currentBooking: null,
  metrics: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    perPage: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },

  // Load spaces with pagination and filters
  loadSpaces: async (_page?: number) => {
    const state = get()

    set({ isLoading: true, error: null })

    try {
      const response: PaginatedResponse<Space> = await spaceService.getSpaces(state.filters)

      set({
        spaces: response.data,
        pagination: {
          page: response.meta.page,
          perPage: response.meta.perPage,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrev: response.meta.hasPrev,
        },
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load spaces',
        isLoading: false,
      })
    }
  },

  // Load a single space
  loadSpace: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const space = await spaceService.getSpace(id)
      set({
        currentSpace: space,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load space',
        isLoading: false,
      })
    }
  },

  // Create a new space
  createSpace: async (data: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null })

    try {
      const newSpace = await spaceService.createSpace(data)
      
      set((state) => ({
        spaces: [newSpace, ...state.spaces],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        isLoading: false,
      }))

      return newSpace
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create space',
        isLoading: false,
      })
      throw error
    }
  },

  // Update a space
  updateSpace: async (id: string, data: Partial<Space>) => {
    set({ isLoading: true, error: null })

    try {
      const updatedSpace = await spaceService.updateSpace(id, data)
      
      set((state) => ({
        spaces: state.spaces.map(space => 
          space.id === id ? updatedSpace : space
        ),
        currentSpace: state.currentSpace?.id === id ? updatedSpace : state.currentSpace,
        isLoading: false,
      }))

      return updatedSpace
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update space',
        isLoading: false,
      })
      throw error
    }
  },

  // Delete a space
  deleteSpace: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      await spaceService.deleteSpace(id)
      
      set((state) => ({
        spaces: state.spaces.filter(space => space.id !== id),
        currentSpace: state.currentSpace?.id === id ? null : state.currentSpace,
        selectedSpaces: state.selectedSpaces.filter(spaceId => spaceId !== id),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
        },
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete space',
        isLoading: false,
      })
      throw error
    }
  },

  // Load bookings
  loadBookings: async (spaceId?: string, userId?: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await spaceService.getBookings(spaceId, userId)
      set({
        bookings: response.data,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load bookings',
        isLoading: false,
      })
    }
  },

  // Create a booking
  createBooking: async (data: Omit<SpaceBooking, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null })

    try {
      const newBooking = await spaceService.createBooking(data)
      
      set((state) => ({
        bookings: [newBooking, ...state.bookings],
        isLoading: false,
      }))

      return newBooking
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create booking',
        isLoading: false,
      })
      throw error
    }
  },

  // Update a booking
  updateBooking: async (id: string, data: Partial<SpaceBooking>) => {
    set({ isLoading: true, error: null })

    try {
      const updatedBooking = await spaceService.updateBooking(id, data)
      
      set((state) => ({
        bookings: state.bookings.map(booking => 
          booking.id === id ? updatedBooking : booking
        ),
        currentBooking: state.currentBooking?.id === id ? updatedBooking : state.currentBooking,
        isLoading: false,
      }))

      return updatedBooking
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update booking',
        isLoading: false,
      })
      throw error
    }
  },

  // Cancel a booking
  cancelBooking: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      await spaceService.cancelBooking(id)
      
      set((state) => ({
        bookings: state.bookings.filter(booking => booking.id !== id),
        currentBooking: state.currentBooking?.id === id ? null : state.currentBooking,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
        isLoading: false,
      })
      throw error
    }
  },

  // Load metrics
  loadMetrics: async (period: 'day' | 'week' | 'month' | 'year' = 'week') => {
    set({ isLoading: true, error: null })

    try {
      const metrics = await spaceService.getMetrics(period)
      set({
        metrics,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load metrics',
        isLoading: false,
      })
    }
  },

  // Filter management
  setFilters: (newFilters: Partial<SpaceFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page
    }))
    
    // Auto-reload with new filters
    get().loadSpaces(1)
  },

  // Selection management
  setSelectedSpaces: (spaceIds: string[]) => {
    set({ selectedSpaces: spaceIds })
  },

  addSelectedSpace: (spaceId: string) => {
    set((state) => ({
      selectedSpaces: state.selectedSpaces.includes(spaceId) 
        ? state.selectedSpaces 
        : [...state.selectedSpaces, spaceId]
    }))
  },

  removeSelectedSpace: (spaceId: string) => {
    set((state) => ({
      selectedSpaces: state.selectedSpaces.filter(id => id !== spaceId)
    }))
  },

  clearSelectedSpaces: () => {
    set({ selectedSpaces: [] })
  },

  // Utility actions
  clearError: () => {
    set({ error: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  refreshSpaces: async () => {
    const state = get()
    await state.loadSpaces(state.pagination.page)
  },
}))

export default useSpaceStore
