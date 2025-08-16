import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  description,
  variant = 'default',
  size = 'md',
  interactive = false,
  disabled = false,
}) => {
  const cardClasses = clsx(
    // Base styles - Apple-inspired design
    'relative rounded-xl border transition-all duration-200 ease-out',
    'bg-white dark:bg-gray-900',
    'border-gray-200 dark:border-gray-800',
    
    // Variant styles
    {
      // Default variant
      'shadow-sm hover:shadow-md': variant === 'default',
      
      // Elevated variant - more prominent
      'shadow-lg hover:shadow-xl': variant === 'elevated',
      
      // Outlined variant - minimal
      'border-2 shadow-none': variant === 'outlined',
      
      // Glass variant - iOS-inspired
      'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/30 shadow-lg': variant === 'glass',
    },
    
    // Size variants
    {
      'p-3': size === 'sm',
      'p-4': size === 'md',  
      'p-6': size === 'lg',
    },
    
    // Interactive states
    {
      'cursor-pointer hover:scale-[1.02] active:scale-[0.98]': interactive && !disabled,
      'hover:border-blue-300 dark:hover:border-blue-600': interactive && !disabled,
      'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2': interactive,
    },
    
    // Disabled state
    {
      'opacity-50 cursor-not-allowed': disabled,
    },
    
    className
  );

  const titleClasses = clsx(
    'text-lg font-semibold',
    'text-gray-900 dark:text-gray-100',
    'tracking-tight leading-tight'
  );

  const descriptionClasses = clsx(
    'text-sm mt-1',
    'text-gray-600 dark:text-gray-400',
    'leading-relaxed'
  );

  return (
    <div 
      className={cardClasses}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      aria-disabled={disabled}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className={titleClasses}>{title}</h3>}
          {description && <p className={descriptionClasses}>{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
