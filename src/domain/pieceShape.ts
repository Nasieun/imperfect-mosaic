import { Delaunay } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';
import { hashSeed, mulberry32 } from './rng';
import { SIZE_RADIUS } from './palette';
import type { PieceKind, PieceSize, PresetIndex } from './types';

type Pt = [number, number];

export interface PieceShape {
  /** 조각 외곽선. 중심(0,0) 기준 평탄화된 [x0, y0, x1, y1, ...] */
  points: number[];
  /** 상처 조각의 금. 메우지 않고 질감의 일부로 그린다. */
  cracks: number[][];
  /** 도움받은 순간 조각의 맞물린 이음매 */
  seams: number[][];
  radius: number;
}

/**
 * 조각 모양을 절차적으로 만든다.
 * 같은 (kind, seed, presetIndex, size)는 항상 같은 결과를 돌려준다.
 * 모든 외곽선은 중심에 대해 별 모양(star-shaped)이라 자기교차가 생기지 않는다.
 */
export function generatePieceShape(
  kind: PieceKind,
  seed: number,
  presetIndex: PresetIndex,
  size: PieceSize,
): PieceShape {
  const rand = mulberry32(hashSeed(kind, seed, presetIndex));
  const noise = createNoise2D(mulberry32(hashSeed('noise', seed, presetIndex)));
  const R = SIZE_RADIUS[size];

  let outline: Pt[];
  let cracks: Pt[][] = [];
  let seams: Pt[][] = [];
  let jitter = 0.04;

  switch (kind) {
    case 'joy':
      outline = chaikin(chaikin(radialPolygon(rand, 7 + presetIndex, 0.82, 1, 0.12)));
      jitter = 0.025;
      break;
    case 'failure':
      outline = subdivide(cutCornerQuad(rand), 5);
      jitter = 0.035;
      break;
    case 'wound': {
      const shard = radialPolygon(rand, 5 + presetIndex, 0.5, 1, 0.22);
      outline = subdivide(shard, 2);
      cracks = makeCracks(rand, shard, 1 + Math.floor(rand() * 3));
      jitter = 0.015;
      break;
    }
    case 'helped': {
      const res = twoLobes(rand);
      outline = res.outline;
      seams = [res.seam];
      jitter = 0.03;
      break;
    }
    case 'unnamed':
    default:
      outline = subdivide(voronoiCell(rand, 5 + presetIndex * 2), 3);
      jitter = 0.05;
      break;
  }

  // 가장자리의 미세한 흔들림: 반지름 방향으로만 움직여 별 모양을 유지한다.
  outline = outline.map(([x, y]) => {
    const n = noise(x * 2.3, y * 2.3);
    const k = 1 + n * jitter;
    return [x * k, y * k] as Pt;
  });

  // 가장 먼 점이 1이 되도록 정규화한 뒤 크기 반지름을 곱한다.
  const maxR = Math.max(...outline.map(([x, y]) => Math.hypot(x, y)));
  const scale = R / maxR;
  const toFlat = (pts: Pt[]) => pts.flatMap(([x, y]) => [round(x * scale), round(y * scale)]);

  return {
    points: toFlat(outline),
    cracks: cracks.map(toFlat),
    seams: seams.map(toFlat),
    radius: R,
  };
}

const round = (v: number) => Math.round(v * 100) / 100;

/** 각도 순서대로 꼭짓점을 놓은 다각형. 각 간격이 180° 미만이라 중심에 대해 별 모양이다. */
function radialPolygon(rand: () => number, n: number, rMin: number, rMax: number, angleJitter: number): Pt[] {
  const start = rand() * Math.PI * 2;
  const step = (Math.PI * 2) / n;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = start + i * step + (rand() - 0.5) * step * angleJitter * 2;
    const r = rMin + rand() * (rMax - rMin);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

/** Chaikin 모서리 깎기: 모서리를 둥글게 만든다. */
function chaikin(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    out.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1]);
    out.push([0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
  }
  return out;
}

/** 각 변을 n등분해 점을 늘린다(노이즈를 줄 자리). */
function subdivide(pts: Pt[], n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
    }
  }
  return out;
}

/** 비대칭 사각형에서 한 모서리가 떨어져 나간 형태 */
function cutCornerQuad(rand: () => number): Pt[] {
  const base = rand() * 0.4;
  const corners: Pt[] = [0, 1, 2, 3].map((i) => {
    const a = base + Math.PI / 4 + (i * Math.PI) / 2 + (rand() - 0.5) * 0.4;
    const r = 0.78 + rand() * 0.22;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  const cut = Math.floor(rand() * 4);
  const prev = corners[(cut + 3) % 4];
  const cur = corners[cut];
  const next = corners[(cut + 1) % 4];
  const t1 = 0.3 + rand() * 0.15;
  const t2 = 0.3 + rand() * 0.15;
  const a: Pt = [cur[0] + (prev[0] - cur[0]) * t1, cur[1] + (prev[1] - cur[1]) * t1];
  const b: Pt = [cur[0] + (next[0] - cur[0]) * t2, cur[1] + (next[1] - cur[1]) * t2];
  const out: Pt[] = [];
  corners.forEach((c, i) => {
    if (i === cut) out.push(a, b);
    else out.push(c);
  });
  return out;
}

/** 꼭짓점에서 안쪽으로 뻗는 금 */
function makeCracks(rand: () => number, shard: Pt[], count: number): Pt[][] {
  const cracks: Pt[][] = [];
  for (let c = 0; c < count; c++) {
    const [sx, sy] = shard[Math.floor(rand() * shard.length)];
    const depth = 0.4 + rand() * 0.35;
    const line: Pt[] = [[sx * 0.97, sy * 0.97]];
    const steps = 3;
    for (let s = 1; s <= steps; s++) {
      const t = 1 - (depth * s) / steps;
      const wobble = (rand() - 0.5) * 0.18;
      line.push([sx * t - sy * wobble, sy * t + sx * wobble]);
    }
    cracks.push(line);
  }
  return cracks;
}

/** 두 원이 일부 겹친 합성 형태. 중심에서 쏜 광선과 두 원의 교점 중 먼 쪽을 택한다. */
function twoLobes(rand: () => number): { outline: Pt[]; seam: Pt[] } {
  const tilt = rand() * Math.PI;
  const c = 0.3 + rand() * 0.08;
  const r1 = 0.62 + rand() * 0.08;
  const r2 = 0.56 + rand() * 0.12;
  const centers: [Pt, number][] = [
    [[Math.cos(tilt) * c, Math.sin(tilt) * c], r1],
    [[-Math.cos(tilt) * c, -Math.sin(tilt) * c], r2],
  ];
  const n = 40;
  const outline: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    let best = 0;
    for (const [[cx, cy], r] of centers) {
      const b = ux * cx + uy * cy;
      const disc = b * b - (cx * cx + cy * cy) + r * r;
      if (disc >= 0) best = Math.max(best, b + Math.sqrt(disc));
    }
    outline.push([ux * best, uy * best]);
  }
  // 두 원의 교점을 잇는 이음매
  const d = 2 * c;
  const fromFirst = (d * d + r1 * r1 - r2 * r2) / (2 * d); // 첫 원 중심에서 두 교점을 잇는 선까지
  const x = c - fromFirst; // 축 위 위치(조각 중심 기준)
  const h = Math.sqrt(Math.max(0, r1 * r1 - fromFirst * fromFirst)) * 0.85;
  const ax = Math.cos(tilt);
  const ay = Math.sin(tilt);
  // 축 방향 (ax, ay) 위의 점 x 를 기준으로 수직 방향 ±h
  const seam: Pt[] = [
    [ax * x - ay * h, ay * x + ax * h],
    [ax * x + ay * h, ay * x - ax * h],
  ];
  return { outline, seam };
}

/** 중심을 둘러싼 무작위 사이트들로 만든 보로노이 셀 */
function voronoiCell(rand: () => number, neighbours: number): Pt[] {
  const sites: Pt[] = [[0, 0]];
  const start = rand() * Math.PI * 2;
  for (let i = 0; i < neighbours; i++) {
    const a = start + (i / neighbours) * Math.PI * 2 + (rand() - 0.5) * 0.6;
    const d = 1.1 + rand() * 0.9;
    sites.push([Math.cos(a) * d, Math.sin(a) * d]);
  }
  const voronoi = Delaunay.from(sites).voronoi([-2, -2, 2, 2]);
  const cell = voronoi.cellPolygon(0) as Pt[];
  const pts = cell.slice(0, -1).map(([x, y]) => [x, y] as Pt);
  // 각도 순으로 정렬해 방향을 통일한다.
  return pts.sort((p, q) => Math.atan2(p[1], p[0]) - Math.atan2(q[1], q[0]));
}

/** 미리보기·테스트용: 평탄화된 점 배열을 [x, y] 쌍으로 */
export function toPairs(flat: number[]): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < flat.length; i += 2) out.push([flat[i], flat[i + 1]]);
  return out;
}
