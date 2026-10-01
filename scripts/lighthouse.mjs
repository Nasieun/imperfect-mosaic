// Lighthouse CI를 실행한다. 별도 Chrome이 없어도 Playwright가 내려받은 Chromium을 쓴다.
//   npm run build && npm run lighthouse
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const r = spawnSync('npx', ['lhci', 'autorun', '--config=./lighthouserc.json'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || chromium.executablePath() },
});
process.exit(r.status ?? 1);
