import { create } from 'zustand';
import {
  MAX_HISTORY,
  MAX_PIECES,
  MAX_TITLE_LENGTH,
  SCHEMA_VERSION,
  type Mosaic,
  type Piece,
  type PieceDraft,
  type PieceState,
} from '@/domain/types';

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function createEmptyMosaic(): Mosaic {
  const now = new Date().toISOString();
  return { id: newId(), schemaVersion: SCHEMA_VERSION, frame: 'none', pieces: [], createdAt: now, updatedAt: now };
}

interface DeletedPiece {
  piece: Piece;
  index: number;
}

export interface MosaicState {
  mosaic: Mosaic;
  past: Piece[][];
  future: Piece[][];
  selectedId: string | null;
  lastDeleted: DeletedPiece | null;
  /** 랜딩·내 모자이크에서 이번에 쓸 모자이크를 이미 골랐는가 (그렇다면 최신 것을 다시 불러오지 않는다) */
  chosen: boolean;

  loadMosaic: (m: Mosaic, options?: { aged?: boolean }) => void;
  reset: () => void;
  /** 새 모자이크로 시작한다 */
  startNew: () => void;
  setFrame: (frame: Mosaic['frame']) => void;
  setTitle: (title: string) => void;
  setCareChoice: (choice: Mosaic['careChoice']) => void;
  setAgedAll: (aged: boolean) => void;
  select: (id: string | null) => void;

  /** 조각을 만든다. 상한(60개)에 닿으면 null */
  addPiece: (draft: PieceDraft, pos?: { x: number; y: number }) => Piece | null;
  editPiece: (id: string, draft: PieceDraft) => void;
  movePiece: (id: string, x: number, y: number) => void;
  nudgePiece: (id: string, dx: number, dy: number) => void;
  rotatePiece: (id: string, rotation: number) => void;
  rotateBy: (id: string, delta: number) => void;
  setPieceState: (id: string, state: PieceState) => void;
  takeOut: (id: string) => void;
  bringToFront: (id: string) => void;
  deletePiece: (id: string) => void;
  restoreDeleted: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useMosaicStore = create<MosaicState>((set, get) => {
  /** 이전 상태를 히스토리에 쌓고 새 조각 배열을 반영한다. */
  const commit = (pieces: Piece[], extra: Partial<MosaicState> = {}) => {
    const { mosaic, past } = get();
    const nextPast = [...past, mosaic.pieces];
    if (nextPast.length > MAX_HISTORY) nextPast.splice(0, nextPast.length - MAX_HISTORY);
    set({
      mosaic: { ...mosaic, pieces, updatedAt: new Date().toISOString() },
      past: nextPast,
      future: [],
      ...extra,
    });
  };

  const update = (id: string, fn: (p: Piece) => Piece) => {
    const pieces = get().mosaic.pieces;
    const idx = pieces.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const next = fn(pieces[idx]);
    if (next === pieces[idx]) return;
    const copy = pieces.slice();
    copy[idx] = next;
    commit(copy);
  };

  const topZ = () => get().mosaic.pieces.reduce((m, p) => Math.max(m, p.z), 0);

  return {
    mosaic: createEmptyMosaic(),
    past: [],
    future: [],
    selectedId: null,
    lastDeleted: null,
    chosen: false,

    loadMosaic: (m, options) =>
      set({
        mosaic:
          options?.aged === undefined
            ? m
            : { ...m, pieces: m.pieces.map((p) => ({ ...p, aged: options.aged })) },
        past: [],
        future: [],
        selectedId: null,
        lastDeleted: null,
        chosen: true,
      }),
    reset: () =>
      set({ mosaic: createEmptyMosaic(), past: [], future: [], selectedId: null, lastDeleted: null, chosen: false }),
    startNew: () =>
      set({ mosaic: createEmptyMosaic(), past: [], future: [], selectedId: null, lastDeleted: null, chosen: true }),

    // 틀·제목·돌봄은 조각 배치 히스토리에 넣지 않는다.
    setFrame: (frame) => set((s) => ({ mosaic: { ...s.mosaic, frame, updatedAt: new Date().toISOString() } })),
    setTitle: (title) =>
      set((s) => ({
        mosaic: {
          ...s.mosaic,
          title: title.slice(0, MAX_TITLE_LENGTH) || undefined,
          updatedAt: new Date().toISOString(),
        },
      })),
    setCareChoice: (careChoice) =>
      set((s) => ({ mosaic: { ...s.mosaic, careChoice, updatedAt: new Date().toISOString() } })),
    setAgedAll: (aged) =>
      set((s) => ({
        mosaic: { ...s.mosaic, pieces: s.mosaic.pieces.map((p) => ({ ...p, aged })), updatedAt: new Date().toISOString() },
      })),
    select: (id) => set({ selectedId: id }),

    addPiece: (draft, pos) => {
      const pieces = get().mosaic.pieces;
      if (pieces.length >= MAX_PIECES) return null;
      const piece: Piece = {
        id: newId(),
        ...draft,
        note: draft.note?.trim() ? draft.note.trim() : undefined,
        keywords: draft.keywords?.length ? [...draft.keywords] : undefined,
        x: clamp01(pos?.x ?? 0.5),
        y: clamp01(pos?.y ?? 0.5),
        rotation: 0,
        z: topZ() + 1,
        state: 'placed',
        createdAt: new Date().toISOString(),
      };
      commit([...pieces, piece], { selectedId: piece.id });
      return piece;
    },

    editPiece: (id, draft) =>
      update(id, (p) => ({
        ...p,
        ...draft,
        note: draft.note?.trim() ? draft.note.trim() : undefined,
        keywords: draft.keywords?.length ? [...draft.keywords] : undefined,
      })),

    movePiece: (id, x, y) =>
      update(id, (p) => (p.x === clamp01(x) && p.y === clamp01(y) ? p : { ...p, x: clamp01(x), y: clamp01(y) })),

    nudgePiece: (id, dx, dy) => update(id, (p) => ({ ...p, x: clamp01(p.x + dx), y: clamp01(p.y + dy) })),

    rotatePiece: (id, rotation) => update(id, (p) => (p.rotation === rotation ? p : { ...p, rotation })),

    rotateBy: (id, delta) => update(id, (p) => ({ ...p, rotation: p.rotation + delta })),

    setPieceState: (id, state) => {
      update(id, (p) => (p.state === state ? p : { ...p, state }));
      if (state === 'stored' && get().selectedId === id) set({ selectedId: null });
    },

    takeOut: (id) => update(id, (p) => ({ ...p, state: 'placed', z: topZ() + 1 })),

    bringToFront: (id) => {
      const max = topZ();
      const piece = get().mosaic.pieces.find((p) => p.id === id);
      if (!piece || piece.z === max) return;
      // 앞으로 가져오기는 히스토리에 남기지 않는다.
      set((s) => ({
        mosaic: { ...s.mosaic, pieces: s.mosaic.pieces.map((p) => (p.id === id ? { ...p, z: max + 1 } : p)) },
      }));
    },

    deletePiece: (id) => {
      const pieces = get().mosaic.pieces;
      const index = pieces.findIndex((p) => p.id === id);
      if (index < 0) return;
      commit(
        pieces.filter((p) => p.id !== id),
        {
          lastDeleted: { piece: pieces[index], index },
          selectedId: get().selectedId === id ? null : get().selectedId,
        },
      );
    },

    restoreDeleted: () => {
      const { lastDeleted, mosaic } = get();
      if (!lastDeleted) return;
      if (mosaic.pieces.some((p) => p.id === lastDeleted.piece.id)) {
        set({ lastDeleted: null });
        return;
      }
      const copy = mosaic.pieces.slice();
      copy.splice(Math.min(lastDeleted.index, copy.length), 0, lastDeleted.piece);
      commit(copy, { lastDeleted: null });
    },

    undo: () => {
      const { past, future, mosaic, selectedId } = get();
      if (!past.length) return;
      const prev = past[past.length - 1];
      set({
        past: past.slice(0, -1),
        future: [...future, mosaic.pieces],
        mosaic: { ...mosaic, pieces: prev, updatedAt: new Date().toISOString() },
        selectedId: prev.some((p) => p.id === selectedId) ? selectedId : null,
      });
    },

    redo: () => {
      const { past, future, mosaic, selectedId } = get();
      if (!future.length) return;
      const next = future[future.length - 1];
      set({
        future: future.slice(0, -1),
        past: [...past, mosaic.pieces],
        mosaic: { ...mosaic, pieces: next, updatedAt: new Date().toISOString() },
        selectedId: next.some((p) => p.id === selectedId) ? selectedId : null,
      });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
  };
});
