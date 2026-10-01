import { mulberry32 } from '@/domain/rng';
import type { TextureKey } from '@/domain/types';

const SIZE = 96;
const cache = new Map<TextureKey, HTMLCanvasElement>();

let grout: HTMLCanvasElement | null = null;

/**
 * 캔버스 바탕의 줄눈 질감. 투명 바탕 위 옅은 얼룩과 모래알이라 라이트·다크 모두에 쓴다.
 * 네트워크 요청 없이 기기에서 한 번 만들어 둔다.
 */
export function getGroutTexture(): HTMLCanvasElement | undefined {
  if (typeof document === 'undefined') return undefined;
  if (grout) return grout;
  const S = 128;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  const rand = mulberry32(20261001);
  for (let i = 0; i < 10; i++) {
    const x = rand() * S;
    const y = rand() * S;
    const r = 20 + rand() * 50;
    const dark = rand() > 0.5;
    // 이음매 없이 반복되도록 가장자리 너머에도 같은 얼룩을 그린다.
    for (const dx of [-S, 0, S]) {
      for (const dy of [-S, 0, S]) {
        const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
        g.addColorStop(0, dark ? 'rgba(90,70,50,0.05)' : 'rgba(255,255,255,0.06)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
      }
    }
  }
  for (let i = 0; i < 1000; i++) {
    const dark = rand() > 0.45;
    ctx.fillStyle = dark ? `rgba(80,62,44,${0.05 + rand() * 0.08})` : `rgba(255,255,255,${0.05 + rand() * 0.08})`;
    ctx.fillRect(Math.floor(rand() * S), Math.floor(rand() * S), 1, 1);
  }
  grout = canvas;
  return canvas;
}

/**
 * 조각 위에 겹쳐 그리는 질감 패턴(투명 배경 위 은은한 무늬).
 * 색은 바닥 다각형이 맡고, 이 패턴은 결만 더한다.
 */
export function getTexture(key: TextureKey): HTMLCanvasElement | undefined {
  if (typeof document === 'undefined') return undefined;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  const rand = mulberry32(key.length * 7919 + key.charCodeAt(0));

  switch (key) {
    case 'ceramic': {
      // 유약의 은은한 얼룩과 작은 반점
      for (let i = 0; i < 14; i++) {
        const x = rand() * SIZE;
        const y = rand() * SIZE;
        const r = 6 + rand() * 14;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(255,255,255,0.10)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(90,60,30,${0.05 + rand() * 0.06})`;
        ctx.fillRect(rand() * SIZE, rand() * SIZE, 1, 1);
      }
      break;
    }
    case 'stone': {
      // 거친 석재의 촘촘한 입자
      for (let i = 0; i < 1100; i++) {
        const dark = rand() > 0.5;
        ctx.fillStyle = dark ? `rgba(30,25,20,${0.06 + rand() * 0.1})` : `rgba(255,255,255,${0.05 + rand() * 0.08})`;
        const s = rand() > 0.85 ? 2 : 1;
        ctx.fillRect(rand() * SIZE, rand() * SIZE, s, s);
      }
      break;
    }
    case 'glass': {
      // 빛이 통과하는 사선 결
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      for (let i = -SIZE; i < SIZE * 2; i += 18 + rand() * 10) {
        ctx.lineWidth = 3 + rand() * 6;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + SIZE, SIZE);
        ctx.stroke();
      }
      break;
    }
    case 'fabric': {
      // 천의 씨실·날실
      for (let i = 0; i < SIZE; i += 3) {
        ctx.fillStyle = `rgba(255,255,255,${i % 6 === 0 ? 0.1 : 0.04})`;
        ctx.fillRect(0, i, SIZE, 1);
        ctx.fillStyle = `rgba(40,40,40,${i % 6 === 0 ? 0.07 : 0.03})`;
        ctx.fillRect(i, 0, 1, SIZE);
      }
      break;
    }
    case 'paper':
    default: {
      // 무광 종이의 짧은 섬유
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 90; i++) {
        const x = rand() * SIZE;
        const y = rand() * SIZE;
        const a = rand() * Math.PI;
        const l = 3 + rand() * 7;
        ctx.strokeStyle = rand() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(60,50,40,0.07)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
      break;
    }
  }

  cache.set(key, canvas);
  return canvas;
}
