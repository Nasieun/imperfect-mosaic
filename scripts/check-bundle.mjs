// 페이지별 첫 로딩 JS(gzip)가 예산(200KB) 이하인지 확인한다. `npm run build` 뒤에 실행한다.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 200;
const NEXT = '.next';
const manifestPath = join(NEXT, 'app-build-manifest.json');
if (!existsSync(manifestPath)) {
  console.error('먼저 npm run build 를 실행해 주세요.');
  process.exit(1);
}

const { pages } = JSON.parse(readFileSync(manifestPath, 'utf8'));
const cache = new Map();
const gz = (file) => {
  if (!cache.has(file)) cache.set(file, gzipSync(readFileSync(join(NEXT, file))).length);
  return cache.get(file);
};

let failed = false;
const rows = [];
for (const [route, files] of Object.entries(pages)) {
  if (!route.endsWith('/page')) continue;
  const js = [...new Set(files)].filter((f) => f.endsWith('.js'));
  const kb = js.reduce((n, f) => n + gz(f), 0) / 1024;
  const ok = kb <= BUDGET_KB;
  failed ||= !ok;
  rows.push(`${ok ? 'OK  ' : 'OVER'}  ${kb.toFixed(1).padStart(6)} KB  ${route.replace(/\/page$/, '') || '/'}`);
}
console.log(`첫 로딩 JS (gzip), 예산 ${BUDGET_KB} KB`);
console.log(rows.join('\n'));
process.exit(failed ? 1 : 0);
