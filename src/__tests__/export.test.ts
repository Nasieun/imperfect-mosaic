import { describe, expect, it } from 'vitest';
import { exportFileName, pngTextChunks } from '@/export/exportImage';

// 1×1 PNG에 tEXt 청크를 붙이거나 빼서 검사기를 확인한다.
function crc32(bytes: Uint8Array): number {
  let c = ~0;
  for (const b of bytes) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

function png(extra: Uint8Array[] = []): Uint8Array {
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk('IHDR', new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]));
  const idat = chunk('IDAT', new Uint8Array([120, 156, 99, 0, 1, 0, 0, 5, 0, 1]));
  const iend = chunk('IEND', new Uint8Array());
  const parts = [sig, ihdr, ...extra, idat, iend];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

describe('이미지 저장', () => {
  it('파일 이름에는 날짜만 들어간다 (제목·메모 없음)', () => {
    expect(exportFileName(new Date(2026, 9, 1))).toBe('mosaic-2026-10-01.png');
  });

  it('텍스트 메타데이터 청크를 찾아낸다', () => {
    expect(pngTextChunks(png())).toEqual([]);
    const text = new TextEncoder().encode('Comment\0memo');
    expect(pngTextChunks(png([chunk('tEXt', text)]))).toEqual(['tEXt']);
  });

  it('PNG가 아니면 알려 준다', () => {
    expect(() => pngTextChunks(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toThrow();
  });
});
