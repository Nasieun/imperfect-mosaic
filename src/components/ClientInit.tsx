'use client';

import { useEffect } from 'react';
import { syncAmbient } from '@/audio/feedback';
import { withBase } from '@/lib/basePath';
import { useSettings } from '@/store/settingsStore';


/**
 * 모든 페이지 공통 초기화
 * - 저장된 설정 불러오기
 * - 사운드가 켜져 있으면 첫 조작 때 배경음 시작(브라우저 자동 재생 정책)
 * - 프로덕션에서 서비스 워커 등록(오프라인 지원)
 */
export default function ClientInit() {
  useEffect(() => {
    useSettings.getState().hydrate();

    const start = () => syncAmbient();
    window.addEventListener('pointerdown', start, { once: true });

    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(withBase('/sw.js'), { scope: withBase('/') }).catch(() => {});
    }
    return () => window.removeEventListener('pointerdown', start);
  }, []);

  return null;
}
