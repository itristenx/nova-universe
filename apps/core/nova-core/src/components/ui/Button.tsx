import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'ghost'
    | 'destructive'
    | 'default'
    | 'danger'
    | 'light'
    | 'bordered';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  isLoading?: boolean; // Alias for loading
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  startContent?: React.ReactNode; // Alias for iconLeft
  fullWidth?: boolean;
  children: React.ReactNode;
  onPress?: () => void; // Alias for onClick
  color?: string; // Additional color prop
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  iconLeft,
  iconRight,
  startContent,
  fullWidth = false,
  className = '',
  disabled,
  children,
  onPress,
  color,
  ...props
}) => {
  // Use either loading or isLoading
  const isButtonLoading = loading || isLoading;

  // Use either iconLeft or startContent
  const leftIcon = iconLeft || startContent;

  // Handle onClick vs onPress
  const handleClick = onPress || props.onClick;
  const buttonClasses = clsx(
    // Base styles - Apple-inspired
    'relative inline-flex items-center justify-center font-medium rounded-lg',
    'transition-all duration-150 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'active:scale-95 disabled:active:scale-100',
    'select-none touch-manipulation',

    // Size variants
    {
      'px-2 py-1 text-xs gap-1': size === 'xs',
      'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
      'px-4 py-2 text-sm gap-2': size === 'md',
      'px-5 py-2.5 text-base gap-2': size === 'lg',
      'px-6 py-3 text-lg gap-3': size === 'xl',
    },

    // Variant styles - using logical OR to avoid duplicate keys
    {
      // Blue background variants
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-transparent focus:ring-blue-500':
        variant === 'primary',

      // Gray background variants
      'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-gray-500':
        variant === 'secondary' || variant === 'default',
      'dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-600':
        variant === 'secondary' || variant === 'default',

      // Red background variants
      'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500':
        variant === 'destructive' || variant === 'danger',

      // Transparent background with gray border variants
      'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-400':
        variant === 'tertiary' || variant === 'bordered',
      'dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-600':
        variant === 'tertiary' || variant === 'bordered',

      // Transparent background with no border
      'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent focus:ring-gray-400':
        variant === 'ghost',
      'dark:hover:bg-gray-800 dark:text-gray-300': variant === 'ghost',

      // Light gray background variants
      'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 focus:ring-gray-400':
        variant === 'light',
      'dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-700':
        variant === 'light',
    },

    // Width
    {
      'w-full': fullWidth,
    },

    // Disabled state
    {
      'opacity-50 cursor-not-allowed': disabled || isButtonLoading,
      'pointer-events-none': isButtonLoading,
    },

    className,
  );

  const iconClasses = clsx('flex-shrink-0', {
    'w-3 h-3': size === 'xs',
    'w-4 h-4': size === 'sm' || size === 'md',
    'w-5 h-5': size === 'lg',
    'w-6 h-6': size === 'xl',
  });

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isButtonLoading}
      {...props}
      onClick={handleClick}
    >
      {isButtonLoading ? (
        <svg className={clsx(iconClasses, 'animate-spin')} fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {leftIcon && <span className={iconClasses}>{leftIcon}</span>}
          <span className="flex-1">{children}</span>
          {iconRight && <span className={iconClasses}>{iconRight}</span>}
        </>
      )}
    </button>
  );
};
