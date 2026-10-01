import { expect, test } from '@playwright/test';
import { latestMosaic, tabTo, waitForCanvas } from './helpers';

test.skip(({ isMobile }) => isMobile, '키보드 전용 시나리오는 데스크톱에서 확인한다');

test('마우스 없이 키보드만으로 여정 전체를 마친다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await tabTo(page, '시작하기');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '시작하기 전에' })).toBeVisible();

  await tabTo(page, '좋아요');
  await page.keyboard.press('Enter');
  await tabTo(page, /맑음/);
  await page.keyboard.press('Space');
  await tabTo(page, '다음으로');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/step=story/);
  await tabTo(page, '건너뛰기');
  await page.keyboard.press('Enter');

  // 2단계: 시트에서 조각 만들기 (포커스는 시트 안에 머문다)
  await expect(page).toHaveURL(/step=make/);
  await waitForCanvas(page);
  await tabTo(page, '조각 만들기');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await tabTo(page, /도움받았던 순간/);
  await page.keyboard.press('Enter');
  await tabTo(page, '캔버스에 놓기');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();

  // 캔버스에서 Tab으로 조각 선택 → 방향키 이동 → E 회전
  await page.waitForTimeout(2600);
  const before = (await latestMosaic(page))!.pieces as { x: number; rotation: number }[];
  await page.locator('[data-testid="mosaic-canvas"]').focus();
  // 방금 놓은 조각은 이미 선택돼 있다. Esc로 풀고 Tab으로 다시 고른다.
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await expect(page.locator('[aria-live="polite"]').last()).toContainText('선택됨');
  await page.keyboard.press('Shift+ArrowLeft');
  await page.keyboard.press('e');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2600);
  const after = (await latestMosaic(page))!.pieces as { x: number; rotation: number }[];
  expect(after[0].x).toBeCloseTo(Math.max(0, before[0].x - 0.1), 5);
  expect(after[0].rotation).toBe(before[0].rotation + 15);

  await tabTo(page, '다 놓았어요');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/step=view/);
  await tabTo(page, '다음');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/step=care/);
  await tabTo(page, /5분 눈 감기/);
  await page.keyboard.press('Enter');
  await tabTo(page, '마무리하기');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/step=close/);
  await expect(page.getByText('오늘의 당신을 만날 수 있어 고마웠어요.')).toBeVisible();
  await expect(page.getByText('5분 눈 감기')).toBeVisible();
});

test('대화상자 안에서 Tab이 맴돌고 Esc로 닫힌다', async ({ page }) => {
  await page.goto('/journey?step=care');
  await page.getByRole('button', { name: '지금 도움이 필요해요' }).click();
  const sheet = page.getByTestId('crisis-sheet');
  await expect(sheet).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[data-testid="crisis-sheet"]'));
    expect(inside).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
});
