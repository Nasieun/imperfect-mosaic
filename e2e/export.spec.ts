import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { pngTextChunks } from '../src/export/exportImage';
import { skipToMake, startJourney, waitForCanvas } from './helpers';

test.skip(({ isMobile }) => isMobile, '휴대폰에서는 공유 시트로 저장하므로 다운로드는 데스크톱에서 확인한다');

test('PNG로 저장하면 메모·제목이 이미지와 메타데이터에 없다', async ({ page }) => {
  const NOTE = '비밀로 두고 싶은 메모';
  await startJourney(page);
  await skipToMake(page);

  await page.getByRole('button', { name: '조각 만들기', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('적지 않아도 괜찮아요').fill(NOTE);
  await dialog.getByRole('button', { name: '캔버스에 놓기' }).click();

  await page.getByRole('button', { name: '다 놓았어요' }).click();
  await waitForCanvas(page);
  await page.getByPlaceholder('붙이지 않아도 괜찮아요').fill('나만 아는 제목');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '이미지로 저장' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^mosaic-\d{4}-\d{2}-\d{2}\.png$/);
  const bytes = new Uint8Array(readFileSync((await download.path())!));
  expect(bytes.length).toBeGreaterThan(1000);
  expect(pngTextChunks(bytes)).toEqual([]);
  const asText = Buffer.from(bytes).toString('utf8');
  expect(asText).not.toContain(NOTE);
  expect(asText).not.toContain('나만 아는 제목');
});
