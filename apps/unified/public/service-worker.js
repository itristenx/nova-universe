/**
 * Nova Universe Service Worker
 * Provides offline capabilities, push notifications, and PWA functionality
 */

const CACHE_NAME = 'nova-universe-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Core CSS and JS files will be added by the build process
];

// Routes that should work offline
const OFFLINE_ROUTES = [
  '/',
  '/tickets',
  '/knowledge',
  '/dashboard'
];

/**
 * Service Worker Install Event
 * Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting...');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Install failed:', error);
      })
  );
});

/**
 * Service Worker Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('nova-universe-') && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Claiming clients...');
        return self.clients.claim();
      })
  );
});

/**
 * Service Worker Fetch Event
 * Implement cache-first strategy with network fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Only cache GET requests
  if (method !== 'GET') {
    return;
  }

  // Skip non-HTTP requests
  if (!url.startsWith('http')) {
    return;
  }

  // API requests: Network first, cache fallback
  if (url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone();
          
          // Cache successful API responses (except authentication)
          if (response.ok && !url.includes('/api/auth/')) {
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          
          return response;
        })
        .catch(() => {
          // Fallback to cache for API requests
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return offline indicator for failed API requests
              return new Response(
                JSON.stringify({
                  success: false,
                  error: 'Offline - data not available',
                  cached: false
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Static assets and pages: Cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) {
              return response;
            }

            const responseClone = response.clone();

            // Determine cache to use
            const isStaticAsset = STATIC_ASSETS.includes(new URL(url).pathname);
            const cacheName = isStaticAsset ? STATIC_CACHE_NAME : DYNAMIC_CACHE_NAME;

            caches.open(cacheName)
              .then((cache) => cache.put(request, responseClone));

            return response;
          })
          .catch(() => {
            // For navigation requests, return offline page
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For other requests, return empty response
            return new Response('', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
  );
});

/**
 * Push Notification Event
 * Handle push notifications from the server
 */
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let notificationData = {
    title: 'Nova Universe',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'nova-notification',
    renotify: true
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        actions: [
          {
            action: 'open',
            title: 'Open App',
            icon: '/icons/icon-32x32.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      };
    } catch (error) {
      console.error('[ServiceWorker] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

/**
 * Notification Click Event
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          const urlToOpen = event.notification.data?.url || '/';
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[ServiceWorker] Service worker script loaded');