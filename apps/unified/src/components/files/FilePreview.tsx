import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { cn } from '@utils/index'
import { fileStorageService, type UploadedFile } from '@/services/fileStorage'

interface FilePreviewProps {
  file: UploadedFile | null
  onClose: () => void
  className?: string
}

export function FilePreview({ file, onClose, className }: FilePreviewProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setDownloadUrl(null)
      setError(null)
      return
    }

    const loadPreview = async () => {
      try {
        setLoading(true)
        setError(null)
        const url = await fileStorageService.getDownloadUrl(file.key, 3600)
        setDownloadUrl(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview')
      } finally {
        setLoading(false)
      }
    }

    loadPreview()
  }, [file])

  const handleDownload = async () => {
    if (!file || !downloadUrl) return
    
    try {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download failed:', err)
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isImage = file?.contentType.startsWith('image/')
  const isPDF = file?.contentType === 'application/pdf'

  if (!file) return null

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75', className)}>
      <div className="relative max-h-full max-w-4xl w-full mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-gray-400">
              {isImage ? (
                <PhotoIcon className="h-6 w-6" />
              ) : (
                <DocumentIcon className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {file.originalName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)} • {file.contentType}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="rounded-md bg-nova-600 px-3 py-2 text-sm text-white hover:bg-nova-700 focus:outline-none focus:ring-2 focus:ring-nova-500 focus:ring-offset-2"
              title="Download file"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="Close preview"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading preview...</div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="text-sm text-red-700 dark:text-red-400">
                Error loading preview: {error}
              </div>
            </div>
          )}

          {downloadUrl && !loading && !error && (
            <div className="space-y-4">
              {/* Preview Area */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 min-h-96 flex items-center justify-center">
                {isImage ? (
                  <img
                    src={downloadUrl}
                    alt={file.originalName}
                    className="max-w-full max-h-96 rounded-lg"
                  />
                ) : isPDF ? (
                  <iframe
                    src={downloadUrl}
                    className="w-full h-96 rounded-lg"
                    title={file.originalName}
                  />
                ) : (
                  <div className="text-center py-12">
                    <DocumentIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Preview not available
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This file type cannot be previewed. You can download it to view.
                    </p>
                  </div>
                )}
              </div>

              {/* File Metadata */}
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">Upload Date</dt>
                  <dd className="text-gray-500 dark:text-gray-400">{formatDate(file.uploadedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">Storage Provider</dt>
                  <dd className="text-gray-500 dark:text-gray-400">{file.storageProvider}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">Context</dt>
                  <dd className="text-gray-500 dark:text-gray-400">{file.context}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">File ID</dt>
                  <dd className="text-gray-500 dark:text-gray-400 font-mono text-xs">{file.id}</dd>
                </div>
                {file.metadata && Object.keys(file.metadata).length > 0 && (
                  <div className="col-span-2">
                    <dt className="font-medium text-gray-900 dark:text-gray-100 mb-2">Metadata</dt>
                    <dd className="text-gray-500 dark:text-gray-400">
                      <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(file.metadata, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
