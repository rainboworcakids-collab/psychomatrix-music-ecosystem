// Service Worker สำหรับ Psychomatrix Music PWA
const CACHE_NAME = 'psychomatrix-music-v1.0';
const STATIC_CACHE_NAME = 'psychomatrix-static-v1.0';
const DYNAMIC_CACHE_NAME = 'psychomatrix-dynamic-v1.0';

// Assets to cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './js/app.js',
  './js/music-core.js',
  './js/music-generator.js',
  './js/pwa-handler.js'
];

// Install event - precache assets
self.addEventListener('install', event => {
  console.log('📦 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('📦 Service Worker: Installed and assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('📦 Service Worker: Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME && cache !== STATIC_CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      }),
      // Claim clients immediately
      self.clients.claim()
    ])
    .then(() => {
      console.log('🔄 Service Worker: Activated and ready');
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Cache first strategy for all assets
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then(networkResponse => {
            // Cache the response
            if (networkResponse.ok) {
              const cache = caches.open(DYNAMIC_CACHE_NAME);
              cache.then(c => c.put(request, networkResponse.clone()));
            }
            
            return networkResponse;
          })
          .catch(error => {
            // Return offline page for HTML requests
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('./')
                .then(cached => cached || new Response('คุณกำลังออฟไลน์'));
            }
            
            // Return placeholder for images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#eee"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999">🎵</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            return Response.error();
          });
      })
  );
});

// Message handling
self.addEventListener('message', event => {
  console.log('📨 Message received:', event.data);
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
      console.log('🗑️ All caches cleared');
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker loaded successfully');