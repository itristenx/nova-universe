/**
 * Enhanced Button Component - Phase 1 Implementation
 * Apple-inspired design with comprehensive accessibility
 */
import React, { forwardRef, useRef } from 'react'

// Utility function for classnames
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Simplified variant system without external dependencies
const getButtonClasses = (
  variant: string = 'primary',
  size: string = 'md',
  loading: boolean = false,
  fullWidth: boolean = false
) => {
  const baseClasses = [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98] active:transition-transform active:duration-75',
    'font-system leading-none tracking-tight',
    'touch-manipulation select-none',
  ]

  const variantClasses = {
    primary: [
      'bg-blue-600 text-white shadow-sm',
      'hover:bg-blue-700 hover:shadow-md',
      'active:bg-blue-800',
      'dark:bg-blue-600 dark:hover:bg-blue-700',
    ],
    secondary: [
      'bg-gray-100 text-gray-900 shadow-sm border border-gray-200',
      'hover:bg-gray-200 hover:shadow-md',
      'active:bg-gray-300',
      'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
      'dark:hover:bg-gray-700',
    ],
    destructive: [
      'bg-red-600 text-white shadow-sm',
      'hover:bg-red-700 hover:shadow-md',
      'active:bg-red-800',
      'dark:bg-red-600 dark:hover:bg-red-700',
    ],
    ghost: [
      'text-gray-700 hover:bg-gray-100',
      'active:bg-gray-200',
      'dark:text-gray-300 dark:hover:bg-gray-800',
      'dark:active:bg-gray-700',
    ],
    outline: [
      'border border-gray-300 bg-transparent text-gray-700 shadow-sm',
      'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md',
      'active:bg-gray-100',
      'dark:border-gray-700 dark:text-gray-300',
      'dark:hover:bg-gray-800 dark:hover:border-gray-600',
    ],
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
    xl: 'h-14 px-8 text-lg gap-3',
    'icon-sm': 'h-8 w-8 p-0',
    'icon-md': 'h-10 w-10 p-0',
    'icon-lg': 'h-12 w-12 p-0',
  }

  const loadingClasses = loading ? ['cursor-not-allowed opacity-70'] : []
  const widthClasses = fullWidth ? ['w-full'] : []

  return cn(
    ...baseClasses,
    ...variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary,
    sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
    ...loadingClasses,
    ...widthClasses
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon-sm' | 'icon-md' | 'icon-lg'
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  'aria-label'?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      fullWidth = false,
      children,
      leftIcon,
      rightIcon,
      disabled,
      onClick,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    
    // Merge refs
    const mergedRef = (node: HTMLButtonElement) => {
      if (buttonRef) buttonRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    const isDisabled = disabled || loading

    // Handle click with loading state
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault()
        return
      }

      onClick?.(e)
    }

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    return (
      <button
        ref={mergedRef}
        className={cn(
          getButtonClasses(variant, size, loading, fullWidth),
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={loading ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner />
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {/* Button content */}
        {loading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children
        )}

        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Screen reader loading announcement */}
        {loading && loadingText && (
          <span className="sr-only">
            {loadingText}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Button group component for related actions
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          'shadow-sm rounded-lg overflow-hidden',
          '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg',
          orientation === 'vertical' && '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-none [&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-r-none',
          '[&>button:not(:last-child)]:border-r-0',
          orientation === 'vertical' && '[&>button:not(:last-child)]:border-r [&>button:not(:last-child)]:border-b-0',
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'

export { Button, ButtonGroup, getButtonClasses }
export type { ButtonProps }
