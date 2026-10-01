import type Konva from 'konva';

/**
 * 지금 화면에 떠 있는 모자이크 Stage.
 * 썸네일과 이미지 저장에서 쓴다. 한 번에 하나의 캔버스만 보인다.
 */
let current: Konva.Stage | null = null;

export function registerStage(stage: Konva.Stage | null) {
  current = stage;
}

export function getStage(): Konva.Stage | null {
  return current;
}

/**
 * 조각만 담은 이미지를 만든다. 선택 핸들은 감추고, 줄눈 배경색을 깐다.
 * 메모·키워드·유형 같은 정보는 픽셀에 들어가지 않는다.
 */
export function snapshot(pixelRatio: number, background: string): HTMLCanvasElement | null {
  const stage = current;
  if (!stage || stage.width() === 0 || stage.height() === 0) return null;
  const transformers = stage.find('Transformer');
  transformers.forEach((t) => t.visible(false));
  try {
    const pieces = stage.toCanvas({ pixelRatio });
    const out = document.createElement('canvas');
    out.width = pieces.width;
    out.height = pieces.height;
    const ctx = out.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(pieces, 0, 0);
    return out;
  } finally {
    transformers.forEach((t) => t.visible(true));
  }
}

/** CSS 변수에 정의된 줄눈 색 */
export function groutColor(): string {
  if (typeof window === 'undefined') return '#e8dfd0';
  return getComputedStyle(document.documentElement).getPropertyValue('--grout').trim() || '#e8dfd0';
}
