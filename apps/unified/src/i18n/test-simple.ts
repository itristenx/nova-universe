import i18n from './config';

// Simple test to verify i18next is working
console.log('i18n instance:', i18n);
console.log('Current language:', i18n.language);
console.log('Supported languages:', i18n.options.supportedLngs);
console.log('Fallback language:', i18n.options.fallbackLng);

// Test translation
console.log('English translation:', i18n.t('app.name', { lng: 'en' }));
console.log('Spanish translation:', i18n.t('app.name', { lng: 'es' }));

export default i18n;
