import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { DB_NAME, closeDb, getMosaic, getThumbnails, saveThumbnail } from '@/db/db';
import { migrateMosaicToV2 } from '@/db/migrations';
import type { Mosaic } from '@/domain/types';

// STEP 02 시절 저장 형태 (schemaVersion, keywords, aged 없음)
const v1Mosaic = {
  id: 'old-1',
  frame: 'none',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  careChoice: { cardId: 'water' },
  pieces: [
    {
      id: 'p1',
      kind: 'helped',
      seed: 5,
      presetIndex: 1,
      size: 'S',
      color: '#94AE92',
      texture: 'fabric',
      x: 0.3,
      y: 0.7,
      rotation: 33,
      z: 1,
      state: 'placed',
      note: '그날의 따뜻한 말',
      createdAt: '2026-09-01T00:00:00.000Z',
    },
  ],
} as unknown as Mosaic;

describe('스키마 v1 → v2 마이그레이션', () => {
  afterEach(async () => {
    closeDb();
    await Dexie.delete(DB_NAME);
  });

  it('순수 함수: 기본값만 채우고 사용자 데이터는 그대로 둔다', () => {
    const m = migrateMosaicToV2(v1Mosaic);
    expect(m.schemaVersion).toBe(2);
    expect(m.pieces[0]).toMatchObject({ x: 0.3, y: 0.7, rotation: 33, note: '그날의 따뜻한 말', keywords: [], aged: false });
    expect(m.careChoice).toEqual({ cardId: 'water' });
    // 이미 v2면 그대로
    expect(migrateMosaicToV2(m)).toBe(m);
  });

  it('IndexedDB: v1으로 저장된 데이터를 열면 v2로 옮겨지고 썸네일 테이블이 생긴다', async () => {
    const old = new Dexie(DB_NAME);
    old.version(1).stores({ mosaics: 'id, updatedAt' });
    await old.table('mosaics').put(v1Mosaic);
    old.close();

    const migrated = await getMosaic('old-1');
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.pieces[0].keywords).toEqual([]);
    expect(migrated?.pieces[0].aged).toBe(false);
    expect(migrated?.pieces[0].note).toBe('그날의 따뜻한 말');

    await saveThumbnail('old-1', 'data:image/png;base64,AAAA');
    expect(await getThumbnails()).toEqual({ 'old-1': 'data:image/png;base64,AAAA' });
  });
});
