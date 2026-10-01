import { expect, type Page } from '@playwright/test';

export const STEP_URL = (step: string) => `/journey?step=${step}`;

/** 랜딩 → 시작하기(또는 새로 만들기) → 안내 화면 */
export async function startJourney(page: Page, options: { goto?: boolean } = {}) {
  if (options.goto !== false) await page.goto('/');
  await page.getByRole('button', { name: /^(시작하기|새로 만들기)$/ }).click();
  await expect(page.getByRole('heading', { name: '시작하기 전에' })).toBeVisible();
}

/** 안내·마음 체크·이야기를 건너뛰고 2단계로 */
export async function skipToMake(page: Page) {
  await page.getByRole('button', { name: '좋아요' }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page).toHaveURL(/step=make/);
  await waitForCanvas(page);
}

/** 키보드 Tab만으로 이름이 맞는 요소까지 이동한다 */
export async function tabTo(page: Page, name: string | RegExp, max = 80) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return '';
      return (el.getAttribute('aria-label') || el.innerText || el.getAttribute('value') || '').trim();
    });
    if (typeof name === 'string' ? label === name : name.test(label)) return;
  }
  throw new Error(`Tab으로 "${name}"에 닿지 못했어요`);
}

/** 2단계 캔버스가 준비될 때까지 기다리고, 화면이 가로로 넘치지 않는지 확인한다 */
export async function waitForCanvas(page: Page) {
  await expect(page.locator('[data-testid="mosaic-canvas"] canvas').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, '가로 스크롤이 생기면 안 된다').toBeLessThanOrEqual(0);
}

/** 조각 만들기 시트로 조각 하나를 만든다 */
export async function makePiece(page: Page, kind: string, size = '보통') {
  await page.getByRole('button', { name: '조각 만들기', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: new RegExp(kind) }).click();
  await dialog.getByRole('button', { name: size, exact: true }).click();
  await dialog.getByRole('button', { name: '캔버스에 놓기' }).click();
  await expect(dialog).toBeHidden();
}

/** IndexedDB에 저장된 가장 최근 모자이크 */
export async function latestMosaic(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, unknown> | null>((resolve) => {
        const req = indexedDB.open('imperfect-mosaic');
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('mosaics')) return resolve(null);
          const all = db.transaction('mosaics', 'readonly').objectStore('mosaics').getAll();
          all.onsuccess = () => {
            const list = (all.result as { updatedAt: string }[]).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
            resolve((list[0] as Record<string, unknown>) ?? null);
          };
        };
        req.onerror = () => resolve(null);
      }),
  );
}
