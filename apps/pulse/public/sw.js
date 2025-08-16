// Nova Universe Pulse Service Worker
// Mobile-first PWA with offline ticket management

const _CACHE_NAME = 'nova-pulse-v1';
const STATIC_CACHE = 'nova-pulse-static-v1';
const DYNAMIC_CACHE = 'nova-pulse-dynamic-v1';
const OFFLINE_CACHE = 'nova-pulse-offline-v1';

// Critical assets for offline _functionality
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// API _endpoints for offline caching
const CACHEABLE_APIS = [
  '/api/tickets',
  '/api/_user/profile',
  '/api/knowledge',
  '/api/_kiosks',
  '/api/_auth/status'
];

// _Offline-first _URLs (_always serve from cache when available)
const OFFLINE_FIRST_ROUTES = [
  '/tickets',
  '/knowledge',
  '/profile'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('✅ Nova Pulse Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(OFFLINE_CACHE).then(cache => {
        // Pre-cache offline page
        return cache.add('/offline.html');
      })
    ])
    .then(() => {
      console.log('✅ Nova Pulse Service Worker installed');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('❌ Service Worker installation failed:', error);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Nova Pulse Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, OFFLINE_CACHE].includes(cacheName)) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Nova Pulse Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event with mobile-optimized strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle offline-first routes
  if (OFFLINE_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(handleOfflineFirst(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Default strategy
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Handle API requests with mobile-optimized caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheable = CACHEABLE_APIS.some(endpoint => 
    url.pathname.startsWith(endpoint)
  );

  // Non-cacheable APIs (POST, PUT, DELETE)
  if (request.method !== 'GET' || !isCacheable) {
    try {
      const response = await fetch(request); // TODO-LINT: move to async function
      
      // If it's a ticket creation/update, queue for background sync
      if (url.pathname.includes('/tickets') && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        if (!response.ok) {
          await queueOfflineAction(request); // TODO-LINT: move to async function
        }
      }
      
      return response;
    } catch (error) {
      // Queue failed requests for background sync
      if (url.pathname.includes('/tickets') && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        await queueOfflineAction(request); // TODO-LINT: move to async function
        return new Response(
          JSON.stringify({ 
            success: true, 
            offline: true,
            message: 'Request queued for when online' 
          }),
          { 
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Network unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Cacheable GET requests: Cache first, then network
  try {
    const cachedResponse = await caches.match(request); // TODO-LINT: move to async function
    
    if (cachedResponse) {
      // Serve from cache immediately, update in background
      fetchAndCache(request);
      return cachedResponse;
    }
    
    // No cache, fetch from network
    return await fetchAndCache(request); // TODO-LINT: move to async function
  } catch (error) {
    const cachedResponse = await caches.match(request); // TODO-LINT: move to async function
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Data unavailable offline',
        cached: false 
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cache-first strategy for offline-first routes
async function handleOfflineFirst(request) {
  try {
    const cachedResponse = await caches.match(request); // TODO-LINT: move to async function
    
    if (cachedResponse) {
      // Update cache in background
      fetchAndCache(request);
      return cachedResponse;
    }
    
    // No cache available, try network
    return await fetchAndCache(request); // TODO-LINT: move to async function
  } catch (error) {
    // Network failed, serve offline page
    return await caches.match('/offline.html'); // TODO-LINT: move to async function
  }
}

// Handle navigation with offline support
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request); // TODO-LINT: move to async function
    return networkResponse;
  } catch (error) {
    console.log('📡 Network failed for navigation, serving cached version');
    
    // Try to serve cached version of the page
    const cachedResponse = await caches.match(request); // TODO-LINT: move to async function
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve cached index for SPA routing
    const indexResponse = await caches.match('/'); // TODO-LINT: move to async function
    if (indexResponse) {
      return indexResponse;
    }
    
    // Last resort: offline page
    return await caches.match('/offline.html'); // TODO-LINT: move to async function
  }
}

// Handle static assets
async function handleStaticAsset(request) {
  // Cache first for better performance on mobile
  const cachedResponse = await caches.match(request); // TODO-LINT: move to async function
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request); // TODO-LINT: move to async function
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE); // TODO-LINT: move to async function
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Asset unavailable', { status: 404 });
  }
}

// Fetch and cache helper
async function fetchAndCache(request) {
  const response = await fetch(request); // TODO-LINT: move to async function
  
  if (response.ok) {
    const cache = await caches.open(DYNAMIC_CACHE); // TODO-LINT: move to async function
    cache.put(request, response.clone());
  }
  
  return response;
}

// Queue offline actions for background sync
async function queueOfflineAction(request) {
  try {
    const cache = await caches.open(OFFLINE_CACHE); // TODO-LINT: move to async function
    const clonedRequest = request.clone();
    const body = await clonedRequest.text(); // TODO-LINT: move to async function
    
    const offlineAction = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: Date.now()
    };
    
    // Store the action for later sync
    await cache.put(
      `offline-action-${Date.now()}`, 
      new Response(JSON.stringify(offlineAction))
    ); // TODO-LINT: move to async function
    
    console.log('📥 Queued offline action:', request.method, request.url);
  } catch (error) {
    console.error('❌ Failed to queue offline action:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync queued offline actions
async function syncOfflineActions() {
  try {
    const cache = await caches.open(OFFLINE_CACHE); // TODO-LINT: move to async function
    const requests = await cache.keys(); // TODO-LINT: move to async function
    
    for (const request of requests) {
      if (request.url.includes('offline-action-')) {
        try {
          const response = await cache.match(request); // TODO-LINT: move to async function
          const actionData = await response.json(); // TODO-LINT: move to async function
          
          // Replay the action
          const replayResponse = await fetch(actionData.url, {
            method: actionData.method,
            headers: actionData.headers,
            body: actionData.body
          }); // TODO-LINT: move to async function
          
          if (replayResponse.ok) {
            // Success! Remove from offline queue
            await cache.delete(request); // TODO-LINT: move to async function
            console.log('✅ Synced offline action:', actionData.method, actionData.url);
          }
        } catch (error) {
          console.log('⚠️ Failed to sync action:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
    throw error;
  }
}

// Push notifications for field technicians
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: 'New ticket assigned',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'nova-pulse-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view-ticket',
        title: 'View Ticket',
        icon: '/assets/icons/action-view.png'
      },
      {
        action: 'mark-read',
        title: 'Mark Read',
        icon: '/assets/icons/action-check.png'
      }
    ],
    data: {
      url: '/tickets'
    }
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.title = data.title || 'Nova Pulse';
    options.data.url = data.url || options.data.url;
  }
  
  event.waitUntil(
    self.registration.showNotification('Nova Pulse', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  let targetUrl = '/';
  
  if (event.action === 'view-ticket') {
    targetUrl = event.notification.data?.url || '/tickets';
  } else if (event.action === 'mark-read') {
    // Just close the notification
    return;
  } else {
    // Default click
    targetUrl = event.notification.data?.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll().then(clientList => {
      // Check if app is already open
      const hadWindowToFocus = clientList.some(windowClient => {
        if (windowClient.url === targetUrl) {
          windowClient.focus();
          return true;
        }
      });
      
      // If not open, open new window
      if (!hadWindowToFocus) {
        clients.openWindow(targetUrl);
      }
    })
  );
});

console.log('🚀 Nova Pulse Service Worker loaded and ready for mobile ITSM');
