import { useState, useEffect, useCallback } from 'react'
import { 
  MagnifyingGlassIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentIcon,
  PhotoIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { cn } from '@utils/index'
import { fileStorageService, type UploadedFile } from '@/services/fileStorage'

interface FileManagerProps {
  context?: string
  onFileSelect?: (file: UploadedFile) => void
  selectable?: boolean
  showActions?: boolean
  className?: string
}

interface FilterOptions {
  search: string
  context: string
  sortBy: 'name' | 'date' | 'size'
  sortOrder: 'asc' | 'desc'
}

export function FileManager({
  context,
  onFileSelect,
  selectable = false,
  showActions = true,
  className
}: FileManagerProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    context: context || 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // This would typically call a list files API endpoint
      // For now, we'll simulate it
      const mockFiles: UploadedFile[] = []
      setFiles(mockFiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleFileSelect = useCallback((file: UploadedFile) => {
    if (selectable) {
      setSelectedFiles(prev => {
        const newSet = new Set(prev)
        if (newSet.has(file.id)) {
          newSet.delete(file.id)
        } else {
          newSet.add(file.id)
        }
        return newSet
      })
    }
    onFileSelect?.(file)
  }, [selectable, onFileSelect])

  const handleDownload = useCallback(async (file: UploadedFile) => {
    try {
      const downloadUrl = await fileStorageService.getDownloadUrl(file.key)
      window.open(downloadUrl, '_blank')
    } catch (err) {
      console.error('Download failed:', err)
    }
  }, [])

  const handleDelete = useCallback(async (file: UploadedFile) => {
    if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return
    }

    try {
      await fileStorageService.deleteFile(file.key)
      setFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }, [])

  const handleBulkDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)) {
      return
    }

    try {
      const filesToDelete = files.filter(f => selectedFiles.has(f.id))
      await Promise.all(filesToDelete.map(f => fileStorageService.deleteFile(f.key)))
      setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)))
      setSelectedFiles(new Set())
    } catch (err) {
      console.error('Bulk delete failed:', err)
    }
  }, [selectedFiles, files])

  const getFileIcon = (file: UploadedFile) => {
    if (file.contentType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8" />
    }
    return <DocumentIcon className="h-8 w-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredFiles = files.filter(file => {
    if (filters.search && !file.originalName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.context !== 'all' && file.context !== filters.context) {
      return false
    }
    return true
  }).sort((a, b) => {
    let comparison = 0
    switch (filters.sortBy) {
      case 'name':
        comparison = a.originalName.localeCompare(b.originalName)
        break
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        break
      case 'size':
        comparison = a.size - b.size
        break
    }
    return filters.sortOrder === 'desc' ? -comparison : comparison
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading files...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <div className="text-sm text-red-700 dark:text-red-400">
          Error loading files: {error}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with search and filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-64 rounded-md border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:border-nova-500 focus:outline-none focus:ring-1 focus:ring-nova-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          
          <select
            value={filters.context}
            onChange={(e) => setFilters(prev => ({ ...prev, context: e.target.value }))}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-nova-500 focus:outline-none focus:ring-1 focus:ring-nova-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            aria-label="Filter by context"
          >
            <option value="all">All Contexts</option>
            <option value="ticketAttachments">Ticket Attachments</option>
            <option value="profileImages">Profile Images</option>
            <option value="siteAssets">Site Assets</option>
            <option value="systemFiles">System Files</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {selectedFiles.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center space-x-1 rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete ({selectedFiles.size})</span>
            </button>
          )}
          
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder]
              setFilters(prev => ({ ...prev, sortBy, sortOrder }))
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-nova-500 focus:outline-none focus:ring-1 focus:ring-nova-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            aria-label="Sort files"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
        </div>
      </div>

      {/* File Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No files</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filters.search || filters.context !== 'all' 
              ? 'No files match your current filters'
              : 'Upload some files to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                'relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
                selectable && selectedFiles.has(file.id) && 'ring-2 ring-nova-500',
                selectable && 'cursor-pointer'
              )}
              onClick={() => selectable && handleFileSelect(file)}
            >
              {selectable && (
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={() => handleFileSelect(file)}
                    className="h-4 w-4 rounded border-gray-300 text-nova-600 focus:ring-nova-500"
                    aria-label={`Select ${file.originalName}`}
                  />
                </div>
              )}

              <div className="flex flex-col items-center space-y-3">
                <div className="text-gray-400">
                  {getFileIcon(file)}
                </div>
                
                <div className="w-full text-center">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(file.uploadedAt)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file.storageProvider}
                  </p>
                </div>

                {showActions && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileSelect?.(file)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(file)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(file)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
