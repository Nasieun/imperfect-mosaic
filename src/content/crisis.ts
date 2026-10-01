/**
 * 위기 상담 자원.
 * TODO(출시 전): 번호 유효성을 공식 기관에서 다시 확인하고 확인일을 RELEASE_CHECKLIST.md에 기록한다.
 * 확인 기준일: 2026-10-01 (작성 시점, 재확인 필요)
 */
export interface CrisisLine {
  id: string;
  name: string;
  number: string;
  tel: string;
  note: string;
}

export const CRISIS_LINES: CrisisLine[] = [
  { id: 'suicide', name: '자살예방상담전화', number: '109', tel: '109', note: '24시간' },
  { id: 'mental', name: '정신건강위기상담전화', number: '1577-0199', tel: '15770199', note: '24시간' },
  { id: 'youth', name: '청소년상담전화', number: '1388', tel: '1388', note: '24시간' },
  { id: 'emergency', name: '긴급 신고', number: '112 · 119', tel: '119', note: '위급할 때' },
];

export const CRISIS_COPY = {
  link: '지금 도움이 필요해요',
  title: '혼자 버티지 않아도 괜찮아요.',
  body: '지금 바로 이야기할 수 있는 곳이에요.',
  continue: '이어서 하기',
  disclaimer: '이 체험은 상담이나 치료를 대신하지 않아요.',
};
