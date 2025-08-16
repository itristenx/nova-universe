/**
 * Nova Universe Theme Provider
 * Phase 3 Implementation - React theme provider for design system
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { designSystemConfig, themeConfig } from './index';

// Theme Context
const ThemeContext = createContext({
  colorMode: 'light',
  setColorMode: () => {},
  theme: themeConfig,
  config: designSystemConfig,
});

// Theme Provider Component
export function ThemeProvider({
  children,
  defaultColorMode = 'light',
  enableSystemTheme = true,
  storageKey = 'nova-theme',
}) {
  const [colorMode, setColorModeState] = useState(() => {
    // Try to get theme from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['light', 'dark', 'high-contrast'].includes(stored)) {
        return stored;
      }

      // Fall back to system preference if enabled
      if (enableSystemTheme && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

        if (prefersHighContrast) return 'high-contrast';
        if (prefersDark) return 'dark';
      }
    }

    return defaultColorMode;
  });

  // Update document theme attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', colorMode);

      // Also update class for compatibility
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, '')
        .trim();
      document.documentElement.classList.add(`theme-${colorMode}`);
    }
  }, [colorMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystemTheme || typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleSystemThemeChange = () => {
      // Only update if no explicit theme is set in localStorage
      const stored = localStorage.getItem(storageKey);
      if (stored) return;

      if (highContrastQuery.matches) {
        setColorModeState('high-contrast');
      } else if (darkModeQuery.matches) {
        setColorModeState('dark');
      } else {
        setColorModeState('light');
      }
    };

    darkModeQuery.addEventListener('change', handleSystemThemeChange);
    highContrastQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleSystemThemeChange);
      highContrastQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [enableSystemTheme, storageKey]);

  const setColorMode = (mode) => {
    if (typeof window !== 'undefined') {
      if (mode === 'system') {
        localStorage.removeItem(storageKey);
        // Determine system theme
        if (window.matchMedia('(prefers-contrast: high)').matches) {
          setColorModeState('high-contrast');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setColorModeState('dark');
        } else {
          setColorModeState('light');
        }
      } else {
        localStorage.setItem(storageKey, mode);
        setColorModeState(mode);
      }
    }
  };

  const contextValue = {
    colorMode,
    setColorMode,
    theme: themeConfig,
    config: designSystemConfig,

    // Helper functions
    isDark: colorMode === 'dark',
    isLight: colorMode === 'light',
    isHighContrast: colorMode === 'high-contrast',

    // Toggle between light and dark
    toggleColorMode: () => {
      setColorMode(colorMode === 'light' ? 'dark' : 'light');
    },
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for color mode only
export function useColorMode() {
  const { colorMode, setColorMode, toggleColorMode, isDark, isLight, isHighContrast } = useTheme();
  return {
    colorMode,
    setColorMode,
    toggleColorMode,
    isDark,
    isLight,
    isHighContrast,
  };
}

// CSS-in-JS theme object for styled-components or emotion
export function createStyledTheme(colorMode = 'light') {
  const baseTheme = {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      accent: 'var(--color-accent)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      info: 'var(--color-info)',
      background: 'var(--color-background)',
      surface: 'var(--color-surface)',
      content: 'var(--color-content)',
      muted: 'var(--color-muted)',
      white: 'var(--color-white)',
      black: 'var(--color-black)',
    },
    spacing: {
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
      xl: 'var(--spacing-xl)',
    },
    typography: {
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
        display: 'var(--font-display)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
      },
      fontWeight: {
        thin: 'var(--font-thin)',
        light: 'var(--font-light)',
        normal: 'var(--font-normal)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
        extrabold: 'var(--font-extrabold)',
        black: 'var(--font-black)',
      },
    },
    borderRadius: {
      none: 'var(--radius-none)',
      sm: 'var(--radius-sm)',
      base: 'var(--radius-base)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      '2xl': 'var(--radius-2xl)',
      '3xl': 'var(--radius-3xl)',
      full: 'var(--radius-full)',
    },
    shadows: {
      xs: 'var(--shadow-xs)',
      sm: 'var(--shadow-sm)',
      base: 'var(--shadow-base)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
      '2xl': 'var(--shadow-2xl)',
      inner: 'var(--shadow-inner)',
      none: 'var(--shadow-none)',
    },
    zIndex: {
      hide: 'var(--z-hide)',
      auto: 'var(--z-auto)',
      base: 'var(--z-base)',
      docked: 'var(--z-docked)',
      dropdown: 'var(--z-dropdown)',
      sticky: 'var(--z-sticky)',
      banner: 'var(--z-banner)',
      overlay: 'var(--z-overlay)',
      modal: 'var(--z-modal)',
      popover: 'var(--z-popover)',
      skipLink: 'var(--z-skip-link)',
      toast: 'var(--z-toast)',
      tooltip: 'var(--z-tooltip)',
    },
    transitions: {
      duration: {
        75: 'var(--duration-75)',
        100: 'var(--duration-100)',
        150: 'var(--duration-150)',
        200: 'var(--duration-200)',
        300: 'var(--duration-300)',
        500: 'var(--duration-500)',
        700: 'var(--duration-700)',
        1000: 'var(--duration-1000)',
      },
      easing: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        inOut: 'var(--ease-in-out)',
      },
    },
    breakpoints: themeConfig.breakpoints,
    colorMode,
  };

  return baseTheme;
}

// Higher-order component for theme injection
export function withTheme(Component) {
  return function ThemedComponent(props) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}

// CSS custom properties injection
export function injectCSSVariables() {
  if (typeof document === 'undefined') return;

  // Create a style element for CSS variables
  const existingStyle = document.getElementById('nova-css-variables');
  if (existingStyle) return; // Already injected

  const style = document.createElement('style');
  style.id = 'nova-css-variables';

  // Import CSS variables from the design system
  style.textContent = `@import url('./css-variables.css');`;

  document.head.appendChild(style);
}

// Initialize theme system
export function initializeTheme(options = {}) {
  const {
    colorMode = 'light',
    enableSystemTheme = true,
    storageKey = 'nova-theme',
    injectVariables = true,
  } = options;

  // Inject CSS variables if requested
  if (injectVariables) {
    injectCSSVariables();
  }

  // Set initial theme
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', colorMode);
    document.documentElement.classList.add(`theme-${colorMode}`);
  }

  return {
    colorMode,
    enableSystemTheme,
    storageKey,
  };
}
