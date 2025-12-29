// ============================================
// SERVICE WORKER - PWA OFFLINE SUPPORT
// ============================================

const CACHE_NAME = 'mototaxis-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/config.js',
    '/app.js',
    '/mapa.js',
    '/pedidos.js',
    '/conductores.js',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Instalación - cachear recursos
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando archivos');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('[SW] Error al cachear:', err);
            })
    );
});

// Activación - limpiar cachés antiguos
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch - estrategia Network First con Cache Fallback
self.addEventListener('fetch', event => {
    // Solo cachear peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Ignorar peticiones a Supabase (necesitan estar online)
    if (event.request.url.includes('supabase.co')) {
        return;
    }
    
    // Ignorar peticiones a APIs externas que necesitan datos frescos
    if (event.request.url.includes('openstreetmap.org') || 
        event.request.url.includes('project-osrm.org')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si la respuesta es válida, clonarla y guardarla en caché
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, intentar obtener del caché
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        
                        // Si no está en caché y es una página HTML, mostrar página offline
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', event => {
    console.log('[SW] Sincronización en segundo plano:', event.tag);
    
    if (event.tag === 'sync-ubicaciones') {
        event.waitUntil(syncUbicaciones());
    }
});

async function syncUbicaciones() {
    // Implementar lógica de sincronización de ubicaciones
    // cuando se recupere la conexión
    console.log('[SW] Sincronizando ubicaciones...');
}

// Notificaciones Push (opcional)
self.addEventListener('push', event => {
    console.log('[SW] Push recibido:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Nuevo pedido disponible',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'Ver pedido'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Mototaxis', options)
    );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', event => {
    console.log('[SW] Click en notificación:', event);
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
