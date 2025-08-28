import { i18n } from '../i18n/index';

// Import all locale files directly for comparison
import enLocale from '../i18n/locales/en.json';
import esLocale from '../i18n/locales/es.json';
import frLocale from '../i18n/locales/fr.json';
import arLocale from '../i18n/locales/ar.json';

type LocaleData = Record<string, any>;

describe('I18n Locale Completeness', () => {
  const locales = {
    en: enLocale,
    es: esLocale,
    fr: frLocale,
    ar: arLocale
  };

  function getAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getAllKeys(obj[key], currentKey));
      } else {
        keys.push(currentKey);
      }
    }
    
    return keys;
  }

  function findMissingKeys(sourceKeys: string[], targetObj: any): string[] {
    const targetKeys = getAllKeys(targetObj);
    return sourceKeys.filter(key => !targetKeys.includes(key));
  }

  function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  describe('Key Completeness Across Locales', () => {
    test('all locales should have the same keys as English', () => {
      const englishKeys = getAllKeys(enLocale);
      const results: Record<string, string[]> = {};

      Object.entries(locales).forEach(([locale, data]) => {
        if (locale !== 'en') {
          const missingKeys = findMissingKeys(englishKeys, data);
          if (missingKeys.length > 0) {
            results[locale] = missingKeys;
          }
        }
      });

      if (Object.keys(results).length > 0) {
        console.log('Missing keys by locale:');
        Object.entries(results).forEach(([locale, keys]) => {
          console.log(`${locale}: ${keys.length} missing keys`);
          keys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
          if (keys.length > 10) {
            console.log(`  ... and ${keys.length - 10} more`);
          }
        });
      }

      // This test will fail if there are missing keys, showing exactly what's missing
      expect(Object.keys(results)).toEqual([]);
    });

    test('no locale should have extra keys not in English', () => {
      const englishKeys = getAllKeys(enLocale);
      const results: Record<string, string[]> = {};

      Object.entries(locales).forEach(([locale, data]) => {
        if (locale !== 'en') {
          const currentKeys = getAllKeys(data);
          const extraKeys = currentKeys.filter(key => !englishKeys.includes(key));
          if (extraKeys.length > 0) {
            results[locale] = extraKeys;
          }
        }
      });

      if (Object.keys(results).length > 0) {
        console.log('Extra keys by locale:');
        Object.entries(results).forEach(([locale, keys]) => {
          console.log(`${locale}: ${keys.length} extra keys`);
          keys.forEach(key => console.log(`  + ${key}`));
        });
      }

      expect(Object.keys(results)).toEqual([]);
    });
  });

  describe('Translation Quality Checks', () => {
    test('no translations should be empty strings', () => {
      const emptyTranslations: Record<string, string[]> = {};

      Object.entries(locales).forEach(([locale, data]) => {
        const keys = getAllKeys(data);
        const emptyKeys = keys.filter(key => {
          const value = getValueByPath(data, key);
          return value === '' || (typeof value === 'string' && value.trim() === '');
        });

        if (emptyKeys.length > 0) {
          emptyTranslations[locale] = emptyKeys;
        }
      });

      if (Object.keys(emptyTranslations).length > 0) {
        console.log('Empty translations by locale:');
        Object.entries(emptyTranslations).forEach(([locale, keys]) => {
          console.log(`${locale}: ${keys.length} empty translations`);
          keys.forEach(key => console.log(`  - ${key}`));
        });
      }

      expect(Object.keys(emptyTranslations)).toEqual([]);
    });

    test('interpolation placeholders should be consistent', () => {
      const inconsistentPlaceholders: Record<string, any[]> = {};
      const englishKeys = getAllKeys(enLocale);

      englishKeys.forEach(key => {
        const enValue = getValueByPath(enLocale, key);
        if (typeof enValue === 'string') {
          const enPlaceholders = (enValue.match(/\{\{[^}]+\}\}/g) || []).sort();
          
          if (enPlaceholders.length > 0) {
            Object.entries(locales).forEach(([locale, data]) => {
              if (locale !== 'en') {
                const localeValue = getValueByPath(data, key);
                if (typeof localeValue === 'string') {
                  const localePlaceholders = (localeValue.match(/\{\{[^}]+\}\}/g) || []).sort();
                  
                  if (JSON.stringify(enPlaceholders) !== JSON.stringify(localePlaceholders)) {
                    if (!inconsistentPlaceholders[locale]) {
                      inconsistentPlaceholders[locale] = [];
                    }
                    inconsistentPlaceholders[locale].push({
                      key,
                      en: enPlaceholders,
                      locale: localePlaceholders,
                      enValue,
                      localeValue
                    });
                  }
                }
              }
            });
          }
        }
      });

      if (Object.keys(inconsistentPlaceholders).length > 0) {
        console.log('Inconsistent placeholders by locale:');
        Object.entries(inconsistentPlaceholders).forEach(([locale, issues]) => {
          console.log(`${locale}: ${issues.length} inconsistent placeholders`);
          issues.slice(0, 5).forEach(issue => {
            console.log(`  - ${issue.key}:`);
            console.log(`    EN: ${JSON.stringify(issue.en)} | ${locale}: ${JSON.stringify(issue.locale)}`);
          });
        });
      }

      expect(Object.keys(inconsistentPlaceholders)).toEqual([]);
    });
  });

  describe('Critical Translation Sections', () => {
    test('authentication section should be complete in all locales', () => {
      const authKeys = getAllKeys(enLocale.auth);
      const missingAuth: Record<string, string[]> = {};

      Object.entries(locales).forEach(([locale, data]) => {
        if (locale !== 'en' && data.auth) {
          const missingKeys = findMissingKeys(authKeys.map(k => `auth.${k}`), { auth: data.auth });
          if (missingKeys.length > 0) {
            missingAuth[locale] = missingKeys;
          }
        }
      });

      expect(Object.keys(missingAuth)).toEqual([]);
    });

    test('app section should be complete in all locales', () => {
      const appKeys = getAllKeys(enLocale.app);
      const missingApp: Record<string, string[]> = {};

      Object.entries(locales).forEach(([locale, data]) => {
        if (locale !== 'en' && data.app) {
          const missingKeys = findMissingKeys(appKeys.map(k => `app.${k}`), { app: data.app });
          if (missingKeys.length > 0) {
            missingApp[locale] = missingKeys;
          }
        }
      });

      expect(Object.keys(missingApp)).toEqual([]);
    });

    test('navigation section should be complete in all locales', () => {
      if (enLocale.navigation) {
        const navKeys = getAllKeys(enLocale.navigation);
        const missingNav: Record<string, string[]> = {};

        Object.entries(locales).forEach(([locale, data]) => {
          if (locale !== 'en' && data.navigation) {
            const missingKeys = findMissingKeys(navKeys.map(k => `navigation.${k}`), { navigation: data.navigation });
            if (missingKeys.length > 0) {
              missingNav[locale] = missingKeys;
            }
          }
        });

        expect(Object.keys(missingNav)).toEqual([]);
      }
    });
  });
});