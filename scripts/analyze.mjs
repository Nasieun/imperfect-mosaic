// 번들 분석 리포트를 만든다 (.next/analyze/*.html). Windows에서도 동작하도록 환경 변수를 여기서 넣는다.
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ANALYZE: 'true' },
});
process.exit(r.status ?? 1);
