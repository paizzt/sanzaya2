const CACHE_NAME = 'sanzaya-cache-v2';
const STATIC_ASSETS = [
    '/favicon.ico',
    '/logo.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Jangan cache request POST/PUT/DELETE
    if (request.method !== 'GET') {
        return;
    }

    // Network First strategy untuk halaman HTML/Inertia dan API
    if (request.headers.get('accept').includes('text/html') || url.pathname.startsWith('/api') || request.headers.get('X-Inertia')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache First untuk static assets (JS, CSS, Images)
    if (url.pathname.startsWith('/build/') || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    return response;
                });
            })
        );
        return;
    }
});
