import type { PieceKind, PieceSize, TextureKey } from './types';

/**
 * 유형별 팔레트 6색.
 * 어떤 유형도 더 밝거나 더 예뻐 보이지 않도록 명도·채도 범위를 비슷하게 맞췄다.
 */
export const PALETTES: Record<PieceKind, string[]> = {
  joy: ['#D9A95A', '#DE9C76', '#D58A7E', '#CFA060', '#DDA98A', '#C49C55'],
  failure: ['#9A978F', '#A08369', '#98976C', '#8D959C', '#A28F7E', '#8E8C77'],
  wound: ['#7180AE', '#8C72A8', '#A2697F', '#7E73AC', '#9C6690', '#7290B4'],
  helped: ['#94AE92', '#8EAFC9', '#CFC3A2', '#A0BC9D', '#97B8D0', '#C6BB98'],
  unnamed: ['#ADA8A0', '#A3A3A3', '#B8B1A6', '#9CA3A3', '#B3A99C', '#A69F96'],
};

export const DEFAULT_TEXTURE: Record<PieceKind, TextureKey> = {
  joy: 'ceramic',
  failure: 'stone',
  wound: 'glass',
  helped: 'fabric',
  unnamed: 'paper',
};

/** 크기별 기준 반지름(px) */
export const SIZE_RADIUS: Record<PieceSize, number> = { S: 36, M: 56, L: 80 };
