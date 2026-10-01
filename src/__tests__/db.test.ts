import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearAllMosaics, loadLatestMosaic, saveMosaic } from '@/db/db';
import type { Mosaic } from '@/domain/types';

const mosaic = (id: string, updatedAt: string): Mosaic => ({
  id,
  frame: 'none',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt,
  pieces: [
    {
      id: `${id}-p1`,
      kind: 'wound',
      seed: 99,
      presetIndex: 2,
      size: 'L',
      color: '#7180AE',
      texture: 'glass',
      x: 0.123,
      y: 0.456,
      rotation: 211,
      z: 3,
      state: 'faded',
      note: '아직 말하고 싶지 않은 일',
      createdAt: '2026-10-01T00:00:00.000Z',
    },
  ],
});

describe('db', () => {
  beforeEach(async () => clearAllMosaics());

  it('저장한 뒤 불러오면 그대로다', async () => {
    const m = mosaic('a', '2026-10-01T10:00:00.000Z');
    await saveMosaic(m);
    expect(await loadLatestMosaic()).toEqual({ ...m, schemaVersion: 2 });
  });

  it('가장 최근에 수정한 모자이크를 불러온다', async () => {
    await saveMosaic(mosaic('old', '2026-10-01T09:00:00.000Z'));
    await saveMosaic(mosaic('new', '2026-10-01T11:00:00.000Z'));
    expect((await loadLatestMosaic())?.id).toBe('new');
  });

  it('모두 지우면 비어 있다', async () => {
    await saveMosaic(mosaic('a', '2026-10-01T10:00:00.000Z'));
    await clearAllMosaics();
    expect(await loadLatestMosaic()).toBeUndefined();
  });
});
