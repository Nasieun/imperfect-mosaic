import { describe, expect, it } from 'vitest';
import { generatePieceShape, toPairs } from '@/domain/pieceShape';
import { SIZE_RADIUS } from '@/domain/palette';
import { PIECE_KINDS, PIECE_SIZES, type PresetIndex } from '@/domain/types';

type Pt = [number, number];

function segmentsIntersect(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const cross = (o: Pt, p: Pt, q: Pt) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function selfIntersects(pts: Pt[]): boolean {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // 이웃한 변
      if (segmentsIntersect(a, b, pts[j], pts[(j + 1) % n])) return true;
    }
  }
  return false;
}

const presets: PresetIndex[] = [0, 1, 2];
const seeds = [1, 12345, 987654321, 4294967295];

describe('generatePieceShape', () => {
  for (const kind of PIECE_KINDS) {
    for (const presetIndex of presets) {
      for (const size of PIECE_SIZES) {
        it(`${kind} / 모양 ${presetIndex} / ${size}: 결정적이고 단순 다각형이다`, () => {
          for (const seed of seeds) {
            const a = generatePieceShape(kind, seed, presetIndex, size);
            const b = generatePieceShape(kind, seed, presetIndex, size);
            expect(a).toEqual(b);

            const pts = toPairs(a.points);
            expect(pts.length).toBeGreaterThanOrEqual(3);
            expect(pts.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
            expect(selfIntersects(pts)).toBe(false);

            // 가장 먼 점은 크기 반지름과 같다
            const maxR = Math.max(...pts.map(([x, y]) => Math.hypot(x, y)));
            expect(maxR).toBeCloseTo(SIZE_RADIUS[size], 0);
          }
        });
      }
    }
  }

  it('시드가 다르면 모양이 달라진다', () => {
    const a = generatePieceShape('joy', 1, 0, 'M');
    const b = generatePieceShape('joy', 2, 0, 'M');
    expect(a.points).not.toEqual(b.points);
  });

  it('상처 조각에는 금이 1~3개 있고, 도움받은 순간에는 이음매가 있다', () => {
    for (const seed of seeds) {
      const w = generatePieceShape('wound', seed, 0, 'M');
      expect(w.cracks.length).toBeGreaterThanOrEqual(1);
      expect(w.cracks.length).toBeLessThanOrEqual(3);
      expect(generatePieceShape('helped', seed, 0, 'M').seams.length).toBe(1);
    }
  });
});
