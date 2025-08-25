/**
 * Enhanced Apple-Inspired Design Tokens - Phase 1 Implementation
 * Extends existing design system with Apple Human Interface Guidelines
 */

// Apple-inspired typography scale with SF Pro fallbacks
export const appleTypography = {
  // Font families with proper fallbacks
  fontFamily: {
    system: [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'SF Pro Text',
      'Inter',
      'system-ui',
      'sans-serif',
    ].join(', '),
    mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'].join(
      ', ',
    ),
  },

  // Apple-inspired type scale
  fontSize: {
    // Large titles
    largeTitle: '34px',
    title1: '28px',
    title2: '22px',
    title3: '20px',

    // Headlines
    headline: '17px',
    subheadline: '15px',

    // Body text
    body: '17px',
    callout: '16px',
    footnote: '13px',
    caption1: '12px',
    caption2: '11px',
  },

  // Apple line heights
  lineHeight: {
    largeTitle: '1.21',
    title1: '1.18',
    title2: '1.27',
    title3: '1.25',
    headline: '1.29',
    subheadline: '1.27',
    body: '1.29',
    callout: '1.25',
    footnote: '1.23',
    caption1: '1.33',
    caption2: '1.27',
  },

  // Apple font weights
  fontWeight: {
    ultraLight: '100',
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900',
  },
} as const;

// Apple-inspired spacing system (4px base grid)
export const appleSpacing = {
  // Micro spacing
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
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

// Apple-inspired semantic color system
export const appleColors = {
  // System colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemIndigo: '#5856D6',
  systemOrange: '#FF9500',
  systemPink: '#FF2D92',
  systemPurple: '#AF52DE',
  systemRed: '#FF3B30',
  systemTeal: '#5AC8FA',
  systemYellow: '#FFCC00',

  // Gray colors
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // Label colors (adaptive)
  label: {
    primary: '#000000',
    secondary: '#3C3C43',
    tertiary: '#3C3C4399',
    quaternary: '#3C3C432E',
  },

  // Label colors dark mode
  labelDark: {
    primary: '#FFFFFF',
    secondary: '#EBEBF5',
    tertiary: '#EBEBF599',
    quaternary: '#EBEBF52E',
  },

  // Fill colors
  fill: {
    primary: '#78788033',
    secondary: '#78788028',
    tertiary: '#7676801E',
    quaternary: '#74748014',
  },

  // Fill colors dark mode
  fillDark: {
    primary: '#78788052',
    secondary: '#78788047',
    tertiary: '#7676803D',
    quaternary: '#74748033',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
  },

  // Background colors dark mode
  backgroundDark: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },

  // Grouped background colors
  groupedBackground: {
    primary: '#F2F2F7',
    secondary: '#FFFFFF',
    tertiary: '#F2F2F7',
  },

  // Grouped background colors dark mode
  groupedBackgroundDark: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },

  // Separator colors
  separator: {
    opaque: '#C6C6C8',
    nonOpaque: '#3C3C4349',
  },

  // Separator colors dark mode
  separatorDark: {
    opaque: '#38383A',
    nonOpaque: '#54545899',
  },
} as const;

// Apple-inspired border radius
export const appleBorderRadius = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// Apple-inspired shadows
export const appleShadows = {
  // Elevation shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Apple-style inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Focus shadows
  focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  focusVisible: '0 0 0 2px #FFFFFF, 0 0 0 4px #007AFF',
} as const;

// Apple-inspired motion/animation
export const appleMotion = {
  // Timing functions
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Duration
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },

  // Spring animations (for libraries that support them)
  spring: {
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
  },
} as const;

// Apple-inspired z-index scale
export const appleZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
} as const;

// Breakpoints for responsive design
export const appleBreakpoints = {
  xs: '375px', // iPhone SE
  sm: '768px', // iPad Portrait
  md: '1024px', // iPad Landscape / Small Desktop
  lg: '1280px', // Desktop
  xl: '1440px', // Large Desktop
  '2xl': '1920px', // Extra Large Desktop
} as const;

// Combined Apple design tokens
export const appleDesignTokens = {
  typography: appleTypography,
  spacing: appleSpacing,
  colors: appleColors,
  borderRadius: appleBorderRadius,
  shadows: appleShadows,
  motion: appleMotion,
  zIndex: appleZIndex,
  breakpoints: appleBreakpoints,
} as const;

export default appleDesignTokens;
