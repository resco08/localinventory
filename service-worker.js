const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/customers.html',
  '/invoice.html',
  '/css/main-style.css',
  '/css/invoice.css',
  '/css/css/fontawesome.css',
  '/css/css/brands.css',
  '/css/css/solid.css',
  '/js/customer.js',
  '/js/invoice.js',
  '/js/main-script.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Failed to cache some resources:', error);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Serve from cache
      }
      return fetch(event.request); // Fetch from network if not cached
    })
  );
});
