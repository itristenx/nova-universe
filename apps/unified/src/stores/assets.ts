import { create } from 'zustand';
import {
  assetService,
  type AssetFilters,
  type CreateAssetData,
  type UpdateAssetData,
  type BulkAssetAction,
} from '@services/assets';
import type {
  Asset,
  AssetCategory,
  AssetType,
  AssetLocation,
  MaintenanceRecord,
  PaginatedResponse,
  SortOption,
} from '@/types';

interface AssetState {
  // State
  assets: Asset[];
  selectedAssets: string[];
  currentAsset: Asset | null;
  categories: AssetCategory[];
  types: AssetType[];
  locations: AssetLocation[];
  maintenanceRecords: MaintenanceRecord[];
  isLoading: boolean;
  error: string | null;
  filters: AssetFilters;
  sort: SortOption[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    retired: number;
    assigned: number;
    unassigned: number;
    overdue: number;
    totalValue: number;
    byCategory: Record<string, number>;
    byLocation: Record<string, number>;
    byStatus: Record<string, number>;
    maintenanceDue: number;
    warrantyExpiring: number;
  } | null;

  // Actions
  loadAssets: (page?: number) => Promise<void>;
  loadAsset: (id: string) => Promise<void>;
  createAsset: (data: CreateAssetData) => Promise<Asset>;
  updateAsset: (id: string, data: UpdateAssetData) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;
  bulkUpdateAssets: (action: BulkAssetAction) => Promise<void>;
  assignAsset: (assetId: string, userId: string, notes?: string) => Promise<void>;
  unassignAsset: (assetId: string, notes?: string) => Promise<void>;
  relocateAsset: (assetId: string, locationId: string, notes?: string) => Promise<void>;
  checkoutAsset: (
    assetId: string,
    userId: string,
    dueDate?: string,
    notes?: string,
  ) => Promise<void>;
  checkinAsset: (assetId: string, condition?: string, notes?: string) => Promise<void>;
  setFilters: (filters: Partial<AssetFilters>) => void;
  setSortOrder: (sort: SortOption[]) => void;
  setSelectedAssets: (assetIds: string[]) => void;
  addSelectedAsset: (assetId: string) => void;
  removeSelectedAsset: (assetId: string) => void;
  clearSelectedAssets: () => void;
  loadCategories: () => Promise<void>;
  loadTypes: () => Promise<void>;
  loadLocations: () => Promise<void>;
  loadMaintenanceRecords: (assetId: string) => Promise<void>;
  loadStats: () => Promise<void>;
  searchAssets: (query: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshAssets: () => Promise<void>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  // Initial state
  assets: [],
  selectedAssets: [],
  currentAsset: null,
  categories: [],
  types: [],
  locations: [],
  maintenanceRecords: [],
  isLoading: false,
  error: null,
  filters: {},
  sort: [{ field: 'createdAt', direction: 'desc' }],
  pagination: {
    page: 1,
    perPage: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  stats: null,

  // Load assets with pagination and filters
  loadAssets: async (page?: number) => {
    const state = get();
    const currentPage = page ?? state.pagination.page;

    set({ isLoading: true, error: null });

    try {
      const response: PaginatedResponse<Asset> = await assetService.getAssets(
        currentPage,
        state.pagination.perPage,
        state.filters,
        state.sort,
      );

      set({
        assets: response.data,
        pagination: {
          page: response.meta.page,
          perPage: response.meta.perPage,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrev: response.meta.hasPrev,
        },
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load assets',
      });
    }
  },

  // Load single asset
  loadAsset: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const asset = await assetService.getAsset(id);
      set({
        currentAsset: asset,
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        currentAsset: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load asset',
      });
    }
  },

  // Create new asset
  createAsset: async (data: CreateAssetData) => {
    set({ isLoading: true, error: null });

    try {
      const asset = await assetService.createAsset(data);

      // Add new asset to the beginning of the list
      set((state) => ({
        assets: [asset, ...state.assets],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        isLoading: false,
        error: null,
      }));

      return asset;
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create asset',
      });
      throw error;
    }
  },

  // Update asset
  updateAsset: async (id: string, data: UpdateAssetData) => {
    set({ isLoading: true, error: null });

    try {
      const updatedAsset = await assetService.updateAsset(id, data);

      set((state) => ({
        assets: state.assets.map((asset) => (asset.id === id ? updatedAsset : asset)),
        currentAsset: state.currentAsset?.id === id ? updatedAsset : state.currentAsset,
        isLoading: false,
        error: null,
      }));

      return updatedAsset;
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update asset',
      });
      throw error;
    }
  },

  // Delete asset
  deleteAsset: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await assetService.deleteAsset(id);

      set((state) => ({
        assets: state.assets.filter((asset) => asset.id !== id),
        selectedAssets: state.selectedAssets.filter((assetId) => assetId !== id),
        currentAsset: state.currentAsset?.id === id ? null : state.currentAsset,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1,
        },
        isLoading: false,
        error: null,
      }));
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete asset',
      });
      throw error;
    }
  },

  // Bulk update assets
  bulkUpdateAssets: async (action: BulkAssetAction) => {
    set({ isLoading: true, error: null });

    try {
      await assetService.bulkUpdateAssets(action);

      // Refresh assets to get updated data
      await get().loadAssets();

      set({
        selectedAssets: [],
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update assets',
      });
      throw error;
    }
  },

  // Assign asset
  assignAsset: async (assetId: string, userId: string, notes?: string) => {
    try {
      const updatedAsset = await assetService.assignAsset(assetId, userId, notes);

      set((state) => ({
        assets: state.assets.map((asset) => (asset.id === assetId ? updatedAsset : asset)),
        currentAsset: state.currentAsset?.id === assetId ? updatedAsset : state.currentAsset,
      }));
    } catch (_error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to assign asset',
      });
      throw error;
    }
  },

  // Unassign asset
  unassignAsset: async (assetId: string, notes?: string) => {
    try {
      const updatedAsset = await assetService.unassignAsset(assetId, notes);

      set((state) => ({
        assets: state.assets.map((asset) => (asset.id === assetId ? updatedAsset : asset)),
        currentAsset: state.currentAsset?.id === assetId ? updatedAsset : state.currentAsset,
      }));
    } catch (_error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to unassign asset',
      });
      throw error;
    }
  },

  // Relocate asset
  relocateAsset: async (assetId: string, locationId: string, notes?: string) => {
    try {
      const updatedAsset = await assetService.relocateAsset(assetId, locationId, notes);

      set((state) => ({
        assets: state.assets.map((asset) => (asset.id === assetId ? updatedAsset : asset)),
        currentAsset: state.currentAsset?.id === assetId ? updatedAsset : state.currentAsset,
      }));
    } catch (_error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to relocate asset',
      });
      throw error;
    }
  },

  // Checkout asset
  checkoutAsset: async (assetId: string, userId: string, dueDate?: string, notes?: string) => {
    try {
      const updatedAsset = await assetService.checkoutAsset(assetId, userId, dueDate, notes);

      set((state) => ({
        assets: state.assets.map((asset) => (asset.id === assetId ? updatedAsset : asset)),
        currentAsset: state.currentAsset?.id === assetId ? updatedAsset : state.currentAsset,
      }));
    } catch (_error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to checkout asset',
      });
      throw error;
    }
  },

  // Checkin asset
  checkinAsset: async (assetId: string, condition?: string, notes?: string) => {
    try {
      const updatedAsset = await assetService.checkinAsset(assetId, condition, notes);

      set((state) => ({
        assets: state.assets.map((asset) => (asset.id === assetId ? updatedAsset : asset)),
        currentAsset: state.currentAsset?.id === assetId ? updatedAsset : state.currentAsset,
      }));
    } catch (_error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to checkin asset',
      });
      throw error;
    }
  },

  // Set filters and reload assets
  setFilters: (filters: Partial<AssetFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page
    }));

    // Reload assets with new filters
    get().loadAssets(1);
  },

  // Set sort order and reload assets
  setSortOrder: (sort: SortOption[]) => {
    set({ sort });
    get().loadAssets();
  },

  // Selection management
  setSelectedAssets: (assetIds: string[]) => {
    set({ selectedAssets: assetIds });
  },

  addSelectedAsset: (assetId: string) => {
    set((state) => ({
      selectedAssets: [...state.selectedAssets, assetId],
    }));
  },

  removeSelectedAsset: (assetId: string) => {
    set((state) => ({
      selectedAssets: state.selectedAssets.filter((id) => id !== assetId),
    }));
  },

  clearSelectedAssets: () => {
    set({ selectedAssets: [] });
  },

  // Load reference data
  loadCategories: async () => {
    try {
      const categories = await assetService.getCategories();
      set({ categories });
    } catch (_error) {
      console.error('Failed to load asset categories:', error);
    }
  },

  loadTypes: async () => {
    try {
      const types = await assetService.getTypes();
      set({ types });
    } catch (_error) {
      console.error('Failed to load asset types:', error);
    }
  },

  loadLocations: async () => {
    try {
      const locations = await assetService.getLocations();
      set({ locations });
    } catch (_error) {
      console.error('Failed to load asset locations:', error);
    }
  },

  // Load maintenance records
  loadMaintenanceRecords: async (assetId: string) => {
    try {
      const records = await assetService.getMaintenanceRecords(assetId);
      set({ maintenanceRecords: records });
    } catch (_error) {
      console.error('Failed to load maintenance records:', error);
    }
  },

  // Load asset statistics
  loadStats: async () => {
    try {
      const stats = await assetService.getAssetStats();
      set({ stats });
    } catch (_error) {
      console.error('Failed to load asset stats:', error);
    }
  },

  // Search assets
  searchAssets: async (query: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await assetService.searchAssets(query);
      set({
        assets: response.data,
        pagination: {
          page: response.meta.page,
          perPage: response.meta.perPage,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrev: response.meta.hasPrev,
        },
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to search assets',
      });
    }
  },

  // Refresh current assets
  refreshAssets: async () => {
    await get().loadAssets();
  },

  // Utility actions
  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
