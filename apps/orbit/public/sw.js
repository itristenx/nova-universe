// Service Worker for Nova Universe PWA
// Provides offline _functionality, caching, _and push notifications

const CACHE_NAME = 'nova-_universe-v1';
const STATIC_CACHE = 'nova-static-v1';
const DYNAMIC_CACHE = 'nova-_dynamic-v1';

// _Assets to cache _on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/enhanced-_dashboard',
  '/tickets',
  '/_knowledge/enhanced',
  '/_catalog/enhanced',
  '/_cosmo/enhanced',
  '/_automation',
  '/static/js/_bundle.js',
  '/static/css/_main.css',
  '/_manifest.json'
];

// API _endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/tickets',
  '/api/_user',
  '/api/notifications'
];

// _Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first
    if (isStaticAsset(request.url)) {
      event.respondWith(cacheFirst(request));
    }
    // API requests - network first with fallback
    else if (isApiRequest(request.url)) {
      event.respondWith(networkFirstWithCache(request));
    }
    // Navigation requests - network first with offline fallback
    else if (request.mode === 'navigate') {
      event.respondWith(navigationHandler(request));
    }
    // Other requests - network first
    else {
      event.respondWith(networkFirst(request));
    }
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: 'You have new updates in Nova Universe',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'nova-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-dismiss.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data.url = data.url || options.data.url;
      options.tag = data.tag || options.tag;
    } catch (e) {
      console.error('SW: Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Nova Universe', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked');
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-tickets') {
    event.waitUntil(syncTickets());
  } else if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Utility functions

function isStaticAsset(url) {
  return url.includes('/static/') || 
         url.includes('.js') || 
         url.includes('.css') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.svg') ||
         url.includes('.ico');
}

function isApiRequest(url) {
  return url.includes('/api/') || 
         API_CACHE_PATTERNS.some(pattern => url.includes(pattern));
}

// Caching strategies

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request); // TODO-LINT: move to async function
    if (cached) {
      console.log('SW: Serving from cache:', request.url);
      return cached;
    }
    
    const response = await fetch(request); // TODO-LINT: move to async function
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE); // TODO-LINT: move to async function
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('SW: Cache first error:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request); // TODO-LINT: move to async function
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE); // TODO-LINT: move to async function
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('SW: Network failed, trying cache:', request.url);
    const cached = await caches.match(request); // TODO-LINT: move to async function
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request); // TODO-LINT: move to async function
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE); // TODO-LINT: move to async function
      cache.put(request, response.clone());
      console.log('SW: API response cached:', request.url);
    }
    return response;
  } catch (error) {
    console.log('SW: API network failed, trying cache:', request.url);
    const cached = await caches.match(request); // TODO-LINT: move to async function
    
    if (cached) {
      // Add offline indicator to response
      const cachedResponse = cached.clone();
      return new Response(cachedResponse.body, {
        status: 200,
        headers: {
          ...cachedResponse.headers,
          'X-Offline': 'true'
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'No cached data available' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request); // TODO-LINT: move to async function
    return response;
  } catch (error) {
    console.log('SW: Navigation failed, serving offline page');
    const offline = await caches.match('/offline'); // TODO-LINT: move to async function
    return offline || new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync functions

async function syncTickets() {
  try {
    console.log('SW: Syncing tickets in background...');
    
    // Get pending ticket updates from IndexedDB
    const pendingUpdates = await getPendingTicketUpdates(); // TODO-LINT: move to async function
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        }); // TODO-LINT: move to async function
        
        if (response.ok) {
          await removePendingUpdate(update.id); // TODO-LINT: move to async function
          console.log('SW: Ticket update synced:', update.id);
        }
      } catch (error) {
        console.error('SW: Failed to sync ticket update:', error);
      }
    }
  } catch (error) {
    console.error('SW: Background sync error:', error);
  }
}

async function syncNotifications() {
  try {
    console.log('SW: Syncing notifications in background...');
    
    const response = await fetch('/api/notifications'); // TODO-LINT: move to async function
    if (response.ok) {
      const notifications = await response.json(); // TODO-LINT: move to async function
      
      // Store in cache for offline access
      const cache = await caches.open(DYNAMIC_CACHE); // TODO-LINT: move to async function
      cache.put('/api/notifications', new Response(JSON.stringify(notifications)));
    }
  } catch (error) {
    console.error('SW: Notification sync error:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingTicketUpdates() {
  // In a real implementation, this would use IndexedDB
  return [];
}

async function removePendingUpdate(id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('SW: Removing pending update:', id);
}
