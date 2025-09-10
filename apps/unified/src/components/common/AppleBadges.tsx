/**
 * Apple-style Status Badge Components
 * Following Apple design principles for ITSM status visualization
 */

import { forwardRef } from 'react';
import { cn, getStatusStyle, getPriorityStyle } from '@utils/apple-utils';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  variant?: 'default' | 'dot' | 'pill';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, variant = 'default', size = 'md', className, ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center font-medium',
      variant === 'pill' && 'rounded-full',
      variant === 'default' && 'rounded-lg'
    );

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base'
    };

    if (variant === 'dot') {
      return (
        <span
          ref={ref}
          className={cn('inline-flex items-center gap-2', className)}
          {...props}
        >
          <span className={cn('w-2 h-2 rounded-full', getStatusStyle(status, 'background'))} />
          <span className="capitalize">{status}</span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          sizes[size],
          getStatusStyle(status, 'badge'),
          className
        )}
        {...props}
      >
        {status}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

interface PriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: string | number;
  variant?: 'default' | 'dot' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PriorityBadge = forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ 
    priority, 
    variant = 'default', 
    size = 'md', 
    showLabel = true,
    className, 
    ...props 
  }, ref) => {
    const priorityStyles = getPriorityStyle(priority);
    const priorityLabel = typeof priority === 'string' ? priority : 
      ['Low', 'Medium', 'High', 'Critical'][priority - 1] || 'Unknown';

    const baseClasses = cn(
      'inline-flex items-center font-medium',
      variant === 'pill' && 'rounded-full',
      variant === 'default' && 'rounded-lg'
    );

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm', 
      lg: 'px-3 py-1 text-base'
    };

    if (variant === 'dot') {
      return (
        <span
          ref={ref}
          className={cn('inline-flex items-center gap-2', className)}
          {...props}
        >
          <span className={cn('w-2 h-2 rounded-full', priorityStyles.dot)} />
          {showLabel && <span className="capitalize">{priorityLabel}</span>}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          sizes[size],
          priorityStyles.badge,
          className
        )}
        {...props}
      >
        {showLabel ? priorityLabel : ''}
      </span>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';

interface RoleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  role: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge = forwardRef<HTMLSpanElement, RoleBadgeProps>(
  ({ role, size = 'md', className, ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center font-medium rounded-full'
    );

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base'
    };

    const roleStyles = {
      admin: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      manager: 'bg-indigo-100 text-indigo-800',
      user: 'bg-gray-100 text-gray-800'
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          sizes[size],
          roleStyles[role.toLowerCase()] || roleStyles.user,
          className
        )}
        {...props}
      >
        {role}
      </span>
    );
  }
);

RoleBadge.displayName = 'RoleBadge';