/* ═══════════════════════════════════════════════════
   v6.1.6 (2026-11-25) — 헤더 고정 — 공통 원본 MM-HEADER v1.1 주입(태블릿 · 데스크톱만 — 폭 768px · 높이 600px 이상, 휴대폰은 고정 없음 · 머리+탭 sticky · 내리면 제목 한 줄+탭으로 접힘 · 다른 sticky 패널 top 보정) — 계산 · 인쇄 불변 · MIN 「추천안대로 승인」 · 「추천안대로 진행해줘」(모바일 제외) · 캐시명 v6.1.6 (종전 v6.1.5)
   v6.1.5 (2026-11-24) — 건축 3차 교차검증 반영: 엔지니어링 고시 표기 산업통상부 고시 제2026-124호(2026. 11. 20. 시행 · 별표 불변) · 5,000억 초과 공식 · 플랜트 배수 요율 소수 둘째 자리 반올림(별표 비고) · 체크 항목 글자 클릭 · A4 보간 첨자 · 건축사법 시행일 · 하단 기준 표기 분기 · 제13조② · 제15조 · 제18조 · 별표2 비고5 · 제32 · 33조 안내 · 화학+부대 병용 안내 · 공사비 0 경고 · 캐시명 v6.1.5 (종전 v6.1.4)
   v6.1.4 (2026-11-12) — html2canvas 1.4.1 머리 태그 SRI(integrity sha384 · crossorigin) · 공통 인쇄 원본 MM-PRINT v1.0 → v1.1(지연 로더도 SRI)(정밀검토 B8 · html2canvas SRI) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-87 · 캐시명 v6.1.4 (종전 v6.1.3)
   v6.1.3 (2026-11-12) — React 18.3.1 · Babel 7.29.7 주소 unpkg → cdnjs(같은 파일 · 해시 일치) · SRI(integrity) · Pretendard CSS SRI(정밀검토 C2) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-82 · 캐시명 v6.1.3 (종전 v6.1.2)
   v6.1.2 (2026-11-12) — 건물개요 공통 원본 MM-PROJECT v1.2 → v1.3(불러오기 창 표 칸 모양 고정 — 도구 CSS 가 새지 않음 · 저장값 같음, 정밀검토 C10) · 작업지시서 §25-6-80 · 판 6.1 · 캐시명 v6.1.2 (종전 v6.1.1)
   v6.1.1 (2026-11-12) — 화면 확대 허용(viewport 의 maximum-scale=1.0 · user-scalable=no 삭제 — 휴대폰에서 두 손가락 확대 가능) (정밀검토 B17 · 작업지시서 §25-6-78) · 판 6.1 · 캐시명 v6.1.1 (종전 fee-v6.1.0)
   v6.1.0 (2026-11-12) — 건물개요 공통 원본 MM-PROJECT v1.2 새로 넣음(사업명(용역명) · 발주처 · 작성자 · 정밀검토 B6 · 작업지시서 §25-6-77) · 판 6.1 · 캐시명 v6.1.0 (종전 fee-v5.0.16)
   S3-0 회차 2026-09-04 — R27 html2canvas 클론 정화 동반 캐시명 v5.0.3
   S2 회차 2026-09-04 — index 소급(R1·R21·R26 등) 동반 캐시명 v5.0.2
   R25 회차 2026-09-04 — 자기 접두어 캐시 조회 · cors 프리캐시 · opaque 가드 · 캐시명 v5.0.1 (S10)
   공공기관 건축사 업무대가 산출기  MANMIN Ver-6.1
   Service Worker — 오프라인 캐시 + 버전 업데이트  ·  ARCHITECT KIM MANMIN
   v5.0.0 (2026-09-04) — §11-3 navigate Network-first · §17-1 PREFIX · §18-7 ORPHAN · allSettled · R19 폴백
═══════════════════════════════════════════════════ */
const PREFIX = 'fee-';
/* ═ R25 (2026-09-04) — SW 캐시 origin 오염 차단 (S10 · 지시서 §21-1 R25)
   전역 caches 의 match 는 origin 전체를 검색한다. manminkim-eng.github.io 는 34종이 한 origin 이라
   다른 도구 캐시의 opaque 응답이 <script crossorigin>(cors) 요청에 돌아가 스크립트가 폐기됐다
   (30 #root 빈 화면 · 40 html2canvas undefined). 자기 접두어 캐시만 조회하고, cross-origin
   프리캐시는 cors 로 받으며, opaque↔cors 불일치 시 캐시를 쓰지 않는다. */
const MM_EXCLUDE = [];   /* 내 접두어로 시작하지만 남의 캐시인 이름 (§17-1 충돌) */
const mmOwn   = (k) => k.indexOf(PREFIX) === 0 && !MM_EXCLUDE.some((x) => k.indexOf(x) === 0);
const mmReq   = (u) => (typeof u === 'string' && u.indexOf('http') === 0) ? new Request(u, { mode: 'cors' }) : u;
const mmMatch = (req, opt) => caches.keys()
  .then((ks) => ks.filter(mmOwn))
  .then((ks) => ks.reduce((p, k) => p.then((r) => r || caches.open(k).then((c) => c.match(req, opt))), Promise.resolve(undefined)))
  .then((r) => (r && r.type === 'opaque' && req && req.mode === 'cors') ? undefined : r);

const CACHE  = 'fee-v6.1.6';   /* 2026-10-31 v5.0.9 — 하단 설치 배너 z-index 60 → 1250(휴대전화 폭에서 초기화 · 이용안내 단추가 「설치」를 덮던 문제) */
const ORPHAN = ['manmin-cost-v3.1'];
const ASSETS = [
  './', './index.html', './manifest.json',
  './icons/icon-192x192.png', './icons/icon-512x512.png', './favicon.ico',
  './assets/fonts/manmin-fonts.css', './assets/fonts/NotoSansKR-var.woff2',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&family=DM+Mono:wght@400;500&family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.29.7/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(mmReq(u)).catch(err => console.warn('[SW] precache skip:', u, err))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE && (mmOwn(k) || ORPHAN.indexOf(k) !== -1)).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(fetch(e.request).then(res => { if (res && res.status === 200) { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return res; })
      .catch(() => mmMatch(e.request).then(c => c || mmMatch('./index.html'))));
    return;
  }
  e.respondWith(mmMatch(e.request).then(cached => {
    if (cached) { fetch(e.request).then(res => { if (res && res.status === 200) caches.open(CACHE).then(c => c.put(e.request, res.clone())); }).catch(() => {}); return cached; }
    return fetch(e.request).then(res => { if (!res || res.status !== 200 || res.type === 'opaque') return res; const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; }).catch(() => Response.error());   /* R19 */
  }));
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
console.log('[SW] loaded:', CACHE);
