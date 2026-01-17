// Service Worker สำหรับ Psychomatrix Music PWA
const CACHE_NAME = 'psychomatrix-music-v1';
const OFFLINE_URL = 'offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/app.js',
  './js/music-core.js',
  './js/music-generator.js',
  './js/pwa-handler.js',
  './assets/logo.png',
  './icons/icon-72x72.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Sarabun:wght@300;400;500&display=swap'
];

// Install event - precache assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    // Network-first for API calls
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache successful API responses
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For static assets: Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('Fetch failed; returning offline page:', error);
            
            // If offline and requesting HTML, return offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            
            // Return a fallback for other file types
            if (event.request.url.includes('.css')) {
              return new Response('body { background: #f0f0f0; }', {
                headers: { 'Content-Type': 'text/css' }
              });
            }
            
            if (event.request.url.includes('.js')) {
              return new Response('console.log("Offline mode");', {
                headers: { 'Content-Type': 'application/javascript' }
              });
            }
            
            // Generic fallback
            return new Response('Offline', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for saving music data when online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-music-data') {
    event.waitUntil(syncMusicData());
  }
});

async function syncMusicData() {
  try {
    // Get pending data from IndexedDB
    const pendingData = await getPendingData();
    
    // Sync each pending item
    for (const data of pendingData) {
      const response = await fetch('/api/save-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Remove from pending after successful sync
        await removePendingData(data.id);
      }
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for background sync (stubs - implement with IndexedDB)
async function getPendingData() {
  // TODO: Implement IndexedDB access
  return [];
}

async function removePendingData(id) {
  // TODO: Implement IndexedDB access
}

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'คุณสามารถสร้างเพลงฟรีได้อีกแล้ว!',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'music-notification'
    },
    actions: [
      {
        action: 'explore',
        title: 'สร้างเพลง',
        icon: './icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'ปิด',
        icon: './icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Psychomatrix Music', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app to create music
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Do nothing, notification already closed
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-music-library') {
      event.waitUntil(updateMusicLibrary());
    }
  });
}

async function updateMusicLibrary() {
  console.log('Periodic sync: Updating music library');
  // TODO: Implement library update logic
}
