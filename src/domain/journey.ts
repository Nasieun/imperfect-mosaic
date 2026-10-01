/** 여정 단계. intro와 close는 진행 점에 나타나지 않는다. */
export const STEPS = ['intro', 'story', 'make', 'view', 'care', 'close'] as const;
export type Step = (typeof STEPS)[number];

/** 진행 점 4개에 해당하는 단계 */
export const DOT_STEPS: Step[] = ['story', 'make', 'view', 'care'];

export function isStep(v: unknown): v is Step {
  return typeof v === 'string' && (STEPS as readonly string[]).includes(v);
}

export function nextStep(step: Step): Step {
  const i = STEPS.indexOf(step);
  return STEPS[Math.min(STEPS.length - 1, i + 1)];
}

export function prevStep(step: Step): Step {
  const i = STEPS.indexOf(step);
  return STEPS[Math.max(0, i - 1)];
}

/** 진행 점 기준 번호(1~4). intro는 0, close는 5. */
export function dotIndex(step: Step): number {
  if (step === 'intro') return 0;
  if (step === 'close') return 5;
  return DOT_STEPS.indexOf(step) + 1;
}

/** 지금 마음 체크: 0 맑음 … 4 폭풍. 기기 밖으로 보내지 않는다. */
export type Mood = 0 | 1 | 2 | 3 | 4;
export const HEAVIEST_MOOD: Mood = 4;
