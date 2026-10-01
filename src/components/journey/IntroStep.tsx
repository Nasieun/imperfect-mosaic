'use client';

import { useState } from 'react';
import { INTRO_COPY } from '@/content/journey';
import type { Mood } from '@/domain/journey';
import { useJourneyStore } from '@/store/journeyStore';
import { WeatherIcon } from './illustrations';
import ui from '../ui.module.css';
import styles from './journey.module.css';

const MOODS: Mood[] = [0, 1, 2, 3, 4];

/** 진입: 시작 전 안내 1화면 → 지금 마음 체크(선택) */
export default function IntroStep({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<'preface' | 'mood'>('preface');
  const mood = useJourneyStore((s) => s.mood);
  const chooseMood = useJourneyStore((s) => s.chooseMood);

  if (phase === 'preface') {
    return (
      <section className={styles.panel} aria-labelledby="intro-title">
        <h1 id="intro-title" className={styles.h1}>
          {INTRO_COPY.title}
        </h1>
        <ul className={styles.points}>
          {INTRO_COPY.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <div className={styles.actions}>
          <button type="button" className={ui.primary} onClick={() => setPhase('mood')}>
            {INTRO_COPY.next}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="mood-title">
      <h1 id="mood-title" className={styles.h1}>
        {INTRO_COPY.moodTitle}
      </h1>
      <p className={styles.sub}>{INTRO_COPY.moodSub}</p>
      <div className={styles.moods} role="radiogroup" aria-labelledby="mood-title">
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mood === m}
            className={styles.mood}
            onClick={() => chooseMood(mood === m ? null : m)}
          >
            <WeatherIcon level={m} />
            <span>{INTRO_COPY.moods[m]}</span>
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={ui.ghost} onClick={onNext}>
          {INTRO_COPY.skip}
        </button>
        <button type="button" className={ui.primary} onClick={onNext}>
          {INTRO_COPY.moodNext}
        </button>
      </div>
    </section>
  );
}
