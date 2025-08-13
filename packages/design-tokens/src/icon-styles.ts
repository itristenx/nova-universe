/**
 * Icon CSS Utilities for Nova Universe
 * Generates CSS classes for consistent icon styling
 */

import { iconSizeClasses, iconColorClasses, iconVariants } from './icons'

/**
 * Generate CSS utilities for Nova icons
 */
export function generateIconCSS(): string {
  const cssRules: string[] = []
  
  // Base icon class
  cssRules.push('.nova-icon { display: inline-block; vertical-align: middle; flex-shrink: 0; }')
  
  // Size utilities
  cssRules.push('.nova-icon-xs { width: 0.75rem; height: 0.75rem; }')
  cssRules.push('.nova-icon-sm { width: 1rem; height: 1rem; }')
  cssRules.push('.nova-icon-md { width: 1.25rem; height: 1.25rem; }')
  cssRules.push('.nova-icon-lg { width: 1.5rem; height: 1.5rem; }')
  cssRules.push('.nova-icon-xl { width: 2rem; height: 2rem; }')
  cssRules.push('.nova-icon-2xl { width: 3rem; height: 3rem; }')
  
  // Color utilities
  cssRules.push('.nova-icon-default { color: rgb(75 85 99); }')
  cssRules.push('.nova-icon-primary { color: rgb(37 99 235); }')
  cssRules.push('.nova-icon-secondary { color: rgb(107 114 128); }')
  cssRules.push('.nova-icon-success { color: rgb(34 197 94); }')
  cssRules.push('.nova-icon-warning { color: rgb(245 158 11); }')
  cssRules.push('.nova-icon-error { color: rgb(239 68 68); }')
  cssRules.push('.nova-icon-info { color: rgb(59 130 246); }')
  cssRules.push('.nova-icon-muted { color: rgb(156 163 175); }')
  cssRules.push('.nova-icon-white { color: rgb(255 255 255); }')
  cssRules.push('.nova-icon-black { color: rgb(0 0 0); }')
  
  // Dark mode colors
  cssRules.push('@media (prefers-color-scheme: dark) {')
  cssRules.push('  .nova-icon-default { color: rgb(156 163 175); }')
  cssRules.push('  .nova-icon-primary { color: rgb(96 165 250); }')
  cssRules.push('  .nova-icon-success { color: rgb(74 222 128); }')
  cssRules.push('  .nova-icon-warning { color: rgb(251 191 36); }')
  cssRules.push('  .nova-icon-error { color: rgb(248 113 113); }')
  cssRules.push('  .nova-icon-info { color: rgb(96 165 250); }')
  cssRules.push('  .nova-icon-muted { color: rgb(107 114 128); }')
  cssRules.push('  .nova-icon-black { color: rgb(255 255 255); }')
  cssRules.push('}')
  
  // Variant utilities
  cssRules.push('.nova-icon-button { width: 1rem; height: 1rem; margin-right: 0.5rem; }')
  cssRules.push('.nova-icon-nav { width: 1.25rem; height: 1.25rem; margin-right: 0.75rem; }')
  cssRules.push('.nova-icon-status { width: 1rem; height: 1rem; display: inline-block; }')
  cssRules.push('.nova-icon-table { width: 1rem; height: 1rem; display: inline-block; }')
  cssRules.push('.nova-icon-card { width: 1.5rem; height: 1.5rem; margin-bottom: 0.5rem; }')
  cssRules.push('.nova-icon-notification { width: 1.25rem; height: 1.25rem; margin-right: 0.75rem; flex-shrink: 0; }')
  
  // Interactive states
  cssRules.push('.nova-icon-interactive { cursor: pointer; transition: color 0.2s ease, opacity 0.2s ease; }')
  cssRules.push('.nova-icon-interactive:hover { opacity: 0.8; }')
  cssRules.push('.nova-icon-interactive:active { transform: scale(0.95); }')
  
  // Animation utilities
  cssRules.push('.nova-icon-spin { animation: nova-icon-spin 1s linear infinite; }')
  cssRules.push('.nova-icon-pulse { animation: nova-icon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }')
  cssRules.push('.nova-icon-bounce { animation: nova-icon-bounce 1s infinite; }')
  
  // Keyframes
  cssRules.push('@keyframes nova-icon-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }')
  cssRules.push('@keyframes nova-icon-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }')
  cssRules.push('@keyframes nova-icon-bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: none; animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }')
  
  return cssRules.join('\n')
}

/**
 * Generate Tailwind utilities for icons
 */
export function generateIconTailwindConfig() {
  return {
    extend: {
      animation: {
        'icon-spin': 'spin 1s linear infinite',
        'icon-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'icon-bounce': 'bounce 1s infinite'
      }
    }
  }
}

// Predefined CSS classes for common icon patterns
export const iconUtilityClasses = {
  base: 'nova-icon',
  sizes: {
    xs: 'nova-icon-xs',
    sm: 'nova-icon-sm', 
    md: 'nova-icon-md',
    lg: 'nova-icon-lg',
    xl: 'nova-icon-xl',
    '2xl': 'nova-icon-2xl'
  },
  colors: {
    default: 'nova-icon-default',
    primary: 'nova-icon-primary',
    secondary: 'nova-icon-secondary',
    success: 'nova-icon-success',
    warning: 'nova-icon-warning',
    error: 'nova-icon-error',
    info: 'nova-icon-info',
    muted: 'nova-icon-muted',
    white: 'nova-icon-white',
    black: 'nova-icon-black'
  },
  variants: {
    button: 'nova-icon-button',
    nav: 'nova-icon-nav',
    status: 'nova-icon-status',
    table: 'nova-icon-table',
    card: 'nova-icon-card',
    notification: 'nova-icon-notification'
  },
  states: {
    interactive: 'nova-icon-interactive',
    spin: 'nova-icon-spin',
    pulse: 'nova-icon-pulse',
    bounce: 'nova-icon-bounce'
  }
}

// Export CSS string for consumption
export const iconCSS = generateIconCSS()
