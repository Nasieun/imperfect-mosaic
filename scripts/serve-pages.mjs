// out/ 폴더를 GitHub Pages처럼 하위 경로에서 띄워 본다(배포 전 확인용).
//   node scripts/serve-pages.mjs            → http://localhost:4000/imperfect-mosaic/
//   BASE_PATH= PORT=4000 node scripts/serve-pages.mjs
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const BASE = process.env.BASE_PATH ?? '/imperfect-mosaic';
const PORT = Number(process.env.PORT ?? 4000);
const ROOT = 'out';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

function resolve(pathname) {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  const file = join(ROOT, rel);
  if (existsSync(file) && statSync(file).isFile()) return file;
  if (existsSync(join(file, 'index.html'))) return join(file, 'index.html');
  if (existsSync(file + '.html')) return file + '.html';
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (BASE && !url.pathname.startsWith(BASE)) {
    res.writeHead(302, { location: BASE + '/' }).end();
    return;
  }
  const inner = url.pathname.slice(BASE.length) || '/';
  // GitHub Pages처럼 폴더 주소는 끝에 / 를 붙여 다시 보낸다.
  if (!inner.endsWith('/') && !extname(inner) && existsSync(join(ROOT, inner, 'index.html'))) {
    res.writeHead(301, { location: BASE + inner + '/' + url.search }).end();
    return;
  }
  const file = resolve(inner);
  if (!file) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    const notFound = join(ROOT, '404.html');
    if (existsSync(notFound)) createReadStream(notFound).pipe(res);
    else res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}${BASE}/`));
