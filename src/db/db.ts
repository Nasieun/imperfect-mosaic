import Dexie, { type Table } from 'dexie';
import { SCHEMA_VERSION, type Mosaic } from '@/domain/types';
import { migrateMosaicToV2 } from './migrations';

interface Thumbnail {
  id: string;
  dataUrl: string;
}

export const DB_NAME = 'imperfect-mosaic';

class MosaicDB extends Dexie {
  mosaics!: Table<Mosaic, string>;
  thumbs!: Table<Thumbnail, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({ mosaics: 'id, updatedAt' });
    // v2: 썸네일 테이블 추가, 조각 필드 기본값 채우기
    this.version(2)
      .stores({ mosaics: 'id, updatedAt, createdAt', thumbs: 'id' })
      .upgrade((tx) =>
        tx
          .table('mosaics')
          .toCollection()
          .modify((m: Mosaic) => {
            Object.assign(m, migrateMosaicToV2(m));
          }),
      );
  }
}

let instance: MosaicDB | null = null;
const db = () => (instance ??= new MosaicDB());

/** 테스트용: 열린 연결을 닫아 다음 호출에서 새로 연다 */
export function closeDb() {
  instance?.close();
  instance = null;
}

export async function saveMosaic(mosaic: Mosaic): Promise<void> {
  await db().mosaics.put({ ...mosaic, schemaVersion: SCHEMA_VERSION });
}

export async function getMosaic(id: string): Promise<Mosaic | undefined> {
  return db().mosaics.get(id);
}

export async function loadLatestMosaic(): Promise<Mosaic | undefined> {
  return db().mosaics.orderBy('updatedAt').last();
}

/** 날짜순(최근 수정 먼저). 비교나 변화 그래프는 만들지 않는다. */
export async function listMosaics(): Promise<Mosaic[]> {
  return (await db().mosaics.orderBy('updatedAt').reverse().toArray()).filter((m) => m.pieces.length > 0);
}

export async function deleteMosaic(id: string): Promise<void> {
  await db().transaction('rw', db().mosaics, db().thumbs, async () => {
    await db().mosaics.delete(id);
    await db().thumbs.delete(id);
  });
}

export async function clearAllMosaics(): Promise<void> {
  await db().transaction('rw', db().mosaics, db().thumbs, async () => {
    await db().mosaics.clear();
    await db().thumbs.clear();
  });
}

export async function saveThumbnail(id: string, dataUrl: string): Promise<void> {
  await db().thumbs.put({ id, dataUrl });
}

export async function getThumbnails(): Promise<Record<string, string>> {
  const all = await db().thumbs.toArray();
  return Object.fromEntries(all.map((t) => [t.id, t.dataUrl]));
}
