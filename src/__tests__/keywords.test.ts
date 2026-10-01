import { describe, expect, it } from 'vitest';
import { hasRiskSignal } from '@/safety/keywords';

describe('위험 신호 감지 (기기 안에서만)', () => {
  it.each([
    '죽고 싶어',
    '죽고싶다',
    '그냥 죽 고 싶 다',
    '사라지고 싶어요',
    '없어지고 싶다',
    '자해를 했던 날',
    '삶을 끝내고 싶다',
    '인생을 끝내고 싶어',
    '모든 걸 끝내고 싶어',
    '더는 살고 싶지 않아',
    '살기 싫다',
  ])('감지: %s', (text) => {
    expect(hasRiskSignal(text)).toBe(true);
  });

  it.each([
    '',
    '숙제를 다 끝내고 싶다',
    '이번 프로젝트를 빨리 끝내고 싶어',
    '죽을 만큼 웃겼던 날',
    '사라진 줄 알았던 친구를 다시 만났다',
    '배고파 죽겠다',
    '오늘은 쉬고 싶어',
  ])('감지하지 않음: %s', (text) => {
    expect(hasRiskSignal(text)).toBe(false);
  });
});
