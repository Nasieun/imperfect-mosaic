import { SCHEMA_VERSION, type Mosaic, type Piece } from '@/domain/types';

/**
 * STEP 02(스키마 v1) 모자이크를 v2로 옮긴다.
 * - 조각에 keywords / aged 기본값을 채운다.
 * - frame이 없던 데이터는 'none'으로 둔다.
 * 사용자의 위치·각도·메모는 건드리지 않는다.
 */
export function migrateMosaicToV2(m: Mosaic): Mosaic {
  if ((m.schemaVersion ?? 1) >= 2) return m;
  return {
    ...m,
    schemaVersion: SCHEMA_VERSION,
    frame: m.frame ?? 'none',
    pieces: (m.pieces ?? []).map(
      (p): Piece => ({
        ...p,
        keywords: p.keywords ?? [],
        aged: p.aged ?? false,
      }),
    ),
  };
}
