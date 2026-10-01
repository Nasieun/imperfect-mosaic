'use client';

import { track } from '@/analytics/track';
import { COPY, KIND_LABEL } from '@/content/copy';
import type { Piece, PieceState } from '@/domain/types';
import { useMosaicStore } from '@/store/mosaicStore';
import ui from '../ui.module.css';
import styles from './PieceMenu.module.css';

interface Props {
  piece: Piece;
  onEdit: () => void;
  onDeleted: () => void;
}

const STEP = 0.02;

/**
 * 선택한 조각의 메뉴: 수정 / 숨기기 / 흐리게 / 보관함으로 / 지우기
 * 드래그 없이도 옮기고 돌릴 수 있도록 화면 버튼을 함께 둔다(WCAG 2.5.7).
 */
export default function PieceMenu({ piece, onEdit, onDeleted }: Props) {
  const setPieceState = useMosaicStore((s) => s.setPieceState);
  const deletePiece = useMosaicStore((s) => s.deletePiece);
  const rotateBy = useMosaicStore((s) => s.rotateBy);
  const nudgePiece = useMosaicStore((s) => s.nudgePiece);

  const hidden = piece.state === 'hidden';
  const faded = piece.state === 'faded';

  const changeState = (state: PieceState, action: 'hide' | 'fade' | 'store' | 'restore') => {
    setPieceState(piece.id, state);
    track('piece_action', { action });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.menu} role="toolbar" aria-label={`${KIND_LABEL[piece.kind]} 조각 메뉴`}>
        <button type="button" className={ui.iconBtn} onClick={onEdit}>
          {COPY.menuEdit}
        </button>
        <button
          type="button"
          className={ui.iconBtn}
          onClick={() => changeState(hidden ? 'placed' : 'hidden', hidden ? 'restore' : 'hide')}
        >
          {hidden ? COPY.menuShow : COPY.menuHide}
        </button>
        <button
          type="button"
          className={ui.iconBtn}
          onClick={() => changeState(faded ? 'placed' : 'faded', faded ? 'restore' : 'fade')}
        >
          {faded ? COPY.menuUnfade : COPY.menuFade}
        </button>
        <button type="button" className={ui.iconBtn} onClick={() => changeState('stored', 'store')}>
          {COPY.menuStore}
        </button>
        <button
          type="button"
          className={ui.iconBtn}
          onClick={() => {
            deletePiece(piece.id);
            track('piece_action', { action: 'delete' });
            onDeleted();
          }}
        >
          {COPY.menuDelete}
        </button>
      </div>
      <div className={styles.menu} role="toolbar" aria-label="옮기기와 돌리기">
        <button type="button" className={ui.iconBtn} aria-label={COPY.menuLeft} onClick={() => nudgePiece(piece.id, -STEP, 0)}>
          ←
        </button>
        <button type="button" className={ui.iconBtn} aria-label={COPY.menuUp} onClick={() => nudgePiece(piece.id, 0, -STEP)}>
          ↑
        </button>
        <button type="button" className={ui.iconBtn} aria-label={COPY.menuDown} onClick={() => nudgePiece(piece.id, 0, STEP)}>
          ↓
        </button>
        <button type="button" className={ui.iconBtn} aria-label={COPY.menuRight} onClick={() => nudgePiece(piece.id, STEP, 0)}>
          →
        </button>
        <button type="button" className={ui.iconBtn} aria-label={COPY.menuRotateLeft} onClick={() => rotateBy(piece.id, -15)}>
          ↺
        </button>
        <button type="button" className={ui.iconBtn} aria-label={COPY.menuRotateRight} onClick={() => rotateBy(piece.id, 15)}>
          ↻
        </button>
      </div>
    </div>
  );
}
