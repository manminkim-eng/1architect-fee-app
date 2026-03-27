/* ════════════════════════════════════════════════════════════
   sw.js — Service Worker  |  산출대가 MANMIN PWA
   전략: Cache-First (오프라인 완전 지원)
   버전 변경 → 자동 업데이트 배너 표시
════════════════════════════════════════════════════════════ */

const CACHE_NAME   = 'manmin-cost-v3.1';
const OFFLINE_URL  = './index.html';

/* 캐시할 핵심 자원 목록 */
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  /* 아이콘 */
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-256x256.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/brand-icon.png',
  './icons/favicon-16x16.png',
  './icons/favicon-32.png',
];

/* 외부 CDN — 네트워크 우선, 실패 시 캐시 */
const CDN_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
];

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())   /* 즉시 활성화 */
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))   /* 구 캐시 제거 */
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* POST 등 비-GET 요청 → 무시 */
  if (request.method !== 'GET') return;

  /* CDN 자원 → Network-First (캐시 fallback) */
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  /* 로컬 자원 → Cache-First (네트워크 fallback + 백그라운드 갱신) */
  event.respondWith(cacheFirstStrategy(request));
});

/* Cache-First with background update */
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
      }
      return response;
    })
    .catch(() => null);

  return cached || await fetchPromise || caches.match(OFFLINE_URL);
}

/* Network-First with cache fallback */
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(c => c.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || await caches.match(OFFLINE_URL);
  }
}

/* ── MESSAGE — SKIP_WAITING (업데이트 즉시 적용) ── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
