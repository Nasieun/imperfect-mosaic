'use client';

import { useId, useRef } from 'react';
import { COPY, KIND_LABEL } from '@/content/copy';
import { useMosaicStore } from '@/store/mosaicStore';
import PiecePreview from './PiecePreview';
import { useFocusTrap } from './useFocusTrap';
import ui from './ui.module.css';
import styles from './StorageTray.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

/** 만들었지만 아직 놓고 싶지 않은 조각을 두는 곳. 캔버스 밖에 있다. */
export default function StorageTray({ open, onClose, onDeleted }: Props) {
  const pieces = useMosaicStore((s) => s.mosaic.pieces);
  const takeOut = useMosaicStore((s) => s.takeOut);
  const deletePiece = useMosaicStore((s) => s.deletePiece);
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, open, onClose);
  const stored = pieces.filter((p) => p.state === 'stored');

  if (!open) return null;

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
          <h2 id={titleId}>{COPY.trayTitle}</h2>
          <button type="button" className={ui.ghost} onClick={onClose} autoFocus>
            {COPY.makerClose}
          </button>
        </header>
        <p className={styles.hint}>{COPY.trayHint}</p>
        {stored.length === 0 ? (
          <p className={styles.empty}>{COPY.trayEmpty}</p>
        ) : (
          <ul className={styles.list}>
            {stored.map((p) => (
              <li key={p.id} className={styles.item}>
                <PiecePreview kind={p.kind} seed={p.seed} presetIndex={p.presetIndex} size={p.size} color={p.color} box={52} />
                <span className={styles.name}>{KIND_LABEL[p.kind]}</span>
                <button type="button" className={ui.secondary} onClick={() => takeOut(p.id)}>
                  {COPY.trayTakeOut}
                </button>
                <button
                  type="button"
                  className={ui.ghost}
                  onClick={() => {
                    deletePiece(p.id);
                    onDeleted();
                  }}
                >
                  {COPY.menuDelete}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
