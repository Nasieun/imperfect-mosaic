'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CRISIS_COPY } from '@/content/crisis';
import { SHELL_COPY, STEP_NAME } from '@/content/journey';
import { DOT_STEPS, dotIndex, type Step } from '@/domain/journey';
import { track } from '@/analytics/track';
import { useJourneyStore } from '@/store/journeyStore';
import SettingsSheet from '../SettingsSheet';
import CrisisSheet from './CrisisSheet';
import { useFocusTrap } from '../useFocusTrap';
import ui from '../ui.module.css';
import styles from './journey.module.css';

interface Props {
  step: Step;
  onExit: () => void;
  children: React.ReactNode;
}

/** 모든 단계 공통 틀: 진행 점, 잠시 쉬기, 나가기, 하단 도움 링크 */
export default function JourneyShell({ step, onExit, children }: Props) {
  const openCrisis = useJourneyStore((s) => s.openCrisis);
  const [paused, setPaused] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const current = dotIndex(step);
  const showDots = current >= 1 && current <= 4;

  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <div className={styles.dots} role="img" aria-label={showDots ? SHELL_COPY.progress(current) : STEP_NAME[step]}>
          {showDots &&
            DOT_STEPS.map((s, i) => (
              <span
                key={s}
                className={styles.dot}
                data-state={i + 1 < current ? 'past' : i + 1 === current ? 'current' : 'future'}
              />
            ))}
        </div>
        <div className={styles.topActions}>
          <button type="button" className={ui.ghost} onClick={() => setSettingsOpen(true)}>
            {SHELL_COPY.settings}
          </button>
          <button type="button" className={ui.ghost} onClick={() => setPaused(true)}>
            {SHELL_COPY.pause}
          </button>
          <button type="button" className={ui.ghost} onClick={() => setExiting(true)}>
            {SHELL_COPY.exit}
          </button>
        </div>
      </header>

      <div className={styles.stage}>{children}</div>

      <footer className={styles.bottom}>
        <button
          type="button"
          className={styles.helpLink}
          onClick={() => {
            track('help_link_opened', { source: 'footer' });
            openCrisis();
          }}
        >
          {CRISIS_COPY.link}
        </button>
      </footer>

      {paused && <PauseOverlay onBack={() => setPaused(false)} />}
      {exiting && <ExitDialog onCancel={() => setExiting(false)} onConfirm={onExit} />}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CrisisSheet />
    </div>
  );
}

function PauseOverlay({ onBack }: { onBack: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className={styles.pause} role="dialog" aria-modal="true" aria-label={SHELL_COPY.pause}>
      <div className={styles.breath} aria-hidden="true" />
      <p className={styles.pauseLine}>{SHELL_COPY.pauseLine}</p>
      <button ref={ref} type="button" className={ui.secondary} onClick={onBack}>
        {SHELL_COPY.pauseBack}
      </button>
    </div>
  );
}

function ExitDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  useFocusTrap(sheetRef, true, onCancel);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className={ui.scrim} onClick={onCancel}>
      <section
        ref={sheetRef}
        className={`${ui.sheet} ${styles.exit}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{SHELL_COPY.exitTitle}</h2>
        <p>{SHELL_COPY.exitBody}</p>
        <div className={styles.row}>
          <button ref={ref} type="button" className={ui.secondary} onClick={onCancel}>
            {SHELL_COPY.exitCancel}
          </button>
          <button type="button" className={ui.primary} onClick={onConfirm}>
            {SHELL_COPY.exitConfirm}
          </button>
        </div>
      </section>
    </div>
  );
}
