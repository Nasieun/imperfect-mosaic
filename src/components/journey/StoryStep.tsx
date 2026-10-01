'use client';

import { useEffect, useRef } from 'react';
import { STORY_COPY, STORY_SCENES, type StoryScene } from '@/content/story';
import { BrokenBowl, FourKinds, Gathered, Scatter, Whole } from './illustrations';
import ui from '../ui.module.css';
import styles from './journey.module.css';

const ILLUSTRATION: Record<StoryScene['illustration'], () => React.ReactNode> = {
  bowl: () => <BrokenBowl />,
  scatter: () => <Scatter />,
  kinds: () => <FourKinds />,
  gathered: () => <Gathered />,
  whole: () => <Whole />,
};

/**
 * 1단계: 나의 치유 이야기. 자동 재생 없이 스크롤로 읽고, 언제든 건너뛸 수 있다.
 * onNext에는 끝까지 읽었으면 'end', 건너뛰었으면 그때까지 본 장면 번호를 넘긴다.
 */
export default function StoryStep({ onNext }: { onNext: (scene: number | 'end') => void }) {
  const seen = useRef(1);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          seen.current = Math.max(seen.current, i);
        }
      },
      { threshold: 0.5 },
    );
    list.querySelectorAll('li').forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.storyWrap}>
      <div className={styles.skipBar}>
        <button type="button" className={ui.ghost} onClick={() => onNext(seen.current)}>
          {STORY_COPY.skip}
        </button>
      </div>
      <ol ref={listRef} className={styles.story} aria-label="나의 치유 이야기">
        {STORY_SCENES.map((scene, i) => (
          <li key={scene.id} className={styles.scene} data-testid={`scene-${i + 1}`} data-index={i + 1}>
            <div className={styles.sceneArt}>{ILLUSTRATION[scene.illustration]()}</div>
            {scene.lines.map((line) => (
              <p key={line} className={styles.sceneLine}>
                {line}
              </p>
            ))}
            {i === 0 && <p className={styles.scrollHint}>{STORY_COPY.scrollHint}</p>}
            {i === STORY_SCENES.length - 1 && (
              <button type="button" className={ui.primary} onClick={() => onNext('end')}>
                {STORY_COPY.cta}
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
