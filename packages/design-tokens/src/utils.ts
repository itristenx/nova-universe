/**
 * Utility functions for _Nova _Universe _Design _System
 */

import { _type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * _Combines class _names _using clsx _and tailwind-merge
 * _Provides _optimal class _name _merging for _Tailwind _CSS
 */
export function _cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a value is defined (not null or undefined)
 */
export function _isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Safely access nested object properties
 */
export function _get<T>(obj: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types, path: string, defaultValue?: T): T {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T
    }
    result = result[key]
  }
  
  return result ?? defaultValue
}

/**
 * Converts pixel values to rem units
 */
export function _pxToRem(px: number, baseFontSize: number = 16): string {
  return `${px / baseFontSize}rem`
}

/**
 * Generates responsive breakpoint utilities
 */
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

/**
 * Creates media query strings for responsive design
 */
export function _mediaQuery(breakpoint: _keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`
}

/**
 * Color utility functions for WCAG _compliance
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function _rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }).join("")
}

/**
 * Calculates luminance for WCAG contrast calculations
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  
  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculates contrast ratio between two colors
 */
export function _getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Debounce function for performance optimization
 */
export function _debounce<T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function _throttle<T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
