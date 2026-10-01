import { expect, test } from '@playwright/test';
import { latestMosaic, makePiece, startJourney, waitForCanvas } from './helpers';

test('한 번 방문한 뒤에는 오프라인에서도 여정 전체를 마친다', async ({ page, context }) => {
  await page.goto('/');
  // 서비스 워커가 페이지를 제어하고, 빌드 파일을 모두 담을 때까지 기다린다.
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          if (!navigator.serviceWorker.controller) return 0;
          const name = (await caches.keys()).find((k) => k.startsWith('mosaic-precache-'));
          return name ? (await (await caches.open(name)).keys()).length : 0;
        }),
      { timeout: 30_000, intervals: [500] },
    )
    .toBeGreaterThan(20);

  await context.setOffline(true);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '불완전한 모자이크' })).toBeVisible();

  await startJourney(page, { goto: false });
  await page.getByRole('button', { name: '좋아요' }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await waitForCanvas(page);
  await makePiece(page, '기쁨');
  await makePiece(page, '상처');
  await page.getByRole('button', { name: '다 놓았어요' }).click();
  await waitForCanvas(page);
  await page.getByRole('button', { name: '다음', exact: true }).click();
  await page.getByRole('button', { name: /물 한 잔/ }).click();
  await page.getByRole('button', { name: '마무리하기' }).click();
  await expect(page.getByText('오늘의 당신을 만날 수 있어 고마웠어요.')).toBeVisible();
  await page.getByRole('button', { name: '이 기기에 저장하기' }).click();
  await expect(page.getByText('이 기기에 저장했어요.')).toBeVisible();

  const saved = await latestMosaic(page);
  expect((saved?.pieces as unknown[]).length).toBe(2);
  await context.setOffline(false);
});
