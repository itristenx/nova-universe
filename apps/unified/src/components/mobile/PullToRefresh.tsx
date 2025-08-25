import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  className?: string;
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  maxPullDistance = 150,
  disabled = false,
  className = '',
}: PullToRefreshProps) {
  const { t } = useTranslation(['app', 'common']);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;

      // Only allow pull-to-refresh when at top of page
      if (window.scrollY > 0) return;

      setStartY(e.touches[0].clientY);
    },
    [disabled, isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing || startY === 0) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY - startY);

      if (pullDistance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(pullDistance, maxPullDistance));
      }
    },
    [disabled, isRefreshing, startY, maxPullDistance],
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (_error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    setStartY(0);
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;

    const container = document.body;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  const getRefreshIndicatorTransform = () => {
    if (isRefreshing) return 'translateY(60px) scale(1)';
    if (isPulling) {
      const scale = Math.min(pullDistance / threshold, 1);
      const translateY = Math.min(pullDistance * 0.5, 60);
      return `translateY(${translateY}px) scale(${scale})`;
    }
    return 'translateY(-60px) scale(0.5)';
  };

  const getRefreshIndicatorOpacity = () => {
    if (isRefreshing) return 1;
    if (isPulling) return Math.min(pullDistance / threshold, 1);
    return 0;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Pull-to-refresh indicator */}
      <div
        className="fixed top-0 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200 ease-out dark:border-gray-600 dark:bg-gray-800"
        style={{
          transform: getRefreshIndicatorTransform(),
          opacity: getRefreshIndicatorOpacity(),
        }}
      >
        {isRefreshing ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        ) : (
          <svg
            className={`h-6 w-6 text-blue-600 transition-transform duration-200 ${
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
        <div className="bg-opacity-75 fixed top-16 left-4 z-50 rounded bg-black px-2 py-1 text-xs text-white">
          Pull: {Math.round(pullDistance)}px / {threshold}px
        </div>
      )}

      {/* Content container */}
      <div
        style={{
          transform: isPulling
            ? `translateY(${Math.min(pullDistance * 0.3, 30)}px)`
            : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>

      {/* Refresh instruction overlay */}
      {isPulling && pullDistance > 20 && (
        <div className="fixed top-20 left-1/2 z-40 -translate-x-1/2 transform rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {pullDistance >= threshold
            ? t('app.mobile.releaseToRefresh')
            : t('app.mobile.pullToRefresh')}
        </div>
      )}
    </div>
  );
}

// Hook for using pull-to-refresh functionality
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options?: {
    threshold?: number;
    disabled?: boolean;
  },
) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  return {
    isRefreshing,
    lastRefresh,
    handleRefresh,
  };
}
