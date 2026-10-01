'use client';

import { useMemo } from 'react';
import { generatePieceShape, toPairs } from '@/domain/pieceShape';
import { PALETTES } from '@/domain/palette';
import type { PieceKind, PieceSize, PresetIndex } from '@/domain/types';

export interface ClusterPiece {
  kind: PieceKind;
  seed: number;
  preset?: PresetIndex;
  size?: PieceSize;
  colorIndex?: number;
  x: number;
  y: number;
  rotation?: number;
  opacity?: number;
}

interface Props {
  pieces: ClusterPiece[];
  width: number;
  height: number;
  label?: string;
}

const pts = (flat: number[]) => toPairs(flat).map(([x, y]) => `${x},${y}`).join(' ');

/** 실제 조각 생성기로 그린 일러스트(SVG). 스토리와 랜딩에서 쓴다. */
export default function PieceCluster({ pieces, width, height, label }: Props) {
  const shapes = useMemo(
    () => pieces.map((p) => generatePieceShape(p.kind, p.seed, p.preset ?? 0, p.size ?? 'M')),
    [pieces],
  );
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', margin: '0 auto', overflow: 'visible' }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {pieces.map((p, i) => {
        const s = shapes[i];
        const color = PALETTES[p.kind][p.colorIndex ?? 0];
        return (
          <g
            key={i}
            transform={`translate(${p.x} ${p.y}) rotate(${p.rotation ?? 0})`}
            opacity={p.opacity ?? 1}
          >
            <polygon points={pts(s.points)} fill={color} opacity={p.kind === 'wound' ? 0.88 : 1} />
            {s.cracks.map((c, j) => (
              <polyline key={j} points={pts(c)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} />
            ))}
            {s.seams.map((c, j) => (
              <polyline key={j} points={pts(c)} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.2} strokeDasharray="4 4" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
