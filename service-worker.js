// Service Worker pour RiderWeather PWA
// Permet le fonctionnement hors-ligne

const CACHE_NAME = 'riderweather-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retourne la réponse en cache
        if (response) {
          return response;
        }
        
        // Sinon, fait la requête réseau
        return fetch(event.request).then(
          (response) => {
            // Vérifie si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone la réponse
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // En cas d'erreur, retourne une page offline simple
        return new Response(
          '<html><body><h1 style="text-align:center;margin-top:50px;">🏍️ RiderWeather</h1><p style="text-align:center;">Mode hors-ligne - Vérifiez votre connexion</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
  );
});