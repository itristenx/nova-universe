/**
 * ShadCN Theme Configuration
 * Extends ShadCN with Nova Universe design tokens
 */

import { colors, spacing, borderRadius, shadows, typography } from './tokens'

export const shadcnTheme = {
  extend: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
        ...colors.primary
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
        ...colors.secondary
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
        ...colors.semantic.error
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))'
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
        ...colors.accent
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))'
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))'
      },
      // Custom semantic colors
      success: colors.semantic.success,
      warning: colors.semantic.warning,
      info: colors.semantic.info,
      // Legacy Nova colors
      neutral: colors.neutral
    },
    borderRadius: {
      ...borderRadius,
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)'
    },
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    letterSpacing: typography.letterSpacing,
    spacing,
    boxShadow: shadows,
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' }
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' }
      },
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      },
      'slide-in-from-top': {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(0)' }
      },
      'slide-in-from-bottom': {
        '0%': { transform: 'translateY(100%)' },
        '100%': { transform: 'translateY(0)' }
      },
      'slide-in-from-left': {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' }
      },
      'slide-in-from-right': {
        '0%': { transform: 'translateX(100%)' },
        '100%': { transform: 'translateX(0)' }
      }
    },
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
      'fade-in': 'fade-in 0.2s ease-out',
      'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
      'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
      'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
      'slide-in-from-right': 'slide-in-from-right 0.3s ease-out'
    }
  }
}

export default shadcnTheme
