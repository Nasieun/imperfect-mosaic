'use client';

import { useEffect, useState } from 'react';
import { track } from '@/analytics/track';
import { useJourneyStore } from '@/store/journeyStore';
import { RISK_COPY, hasRiskSignal } from './keywords';
import styles from './RiskHint.module.css';

const DEBOUNCE_MS = 1000;

/** 입력이 멈추고 1초 뒤 기기 안에서만 확인한다. 텍스트는 네트워크로 보내지 않는다. */
export function useRiskSignal(text: string): boolean {
  const [risk, setRisk] = useState(false);
  useEffect(() => {
    if (!text) {
      setRisk(false);
      return;
    }
    const t = window.setTimeout(() => setRisk(hasRiskSignal(text)), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [text]);
  return risk;
}

export default function RiskHint({ text }: { text: string }) {
  const risk = useRiskSignal(text);
  const openCrisis = useJourneyStore((s) => s.openCrisis);
  if (!risk) return null;
  return (
    <p className={styles.hint} role="status" data-testid="risk-hint">
      {RISK_COPY.line}{' '}
      <button
        type="button"
        className={styles.link}
        onClick={() => {
          track('help_link_opened', { source: 'keyword' });
          openCrisis();
        }}
      >
        {RISK_COPY.link}
      </button>
    </p>
  );
}
