# 출시 체크리스트

릴리스마다 아래 항목을 확인하고, 확인한 사람과 날짜를 남깁니다.
"자동"은 테스트가 보장하는 항목이며, 테스트가 모두 통과하면 체크할 수 있습니다.

## 메시지와 윤리

- [ ] "극복 / 이겨내다 / 성장해야" 등 회복을 요구하는 문구가 없다 — 자동: `src/__tests__/copy.test.ts`
- [ ] 완성도·점수·퍼센트·비교 요소가 없다 — 자동: `e2e/no-pressure.spec.ts`, `e2e/revisit.spec.ts`
- [ ] 모든 단계를 건너뛸 수 있고, 필수 입력이 없다 — 자동: `e2e/journey-skip.spec.ts`
- [ ] '아무것도 안 해도 괜찮아요' 카드가 다른 카드와 같은 크기·위계다 — 자동: `src/__tests__/care.test.ts` + 화면 확인
- [ ] 문구 전체를 소리 내어 읽고, 평가하거나 의미를 덧씌우는 말이 없는지 사람이 확인했다

## 안전

- [ ] 위기 자원 번호가 최신이다 (109, 1577-0199, 1388, 112·119, 129) — **확인일: ____-__-__ / 확인자: ____**
- [ ] 위기 안내 문구와 흐름을 정신건강 전문가(임상심리사 또는 상담사)가 검수했다 — **검수자: ____**
- [ ] 위험 표현 사전(`src/safety/keywords.ts`)을 전문가가 검수했다
- [ ] 모든 단계에서 위기 안내가 열리고, 무거운 마음 선택 시 먼저 보인다 — 자동: `e2e/crisis.spec.ts`
- [ ] 위험 표현 안내가 체험을 막지 않는다 — 자동: `e2e/safety.spec.ts`

## 개인정보

- [ ] 메모 텍스트가 분석 로그·네트워크에 없다 — 자동: `src/__tests__/analytics.test.ts`, `e2e/safety.spec.ts`
- [ ] 저장한 PNG에 메모·제목·메타데이터가 없다 — 자동: `e2e/export.spec.ts`, `src/__tests__/export.test.ts`
- [ ] `NEXT_PUBLIC_ANALYTICS_URL`을 설정했다면, 수집 서버가 쿠키·IP 저장을 하지 않도록 설정했다
- [ ] 외부 추적 스크립트·광고 SDK가 없다

## 접근성

- [ ] axe 검사에서 심각·치명 위반 0건 — 자동: `e2e/a11y.spec.ts`
- [ ] 키보드만으로 여정 전체 완료 — 자동: `e2e/keyboard.spec.ts`
- [ ] VoiceOver(iOS) 또는 NVDA(Windows)로 조각 하나를 만들고 옮겨 봤다
- [ ] 글자 200% 확대에서 버튼이 잘리지 않는다
- [ ] "동작 줄이기" 설정에서 연출이 즉시 전환된다

## 품질

- [ ] 단위·E2E 테스트 모두 통과 — `npm run test:all`
- [ ] 페이지별 첫 로딩 JS ≤ 200KB(gzip) — `npm run build && npm run check:bundle`
- [ ] Lighthouse 접근성 ≥ 0.95, 성능 ≥ 0.85, LCP ≤ 2.5초 — `npm run lighthouse`
      (현재 조각 만들기 화면 성능 0.79–0.81로 미달. README의 "알려진 한계" 참고)
- [ ] 휴대폰에 설치 → 비행기 모드 → 처음부터 끝까지 체험 — 자동(Chromium): `e2e/offline.spec.ts` + 실제 기기 확인
- [ ] 실제 iOS Safari에서 드래그·두 손가락 회전·공유 저장을 확인했다 (이 저장소의 Windows 환경에서는 WebKit 자동 테스트 불가)
