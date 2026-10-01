/**
 * 메모·직접 쓴 돌봄 문장에서 위험 신호를 기기 안에서만 확인한다.
 * 텍스트는 어디에도 보내지 않고, 체험을 막지 않는다. 부드러운 안내 한 줄만 띄운다.
 *
 * TODO(출시 전): 정신건강 전문가 검수 필요. 사전과 안내 문구 모두 검토받는다.
 */

// 띄어쓰기를 없앤 뒤 비교한다. ("죽고 싶어" = "죽고싶어")
const PATTERNS: RegExp[] = [
  /죽고싶/,
  /죽어버리고싶/,
  /죽었으면좋겠/,
  /살고싶지않/,
  /사라지고싶/,
  /없어지고싶/,
  /자해/,
  /자살/,
  /목숨을끊/,
  // "숙제를 다 끝내고 싶다" 같은 일상 표현은 걸리지 않도록 대상을 좁힌다.
  /(삶|인생|모든걸|모든것을|모든게)끝내고싶/,
  /(삶|인생)을?끝내/,
  /그만살고싶/,
  /살기싫/,
];

export function normalize(text: string): string {
  return text.replace(/[\s.,!?~·…'"“”‘’()-]/g, '').toLowerCase();
}

export function hasRiskSignal(text: string): boolean {
  if (!text) return false;
  const t = normalize(text);
  return PATTERNS.some((p) => p.test(t));
}

export const RISK_COPY = {
  line: '마음이 많이 무거운 순간인 것 같아요. 원하면 이야기할 수 있는 곳이 있어요.',
  link: '도움받을 수 있는 곳',
};
