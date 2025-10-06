import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type MetricTrend = 'up' | 'down' | 'neutral';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: MetricTrend;
  trendValue?: string;
  trendLabel?: string;
  description?: string;
  sparklineData?: number[];
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

const trendStyles: Record<MetricTrend, { text: string; bg: string; icon: LucideIcon }> = {
  up: {
    text: 'text-success-600 dark:text-success-400',
    bg: 'bg-success-100 dark:bg-success-900/30',
    icon: TrendingUp,
  },
  down: {
    text: 'text-error-600 dark:text-error-400',
    bg: 'bg-error-100 dark:bg-error-900/30',
    icon: TrendingDown,
  },
  neutral: {
    text: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: Minus,
  },
};

/**
 * Simple sparkline component
 */
interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  color = 'stroke-apple-blue dark:stroke-apple-blue-dark',
  className = '' 
}) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      className={`w-full h-12 ${className}`} 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        className={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

/**
 * MetricCard - Dashboard statistics widget
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendLabel = 'vs last period',
  description,
  sparklineData,
  onClick,
  loading = false,
  className = '',
}) => {
  const TrendIcon = trend ? trendStyles[trend].icon : null;
  const trendStyle = trend ? trendStyles[trend] : null;

  if (loading) {
    return (
      <div className={`glass rounded-apple-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-sf-text font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        {Icon && (
          <div className="p-2 rounded-apple-sm bg-apple-blue/10 dark:bg-apple-blue/20">
            <Icon className="w-5 h-5 text-apple-blue dark:text-apple-blue-dark" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-3xl font-sf-display font-semibold text-gray-900 dark:text-white">
          {value}
        </span>
      </div>

      {/* Trend */}
      {trend && trendStyle && TrendIcon && (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${trendStyle.bg} mb-3`}>
          <TrendIcon className={`w-3.5 h-3.5 ${trendStyle.text}`} />
          <span className={`text-xs font-sf-text font-medium ${trendStyle.text}`}>
            {trendValue}
          </span>
          <span className="text-xs font-sf-text text-gray-500 dark:text-gray-400">
            {trendLabel}
          </span>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mb-3">
          {description}
        </p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Sparkline data={sparklineData} />
        </div>
      )}
    </>
  );

  const baseClasses = `
    glass rounded-apple-md p-6
    transition-all duration-400 ease-apple
    ${onClick ? 'cursor-pointer hover:shadow-glass-md hover-lift' : ''}
    ${className}
  `;

  if (onClick) {
    return (
      <motion.button
        className={baseClasses}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
      >
        {cardContent}
      </motion.button>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
};

/**
 * MetricCardGrid - Layout for multiple metric cards
 */
export interface MetricCardGridProps {
  metrics: Array<MetricCardProps & { id: string }>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  metrics,
  columns = 4,
  className = '',
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <motion.div 
      className={`grid ${gridCols[columns]} gap-6 ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
            delay: index * 0.05,
          }}
        >
          <MetricCard {...metric} />
        </motion.div>
      ))}
    </motion.div>
  );
};
