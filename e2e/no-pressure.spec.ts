import { expect, test } from '@playwright/test';
import { STEP_URL, makePiece, waitForCanvas } from './helpers';

// 화면 어디에도 완성도·비율 같은 압박 표현이 없어야 한다.
const PRESSURE = /%|완성도|점수|달성/;

const bodyText = (page: import('@playwright/test').Page) => page.locator('body').innerText();

test('모든 단계 화면에 퍼센트·완성도 표현이 없다', async ({ page }) => {
  await page.goto('/');
  expect(await bodyText(page)).not.toMatch(PRESSURE);

  for (const step of ['intro', 'story', 'care', 'close']) {
    await page.goto(STEP_URL(step));
    expect(await bodyText(page), `${step} 단계`).not.toMatch(PRESSURE);
  }

  // 조각을 만든 뒤 앱 안에서 바라보기로 넘어가 확인한다.
  await page.goto(STEP_URL('make'));
  await waitForCanvas(page);
  await makePiece(page, '기쁨');
  await makePiece(page, '실패');
  expect(await bodyText(page), 'make 단계').not.toMatch(PRESSURE);

  await page.getByRole('button', { name: '다 놓았어요' }).click();
  await expect(page).toHaveURL(/step=view/);
  await waitForCanvas(page);
  await page.locator('[data-testid="mosaic-canvas"]').click({ position: { x: 5, y: 5 } });
  await page.locator('button[data-piece-id]').first().dispatchEvent('click');
  await expect(page.getByRole('status').filter({ hasText: '중 하나예요' })).toBeVisible();
  expect(await bodyText(page), 'view 단계').not.toMatch(PRESSURE);
});
