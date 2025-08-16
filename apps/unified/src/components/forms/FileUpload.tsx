import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { cn } from '@utils/index'

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: string
  className?: string
}

export function FileUpload({ 
  onFilesAdded, 
  maxFiles = 10, 
  maxSize = 10 * 1024 * 1024,
  accept = 'image/*,.pdf,.doc,.docx,.txt,.zip',
  className 
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles)
  }, [onFilesAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = []
      return acc
    }, {} as Record<string, string[]>)
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        isDragActive && 'border-nova-500 bg-nova-50 dark:bg-nova-900/20',
        className
      )}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {isDragActive
          ? 'Drop files here...'
          : 'Drag and drop files here, or click to browse'}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each
      </p>
    </div>
  )
}