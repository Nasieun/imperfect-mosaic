'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { track } from '@/analytics/track';
import { COPY, formatDate } from '@/content/copy';
import { clearAllMosaics, deleteMosaic, getThumbnails, listMosaics } from '@/db/db';
import type { Mosaic } from '@/domain/types';
import { useJourneyStore } from '@/store/journeyStore';
import { useMosaicStore } from '@/store/mosaicStore';
import ui from '@/components/ui.module.css';
import styles from './my.module.css';

/** 내 모자이크: 날짜순 썸네일. 비교나 변화 그래프는 없다. */
export default function MyPage() {
  const router = useRouter();
  const [list, setList] = useState<Mosaic[] | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [aged, setAged] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [l, t] = await Promise.all([listMosaics(), getThumbnails()]);
      setList(l);
      setThumbs(t);
    } catch {
      setList([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resume = (m: Mosaic) => {
    useMosaicStore.getState().loadMosaic(m, { aged });
    useJourneyStore.getState().reset();
    track('journey_started', { entry: 'resume' });
    router.push('/journey/?step=make');
  };

  const remove = async (m: Mosaic) => {
    if (!window.confirm(COPY.myDeleteConfirm)) return;
    await deleteMosaic(m.id);
    if (useMosaicStore.getState().mosaic.id === m.id) useMosaicStore.getState().reset();
    refresh();
  };

  const removeAll = async () => {
    if (!window.confirm(COPY.clearConfirm)) return;
    await clearAllMosaics();
    useMosaicStore.getState().reset();
    refresh();
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{COPY.myTitle}</h1>
          <p className={styles.sub}>{COPY.mySub}</p>
        </div>
        <Link href="/" className={ui.ghost}>
          {COPY.myBack}
        </Link>
      </header>

      {list === null ? null : list.length === 0 ? (
        <p className={styles.empty}>{COPY.myEmpty}</p>
      ) : (
        <>
          <label className={styles.aged}>
            <input type="checkbox" checked={aged} onChange={(e) => setAged(e.target.checked)} />
            <span>{COPY.agedToggle}</span>
          </label>
          <ul className={styles.grid}>
            {list.map((m) => (
              <li key={m.id} className={styles.card} data-testid="my-mosaic">
                <div className={styles.thumb}>
                  {thumbs[m.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- 기기 안에 저장된 data URL 썸네일
                    <img src={thumbs[m.id]} alt="" />
                  ) : null}
                </div>
                <p className={styles.name}>{m.title || COPY.myUntitled}</p>
                <p className={styles.date}>{formatDate(m.createdAt)}</p>
                <div className={styles.actions}>
                  <button type="button" className={ui.secondary} onClick={() => resume(m)}>
                    {COPY.myContinue}
                  </button>
                  <button type="button" className={ui.ghost} onClick={() => remove(m)}>
                    {COPY.myDelete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            <button type="button" className={ui.ghost} onClick={removeAll}>
              {COPY.clearAll}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
