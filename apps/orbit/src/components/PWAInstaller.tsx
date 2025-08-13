'use client';

import { useEffect } from 'react';

export function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  if (confirm('A new version is available. Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle PWA install prompt
    let deferredPrompt: Event | null = null;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install banner after a delay
      setTimeout(() => {
        showInstallBanner();
      }, 3000);
    };

    const showInstallBanner = () => {
      const banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
          color: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">Install Nova Universe</div>
            <div style="font-size: 14px; opacity: 0.9;">Get the full app experience with offline access and push notifications</div>
          </div>
          <div style="display: flex; gap: 8px; margin-left: 16px;">
            <button id="pwa-install-btn" style="
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              backdrop-filter: blur(10px);
            ">Install</button>
            <button id="pwa-dismiss-btn" style="
              background: transparent;
              border: none;
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 18px;
              cursor: pointer;
              opacity: 0.8;
            ">×</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(banner);

      // Install button click
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.addEventListener('click', async () => {
          if (deferredPrompt && 'prompt' in deferredPrompt) {
            (deferredPrompt as any).prompt();
            const result = await (deferredPrompt as any).userChoice;
            console.log(`User response to the install prompt: ${result.outcome}`);
            deferredPrompt = null;
          }
          banner.remove();
        });
      }

      // Dismiss button click
      const dismissBtn = document.getElementById('pwa-dismiss-btn');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          banner.remove();
          // Remember dismissal for 24 hours
          localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        });
      }

      // Auto dismiss after 10 seconds
      setTimeout(() => {
        if (document.getElementById('pwa-install-banner')) {
          banner.remove();
        }
      }, 10000);
    };

    // Check if user hasn't dismissed recently
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    const shouldShowPrompt = !lastDismissed || 
      (Date.now() - parseInt(lastDismissed)) > 24 * 60 * 60 * 1000; // 24 hours

    if (shouldShowPrompt) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
      
      // Show success message
      const successBanner = document.createElement('div');
      successBanner.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1001;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
        ">
          ✓ Nova Universe installed successfully!
        </div>
      `;
      document.body.appendChild(successBanner);
      
      setTimeout(() => successBanner.remove(), 3000);
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log('Notification permission:', permission);
        });
      }, 5000);
    }

    // Cleanup
    return () => {
      if (shouldShowPrompt) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  return null;
}
