/**
 * Apple-style Button Components
 * Following Apple Human Interface Guidelines for Nova Universe ITSM
 */

import { forwardRef } from 'react';
import { cn, focusRing, touchTarget } from '@utils/apple-utils';
import { LoadingSpinner } from './LoadingSpinner';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const AppleButton = forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center',
      'font-semibold rounded-xl',
      'transition-all duration-250 ease-out',
      'active:scale-95',
      focusRing(),
      touchTarget(size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'),
      disabled && 'opacity-50 cursor-not-allowed'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-blue-500 to-blue-600',
        'text-white shadow-lg',
        'hover:from-blue-600 hover:to-blue-700',
        'hover:shadow-xl hover:scale-105'
      ),
      secondary: cn(
        'bg-white/90 backdrop-blur-sm',
        'text-gray-900 border border-gray-200 shadow-sm',
        'hover:bg-white hover:shadow-lg hover:scale-105'
      ),
      ghost: cn(
        'text-blue-600',
        'hover:bg-blue-50 hover:scale-105'
      ),
      destructive: cn(
        'bg-gradient-to-r from-red-500 to-red-600',
        'text-white shadow-lg',
        'hover:from-red-600 hover:to-red-700',
        'hover:shadow-xl hover:scale-105'
      )
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <LoadingSpinner size="sm" className="mr-2" />
        )}
        {leftIcon && !loading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

AppleButton.displayName = 'AppleButton';