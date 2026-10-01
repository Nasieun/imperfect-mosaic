/* 불완전한 모자이크 서비스 워커: 최초 방문 뒤에는 비행기 모드에서도 처음부터 끝까지 체험할 수 있다. */

// 앱이 하위 경로(예: GitHub Pages의 /저장소/)에 있어도 동작하도록 등록 범위에서 기준 경로를 얻는다.
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const at = (path) => BASE + path;

const PAGES = [
  '/',
  '/journey/',
  '/my/',
  '/mosaic/',
  // 정적 빌드(GitHub Pages)에서 화면 이동 때 쓰는 페이지 데이터. 서버 모드에서는 없어서 건너뛴다.
  '/index.txt',
  '/journey/index.txt',
  '/my/index.txt',
  '/mosaic/index.txt',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
].map(at);
const MANIFEST = at('/sw-manifest.json');
const RUNTIME = 'mosaic-runtime';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch(MANIFEST, { cache: 'no-store' });
      const { version, urls } = await res.json();
      const cache = await caches.open(`mosaic-precache-${version}`);
      // 하나가 실패해도 나머지는 담는다.
      await Promise.all(
        [...PAGES, ...urls].map(async (url) => {
          try {
            const r = await fetch(url, { cache: 'reload' });
            if (r.ok) await cache.put(url, r);
            // 담지 않는 응답(예: 서버 모드의 index.txt 404)은 본문을 닫아야 연결이 풀린다.
            else await r.body?.cancel();
          } catch (e) {
            /* 다음 방문 때 다시 시도 */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const precaches = keys.filter((k) => k.startsWith('mosaic-precache-'));
      // 새 버전이 켜지면 가장 최근 사전 캐시만 남기고, 지난 버전의 런타임 캐시는 비운다.
      await Promise.all([...precaches.slice(0, -1), RUNTIME].map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function fromCache(request, options) {
  const names = await caches.keys();
  for (const name of names.reverse()) {
    const hit = await (await caches.open(name)).match(request, options);
    if (hit) return hit;
  }
  return undefined;
}

/** /journey 와 /journey/ 를 같은 페이지로 본다 */
const pageKey = (pathname) => (pathname.endsWith('/') ? pathname : pathname + '/');

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // 다른 출처: 캐시 우선
  if (url.origin !== self.location.origin) {
    event.respondWith(
      (async () => {
        const hit = await fromCache(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          if (res.ok || res.type === 'opaque') (await caches.open(RUNTIME)).put(request, res.clone());
          return res;
        } catch (e) {
          return Response.error();
        }
      })(),
    );
    return;
  }

  // 파일 목록은 캐시하지 않는다.
  if (url.pathname === MANIFEST) return;

  // 페이지 이동: 네트워크 우선, 오프라인이면 담아 둔 페이지 (쿼리 무시)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok) (await caches.open(RUNTIME)).put(pageKey(url.pathname), res.clone());
          return res;
        } catch (e) {
          return (
            (await fromCache(pageKey(url.pathname))) ||
            (await fromCache(request, { ignoreSearch: true })) ||
            (await fromCache(at('/'))) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // 빌드 파일: 캐시 우선 (해시가 붙어 있어 바뀌지 않는다)
  if (url.pathname.startsWith(at('/_next/static/'))) {
    event.respondWith(
      (async () => {
        const hit = await fromCache(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) (await caches.open(RUNTIME)).put(request, res.clone());
        return res;
      })(),
    );
    return;
  }

  // RSC 데이터 요청: 네트워크 우선, 오프라인이면 담아 둔 것. 없으면 Next가 일반 페이지 이동으로 바꾼다.
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok) (await caches.open(RUNTIME)).put(request, res.clone());
          return res;
        } catch (e) {
          return (await fromCache(request, { ignoreSearch: true })) || Response.error();
        }
      })(),
    );
    return;
  }

  // 그 밖의 같은 출처 파일: 캐시를 먼저 주고 뒤에서 새로 고친다.
  event.respondWith(
    (async () => {
      const hit = await fromCache(request);
      const network = fetch(request)
        .then(async (res) => {
          if (res.ok) (await caches.open(RUNTIME)).put(request, res.clone());
          return res;
        })
        .catch(() => undefined);
      return hit || (await network) || Response.error();
    })(),
  );
});
