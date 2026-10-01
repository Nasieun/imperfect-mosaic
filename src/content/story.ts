export interface StoryScene {
  id: string;
  lines: string[];
  illustration: 'bowl' | 'scatter' | 'kinds' | 'gathered' | 'whole';
}

/** 1단계: 나의 치유 이야기. 자동 재생 없이 스크롤로 읽는다. */
export const STORY_SCENES: StoryScene[] = [
  { id: 'broken', lines: ['누구에게나 깨진 순간이 있어요.'], illustration: 'bowl' },
  { id: 'shapes', lines: ['그 조각들은 저마다 모양이 달라요.', '어떤 것은 둥글고, 어떤 것은 날카로워요.'], illustration: 'scatter' },
  {
    id: 'kinds',
    lines: ['오늘은 네 가지 조각을 만나 볼 거예요.', '기쁨, 실패, 상처, 그리고 도움받았던 순간.'],
    illustration: 'kinds',
  },
  {
    id: 'gaps',
    lines: ['반듯하게 맞지 않아도, 틈이 남아 있어도 괜찮아요.'],
    illustration: 'gathered',
  },
  { id: 'whole', lines: ['어떤 조각도 당신의 전부는 아니에요.'], illustration: 'whole' },
];

export const STORY_COPY = {
  skip: '건너뛰기',
  cta: '조각 만들러 가기',
  scrollHint: '천천히 내려 보세요',
};
