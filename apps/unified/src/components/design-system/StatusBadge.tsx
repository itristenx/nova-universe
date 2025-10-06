import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Circle } from 'lucide-react';

export type StatusBadgeVariant = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'neutral'
  | 'open'
  | 'in-progress'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type StatusBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label?: string;
  size?: StatusBadgeSize;
  icon?: LucideIcon;
  showDot?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<StatusBadgeVariant, { bg: string; text: string; dot: string }> = {
  // Generic variants
  success: {
    bg: 'bg-success-100 dark:bg-success-900/30',
    text: 'text-success-700 dark:text-success-400',
    dot: 'bg-success-500',
  },
  error: {
    bg: 'bg-error-100 dark:bg-error-900/30',
    text: 'text-error-700 dark:text-error-400',
    dot: 'bg-error-500',
  },
  warning: {
    bg: 'bg-warning-100 dark:bg-warning-900/30',
    text: 'text-warning-700 dark:text-warning-400',
    dot: 'bg-warning-500',
  },
  info: {
    bg: 'bg-apple-blue/10 dark:bg-apple-blue/20',
    text: 'text-apple-blue dark:text-apple-blue-dark',
    dot: 'bg-apple-blue',
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },

  // Ticket status variants
  open: {
    bg: 'bg-apple-blue/10 dark:bg-apple-blue/20',
    text: 'text-apple-blue dark:text-apple-blue-dark',
    dot: 'bg-apple-blue',
  },
  'in-progress': {
    bg: 'bg-warning-100 dark:bg-warning-900/30',
    text: 'text-warning-700 dark:text-warning-400',
    dot: 'bg-warning-500',
  },
  pending: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },
  resolved: {
    bg: 'bg-success-100 dark:bg-success-900/30',
    text: 'text-success-700 dark:text-success-400',
    dot: 'bg-success-500',
  },
  closed: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },

  // Priority variants
  critical: {
    bg: 'bg-error-100 dark:bg-error-900/30',
    text: 'text-error-700 dark:text-error-400',
    dot: 'bg-error-500',
  },
  high: {
    bg: 'bg-warning-100 dark:bg-warning-900/30',
    text: 'text-warning-700 dark:text-warning-400',
    dot: 'bg-warning-500',
  },
  medium: {
    bg: 'bg-apple-blue/10 dark:bg-apple-blue/20',
    text: 'text-apple-blue dark:text-apple-blue-dark',
    dot: 'bg-apple-blue',
  },
  low: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },
};

const sizeStyles: Record<StatusBadgeSize, { container: string; text: string; dot: string; icon: string }> = {
  xs: {
    container: 'px-2 py-0.5 rounded-full',
    text: 'text-xs',
    dot: 'w-1.5 h-1.5',
    icon: 'w-3 h-3',
  },
  sm: {
    container: 'px-2.5 py-1 rounded-full',
    text: 'text-xs',
    dot: 'w-2 h-2',
    icon: 'w-3.5 h-3.5',
  },
  md: {
    container: 'px-3 py-1.5 rounded-full',
    text: 'text-sm',
    dot: 'w-2 h-2',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'px-4 py-2 rounded-apple-sm',
    text: 'text-base',
    dot: 'w-2.5 h-2.5',
    icon: 'w-5 h-5',
  },
};

const defaultLabels: Record<StatusBadgeVariant, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  neutral: 'Neutral',
  open: 'Open',
  'in-progress': 'In Progress',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  size = 'sm',
  icon: Icon,
  showDot = false,
  animated = false,
  className = '',
  onClick,
}) => {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const displayLabel = label || defaultLabels[variant];

  const badgeContent = (
    <>
      {showDot && (
        <motion.span
          className={`${sizes.dot} ${styles.dot} rounded-full flex-shrink-0`}
          animate={animated ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {Icon && (
        <Icon className={`${sizes.icon} flex-shrink-0`} />
      )}
      <span className="font-sf-text font-medium truncate">
        {displayLabel}
      </span>
    </>
  );

  const baseClasses = `
    inline-flex items-center gap-1.5
    ${sizes.container}
    ${sizes.text}
    ${styles.bg}
    ${styles.text}
    ${onClick ? 'cursor-pointer hover:shadow-glass-sm' : ''}
    transition-all duration-400 ease-apple
    ${className}
  `;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={baseClasses}
        type="button"
      >
        {badgeContent}
      </button>
    );
  }

  return (
    <span className={baseClasses}>
      {badgeContent}
    </span>
  );
};

/**
 * StatusBadgeGroup - Display multiple status badges
 */
export interface StatusBadgeGroupProps {
  badges: Array<{
    id: string;
    variant: StatusBadgeVariant;
    label?: string;
    icon?: LucideIcon;
  }>;
  size?: StatusBadgeSize;
  maxVisible?: number;
  className?: string;
}

export const StatusBadgeGroup: React.FC<StatusBadgeGroupProps> = ({
  badges,
  size = 'sm',
  maxVisible = 3,
  className = '',
}) => {
  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = badges.length - maxVisible;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {visibleBadges.map((badge) => (
        <StatusBadge
          key={badge.id}
          variant={badge.variant}
          label={badge.label}
          icon={badge.icon}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs font-sf-text text-gray-500 dark:text-gray-400">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};
