import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { fileStorageService, type UploadedFile } from '@services/fileStorage';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { cn } from '@utils/index';

interface FileUploadProps {
  context: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: Record<string, string[]>;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  className?: string;
  disabled?: boolean;
}

export function EnhancedFileUpload({
  context,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = { '*/*': [] },
  onFilesUploaded,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || uploading) return;

      setErrors([]);
      setUploading(true);

      const filesToUpload = acceptedFiles.slice(0, maxFiles - uploadedFiles.length);

      for (const file of filesToUpload) {
        if (file.size > maxFileSize) {
          setErrors((prev) => [
            ...prev,
            `File "${file.name}" is too large (max ${formatFileSize(maxFileSize)})`,
          ]);
          continue;
        }

        try {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

          const uploadedFile = await fileStorageService.uploadFile(file, {
            context,
            onProgress: (progress) => {
              setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
            },
          });

          setUploadedFiles((prev) => {
            const updated = [...prev, uploadedFile];
            onFilesUploaded?.(updated);
            return updated;
          });

          setUploadProgress((prev) => {
            const { [file.name]: _, ...rest } = prev;
            return rest;
          });
        } catch (_error) {
          console.error('Upload failed:', error);
          setErrors((prev) => [
            ...prev,
            `Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          ]);
          setUploadProgress((prev) => {
            const { [file.name]: _, ...rest } = prev;
            return rest;
          });
        }
      }

      setUploading(false);
    },
    [context, disabled, uploadedFiles.length, maxFiles, maxFileSize, onFilesUploaded],
  );

  const removeFile = async (fileId: string) => {
    try {
      await fileStorageService.deleteFile(fileId);
      setUploadedFiles((prev) => {
        const updated = prev.filter((f) => f.id !== fileId);
        onFilesUploaded?.(updated);
        return updated;
      });
    } catch (_error) {
      console.error('Failed to delete file:', error);
      setErrors((prev) => [...prev, 'Failed to delete file']);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple: maxFiles > 1,
    disabled: disabled || uploading || uploadedFiles.length >= maxFiles,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8" />;
    }
    return <DocumentIcon className="h-8 w-8" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragActive && !isDragReject && 'border-nova-500 bg-nova-50 dark:bg-nova-950',
          isDragReject && 'border-red-500 bg-red-50 dark:bg-red-950',
          (disabled || uploading || uploadedFiles.length >= maxFiles) &&
            'cursor-not-allowed opacity-50',
          !isDragActive &&
            !isDragReject &&
            'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <CloudArrowUpIcon className="mb-4 h-12 w-12 text-gray-400" />

          {isDragActive ? (
            isDragReject ? (
              <p className="text-sm text-red-600 dark:text-red-400">Some files are not supported</p>
            ) : (
              <p className="text-nova-600 dark:text-nova-400 text-sm">Drop the files here...</p>
            )
          ) : (
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {Object.keys(acceptedFileTypes).join(', ')} up to {formatFileSize(maxFileSize)}
              </p>
              {maxFiles > 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Maximum {maxFiles} files ({uploadedFiles.length} uploaded)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {fileName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="bg-nova-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 dark:text-gray-500">
                    {getFileIcon(file.contentType)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 transition-colors hover:text-red-500"
                    aria-label="Remove file"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950"
            >
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" className="mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Uploading files...</span>
        </div>
      )}
    </div>
  );
}

export default EnhancedFileUpload;
