import { expect, test } from '@playwright/test';
import { latestMosaic, makePiece, startJourney, waitForCanvas } from './helpers';

test('랜딩부터 마무리까지 네 단계를 끝까지 걷는다', async ({ page }) => {
  await startJourney(page);

  // 진입: 안내 → 마음 체크
  await page.getByRole('button', { name: '좋아요' }).click();
  await page.getByRole('radio', { name: '흐림' }).click();
  await expect(page.getByRole('radio', { name: '흐림' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: '다음으로' }).click();

  // 1단계: 이야기 (끝까지 읽기)
  await expect(page).toHaveURL(/step=story/);
  await expect(page.getByText('누구에게나 깨진 순간이 있어요.')).toBeVisible();
  await expect(page.getByRole('img', { name: '4단계 중 1단계' })).toBeVisible();
  const lastScene = page.getByTestId('scene-5');
  await lastScene.scrollIntoViewIfNeeded();
  await expect(lastScene.getByText('어떤 조각도 당신의 전부는 아니에요.')).toBeVisible();
  await lastScene.getByRole('button', { name: '조각 만들러 가기' }).click();

  // 2단계: 조각 만들기
  await expect(page).toHaveURL(/step=make/);
  await waitForCanvas(page);
  await expect(page.getByText('비워 둔 자리도 모자이크의 일부예요.')).toBeVisible();
  await makePiece(page, '기쁨', '크게');
  await makePiece(page, '상처');
  await page.getByRole('button', { name: '다 놓았어요' }).click();

  // 3단계: 바라보기
  await expect(page).toHaveURL(/step=view/);
  await waitForCanvas(page);
  await page.locator('[data-testid="mosaic-canvas"]').click({ position: { x: 5, y: 5 } }); // 연출 건너뛰기
  await expect(page.getByText('어느 한 조각도 당신의 전부는 아니에요.')).toBeVisible();
  await page.locator('button[data-piece-id]').first().dispatchEvent('click');
  await expect(page.getByRole('status').filter({ hasText: '이것은 조각 2개 중 하나예요.' })).toBeVisible();
  await page.getByRole('button', { name: '다음', exact: true }).click();

  // 4단계: 돌봄
  await expect(page).toHaveURL(/step=care/);
  const water = page.getByRole('button', { name: /물 한 잔 마시기/ });
  await water.click();
  await expect(water).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '마무리하기' }).click();

  // 마무리
  await expect(page).toHaveURL(/step=close/);
  await expect(page.getByText('오늘의 당신을 만날 수 있어 고마웠어요.')).toBeVisible();
  await expect(page.getByText('물 한 잔 마시기')).toBeVisible();
  await page.getByRole('button', { name: '이 기기에 저장하기' }).click();
  await expect(page.getByText('이 기기에 저장했어요.')).toBeVisible();

  const saved = await latestMosaic(page);
  expect((saved?.pieces as unknown[]).length).toBe(2);
  expect(saved?.careChoice).toEqual({ cardId: 'water' });
});

test('바라보기에서 다시 편집으로 돌아가 조각을 더하면 반영된다', async ({ page }) => {
  await page.goto('/journey?step=make');
  await waitForCanvas(page);
  await makePiece(page, '실패');
  await page.getByRole('button', { name: '다 놓았어요' }).click();
  await expect(page).toHaveURL(/step=view/);
  await page.getByRole('button', { name: '다시 편집하기' }).click();
  await expect(page).toHaveURL(/step=make/);
  await waitForCanvas(page);
  await makePiece(page, '도움받았던 순간');
  await page.getByRole('button', { name: '다 놓았어요' }).click();
  await page.locator('[data-testid="mosaic-canvas"]').click({ position: { x: 5, y: 5 } });
  await page.locator('button[data-piece-id]').first().dispatchEvent('click');
  await expect(page.getByRole('status').filter({ hasText: '이것은 조각 2개 중 하나예요.' })).toBeVisible();
});
