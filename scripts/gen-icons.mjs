// 앱 아이콘(PNG)을 SVG에서 만든다. 아이콘 디자인을 바꿀 때만 다시 실행한다.
//   node scripts/gen-icons.mjs
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const svg = (size, padding) => {
  const s = size;
  const k = (s - padding * 2) / 100;
  const t = (x, y) => `${padding + x * k},${padding + y * k}`;
  // 서로 어긋난 채 모인 네 조각과 작은 틈
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#efe6d6"/>
  <polygon points="${t(12, 18)} ${t(46, 10)} ${t(52, 44)} ${t(20, 52)}" fill="#D9A95A"/>
  <polygon points="${t(56, 14)} ${t(88, 22)} ${t(84, 50)} ${t(58, 46)}" fill="#7180AE" opacity="0.92"/>
  <polyline points="${t(70, 20)} ${t(66, 30)} ${t(72, 38)}" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="${1.2 * k}"/>
  <polygon points="${t(16, 58)} ${t(48, 54)} ${t(44, 88)} ${t(12, 84)}" fill="#94AE92"/>
  <polygon points="${t(56, 56)} ${t(86, 60)} ${t(80, 86)} ${t(54, 82)}" fill="#9A978F"/>
</svg>`;
};

mkdirSync('public/icons', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, padding] of [
  ['icon-192', 192, 14],
  ['icon-512', 512, 36],
  ['maskable-512', 512, 96],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${svg(size, padding)}</body></html>`);
  await page.screenshot({ path: `public/icons/${name}.png`, omitBackground: false });
  console.log('wrote', name);
}
await browser.close();
