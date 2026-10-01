'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { track } from '@/analytics/track';
import { Whole } from '@/components/journey/illustrations';
import { COPY } from '@/content/copy';
import { LANDING_COPY } from '@/content/journey';
import { listMosaics } from '@/db/db';
import type { Mosaic } from '@/domain/types';
import { useJourneyStore } from '@/store/journeyStore';
import { useMosaicStore } from '@/store/mosaicStore';
import ui from '@/components/ui.module.css';
import styles from './shell.module.css';

export default function Home() {
  const router = useRouter();
  const [latest, setLatest] = useState<Mosaic | null>(null);
  const [aged, setAged] = useState(false);

  useEffect(() => {
    listMosaics()
      .then((list) => setLatest(list[0] ?? null))
      .catch(() => setLatest(null));
  }, []);

  const startNew = () => {
    useMosaicStore.getState().startNew();
    useJourneyStore.getState().reset();
    track('journey_started', { entry: 'landing' });
    router.push('/journey/?step=intro');
  };

  const continueLatest = () => {
    if (!latest) return;
    // 오래된 톤은 사용자가 고른 경우에만 입힌다. 기본은 꺼짐.
    useMosaicStore.getState().loadMosaic(latest, { aged });
    useJourneyStore.getState().reset();
    track('journey_started', { entry: 'resume' });
    router.push('/journey/?step=make');
  };

  return (
    <main className={styles.center}>
      <div className={styles.landingArt}>
        <Whole label="반쯤 맞물린 채 모여 있는 조각들" />
      </div>
      <h1 className={styles.title}>{COPY.appTitle}</h1>
      <p className={styles.lead}>{LANDING_COPY.line}</p>
      <p className={styles.landingSub}>{LANDING_COPY.sub}</p>

      {latest ? (
        <div className={styles.choices}>
          <div className={styles.choiceRow}>
            {/* 두 선택지를 같은 크기·같은 위계로 보여준다 */}
            <button type="button" className={ui.secondary} onClick={continueLatest}>
              {COPY.myContinue}
            </button>
            <button type="button" className={ui.secondary} onClick={startNew}>
              {COPY.newMosaic}
            </button>
          </div>
          <label className={styles.agedToggle}>
            <input type="checkbox" checked={aged} onChange={(e) => setAged(e.target.checked)} />
            <span>{COPY.agedToggle}</span>
          </label>
          <Link href="/my" className={styles.textLink}>
            {COPY.myLink}
          </Link>
        </div>
      ) : (
        <button type="button" className={styles.cta} onClick={startNew}>
          {LANDING_COPY.start}
        </button>
      )}
    </main>
  );
}
