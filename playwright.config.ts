import { defineConfig, devices } from '@playwright/test';

// PW_STATIC=1 이면 GitHub Pages용 정적 빌드(out/, 루트 경로)를 띄워 테스트한다.
//   BASE_PATH= npm run build:pages && PW_STATIC=1 npm run test:e2e
const STATIC = Boolean(process.env.PW_STATIC);
const PORT = STATIC ? 4100 : 3200;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ko-KR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // iPhone 13 화면·터치 환경. WebKit 실행이 가능한 환경(macOS·Linux·CI)에서는
    // PW_WEBKIT=1 로 실제 Safari 엔진을 쓴다. Windows에서는 WebKit 의존 DLL이 없어 Chromium으로 대신한다.
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], ...(process.env.PW_WEBKIT ? {} : { browserName: 'chromium' as const }) },
    },
  ],
  // 프로덕션 빌드로 띄워 실제 사용 환경과 같게 테스트한다.
  webServer: {
    command: STATIC
      ? `node scripts/serve-pages.mjs`
      : `npm run build && npm run start -- -p ${PORT}`,
    env: STATIC ? { BASE_PATH: '', PORT: String(PORT) } : {},
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
