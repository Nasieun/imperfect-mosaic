// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PieceMakerSheet from '@/components/maker/PieceMakerSheet';
import { useMosaicStore } from '@/store/mosaicStore';

describe('PieceMakerSheet', () => {
  beforeEach(() => useMosaicStore.getState().reset());
  afterEach(cleanup);

  it('유형·크기·메모를 고르고 캔버스에 놓으면 조각이 생긴다', () => {
    const onClose = vi.fn();
    render(<PieceMakerSheet open onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /상처/ }));
    fireEvent.click(screen.getByRole('button', { name: '크게' }));
    fireEvent.change(screen.getByPlaceholderText('적지 않아도 괜찮아요'), { target: { value: '오래된 일' } });
    fireEvent.click(screen.getByRole('button', { name: '캔버스에 놓기' }));

    const pieces = useMosaicStore.getState().mosaic.pieces;
    expect(pieces).toHaveLength(1);
    expect(pieces[0]).toMatchObject({ kind: 'wound', size: 'L', texture: 'glass', note: '오래된 일', state: 'placed' });
    expect(onClose).toHaveBeenCalled();
  });

  it('메모 없이도 놓을 수 있다', () => {
    render(<PieceMakerSheet open onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '캔버스에 놓기' }));
    expect(useMosaicStore.getState().mosaic.pieces[0].note).toBeUndefined();
  });
});
