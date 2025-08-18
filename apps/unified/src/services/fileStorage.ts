import { apiClient } from './api'

// File upload types
export interface FileUploadResponse {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
  metadata?: Record<string, unknown>
}

export interface FileMetadata {
  context?: string
  category?: string
  tags?: string[]
  description?: string
  [key: string]: unknown
}

export interface FileUploadOptions {
  metadata?: FileMetadata
  context?: string
  storageProvider?: string
  onProgress?: (progress: number) => void
}

export interface FileListOptions {
  context?: string
  category?: string
  limit?: number
  offset?: number
  search?: string
}

export interface UploadedFile {
  id: string
  key: string
  filename: string
  originalName: string
  size: number
  contentType: string
  url: string
  storageProvider: string
  context: string
  uploadedAt: string
  metadata?: Record<string, unknown>
}

export interface FileUploadProgress {
  fileId: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export interface FileUploadProgress {
  fileId: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export class FileStorageService {
  /**
   * Upload a single file to the hybrid storage system
   */
  async uploadFile(
    file: File, 
    options: FileUploadOptions = {}
  ): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options.context) {
      formData.append('context', options.context)
    }
    
    if (options.storageProvider) {
      formData.append('storageProvider', options.storageProvider)
    }
    
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata))
    }

    const response = await apiClient.post<UploadedFile>('/api/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    if (!response.data) {
      throw new Error('Upload failed: No data returned')
    }
    
    return response.data
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadFiles(
    files: File[], 
    options: FileUploadOptions = {},
    onProgress?: (progress: FileUploadProgress[]) => void
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        if (onProgress) {
          onProgress([{ 
            fileId: `${index}`, 
            progress: 0, 
            status: 'uploading' 
          }])
        }

        const result = await this.uploadFile(file, options)
        
        if (onProgress) {
          onProgress([{ 
            fileId: `${index}`, 
            progress: 100, 
            status: 'completed' 
          }])
        }
        
        return result
      } catch (error) {
        if (onProgress) {
          onProgress([{ 
            fileId: `${index}`, 
            progress: 0, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          }])
        }
        throw error
      }
    })

    return Promise.all(uploadPromises)
  }

  /**
   * Get file information and download URL
   */
  async getFile(key: string): Promise<UploadedFile> {
    const response = await apiClient.get<UploadedFile>(`/api/assets/file/${encodeURIComponent(key)}`)
    if (!response.data) {
      throw new Error(`File not found: ${key}`)
    }
    return response.data
  }

  /**
   * Get a signed download URL for a file
   */
  async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const response = await apiClient.get<{ url: string }>(`/api/assets/download/${encodeURIComponent(key)}`, {
      params: { expiresIn }
    })
    if (!response.data?.url) {
      throw new Error(`Failed to get download URL for: ${key}`)
    }
    return response.data.url
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    await apiClient.delete(`/api/assets/file/${encodeURIComponent(key)}`)
  }

  /**
   * Check if a file exists in storage
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await apiClient.get(`/api/assets/file/${encodeURIComponent(key)}`)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage system information
   */
  async getStorageInfo(): Promise<{
    providers: string[]
    hybridRules: Record<string, unknown>
    statistics: {
      totalFiles: number
      totalSize: number
      providerDistribution: Record<string, number>
    }
  }> {
    const response = await apiClient.get<{
      providers: string[]
      hybridRules: Record<string, unknown>
      statistics: {
        totalFiles: number
        totalSize: number
        providerDistribution: Record<string, number>
      }
    }>('/api/assets/storage-info')
    
    if (!response.data) {
      throw new Error('Failed to get storage information')
    }
    
    return response.data
  }

  /**
   * Upload file for specific ticket attachment
   */
  async uploadTicketAttachment(
    ticketId: string, 
    file: File,
    metadata?: Record<string, unknown>
  ): Promise<UploadedFile> {
    return this.uploadFile(file, {
      context: 'ticketAttachments',
      metadata: {
        ticketId,
        ...metadata
      }
    })
  }

  /**
   * Upload profile image with optimization
   */
  async uploadProfileImage(
    userId: string,
    file: File
  ): Promise<UploadedFile> {
    // Validate that it's an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    return this.uploadFile(file, {
      context: 'profileImages',
      metadata: {
        userId,
        imageType: 'profile'
      }
    })
  }

  /**
   * Upload site assets (logos, branding)
   */
  async uploadSiteAsset(
    file: File,
    assetType: 'logo' | 'favicon' | 'banner' | 'background',
    metadata?: Record<string, unknown>
  ): Promise<UploadedFile> {
    return this.uploadFile(file, {
      context: 'siteAssets',
      storageProvider: 'local', // Site assets should stay local for speed
      metadata: {
        assetType,
        ...metadata
      }
    })
  }

  /**
   * Bulk upload for system backups/exports
   */
  async uploadSystemFile(
    file: File,
    fileType: 'backup' | 'export' | 'report' | 'configuration',
    metadata?: Record<string, unknown>
  ): Promise<UploadedFile> {
    return this.uploadFile(file, {
      context: 'systemFiles',
      storageProvider: 's3', // System files prefer S3 for durability
      metadata: {
        fileType,
        systemGenerated: true,
        ...metadata
      }
    })
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService()
