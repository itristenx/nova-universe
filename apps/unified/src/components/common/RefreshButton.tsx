import { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void
  isLoading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
}

export function RefreshButton({ 
  onRefresh, 
  isLoading = false, 
  className,
  size = 'md',
  tooltip = 'Refresh data'
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  const loading = isLoading || isRefreshing

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      title={tooltip}
      className={clsx(
        'inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors',
        buttonSizeClasses[size],
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <ArrowPathIcon 
        className={clsx(
          sizeClasses[size],
          loading && 'animate-spin'
        )} 
      />
    </button>
  )
}
