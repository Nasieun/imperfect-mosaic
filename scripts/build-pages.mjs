// GitHub Pages용 정적 빌드. 결과는 out/ 폴더.
//   node scripts/build-pages.mjs              → 하위 경로 /imperfect-mosaic
//   BASE_PATH=/내저장소 node scripts/build-pages.mjs
//   BASE_PATH= node scripts/build-pages.mjs   → 도메인 루트(사용자 페이지·커스텀 도메인)
import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const basePath = process.env.BASE_PATH ?? '/imperfect-mosaic';
rmSync('.next', { recursive: true, force: true });
rmSync('out', { recursive: true, force: true });

const r = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, STATIC_EXPORT: 'true', NEXT_PUBLIC_BASE_PATH: basePath },
});
if (r.status !== 0) process.exit(r.status ?? 1);

// _next 폴더가 Jekyll에 의해 걸러지지 않도록 한다(브랜치 배포 방식을 쓸 때 대비).
writeFileSync('out/.nojekyll', '');
console.log(`\n정적 빌드 완료: out/  (basePath="${basePath}")`);
