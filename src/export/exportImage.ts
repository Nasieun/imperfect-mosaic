import { groutColor, snapshot } from '@/components/canvas/stageRegistry';

/**
 * 모자이크를 PNG로 저장한다.
 * - 픽셀만 담는다. 메모·키워드·유형·제목은 이미지에도 파일 이름에도 넣지 않는다.
 * - 휴대폰에서는 공유 시트(Web Share), 그 밖에서는 파일 다운로드.
 */
export function exportFileName(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `mosaic-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}.png`;
}

export async function exportMosaicPng(): Promise<'shared' | 'downloaded' | 'failed'> {
  const canvas = snapshot(2, groutColor());
  if (!canvas) return 'failed';
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return 'failed';
  const name = exportFileName();

  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const file = typeof File !== 'undefined' ? new File([blob], name, { type: 'image/png' }) : null;
  if (coarse && file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch {
      // 공유를 취소하면 다운로드로 넘어가지 않고 그대로 둔다.
      return 'failed';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}

/**
 * PNG 안의 텍스트 청크(tEXt, iTXt, zTXt) 이름을 돌려준다. 테스트에서 메타데이터가 비어 있는지 확인할 때 쓴다.
 */
export function pngTextChunks(bytes: Uint8Array): string[] {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (sig.some((b, i) => bytes[i] !== b)) throw new Error('PNG가 아니에요');
  const out: string[] = [];
  let i = 8;
  while (i + 8 <= bytes.length) {
    const len = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
    const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
    if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') out.push(type);
    if (type === 'IEND') break;
    i += 12 + (len >>> 0);
  }
  return out;
}
