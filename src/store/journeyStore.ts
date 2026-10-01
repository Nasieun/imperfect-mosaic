import { create } from 'zustand';
import { HEAVIEST_MOOD, nextStep, prevStep, type Mood, type Step } from '@/domain/journey';

export interface JourneyState {
  step: Step;
  /** 마음 체크 값. 이 기기 메모리에만 있고 저장·전송하지 않는다. */
  mood: Mood | null;
  /** 위기 안내 카드를 열어야 하는가 */
  crisisOpen: boolean;
  /** 고른 돌봄 카드 하나 (없어도 된다) */
  careId: string | null;
  /** 2단계 첫 안내를 이미 보여주었는가 */
  makeHintShown: boolean;
  /** 직접 쓴 돌봄 한 줄 (careId === 'custom' 일 때) */
  customCare: string;
  /** 바라보기에서 찍어 둔 모자이크 이미지(마무리 화면용, 메모리에만) */
  snapshot: string | null;

  setStep: (step: Step) => void;
  goNext: () => Step;
  goPrev: () => Step;
  chooseMood: (mood: Mood | null) => void;
  openCrisis: () => void;
  closeCrisis: () => void;
  toggleCare: (id: string) => void;
  markMakeHintShown: () => void;
  setCustomCare: (text: string) => void;
  setSnapshot: (dataUrl: string | null) => void;
  reset: () => void;
}

const initial = {
  step: 'intro' as Step,
  mood: null,
  crisisOpen: false,
  careId: null,
  makeHintShown: false,
  customCare: '',
  snapshot: null as string | null,
};

export const useJourneyStore = create<JourneyState>((set, get) => ({
  ...initial,

  setStep: (step) => set({ step }),
  goNext: () => {
    const step = nextStep(get().step);
    set({ step });
    return step;
  },
  goPrev: () => {
    const step = prevStep(get().step);
    set({ step });
    return step;
  },

  // 가장 무거운 마음을 고르면 안내 카드를 먼저 보여준다. 체험을 막지는 않는다.
  chooseMood: (mood) => set({ mood, crisisOpen: mood === HEAVIEST_MOOD ? true : get().crisisOpen }),
  openCrisis: () => set({ crisisOpen: true }),
  closeCrisis: () => set({ crisisOpen: false }),

  // 한 장만 고를 수 있고, 다시 누르면 해제된다.
  toggleCare: (id) => set({ careId: get().careId === id ? null : id }),
  markMakeHintShown: () => set({ makeHintShown: true }),
  setCustomCare: (customCare) => set({ customCare }),
  setSnapshot: (snapshot) => set({ snapshot }),
  reset: () => set({ ...initial }),
}));
