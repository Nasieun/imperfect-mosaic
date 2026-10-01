'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { isStep, type Step } from '@/domain/journey';
import { withBase } from '@/lib/basePath';

const EVENT = 'journey:navigate';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function readStep(): Step {
  const raw = new URLSearchParams(window.location.search).get('step');
  return isStep(raw) ? raw : 'intro';
}

/**
 * 지금 단계. URL(?step=)이 기준이고, 서버는 같은 값으로 첫 화면을 그린다.
 * 단계 전환은 history API로만 바꿔 서버 왕복이 없다(오프라인에서도 동작).
 */
export function useStep(initialStep: Step): [Step, (s: Step) => void] {
  const step = useSyncExternalStore(subscribe, readStep, () => initialStep);
  const go = useCallback((s: Step) => {
    window.history.pushState(null, '', withBase(`/journey/?step=${s}`));
    window.dispatchEvent(new Event(EVENT));
    window.scrollTo(0, 0);
  }, []);
  return [step, go];
}
