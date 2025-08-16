/**
 * Main entry point for Nova Universe Design Tokens
 * Exports all tokens and theme configurations
 */

export {
  default as tokens,
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  zIndex,
  breakpoints,
} from './tokens';
export { default as cssVariables } from './css-variables';
export { default as heroUITheme } from './heroui-theme';
export { default as shadcnTheme } from './shadcn-theme';

// New design system components
export * from './typography';
export * from './icons';
export * from './icon-styles';
export * from './theme';
export * from './animations';
export * from './components/Typography';
export * from './components/NovaIcon';

// Utilities (selective export to avoid conflicts)
export {
  cn,
  isDefined,
  get,
  pxToRem,
  breakpoints as responsiveBreakpoints,
  mediaQuery,
  debounce,
  throttle,
} from './utils';

// Accessibility utilities (selective export)
export {
  CONTRAST_RATIOS,
  meetsWCAG,
  getAccessibleTextColor,
  accessibleColorPairs,
  generateAccessibleScale,
  validateColorAccessibility,
} from './accessibility';

// Import for internal use
import tokens, { colors, spacing } from './tokens';
import cssVariables from './css-variables';

// Re-export commonly used tokens for convenience
export const { colors: novaColors, typography: novaTypography, spacing: novaSpacing } = tokens;

// Utility functions for working with design tokens
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = colors;
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return undefined;
  }
  return value;
};

export const getSpacing = (key: keyof typeof spacing) => {
  return spacing[key];
};

export const createThemeCSS = (isDark = false) => {
  return `
    ${cssVariables}
    ${isDark ? '[data-theme="dark"]' : ':root'} {
      /* Additional theme-specific variables can be added here */
    }
  `;
};

// Export default design token set
export default tokens;
// Convenience re-exports for theme utilities
export { themeCSS, themeUtils } from './theme';
