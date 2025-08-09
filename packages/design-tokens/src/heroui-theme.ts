/**
 * HeroUI Theme Configuration
 * Extends HeroUI with Nova Universe design tokens
 */

import { colors, spacing, borderRadius, shadows, typography } from './tokens'

export const heroUITheme = {
  extend: {
    colors: {
      primary: {
        50: colors.primary[50],
        100: colors.primary[100],
        200: colors.primary[200],
        300: colors.primary[300],
        400: colors.primary[400],
        500: colors.primary[500],
        600: colors.primary[600],
        700: colors.primary[700],
        800: colors.primary[800],
        900: colors.primary[900],
        DEFAULT: colors.primary[500],
        foreground: '#ffffff'
      },
      secondary: {
        50: colors.secondary[50],
        100: colors.secondary[100],
        200: colors.secondary[200],
        300: colors.secondary[300],
        400: colors.secondary[400],
        500: colors.secondary[500],
        600: colors.secondary[600],
        700: colors.secondary[700],
        800: colors.secondary[800],
        900: colors.secondary[900],
        DEFAULT: colors.secondary[500],
        foreground: '#ffffff'
      },
      success: {
        50: colors.semantic.success[50],
        100: colors.semantic.success[100],
        200: colors.semantic.success[200],
        300: colors.semantic.success[300],
        400: colors.semantic.success[400],
        500: colors.semantic.success[500],
        600: colors.semantic.success[600],
        700: colors.semantic.success[700],
        800: colors.semantic.success[800],
        900: colors.semantic.success[900],
        DEFAULT: colors.semantic.success[500],
        foreground: '#ffffff'
      },
      warning: {
        50: colors.semantic.warning[50],
        100: colors.semantic.warning[100],
        200: colors.semantic.warning[200],
        300: colors.semantic.warning[300],
        400: colors.semantic.warning[400],
        500: colors.semantic.warning[500],
        600: colors.semantic.warning[600],
        700: colors.semantic.warning[700],
        800: colors.semantic.warning[800],
        900: colors.semantic.warning[900],
        DEFAULT: colors.semantic.warning[500],
        foreground: '#000000'
      },
      danger: {
        50: colors.semantic.error[50],
        100: colors.semantic.error[100],
        200: colors.semantic.error[200],
        300: colors.semantic.error[300],
        400: colors.semantic.error[400],
        500: colors.semantic.error[500],
        600: colors.semantic.error[600],
        700: colors.semantic.error[700],
        800: colors.semantic.error[800],
        900: colors.semantic.error[900],
        DEFAULT: colors.semantic.error[500],
        foreground: '#ffffff'
      },
      default: {
        50: colors.neutral[50],
        100: colors.neutral[100],
        200: colors.neutral[200],
        300: colors.neutral[300],
        400: colors.neutral[400],
        500: colors.neutral[500],
        600: colors.neutral[600],
        700: colors.neutral[700],
        800: colors.neutral[800],
        900: colors.neutral[900],
        DEFAULT: colors.neutral[500],
        foreground: '#ffffff'
      }
    },
    spacing,
    borderRadius,
    boxShadow: shadows,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    letterSpacing: typography.letterSpacing
  }
}

export default heroUITheme
