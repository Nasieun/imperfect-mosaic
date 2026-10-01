/**
 * 익명 분석.
 * - 쿠키·기기 식별자 없음. 탭이 열려 있는 동안만 쓰는 무작위 세션 ID를 메모리에 둔다.
 * - 이벤트마다 허용된 속성만 보낸다. 메모·제목·직접 쓴 돌봄·마음 체크 값은 어떤 경우에도 보내지 않는다.
 * - NEXT_PUBLIC_ANALYTICS_URL이 없으면 아무 데도 보내지 않고 개발 콘솔에만 남긴다.
 */
type Primitive = string | number | boolean;

export const EVENT_SCHEMA = {
  journey_started: ['entry'],
  story_completed: ['scene_index'],
  story_skipped: ['scene_index'],
  piece_created: ['kind', 'size', 'has_note'],
  piece_action: ['action'],
  canvas_done: ['piece_count', 'empty_ratio_bucket'],
  view_entered: [],
  view_exported: [],
  care_selected: ['card_category'],
  help_link_opened: ['source'],
  exit_feedback: ['q1', 'q2'],
} as const satisfies Record<string, readonly string[]>;

export type EventName = keyof typeof EVENT_SCHEMA;

export interface AnalyticsPayload {
  event: EventName;
  session: string;
  props: Record<string, Primitive>;
  ts: number;
}

const MAX_STRING = 24;

let session: string | null = null;
const sessionId = () =>
  (session ??= Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6));

type Sink = (payload: AnalyticsPayload) => void;
let sink: Sink | null = null;

/** 테스트용: 전송 대상을 바꾼다 */
export function setSink(next: Sink | null) {
  sink = next;
}

/** 허용된 키만, 짧은 원시값만 남긴다. */
export function sanitize(event: EventName, props: Record<string, unknown> = {}): Record<string, Primitive> {
  const allowed = EVENT_SCHEMA[event] as readonly string[];
  const out: Record<string, Primitive> = {};
  for (const key of allowed) {
    const v = props[key];
    if (typeof v === 'number' && Number.isFinite(v)) out[key] = v;
    else if (typeof v === 'boolean') out[key] = v;
    else if (typeof v === 'string' && v.length <= MAX_STRING && /^[A-Za-z0-9_]+$/.test(v)) out[key] = v;
  }
  return out;
}

export function buildPayload(event: EventName, props?: Record<string, unknown>): AnalyticsPayload {
  return { event, session: sessionId(), props: sanitize(event, props), ts: Date.now() };
}

export function track(event: EventName, props?: Record<string, unknown>) {
  const payload = buildPayload(event, props);
  if (sink) return sink(payload);
  const url = process.env.NEXT_PUBLIC_ANALYTICS_URL;
  if (!url || typeof navigator === 'undefined') {
    if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', payload.event, payload.props);
    return;
  }
  try {
    const body = JSON.stringify(payload);
    if (!navigator.sendBeacon?.(url, body)) {
      fetch(url, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {});
    }
  } catch {
    // 분석 실패는 체험에 영향을 주지 않는다.
  }
}

/**
 * 빈 공간 비율을 세 구간으로만 나눈다. 화면에는 절대 표시하지 않는다.
 * coverage = 조각 면적 합 / 캔버스 면적 (겹침은 무시한 근사치)
 */
export function emptyRatioBucket(pieceAreaPx: number[], canvasAreaPx: number): 'low' | 'mid' | 'high' {
  if (canvasAreaPx <= 0) return 'high';
  const coverage = pieceAreaPx.reduce((a, b) => a + b, 0) / canvasAreaPx;
  const empty = 1 - Math.min(1, coverage);
  if (empty > 0.85) return 'high';
  if (empty > 0.6) return 'mid';
  return 'low';
}
