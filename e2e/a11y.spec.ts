import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { makePiece, skipToMake, startJourney, waitForCanvas } from './helpers';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function audit(page: Page, label: string) {
  // 전환 연출이 끝난 상태에서 검사한다.
  await page.waitForTimeout(700);
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    serious.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`),
    label,
  ).toEqual([]);
}

test('모든 단계에서 접근성 심각·치명 위반이 없다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await audit(page, '랜딩');

  await startJourney(page, { goto: false });
  await audit(page, '시작 전 안내');
  await page.getByRole('button', { name: '좋아요' }).click();
  await audit(page, '마음 체크');
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await audit(page, '이야기');
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await waitForCanvas(page);
  await makePiece(page, '상처');
  await makePiece(page, '기쁨');
  await audit(page, '조각 만들기');

  await page.getByRole('button', { name: '조각 만들기', exact: true }).click();
  await audit(page, '조각 만들기 시트');
  await page.getByRole('dialog').getByRole('button', { name: '닫기' }).click();

  await page.getByRole('button', { name: '다 놓았어요' }).click();
  await waitForCanvas(page);
  await audit(page, '바라보기');
  await page.getByRole('button', { name: '다음', exact: true }).click();
  await audit(page, '돌봄');
  await page.getByRole('button', { name: /나만의 돌봄/ }).click();
  await audit(page, '직접 쓰기');
  await page.getByRole('button', { name: '마무리하기' }).click();
  await audit(page, '마무리');

  await page.getByRole('button', { name: '지금 도움이 필요해요' }).click();
  await audit(page, '위기 안내');
  await page.getByRole('button', { name: '이어서 하기' }).click();
  await page.getByRole('button', { name: '설정' }).click();
  await audit(page, '설정');
});

test('내 모자이크 화면도 접근성 위반이 없다', async ({ page }) => {
  await startJourney(page);
  await skipToMake(page);
  await makePiece(page, '실패');
  await page.waitForTimeout(2600);
  await page.goto('/my');
  await expect(page.getByTestId('my-mosaic')).toHaveCount(1);
  await audit(page, '내 모자이크');
});
