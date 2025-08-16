'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

const LANGUAGE_INFO: Record<string, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
  },
};

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  showFlags?: boolean;
  showDirection?: boolean;
}

export function LanguageSwitcher({
  variant = 'default',
  showFlags = true,
  showDirection = false,
}: LanguageSwitcherProps) {
  const tAccessibility = useTranslations('Accessibility');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGE_INFO[locale];
  const availableLanguages = routing.locales.map((code) => LANGUAGE_INFO[code]);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-label={tAccessibility('languageSelector')}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
        </Button>

        {isOpen && (
          <div
            className="bg-background border-border absolute top-full right-0 z-50 mt-2 w-48 rounded-md border shadow-lg"
            role="menu"
            aria-orientation="vertical"
          >
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md focus:outline-none"
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  {showFlags && <span className="text-sm">{language.flag}</span>}
                  <span className="text-sm">{language.nativeName}</span>
                </div>
                {locale === language.code && <Check className="text-primary h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="flex min-w-[140px] items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={tAccessibility('languageSelector')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {showFlags && <span>{currentLanguage.flag}</span>}
          <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
          {showDirection && (
            <Badge variant="secondary" className="px-1 py-0 text-xs">
              {currentLanguage.direction.toUpperCase()}
            </Badge>
          )}
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          className="bg-background border-border absolute top-full right-0 z-50 mt-2 w-56 rounded-md border shadow-lg"
          role="menu"
          aria-orientation="vertical"
        >
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="hover:bg-accent focus:bg-accent flex w-full cursor-pointer items-center justify-between px-3 py-3 text-sm first:rounded-t-md last:rounded-b-md focus:outline-none"
              role="menuitem"
            >
              <div className="flex items-center gap-3">
                {showFlags && <span>{language.flag}</span>}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{language.nativeName}</span>
                  <span className="text-muted-foreground text-xs">{language.name}</span>
                </div>
                {showDirection && (
                  <Badge variant="outline" className="ml-2 px-1 py-0 text-xs">
                    {language.direction.toUpperCase()}
                  </Badge>
                )}
              </div>
              {locale === language.code && <Check className="text-primary h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for getting language information
export function useLanguageInfo() {
  const locale = useLocale();
  return {
    current: LANGUAGE_INFO[locale],
    available: routing.locales.map((code) => LANGUAGE_INFO[code]),
  };
}

// Component for displaying language direction context
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const direction = LANGUAGE_INFO[locale]?.direction || 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [direction, locale]);

  return <>{children}</>;
}

// Component for RTL-aware layout
interface RTLLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function RTLLayout({ children, className = '' }: RTLLayoutProps) {
  const locale = useLocale();
  const isRTL = LANGUAGE_INFO[locale]?.direction === 'rtl';

  return (
    <div
      className={`${className} ${isRTL ? 'rtl-layout' : 'ltr-layout'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </div>
  );
}
