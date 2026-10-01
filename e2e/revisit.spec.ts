import { expect, test } from '@playwright/test';
import { makePiece, skipToMake, startJourney, waitForCanvas } from './helpers';

test('저장 → 새로고침 → 내 모자이크에서 보고 → 이어서 조각을 더한다', async ({ page }) => {
  await startJourney(page);
  await skipToMake(page);
  await makePiece(page, '기쁨');
  await makePiece(page, '실패');
  await page.waitForTimeout(2600); // 자동 저장

  // 랜딩: 이어서 놓기 / 새로 만들기가 같은 위계로 보인다
  await page.goto('/');
  const resume = page.getByRole('button', { name: '이어서 놓기' });
  const fresh = page.getByRole('button', { name: '새로 만들기' });
  await expect(resume).toBeVisible();
  await expect(fresh).toBeVisible();
  expect(await resume.getAttribute('class')).toBe(await fresh.getAttribute('class'));
  // 오래된 톤은 기본으로 꺼져 있다
  await expect(page.getByLabel('이전 조각에 오래된 톤 입히기')).not.toBeChecked();

  // 내 모자이크: 썸네일 카드
  await page.goto('/my');
  const card = page.getByTestId('my-mosaic');
  await expect(card).toHaveCount(1);
  await expect(card.locator('img')).toHaveCount(1);
  await expect(page.locator('body')).not.toContainText(/%|비교|변화/);

  // 이어서 놓기 → 조각 추가
  await card.getByRole('button', { name: '이어서 놓기' }).click();
  await expect(page).toHaveURL(/step=make/);
  await waitForCanvas(page);
  await expect(page.locator('button[data-piece-id]')).toHaveCount(2);
  await makePiece(page, '도움받았던 순간');
  await expect(page.locator('button[data-piece-id]')).toHaveCount(3);
  await page.waitForTimeout(2600);

  await page.goto('/my');
  await expect(page.getByTestId('my-mosaic')).toHaveCount(1);
});

test('새로 만들기는 이전 모자이크를 그대로 두고 빈 캔버스로 시작한다', async ({ page }) => {
  await startJourney(page);
  await skipToMake(page);
  await makePiece(page, '기쁨');
  await page.waitForTimeout(2600);
  await page.goto('/');
  await startJourney(page, { goto: false });
  await skipToMake(page);
  await expect(page.locator('button[data-piece-id]')).toHaveCount(0);
  await makePiece(page, '상처');
  await page.waitForTimeout(2600);
  await page.goto('/my');
  await expect(page.getByTestId('my-mosaic')).toHaveCount(2);
});

test('모자이크를 지우면 목록에서 사라진다', async ({ page }) => {
  await startJourney(page);
  await skipToMake(page);
  await makePiece(page, '기쁨');
  await page.waitForTimeout(2600);
  await page.goto('/my');
  page.once('dialog', (d) => d.accept());
  await page.getByTestId('my-mosaic').getByRole('button', { name: '지우기' }).click();
  await expect(page.getByText('아직 저장한 모자이크가 없어요.')).toBeVisible();
});
