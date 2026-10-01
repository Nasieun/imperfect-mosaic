'use client';

import PieceCluster, { type ClusterPiece } from './PieceCluster';
import PiecePreview from '../PiecePreview';
import { KIND_LABEL } from '@/content/copy';
import { PALETTES } from '@/domain/palette';
import type { PieceKind } from '@/domain/types';
import styles from './journey.module.css';

/** ① 깨진 그릇: 그릇 모양이 몇 조각으로 갈라져 조금씩 벌어져 있다. */
export function BrokenBowl() {
  const shards = [
    { d: 'M40 70 H120 L112 112 Q100 150 70 150 Z', dx: -8, dy: 2, r: -4 },
    { d: 'M120 70 H190 L178 120 L112 112 Z', dx: 0, dy: -6, r: 2 },
    { d: 'M190 70 H280 L250 140 Q236 152 214 150 L178 120 Z', dx: 9, dy: 0, r: 5 },
    { d: 'M112 112 L178 120 L214 150 Q160 168 70 150 Q100 150 112 112 Z', dx: 2, dy: 10, r: -2 },
  ];
  return (
    <svg viewBox="0 0 320 200" width="100%" style={{ maxWidth: 320 }} aria-hidden="true">
      {shards.map((s, i) => (
        <path
          key={i}
          d={s.d}
          transform={`translate(${s.dx} ${s.dy}) rotate(${s.r} 160 110)`}
          fill={['#C9B79F', '#BFAF98', '#CDBBA4', '#B9A88F'][i]}
          stroke="rgba(0,0,0,0.12)"
        />
      ))}
    </svg>
  );
}

const scatter: ClusterPiece[] = [
  { kind: 'joy', seed: 3, x: 60, y: 60, rotation: 10, size: 'S' },
  { kind: 'wound', seed: 9, x: 170, y: 50, rotation: -20, size: 'S' },
  { kind: 'failure', seed: 4, x: 270, y: 80, rotation: 35, size: 'S' },
  { kind: 'helped', seed: 6, x: 110, y: 150, rotation: -5, size: 'S' },
  { kind: 'unnamed', seed: 2, x: 230, y: 160, rotation: 60, size: 'S' },
];

export function Scatter() {
  return <PieceCluster pieces={scatter} width={330} height={210} />;
}

const KINDS: PieceKind[] = ['joy', 'failure', 'wound', 'helped'];

export function FourKinds() {
  return (
    <ul className={styles.kinds}>
      {KINDS.map((k) => (
        <li key={k}>
          <PiecePreview kind={k} seed={11} presetIndex={1} color={PALETTES[k][0]} box={64} />
          <span>{KIND_LABEL[k]}</span>
        </li>
      ))}
    </ul>
  );
}

// 어긋난 채 모인 조각들: 겹치고, 틈이 있고, 비뚤어져 있다.
const gathered: ClusterPiece[] = [
  { kind: 'joy', seed: 21, x: 130, y: 90, rotation: 12, size: 'M' },
  { kind: 'wound', seed: 5, x: 205, y: 80, rotation: -18, size: 'M', colorIndex: 2 },
  { kind: 'failure', seed: 8, x: 105, y: 165, rotation: 30, size: 'S' },
  { kind: 'helped', seed: 13, x: 190, y: 160, rotation: 4, size: 'M', colorIndex: 1 },
  { kind: 'unnamed', seed: 17, x: 260, y: 135, rotation: -40, size: 'S' },
  { kind: 'joy', seed: 30, x: 60, y: 110, rotation: 70, size: 'S', colorIndex: 1 },
];

export function Gathered() {
  return <PieceCluster pieces={gathered} width={330} height={240} />;
}

const whole: ClusterPiece[] = [
  ...gathered,
  { kind: 'wound', seed: 41, x: 150, y: 30, rotation: 25, size: 'S', colorIndex: 4, opacity: 0.45 },
  { kind: 'helped', seed: 44, x: 275, y: 205, rotation: -12, size: 'S', colorIndex: 2 },
];

export function Whole({ label }: { label?: string }) {
  return <PieceCluster pieces={whole} width={330} height={250} label={label} />;
}

const weatherPaths: Record<number, React.ReactNode> = {
  0: <circle cx="24" cy="24" r="9" fill="currentColor" />,
  1: (
    <>
      <circle cx="18" cy="18" r="7" fill="currentColor" opacity="0.7" />
      <path d="M14 34h20a6 6 0 0 0 0-12 8 8 0 0 0-15 2 5 5 0 0 0-5 10z" fill="currentColor" />
    </>
  ),
  2: <path d="M10 32h26a7 7 0 0 0 0-14 10 10 0 0 0-19 2 6 6 0 0 0-7 12z" fill="currentColor" />,
  3: (
    <>
      <path d="M10 26h26a7 7 0 0 0 0-14 10 10 0 0 0-19 2 6 6 0 0 0-7 12z" fill="currentColor" />
      <path d="M16 31l-2 6M24 31l-2 6M32 31l-2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  4: (
    <>
      <path d="M10 24h26a7 7 0 0 0 0-14 10 10 0 0 0-19 2 6 6 0 0 0-7 12z" fill="currentColor" />
      <path d="M24 27l-5 8h6l-4 8" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function WeatherIcon({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
      {weatherPaths[level]}
    </svg>
  );
}
