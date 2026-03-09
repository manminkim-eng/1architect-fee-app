// ═══════════════════════════════════════════════════════════════
//  Service Worker — 공공기관 건축사 업무대가 산출서 PWA
//  캐시 버전을 올리면 자동으로 이전 캐시 삭제 + 새 파일 캐시
// ═══════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v1.6.0';
const CACHE_NAME    = `fee-calc-app-${CACHE_VERSION}`;

// ─── 반드시 오프라인에서도 필요한 로컬 파일 ───
const LOCAL_FILES = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png',
    './icons/favicon-32.png',
    './icons/favicon-16.png'
];

// ─── 외부 CDN 라이브러리 (최초 접속 시 캐시) ───
const CDN_FILES = [
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://cdn.tailwindcss.com',
    'https://html2canvas.hertzen.com/dist/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js'
];

// ═══════════════════════════════════════════════════════════════
//  1. INSTALL — 파일을 캐시에 미리 저장
// ═══════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
    console.log(`[SW] 설치 시작 (${CACHE_VERSION})`);

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // 로컬 파일: 반드시 캐시 (실패 시 설치 중단)
            await cache.addAll(LOCAL_FILES);
            console.log('[SW] 로컬 파일 캐시 완료');

            // CDN 파일: 가능하면 캐시 (실패해도 설치 계속)
            for (const url of CDN_FILES) {
                try {
                    await cache.add(url);
                } catch (err) {
                    console.warn('[SW] CDN 캐시 실패 (무시):', url);
                }
            }
            console.log('[SW] CDN 파일 캐시 완료');
        })
    );

    // 기존 SW 즉시 교체
    self.skipWaiting();
});

// ═══════════════════════════════════════════════════════════════
//  2. ACTIVATE — 이전 버전 캐시 정리
// ═══════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
    console.log(`[SW] 활성화 (${CACHE_VERSION})`);

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] 이전 캐시 삭제:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    // 즉시 모든 탭에 적용
    self.clients.claim();
});

// ═══════════════════════════════════════════════════════════════
//  3. FETCH — 요청 가로채기
//     전략: Cache First + Network Fallback
// ═══════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // GET 요청만 캐시
    if (request.method !== 'GET') return;

    // Google Fonts: Stale While Revalidate
    if (request.url.includes('fonts.googleapis.com') ||
        request.url.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(request);
                const fetched = fetch(request).then((response) => {
                    if (response.ok) cache.put(request, response.clone());
                    return response;
                }).catch(() => cached);
                return cached || fetched;
            })
        );
        return;
    }

    // 기본: Cache First
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // 오프라인 + 캐시 미스
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
                return new Response('오프라인 상태입니다.', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});
