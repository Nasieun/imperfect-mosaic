'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { COPY, FRAME_LABEL, KIND_LABEL, SIZE_SPOKEN, describePiece, describeWhere } from '@/content/copy';
import type { Mosaic } from '@/domain/types';
import { useMosaicStore } from '@/store/mosaicStore';
import PieceMakerSheet from './maker/PieceMakerSheet';
import PieceMenu from './canvas/PieceMenu';
import CanvasPlaceholder from './canvas/CanvasPlaceholder';
import StorageTray from './StorageTray';
import UndoToast from './UndoToast';
import ui from './ui.module.css';
import styles from './MosaicEditor.module.css';

// Konva는 브라우저에서만 동작한다.
const MosaicCanvas = dynamic(() => import('./canvas/MosaicCanvas'), { ssr: false, loading: () => <CanvasPlaceholder /> });

interface Props {
  /** 첫 진입 안내 문구 (선택) */
  intro?: string;
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

/** 조각 만들기 + 자유 배치 작업 공간 */
export default function MosaicEditor({ intro }: Props) {
  const pieces = useMosaicStore((s) => s.mosaic.pieces);
  const selectedId = useMosaicStore((s) => s.selectedId);
  const past = useMosaicStore((s) => s.past);
  const future = useMosaicStore((s) => s.future);
  const undo = useMosaicStore((s) => s.undo);
  const redo = useMosaicStore((s) => s.redo);
  const restoreDeleted = useMosaicStore((s) => s.restoreDeleted);
  const frame = useMosaicStore((s) => s.mosaic.frame);
  const setFrame = useMosaicStore((s) => s.setFrame);

  const [makerOpen, setMakerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [toastToken, setToastToken] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [showIntro, setShowIntro] = useState(Boolean(intro));

  const selected = pieces.find((p) => p.id === selectedId && p.state !== 'stored') ?? null;
  const editing = pieces.find((p) => p.id === editingId) ?? null;
  const storedCount = pieces.filter((p) => p.state === 'stored').length;
  const onCanvasCount = pieces.length - storedCount;

  const announce = useMemo(() => {
    if (!selected) return '';
    return `${describePiece(KIND_LABEL[selected.kind], SIZE_SPOKEN[selected.size], describeWhere(selected.x, selected.y), selected.rotation)} 선택됨`;
  }, [selected]);

  const onDeleted = useCallback(() => {
    setToastToken((t) => t + 1);
    setToastVisible(true);
  }, []);
  const dismissToast = useCallback(() => setToastVisible(false), []);

  // 되돌리기 / 다시하기 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || !(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return (
    <div className={styles.editor}>
      <div className={styles.canvasArea}>
        <MosaicCanvas onDeleted={onDeleted} />
        {onCanvasCount === 0 && <p className={styles.empty}>{COPY.emptyCanvas}</p>}
        {showIntro && intro && (
          <div className={styles.intro} role="note">
            <span>{intro}</span>
            <button type="button" className={ui.ghost} onClick={() => setShowIntro(false)}>
              {COPY.makerClose}
            </button>
          </div>
        )}
      </div>

      <div className={styles.menuSlot}>
        {selected && (
          <PieceMenu
            piece={selected}
            onEdit={() => {
              setEditingId(selected.id);
              setMakerOpen(true);
            }}
            onDeleted={onDeleted}
          />
        )}
      </div>

      <nav className={styles.bottomBar} aria-label="만들기 도구">
        <button
          type="button"
          className={ui.primary}
          onClick={() => {
            setEditingId(null);
            setMakerOpen(true);
            setShowIntro(false);
          }}
        >
          {COPY.makePiece}
        </button>
        <button type="button" className={ui.secondary} onClick={() => setTrayOpen(true)}>
          {COPY.storage} {storedCount > 0 ? `(${storedCount})` : ''}
        </button>
        <label className={styles.frame}>
          <span>{COPY.frame}</span>
          <select
            className={ui.input}
            value={frame}
            onChange={(e) => setFrame(e.target.value as Mosaic['frame'])}
          >
            {(Object.keys(FRAME_LABEL) as Mosaic['frame'][]).map((f) => (
              <option key={f} value={f}>
                {FRAME_LABEL[f]}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.history}>
          <button
            type="button"
            className={ui.iconBtn}
            onClick={undo}
            disabled={!past.length}
            aria-label={COPY.undo}
            title={COPY.undo}
          >
            ↶
          </button>
          <button
            type="button"
            className={ui.iconBtn}
            onClick={redo}
            disabled={!future.length}
            aria-label={COPY.redo}
            title={COPY.redo}
          >
            ↷
          </button>
        </span>
      </nav>

      <p className={styles.keys}>{COPY.keyboardHelp}</p>
      <div className={ui.srOnly} aria-live="polite">
        {announce}
      </div>

      <PieceMakerSheet
        open={makerOpen}
        editing={editing}
        onClose={() => {
          setMakerOpen(false);
          setEditingId(null);
        }}
      />
      <StorageTray open={trayOpen} onClose={() => setTrayOpen(false)} onDeleted={onDeleted} />
      {toastVisible && (
        <UndoToast
          token={toastToken}
          message={COPY.toastDeleted}
          actionLabel={COPY.undo}
          onAction={restoreDeleted}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}
