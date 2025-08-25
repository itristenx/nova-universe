import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { cn } from '@utils/index';
import { fileStorageService, type UploadedFile } from '@/services/fileStorage';

interface FilePreviewProps {
  file: UploadedFile | null;
  onClose: () => void;
  className?: string;
}

export function FilePreview({ file, onClose, className }: FilePreviewProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setDownloadUrl(null);
      setError(null);
      return;
    }

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = await fileStorageService.getDownloadUrl(file.key, 3600);
        setDownloadUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [file]);

  const handleDownload = async () => {
    if (!file || !downloadUrl) return;

    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isImage = file?.contentType.startsWith('image/');
  const isPDF = file?.contentType === 'application/pdf';

  if (!file) return null;

  return (
    <div
      className={cn(
        'bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black',
        className,
      )}
    >
      <div className="relative mx-4 max-h-full w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-gray-400">
              {isImage ? <PhotoIcon className="h-6 w-6" /> : <DocumentIcon className="h-6 w-6" />}
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
              className="bg-nova-600 hover:bg-nova-700 focus:ring-nova-500 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
              <div className="flex min-h-96 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700">
                {isImage ? (
                  <img
                    src={downloadUrl}
                    alt={file.originalName}
                    className="max-h-96 max-w-full rounded-lg"
                  />
                ) : isPDF ? (
                  <iframe
                    src={downloadUrl}
                    className="h-96 w-full rounded-lg"
                    title={file.originalName}
                  />
                ) : (
                  <div className="py-12 text-center">
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
                  <dd className="text-gray-500 dark:text-gray-400">
                    {formatDate(file.uploadedAt)}
                  </dd>
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
                  <dd className="font-mono text-xs text-gray-500 dark:text-gray-400">{file.id}</dd>
                </div>
                {file.metadata && Object.keys(file.metadata).length > 0 && (
                  <div className="col-span-2">
                    <dt className="mb-2 font-medium text-gray-900 dark:text-gray-100">Metadata</dt>
                    <dd className="text-gray-500 dark:text-gray-400">
                      <pre className="overflow-auto rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
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
  );
}
