import { useTranslation } from 'react-i18next';

// Cultural formatting utilities for different locales
export interface FormatOptions {
  locale?: string | undefined;
  currency?: string | undefined;
  timeZone?: string | undefined;
}

// Default locales mapping
export const LOCALE_MAPPING = {
  en: 'en-US',
  es: 'es-ES', 
  fr: 'fr-FR',
  ar: 'ar-SA',
} as const;

// Default currencies by locale
export const CURRENCY_MAPPING = {
  en: 'USD',
  es: 'EUR',
  fr: 'EUR', 
  ar: 'SAR',
} as const;

// Date formatting utility
export function formatDate(
  date: Date | string | number,
  options: FormatOptions & Intl.DateTimeFormatOptions = {}
): string {
  const { locale, ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  // Use provided locale or fall back to browser locale
  const formatLocale = locale || navigator.language;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...intlOptions,
  };

  try {
    return new Intl.DateTimeFormat(formatLocale, defaultOptions).format(dateObj);
  } catch (error) {
    // Fallback to English if locale is not supported
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  }
}

// Time formatting utility
export function formatTime(
  date: Date | string | number,
  options: FormatOptions & Intl.DateTimeFormatOptions = {}
): string {
  const { locale, timeZone, ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const formatLocale = locale || navigator.language;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone && { timeZone }),
    ...intlOptions,
  };

  try {
    return new Intl.DateTimeFormat(formatLocale, defaultOptions).format(dateObj);
  } catch (error) {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  }
}

// DateTime formatting utility
export function formatDateTime(
  date: Date | string | number,
  options: FormatOptions & Intl.DateTimeFormatOptions = {}
): string {
  const { locale, timeZone, ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const formatLocale = locale || navigator.language;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone && { timeZone }),
    ...intlOptions,
  };

  try {
    return new Intl.DateTimeFormat(formatLocale, defaultOptions).format(dateObj);
  } catch (error) {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  }
}

// Relative time formatting utility (e.g., "2 hours ago")
export function formatRelativeTime(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const { locale } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const formatLocale = locale || navigator.language;

  try {
    const rtf = new Intl.RelativeTimeFormat(formatLocale, { numeric: 'auto' });

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    // Fallback to English
    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    }
  }
}

// Number formatting utility
export function formatNumber(
  number: number,
  options: FormatOptions & Intl.NumberFormatOptions = {}
): string {
  const { locale, ...intlOptions } = options;
  const formatLocale = locale || navigator.language;

  try {
    return new Intl.NumberFormat(formatLocale, intlOptions).format(number);
  } catch (error) {
    return new Intl.NumberFormat('en-US', intlOptions).format(number);
  }
}

// Currency formatting utility
export function formatCurrency(
  amount: number,
  options: FormatOptions & Intl.NumberFormatOptions = {}
): string {
  const { locale, currency, ...intlOptions } = options;
  const formatLocale = locale || navigator.language;
  
  // Determine currency from locale if not provided
  const currencyCode = currency || getCurrencyForLocale(formatLocale);

  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    ...intlOptions,
  };

  try {
    return new Intl.NumberFormat(formatLocale, defaultOptions).format(amount);
  } catch (error) {
    // Fallback
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      ...intlOptions,
    }).format(amount);
  }
}

// Percentage formatting utility
export function formatPercentage(
  value: number,
  options: FormatOptions & Intl.NumberFormatOptions = {}
): string {
  const { locale, ...intlOptions } = options;
  const formatLocale = locale || navigator.language;

  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...intlOptions,
  };

  try {
    return new Intl.NumberFormat(formatLocale, defaultOptions).format(value);
  } catch (error) {
    return new Intl.NumberFormat('en-US', defaultOptions).format(value);
  }
}

// File size formatting utility
export function formatFileSize(
  bytes: number,
  options: FormatOptions = {}
): string {
  const { locale } = options;
  const formatLocale = locale || navigator.language;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  try {
    const formatter = new Intl.NumberFormat(formatLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${formatter.format(value)} ${sizes[i]}`;
  } catch (error) {
    return `${value.toFixed(2)} ${sizes[i]}`;
  }
}

// Helper function to get currency for a locale
function getCurrencyForLocale(locale: string): string {
  const languageCode = locale.split('-')[0] as keyof typeof CURRENCY_MAPPING;
  return CURRENCY_MAPPING[languageCode] || 'USD';
}

// Hook to use cultural formatting with current i18n locale
export function useCulturalFormatting() {
  const { i18n } = useTranslation();
  const currentLocale = LOCALE_MAPPING[i18n.language as keyof typeof LOCALE_MAPPING] || i18n.language;

  return {
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, { locale: currentLocale, ...options }),
      
    formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatTime(date, { locale: currentLocale, ...options }),
      
    formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(date, { locale: currentLocale, ...options }),
      
    formatRelativeTime: (date: Date | string | number) =>
      formatRelativeTime(date, { locale: currentLocale }),
      
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(number, { locale: currentLocale, ...options }),
      
    formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) =>
      formatCurrency(amount, { locale: currentLocale, currency, ...options }),
      
    formatPercentage: (value: number, options?: Intl.NumberFormatOptions) =>
      formatPercentage(value, { locale: currentLocale, ...options }),
      
    formatFileSize: (bytes: number) =>
      formatFileSize(bytes, { locale: currentLocale }),
      
    locale: currentLocale,
    language: i18n.language,
  };
}

// Predefined format configurations
export const FORMAT_PRESETS = {
  shortDate: { month: 'short', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions,
  longDate: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions,
  shortTime: { hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions,
  longTime: { hour: '2-digit', minute: '2-digit', second: '2-digit' } as Intl.DateTimeFormatOptions,
  compactNumber: { notation: 'compact', maximumFractionDigits: 1 } as Intl.NumberFormatOptions,
  currency: { style: 'currency', minimumFractionDigits: 2 } as Intl.NumberFormatOptions,
  percentage: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 } as Intl.NumberFormatOptions,
};

export default {
  formatDate,
  formatTime, 
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  useCulturalFormatting,
  FORMAT_PRESETS,
  LOCALE_MAPPING,
  CURRENCY_MAPPING,
};
