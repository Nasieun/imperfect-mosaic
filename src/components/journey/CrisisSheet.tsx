'use client';

import { useEffect, useId, useRef } from 'react';
import { CRISIS_COPY, CRISIS_LINES } from '@/content/crisis';
import { useJourneyStore } from '@/store/journeyStore';
import { useFocusTrap } from '../useFocusTrap';
import ui from '../ui.module.css';
import styles from './journey.module.css';

/** 위기 상담 안내. 체험을 막지 않고, [이어서 하기]로 닫힌다. */
export default function CrisisSheet() {
  const open = useJourneyStore((s) => s.crisisOpen);
  const close = useJourneyStore((s) => s.closeCrisis);
  const titleId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  useFocusTrap(sheetRef, open, close);

  useEffect(() => {
    if (open) btnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className={ui.scrim} onClick={close}>
      <section
        ref={sheetRef}
        className={ui.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        data-testid="crisis-sheet"
      >
        <h2 id={titleId} className={styles.crisisTitle}>
          {CRISIS_COPY.title}
        </h2>
        <p className={styles.crisisBody}>{CRISIS_COPY.body}</p>
        <ul className={styles.crisisList}>
          {CRISIS_LINES.map((line) => (
            <li key={line.id}>
              <a href={`tel:${line.tel}`} className={styles.crisisLink}>
                <span className={styles.crisisName}>{line.name}</span>
                <span className={styles.crisisNumber}>{line.number}</span>
                <span className={styles.crisisNote}>{line.note}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.crisisNoteText}>{CRISIS_COPY.disclaimer}</p>
        <button ref={btnRef} type="button" className={ui.primary} onClick={close}>
          {CRISIS_COPY.continue}
        </button>
      </section>
    </div>
  );
}
