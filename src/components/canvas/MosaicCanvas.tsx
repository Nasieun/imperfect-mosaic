'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Layer, Rect, Stage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { pieceLanded } from '@/audio/feedback';
import { useMosaicStore } from '@/store/mosaicStore';
import { useSimpleTextures } from '@/store/settingsStore';
import { registerStage } from './stageRegistry';
import { getGroutTexture } from './textures';
import { COPY, KIND_LABEL, SIZE_SPOKEN, describePiece, describeWhere } from '@/content/copy';
import PieceNode from './PieceNode';
import ui from '../ui.module.css';
import styles from './MosaicCanvas.module.css';

interface Props {
  /** 바라보기 모드: 편집 UI와 드래그를 끈다 */
  readOnly?: boolean;
  onPieceTap?: (id: string) => void;
  onDeleted?: () => void;
  /** 바라보기의 멀리서/가까이 보기. 캔버스 가운데를 기준으로 확대·축소한다. */
  zoom?: number;
  /** 이 조각만 밝게, 나머지는 잠시 옅게 */
  highlightId?: string | null;
}

const ROTATE_STEP = 15;

export default function MosaicCanvas({ readOnly = false, onPieceTap, onDeleted, zoom = 1, highlightId = null }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const nodes = useRef(new Map<string, Konva.Group>());
  const trRef = useRef<Konva.Transformer>(null);
  const [note, setNote] = useState<{ text: string; x: number; y: number } | null>(null);

  const pieces = useMosaicStore((s) => s.mosaic.pieces);
  const frame = useMosaicStore((s) => s.mosaic.frame);
  const simple = useSimpleTextures();
  const stageRef = useRef<Konva.Stage>(null);
  const grout = useMemo(() => getGroutTexture(), []);
  const selectedId = useMosaicStore((s) => s.selectedId);
  const select = useMosaicStore((s) => s.select);
  const movePiece = useMosaicStore((s) => s.movePiece);
  const rotatePiece = useMosaicStore((s) => s.rotatePiece);
  const nudgePiece = useMosaicStore((s) => s.nudgePiece);
  const rotateBy = useMosaicStore((s) => s.rotateBy);
  const deletePiece = useMosaicStore((s) => s.deletePiece);
  const bringToFront = useMosaicStore((s) => s.bringToFront);

  const onCanvas = useMemo(
    () => pieces.filter((p) => p.state !== 'stored').sort((a, b) => a.z - b.z),
    [pieces],
  );

  // 컨테이너 크기에 맞춰 Stage 크기를 바꾼다.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(1.2, Math.max(0.6, Math.min(size.w, size.h) / 640));

  useEffect(() => {
    if (size.w === 0) return;
    registerStage(stageRef.current);
    return () => registerStage(null);
  }, [size.w]);

  /** 조각을 놓으면 위치를 저장하고, 설정에 따라 소리·진동을 낸다 */
  const handleMove = useCallback(
    (id: string, x: number, y: number) => {
      movePiece(id, x, y);
      const piece = useMosaicStore.getState().mosaic.pieces.find((p) => p.id === id);
      if (piece) pieceLanded(piece.kind);
    },
    [movePiece],
  );

  // 선택한 조각에 회전 핸들을 붙인다.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId && !readOnly ? nodes.current.get(selectedId) : undefined;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, readOnly, onCanvas, size]);

  const register = useCallback((id: string, node: Konva.Group | null) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      if (readOnly) {
        onPieceTap?.(id);
        return;
      }
      select(id);
    },
    [readOnly, onPieceTap, select],
  );

  const handleDragStart = useCallback(
    (id: string) => {
      select(id);
      bringToFront(id);
      setNote(null);
    },
    [select, bringToFront],
  );

  const handleLongPress = useCallback(
    (id: string) => {
      const piece = useMosaicStore.getState().mosaic.pieces.find((p) => p.id === id);
      const node = nodes.current.get(id);
      const text = [piece?.note, piece?.keywords?.length ? piece.keywords.join(' · ') : '']
        .filter(Boolean)
        .join('\n');
      if (!text || !node) return;
      setNote({ text, x: node.x() * zoom + (size.w / 2) * (1 - zoom), y: node.y() * zoom + (size.h / 2) * (1 - zoom) });
    },
    [zoom, size],
  );

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 3000);
    return () => window.clearTimeout(t);
  }, [note]);

  // 두 손가락 회전
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || readOnly) return;
    let start: { angle: number; rotation: number; id: string } | null = null;
    const angleOf = (t: TouchList) =>
      (Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX) * 180) / Math.PI;

    const onStart = (e: TouchEvent) => {
      const id = useMosaicStore.getState().selectedId;
      if (e.touches.length !== 2 || !id) return;
      const node = nodes.current.get(id);
      if (!node) return;
      node.stopDrag();
      start = { angle: angleOf(e.touches), rotation: node.rotation(), id };
    };
    const onMove = (e: TouchEvent) => {
      if (!start || e.touches.length !== 2) return;
      e.preventDefault();
      const node = nodes.current.get(start.id);
      node?.rotation(start.rotation + angleOf(e.touches) - start.angle);
      node?.getLayer()?.batchDraw();
    };
    const onEnd = () => {
      if (!start) return;
      const node = nodes.current.get(start.id);
      if (node) rotatePiece(start.id, Math.round(node.rotation()));
      start = null;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [readOnly, rotatePiece]);

  // 키보드 조작: Tab 선택, 방향키 이동, Q/E 회전, Delete 지우기
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    const order = onCanvas.map((p) => p.id);
    const idx = selectedId ? order.indexOf(selectedId) : -1;

    if (e.key === 'Tab') {
      if (!order.length) return;
      const next = e.shiftKey ? (idx === -1 ? order.length - 1 : idx - 1) : idx + 1;
      if (next < 0 || next >= order.length) {
        // 끝에 닿으면 선택을 풀고 포커스를 다음 요소로 보낸다(포커스 갇힘 방지).
        select(null);
        return;
      }
      e.preventDefault();
      select(order[next]);
      return;
    }
    if (e.key === 'Escape') {
      select(null);
      return;
    }
    if (!selectedId) return;
    const step = e.shiftKey ? 0.1 : 0.01;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      nudgePiece(selectedId, moves[e.key][0], moves[e.key][1]);
    } else if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      rotateBy(selectedId, -ROTATE_STEP);
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      rotateBy(selectedId, ROTATE_STEP);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deletePiece(selectedId);
      onDeleted?.();
    }
  };

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      tabIndex={0}
      role="application"
      aria-label={readOnly ? undefined : COPY.canvasLabel}
      aria-roledescription="캔버스"
      onKeyDown={onKeyDown}
      data-testid="mosaic-canvas"
    >
      {size.w > 0 && (
        <Stage
          ref={stageRef}
          width={size.w}
          height={size.h}
          scaleX={zoom}
          scaleY={zoom}
          x={(size.w / 2) * (1 - zoom)}
          y={(size.h / 2) * (1 - zoom)}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) select(null);
          }}
          onTouchStart={(e) => {
            if (e.target === e.target.getStage()) select(null);
          }}
        >
          <Layer listening={false}>
            {/* 줄눈 질감: 확대·축소와 상관없이 화면 전체를 덮는다 */}
            {grout && (
              <Rect
                x={-size.w}
                y={-size.h}
                width={size.w * 3}
                height={size.h * 3}
                fillPatternImage={grout as unknown as HTMLImageElement}
                fillPatternRepeat="repeat"
              />
            )}
            {/* 틀은 안내선일 뿐, 밖에 놓인 조각도 잘라내지 않는다 */}
            {frame === 'circle' && (
              <Circle
                x={size.w / 2}
                y={size.h / 2}
                radius={Math.min(size.w, size.h) * 0.44}
                stroke="#9C8B76"
                strokeWidth={1.5}
                dash={[6, 6]}
                opacity={0.7}
              />
            )}
            {frame === 'rounded' && (
              <Rect
                x={size.w * 0.06}
                y={size.h * 0.07}
                width={size.w * 0.88}
                height={size.h * 0.86}
                cornerRadius={Math.min(size.w, size.h) * 0.08}
                stroke="#9C8B76"
                strokeWidth={1.5}
                dash={[6, 6]}
                opacity={0.7}
              />
            )}
          </Layer>
          <Layer>
            {onCanvas.map((p) => (
              <PieceNode
                key={p.id}
                piece={p}
                width={size.w}
                height={size.h}
                scale={scale}
                draggable={!readOnly}
                simple={simple}
                dimmed={Boolean(highlightId) && highlightId !== p.id}
                register={register}
                onSelect={handleSelect}
                onDragStart={handleDragStart}
                onMove={handleMove}
                onLongPress={handleLongPress}
              />
            ))}
            {!readOnly && (
              <Transformer
                ref={trRef}
                resizeEnabled={false}
                rotateEnabled
                enabledAnchors={[]}
                rotationSnaps={[]}
                rotateAnchorOffset={22}
                rotateAnchorCursor="grab"
                anchorSize={14}
                anchorCornerRadius={7}
                anchorStroke="#5B7DB1"
                anchorFill="#FFFCF6"
                borderStroke="#5B7DB1"
                borderDash={[4, 4]}
                padding={6}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const id = selectedId;
                  if (id) rotatePiece(id, Math.round(node.rotation()));
                }}
              />
            )}
          </Layer>
        </Stage>
      )}
      {/* 스크린리더용 조각 목록: 캔버스 속 조각을 상대 위치로 읽어 주고 고를 수 있게 한다. */}
      <ul className={ui.srOnly} aria-label="조각 목록">
        {onCanvas.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              tabIndex={-1}
              data-piece-id={p.id}
              aria-pressed={readOnly ? highlightId === p.id : selectedId === p.id}
              onClick={() => handleSelect(p.id)}
            >
              {describePiece(KIND_LABEL[p.kind], SIZE_SPOKEN[p.size], describeWhere(p.x, p.y), p.rotation)}
            </button>
          </li>
        ))}
      </ul>
      {note && (
        <div className={styles.note} style={{ left: note.x, top: note.y }} role="status">
          {note.text}
        </div>
      )}
    </div>
  );
}
