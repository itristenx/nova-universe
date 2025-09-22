import { ReactNode } from 'react';
import { cn } from '@utils/index';

interface AppleButtonProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses = {
  primary: [
    'bg-nova-600 hover:bg-nova-700 text-white',
    'shadow-lg hover:shadow-xl',
    'border border-nova-600 hover:border-nova-700',
  ].join(' '),
  secondary: [
    'bg-gray-100 hover:bg-gray-200 text-gray-900',
    'dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white',
    'border border-gray-200 dark:border-gray-700',
  ].join(' '),
  ghost: [
    'bg-transparent hover:bg-gray-100 text-gray-700',
    'dark:hover:bg-gray-800 dark:text-gray-300',
    'border border-transparent',
  ].join(' '),
  danger: [
    'bg-error-600 hover:bg-error-700 text-white',
    'shadow-lg hover:shadow-xl',
    'border border-error-600 hover:border-error-700',
  ].join(' '),
  success: [
    'bg-success-600 hover:bg-success-700 text-white',
    'shadow-lg hover:shadow-xl',
    'border border-success-600 hover:border-success-700',
  ].join(' '),
};

const sizeClasses = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

export function AppleButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
}: AppleButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-xl',
        'transition-all duration-250 ease-apple',
        'focus:outline-none focus:ring-2 focus:ring-nova-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}

export function AppleButtonGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      {children}
    </div>
  );
}