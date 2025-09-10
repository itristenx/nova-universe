/**
 * Apple Design System for Nova Universe ITSM
 * Following Apple Human Interface Guidelines with enterprise ITSM adaptations
 */

// Color System - Apple-inspired with ITSM semantic meanings
export const colors = {
  // Primary Colors (Apple Blue Family)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe', 
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // System Status Colors (ITSM-specific)
  status: {
    critical: '#dc2626',    // Critical incidents
    high: '#ea580c',       // High priority
    medium: '#d97706',     // Medium priority  
    low: '#65a30d',        // Low priority
    resolved: '#16a34a',   // Resolved/Closed
    pending: '#ca8a04',    // Pending/Waiting
    inProgress: '#2563eb', // In Progress/Assigned
    onHold: '#6b7280'      // On Hold/Suspended
  },

  // Neutral Grays (Apple-inspired)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },

  // Glass Morphism
  glass: {
    light: 'rgba(255, 255, 255, 0.9)',
    medium: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(0, 0, 0, 0.1)',
    backdrop: 'rgba(255, 255, 255, 0.25)'
  }
};

// Typography Scale (Apple San Francisco Pro inspired)
export const typography = {
  // Large Titles
  largeTitle: {
    fontSize: '34px',
    lineHeight: '41px',
    fontWeight: '400',
    letterSpacing: '0.37px'
  },

  // Title Hierarchy
  title1: {
    fontSize: '28px', 
    lineHeight: '34px',
    fontWeight: '400',
    letterSpacing: '0.36px'
  },
  title2: {
    fontSize: '22px',
    lineHeight: '28px', 
    fontWeight: '400',
    letterSpacing: '0.35px'
  },
  title3: {
    fontSize: '20px',
    lineHeight: '25px',
    fontWeight: '400',
    letterSpacing: '0.38px'
  },

  // Headlines
  headline: {
    fontSize: '17px',
    lineHeight: '22px',
    fontWeight: '600',
    letterSpacing: '-0.41px'
  },

  // Body Text
  body: {
    fontSize: '17px',
    lineHeight: '22px', 
    fontWeight: '400',
    letterSpacing: '-0.41px'
  },
  bodyEmphasized: {
    fontSize: '17px',
    lineHeight: '22px',
    fontWeight: '600',
    letterSpacing: '-0.41px'
  },

  // Callouts & Labels
  callout: {
    fontSize: '16px',
    lineHeight: '21px',
    fontWeight: '400', 
    letterSpacing: '-0.32px'
  },
  subheadline: {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: '400',
    letterSpacing: '-0.24px'
  },
  footnote: {
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: '400',
    letterSpacing: '-0.08px'
  },
  caption1: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '400',
    letterSpacing: '0px'
  },
  caption2: {
    fontSize: '11px',
    lineHeight: '13px', 
    fontWeight: '400',
    letterSpacing: '0.07px'
  }
};

// Spacing System (8pt Grid)
export const spacing = {
  0: '0px',
  1: '4px',   // 0.5 * 8
  2: '8px',   // 1 * 8  
  3: '12px',  // 1.5 * 8
  4: '16px',  // 2 * 8
  5: '20px',  // 2.5 * 8
  6: '24px',  // 3 * 8
  8: '32px',  // 4 * 8
  10: '40px', // 5 * 8
  12: '48px', // 6 * 8
  16: '64px', // 8 * 8
  20: '80px', // 10 * 8
  24: '96px', // 12 * 8
  32: '128px', // 16 * 8
  40: '160px', // 20 * 8
  48: '192px', // 24 * 8
  56: '224px', // 28 * 8
  64: '256px'  // 32 * 8
};

// Border Radius (Apple-style rounded corners)
export const borderRadius = {
  none: '0px',
  xs: '2px',
  sm: '4px', 
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
};

// Shadow System (Apple depth)
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: '0 0 #0000'
};

// Transition System (Apple-style easing)
export const transitions = {
  // Apple's preferred easing curves
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)', 
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1.0)',
  
  // Duration scale
  duration: {
    fast: '150ms',
    normal: '250ms', 
    slow: '350ms',
    slower: '500ms'
  }
};

// Component Variants
export const components = {
  // Glass Morphism Card
  glassCard: {
    base: 'backdrop-blur-xl bg-white/90 border border-white/20 rounded-3xl shadow-xl',
    hover: 'hover:scale-[1.02] hover:shadow-2xl transition-all duration-250 ease-out'
  },
  
  // Apple-style Buttons
  button: {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transition-all duration-250 ease-out',
    secondary: 'bg-white/90 backdrop-blur-sm text-gray-900 font-semibold px-6 py-3 rounded-xl border border-gray-200 shadow-sm hover:bg-white hover:shadow-lg transition-all duration-250 ease-out',
    ghost: 'text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-150 ease-out'
  },

  // Form Inputs (Apple-style)
  input: {
    base: 'w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-out',
    error: 'border-red-300 focus:ring-red-500'
  },

  // Status Badges
  badge: {
    critical: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    high: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800',
    medium: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800', 
    low: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    resolved: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800'
  }
};

// Breakpoints (responsive design)
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Layout Grid
export const layout = {
  maxWidth: '1440px', // Apple's preferred max content width
  contentPadding: '24px',
  sidebarWidth: '280px',
  headerHeight: '64px'
};