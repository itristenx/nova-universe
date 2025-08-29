/**
 * Icon Styles for Nova Universe Design System
 * Provides styling utilities for icons across the platform
 */

import { NovaIconSize, NovaIconColor, NovaIconVariant } from './types';

// Icon size classes for Tailwind CSS
export const iconSizeClasses: Record<NovaIconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
};

// Icon color classes for Tailwind CSS
export const iconColorClasses: Record<NovaIconColor, string> = {
  default: 'text-gray-600 dark:text-gray-300',
  primary: 'text-blue-600 dark:text-blue-400',
  secondary: 'text-purple-600 dark:text-purple-400',
  accent: 'text-orange-600 dark:text-orange-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  muted: 'text-gray-400 dark:text-gray-500',
  inverse: 'text-white dark:text-gray-900',
};

// Icon variants with predefined styles
export const iconVariants: Record<
  NovaIconVariant,
  {
    size: NovaIconSize;
    className: string;
  }
> = {
  nav: {
    size: 'md',
    className: 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
  },
  button: {
    size: 'sm',
    className: 'text-current',
  },
  status: {
    size: 'md',
    className: 'text-current',
  },
  action: {
    size: 'lg',
    className: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
  },
};

// Icon sizes in pixels
export const iconSizes: Record<NovaIconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// Utility function to get icon className
export const getIconStyle = (
  size: NovaIconSize = 'md',
  color: NovaIconColor = 'default',
  variant?: NovaIconVariant,
): string => {
  const sizeClass = iconSizeClasses[size];
  const colorClass = variant ? iconVariants[variant].className : iconColorClasses[color];

  return `${sizeClass} ${colorClass}`.trim();
};
