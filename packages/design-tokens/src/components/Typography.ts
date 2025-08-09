/**
 * Typography System for Nova Universe
 * CSS utilities and type definitions for typography components
 */

import { typographySystem } from '../typography'

/**
 * Typography variant types
 */
export type TypographyVariant = keyof typeof typographySystem.scale
export type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'code' | 'pre'

/**
 * Typography component props interface
 */
export interface TypographyProps {
  variant: TypographyVariant
  as?: TypographyElement
  children?: any
  className?: string
}

/**
 * Generate CSS classes for typography variants
 */
export function generateTypographyCSS(): string {
  const cssRules: string[] = []
  
  // Generate base typography classes
  Object.entries(typographySystem.scale).forEach(([variant, styles]) => {
    cssRules.push(`
.text-${variant} {
  font-size: ${styles.fontSize};
  line-height: ${styles.lineHeight};
  letter-spacing: ${styles.letterSpacing};
  font-weight: ${styles.fontWeight};
  font-family: ${styles.fontFamily};
}`)
  })
  
  // Generate responsive typography classes
  Object.entries(typographySystem.responsive.mobile).forEach(([variant, styles]) => {
    cssRules.push(`
@media (max-width: 640px) {
  .text-${variant} {
    font-size: ${styles.fontSize};
  }
}`)
  })
  
  // Generate semantic utility classes
  cssRules.push(`
/* Semantic Typography Utilities */
.typography-page-title {
  @apply text-display-md mb-6;
}

.typography-section-title {
  @apply text-heading-lg mb-4;
}

.typography-card-title {
  @apply text-heading-md mb-2;
}

.typography-form-label {
  @apply text-label-md mb-1 font-medium;
}

.typography-body-default {
  @apply text-body-md;
}

.typography-caption-default {
  @apply text-caption text-gray-600 dark:text-gray-400;
}

.typography-code-inline {
  @apply text-code-md px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-sm;
}

.typography-code-block {
  @apply text-code-md p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto;
}
`)
  
  return cssRules.join('\n')
}

/**
 * Helper function to determine default HTML element for a variant
 */
export function getDefaultElement(variant: TypographyVariant): TypographyElement {
  const variantStr = String(variant)
  
  if (variantStr.startsWith('display-')) return 'h1'
  if (variantStr.startsWith('heading-xl')) return 'h1'
  if (variantStr.startsWith('heading-lg')) return 'h2'
  if (variantStr.startsWith('heading-md')) return 'h3'
  if (variantStr.startsWith('heading-sm')) return 'h4'
  if (variantStr.startsWith('heading-xs')) return 'h5'
  if (variantStr.startsWith('body-')) return 'p'
  if (variantStr.startsWith('label-')) return 'label'
  if (variantStr.startsWith('code-')) return 'code'
  if (variantStr === 'caption') return 'span'
  return 'p'
}

/**
 * Typography mapping for semantic components
 */
export const semanticMappings = {
  displayText: {
    sm: 'display-sm' as TypographyVariant,
    md: 'display-md' as TypographyVariant,
    lg: 'display-lg' as TypographyVariant,
    xl: 'display-xl' as TypographyVariant,
    '2xl': 'display-2xl' as TypographyVariant
  },
  heading: {
    xs: 'heading-xs' as TypographyVariant,
    sm: 'heading-sm' as TypographyVariant,
    md: 'heading-md' as TypographyVariant,
    lg: 'heading-lg' as TypographyVariant,
    xl: 'heading-xl' as TypographyVariant
  },
  body: {
    xs: 'body-xs' as TypographyVariant,
    sm: 'body-sm' as TypographyVariant,
    md: 'body-md' as TypographyVariant,
    lg: 'body-lg' as TypographyVariant,
    xl: 'body-xl' as TypographyVariant
  },
  label: {
    sm: 'label-sm' as TypographyVariant,
    md: 'label-md' as TypographyVariant,
    lg: 'label-lg' as TypographyVariant
  },
  code: {
    sm: 'code-sm' as TypographyVariant,
    md: 'code-md' as TypographyVariant,
    lg: 'code-lg' as TypographyVariant
  }
}

/**
 * Get typography class name for a variant
 */
export function getTypographyClass(variant: TypographyVariant): string {
  return `text-${variant}`
}

/**
 * Get typography styles object for a variant
 */
export function getTypographyStyles(variant: TypographyVariant) {
  return typographySystem.scale[variant]
}

/**
 * CSS custom properties for typography
 */
export const typographyCustomProperties = `
:root {
  /* Font Families */
  --font-family-display: ${typographySystem.fontFamily.display.join(', ')};
  --font-family-body: ${typographySystem.fontFamily.body.join(', ')};
  --font-family-mono: ${typographySystem.fontFamily.mono.join(', ')};
}
`

// Export the generated CSS for use in applications
export const typographyCSS = generateTypographyCSS()

// Export the typography system
export { typographySystem } from '../typography'
