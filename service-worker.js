/* =========================================================
   MARCOAVEN PWA
   BRICK 3 — SERVICE WORKER
   App-shell caching and offline support
========================================================= */

'use strict';

/* =========================================================
   1. CACHE CONFIGURATION
========================================================= */

const CACHE_VERSION = 'marcoaven-cache-v1';

const APP_SHELL_FILES = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];


/* =========================================================
   2. INSTALL — CACHE THE APP SHELL
========================================================= */

self.addEventListener('install', event => {

    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => {

                // Cache available app files.
                // If a listed file is missing, do not fail
                // installation because of that one file.
                return Promise.all(
                    APP_SHELL_FILES.map(file =>
                        cache.add(file).catch(error => {
                            console.warn(
                                'Marcoaven: Could not cache:',
                                file,
                                error
                            );
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );

});


/* =========================================================
   3. ACTIVATE — CLEAN UP OLD MARCOAVEN CACHES
========================================================= */

self.addEventListener('activate', event => {

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {

                const oldMarcoavenCaches =
                    cacheNames.filter(cacheName =>
                        cacheName.startsWith('marcoaven-cache-') &&
                        cacheName !== CACHE_VERSION
                    );

                return Promise.all(
                    oldMarcoavenCaches.map(cacheName =>
                        caches.delete(cacheName)
                    )
                );
            })
            .then(() => self.clients.claim())
    );

});


/* =========================================================
   4. FETCH — SERVE CACHED APP FILES WHEN AVAILABLE
========================================================= */

self.addEventListener('fetch', event => {

    const request = event.request;

    // Only handle GET requests.
    if (request.method !== 'GET') {
        return;
    }

    const requestURL = new URL(request.url);

    // Never intercept requests to other origins,
    // including APIs and external image providers.
    if (requestURL.origin !== self.location.origin) {
        return;
    }

    // Do not cache or intercept API/authentication requests.
    if (
        requestURL.pathname.includes('/auth/') ||
        requestURL.pathname.includes('/rest/') ||
        requestURL.pathname.includes('/storage/') ||
        requestURL.pathname.includes('/functions/')
    ) {
        return;
    }

    // Network-first for HTML navigation:
    // prefer the latest page, use cached HTML offline.
    if (request.mode === 'navigate') {

        event.respondWith(
            fetch(request)
                .then(response => {

                    if (response.ok) {
                        const responseCopy = response.clone();

                        caches.open(CACHE_VERSION)
                            .then(cache =>
                                cache.put(
                                    './index.html',
                                    responseCopy
                                )
                            )
                            .catch(() => {});
                    }

                    return response;
                })
                .catch(async () => {

                    return (
                        await caches.match(request)
                    ) || (
                        await caches.match('./index.html')
                    ) || Response.error();

                })
        );

        return;
    }

    // Cache-first for other same-origin GET requests.
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {

                        // Cache only successful basic responses.
                        if (
                            response.ok &&
                            response.type === 'basic'
                        ) {
                            const responseCopy =
                                response.clone();

                            caches.open(CACHE_VERSION)
                                .then(cache =>
                                    cache.put(
                                        request,
                                        responseCopy
                                    )
                                )
                                .catch(() => {});
                        }

                        return response;
                    });
            })
    );

});