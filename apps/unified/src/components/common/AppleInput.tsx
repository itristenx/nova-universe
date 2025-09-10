/**
 * Apple-style Input Components
 * Following Apple Human Interface Guidelines for Nova Universe ITSM
 */

import { forwardRef } from 'react';
import { cn, focusRing } from '@utils/apple-utils';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface AppleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'glass';
}

export const AppleInput = forwardRef<HTMLInputElement, AppleInputProps>(
  ({ 
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'w-full px-4 py-3 text-base',
      'border rounded-xl',
      'transition-all duration-200 ease-out',
      focusRing('blue'),
      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-transparent',
      leftIcon && 'pl-11',
      rightIcon && 'pr-11'
    );

    const variants = {
      default: 'bg-white',
      glass: 'bg-white/90 backdrop-blur-sm'
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-900">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              baseClasses,
              variants[variant],
              className
            )}
            {...props}
          />
          
          {rightIcon && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
          
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <ExclamationCircleIcon className="h-5 w-5" />
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

AppleInput.displayName = 'AppleInput';

// Textarea variant
interface AppleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'glass';
}

export const AppleTextarea = forwardRef<HTMLTextAreaElement, AppleTextareaProps>(
  ({ 
    label,
    error,
    helperText,
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'w-full px-4 py-3 text-base',
      'border rounded-xl resize-y min-h-[120px]',
      'transition-all duration-200 ease-out',
      focusRing('blue'),
      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'
    );

    const variants = {
      default: 'bg-white',
      glass: 'bg-white/90 backdrop-blur-sm'
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-900">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            baseClasses,
            variants[variant],
            className
          )}
          {...props}
        />
        
        {(error || helperText) && (
          <div className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

AppleTextarea.displayName = 'AppleTextarea';