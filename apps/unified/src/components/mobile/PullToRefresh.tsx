import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  maxPullDistance?: number
  disabled?: boolean
  className?: string
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  maxPullDistance = 150,
  disabled = false,
  className = ''
}: PullToRefreshProps) {
  const { t } = useTranslation(['app', 'common'])
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return
    
    // Only allow pull-to-refresh when at top of page
    if (window.scrollY > 0) return
    
    setStartY(e.touches[0].clientY)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || startY === 0) return
    
    const currentY = e.touches[0].clientY
    const pullDistance = Math.max(0, currentY - startY)
    
    if (pullDistance > 0 && window.scrollY === 0) {
      e.preventDefault()
      setIsPulling(true)
      setPullDistance(Math.min(pullDistance, maxPullDistance))
    }
  }, [disabled, isRefreshing, startY, maxPullDistance])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull to refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setIsPulling(false)
    setPullDistance(0)
    setStartY(0)
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh])

  useEffect(() => {
    if (disabled) return
    
    const container = document.body
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled])

  const getRefreshIndicatorTransform = () => {
    if (isRefreshing) return 'translateY(60px) scale(1)'
    if (isPulling) {
      const scale = Math.min(pullDistance / threshold, 1)
      const translateY = Math.min(pullDistance * 0.5, 60)
      return `translateY(${translateY}px) scale(${scale})`
    }
    return 'translateY(-60px) scale(0.5)'
  }

  const getRefreshIndicatorOpacity = () => {
    if (isRefreshing) return 1
    if (isPulling) return Math.min(pullDistance / threshold, 1)
    return 0
  }

  return (
    <div className={`relative ${className}`}>
      {/* Pull-to-refresh indicator */}
      <div
        className="fixed top-0 left-1/2 z-50 flex items-center justify-center w-12 h-12 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 ease-out"
        style={{
          transform: getRefreshIndicatorTransform(),
          opacity: getRefreshIndicatorOpacity(),
        }}
      >
        {isRefreshing ? (
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
        ) : (
          <svg
            className={`w-6 h-6 text-blue-600 transition-transform duration-200 ${
              pullDistance >= threshold ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7-7m0 0l-7 7m7-7v18"
            />
          </svg>
        )}
      </div>

      {/* Pull distance indicator (development mode) */}
      {process.env.NODE_ENV === 'development' && isPulling && (
        <div className="fixed top-16 left-4 z-50 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          Pull: {Math.round(pullDistance)}px / {threshold}px
        </div>
      )}

      {/* Content container */}
      <div
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance * 0.3, 30)}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>

      {/* Refresh instruction overlay */}
      {isPulling && pullDistance > 20 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          {pullDistance >= threshold
            ? t('app.mobile.releaseToRefresh')
            : t('app.mobile.pullToRefresh')}
        </div>
      )}
    </div>
  )
}

// Hook for using pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void>, options?: {
  threshold?: number
  disabled?: boolean
}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await onRefresh()
      setLastRefresh(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh, isRefreshing])

  return {
    isRefreshing,
    lastRefresh,
    handleRefresh
  }
}
