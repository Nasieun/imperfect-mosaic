'use client';

import { useEffect, useState } from 'react';
import { emptyRatioBucket, track } from '@/analytics/track';
import { SIZE_RADIUS } from '@/domain/palette';
import MosaicEditor from '../MosaicEditor';
import { getStage } from '../canvas/stageRegistry';
import CanvasPlaceholder from '../canvas/CanvasPlaceholder';
import { COPY } from '@/content/copy';
import { MAKE_COPY } from '@/content/journey';
import { useJourneyStore } from '@/store/journeyStore';
import { useMosaicStore } from '@/store/mosaicStore';
import ui from '../ui.module.css';
import styles from './journey.module.css';

/** 빈 공간 비율 구간(분석 전용, 화면에 표시하지 않음) */
function currentEmptyBucket() {
  const stage = getStage();
  const pieces = useMosaicStore.getState().mosaic.pieces.filter((p) => p.state !== 'stored');
  const w = stage?.width() ?? 800;
  const h = stage?.height() ?? 600;
  const scale = Math.min(1.2, Math.max(0.6, Math.min(w, h) / 640));
  // 조각을 반지름의 원 면적의 70% 정도로 근사한다.
  const areas = pieces.map((p) => Math.PI * (SIZE_RADIUS[p.size] * scale) ** 2 * 0.7);
  return emptyRatioBucket(areas, w * h);
}

/** 2단계: 조각을 만드는 체험 */
export default function MakeStep({ ready, onNext }: { ready: boolean; onNext: () => void }) {
  const count = useMosaicStore((s) => s.mosaic.pieces.length);
  const hintShown = useJourneyStore((s) => s.makeHintShown);
  const markHint = useJourneyStore((s) => s.markMakeHintShown);

  // 첫 진입 안내는 한 번만 보여준다. 마운트 시점의 값을 고정한다.
  const [intro] = useState(() => (hintShown ? undefined : MAKE_COPY.hint));
  useEffect(() => {
    if (!hintShown) markHint();
  }, [hintShown, markHint]);

  const done = () => {
    track('canvas_done', { piece_count: count, empty_ratio_bucket: currentEmptyBucket() });
    onNext();
  };

  return (
    <div className={styles.make}>
      <div className={styles.makeTop}>
        {!ready ? null : count === 0 ? (
          <p className={styles.sub}>{MAKE_COPY.emptyHint}</p>
        ) : (
          <button type="button" className={ui.primary} onClick={done}>
            {MAKE_COPY.done}
          </button>
        )}
      </div>
      {ready ? (
        <MosaicEditor intro={intro} />
      ) : (
        <div className={styles.canvasSlot}>
          <CanvasPlaceholder label={COPY.emptyCanvas} />
        </div>
      )}
    </div>
  );
}
