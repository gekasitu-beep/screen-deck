// Screen Deck - Service Worker
// バージョン: 1.0.0

const CACHE_NAME = 'screen-deck-v1';
const urlsToCache = [
  './',
  './index.html'
];

// インストール時
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('[SW] Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// アクティベーション時
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// フェッチ時
self.addEventListener('fetch', event => {
  // Google Apps Script APIへのリクエストはキャッシュしない
  if (event.request.url.includes('script.google.com')) {
    console.log('[SW] Bypassing cache for API:', event.request.url);
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }

        // なければネットワークから取得
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request);
      })
      .catch(err => {
        console.log('[SW] Fetch failed:', err);
        // オフライン時のフォールバック処理をここに追加可能
      })
  );
});
