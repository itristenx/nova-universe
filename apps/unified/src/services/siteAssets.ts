import { apiClient } from './api';

export interface SiteAsset {
  id: string;
  name: string;
  type: 'logo' | 'banner' | 'icon' | 'background' | 'document' | 'other';
  category: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface AssetFilters {
  type?: string;
  category?: string;
  search?: string;
  isActive?: boolean;
}

export interface AssetUploadData {
  name: string;
  type: 'logo' | 'banner' | 'icon' | 'background' | 'document' | 'other';
  category: string;
  file: File;
  metadata?: Record<string, any>;
}

export interface AssetUpdateData {
  name?: string;
  type?: 'logo' | 'banner' | 'icon' | 'background' | 'document' | 'other';
  category?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

class SiteAssetsService {
  /**
   * Get all site assets with optional filtering
   */
  async getAssets(filters?: AssetFilters): Promise<SiteAsset[]> {
    try {
      const response = await apiClient.get('/site-assets', {
        params: filters,
      });
      return (response.data as any)?.data || [];
    } catch (_error) {
      console.error('Failed to fetch site assets:', error);
      throw new Error('Failed to load site assets');
    }
  }

  /**
   * Get asset by ID
   */
  async getAssetById(id: string): Promise<SiteAsset | null> {
    try {
      const response = await apiClient.get(`/site-assets/${id}`);
      return (response.data as any)?.data || null;
    } catch (_error) {
      console.error('Failed to fetch asset:', error);
      return null;
    }
  }

  /**
   * Upload new asset
   */
  async uploadAsset(assetData: AssetUploadData): Promise<SiteAsset | null> {
    try {
      const formData = new FormData();
      formData.append('file', assetData.file);
      formData.append('name', assetData.name);
      formData.append('type', assetData.type);
      formData.append('category', assetData.category);

      if (assetData.metadata) {
        formData.append('metadata', JSON.stringify(assetData.metadata));
      }

      const response = await apiClient.post('/site-assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return (response.data as any)?.data || null;
    } catch (_error) {
      console.error('Failed to upload asset:', error);
      throw new Error('Failed to upload asset');
    }
  }

  /**
   * Update existing asset
   */
  async updateAsset(id: string, updates: AssetUpdateData): Promise<SiteAsset | null> {
    try {
      const response = await apiClient.patch(`/site-assets/${id}`, updates);
      return (response.data as any)?.data || null;
    } catch (_error) {
      console.error('Failed to update asset:', error);
      throw new Error('Failed to update asset');
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/site-assets/${id}`);
      return true;
    } catch (_error) {
      console.error('Failed to delete asset:', error);
      throw new Error('Failed to delete asset');
    }
  }

  /**
   * Set asset as active/inactive
   */
  async setAssetActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await apiClient.patch(`/site-assets/${id}/status`, { isActive });
      return true;
    } catch (_error) {
      console.error('Failed to update asset status:', error);
      throw new Error('Failed to update asset status');
    }
  }

  /**
   * Get asset usage statistics
   */
  async getAssetStats(): Promise<{
    totalAssets: number;
    totalSize: number;
    typeBreakdown: Record<string, number>;
    recentUploads: number;
  }> {
    try {
      const response = await apiClient.get('/site-assets/stats');
      return (
        (response.data as any)?.data || {
          totalAssets: 0,
          totalSize: 0,
          typeBreakdown: {},
          recentUploads: 0,
        }
      );
    } catch (_error) {
      console.error('Failed to fetch asset stats:', error);
      return {
        totalAssets: 0,
        totalSize: 0,
        typeBreakdown: {},
        recentUploads: 0,
      };
    }
  }

  /**
   * Bulk delete assets
   */
  async bulkDeleteAssets(assetIds: string[]): Promise<boolean> {
    try {
      await apiClient.post('/site-assets/bulk-delete', { assetIds });
      return true;
    } catch (_error) {
      console.error('Failed to bulk delete assets:', error);
      throw new Error('Failed to delete selected assets');
    }
  }

  /**
   * Download asset
   */
  async downloadAsset(id: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/site-assets/${id}/download`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (_error) {
      console.error('Failed to download asset:', error);
      throw new Error('Failed to download asset');
    }
  }

  /**
   * Get asset categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get('/site-assets/categories');
      return (response.data as any)?.data || [];
    } catch (_error) {
      console.error('Failed to fetch categories:', error);
      return ['General', 'Branding', 'UI', 'Marketing', 'Documentation'];
    }
  }
}

export const siteAssetsService = new SiteAssetsService();
