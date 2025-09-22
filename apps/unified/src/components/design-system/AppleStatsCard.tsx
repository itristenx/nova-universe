import { ReactNode } from 'react';
import { cn } from '@utils/index';

interface AppleStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

const colorClasses = {
  blue: {
    icon: 'bg-nova-100 text-nova-600 dark:bg-nova-900/20 dark:text-nova-400',
    trend: {
      up: 'text-success-600 bg-success-50 dark:bg-success-900/20',
      down: 'text-error-600 bg-error-50 dark:bg-error-900/20',
      neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    },
  },
  green: {
    icon: 'bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400',
    trend: {
      up: 'text-success-600 bg-success-50 dark:bg-success-900/20',
      down: 'text-error-600 bg-error-50 dark:bg-error-900/20',
      neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    },
  },
  yellow: {
    icon: 'bg-warning-100 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400',
    trend: {
      up: 'text-success-600 bg-success-50 dark:bg-success-900/20',
      down: 'text-error-600 bg-error-50 dark:bg-error-900/20',
      neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    },
  },
  red: {
    icon: 'bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-400',
    trend: {
      up: 'text-success-600 bg-success-50 dark:bg-success-900/20',
      down: 'text-error-600 bg-error-50 dark:bg-error-900/20',
      neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    },
  },
  purple: {
    icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    trend: {
      up: 'text-success-600 bg-success-50 dark:bg-success-900/20',
      down: 'text-error-600 bg-error-50 dark:bg-error-900/20',
      neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    },
  },
  gray: {
    icon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    trend: {
      up: 'text-success-600 bg-success-50 dark:bg-success-900/20',
      down: 'text-error-600 bg-error-50 dark:bg-error-900/20',
      neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    },
  },
};

export function AppleStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  color = 'blue',
}: AppleStatsCardProps) {
  const colorConfig = colorClasses[color];

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-700',
        'rounded-2xl p-6',
        'shadow-apple hover:shadow-apple-lg',
        'transition-all duration-250 ease-apple',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && (
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  colorConfig.icon,
                )}
              >
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {trend && (
          <div
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium',
              colorConfig.trend[trend.direction],
            )}
          >
            <div className="flex items-center gap-1">
              <span>
                {trend.direction === 'up' && '↗'}
                {trend.direction === 'down' && '↘'}
                {trend.direction === 'neutral' && '→'}
              </span>
              <span>
                {trend.value > 0 && trend.direction !== 'neutral' && '+'}
                {trend.value}%
              </span>
            </div>
            <div className="text-xs opacity-75 mt-0.5">
              {trend.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AppleStatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function AppleStatsGrid({
  children,
  columns = 4,
  className,
}: AppleStatsGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {children}
    </div>
  );
}