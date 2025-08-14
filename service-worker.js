const CACHE_NAME = "static_cache"
const STATIC_ASSETS = [
    './index.html',
    './invoice.html',
    './customers.html',
    './js/main-script.js',
    './js/invoice.js',
    './js/customer.js',
    './css/main-style.css',
    './css/invoice.css',
    './css/css/solid.css',
    './css/css/brands.css',
    './css/css/fontawesome.css',
    './css/webfonts/fa-solid-900.ttf',
    './css/webfonts/fa-solid-900.woff2'
]

async function preCache(){
    const cache = await caches.open(CACHE_NAME)
    return cache.addAll(STATIC_ASSETS)
}

self.addEventListener('install', event => {
    console.log("[SW] installed");
    event.waitUntil(preCache())
})

async function cleanupCache() {
    const keys = await caches.keys()
    const keysToDelete = keys.map(key => {
        if (key !== CACHE_NAME) {
            return caches.delete(key)
        }
    })

    return Promise.all(keysToDelete)
}

self.addEventListener('activate', event => {
    console.log("[SW] activated");
    event.waitUntil(cleanupCache())
})

async function fetchAssets(event){
    try {
        const response = await fetch(event.request)
        return response
    } catch {
        const cache = await caches.open(CACHE_NAME)
        return cache.match(event.request)
    }
}

self.addEventListener('fetch', event => {
    console.log("[SW] fetched");
    event.respondWith(fetchAssets(event))
})