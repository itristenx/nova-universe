'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/internationalization/language-switcher';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function MainNavigation() {
  const t = useTranslations('Navigation');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      id="main-navigation"
      role="navigation"
      aria-label={t('primaryNav', { default: 'Primary' })}
      className="bg-background border-border sticky top-0 z-50 border-b"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Globe className="text-primary-foreground h-5 w-5" />
              </div>
              <span className="text-foreground ml-2 text-xl font-bold">Nova Universe</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('home')}
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/settings"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('settings')}
              </Link>
              <Link
                href="/security"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('security')}
              </Link>
              <Link
                href="/accessibility-audit"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {t('accessibility')}
              </Link>
            </div>
          </div>

          {/* Language Switcher and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher variant="compact" />

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="border-border space-y-1 border-t px-2 pt-2 pb-3 sm:px-3">
              <Link
                href="/"
                className="text-foreground hover:bg-accent hover:text-accent-foreground block min-h-11 rounded-md px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block min-h-11 rounded-md px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/settings"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block min-h-11 rounded-md px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('settings')}
              </Link>
              <Link
                href="/security"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block min-h-11 rounded-md px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('security')}
              </Link>
              <Link
                href="/accessibility-audit"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block min-h-11 rounded-md px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('accessibility')}
              </Link>

              {/* Mobile Language Switcher */}
              <div className="px-3 py-2">
                <div className="text-muted-foreground mb-2 text-sm">{t('language')}</div>
                <LanguageSwitcher variant="default" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function Footer() {
  const t = useTranslations('Common');

  return (
    <footer className="bg-muted border-border mt-auto border-t">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-foreground mb-4 text-lg font-semibold">Nova Universe</h3>
            <p className="text-muted-foreground text-sm">{t('footerDescription')}</p>
          </div>

          <div>
            <h4 className="text-foreground mb-4 text-sm font-semibold">{t('links')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {t('support')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-4 text-sm font-semibold">{t('accessibility')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/accessibility-audit"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {t('accessibilityAudit')}
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility-statement"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {t('accessibilityStatement')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-muted-foreground text-sm">
              © 2024 Nova Universe. {t('allRightsReserved')}
            </p>
            <div className="mt-4 md:mt-0">
              <LanguageSwitcher variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
