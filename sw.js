// JTIPilot Service Worker v1.0
const CACHE = 'jtipilot-v1';
const CORE = [
  '/',
  '/index.html',
  '/crm2.html',
  '/candidats2.html',
  '/missions.html',
  '/clients.html',
  '/marge2.html',
  '/tdb.html',
  '/pl.html',
  '/juridique.html',
  '/objections.html',
  '/rome.html',
  '/shared.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Core files en priorité, fonts/CDN en best-effort
      var core = CORE.slice(0, 14);
      var optional = CORE.slice(14);
      var corePromise = cache.addAll(core);
      var optPromise = Promise.allSettled(
        optional.map(function(url) {
          return fetch(url).then(function(r) { return cache.put(url, r); }).catch(function(){});
        })
      );
      return Promise.all([corePromise, optPromise]);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  // Ignorer les requêtes non-GET et cross-origin non-cachées
  if(e.request.method !== 'GET') return;
  var url = e.request.url;
  // API calls: network only
  if(url.includes('api.anthropic.com') || url.includes('fonts.gstatic.com') && !url.includes('fonts.googleapis.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if(cached) {
        // Revalider en arrière-plan (stale-while-revalidate)
        var fetchPromise = fetch(e.request).then(function(response) {
          if(response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
          }
          return response;
        }).catch(function(){});
        return cached;
      }
      return fetch(e.request).then(function(response) {
        if(response && response.status === 200 && e.request.url.startsWith(self.location.origin)) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        // Offline fallback
        if(e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
