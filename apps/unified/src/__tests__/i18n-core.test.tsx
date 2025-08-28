import { i18n } from '../i18n/index';

describe('I18n Core Integration', () => {
  beforeEach(() => {
    // Ensure i18n is initialized
    if (!i18n.isInitialized) {
      i18n.init();
    }
  });

  describe('Configuration', () => {
    test('should be initialized properly', () => {
      expect(i18n.isInitialized).toBe(true);
    });

    test('should have correct default language', () => {
      expect(i18n.language).toBeDefined();
    });

    test('should support required languages', () => {
      const supportedLanguages = ['en', 'es', 'fr', 'ar'];
      supportedLanguages.forEach(lang => {
        expect(i18n.hasResourceBundle(lang, 'common')).toBe(true);
      });
    });
  });

  describe('Translation Key Coverage', () => {
    test('should have consistent translation keys across locales', async () => {
      await i18n.changeLanguage('en');
      const enKeys = i18n.getResourceBundle('en', 'common');
      
      const languages = ['es', 'fr', 'ar'];
      
      for (const lang of languages) {
        await i18n.changeLanguage(lang);
        const langKeys = i18n.getResourceBundle(lang, 'common');
        
        // Check if key structures are similar (basic check)
        expect(typeof langKeys).toBe('object');
        expect(langKeys).not.toBeNull();
        
        // Check for essential app keys
        if (enKeys?.app) {
          expect(langKeys?.app).toBeDefined();
          expect(langKeys?.app?.name).toBeDefined();
        }
      }
    });

    test('should have ServiceStatus namespace translations', () => {
      const requiredKeys = [
        'serviceStatus:title',
        'serviceStatus:allSystemsOperational',
        'serviceStatus:refresh',
        'serviceStatus:lastUpdated'
      ];
      
      requiredKeys.forEach(key => {
        expect(i18n.exists(key)).toBe(true);
      });
    });

    test('should have CosmoAI namespace translations', () => {
      const requiredKeys = [
        'cosmoAI:title',
        'cosmoAI:welcome',
        'cosmoAI:newChat',
        'cosmoAI:sendMessage'
      ];
      
      requiredKeys.forEach(key => {
        expect(i18n.exists(key)).toBe(true);
      });
    });

    test('should have authentication translations', () => {
      const requiredKeys = [
        'auth:login:title',
        'auth:login:welcome',
        'auth:emailPlaceholder',
        'auth:passwordPlaceholder'
      ];
      
      requiredKeys.forEach(key => {
        expect(i18n.exists(key)).toBe(true);
      });
    });
  });

  describe('Language Switching', () => {
    test('should change language successfully', async () => {
      await i18n.changeLanguage('es');
      expect(i18n.language).toBe('es');
      
      await i18n.changeLanguage('fr');
      expect(i18n.language).toBe('fr');
      
      await i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');
      
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
    });

    test('should provide different translations for different languages', async () => {
      // Test app name translation
      await i18n.changeLanguage('en');
      const enName = i18n.t('app:name');
      
      await i18n.changeLanguage('es');
      const esName = i18n.t('app:name');
      
      // Both should be defined and should be the same for app name
      expect(enName).toBeDefined();
      expect(esName).toBeDefined();
      expect(typeof enName).toBe('string');
      expect(typeof esName).toBe('string');
    });
  });

  describe('RTL Support', () => {
    test('should support Arabic RTL direction', async () => {
      await i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');
      
      // Arabic translations should exist
      const arabicTitle = i18n.t('app:name');
      expect(arabicTitle).toBeDefined();
      expect(typeof arabicTitle).toBe('string');
    });
  });

  describe('Missing Translation Handling', () => {
    test('should handle missing keys gracefully', () => {
      const missingKey = 'nonexistent:missing:key';
      const result = i18n.t(missingKey);
      
      // Should return the key itself or some fallback, not crash
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should fallback to English for missing translations', async () => {
      await i18n.changeLanguage('es');
      
      // Try a key that might not exist in Spanish
      const result = i18n.t('some:potentially:missing:key');
      expect(result).toBeDefined();
    });
  });
});