/**
 * Nova Universe Design Tokens
 * Apple Liquid Glass 2025 Design Language
 * 
 * This file defines the complete design token system following Apple's
 * Liquid Glass design language specifications for 2025.
 */

export const liquidGlassColors = {
  // System Colors (Apple HIG)
  system: {
    blue: { light: '#007AFF', dark: '#0A84FF' },
    green: { light: '#34C759', dark: '#30D158' },
    indigo: { light: '#5856D6', dark: '#5E5CE6' },
    orange: { light: '#FF9500', dark: '#FF9F0A' },
    pink: { light: '#FF2D55', dark: '#FF375F' },
    purple: { light: '#AF52DE', dark: '#BF5AF2' },
    red: { light: '#FF3B30', dark: '#FF453A' },
    teal: { light: '#5AC8FA', dark: '#64D2FF' },
    yellow: { light: '#FFCC00', dark: '#FFD60A' },
    gray: { light: '#8E8E93', dark: '#8E8E93' },
  },

  // UI Element Colors
  ui: {
    background: {
      primary: { light: '#FFFFFF', dark: '#000000' },
      secondary: { light: '#F2F2F7', dark: '#1C1C1E' },
      tertiary: { light: '#FFFFFF', dark: '#2C2C2E' },
      elevated: { light: '#FFFFFF', dark: '#3A3A3C' },
    },
    label: {
      primary: { light: '#000000', dark: '#FFFFFF' },
      secondary: { light: 'rgba(60, 60, 67, 0.6)', dark: 'rgba(235, 235, 245, 0.6)' },
      tertiary: { light: 'rgba(60, 60, 67, 0.3)', dark: 'rgba(235, 235, 245, 0.3)' },
      quaternary: { light: 'rgba(60, 60, 67, 0.18)', dark: 'rgba(235, 235, 245, 0.18)' },
    },
    fill: {
      primary: { light: 'rgba(120, 120, 128, 0.2)', dark: 'rgba(120, 120, 128, 0.36)' },
      secondary: { light: 'rgba(120, 120, 128, 0.16)', dark: 'rgba(120, 120, 128, 0.32)' },
      tertiary: { light: 'rgba(118, 118, 128, 0.12)', dark: 'rgba(118, 118, 128, 0.24)' },
      quaternary: { light: 'rgba(116, 116, 128, 0.08)', dark: 'rgba(116, 116, 128, 0.18)' },
    },
    separator: {
      opaque: { light: '#C6C6C8', dark: '#38383A' },
      nonOpaque: { light: 'rgba(60, 60, 67, 0.29)', dark: 'rgba(84, 84, 88, 0.65)' },
    },
    groupedBackground: {
      primary: { light: '#F2F2F7', dark: '#000000' },
      secondary: { light: '#FFFFFF', dark: '#1C1C1E' },
      tertiary: { light: '#F2F2F7', dark: '#2C2C2E' },
    },
  },

  // Liquid Glass Materials
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.72)',
      backgroundHeavy: 'rgba(255, 255, 255, 0.85)',
      backgroundLight: 'rgba(255, 255, 255, 0.55)',
      blur: '40px',
      border: 'rgba(255, 255, 255, 0.18)',
      borderStrong: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowHeavy: 'rgba(0, 0, 0, 0.15)',
    },
    dark: {
      background: 'rgba(30, 30, 30, 0.72)',
      backgroundHeavy: 'rgba(30, 30, 30, 0.85)',
      backgroundLight: 'rgba(30, 30, 30, 0.55)',
      blur: '40px',
      border: 'rgba(255, 255, 255, 0.12)',
      borderStrong: 'rgba(255, 255, 255, 0.22)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowHeavy: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // Semantic Colors (ITSM Context)
  semantic: {
    success: { light: '#34C759', dark: '#30D158' },
    warning: { light: '#FF9500', dark: '#FF9F0A' },
    error: { light: '#FF3B30', dark: '#FF453A' },
    info: { light: '#007AFF', dark: '#0A84FF' },
  },

  // Priority Colors
  priority: {
    critical: { light: '#FF3B30', dark: '#FF453A' },
    high: { light: '#FF9500', dark: '#FF9F0A' },
    medium: { light: '#FFCC00', dark: '#FFD60A' },
    low: { light: '#34C759', dark: '#30D158' },
  },

  // Status Colors
  status: {
    open: { light: '#34C759', dark: '#30D158' },
    inProgress: { light: '#007AFF', dark: '#0A84FF' },
    pending: { light: '#FFCC00', dark: '#FFD60A' },
    resolved: { light: '#5856D6', dark: '#5E5CE6' },
    closed: { light: '#8E8E93', dark: '#8E8E93' },
    onHold: { light: '#FF9500', dark: '#FF9F0A' },
  },
} as const;

export const typography = {
  fontFamily: {
    display: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    text: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Monaco, "Courier New", Consolas, monospace',
  },

  // iOS-style text styles
  styles: {
    largeTitle: {
      fontSize: '34px',
      lineHeight: '41px',
      fontWeight: 700,
      letterSpacing: '0.374px',
    },
    title1: {
      fontSize: '28px',
      lineHeight: '34px',
      fontWeight: 700,
      letterSpacing: '0.364px',
    },
    title2: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: 600,
      letterSpacing: '0.352px',
    },
    title3: {
      fontSize: '20px',
      lineHeight: '25px',
      fontWeight: 600,
      letterSpacing: '0.38px',
    },
    headline: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: 600,
      letterSpacing: '-0.408px',
    },
    body: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: 400,
      letterSpacing: '-0.408px',
    },
    callout: {
      fontSize: '16px',
      lineHeight: '21px',
      fontWeight: 400,
      letterSpacing: '-0.32px',
    },
    subheadline: {
      fontSize: '15px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '-0.24px',
    },
    footnote: {
      fontSize: '13px',
      lineHeight: '18px',
      fontWeight: 400,
      letterSpacing: '-0.078px',
    },
    caption1: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0',
    },
    caption2: {
      fontSize: '11px',
      lineHeight: '13px',
      fontWeight: 400,
      letterSpacing: '0.066px',
    },
  },
} as const;

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

export const shadows = {
  // Light mode shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  lg: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  xl: '0 8px 12px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
  '2xl': '0 16px 24px -4px rgba(0, 0, 0, 0.12), 0 8px 12px -4px rgba(0, 0, 0, 0.08)',
  '3xl': '0 24px 48px -8px rgba(0, 0, 0, 0.14), 0 12px 24px -8px rgba(0, 0, 0, 0.1)',

  // Dark mode shadows (stronger for contrast)
  'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  'dark-md': '0 2px 4px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  'dark-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
  'dark-xl': '0 8px 12px -2px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
  'dark-2xl': '0 16px 24px -4px rgba(0, 0, 0, 0.7), 0 8px 12px -4px rgba(0, 0, 0, 0.6)',
  'dark-3xl': '0 24px 48px -8px rgba(0, 0, 0, 0.8), 0 12px 24px -8px rgba(0, 0, 0, 0.7)',

  // Glass shadows (for Liquid Glass effect)
  'glass-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  'glass-md': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
  'glass-lg': '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  'glass-xl': '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
} as const;

export const borderRadius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

export const animations = {
  // Timing functions
  easing: {
    default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    springGentle: 'cubic-bezier(0.5, 1.25, 0.75, 1.25)',
  },

  // Durations
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
    slowest: '800ms',
  },

  // Keyframes (CSS-in-JS ready)
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideUp: {
      from: { transform: 'translateY(20px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      from: { transform: 'translateY(-20px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideLeft: {
      from: { transform: 'translateX(20px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    slideRight: {
      from: { transform: 'translateX(-20px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: '1' },
      to: { transform: 'scale(0.95)', opacity: '0' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },
} as const;

export const blur = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
} as const;

export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  max: 9999,
} as const;

// Utility type for accessing theme values
export type Theme = {
  colors: typeof liquidGlassColors;
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  animations: typeof animations;
  blur: typeof blur;
  breakpoints: typeof breakpoints;
  zIndex: typeof zIndex;
};

export const theme: Theme = {
  colors: liquidGlassColors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  blur,
  breakpoints,
  zIndex,
};

export default theme;
