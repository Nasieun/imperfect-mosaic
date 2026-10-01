'use client';

import { useEffect } from 'react';
import ui from './ui.module.css';

interface Props {
  /** 바뀔 때마다 5초 타이머를 새로 시작한다 */
  token: number;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
}

const DURATION_MS = 5000;

export default function UndoToast({ token, message, actionLabel, onAction, onDismiss }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, DURATION_MS);
    return () => window.clearTimeout(t);
  }, [token, onDismiss]);

  return (
    <div className={ui.toast} role="status">
      <span>{message}</span>
      <button
        type="button"
        onClick={() => {
          onAction();
          onDismiss();
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}
