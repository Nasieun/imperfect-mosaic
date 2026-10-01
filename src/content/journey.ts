import type { Step } from '@/domain/journey';

export const STEP_NAME: Record<Step, string> = {
  intro: '시작하기 전에',
  story: '나의 치유 이야기',
  make: '조각을 만드는 체험',
  view: '완성된 모습 바라보기',
  care: '지금 나에게 필요한 돌봄',
  close: '마무리',
};

export const SHELL_COPY = {
  settings: '설정',
  pause: '잠시 쉬기',
  exit: '나가기',
  pauseLine: '천천히 숨 쉬어도 괜찮아요.',
  pauseBack: '돌아가기',
  exitTitle: '지금 나가도 괜찮아요.',
  exitBody: '지금까지 놓은 조각은 이 기기에 남아 있어요.',
  exitConfirm: '나가기',
  exitCancel: '계속하기',
  progress: (n: number) => `4단계 중 ${n}단계`,
};

export const LANDING_COPY = {
  line: '완벽하지 않은 나도 하나의 모습이 됩니다.',
  sub: '경험을 조각으로 만들어, 나만의 모자이크를 놓아 보는 시간이에요.',
  start: '시작하기',
};

export const INTRO_COPY = {
  title: '시작하기 전에',
  points: [
    '약 10~15분 정도 걸려요.',
    '언제든 멈추거나 건너뛸 수 있어요.',
    '만든 조각은 기본적으로 이 기기에만 저장돼요.',
    '이 체험은 상담이나 치료를 대신하지 않아요.',
  ],
  next: '좋아요',
  moodTitle: '지금 마음은 어떤 날씨에 가까운가요',
  moodSub: '고르지 않아도 괜찮아요. 이 답은 어디에도 보내지 않아요.',
  moods: ['맑음', '구름 조금', '흐림', '비', '폭풍'],
  moodNext: '다음으로',
  skip: '건너뛰기',
};

export const MAKE_COPY = {
  hint: '원하는 곳에 놓아 보세요. 비워 둔 자리도 모자이크의 일부예요.',
  done: '다 놓았어요',
  emptyHint: '조각 하나만 있어도 괜찮아요.',
};

export const VIEW_COPY = {
  line1: '어느 한 조각도 당신의 전부는 아니에요.',
  line2: '빈 곳까지 포함해 지금의 당신입니다.',
  far: '멀리서 보기',
  near: '가까이 보기',
  oneOf: (n: number) => `이것은 조각 ${n}개 중 하나예요.`,
  tapHint: '조각을 눌러 보세요.',
  skipReveal: '화면을 누르면 바로 볼 수 있어요.',
  edit: '다시 편집하기',
  next: '다음',
  titleLabel: '제목 (선택)',
  titlePlaceholder: '붙이지 않아도 괜찮아요',
  export: '이미지로 저장',
  exported: '이미지를 저장했어요.',
};

export const CLOSE_COPY = {
  line: '오늘의 당신을 만날 수 있어 고마웠어요.',
  chosen: '오늘 고른 돌봄',
  save: '이 기기에 저장하기',
  saved: '이 기기에 저장했어요.',
  home: '처음으로',
  lightLabel: '고른 돌봄이 모자이크 곁에 작은 빛으로 놓였어요.',
  feedbackTitle: '괜찮다면 두 가지만 알려 주세요 (선택)',
  feedbackQ1: '조금 더 나를 있는 그대로 볼 수 있었다',
  feedbackQ2: '부담스럽거나 불편했다',
  feedbackScale: ['전혀 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
  feedbackSend: '보내기',
  feedbackSkip: '건너뛰기',
  feedbackThanks: '알려 주셔서 고마워요.',
};
