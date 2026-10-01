import { beforeEach, describe, expect, it } from 'vitest';
import { CARE_CARDS } from '@/content/care';
import { useJourneyStore } from '@/store/journeyStore';

const s = () => useJourneyStore.getState();

describe('돌봄 카드', () => {
  beforeEach(() => s().reset());

  it('한 장만 고를 수 있고, 다시 누르면 해제된다', () => {
    s().toggleCare('water');
    expect(s().careId).toBe('water');
    s().toggleCare('air');
    expect(s().careId).toBe('air');
    s().toggleCare('air');
    expect(s().careId).toBeNull();
  });

  it("'아무것도 안 해도 괜찮아요'는 다른 카드와 같은 형태의 카드다", () => {
    const nothing = CARE_CARDS.find((c) => c.id === 'nothing')!;
    const water = CARE_CARDS.find((c) => c.id === 'water')!;
    expect(Object.keys(nothing).sort()).toEqual(Object.keys(water).sort());
    s().toggleCare('nothing');
    expect(s().careId).toBe('nothing');
  });

  it('여섯 가지 돌봄 범주와 쉬어도 된다는 선택지가 있다', () => {
    const categories = new Set(CARE_CARDS.map((c) => c.category));
    for (const c of ['body', 'rest', 'connect', 'express', 'environment', 'professional', 'nothing']) {
      expect(categories.has(c as never)).toBe(true);
    }
    expect(new Set(CARE_CARDS.map((c) => c.id)).size).toBe(CARE_CARDS.length);
  });
});
