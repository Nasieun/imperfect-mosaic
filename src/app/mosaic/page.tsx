'use client';

import { useState } from 'react';
import MosaicEditor from '@/components/MosaicEditor';
import SettingsSheet from '@/components/SettingsSheet';
import CrisisSheet from '@/components/journey/CrisisSheet';
import { COPY } from '@/content/copy';
import { clearAllMosaics } from '@/db/db';
import { useMosaicStore } from '@/store/mosaicStore';
import { useMosaicPersistence } from '@/store/useMosaicPersistence';
import ui from '@/components/ui.module.css';
import styles from '../shell.module.css';

/** 개발·확인용 단독 캔버스 화면 (여정 밖) */
export default function MosaicPage() {
  const ready = useMosaicPersistence();
  const pieceCount = useMosaicStore((s) => s.mosaic.pieces.length);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onDone = () => {
    console.log('[mosaic] done', useMosaicStore.getState().mosaic);
  };

  const onClearAll = async () => {
    if (!window.confirm(COPY.clearConfirm)) return;
    await clearAllMosaics();
    useMosaicStore.getState().reset();
    setSettingsOpen(false);
  };

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>{COPY.mosaicTitle}</h1>
          <p className={styles.headerSub}>{COPY.savedLocal}</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={ui.ghost} onClick={() => setSettingsOpen(true)}>
            {COPY.settings}
          </button>
          <button type="button" className={ui.primary} disabled={pieceCount === 0} onClick={onDone}>
            {COPY.done}
          </button>
        </div>
      </header>
      {ready && <MosaicEditor />}
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        extra={
          <button type="button" className={ui.ghost} onClick={onClearAll}>
            {COPY.clearAll}
          </button>
        }
      />
      <CrisisSheet />
    </main>
  );
}
