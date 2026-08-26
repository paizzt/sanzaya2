const CACHE_NAME = 'sanzaya-cache-v4';
const STATIC_ASSETS = [
    '/favicon.ico',
    '/logo.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                STATIC_ASSETS.map(url => {
                    return fetch(url).then(response => {
                        if (!response.ok) throw new Error('Response not ok');
                        return cache.put(url, response);
                    }).catch(err => {
                        console.warn('Service Worker: Gagal menyimpan cache untuk', url);
                    });
                })
            );
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
                .catch(async () => {
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    if (request.headers.get('accept').includes('text/html')) {
                        // Optional: return caches.match('/offline.html') if you have one
                    }
                    return new Response("Network error and no cache available.", { status: 503, statusText: "Service Unavailable" });
                })
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
