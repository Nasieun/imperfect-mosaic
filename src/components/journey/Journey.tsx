'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/analytics/track';
import { STEP_NAME } from '@/content/journey';
import { dotIndex, nextStep, type Step } from '@/domain/journey';
import { useJourneyStore } from '@/store/journeyStore';
import { useMosaicPersistence } from '@/store/useMosaicPersistence';
import JourneyShell from './JourneyShell';
import IntroStep from './IntroStep';
import StoryStep from './StoryStep';
import MakeStep from './MakeStep';
import ViewStep from './ViewStep';
import CareStep from './CareStep';
import CloseStep from './CloseStep';
import { useStep } from './useStep';
import ui from '../ui.module.css';
import styles from './journey.module.css';

export default function Journey({ initialStep }: { initialStep: Step }) {
  const router = useRouter();
  const [step, go] = useStep(initialStep);
  const setStep = useJourneyStore((s) => s.setStep);
  const ready = useMosaicPersistence();

  useEffect(() => setStep(step), [step, setStep]);

  // 주소의 단계로 화면이 맞춰지면 감춰 두었던 내용을 보인다(page.tsx의 인라인 스크립트 참고).
  useEffect(() => {
    const urlStep = new URLSearchParams(window.location.search).get('step') ?? 'intro';
    if (step === urlStep || !document.documentElement.hasAttribute('data-deeplink')) {
      document.documentElement.removeAttribute('data-deeplink');
    }
  }, [step]);

  // 첫 화면은 바로 보여주고, 단계가 바뀔 때만 천천히 겹쳐 전환한다.
  const firstStep = useRef(step);
  const animate = step !== firstStep.current;

  const next = () => go(nextStep(step));
  const home = () => router.push('/');

  const n = dotIndex(step);
  const announce = n >= 1 && n <= 4 ? `${n}단계, ${STEP_NAME[step]}` : STEP_NAME[step];

  return (
    <JourneyShell step={step} onExit={home}>
      <div className={ui.srOnly} aria-live="polite">
        {announce}
      </div>
      <div key={step} className={animate ? styles.fade : styles.noFade} data-step={step} data-journey-content>
        {step === 'intro' && <IntroStep onNext={next} />}
        {step === 'story' && (
          <StoryStep
            onNext={(scene) => {
              track(scene === 'end' ? 'story_completed' : 'story_skipped', { scene_index: scene === 'end' ? 5 : scene });
              next();
            }}
          />
        )}
        {step === 'make' && <MakeStep ready={ready} onNext={next} />}
        {step === 'view' && <ViewStep ready={ready} onEdit={() => go('make')} onNext={next} />}
        {step === 'care' && <CareStep onNext={next} />}
        {step === 'close' && <CloseStep onHome={home} />}
      </div>
    </JourneyShell>
  );
}
