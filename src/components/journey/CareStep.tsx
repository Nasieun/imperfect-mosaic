'use client';

import { track } from '@/analytics/track';
import { CARE_CARDS, CARE_COPY, PRO_RESOURCES } from '@/content/care';
import { MAX_CUSTOM_CARE_LENGTH } from '@/domain/types';
import RiskHint from '@/safety/RiskHint';
import { useJourneyStore } from '@/store/journeyStore';
import { useMosaicStore } from '@/store/mosaicStore';
import ui from '../ui.module.css';
import styles from './journey.module.css';

/** 4단계: 지금 나에게 필요한 돌봄 한 가지. 추천이 아니라 선택이며, 고르지 않아도 된다. */
export default function CareStep({ onNext }: { onNext: () => void }) {
  const careId = useJourneyStore((s) => s.careId);
  const toggleCare = useJourneyStore((s) => s.toggleCare);
  const customCare = useJourneyStore((s) => s.customCare);
  const setCustomCare = useJourneyStore((s) => s.setCustomCare);
  const setCareChoice = useMosaicStore((s) => s.setCareChoice);

  const choose = (id: string) => {
    const selecting = careId !== id;
    toggleCare(id);
    if (selecting) {
      const category = id === 'custom' ? 'custom' : CARE_CARDS.find((c) => c.id === id)?.category;
      track('care_selected', { card_category: category });
    }
  };

  const finish = () => {
    const custom = careId === 'custom' ? customCare.trim() : '';
    if (careId === 'custom' && !custom) setCareChoice(undefined);
    else setCareChoice(careId ? { cardId: careId, ...(custom ? { customText: custom } : {}) } : undefined);
    onNext();
  };

  return (
    <section className={styles.panel} aria-labelledby="care-title">
      <h1 id="care-title" className={styles.h1}>
        {CARE_COPY.question}
      </h1>
      <p className={styles.sub}>{CARE_COPY.sub}</p>
      <ul className={styles.cards}>
        {CARE_CARDS.map((card) => (
          <li key={card.id}>
            <button
              type="button"
              className={styles.card}
              aria-pressed={careId === card.id}
              data-category={card.category}
              onClick={() => choose(card.id)}
            >
              <span className={styles.cardCat}>{card.categoryLabel}</span>
              <span className={styles.cardTitle}>{card.title}</span>
              <span className={styles.cardDetail}>{card.detail}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={styles.card}
            aria-pressed={careId === 'custom'}
            data-category="custom"
            onClick={() => choose('custom')}
          >
            <span className={styles.cardCat}>{CARE_COPY.customCat}</span>
            <span className={styles.cardTitle}>{CARE_COPY.customTitle}</span>
            <span className={styles.cardDetail}>{CARE_COPY.customDetail}</span>
          </button>
        </li>
      </ul>

      {careId === 'custom' && (
        <label className={styles.customBox}>
          <span>{CARE_COPY.customLabel}</span>
          <input
            className={ui.input}
            type="text"
            value={customCare}
            maxLength={MAX_CUSTOM_CARE_LENGTH}
            placeholder={CARE_COPY.customPlaceholder}
            onChange={(e) => setCustomCare(e.target.value)}
            autoFocus
          />
          <RiskHint text={customCare} />
        </label>
      )}

      {careId === 'pro' && (
        <div className={styles.proBox}>
          <p>{CARE_COPY.proNote}</p>
          <ul>
            {PRO_RESOURCES.map((r) => (
              <li key={r.name}>
                <a href={`tel:${r.tel}`}>
                  {r.name} {r.number}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.actions}>
        <button type="button" className={ui.primary} onClick={finish}>
          {CARE_COPY.finish}
        </button>
      </div>
    </section>
  );
}
