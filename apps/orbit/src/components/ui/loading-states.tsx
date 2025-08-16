import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
  'aria-label'?: string;
}

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ 
  size = 'default', 
  className = '',
  'aria-label': ariaLabel = 'Loading...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-primary', sizeClasses[size], className)}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'circle' | 'button';
  lines?: number;
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
}

/**
 * Loading Skeleton Component
 */
export function LoadingSkeleton({ 
  className = '',
  variant = 'default',
  lines = 1,
  ...props 
}: LoadingSkeletonProps) {
  const variants = {
    default: 'bg-gray-200 dark:bg-gray-700',
    card: 'bg-gray-100 dark:bg-gray-800 rounded-lg',
    text: 'bg-gray-200 dark:bg-gray-700 rounded',
    circle: 'bg-gray-200 dark:bg-gray-700 rounded-full',
    button: 'bg-gray-200 dark:bg-gray-700 rounded-md'
  };

  if (lines > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse h-4',
              variants[variant],
              i === lines - 1 && 'w-3/4', // Last line shorter
              className
            )}
            {...props}
          />
        ))}
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  return (
    <div
      className={cn('animate-pulse', variants[variant], className)}
      role="status"
      aria-label="Loading content"
      {...props}
    >
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

/**
 * Loading Overlay Component
 */
export function _LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...',
  className = ''
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div 
        className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center backdrop-blur-sm z-50"
        role="dialog"
        aria-modal="true"
        aria-label={message}
      >
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ProgressiveLoaderProps {
  progress: number;
  message?: string;
  className?: string;
  showPercentage?: boolean;
}

/**
 * Progressive Loading Component
 */
export function _ProgressiveLoader({ 
  progress, 
  message = 'Loading...',
  className = '',
  showPercentage = true 
}: ProgressiveLoaderProps) {
  const progressValue = Math.round(Math.min(100, Math.max(0, progress)));
  
  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">{message}</span>
        {showPercentage && (
          <span className="text-gray-500 dark:text-gray-400">{progressValue}%</span>
        )}
      </div>
      <div 
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative"
        role="progressbar"
        aria-label={`${message} - ${progressValue}% complete`}
      >
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out absolute top-0 left-0"
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
}

/**
 * Card Loading State
 */
export function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div className={cn('border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4', className)}>
      <LoadingSkeleton variant="text" className="h-6 w-1/3" />
      <LoadingSkeleton lines={3} className="" />
      <div className="flex space-x-2">
        <LoadingSkeleton variant="button" className="h-8 w-20" />
        <LoadingSkeleton variant="button" className="h-8 w-16" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Table Loading State
 */
export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
  const _gridCols = `repeat(${columns}, 1fr)`;
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className={`grid gap-4 grid-cols-${columns}`}>
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={`header-${i}`} variant="text" className="h-5 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className={`grid gap-4 grid-cols-${columns}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface ListSkeletonProps {
  items?: number;
  className?: string;
}

/**
 * List Loading State
 */
export function _ListSkeleton({ items = 5, className = '' }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <LoadingSkeleton variant="circle" className="h-8 w-8" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="h-4 w-full" />
            <LoadingSkeleton variant="text" className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface DashboardSkeletonProps {
  className?: string;
}

/**
 * Dashboard Loading State
 */
export function _DashboardSkeleton({ className = '' }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton variant="text" className="h-8 w-1/3" />
        <LoadingSkeleton variant="text" className="h-4 w-1/2" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-64" />
        <CardSkeleton className="h-64" />
      </div>
      
      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <LoadingSkeleton variant="text" className="h-6 w-1/4 mb-4" />
        <TableSkeleton />
      </div>
    </div>
  );
}
