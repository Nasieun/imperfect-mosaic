export type CareCategory = 'body' | 'rest' | 'connect' | 'express' | 'environment' | 'professional' | 'nothing';

export interface CareCard {
  id: string;
  category: CareCategory;
  categoryLabel: string;
  title: string;
  detail: string;
}

/**
 * 4단계 돌봄 카드. 모두 5분 이내, 비용 없음.
 * '아무것도 안 해도 괜찮아요'는 다른 카드와 같은 타입·같은 크기로 제공한다.
 */
export const CARE_CARDS: CareCard[] = [
  { id: 'water', category: 'body', categoryLabel: '몸', title: '물 한 잔 마시기', detail: '천천히, 한 모금씩' },
  { id: 'eyes', category: 'rest', categoryLabel: '쉬기', title: '5분 눈 감기', detail: '아무 생각을 하지 않아도 돼요' },
  { id: 'hello', category: 'connect', categoryLabel: '연결', title: '한 사람에게 안부 보내기', detail: '짧은 한 줄이면 충분해요' },
  { id: 'line', category: 'express', categoryLabel: '표현', title: '오늘 마음 한 줄 적기', detail: '어디에 적어도 괜찮아요' },
  { id: 'air', category: 'environment', categoryLabel: '환경', title: '창문 열고 바깥 공기 쐬기', detail: '숨을 한 번 길게' },
  {
    id: 'pro',
    category: 'professional',
    categoryLabel: '전문 도움',
    title: '상담 자원 알아보기',
    detail: '도움을 구하는 것도 돌봄이에요',
  },
  {
    id: 'nothing',
    category: 'nothing',
    categoryLabel: '그대로',
    title: '오늘은 아무것도 안 해도 괜찮아요',
    detail: '여기까지 온 것으로 충분해요',
  },
];

export const PRO_RESOURCES = [
  { name: '보건복지상담센터', number: '129', tel: '129' },
  { name: '정신건강복지센터 (지역별)', number: '1577-0199', tel: '15770199' },
];

export const CARE_COPY = {
  question: '지금 필요한 돌봄을 하나 골라볼까요?',
  sub: '고르지 않아도 괜찮아요.',
  proNote: '가까운 정신건강복지센터나 상담 기관에서 이야기를 들어줄 수 있어요.',
  finish: '마무리하기',
  customCat: '직접',
  customTitle: '나만의 돌봄 쓰기',
  customDetail: '지금 떠오르는 것을 한 줄로',
  customLabel: '나만의 돌봄 한 줄',
  customPlaceholder: '예: 좋아하는 노래 한 곡 듣기',
};
