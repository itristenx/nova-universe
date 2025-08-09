/**
 * Nova Universe Design System
 * Phase 3 Implementation - Complete component library export
 * 
 * This is the main entry point for the Nova Universe design system.
 * Import components and tokens from this file for consistency across all apps.
 */

// Design Tokens
export * from './tokens';

// CSS Variables (should be imported in your app's main CSS file)
// import './css-variables.css';

// Core Components
export { default as Button, PrimaryButton, SecondaryButton, AccentButton, OutlineButton, GhostButton, SuccessButton, WarningButton, ErrorButton } from './Button';
export { default as Input, Label, HelpText, InputGroup, InputAddon } from './Input';
export { default as Card, CardHeader, CardBody, CardFooter, CardTitle, CardSubtitle, CardText, CardActions } from './Card';
export { default as Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export { default as Toast, ToastContainer } from './Toast';
export { default as Spinner, Skeleton, LoadingOverlay, Progress, DotsLoader, PulseLoader } from './Loading';

// Theme Provider
export { default as ThemeProvider, useTheme } from './ThemeProvider';

// Accessibility Components & Utilities
export { 
  default as AccessibilityProvider,
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleTable,
  AccessibleProgress,
  useKeyboardNavigation,
  announceToScreenReader,
  screenReaderTestUtils
} from './accessibility';

// Design System Version
export const DESIGN_SYSTEM_VERSION = '1.0.0';

// Component Registry for Development/Documentation
export const componentRegistry = {
  'Button': {
    component: 'Button',
    category: 'Actions',
    description: 'Interactive button component with multiple variants and sizes',
    variants: ['primary', 'secondary', 'accent', 'outline', 'ghost', 'success', 'warning', 'error'],
    sizes: ['sm', 'md', 'lg'],
    props: ['variant', 'size', 'disabled', 'loading', 'iconOnly', 'onClick']
  },
  'Input': {
    component: 'Input',
    category: 'Forms',
    description: 'Form input component with validation states and sizes',
    variants: ['default'],
    sizes: ['sm', 'md', 'lg'],
    states: ['default', 'error', 'success'],
    props: ['type', 'size', 'state', 'disabled', 'placeholder', 'value', 'onChange']
  },
  'Card': {
    component: 'Card',
    category: 'Layout',
    description: 'Container component for grouping related content',
    variants: ['default', 'elevated', 'flat', 'outlined'],
    states: ['default', 'success', 'warning', 'error', 'info'],
    props: ['variant', 'padding', 'interactive', 'loading', 'status']
  },
  'Modal': {
    component: 'Modal',
    category: 'Overlays',
    description: 'Modal dialog component for displaying content above the main interface',
    sizes: ['sm', 'md', 'lg', 'xl', 'full'],
    props: ['isOpen', 'onClose', 'size', 'closeOnBackdropClick', 'closeOnEscape']
  },
  'Toast': {
    component: 'Toast',
    category: 'Feedback',
    description: 'Notification component for displaying temporary messages',
    variants: ['success', 'warning', 'error', 'info'],
    props: ['type', 'title', 'message', 'duration', 'showProgress', 'actions', 'onClose']
  },
  'Loading': {
    component: 'Spinner, Skeleton, Progress',
    category: 'Feedback',
    description: 'Loading state components for indicating progress and waiting states',
    variants: ['spinner', 'skeleton', 'progress', 'dots', 'pulse'],
    props: ['size', 'variant', 'value', 'indeterminate']
  }
};

// Theme Configuration
export const themeConfig = {
  // Color mode support
  colorModes: ['light', 'dark', 'high-contrast'],
  defaultColorMode: 'light',
  
  // Responsive breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Animation preferences
  animations: {
    enabled: true,
    respectReducedMotion: true,
    defaultDuration: '200ms',
    defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Utility Functions
export const utils = {
  // Combine CSS classes safely
  cn: (...classes) => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Get color value by path (e.g., 'primary.500')
  getColor: (path, tokens) => {
    const keys = path.split('.');
    let value = tokens?.colors || {};
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return undefined;
    }
    return value;
  },
  
  // Convert px to rem
  pxToRem: (px, baseFontSize = 16) => {
    return `${px / baseFontSize}rem`;
  },
  
  // Generate responsive CSS
  responsive: (breakpoints, values) => {
    const css = {};
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'base') {
        css[key] = value;
      } else if (breakpoints[key]) {
        css[`@media (min-width: ${breakpoints[key]})`] = value;
      }
    });
    return css;
  }
};

// Design System Configuration
export const designSystemConfig = {
  name: 'Nova Universe Design System',
  version: DESIGN_SYSTEM_VERSION,
  description: 'A comprehensive design system for Nova Universe applications',
  
  // CSS Variables prefix
  cssPrefix: 'nova',
  
  // Component naming convention
  componentPrefix: 'nova',
  
  // Accessibility defaults
  accessibility: {
    focusVisible: true,
    reducedMotion: true,
    highContrast: true,
    ariaLabels: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    colorContrastAA: true,
    touchTargetSize: '44px',
    wcagCompliance: '2.1 AA'
  },
  
  // Browser support
  browserSupport: {
    chrome: '90+',
    firefox: '88+',
    safari: '14+',
    edge: '90+'
  }
};

// Development helpers
export const devTools = {
  // Validate component props in development
  validateProps: (componentName, props, expectedProps) => {
    if (process.env.NODE_ENV === 'development') {
      const unknownProps = Object.keys(props).filter(
        prop => !expectedProps.includes(prop) && !prop.startsWith('aria-') && !prop.startsWith('data-')
      );
      
      if (unknownProps.length > 0) {
        console.warn(`${componentName}: Unknown props detected:`, unknownProps);
      }
    }
  },
  
  // Log component usage for analytics
  logUsage: (componentName, variant) => {
    if (process.env.NODE_ENV === 'development' && window.__NOVA_DEV_TOOLS__) {
      window.__NOVA_DEV_TOOLS__.logComponentUsage(componentName, variant);
    }
  }
};

// CSS Variable helpers
export const cssVariables = {
  // Get CSS variable value
  get: (variable) => {
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      return getComputedStyle(document.documentElement).getPropertyValue(`--${variable}`).trim();
    }
    return null;
  },
  
  // Set CSS variable value
  set: (variable, value) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(`--${variable}`, value);
    }
  },
  
  // Remove CSS variable
  remove: (variable) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.removeProperty(`--${variable}`);
    }
  }
};

// Default export for easy importing
export default {
  version: DESIGN_SYSTEM_VERSION,
  config: designSystemConfig,
  components: componentRegistry,
  theme: themeConfig,
  utils,
  devTools,
  cssVariables
};
