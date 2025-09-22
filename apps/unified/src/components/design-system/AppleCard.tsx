import { ReactNode } from 'react';
import { cn } from '@utils/index';

interface AppleCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'filled' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const variantClasses = {
  default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-900 shadow-apple border border-gray-100 dark:border-gray-800',
  filled: 'bg-gray-50 dark:bg-gray-800',
  glass: 'glass dark:glass-dark',
};

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const roundedClasses = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-4xl',
};

export function AppleCard({
  children,
  className,
  variant = 'default',
  size = 'md',
  interactive = false,
  rounded = 'xl',
}: AppleCardProps) {
  return (
    <div
      className={cn(
        'transition-all duration-250 ease-apple',
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses[rounded],
        interactive && 'hover:shadow-apple-lg hover:scale-[1.02] cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AppleCardHeader({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn('mb-6', className)}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function AppleCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function AppleCardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}