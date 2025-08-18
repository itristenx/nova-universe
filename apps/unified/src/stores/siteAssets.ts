import { create } from 'zustand'
import { siteAssetsService } from '@services/siteAssets'
import type {
  SiteAsset,
  AssetFilters,
  AssetUploadData,
  AssetUpdateData
} from '@services/siteAssets'
import toast from 'react-hot-toast'

interface SiteAssetsState {
  // Data
  assets: SiteAsset[]
  selectedAssets: Set<string>
  categories: string[]
  stats: {
    totalAssets: number
    totalSize: number
    typeBreakdown: Record<string, number>
    recentUploads: number
  } | null

  // UI State
  isLoading: boolean
  isUploading: boolean
  uploadProgress: number
  error: string | null
  
  // Filters
  filters: AssetFilters

  // Actions
  loadAssets: (filters?: AssetFilters) => Promise<void>
  uploadAsset: (assetData: AssetUploadData) => Promise<SiteAsset | null>
  updateAsset: (id: string, updates: AssetUpdateData) => Promise<SiteAsset | null>
  deleteAsset: (id: string) => Promise<void>
  toggleAssetActive: (id: string) => Promise<void>
  downloadAsset: (id: string, filename: string) => Promise<void>
  
  // Selection management
  selectAsset: (assetId: string) => void
  selectAllAssets: () => void
  clearSelection: () => void
  toggleAssetSelection: (assetId: string) => void
  bulkDeleteAssets: () => Promise<void>

  // Filters
  setFilters: (filters: Partial<AssetFilters>) => void
  clearFilters: () => void

  // Categories
  loadCategories: () => Promise<void>

  // Stats
  loadStats: () => Promise<void>

  // Utility
  clearError: () => void
}

export const useSiteAssetsStore = create<SiteAssetsState>((set, get) => ({
  // Initial state
  assets: [],
  selectedAssets: new Set<string>(),
  categories: [],
  stats: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  filters: {},

  // Load assets
  loadAssets: async (filters) => {
    try {
      set({ isLoading: true, error: null })
      
      const currentFilters = filters || get().filters
      const assets = await siteAssetsService.getAssets(currentFilters)
      
      set({
        assets,
        isLoading: false,
        filters: currentFilters
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assets'
      set({
        error: errorMessage,
        isLoading: false
      })
      toast.error(errorMessage)
    }
  },

  // Upload asset
  uploadAsset: async (assetData) => {
    try {
      set({ isUploading: true, uploadProgress: 0, error: null })
      
      const asset = await siteAssetsService.uploadAsset(assetData)
      
      if (asset) {
        // Add to assets list
        const currentAssets = get().assets
        set({
          assets: [asset, ...currentAssets],
          isUploading: false,
          uploadProgress: 100
        })
        
        toast.success('Asset uploaded successfully')
        
        // Reload stats
        get().loadStats()
      }
      
      return asset
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload asset'
      set({
        error: errorMessage,
        isUploading: false,
        uploadProgress: 0
      })
      toast.error(errorMessage)
      return null
    }
  },

  // Update asset
  updateAsset: async (id, updates) => {
    try {
      set({ error: null })
      
      const updatedAsset = await siteAssetsService.updateAsset(id, updates)
      
      if (updatedAsset) {
        // Update in assets list
        const currentAssets = get().assets
        const updatedAssets = currentAssets.map(asset => 
          asset.id === id ? updatedAsset : asset
        )
        
        set({ assets: updatedAssets })
        toast.success('Asset updated successfully')
      }
      
      return updatedAsset
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update asset'
      set({ error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  // Delete asset
  deleteAsset: async (id) => {
    try {
      set({ error: null })
      
      await siteAssetsService.deleteAsset(id)
      
      // Remove from assets list
      const currentAssets = get().assets
      const updatedAssets = currentAssets.filter(asset => asset.id !== id)
      
      set({ assets: updatedAssets })
      toast.success('Asset deleted successfully')
      
      // Reload stats
      get().loadStats()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete asset'
      set({ error: errorMessage })
      toast.error(errorMessage)
    }
  },

  // Toggle asset active status
  toggleAssetActive: async (id) => {
    try {
      const currentAssets = get().assets
      const asset = currentAssets.find(a => a.id === id)
      
      if (!asset) return
      
      const newStatus = !asset.isActive
      await siteAssetsService.setAssetActive(id, newStatus)
      
      // Update in assets list
      const updatedAssets = currentAssets.map(a => 
        a.id === id ? { ...a, isActive: newStatus } : a
      )
      
      set({ assets: updatedAssets })
      toast.success(`Asset ${newStatus ? 'activated' : 'deactivated'}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update asset status'
      set({ error: errorMessage })
      toast.error(errorMessage)
    }
  },

  // Download asset
  downloadAsset: async (id, filename) => {
    try {
      const blob = await siteAssetsService.downloadAsset(id)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Asset downloaded')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download asset'
      toast.error(errorMessage)
    }
  },

  // Selection management
  selectAsset: (assetId) => {
    const currentSelection = get().selectedAssets
    const newSelection = new Set(currentSelection)
    newSelection.add(assetId)
    set({ selectedAssets: newSelection })
  },

  selectAllAssets: () => {
    const allAssetIds = get().assets.map(asset => asset.id)
    set({ selectedAssets: new Set(allAssetIds) })
  },

  clearSelection: () => {
    set({ selectedAssets: new Set<string>() })
  },

  toggleAssetSelection: (assetId) => {
    const currentSelection = get().selectedAssets
    const newSelection = new Set(currentSelection)
    
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId)
    } else {
      newSelection.add(assetId)
    }
    
    set({ selectedAssets: newSelection })
  },

  // Bulk delete
  bulkDeleteAssets: async () => {
    try {
      const selectedAssets = get().selectedAssets
      if (selectedAssets.size === 0) return
      
      const assetIds = Array.from(selectedAssets)
      await siteAssetsService.bulkDeleteAssets(assetIds)
      
      // Remove from assets list
      const currentAssets = get().assets
      const updatedAssets = currentAssets.filter(asset => !selectedAssets.has(asset.id))
      
      set({
        assets: updatedAssets,
        selectedAssets: new Set<string>()
      })
      
      toast.success(`${assetIds.length} assets deleted`)
      
      // Reload stats
      get().loadStats()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete assets'
      set({ error: errorMessage })
      toast.error(errorMessage)
    }
  },

  // Filters
  setFilters: (newFilters) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }
    set({ filters: updatedFilters })
    
    // Auto-reload assets with new filters
    setTimeout(() => {
      get().loadAssets(updatedFilters)
    }, 100)
  },

  clearFilters: () => {
    set({ filters: {} })
    setTimeout(() => {
      get().loadAssets({})
    }, 100)
  },

  // Load categories
  loadCategories: async () => {
    try {
      const categories = await siteAssetsService.getCategories()
      set({ categories })
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  },

  // Load stats
  loadStats: async () => {
    try {
      const stats = await siteAssetsService.getAssetStats()
      set({ stats })
    } catch (error) {
      console.error('Failed to load asset stats:', error)
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
