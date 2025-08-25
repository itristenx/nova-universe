import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallerProps {
  showDelay?: number;
  className?: string;
}

export default function PWAInstaller({ showDelay = 5000, className = '' }: PWAInstallerProps) {
  const { t } = useTranslation(['app', 'common']);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUserDismissed, setHasUserDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isInApp = isStandalone || isIOSStandalone;

    if (isInApp) {
      setIsInstalled(true);
      return;
    }

    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      if (daysSinceDismissal < 7) {
        setHasUserDismissed(true);
        return;
      }
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service worker registered successfully');

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm(t('app.pwa.updateAvailable'))) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('PWA: Service worker registration failed:', error);
        });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner after delay
      setTimeout(() => {
        if (!hasUserDismissed && !isInstalled) {
          setShowBanner(true);
        }
      }, showDelay);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showDelay, hasUserDismissed, isInstalled, t]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('PWA: User dismissed the install prompt');
        handleDismiss();
      }
    } catch (_error) {
      console.error('PWA: Install prompt failed:', error);
    } finally {
      setIsInstalling(false);
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setHasUserDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show banner if conditions aren't met
  if (isInstalled || !showBanner || !deferredPrompt || hasUserDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:max-w-sm ${className}`}
    >
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="mt-1 flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600 md:hidden dark:text-blue-400" />
                <ComputerDesktopIcon className="hidden h-6 w-6 text-blue-600 md:block dark:text-blue-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t('app.pwa.installTitle')}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('app.pwa.installDescription')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label={t('common.close')}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isInstalling ? t('app.pwa.installing') : t('app.pwa.install')}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {t('common.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for detecting PWA install status
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
        return true;
      }
    } catch (_error) {
      console.error('PWA install failed:', error);
    }

    return false;
  };

  return {
    isInstalled,
    canInstall,
    install,
  };
}
