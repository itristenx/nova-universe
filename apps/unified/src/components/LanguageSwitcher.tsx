import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
];

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'button' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showNativeName?: boolean;
  showFlag?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'dropdown',
  size = 'md',
  showIcon = true,
  showNativeName = true,
  showFlag = true,
  className = '',
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = (languages.find((lang) => lang.code === i18n.language) ??
    languages[0]) as Language;

  const handleLanguageChange = async (languageCode: string) => {
    const selectedLanguage = languages.find((lang) => lang.code === languageCode);
    if (selectedLanguage) {
      // Change language
      await i18n.changeLanguage(languageCode);

      // Update document direction
      document.documentElement.dir = selectedLanguage.dir;
      document.documentElement.lang = languageCode;

      // Store preference in localStorage
      localStorage.setItem('i18nextLng', languageCode);

      // Close dropdown
      setIsOpen(false);

      // Reload page to apply RTL/LTR styles properly
      window.location.reload();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2 py-1';
      case 'lg':
        return 'text-lg px-4 py-3';
      default:
        return 'text-base px-3 py-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  if (variant === 'button') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 ${getSizeClasses()} `}
          aria-label={t('language.switcher.title')}
          aria-expanded={isOpen ? 'true' : 'false'}
        >
          {showIcon && <LanguageIcon className={getIconSize()} />}
          {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
          <span className="font-medium">
            {showNativeName ? currentLanguage.nativeName : currentLanguage.name}
          </span>
          <ChevronDownIcon
            className={`${getIconSize()} transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown */}
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
              <div className="py-1" role="menu">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                      language.code === currentLanguage.code
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700'
                    } `}
                    role="menuitem"
                    dir={language.dir}
                  >
                    <span className="mr-2 text-lg">{language.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{language.nativeName}</span>
                      {language.name !== language.nativeName && (
                        <span className="text-xs text-gray-500">({language.name})</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentLanguage.code}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className={`cursor-pointer appearance-none rounded border-none bg-transparent pr-6 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white ${getSizeClasses()} `}
          aria-label={t('language.switcher.title')}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {showNativeName ? language.nativeName : language.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className={`absolute top-1/2 right-0 -translate-y-1/2 transform ${getIconSize()} pointer-events-none`}
        />
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <label className="sr-only">{t('language.switcher.label')}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 ${getSizeClasses()} `}
        aria-label={t('language.switcher.title')}
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        {showIcon && <LanguageIcon className={getIconSize()} />}
        {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
        <span>{showNativeName ? currentLanguage.nativeName : currentLanguage.name}</span>
        <ChevronDownIcon
          className={`${getIconSize()} transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <div className="p-1" role="menu">
              <div className="px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                {t('language.switcher.title')}
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                    language.code === currentLanguage.code
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700'
                  } `}
                  role="menuitem"
                  dir={language.dir}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{language.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{language.nativeName}</span>
                        {language.name !== language.nativeName && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {language.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {language.code === currentLanguage.code && (
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook for RTL support
export function useRTL() {
  const { i18n } = useTranslation();
  const currentLanguage = (languages.find((lang) => lang.code === i18n.language) ??
    languages[0]) as Language;

  return {
    isRTL: currentLanguage.dir === 'rtl',
    direction: currentLanguage.dir,
    language: currentLanguage,
  };
}

// Utility function for conditional RTL classes
export function rtlClass(ltrClass: string, rtlClass: string, isRTL?: boolean) {
  const { isRTL: contextIsRTL } = useRTL();
  const shouldUseRTL = isRTL !== undefined ? isRTL : contextIsRTL;
  return shouldUseRTL ? rtlClass : ltrClass;
}
