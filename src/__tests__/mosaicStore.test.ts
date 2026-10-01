import { beforeEach, describe, expect, it } from 'vitest';
import { useMosaicStore } from '@/store/mosaicStore';
import { MAX_HISTORY, MAX_PIECES, type PieceDraft } from '@/domain/types';

const draft: PieceDraft = {
  kind: 'joy',
  seed: 1,
  presetIndex: 0,
  size: 'M',
  color: '#D9A95A',
  texture: 'ceramic',
};

const s = () => useMosaicStore.getState();

describe('mosaicStore', () => {
  beforeEach(() => s().reset());

  it('조각을 만들고 옮기고 돌리고 지운 뒤 되돌리기·다시하기가 정확히 복원된다', () => {
    const p = s().addPiece(draft, { x: 0.2, y: 0.3 })!;
    const afterAdd = s().mosaic.pieces;
    s().movePiece(p.id, 0.7, 0.8);
    const afterMove = s().mosaic.pieces;
    s().rotatePiece(p.id, 135);
    const afterRotate = s().mosaic.pieces;
    s().deletePiece(p.id);
    expect(s().mosaic.pieces).toHaveLength(0);

    s().undo();
    expect(s().mosaic.pieces).toEqual(afterRotate);
    s().undo();
    expect(s().mosaic.pieces).toEqual(afterMove);
    s().undo();
    expect(s().mosaic.pieces).toEqual(afterAdd);
    s().undo();
    expect(s().mosaic.pieces).toEqual([]);
    expect(s().canUndo()).toBe(false);

    s().redo();
    s().redo();
    expect(s().mosaic.pieces).toEqual(afterMove);
    s().redo();
    s().redo();
    expect(s().mosaic.pieces).toHaveLength(0);
    expect(s().canRedo()).toBe(false);
  });

  it('새 작업을 하면 다시하기 기록이 사라진다', () => {
    const p = s().addPiece(draft)!;
    s().movePiece(p.id, 0.1, 0.1);
    s().undo();
    expect(s().canRedo()).toBe(true);
    s().rotatePiece(p.id, 10);
    expect(s().canRedo()).toBe(false);
  });

  it(`히스토리는 최대 ${MAX_HISTORY}단계만 남기고 오래된 것부터 버린다`, () => {
    const p = s().addPiece(draft)!; // 작업 1
    for (let i = 1; i <= 34; i++) s().rotatePiece(p.id, i); // 작업 2..35
    expect(s().past).toHaveLength(MAX_HISTORY);
    for (let i = 0; i < 40; i++) s().undo();
    // 35개 작업 중 30개만 되돌릴 수 있으므로 작업 5 직후 상태(회전 4도)에 멈춘다.
    expect(s().mosaic.pieces[0].rotation).toBe(4);
  });

  it(`조각은 ${MAX_PIECES}개를 넘길 수 없다`, () => {
    for (let i = 0; i < MAX_PIECES; i++) expect(s().addPiece({ ...draft, seed: i })).not.toBeNull();
    expect(s().addPiece(draft)).toBeNull();
    expect(s().mosaic.pieces).toHaveLength(MAX_PIECES);
  });

  it('위치는 0..1 사이로 제한되지만 정렬·스냅은 하지 않는다', () => {
    const p = s().addPiece(draft)!;
    s().movePiece(p.id, 0.12345, 0.98765);
    expect(s().mosaic.pieces[0]).toMatchObject({ x: 0.12345, y: 0.98765 });
    s().movePiece(p.id, -3, 5);
    expect(s().mosaic.pieces[0]).toMatchObject({ x: 0, y: 1 });
  });

  it('회전 각도에 제한이 없다', () => {
    const p = s().addPiece(draft)!;
    s().rotatePiece(p.id, 173);
    s().rotateBy(p.id, 400);
    expect(s().mosaic.pieces[0].rotation).toBe(573);
  });

  it('숨기기·흐리게·보관함·꺼내기', () => {
    const p = s().addPiece(draft)!;
    s().setPieceState(p.id, 'hidden');
    expect(s().mosaic.pieces[0].state).toBe('hidden');
    s().setPieceState(p.id, 'faded');
    expect(s().mosaic.pieces[0].state).toBe('faded');
    s().setPieceState(p.id, 'stored');
    expect(s().mosaic.pieces[0].state).toBe('stored');
    expect(s().selectedId).toBeNull();
    s().takeOut(p.id);
    expect(s().mosaic.pieces[0].state).toBe('placed');
  });

  it('지운 조각을 원래 자리로 되살린다', () => {
    const a = s().addPiece({ ...draft, seed: 1 })!;
    const b = s().addPiece({ ...draft, seed: 2 })!;
    s().addPiece({ ...draft, seed: 3 });
    s().deletePiece(b.id);
    s().restoreDeleted();
    expect(s().mosaic.pieces[1].id).toBe(b.id);
    expect(s().mosaic.pieces[0].id).toBe(a.id);
  });

  it('빈 메모는 저장하지 않는다', () => {
    s().addPiece({ ...draft, note: '   ' });
    expect(s().mosaic.pieces[0].note).toBeUndefined();
  });
});
