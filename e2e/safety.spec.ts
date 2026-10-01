import { expect, test } from '@playwright/test';
import { skipToMake, startJourney } from './helpers';

test('메모에 위험 표현을 쓰면 부드러운 안내가 뜨고, 텍스트는 어디에도 전송되지 않는다', async ({ page }) => {
  const TEXT = '요즘은 죽고 싶다는 생각이 들어';
  const leaks: string[] = [];
  page.on('request', (req) => {
    const body = req.postData() ?? '';
    const url = decodeURIComponent(req.url());
    if (body.includes('죽고') || url.includes('죽고')) leaks.push(req.url());
  });

  await startJourney(page);
  await skipToMake(page);
  await page.getByRole('button', { name: '조각 만들기', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('적지 않아도 괜찮아요').fill(TEXT);

  const hint = page.getByTestId('risk-hint');
  await expect(hint).toBeVisible({ timeout: 3000 });
  await expect(hint).toContainText('이야기할 수 있는 곳');

  // 체험은 막지 않는다: 그대로 조각을 놓을 수 있다.
  await dialog.getByRole('button', { name: '캔버스에 놓기' }).click();
  await expect(page.locator('button[data-piece-id]')).toHaveCount(1);
  await page.waitForTimeout(2600);

  expect(leaks).toEqual([]);
});

test('직접 쓴 돌봄에서도 안내가 뜨고, 안내에서 위기 상담 카드를 열 수 있다', async ({ page }) => {
  await page.goto('/journey?step=care');
  await page.getByRole('button', { name: /나만의 돌봄/ }).click();
  await page.getByPlaceholder('예: 좋아하는 노래 한 곡 듣기').fill('사라지고 싶어');
  const hint = page.getByTestId('risk-hint');
  await expect(hint).toBeVisible({ timeout: 3000 });
  await hint.getByRole('button', { name: '도움받을 수 있는 곳' }).click();
  await expect(page.getByTestId('crisis-sheet')).toBeVisible();
  await page.getByRole('button', { name: '이어서 하기' }).click();
  await page.getByRole('button', { name: '마무리하기' }).click();
  await expect(page).toHaveURL(/step=close/);
});

test('일상 표현에는 안내가 뜨지 않는다', async ({ page }) => {
  await page.goto('/journey?step=care');
  await page.getByRole('button', { name: /나만의 돌봄/ }).click();
  await page.getByPlaceholder('예: 좋아하는 노래 한 곡 듣기').fill('숙제를 다 끝내고 싶다');
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('risk-hint')).toHaveCount(0);
});
