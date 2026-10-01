'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { track } from '@/analytics/track';
import { pieceLanded } from '@/audio/feedback';
import { COPY, KIND_HINT, KIND_LABEL, SIZE_LABEL, TEXTURE_LABEL } from '@/content/copy';
import { DEFAULT_TEXTURE, PALETTES } from '@/domain/palette';
import { randomSeed } from '@/domain/rng';
import {
  KEYWORDS,
  MAX_NOTE_LENGTH,
  MAX_PIECES,
  PIECE_KINDS,
  PIECE_SIZES,
  TEXTURES,
  type Piece,
  type PieceDraft,
  type PieceKind,
  type PresetIndex,
} from '@/domain/types';
import RiskHint from '@/safety/RiskHint';
import { useMosaicStore } from '@/store/mosaicStore';
import PiecePreview from '../PiecePreview';
import { useFocusTrap } from '../useFocusTrap';
import ui from '../ui.module.css';
import styles from './PieceMakerSheet.module.css';

interface Props {
  open: boolean;
  /** 수정할 조각. 없으면 새로 만든다. */
  editing?: Piece | null;
  onClose: () => void;
  onPlaced?: (piece: Piece) => void;
}

const PRESETS: PresetIndex[] = [0, 1, 2];

function draftFor(kind: PieceKind): PieceDraft {
  return {
    kind,
    seed: randomSeed(),
    presetIndex: 0,
    size: 'M',
    color: PALETTES[kind][0],
    texture: DEFAULT_TEXTURE[kind],
    note: '',
    keywords: [],
  };
}

export default function PieceMakerSheet({ open, editing, onClose, onPlaced }: Props) {
  const [draft, setDraft] = useState<PieceDraft>(() => draftFor('joy'));
  const pieceCount = useMosaicStore((s) => s.mosaic.pieces.length);
  const addPiece = useMosaicStore((s) => s.addPiece);
  const editPiece = useMosaicStore((s) => s.editPiece);
  const titleId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => onClose(), [onClose]);

  useFocusTrap(sheetRef, open, close);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { kind, seed, presetIndex, size, color, texture, note, keywords } = editing;
      setDraft({ kind, seed, presetIndex, size, color, texture, note: note ?? '', keywords: keywords ?? [] });
    }
    firstRef.current?.focus();
  }, [open, editing]);

  if (!open) return null;

  const atLimit = !editing && pieceCount >= MAX_PIECES;
  const set = (patch: Partial<PieceDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const chooseKind = (kind: PieceKind) =>
    setDraft((d) => ({
      ...d,
      kind,
      color: PALETTES[kind].includes(d.color) ? d.color : PALETTES[kind][0],
      texture: DEFAULT_TEXTURE[kind],
    }));

  const toggleKeyword = (k: string) =>
    setDraft((d) => {
      const list = d.keywords ?? [];
      return { ...d, keywords: list.includes(k) ? list.filter((x) => x !== k) : [...list, k] };
    });

  const submit = () => {
    if (editing) {
      editPiece(editing.id, draft);
      onClose();
      return;
    }
    // 캔버스 가운데 근처의 무작위 위치에 놓는다.
    const pos = { x: 0.5 + (Math.random() - 0.5) * 0.3, y: 0.5 + (Math.random() - 0.5) * 0.3 };
    const piece = addPiece(draft, pos);
    if (piece) {
      // 메모 내용은 보내지 않고, 메모가 있는지만 센다.
      track('piece_created', { kind: piece.kind, size: piece.size, has_note: Boolean(piece.note) });
      pieceLanded(piece.kind);
      onPlaced?.(piece);
      // 다음 조각은 새 모양으로 시작한다.
      setDraft((d) => ({ ...d, seed: randomSeed(), note: '', keywords: [] }));
      onClose();
    }
  };

  return (
    <div className={ui.scrim} onClick={onClose}>
      <section
        ref={sheetRef}
        className={`${ui.sheet} ${styles.sheet}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={ui.sheetHeader}>
          <h2 id={titleId}>{editing ? COPY.makerEditTitle : COPY.makerTitle}</h2>
          <button type="button" className={ui.ghost} onClick={onClose}>
            {COPY.makerClose}
          </button>
        </header>

        <div className={styles.preview} aria-hidden="true">
          <PiecePreview {...draft} box={120} />
        </div>

        <fieldset className={styles.group}>
          <legend>{COPY.makerKind}</legend>
          <div className={styles.kinds}>
            {PIECE_KINDS.map((k, i) => (
              <button
                key={k}
                ref={i === 0 ? firstRef : undefined}
                type="button"
                className={styles.kind}
                aria-pressed={draft.kind === k}
                onClick={() => chooseKind(k)}
              >
                <PiecePreview kind={k} seed={7} presetIndex={0} color={PALETTES[k][0]} box={36} />
                <span className={styles.kindName}>{KIND_LABEL[k]}</span>
              </button>
            ))}
          </div>
          <p className={styles.hint}>{KIND_HINT[draft.kind]}</p>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>{COPY.makerShape}</legend>
          <div className={styles.row}>
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={styles.swatchBtn}
                aria-pressed={draft.presetIndex === p}
                aria-label={`모양 ${p + 1}`}
                onClick={() => set({ presetIndex: p })}
              >
                <PiecePreview kind={draft.kind} seed={draft.seed} presetIndex={p} color={draft.color} box={44} />
              </button>
            ))}
            <button type="button" className={ui.secondary} onClick={() => set({ seed: randomSeed() })}>
              {COPY.makerRebreak}
            </button>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>
            {COPY.makerSize} <span className={styles.legendHint}>{COPY.makerSizeHint}</span>
          </legend>
          <div className={styles.row}>
            {PIECE_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={styles.chip}
                aria-pressed={draft.size === s}
                onClick={() => set({ size: s })}
              >
                {SIZE_LABEL[s]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>{COPY.makerColor}</legend>
          <div className={styles.row}>
            {PALETTES[draft.kind].map((c, i) => (
              <button
                key={c}
                type="button"
                className={styles.color}
                style={{ background: c }}
                aria-pressed={draft.color === c}
                aria-label={`색 ${i + 1}`}
                onClick={() => set({ color: c })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>
            {COPY.makerTexture} <span className={styles.legendHint}>{COPY.makerTextureHint}</span>
          </legend>
          <div className={styles.row}>
            {TEXTURES.map((t) => (
              <button
                key={t}
                type="button"
                className={styles.chip}
                aria-pressed={draft.texture === t}
                onClick={() => set({ texture: t })}
              >
                {TEXTURE_LABEL[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className={styles.group}>
          <span className={styles.label}>{COPY.makerNote}</span>
          <input
            className={ui.input}
            type="text"
            value={draft.note ?? ''}
            maxLength={MAX_NOTE_LENGTH}
            placeholder={COPY.makerNotePlaceholder}
            onChange={(e) => set({ note: e.target.value })}
          />
          <span className={styles.hint}>
            {COPY.makerNoteHint} ({(draft.note ?? '').length}/{MAX_NOTE_LENGTH})
          </span>
          <RiskHint text={draft.note ?? ''} />
        </label>

        <fieldset className={styles.group}>
          <legend>
            {COPY.makerKeywords} <span className={styles.legendHint}>{COPY.makerKeywordsHint}</span>
          </legend>
          <div className={styles.row}>
            {KEYWORDS.map((k) => (
              <button
                key={k}
                type="button"
                className={styles.chip}
                aria-pressed={(draft.keywords ?? []).includes(k)}
                onClick={() => toggleKeyword(k)}
              >
                {k}
              </button>
            ))}
          </div>
        </fieldset>

        <footer className={styles.footer}>
          {atLimit && <p className={styles.hint}>{COPY.makerLimit}</p>}
          <button type="button" className={ui.primary} disabled={atLimit} onClick={submit}>
            {editing ? COPY.makerApply : COPY.makerPlace}
          </button>
        </footer>
      </section>
    </div>
  );
}
