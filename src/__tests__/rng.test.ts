import { describe, expect, it } from 'vitest';
import { hashSeed, mulberry32 } from '@/domain/rng';

describe('mulberry32', () => {
  it('같은 시드는 같은 수열을 만든다', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it('다른 시드는 다른 수열을 만든다', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const sa = Array.from({ length: 5 }, a);
    const sb = Array.from({ length: 5 }, b);
    expect(sa).not.toEqual(sb);
  });

  it('값은 [0, 1) 범위에 있다', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('hashSeed는 결정적이다', () => {
    expect(hashSeed('joy', 3, 1)).toBe(hashSeed('joy', 3, 1));
    expect(hashSeed('joy', 3, 1)).not.toBe(hashSeed('joy', 3, 2));
  });
});
