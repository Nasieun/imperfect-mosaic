'use client';

import { memo, useMemo, useRef } from 'react';
import { Group, Line } from 'react-konva';
import type Konva from 'konva';
import { generatePieceShape } from '@/domain/pieceShape';
import type { Piece } from '@/domain/types';
import { getTexture } from './textures';

interface Props {
  piece: Piece;
  width: number;
  height: number;
  scale: number;
  draggable: boolean;
  dimmed?: boolean;
  /** 저사양 모드: 그림자·질감 생략 */
  simple?: boolean;
  register: (id: string, node: Konva.Group | null) => void;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onLongPress: (id: string) => void;
}

const LONG_PRESS_MS = 550;

function PieceNode({ piece, width, height, scale, draggable, dimmed = false, simple = false, register, onSelect, onDragStart, onMove, onLongPress }: Props) {
  const shape = useMemo(
    () => generatePieceShape(piece.kind, piece.seed, piece.presetIndex, piece.size),
    [piece.kind, piece.seed, piece.presetIndex, piece.size],
  );
  const texture = useMemo(() => (simple ? undefined : getTexture(piece.texture)), [piece.texture, simple]);
  const pressTimer = useRef<number | null>(null);

  const clearPress = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const hidden = piece.state === 'hidden';
  const opacity = (hidden ? 0.5 : piece.state === 'faded' ? 0.38 : 1) * (dimmed ? 0.3 : 1);
  const baseOpacity = piece.texture === 'glass' ? 0.86 : 1;
  const highlight = piece.texture === 'ceramic' ? 0.3 : 0.16;
  const r = shape.radius;

  return (
    <Group
      ref={(node) => register(piece.id, node)}
      name="piece"
      x={piece.x * width}
      y={piece.y * height}
      rotation={piece.rotation}
      scaleX={scale}
      scaleY={scale}
      opacity={opacity}
      draggable={draggable}
      // 화면 밖으로 사라지지 않도록 중심만 캔버스 안에 둔다. 스냅이나 정렬은 없다.
      dragBoundFunc={(pos) => ({
        x: Math.min(width, Math.max(0, pos.x)),
        y: Math.min(height, Math.max(0, pos.y)),
      })}
      onMouseDown={() => onSelect(piece.id)}
      onTouchStart={() => onSelect(piece.id)}
      onPointerDown={() => {
        clearPress();
        pressTimer.current = window.setTimeout(() => onLongPress(piece.id), LONG_PRESS_MS);
      }}
      onPointerUp={clearPress}
      onPointerLeave={clearPress}
      onDragStart={() => {
        clearPress();
        onDragStart(piece.id);
      }}
      onDragEnd={(e) => onMove(piece.id, e.target.x() / width, e.target.y() / height)}
    >
      {hidden ? (
        // 숨긴 조각은 점선 윤곽만 남겨 다시 고를 수 있게 한다.
        <Line points={shape.points} closed fill="rgba(255,255,255,0.04)" stroke="#8A8178" strokeWidth={1.5} dash={[5, 5]} />
      ) : (
        <>
          <Line
            points={shape.points}
            closed
            fill={piece.color}
            opacity={baseOpacity}
            shadowColor="#2B2118"
            shadowEnabled={!simple}
            shadowBlur={6}
            shadowOffsetX={1}
            shadowOffsetY={3}
            shadowOpacity={0.22}
            perfectDrawEnabled={false}
          />
          {texture && (
            <Line
              points={shape.points}
              closed
              fillPatternImage={texture as unknown as HTMLImageElement}
              fillPatternRepeat="repeat"
              listening={false}
              perfectDrawEnabled={false}
            />
          )}
          {/* 은은한 입체감: 위쪽에서 들어오는 빛 */}
          <Line
            points={shape.points}
            closed
            fillLinearGradientStartPoint={{ x: -r, y: -r }}
            fillLinearGradientEndPoint={{ x: r * 0.6, y: r * 0.8 }}
            fillLinearGradientColorStops={[0, `rgba(255,255,255,${highlight})`, 0.6, 'rgba(255,255,255,0)', 1, 'rgba(0,0,0,0.08)']}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={1}
            listening={false}
            perfectDrawEnabled={false}
          />
          {/* 재방문 시 고른 경우에만: 빛이 바랜 듯한 오래된 톤 */}
          {piece.aged && (
            <Line points={shape.points} closed fill="rgba(176,156,128,0.38)" listening={false} perfectDrawEnabled={false} />
          )}
          {shape.cracks.map((c, i) => (
            <Line key={`c${i}`} points={c} stroke="rgba(255,255,255,0.62)" strokeWidth={1.3} lineJoin="round" listening={false} />
          ))}
          {shape.seams.map((s, i) => (
            <Line key={`s${i}`} points={s} stroke="rgba(255,255,255,0.75)" strokeWidth={1.4} dash={[4, 4]} listening={false} />
          ))}
        </>
      )}
    </Group>
  );
}

export default memo(PieceNode);
