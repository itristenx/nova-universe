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
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">
                Nova Universe
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('home')}
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/settings"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('settings')}
              </Link>
              <Link
                href="/security"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('security')}
              </Link>
              <Link
                href="/accessibility-audit"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <Link
                href="/"
                className="text-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/settings"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('settings')}
              </Link>
              <Link
                href="/security"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('security')}
              </Link>
              <Link
                href="/accessibility-audit"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('accessibility')}
              </Link>
              
              {/* Mobile Language Switcher */}
              <div className="px-3 py-2">
                <div className="text-sm text-muted-foreground mb-2">{t('language')}</div>
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
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Nova Universe
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('footerDescription')}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              {t('links')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('support')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              {t('accessibility')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/accessibility-audit"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('accessibilityAudit')}
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility-statement"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('accessibilityStatement')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
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
