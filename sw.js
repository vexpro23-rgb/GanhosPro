// A robust service worker for caching resources for offline use.

const CACHE_NAME = 'ganhospro-cache-v2';
// Add core files to cache. As this is a single page app, index.html is the main entry point.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event: open a cache and add the core assets to it.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching core assets');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: Implement "cache, then network" (stale-while-revalidate) strategy.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Try to get the response from the cache.
      const cachedResponse = await cache.match(event.request);

      // 2. Create a promise that fetches the latest version from the network.
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If we get a valid response, update the cache for the next visit.
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(err => {
        // Network request failed. If we have a cached response, it would have already been returned.
        console.warn(`Network request for ${event.request.url} failed.`, err);
        // This will propagate the error if there's no cached response.
      });

      // 3. Return the cached response immediately if it exists, 
      // otherwise wait for the network to respond.
      // The network fetch runs in the background to update the cache for the next time.
      return cachedResponse || fetchPromise;
    })
  );
});


// Activate event: clean up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If the cache name is not in our whitelist, delete it.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
