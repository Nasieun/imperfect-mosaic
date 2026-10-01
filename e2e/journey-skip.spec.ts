import { expect, test } from '@playwright/test';
import { makePiece, startJourney, waitForCanvas } from './helpers';

test('마음 체크·이야기·돌봄을 모두 건너뛰고 조각 하나로도 마무리에 닿는다', async ({ page }) => {
  await startJourney(page);
  await page.getByRole('button', { name: '좋아요' }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();

  await expect(page).toHaveURL(/step=story/);
  await page.getByRole('button', { name: '건너뛰기' }).click();

  await expect(page).toHaveURL(/step=make/);
  await waitForCanvas(page);
  // 조각이 없을 때는 버튼 대신 안내가 보인다.
  await expect(page.getByRole('button', { name: '다 놓았어요' })).toHaveCount(0);
  await expect(page.getByText('조각 하나만 있어도 괜찮아요.', { exact: true })).toBeVisible();
  await makePiece(page, '이름 없는 조각', '작게');
  await page.getByRole('button', { name: '다 놓았어요' }).click();

  await expect(page).toHaveURL(/step=view/);
  await page.getByRole('button', { name: '다음', exact: true }).click();

  await expect(page).toHaveURL(/step=care/);
  await page.getByRole('button', { name: '마무리하기' }).click();

  await expect(page).toHaveURL(/step=close/);
  await expect(page.getByText('오늘의 당신을 만날 수 있어 고마웠어요.')).toBeVisible();
  await expect(page.getByText('오늘 고른 돌봄')).toHaveCount(0);
});

test('브라우저 뒤로 가기는 이전 단계로 돌아간다', async ({ page }) => {
  await startJourney(page);
  await page.getByRole('button', { name: '좋아요' }).click();
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page).toHaveURL(/step=story/);
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page).toHaveURL(/step=make/);
  await page.goBack();
  await expect(page).toHaveURL(/step=story/);
  await expect(page.getByText('누구에게나 깨진 순간이 있어요.')).toBeVisible();
});

test('잠시 쉬기에는 타이머가 없고, 돌아가기로 이어진다', async ({ page }) => {
  await page.goto('/journey?step=story');
  await page.getByRole('button', { name: '잠시 쉬기' }).click();
  const pause = page.getByRole('dialog', { name: '잠시 쉬기' });
  await expect(pause.getByText('천천히 숨 쉬어도 괜찮아요.')).toBeVisible();
  await expect(pause).not.toContainText(/\d/);
  await pause.getByRole('button', { name: '돌아가기' }).click();
  await expect(pause).toBeHidden();
});

test('나가기는 확인 후 랜딩으로 돌아간다', async ({ page }) => {
  await page.goto('/journey?step=care');
  await page.getByRole('button', { name: '나가기' }).click();
  await expect(page.getByText('지금까지 놓은 조각은 이 기기에 남아 있어요.')).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: '나가기' }).click();
  await expect(page).toHaveURL(/\/$/);
});
