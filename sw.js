// ═══════════════════════════════════════════════════════
// JTIpilot — Service Worker (app shell only)
// ═══════════════════════════════════════════════════════
// Stratégie : network-first avec repli cache, limité à la coquille
// applicative (index.html, manifest.json, icônes). Choisi plutôt que
// cache-first car l'app est mise à jour fréquemment (nombreuses passes
// de correctifs) : network-first garantit que l'utilisateur voit toujours
// la dernière version quand il est en ligne, et ne bascule sur le cache
// que hors-ligne ou en cas d'échec réseau — pas de risque de rester
// coincé sur une version périmée qui masquerait un vrai correctif.
//
// IMPORTANT : ce service worker n'intercepte QUE les requêtes GET
// same-origin vers les fichiers de la coquille applicative listés
// ci-dessous. Tout le reste (appels Supabase, CDN SheetJS/xlsx,
// Google Fonts, requêtes IndexedDB via le navigateur, POST/PUT, etc.)
// passe intégralement à travers sans jamais être mis en cache ni
// intercepté, afin de ne jamais interférer avec la synchro Supabase
// ou la sauvegarde IndexedDB déjà en place dans l'app.

var CACHE_VERSION = 'jtipilot-shell-v1';
var SHELL_PATHS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      return cache.addAll(SHELL_PATHS).catch(function(){
        // Si un fichier manque (ex. icône pas encore déployée), ne bloque
        // pas l'installation du service worker pour autant.
      });
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_VERSION; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

function isShellRequest(url){
  if(url.origin !== self.location.origin) return false;
  var path = url.pathname;
  // Coquille applicative uniquement : page racine, index.html, manifest, icônes.
  return path === '/' ||
         /\/index\.html$/.test(path) ||
         /\/manifest\.json$/.test(path) ||
         /\/(icon-192|icon-512|icon-512-maskable|apple-touch-icon)\.png$/.test(path);
}

self.addEventListener('fetch', function(event){
  var req = event.request;

  // Ne jamais toucher aux requêtes non-GET (Supabase POST/PATCH, etc.)
  if(req.method !== 'GET') return;

  var url;
  try{ url = new URL(req.url); }catch(e){ return; }

  // Laisser passer tout ce qui n'est pas la coquille applicative :
  // Supabase, CDN (cdnjs SheetJS/xlsx, fonts.googleapis.com), API
  // geo.api.gouv.fr, Claude API, etc. — aucune interception, aucun cache.
  if(!isShellRequest(url)) return;

  event.respondWith(
    fetch(req).then(function(res){
      // Réseau dispo : on sert la version fraîche et on rafraîchit le cache.
      var resClone = res.clone();
      caches.open(CACHE_VERSION).then(function(cache){
        cache.put(req, resClone);
      });
      return res;
    }).catch(function(){
      // Hors-ligne ou échec réseau : repli sur le cache si présent.
      return caches.match(req).then(function(cached){
        return cached || Response.error();
      });
    })
  );
});