import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslations from './locales/en.json'
import esTranslations from './locales/es.json'
import frTranslations from './locales/fr.json'
import arTranslations from './locales/ar.json'

export const defaultNS = 'common'
export const fallbackLng = 'en'
export const supportedLngs = ['en', 'es', 'fr', 'ar']

// Language information for display
export const LANGUAGE_INFO = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr' as const,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr' as const,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr' as const,
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl' as const,
  },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    lng: fallbackLng, // Explicitly set to English by default
    debug: import.meta.env.DEV,
    
    ns: ['app', 'apps', 'auth', 'navigation', 'sidebar', 'common', 'dashboard', 'tickets', 'assets', 'forms'],
    defaultNS,
    
    supportedLngs,
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    // Use embedded resources instead of HTTP backend
    resources: {
      en: enTranslations,
      es: esTranslations,
      fr: frTranslations,
      ar: arTranslations,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    react: {
      useSuspense: false,
    },
  })

export default i18n
