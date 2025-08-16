/**
 * Typography System for Nova Universe
 * Comprehensive typography scale with semantic naming and improved hierarchy
 */

export const typographySystem = {
  // Font families
  fontFamily: {
    display: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    body: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    mono: [
      'JetBrains Mono',
      'Fira Code',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },

  // Semantic typography scale
  scale: {
    // Display styles (for hero sections, landing pages)
    'display-2xl': {
      fontSize: '4.5rem', // 72px
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
      fontWeight: '700',
      fontFamily: 'var(--font-family-display)',
    },
    'display-xl': {
      fontSize: '3.75rem', // 60px
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
      fontWeight: '700',
      fontFamily: 'var(--font-family-display)',
    },
    'display-lg': {
      fontSize: '3rem', // 48px
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
      fontWeight: '600',
      fontFamily: 'var(--font-family-display)',
    },
    'display-md': {
      fontSize: '2.25rem', // 36px
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
      fontWeight: '600',
      fontFamily: 'var(--font-family-display)',
    },
    'display-sm': {
      fontSize: '1.875rem', // 30px
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
      fontWeight: '600',
      fontFamily: 'var(--font-family-display)',
    },

    // Heading styles (for page titles, section headers)
    'heading-xl': {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
      fontWeight: '600',
      fontFamily: 'var(--font-family-body)',
    },
    'heading-lg': {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.4',
      letterSpacing: '-0.015em',
      fontWeight: '600',
      fontFamily: 'var(--font-family-body)',
    },
    'heading-md': {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.4',
      letterSpacing: '-0.015em',
      fontWeight: '600',
      fontFamily: 'var(--font-family-body)',
    },
    'heading-sm': {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '600',
      fontFamily: 'var(--font-family-body)',
    },
    'heading-xs': {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      letterSpacing: '0.025em',
      fontWeight: '600',
      fontFamily: 'var(--font-family-body)',
    },

    // Body text styles
    'body-xl': {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
      fontFamily: 'var(--font-family-body)',
    },
    'body-lg': {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
      fontFamily: 'var(--font-family-body)',
    },
    'body-md': {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
      fontFamily: 'var(--font-family-body)',
    },
    'body-sm': {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '400',
      fontFamily: 'var(--font-family-body)',
    },
    'body-xs': {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.5',
      letterSpacing: '0.025em',
      fontWeight: '400',
      fontFamily: 'var(--font-family-body)',
    },

    // UI element styles
    'button-lg': {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '500',
      fontFamily: 'var(--font-family-body)',
    },
    'button-md': {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '500',
      fontFamily: 'var(--font-family-body)',
    },
    'button-sm': {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.5',
      letterSpacing: '0.025em',
      fontWeight: '500',
      fontFamily: 'var(--font-family-body)',
    },

    // Label and caption styles
    'label-lg': {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '500',
      fontFamily: 'var(--font-family-body)',
    },
    'label-md': {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.5',
      letterSpacing: '0.025em',
      fontWeight: '500',
      fontFamily: 'var(--font-family-body)',
    },
    'label-sm': {
      fontSize: '0.6875rem', // 11px
      lineHeight: '1.5',
      letterSpacing: '0.05em',
      fontWeight: '500',
      fontFamily: 'var(--font-family-body)',
    },

    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      letterSpacing: '0.025em',
      fontWeight: '400',
      fontFamily: 'var(--font-family-body)',
    },

    // Code and monospace styles
    'code-lg': {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
      fontFamily: 'var(--font-family-mono)',
    },
    'code-md': {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '400',
      fontFamily: 'var(--font-family-mono)',
    },
    'code-sm': {
      fontSize: '0.6875rem', // 11px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '400',
      fontFamily: 'var(--font-family-mono)',
    },
  },

  // Responsive typography utilities
  responsive: {
    // Mobile-first breakpoint adjustments
    mobile: {
      'display-2xl': { fontSize: '2.5rem' }, // 40px on mobile
      'display-xl': { fontSize: '2.25rem' }, // 36px on mobile
      'display-lg': { fontSize: '2rem' }, // 32px on mobile
      'display-md': { fontSize: '1.75rem' }, // 28px on mobile
      'display-sm': { fontSize: '1.5rem' }, // 24px on mobile
    },
  },
};

// CSS utility classes for typography
export const typographyClasses = Object.entries(typographySystem.scale)
  .map(([name, styles]) => {
    return `.text-${name} {
    font-size: ${styles.fontSize};
    line-height: ${styles.lineHeight};
    letter-spacing: ${styles.letterSpacing};
    font-weight: ${styles.fontWeight};
    font-family: ${styles.fontFamily};
  }`;
  })
  .join('\n\n');

// Generate responsive CSS
export const responsiveTypographyClasses = Object.entries(typographySystem.responsive.mobile)
  .map(([name, styles]) => {
    return `@media (max-width: 640px) {
    .text-${name} {
      font-size: ${styles.fontSize};
    }
  }`;
  })
  .join('\n\n');

export default typographySystem;
