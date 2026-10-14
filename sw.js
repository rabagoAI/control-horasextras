// Service worker: permite instalar la app y usarla sin conexión.
// Archivos propios: primero red (siempre la última versión) y, sin conexión, la copia guardada.
// Librerías externas (CDN): copia guardada al instante y actualización en segundo plano.
const CACHE = 'horas-extras-v1';

const APP_SHELL = [
    './',
    'index.html',
    'style.css',
    'manifest.webmanifest',
    'js/state.js',
    'js/ui.js',
    'js/storage.js',
    'js/overtime.js',
    'js/employees.js',
    'js/kanban.js',
    'js/reports.js',
    'js/app.js',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/favicon-32.png',
    'icons/apple-touch-icon.png',
];

// Deben coincidir con las etiquetas <script>/<link> de index.html
const CDN_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
    'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await cache.addAll(APP_SHELL);
        // Un CDN caído no debe impedir la instalación
        await Promise.allSettled(CDN_ASSETS.map(async url => {
            const response = await fetch(url, { mode: 'no-cors' });
            await cache.put(url, response);
        }));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
        await self.clients.claim();
    })());
});

function isCacheable(response) {
    return response && (response.ok || response.type === 'opaque');
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE);
    try {
        const response = await fetch(request);
        if (isCacheable(response)) cache.put(request, response.clone());
        return response;
    } catch (err) {
        const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
        if (cached) return cached;
        if (request.mode === 'navigate') return cache.match('index.html');
        throw err;
    }
}

async function staleWhileRevalidate(event) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    const update = fetch(event.request).then(response => {
        if (isCacheable(response)) cache.put(event.request, response.clone());
        return response;
    });
    if (cached) {
        event.waitUntil(update.catch(() => {}));
        return cached;
    }
    return update;
}

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    if (url.origin === self.location.origin) {
        event.respondWith(networkFirst(event.request));
    } else {
        event.respondWith(staleWhileRevalidate(event));
    }
});
