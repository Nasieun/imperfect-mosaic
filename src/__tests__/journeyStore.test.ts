import { beforeEach, describe, expect, it } from 'vitest';
import { STEPS, dotIndex, isStep, nextStep, prevStep } from '@/domain/journey';
import { useJourneyStore } from '@/store/journeyStore';

const s = () => useJourneyStore.getState();

describe('journey 단계', () => {
  it('정해진 순서로 앞뒤로 이동하고, 끝에서 멈춘다', () => {
    expect(STEPS).toEqual(['intro', 'story', 'make', 'view', 'care', 'close']);
    expect(nextStep('intro')).toBe('story');
    expect(nextStep('care')).toBe('close');
    expect(nextStep('close')).toBe('close');
    expect(prevStep('story')).toBe('intro');
    expect(prevStep('intro')).toBe('intro');
  });

  it('진행 점은 이야기·조각·바라보기·돌봄 네 단계만 센다', () => {
    expect(dotIndex('intro')).toBe(0);
    expect(dotIndex('story')).toBe(1);
    expect(dotIndex('care')).toBe(4);
    expect(dotIndex('close')).toBe(5);
  });

  it('알 수 없는 단계 값은 걸러낸다', () => {
    expect(isStep('make')).toBe(true);
    expect(isStep('score')).toBe(false);
    expect(isStep(null)).toBe(false);
  });
});

describe('journeyStore', () => {
  beforeEach(() => s().reset());

  it('goNext / goPrev 로 단계를 바꾼다', () => {
    expect(s().goNext()).toBe('story');
    expect(s().goNext()).toBe('make');
    expect(s().goPrev()).toBe('story');
    expect(s().step).toBe('story');
  });

  it('가장 무거운 마음(폭풍)을 고르면 위기 안내가 열린다', () => {
    s().chooseMood(2);
    expect(s().crisisOpen).toBe(false);
    s().chooseMood(4);
    expect(s().crisisOpen).toBe(true);
    s().closeCrisis();
    expect(s().crisisOpen).toBe(false);
    // 닫은 뒤에도 마음 값은 그대로이고, 체험은 계속된다.
    expect(s().mood).toBe(4);
  });

  it('마음 체크는 고르지 않아도 된다', () => {
    s().chooseMood(1);
    s().chooseMood(null);
    expect(s().mood).toBeNull();
  });
});
