/**
 * RTL (Right-to-Left) Support Utilities
 * Provides comprehensive RTL support for Arabic and other RTL languages
 */

import { LANGUAGE_INFO } from '../i18n/config';

export interface RTLConfig {
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
  float: 'left' | 'right';
  paddingDirection: 'pl' | 'pr';
  marginDirection: 'ml' | 'mr';
}

/**
 * Get RTL configuration for a given locale
 */
export function getRTLConfig(locale: string): RTLConfig {
  const languageInfo = LANGUAGE_INFO[locale as keyof typeof LANGUAGE_INFO];
  const isRTL = languageInfo?.direction === 'rtl';

  return {
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
    float: isRTL ? 'right' : 'left',
    paddingDirection: isRTL ? 'pr' : 'pl',
    marginDirection: isRTL ? 'mr' : 'ml',
  };
}

/**
 * Apply RTL configuration to document
 */
export function applyRTLToDocument(locale: string): void {
  const config = getRTLConfig(locale);

  // Set document direction
  document.documentElement.dir = config.direction;
  document.documentElement.lang = locale;

  // Add RTL class to body for CSS targeting
  if (config.direction === 'rtl') {
    document.body.classList.add('rtl');
    document.body.classList.remove('ltr');
  } else {
    document.body.classList.add('ltr');
    document.body.classList.remove('rtl');
  }
}

/**
 * Get Tailwind CSS classes for RTL support
 */
export function getRTLClasses(locale: string): string {
  const config = getRTLConfig(locale);
  const isRTL = config.direction === 'rtl';

  return [
    isRTL ? 'rtl' : 'ltr',
    isRTL ? 'text-right' : 'text-left',
    // Add flex direction classes
    isRTL ? 'flex-row-reverse' : 'flex-row',
  ].join(' ');
}

/**
 * Get directional spacing classes
 */
export function getDirectionalSpacing(
  locale: string,
  spacing: string = '4',
): {
  marginStart: string;
  marginEnd: string;
  paddingStart: string;
  paddingEnd: string;
} {
  const isRTL = getRTLConfig(locale).direction === 'rtl';

  return {
    marginStart: isRTL ? `mr-${spacing}` : `ml-${spacing}`,
    marginEnd: isRTL ? `ml-${spacing}` : `mr-${spacing}`,
    paddingStart: isRTL ? `pr-${spacing}` : `pl-${spacing}`,
    paddingEnd: isRTL ? `pl-${spacing}` : `pr-${spacing}`,
  };
}

/**
 * Hook to use RTL configuration in React components
 */
export function useRTL(locale?: string) {
  // If no locale provided, try to get from document or default to 'en'
  const currentLocale = locale || document.documentElement.lang || 'en';
  const config = getRTLConfig(currentLocale);
  const isRTL = config.direction === 'rtl';

  return {
    isRTL,
    direction: config.direction,
    textAlign: config.textAlign,
    classes: getRTLClasses(currentLocale),
    spacing: getDirectionalSpacing(currentLocale),
    applyToDocument: () => applyRTLToDocument(currentLocale),
  };
}

/**
 * Utility to get the correct icon rotation for RTL
 * Useful for chevrons, arrows, etc.
 */
export function getRTLIconRotation(locale: string, baseRotation: number = 0): number {
  const isRTL = getRTLConfig(locale).direction === 'rtl';
  return isRTL ? 180 - baseRotation : baseRotation;
}

/**
 * Get position classes for absolute/fixed positioning in RTL
 */
export function getRTLPositioning(
  locale: string,
  position: 'start' | 'end',
  value: string = '0',
): string {
  const isRTL = getRTLConfig(locale).direction === 'rtl';

  if (position === 'start') {
    return isRTL ? `right-${value}` : `left-${value}`;
  } else {
    return isRTL ? `left-${value}` : `right-${value}`;
  }
}

/**
 * Utility for handling border radius in RTL
 */
export function getRTLBorderRadius(
  locale: string,
  side: 'start' | 'end',
  size: string = 'md',
): string {
  const isRTL = getRTLConfig(locale).direction === 'rtl';

  if (side === 'start') {
    return isRTL ? `rounded-r-${size}` : `rounded-l-${size}`;
  } else {
    return isRTL ? `rounded-l-${size}` : `rounded-r-${size}`;
  }
}
