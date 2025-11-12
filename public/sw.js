const APP_VERSION = 'v2.0.0';
const APP_SHELL = [
  '/', '/index.html', '/styles.css',
  '/src/main.js','/src/router.js','/src/state.js','/src/push.js','/src/api.js',
  '/src/views/HomeView.js','/src/views/AddView.js','/src/views/LoginView.js','/src/views/RegisterView.js','/src/views/DetailView.js','/src/views/AboutView.js',
  '/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/icon-512-maskable.png'
];
const SHELL_CACHE = 'shell-' + APP_VERSION;
const RUNTIME_CACHE = 'runtime-' + APP_VERSION;

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![SHELL_CACHE,RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html', { cacheName: SHELL_CACHE }).then(r => r || fetch(req).catch(() => caches.match('/index.html')))
    );
    return;
  }

  if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories')) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || fetchPromise;
    })());
    return;
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg)$/)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try { const res = await fetch(req); cache.put(req, res.clone()); return res; } catch(e) { return cached || Response.error(); }
    })());
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) { data = {}; }
  const title = data.title || 'StoryMap';
  const body  = data.body || data.message || 'Notifikasi baru.';
  const icon  = data.icon || '/icons/icon-192.png';
  const badge = data.badge || '/icons/icon-192.png';
  const storyId = data.storyId || data.id;
  const actions = [
    { action: 'open', title: 'Buka' },
    storyId ? { action: 'detail', title: 'Lihat detail' } : null
  ].filter(Boolean);
  const nData = { url: storyId ? `/#/detail/${storyId}` : (data.url || '/#/home') };
  event.waitUntil(self.registration.showNotification(title, { body, icon, badge, actions, data: nData }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/#/home';
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) { client.navigate(target); client.focus(); return; }
    }
    await clients.openWindow(target);
  })());
});
