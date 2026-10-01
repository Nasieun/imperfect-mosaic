import { expect, test } from '@playwright/test';
import { STEP_URL, startJourney } from './helpers';

const STEPS = ['intro', 'story', 'make', 'view', 'care', 'close'];

for (const step of STEPS) {
  test(`${step} 단계에서 하단 링크로 위기 안내가 열린다`, async ({ page }) => {
    await page.goto(STEP_URL(step));
    await page.getByRole('button', { name: '지금 도움이 필요해요' }).click();
    const sheet = page.getByTestId('crisis-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('a[href="tel:109"]')).toBeVisible();
    await expect(sheet.locator('a[href="tel:15770199"]')).toBeVisible();
    await sheet.getByRole('button', { name: '이어서 하기' }).click();
    await expect(sheet).toBeHidden();
  });
}

test('가장 무거운 마음(폭풍)을 고르면 안내가 먼저 뜨고, 이어서 진행할 수 있다', async ({ page }) => {
  await startJourney(page);
  await page.getByRole('button', { name: '좋아요' }).click();
  await page.getByRole('radio', { name: '폭풍' }).click();
  const sheet = page.getByTestId('crisis-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText('혼자 버티지 않아도 괜찮아요.')).toBeVisible();
  await sheet.getByRole('button', { name: '이어서 하기' }).click();
  await expect(sheet).toBeHidden();
  await page.getByRole('button', { name: '다음으로' }).click();
  await expect(page).toHaveURL(/step=story/);
});
