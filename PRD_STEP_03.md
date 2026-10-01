# PRD STEP 03 — 제품 완성도: 접근성, 오프라인, 보관, 감각, 안전 강화

> 상위 문서: 「PRD: 불완전한 모자이크」 · 선행 단계: PRD_STEP_01.md, PRD_STEP_02.md
> 이 단계의 목표: **실제 사용자에게 내놓을 수 있는 수준**으로 다듬는다. 접근성 AA, 오프라인 동작, 내 모자이크 보관과 재방문, 이미지 저장, 사운드·햅틱, 익명 분석, 성능 기준을 충족한다.

---

## 1. 이 단계가 끝나면 할 수 있는 것

- 앱을 홈 화면에 설치(PWA)하고, 비행기 모드에서도 처음부터 끝까지 체험한다.
- 이전에 만든 모자이크 목록을 보고, 이어서 조각을 더하거나 새로 만든다.
- 완성된 모자이크를 PNG로 저장한다(메모·유형 정보는 들어가지 않는다).
- 원하면 사운드와 햅틱을 켠다. 기본은 꺼져 있다.
- 스크린리더와 키보드만으로 전 과정을 마친다.
- `npm run test:all`, `npm run test:a11y`, `npm run lighthouse`가 통과한다.

## 2. 범위

| 포함 (이번 단계) | 제외 (향후) |
| --- | --- |
| 접근성 WCAG 2.2 AA 전체 | 계정·클라우드 동기화(Supabase, E2EE) |
| PWA, 오프라인 | 워크숍 세션 모드, 전시 키오스크 모드 |
| 내 모자이크 목록, 이어서 놓기 (ON-4, 6.5) | 영어 다국어 |
| 질감 변경 PC-5, 키워드 칩 PC-7, 틀 모양 CV-10 | 돌봄 알림 CR-7 |
| 제목·날짜 VW-5, PNG 저장 VW-6 | 익명 이야기 카드 ST-5 |
| 직접 쓰는 돌봄 CR-4, 돌봄의 빛 CR-5 | |
| 사운드·햅틱 (P1) | |
| 메모 위험 키워드 로컬 감지 | |
| 익명 분석 이벤트, 종료 피드백 | |
| 성능 최적화, 저사양 폴백 | |

---

## 3. 개발 프롬프트 (그대로 복사해 사용)

```text
너는 STEP 01·02가 완료된 "불완전한 모자이크" 코드베이스를 출시 품질로 끌어올린다.
기존 스택과 경험 원칙(안전 우선, 정답 없음, 평가 없음, 의미 덧씌우지 않음, 천천히 조용히)을 유지하고
기존 단위·E2E 테스트를 모두 통과 상태로 유지하라.

[A. 내 모자이크 보관과 재방문]
- /my 페이지: 저장된 Mosaic를 날짜순 썸네일 그리드로 보여준다. 비교·변화 그래프 없음.
- 썸네일은 저장 시 Konva stage.toDataURL(0.3배)로 생성해 Dexie에 함께 저장.
- 랜딩에서 이전 모자이크가 있으면 [이어서 놓기] / [새로 만들기] 두 버튼을 동등하게 보여준다.
- 이어서 놓기 진입 시 기존 조각에 "오래된 톤" 필터를 적용할지 묻는 토글(기본 끔). 자동 적용 금지.
- 모자이크 개별 삭제, 설정의 [모두 지우기](확인 1회 후 즉시 영구 삭제, 복구 불가 안내).
- Dexie 스키마 버전을 올리고 STEP 02 데이터 마이그레이션을 작성한다.

[B. 만들기·바라보기·돌봄 확장]
- PC-5: 조각 질감을 유형 기본값 외 다른 질감으로 바꿀 수 있다(세라믹/석재/유리/패브릭/종이).
- PC-7: 메모 대신 키워드 칩(가족, 일, 몸, 관계, 나 자신) 다중 선택. 화면에 표시하지 않고 길게 누르면 보임.
- CV-10: 틀 선택(원 / 둥근 사각 / 틀 없음). 틀 밖에 놓인 조각도 그대로 둔다(잘라내지 않음).
- VW-5: 제목(선택, 20자) + 날짜 자동 기록.
- VW-6: [이미지로 저장] → PNG 다운로드. 메모, 키워드, 유형 정보는 포함하지 않는다.
  모바일은 Web Share API(files) 우선, 미지원 시 다운로드.
- CR-4: [직접 쓰기] 카드 — 나만의 돌봄 한 줄(30자).
- CR-5: 고른 돌봄이 모자이크 테두리 바깥에 작은 빛 하나로 놓인다. 모자이크를 가리거나 조각을 바꾸지 않는다.

[C. 사운드·햅틱]
- 설정에 사운드(기본 끔), 배경음 볼륨, 햅틱(기본 켬, 모바일만) 토글.
- 조각 놓을 때 유형별 짧은 효과음 4종 + 이름 없는 조각 1종 (200ms 이하, -18 LUFS 내외, public/sounds/*.mp3).
  실제 음원이 없으면 Web Audio로 합성한 플레이스홀더를 만든다.
- 배경음 1종 루프, 단계 전환 시 끊기지 않게.
- navigator.vibrate(10)을 조각 안착 시 1회. 미지원 환경은 무시.
- 설정은 localStorage(try/catch)에 저장.

[D. 안전 강화]
- 메모·직접 쓴 돌봄 텍스트에 위험 키워드 로컬 감지:
  src/safety/keywords.ts에 사전(예: "죽고 싶", "사라지고 싶", "끝내고 싶", "자해" 등 및 변형) — 
  입력 디바운스 1초 후 매칭되면 입력란 아래에 부드러운 안내 한 줄 + [도움받을 수 있는 곳] 링크.
  텍스트는 절대 네트워크로 보내지 않는다. 체험은 막지 않는다.
- 안내 문구와 사전 파일 상단에 "정신건강 전문가 검수 필요" 주석.

[E. 접근성 WCAG 2.2 AA]
- 모든 캔버스 조각에 대응하는 숨김 DOM 리스트(role="listbox")를 두고 스크린리더가
  "기쁨 조각, 보통 크기, 화면 왼쪽 위, 회전 30도"처럼 상대 위치로 읽게 한다.
- 드래그 대체: 조각 선택 후 화면 버튼(↑↓←→, 회전) 제공 (WCAG 2.5.7).
- 포커스 링 명확, 포커스 순서 논리적, 모달은 포커스 트랩 + Esc로 닫힘.
- 글자 200% 확대 시 레이아웃 유지, 대비 4.5:1(텍스트)/3:1(조각 대 배경).
- 색맹 시뮬레이션에서 유형이 모양·질감으로 구분되는지 확인.
- 단계 전환 시 aria-live로 "2단계, 조각을 만드는 체험" 안내.

[F. PWA·오프라인]
- @serwist/next(또는 동등)로 서비스워커, manifest.webmanifest, 아이콘 192/512, 테마색.
- 앱 셸·폰트·SVG·사운드를 프리캐시. 최초 방문 후 오프라인에서 전 과정 동작.

[G. 익명 분석]
- src/analytics/track.ts: track(event, props). 환경변수 NEXT_PUBLIC_ANALYTICS_URL이 없으면 콘솔에만 출력(no-op).
- 쿠키·식별자 없음. 세션 단위 무작위 ID만 메모리에 보관.
- 이벤트: journey_started{entry}, story_completed/story_skipped{scene_index}, piece_created{kind,size,has_note:boolean},
  piece_action{action}, canvas_done{piece_count, empty_ratio_bucket}, view_entered, view_exported,
  care_selected{card_category}, help_link_opened{source}, exit_feedback{q1,q2}
- 메모·제목·직접 쓴 돌봄 텍스트와 마음 체크 값은 어떤 이벤트에도 넣지 않는다(테스트로 보장).
- empty_ratio_bucket은 'low'|'mid'|'high' 세 구간으로만. 화면에는 절대 표시하지 않는다.
- 마무리 화면 하단에 선택형 피드백 2문항(5점): "조금 더 나를 있는 그대로 볼 수 있었다",
  "부담스럽거나 불편했다". 건너뛰기 가능.

[H. 성능]
- 초기 JS 200KB(gzip) 이하: 캔버스·Konva는 make 단계에서 dynamic import.
- 조각 60개 드래그 시 60fps 목표(최소 45fps): 조각 캐싱(node.cache()), 드래그 중 그림자 단순화.
- 저사양 감지(hardwareConcurrency ≤ 4 또는 프레임 드롭) 시 질감 단순화 모드.
- LCP 2.5초 이하(모바일 4G 시뮬레이션).

[테스트 — 반드시 작성]
- 단위: analytics.test.ts(금지 필드가 payload에 절대 없음), keywords.test.ts(변형 매칭/오탐 예시),
  migration.test.ts(STEP 02 스키마 → 새 스키마), export.test.ts(PNG 메타데이터에 메모 없음)
- E2E 추가:
  e2e/a11y.spec.ts — @axe-core/playwright로 모든 단계 위반 0건(serious/critical)
  e2e/keyboard.spec.ts — 키보드만으로 전체 여정 완료
  e2e/offline.spec.ts — 1회 방문 후 context.setOffline(true)로 전체 여정 완료
  e2e/revisit.spec.ts — 저장 → 새로고침 → /my에서 보임 → 이어서 놓기 → 조각 추가
  e2e/export.spec.ts — PNG 다운로드 이벤트 발생
  e2e/safety.spec.ts — 메모에 위험 키워드 입력 시 안내 표시, 네트워크 요청에 텍스트 없음(page.on('request') 검사)
- 스크립트: "test:a11y", "lighthouse"(@lhci/cli, 성능 ≥ 85, 접근성 ≥ 95, PWA 설치 가능),
  "analyze"(@next/bundle-analyzer)

[출시 체크리스트 — RELEASE_CHECKLIST.md 생성]
- [ ] "극복/이겨내다/성장하다"를 요구하는 문구 없음
- [ ] 완성도·점수·비교 요소 없음
- [ ] 모든 단계 건너뛰기 가능
- [ ] 위기 자원 번호 최신 확인 (확인일 기록)
- [ ] 메모 텍스트가 분석 로그·네트워크에 없음
- [ ] 정신건강 전문가 문구 검수 완료
- [ ] 접근성 감사 통과

완료 후 README.md를 최종 정리하라: 기능 요약, 실행·빌드·테스트 방법, 폴더 구조, 개인정보 처리 방식.
```

---

## 4. 실행 방법

```bash
npm install
npx playwright install
npm run dev                  # 개발 서버
npm run test:all             # 단위 + E2E 전체
npm run test:a11y            # 접근성 E2E
npm run build && npm start   # 프로덕션 모드 (PWA·오프라인은 이 모드에서 확인)
npm run lighthouse           # 성능·접근성·PWA 점수
npm run analyze              # 번들 크기 확인
```

> 서비스워커는 개발 모드에서 꺼져 있을 수 있으므로, 오프라인·설치 테스트는 반드시 `npm run build && npm start`로 한다.

## 5. 수용 기준 (자동 테스트)

| ID | 기준 | 확인 방법 |
| --- | --- | --- |
| T3-1 | 모든 단계에서 axe serious/critical 위반 0건 | `a11y.spec.ts` |
| T3-2 | 키보드만으로 여정 완료 | `keyboard.spec.ts` |
| T3-3 | 오프라인에서 여정 완료 | `offline.spec.ts` |
| T3-4 | 재방문해 이어서 놓기 가능 | `revisit.spec.ts` |
| T3-5 | 분석·네트워크에 메모 텍스트가 없음 | `analytics.test.ts`, `safety.spec.ts` |
| T3-6 | PNG에 메모 정보 없음 | `export.test.ts`, `export.spec.ts` |
| T3-7 | Lighthouse 성능 ≥ 85, 접근성 ≥ 95 | `npm run lighthouse` |
| T3-8 | 초기 JS 200KB(gzip) 이하 | `npm run analyze` |
| T3-9 | STEP 01·02 테스트 모두 통과 | `npm run test:all` |

## 6. 수동 테스트 시나리오

- [ ] 휴대폰에서 홈 화면에 추가 → 비행기 모드 → 앱 실행 → 끝까지 체험
- [ ] VoiceOver(iOS) 또는 NVDA(Windows)를 켜고 조각을 하나 만들어 옮겨 본다. 위치 안내가 이해되는가
- [ ] 브라우저 글자 크기를 200%로 키워도 버튼이 잘리지 않는다
- [ ] 사운드를 켜고 다섯 유형 조각을 놓아 본다. 소리가 거슬리거나 놀랍지 않은가
- [ ] 저장한 PNG를 열어 메모·유형 글자가 없는지 확인한다
- [ ] 메모에 위험 표현을 입력하면 안내가 부드럽게 뜨고, 체험은 계속된다
- [ ] DevTools 네트워크 탭에서 메모 입력 시 전송 요청이 없는지 본다
- [ ] 조각 60개를 만들어 빠르게 드래그해도 끊김이 심하지 않다 (DevTools Performance로 FPS 확인)
- [ ] 이어서 놓기에서 "오래된 톤" 토글이 기본으로 꺼져 있다
- [ ] RELEASE_CHECKLIST.md의 항목을 하나씩 확인하고 체크한다

## 7. 완료 조건

모든 자동 테스트와 Lighthouse 기준이 통과하고, RELEASE_CHECKLIST.md의 모든 항목이 체크되면 MVP 출시 후보(Release Candidate)로 본다. 계정·동기화와 워크숍 모드는 이후 별도 PRD로 다룬다.
