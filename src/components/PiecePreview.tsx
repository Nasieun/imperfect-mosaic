'use client';

import { useMemo } from 'react';
import { generatePieceShape, toPairs } from '@/domain/pieceShape';
import type { PieceKind, PieceSize, PresetIndex } from '@/domain/types';

interface Props {
  kind: PieceKind;
  seed: number;
  presetIndex: PresetIndex;
  size?: PieceSize;
  color: string;
  /** 렌더 크기(px) */
  box?: number;
  faded?: boolean;
}

const pts = (flat: number[]) => toPairs(flat).map(([x, y]) => `${x},${y}`).join(' ');

/** 만들기 시트와 보관함에서 쓰는 조각 미리보기(SVG) */
export default function PiecePreview({ kind, seed, presetIndex, size = 'M', color, box = 56, faded }: Props) {
  const shape = useMemo(() => generatePieceShape(kind, seed, presetIndex, size), [kind, seed, presetIndex, size]);
  const r = shape.radius * 1.08;
  return (
    <svg
      width={box}
      height={box}
      viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}
      aria-hidden="true"
      style={{ opacity: faded ? 0.45 : 1, overflow: 'visible' }}
    >
      <polygon points={pts(shape.points)} fill={color} opacity={kind === 'wound' ? 0.88 : 1} />
      {shape.cracks.map((c, i) => (
        <polyline key={`c${i}`} points={pts(c)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={r / 40} />
      ))}
      {shape.seams.map((s, i) => (
        <polyline
          key={`s${i}`}
          points={pts(s)}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={r / 40}
          strokeDasharray={`${r / 14} ${r / 14}`}
        />
      ))}
    </svg>
  );
}
