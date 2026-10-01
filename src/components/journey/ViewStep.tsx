'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { track } from '@/analytics/track';
import { formatDate } from '@/content/copy';
import { VIEW_COPY } from '@/content/journey';
import { MAX_TITLE_LENGTH } from '@/domain/types';
import { saveThumbnail } from '@/db/db';
import { exportMosaicPng } from '@/export/exportImage';
import { useJourneyStore } from '@/store/journeyStore';
import { useMosaicStore } from '@/store/mosaicStore';
import { groutColor, snapshot } from '../canvas/stageRegistry';
import CanvasPlaceholder from '../canvas/CanvasPlaceholder';
import ui from '../ui.module.css';
import styles from './journey.module.css';

const MosaicCanvas = dynamic(() => import('../canvas/MosaicCanvas'), { ssr: false, loading: () => <CanvasPlaceholder /> });

const REVEAL_MS = 3000;
const HIGHLIGHT_MS = 2400;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 3단계: 편집을 멈추고 만든 모자이크를 조용히 바라본다. 통계나 비율은 보여주지 않는다. */
export default function ViewStep({ ready, onEdit, onNext }: { ready: boolean; onEdit: () => void; onNext: () => void }) {
  const pieces = useMosaicStore((s) => s.mosaic.pieces);
  const title = useMosaicStore((s) => s.mosaic.title ?? '');
  const createdAt = useMosaicStore((s) => s.mosaic.createdAt);
  const setTitle = useMosaicStore((s) => s.setTitle);
  const select = useMosaicStore((s) => s.select);
  const setSnapshot = useJourneyStore((s) => s.setSnapshot);
  const [revealed, setRevealed] = useState(false);
  const [zoom, setZoom] = useState<'near' | 'far'>('near');
  const [highlight, setHighlight] = useState<string | null>(null);
  const [exported, setExported] = useState('');

  const total = pieces.filter((p) => p.state !== 'stored').length;

  useEffect(() => {
    select(null);
    track('view_entered');
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const t = window.setTimeout(() => setRevealed(true), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [select]);

  useEffect(() => {
    if (!highlight) return;
    const t = window.setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(t);
  }, [highlight]);

  const leave = (then: () => void) => {
    // 마무리 화면에서 보여줄 이미지는 메모리에만 담고, 내 모자이크용 작은 썸네일은 기기에 저장한다.
    setSnapshot(snapshot(1, groutColor())?.toDataURL('image/png') ?? null);
    const thumb = snapshot(0.3, groutColor());
    if (thumb) saveThumbnail(useMosaicStore.getState().mosaic.id, thumb.toDataURL('image/png')).catch(() => {});
    then();
  };

  const save = async () => {
    const result = await exportMosaicPng();
    if (result !== 'failed') {
      track('view_exported');
      setExported(VIEW_COPY.exported);
    }
  };

  return (
    <section className={styles.view} aria-labelledby="view-line">
      <div
        className={styles.viewCanvas}
        data-revealed={revealed}
        onClick={() => !revealed && setRevealed(true)}
      >
        {ready ? (
          <MosaicCanvas
            readOnly
            zoom={zoom === 'far' ? 0.7 : 1.15}
            highlightId={highlight}
            onPieceTap={(id) => revealed && setHighlight(id)}
          />
        ) : (
          <CanvasPlaceholder />
        )}
        {!revealed && (
          <>
            <div className={styles.lightBand} aria-hidden="true" />
            <p className={styles.revealHint}>{VIEW_COPY.skipReveal}</p>
          </>
        )}
        {highlight && (
          <p className={styles.oneOf} role="status">
            {VIEW_COPY.oneOf(total)}
          </p>
        )}
      </div>

      <div className={styles.viewText} data-revealed={revealed}>
        <p id="view-line" className={styles.viewLine}>
          {VIEW_COPY.line1}
          <br />
          {VIEW_COPY.line2}
        </p>
        <p className={styles.sub}>{VIEW_COPY.tapHint}</p>
      </div>

      <div className={styles.titleRow}>
        <label className={styles.titleLabel}>
          <span>{VIEW_COPY.titleLabel}</span>
          <input
            className={ui.input}
            type="text"
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            placeholder={VIEW_COPY.titlePlaceholder}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <span className={styles.date}>{formatDate(createdAt)}</span>
      </div>

      <div className={styles.actions}>
        <div className={styles.zoom} role="group" aria-label="보기 거리">
          <button type="button" className={ui.iconBtn} aria-pressed={zoom === 'far'} onClick={() => setZoom('far')}>
            {VIEW_COPY.far}
          </button>
          <button type="button" className={ui.iconBtn} aria-pressed={zoom === 'near'} onClick={() => setZoom('near')}>
            {VIEW_COPY.near}
          </button>
        </div>
        <button type="button" className={ui.iconBtn} onClick={save}>
          {VIEW_COPY.export}
        </button>
        <span className={styles.spacer} />
        <button type="button" className={ui.secondary} onClick={() => leave(onEdit)}>
          {VIEW_COPY.edit}
        </button>
        <button type="button" className={ui.primary} onClick={() => leave(onNext)}>
          {VIEW_COPY.next}
        </button>
      </div>
      <p className={ui.srOnly} role="status">
        {exported}
      </p>
    </section>
  );
}
