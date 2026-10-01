'use client';

import { useEffect, useState } from 'react';
import { loadLatestMosaic, saveMosaic, saveThumbnail } from '@/db/db';
import { groutColor, snapshot } from '@/components/canvas/stageRegistry';
import { useMosaicStore } from './mosaicStore';

const DEBOUNCE_MS = 2000;

/** 지금 캔버스가 보이면 작은 썸네일을 함께 저장한다. */
function saveThumb(id: string) {
  const canvas = snapshot(0.3, groutColor());
  if (!canvas) return;
  saveThumbnail(id, canvas.toDataURL('image/png')).catch(() => {});
}

/**
 * 진입 시 모자이크를 불러오고, 바뀔 때마다 2초 뒤 IndexedDB에 저장한다.
 * 랜딩이나 내 모자이크에서 이미 고른 경우에는 다시 불러오지 않는다.
 * 화면이 가려질 때(탭 전환·앱 종료)는 바로 저장한다.
 */
export function useMosaicPersistence(options: { load?: boolean } = {}) {
  const { load = true } = options;
  const [ready, setReady] = useState(() => !load || useMosaicStore.getState().chosen);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    loadLatestMosaic()
      .then((m) => {
        if (!cancelled && m) useMosaicStore.getState().loadMosaic(m);
      })
      .catch(() => {
        // 저장소를 쓸 수 없는 환경(사생활 보호 창 등)에서도 체험은 계속된다.
      })
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let timer: number | null = null;
    const flush = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
      // 조각을 모두 지운 상태도 저장해야 지운 조각이 되살아나지 않는다. (빈 모자이크는 목록에서 감춘다)
      const { mosaic } = useMosaicStore.getState();
      saveMosaic(mosaic).catch(() => {});
      saveThumb(mosaic.id);
    };
    const unsub = useMosaicStore.subscribe((s, prev) => {
      if (s.mosaic === prev.mosaic) return;
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(flush, DEBOUNCE_MS);
    });
    const onHide = () => document.visibilityState === 'hidden' && timer !== null && flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      unsub();
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      if (timer !== null) flush();
    };
  }, [ready]);

  return ready;
}
