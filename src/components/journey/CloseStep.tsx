'use client';

import { useState } from 'react';
import { track } from '@/analytics/track';
import { CARE_CARDS } from '@/content/care';
import { CLOSE_COPY } from '@/content/journey';
import { saveMosaic } from '@/db/db';
import { useJourneyStore } from '@/store/journeyStore';
import { useMosaicStore } from '@/store/mosaicStore';
import { Whole } from './illustrations';
import ui from '../ui.module.css';
import styles from './journey.module.css';

/** 마무리. 고른 돌봄을 한 줄로 다시 보여줄 뿐, 완료 여부는 묻지 않는다. */
export default function CloseStep({ onHome }: { onHome: () => void }) {
  const careChoice = useMosaicStore((s) => s.mosaic.careChoice);
  const snapshot = useJourneyStore((s) => s.snapshot);
  const [saved, setSaved] = useState(false);
  const card = CARE_CARDS.find((c) => c.id === careChoice?.cardId);
  const careText = careChoice?.cardId === 'custom' ? careChoice.customText : card?.title;

  const save = async () => {
    const { mosaic } = useMosaicStore.getState();
    const next = { ...mosaic, updatedAt: new Date().toISOString() };
    useMosaicStore.setState({ mosaic: next });
    await saveMosaic(next).catch(() => {});
    setSaved(true);
  };

  return (
    <section className={styles.panel} aria-labelledby="close-title">
      <div className={styles.closeArt}>
        {snapshot ? (
          <div className={styles.snapWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 기기 안에서 만든 data URL 이미지 */}
            <img src={snapshot} alt="오늘 놓은 모자이크" className={styles.snap} />
            {/* 돌봄은 모자이크를 고치거나 가리지 않고, 테두리 바깥에 작은 빛으로 곁에 놓인다 */}
            {careText && <span className={styles.careLight} aria-hidden="true" data-testid="care-light" />}
          </div>
        ) : (
          <Whole />
        )}
      </div>
      <h1 id="close-title" className={styles.h1}>
        {CLOSE_COPY.line}
      </h1>
      {careText && (
        <p className={styles.chosen}>
          <span className={styles.cardCat}>{CLOSE_COPY.chosen}</span>
          {careText}
          {snapshot && <span className={ui.srOnly}>{CLOSE_COPY.lightLabel}</span>}
        </p>
      )}
      <div className={styles.actions}>
        <button type="button" className={ui.secondary} onClick={onHome}>
          {CLOSE_COPY.home}
        </button>
        <button type="button" className={ui.primary} onClick={save} disabled={saved}>
          {CLOSE_COPY.save}
        </button>
      </div>
      <p className={styles.sub} role="status">
        {saved ? CLOSE_COPY.saved : ''}
      </p>
      <ExitFeedback />
    </section>
  );
}

/** 선택형 피드백 2문항(5점). 답은 숫자만 익명으로 보낸다. */
function ExitFeedback() {
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | null>(null);
  const [state, setState] = useState<'open' | 'sent' | 'skipped'>('open');

  if (state === 'skipped') return null;
  if (state === 'sent') return <p className={styles.sub}>{CLOSE_COPY.feedbackThanks}</p>;

  const scale = (name: string, value: number | null, onChange: (v: number) => void, label: string) => (
    <fieldset className={styles.scale}>
      <legend>{label}</legend>
      <div className={styles.scaleRow}>
        {CLOSE_COPY.feedbackScale.map((text, i) => (
          <label key={text} className={styles.scaleItem}>
            <input type="radio" name={name} checked={value === i + 1} onChange={() => onChange(i + 1)} />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <details className={styles.feedback}>
      <summary>{CLOSE_COPY.feedbackTitle}</summary>
      {scale('q1', q1, setQ1, CLOSE_COPY.feedbackQ1)}
      {scale('q2', q2, setQ2, CLOSE_COPY.feedbackQ2)}
      <div className={styles.actions}>
        <button type="button" className={ui.ghost} onClick={() => setState('skipped')}>
          {CLOSE_COPY.feedbackSkip}
        </button>
        <button
          type="button"
          className={ui.secondary}
          disabled={q1 === null && q2 === null}
          onClick={() => {
            track('exit_feedback', { q1: q1 ?? 0, q2: q2 ?? 0 });
            setState('sent');
          }}
        >
          {CLOSE_COPY.feedbackSend}
        </button>
      </div>
    </details>
  );
}
