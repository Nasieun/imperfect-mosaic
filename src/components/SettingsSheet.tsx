'use client';

import Link from 'next/link';
import { useId, useRef } from 'react';
import { syncAmbient } from '@/audio/feedback';
import { COPY } from '@/content/copy';
import { isLowEndDevice, useSettings } from '@/store/settingsStore';
import { useFocusTrap } from './useFocusTrap';
import ui from './ui.module.css';
import styles from './SettingsSheet.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  /** 개발·관리용 추가 항목 */
  extra?: React.ReactNode;
}

export default function SettingsSheet({ open, onClose, extra }: Props) {
  const s = useSettings();
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  const simple = s.simpleTextures ?? isLowEndDevice();
  const set = (patch: Parameters<typeof s.update>[0]) => {
    s.update(patch);
    // 사용자의 조작 안에서 오디오를 시작·정지해야 브라우저가 허용한다.
    syncAmbient();
  };

  return (
    <div className={ui.scrim} onClick={onClose}>
      <section
        ref={ref}
        className={ui.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={ui.sheetHeader}>
          <h2 id={titleId}>{COPY.settingsTitle}</h2>
          <button type="button" className={ui.ghost} onClick={onClose}>
            {COPY.makerClose}
          </button>
        </header>

        <div className={styles.list}>
          <Toggle
            label={COPY.settingsSound}
            hint={COPY.settingsSoundHint}
            checked={s.sound}
            onChange={(v) => set({ sound: v })}
          />
          <label className={styles.item}>
            <span className={styles.text}>
              <span className={styles.label}>{COPY.settingsAmbient}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={s.ambientVolume}
              disabled={!s.sound}
              onChange={(e) => set({ ambientVolume: Number(e.target.value) })}
              className={styles.range}
            />
          </label>
          <Toggle
            label={COPY.settingsHaptic}
            hint={COPY.settingsHapticHint}
            checked={s.haptic}
            onChange={(v) => set({ haptic: v })}
          />
          <Toggle
            label={COPY.settingsSimple}
            hint={COPY.settingsSimpleHint}
            checked={simple}
            onChange={(v) => set({ simpleTextures: v })}
          />
        </div>

        <p className={styles.privacy}>{COPY.settingsPrivacy}</p>
        <div className={styles.links}>
          <Link href="/my" className={ui.secondary} onClick={onClose}>
            {COPY.myTitle}
          </Link>
          {extra}
        </div>
      </section>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.item}>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.hint}>{hint}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.switch}
      />
    </label>
  );
}
