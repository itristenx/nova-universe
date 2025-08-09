/**
 * Enhanced Theme System for Nova Universe
 * Dark/Light theme switching with HeroUI and ShadCN compatibility
 */

import { colors } from './tokens'

// Global declarations for DOM APIs (for Node.js compatibility)
declare const document: any
declare const window: any
declare const localStorage: any
declare const CustomEvent: any

// Theme configuration interface
export interface NovaTheme {
  name: string
  colors: {
    primary: Record<string, string>
    secondary: Record<string, string>
    background: Record<string, string>
    foreground: Record<string, string>
    accent: Record<string, string>
    destructive: Record<string, string>
    muted: Record<string, string>
    border: string
    input: string
    ring: string
    radius: string
  }
  semanticColors: {
    success: Record<string, string>
    warning: Record<string, string>
    error: Record<string, string>
    info: Record<string, string>
  }
}

// Light theme configuration
export const lightTheme: NovaTheme = {
  name: 'light',
  colors: {
    primary: {
      DEFAULT: colors.primary[600],
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
      950: colors.primary[950],
      foreground: colors.neutral[50]
    },
    secondary: {
      DEFAULT: colors.neutral[200],
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
      950: colors.neutral[950],
      foreground: colors.neutral[900]
    },
    background: {
      DEFAULT: colors.neutral[50],
      paper: colors.base,
      elevated: colors.surface,
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    foreground: {
      DEFAULT: colors.neutral[900],
      muted: colors.neutral[600],
      subtle: colors.neutral[500]
    },
    accent: {
      DEFAULT: colors.accent[500],
      50: colors.accent[50],
      100: colors.accent[100],
      200: colors.accent[200],
      300: colors.accent[300],
      400: colors.accent[400],
      500: colors.accent[500],
      600: colors.accent[600],
      700: colors.accent[700],
      800: colors.accent[800],
      900: colors.accent[900],
      950: colors.accent[950],
      foreground: colors.neutral[50]
    },
    destructive: {
      DEFAULT: colors.semantic.error[500],
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
      950: colors.semantic.error[950],
      foreground: colors.neutral[50]
    },
    muted: {
      DEFAULT: colors.neutral[100],
      50: colors.neutral[50],
      100: colors.neutral[100],
      200: colors.neutral[200],
      300: colors.neutral[300],
      foreground: colors.neutral[600]
    },
    border: colors.neutral[200],
    input: colors.neutral[200],
    ring: colors.primary[600],
    radius: '0.5rem'
  },
  semanticColors: {
    success: {
      DEFAULT: colors.semantic.success[500],
      50: colors.semantic.success[50],
      100: colors.semantic.success[100],
      500: colors.semantic.success[500],
      600: colors.semantic.success[600],
      foreground: colors.neutral[50]
    },
    warning: {
      DEFAULT: colors.semantic.warning[400],
      50: colors.semantic.warning[50],
      100: colors.semantic.warning[100],
      500: colors.semantic.warning[500],
      600: colors.semantic.warning[600],
      foreground: colors.neutral[900]
    },
    error: {
      DEFAULT: colors.semantic.error[500],
      50: colors.semantic.error[50],
      100: colors.semantic.error[100],
      500: colors.semantic.error[500],
      600: colors.semantic.error[600],
      foreground: colors.neutral[50]
    },
    info: {
      DEFAULT: colors.semantic.info[500],
      50: colors.semantic.info[50],
      100: colors.semantic.info[100],
      500: colors.semantic.info[500],
      600: colors.semantic.info[600],
      foreground: colors.neutral[50]
    }
  }
}

// Dark theme configuration
export const darkTheme: NovaTheme = {
  name: 'dark',
  colors: {
    primary: {
      DEFAULT: colors.primary[400],
      50: colors.primary[950],
      100: colors.primary[900],
      200: colors.primary[800],
      300: colors.primary[700],
      400: colors.primary[600],
      500: colors.primary[500],
      600: colors.primary[400],
      700: colors.primary[300],
      800: colors.primary[200],
      900: colors.primary[100],
      950: colors.primary[50],
      foreground: colors.neutral[950]
    },
    secondary: {
      DEFAULT: colors.neutral[800],
      50: colors.neutral[950],
      100: colors.neutral[900],
      200: colors.neutral[800],
      300: colors.neutral[700],
      400: colors.neutral[600],
      500: colors.neutral[500],
      600: colors.neutral[400],
      700: colors.neutral[300],
      800: colors.neutral[200],
      900: colors.neutral[100],
      950: colors.neutral[50],
      foreground: colors.neutral[100]
    },
    background: {
      DEFAULT: colors.neutral[950],
      paper: colors.neutral[900],
      elevated: colors.neutral[800],
      overlay: 'rgba(0, 0, 0, 0.7)'
    },
    foreground: {
      DEFAULT: colors.neutral[100],
      muted: colors.neutral[400],
      subtle: colors.neutral[500]
    },
    accent: {
      DEFAULT: colors.accent[400],
      50: colors.accent[950],
      100: colors.accent[900],
      200: colors.accent[800],
      300: colors.accent[700],
      400: colors.accent[600],
      500: colors.accent[500],
      600: colors.accent[400],
      700: colors.accent[300],
      800: colors.accent[200],
      900: colors.accent[100],
      950: colors.accent[50],
      foreground: colors.neutral[950]
    },
    destructive: {
      DEFAULT: colors.semantic.error[400],
      50: colors.semantic.error[950],
      100: colors.semantic.error[900],
      200: colors.semantic.error[800],
      300: colors.semantic.error[700],
      400: colors.semantic.error[600],
      500: colors.semantic.error[500],
      600: colors.semantic.error[400],
      700: colors.semantic.error[300],
      800: colors.semantic.error[200],
      900: colors.semantic.error[100],
      950: colors.semantic.error[50],
      foreground: colors.neutral[950]
    },
    muted: {
      DEFAULT: colors.neutral[800],
      50: colors.neutral[950],
      100: colors.neutral[900],
      200: colors.neutral[800],
      300: colors.neutral[700],
      foreground: colors.neutral[400]
    },
    border: colors.neutral[800],
    input: colors.neutral[800],
    ring: colors.primary[400],
    radius: '0.5rem'
  },
  semanticColors: {
    success: {
      DEFAULT: colors.semantic.success[400],
      50: colors.semantic.success[950],
      100: colors.semantic.success[900],
      500: colors.semantic.success[500],
      600: colors.semantic.success[400],
      foreground: colors.neutral[950]
    },
    warning: {
      DEFAULT: colors.semantic.warning[400],
      50: colors.semantic.warning[950],
      100: colors.semantic.warning[900],
      500: colors.semantic.warning[500],
      600: colors.semantic.warning[400],
      foreground: colors.neutral[950]
    },
    error: {
      DEFAULT: colors.semantic.error[400],
      50: colors.semantic.error[950],
      100: colors.semantic.error[900],
      500: colors.semantic.error[500],
      600: colors.semantic.error[400],
      foreground: colors.neutral[950]
    },
    info: {
      DEFAULT: colors.semantic.info[400],
      50: colors.semantic.info[950],
      100: colors.semantic.info[900],
      500: colors.semantic.info[500],
      600: colors.semantic.info[400],
      foreground: colors.neutral[950]
    }
  }
}

// Theme system utilities
export type ThemeMode = 'light' | 'dark' | 'auto'

export const themes = {
  light: lightTheme,
  dark: darkTheme
} as const

// CSS custom properties generator
export function generateThemeCSS(theme: NovaTheme): string {
  const cssVars: string[] = []
  
  // Primary colors
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--color-primary' : `--color-primary-${key}`
    cssVars.push(`  ${varName}: ${value};`)
  })
  
  // Secondary colors
  Object.entries(theme.colors.secondary).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--color-secondary' : `--color-secondary-${key}`
    cssVars.push(`  ${varName}: ${value};`)
  })
  
  // Background colors
  Object.entries(theme.colors.background).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--color-background' : `--color-background-${key}`
    cssVars.push(`  ${varName}: ${value};`)
  })
  
  // Foreground colors
  Object.entries(theme.colors.foreground).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--color-foreground' : `--color-foreground-${key}`
    cssVars.push(`  ${varName}: ${value};`)
  })
  
  // Accent colors
  Object.entries(theme.colors.accent).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--color-accent' : `--color-accent-${key}`
    cssVars.push(`  ${varName}: ${value};`)
  })
  
  // Destructive colors
  Object.entries(theme.colors.destructive).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--color-destructive' : `--color-destructive-${key}`
    cssVars.push(`  ${varName}: ${value};`)
  })
  
  // Muted colors
  Object.entries(theme.colors.muted).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--color-muted' : `--color-muted-${key}`
    cssVars.push(`  ${varName}: ${value};`)
  })
  
  // Semantic colors
  Object.entries(theme.semanticColors).forEach(([semantic, colorSet]) => {
    Object.entries(colorSet).forEach(([key, value]) => {
      const varName = key === 'DEFAULT' ? `--color-${semantic}` : `--color-${semantic}-${key}`
      cssVars.push(`  ${varName}: ${value};`)
    })
  })
  
  // Border, input, ring
  cssVars.push(`  --color-border: ${theme.colors.border};`)
  cssVars.push(`  --color-input: ${theme.colors.input};`)
  cssVars.push(`  --color-ring: ${theme.colors.ring};`)
  cssVars.push(`  --radius: ${theme.colors.radius};`)
  
  return cssVars.join('\n')
}

// Generate complete theme CSS
export function generateCompleteThemeCSS(): string {
  const lightCSS = generateThemeCSS(lightTheme)
  const darkCSS = generateThemeCSS(darkTheme)
  
  return `
/* Nova Universe Theme CSS Variables */
:root {
${lightCSS}
}

/* Dark theme */
:root[data-theme="dark"],
.dark {
${darkCSS}
}

/* Auto theme (respects system preference) */
@media (prefers-color-scheme: dark) {
  :root[data-theme="auto"] {
${darkCSS}
  }
}

/* Theme transition */
:root {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* HeroUI theme integration */
.heroui-theme {
  --heroui-primary: var(--color-primary);
  --heroui-secondary: var(--color-secondary);
  --heroui-background: var(--color-background);
  --heroui-foreground: var(--color-foreground);
  --heroui-success: var(--color-success);
  --heroui-warning: var(--color-warning);
  --heroui-error: var(--color-error);
  --heroui-info: var(--color-info);
}

/* ShadCN theme integration */
.shadcn-theme {
  --background: var(--color-background);
  --foreground: var(--color-foreground);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-primary-foreground);
  --secondary: var(--color-secondary);
  --secondary-foreground: var(--color-secondary-foreground);
  --muted: var(--color-muted);
  --muted-foreground: var(--color-muted-foreground);
  --accent: var(--color-accent);
  --accent-foreground: var(--color-accent-foreground);
  --destructive: var(--color-destructive);
  --destructive-foreground: var(--color-destructive-foreground);
  --border: var(--color-border);
  --input: var(--color-input);
  --ring: var(--color-ring);
  --radius: var(--radius);
}
`
}

// Theme switching utilities
export const themeUtils = {
  /**
   * Set theme mode
   */
  setTheme(mode: ThemeMode) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode)
      
      // Also add/remove dark class for compatibility
      if (mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (mode === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (mode === 'auto') {
        // Auto mode - let CSS handle it
        document.documentElement.classList.remove('dark')
      }
      
      // Store preference
      localStorage.setItem('nova-theme', mode)
      
      // Dispatch theme change event
      window.dispatchEvent(new CustomEvent('nova-theme-change', { detail: { theme: mode } }))
    }
  },
  
  /**
   * Get current theme mode
   */
  getTheme(): ThemeMode {
    if (typeof document !== 'undefined') {
      const stored = localStorage.getItem('nova-theme') as ThemeMode
      if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        return stored
      }
    }
    return 'auto'
  },
  
  /**
   * Get current effective theme (light/dark)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    const mode = this.getTheme()
    
    if (mode === 'auto') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    
    return mode
  },
  
  /**
   * Initialize theme system
   */
  initialize() {
    if (typeof document !== 'undefined') {
      const theme = this.getTheme()
      this.setTheme(theme)
      
      // Listen for system theme changes
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
          if (this.getTheme() === 'auto') {
            // Re-trigger auto theme to update
            this.setTheme('auto')
          }
        })
      }
    }
  }
}

// Export the complete CSS
export const themeCSS = generateCompleteThemeCSS()

// HeroUI theme configuration
export const heroUIThemeConfig = {
  light: {
    colors: {
      primary: lightTheme.colors.primary,
      secondary: lightTheme.colors.secondary,
      success: lightTheme.semanticColors.success,
      warning: lightTheme.semanticColors.warning,
      danger: lightTheme.semanticColors.error,
      foreground: lightTheme.colors.foreground,
      background: lightTheme.colors.background
    }
  },
  dark: {
    colors: {
      primary: darkTheme.colors.primary,
      secondary: darkTheme.colors.secondary,
      success: darkTheme.semanticColors.success,
      warning: darkTheme.semanticColors.warning,
      danger: darkTheme.semanticColors.error,
      foreground: darkTheme.colors.foreground,
      background: darkTheme.colors.background
    }
  }
}

// ShadCN theme configuration
export const shadcnThemeConfig = {
  light: {
    background: lightTheme.colors.background.DEFAULT,
    foreground: lightTheme.colors.foreground.DEFAULT,
    primary: lightTheme.colors.primary.DEFAULT,
    'primary-foreground': lightTheme.colors.primary.foreground,
    secondary: lightTheme.colors.secondary.DEFAULT,
    'secondary-foreground': lightTheme.colors.secondary.foreground,
    muted: lightTheme.colors.muted.DEFAULT,
    'muted-foreground': lightTheme.colors.muted.foreground,
    accent: lightTheme.colors.accent.DEFAULT,
    'accent-foreground': lightTheme.colors.accent.foreground,
    destructive: lightTheme.colors.destructive.DEFAULT,
    'destructive-foreground': lightTheme.colors.destructive.foreground,
    border: lightTheme.colors.border,
    input: lightTheme.colors.input,
    ring: lightTheme.colors.ring
  },
  dark: {
    background: darkTheme.colors.background.DEFAULT,
    foreground: darkTheme.colors.foreground.DEFAULT,
    primary: darkTheme.colors.primary.DEFAULT,
    'primary-foreground': darkTheme.colors.primary.foreground,
    secondary: darkTheme.colors.secondary.DEFAULT,
    'secondary-foreground': darkTheme.colors.secondary.foreground,
    muted: darkTheme.colors.muted.DEFAULT,
    'muted-foreground': darkTheme.colors.muted.foreground,
    accent: darkTheme.colors.accent.DEFAULT,
    'accent-foreground': darkTheme.colors.accent.foreground,
    destructive: darkTheme.colors.destructive.DEFAULT,
    'destructive-foreground': darkTheme.colors.destructive.foreground,
    border: darkTheme.colors.border,
    input: darkTheme.colors.input,
    ring: darkTheme.colors.ring
  }
}
