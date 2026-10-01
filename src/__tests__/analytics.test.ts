import { afterEach, describe, expect, it } from 'vitest';
import { EVENT_SCHEMA, buildPayload, emptyRatioBucket, sanitize, setSink, track, type AnalyticsPayload } from '@/analytics/track';

const SECRET_NOTE = '아무에게도 말하지 않은 이야기';

describe('익명 분석', () => {
  afterEach(() => setSink(null));

  it('허용되지 않은 필드(메모·제목·직접 쓴 돌봄·마음 체크)는 절대 실리지 않는다', () => {
    const sent: AnalyticsPayload[] = [];
    setSink((p) => sent.push(p));

    track('piece_created', { kind: 'wound', size: 'L', has_note: true, note: SECRET_NOTE, title: '제목' });
    track('care_selected', { card_category: 'body', customText: SECRET_NOTE });
    track('journey_started', { entry: 'landing', mood: 4 });
    track('canvas_done', { piece_count: 3, empty_ratio_bucket: 'mid', pieces: [{ note: SECRET_NOTE }] });

    const json = JSON.stringify(sent);
    expect(json).not.toContain(SECRET_NOTE);
    expect(json).not.toContain('제목');
    expect(json).not.toContain('mood');
    expect(sent[0].props).toEqual({ kind: 'wound', size: 'L', has_note: true });
    expect(sent[2].props).toEqual({ entry: 'landing' });
  });

  it('문자열 값은 짧은 영문 식별자만 허용한다(자유 텍스트 차단)', () => {
    expect(sanitize('piece_action', { action: 'delete' })).toEqual({ action: 'delete' });
    expect(sanitize('piece_action', { action: '내가 쓴 문장' })).toEqual({});
    expect(sanitize('piece_action', { action: 'a'.repeat(40) })).toEqual({});
  });

  it('모든 이벤트의 페이로드에는 이벤트 이름·세션·속성·시각만 있다', () => {
    for (const event of Object.keys(EVENT_SCHEMA) as (keyof typeof EVENT_SCHEMA)[]) {
      const p = buildPayload(event, { note: SECRET_NOTE });
      expect(Object.keys(p).sort()).toEqual(['event', 'props', 'session', 'ts']);
      expect(JSON.stringify(p)).not.toContain(SECRET_NOTE);
    }
  });

  it('세션 ID는 탭 안에서 같고, 쿠키를 쓰지 않는다', () => {
    expect(buildPayload('view_entered').session).toBe(buildPayload('view_entered').session);
  });

  it('빈 공간 비율은 세 구간으로만 나뉜다', () => {
    expect(emptyRatioBucket([], 1000)).toBe('high');
    expect(emptyRatioBucket([100], 1000)).toBe('high'); // 빈 곳 90%
    expect(emptyRatioBucket([300], 1000)).toBe('mid'); // 70%
    expect(emptyRatioBucket([700], 1000)).toBe('low'); // 30%
    expect(emptyRatioBucket([5000], 1000)).toBe('low');
  });
});
