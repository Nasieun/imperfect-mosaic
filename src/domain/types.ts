export type PieceKind = 'joy' | 'failure' | 'wound' | 'helped' | 'unnamed';
export type PieceSize = 'S' | 'M' | 'L';
export type PresetIndex = 0 | 1 | 2;
export type PieceState = 'placed' | 'hidden' | 'faded' | 'stored';
export type TextureKey = 'ceramic' | 'stone' | 'glass' | 'fabric' | 'paper';

export interface Piece {
  id: string;
  kind: PieceKind;
  seed: number;
  presetIndex: PresetIndex;
  size: PieceSize;
  color: string;
  texture: TextureKey;
  /** 캔버스 대비 상대 좌표 0..1 */
  x: number;
  y: number;
  /** 도(deg), 제한 없음 */
  rotation: number;
  z: number;
  state: PieceState;
  /** 최대 60자 */
  note?: string;
  /** 메모 대신 고르는 키워드 칩. 화면에는 길게 누를 때만 보인다. */
  keywords?: string[];
  /** 재방문 시 사용자가 고른 경우에만 적용하는 '오래된 톤' */
  aged?: boolean;
  createdAt: string;
}

export interface Mosaic {
  id: string;
  /** 데이터 스키마 버전 (2부터 기록) */
  schemaVersion?: number;
  /** 최대 20자, 선택 */
  title?: string;
  frame: 'circle' | 'rounded' | 'none';
  pieces: Piece[];
  /** 4단계에서 고른 돌봄. 완료 여부는 추적하지 않는다. */
  careChoice?: { cardId: string; customText?: string };
  createdAt: string;
  updatedAt: string;
}

/** 조각을 만들 때 사용자가 고르는 값 */
export interface PieceDraft {
  kind: PieceKind;
  seed: number;
  presetIndex: PresetIndex;
  size: PieceSize;
  color: string;
  texture: TextureKey;
  note?: string;
  keywords?: string[];
}

export const PIECE_KINDS: PieceKind[] = ['joy', 'failure', 'wound', 'helped', 'unnamed'];
export const TEXTURES: TextureKey[] = ['ceramic', 'stone', 'glass', 'fabric', 'paper'];
export const KEYWORDS = ['가족', '일', '몸', '관계', '나 자신'] as const;
export const MAX_TITLE_LENGTH = 20;
export const MAX_CUSTOM_CARE_LENGTH = 30;
export const SCHEMA_VERSION = 2;
export const PIECE_SIZES: PieceSize[] = ['S', 'M', 'L'];
export const MAX_PIECES = 60;
export const MAX_NOTE_LENGTH = 60;
export const MAX_HISTORY = 30;
