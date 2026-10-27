const CACHE = 'rutina-jay-v2';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'img/sentadilla-goblet.webp', 'img/peso-muerto-rumano.webp', 'img/remo-mancuerna.webp', 'img/press-militar.webp', 'img/guardia-boxeo.webp', 'img/plancha.webp'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// red primero; si falla o tarda más de 3 s y hay copia guardada, se sirve la copia
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const red = fetch(e.request).then((r) => { if (r && (r.ok || r.type === 'opaque')) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); } return r; });
  const copia = () => caches.match(e.request, { ignoreSearch: true }).then((m) => m || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined));
  const lenta = new Promise((ok) => setTimeout(ok, 3000)).then(copia);
  e.respondWith(Promise.race([red.catch(() => copia().then((m) => m || Response.error())), lenta.then((m) => m || red)])
    .then((r) => r || red).catch(() => copia().then((m) => m || Response.error())));
});
