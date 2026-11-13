// Dil Ustası servis çalışanı: kabuk dosyaları ağ-öncelikli, sesler önbellek-öncelikli.
const V = 'du-v4';
const SHELL = ['./', 'index.html', 'css/style.css', 'js/util.js', 'js/data-words.js', 'js/data-content.js', 'js/data-extra.js', 'js/podcasts.js', 'js/app.js', 'manifest.webmanifest', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'du-audio').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (e.request.headers.has('range')) return; // kısmi istekleri tarayıcıya bırak
  if (u.pathname.includes('/audio/')) {
    e.respondWith(caches.open('du-audio').then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const r = await fetch(e.request);
      if (r.ok && r.status === 200) c.put(e.request, r.clone());
      return r;
    }));
    return;
  }
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
