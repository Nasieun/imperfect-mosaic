# 불완전한 모자이크

> 완벽하지 않은 나도 하나의 모습이 됩니다.

기쁨·실패·상처·도움받았던 순간을 서로 다른 모양과 질감의 조각으로 만들어, 반듯하게 맞추지 않아도 되는 나만의 모자이크를 놓아 보는 웹앱입니다.
상처가 꼭 성장으로 이어져야 한다고 말하지 않고, **어떤 경험이 있어도 그것이 나를 구성하는 전부는 아니다**라는 관점을 담았습니다.

설계 문서: `PRD_STEP_01.md`, `PRD_STEP_02.md`, `PRD_STEP_03.md`

---

## 빠르게 실행하기

```bash
npm install
npx playwright install chromium   # E2E·Lighthouse용 브라우저 (최초 1회)

npm run dev        # 개발 서버  http://localhost:3000
# 또는 실제 배포와 같은 프로덕션 모드 (오프라인·설치는 이 모드에서만 동작)
npm run build && npm start
```

| 주소 | 화면 |
| --- | --- |
| `/` | 랜딩. 이전 모자이크가 있으면 [이어서 놓기]·[새로 만들기] |
| `/journey?step=intro` … `close` | 여정: 진입 → 이야기 → 조각 만들기 → 바라보기 → 돌봄 → 마무리 |
| `/my` | 내 모자이크 (날짜순 썸네일, 이어서 놓기, 지우기) |
| `/mosaic` | 개발용 단독 캔버스 (여정 밖) |

## GitHub Pages로 실행하기

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가
타입 검사 → 린트 → 단위 테스트 → 정적 빌드 → E2E 테스트를 차례로 돌리고, 모두 통과하면 GitHub Pages에 배포합니다.
배포 주소는 `https://<아이디>.github.io/<저장소이름>/` 입니다.

처음 한 번은 저장소의 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 두어야 합니다.

GitHub Pages는 정적 파일만 올릴 수 있어서, 배포용 빌드는 서버 없이 동작하는 정적 파일(`out/`)로 만듭니다.
모든 데이터가 원래 브라우저(IndexedDB)에만 저장되므로 기능 차이는 없습니다.

```bash
npm run build:pages     # out/ 에 정적 빌드 (기본 하위 경로 /imperfect-mosaic)
npm run serve:pages     # http://localhost:4000/imperfect-mosaic/ 에서 배포본처럼 확인
```

다른 저장소 이름으로 확인하려면 두 명령 앞에 `BASE_PATH=/저장소이름` 을 붙입니다.

## 테스트

```bash
npm test             # 단위 테스트 (vitest) — 122개
npm run test:e2e     # E2E (Playwright, 데스크톱 + iPhone 13 화면) — 52개(3개는 데스크톱 전용으로 모바일에서 건너뜀)
npm run test:all     # 위 둘 다
npm run test:a11y    # 접근성(axe)·키보드 전용 E2E만
npm run typecheck && npm run lint
npm run build && npm run check:bundle   # 페이지별 첫 로딩 JS(gzip) ≤ 200KB 확인
npm run build && npm run lighthouse     # Lighthouse CI (모바일, 실제 DevTools 스로틀링)
npm run analyze                         # 번들 분석 리포트 (.next/analyze)
```

E2E는 프로덕션 빌드를 포트 3200에 띄워 실행합니다(이미 떠 있으면 그대로 씁니다).
배포될 정적 빌드로 돌리려면 `BASE_PATH= npm run build:pages` 뒤에 `PW_STATIC=1 npm run test:e2e` (CI가 이 방식을 씁니다).

## 단계별로 만든 것

### STEP 01 — 조각과 자유 배치 캔버스
- 시드 기반 절차적 조각 생성(유형별 모양: 둥근 다각형 / 모서리 잘린 사각형 / 금 간 파편 / 맞물린 두 원 / 보로노이 셀). 같은 시드는 항상 같은 모양.
- 스냅·격자·정렬 없는 자유 드래그, 회전 핸들, 두 손가락 회전, 겹침 허용.
- 숨기기 · 흐리게 · 보관함 · 지우기(5초 되돌리기 토스트), 되돌리기/다시하기 30단계.
- IndexedDB 자동 저장(2초 디바운스, 화면을 떠날 때 즉시 저장).
- 키보드: Tab 선택 · 방향키 이동(Shift 10배) · Q/E 회전 · Delete · Ctrl+Z / Ctrl+Shift+Z.

### STEP 02 — 네 단계 여정
- 진입(시작 전 안내, 마음 날씨 체크 — 기기 밖으로 보내지 않음) → 이야기 5장면 → 조각 만들기 → 바라보기(빛이 줄눈을 지나가는 연출, 탭하면 건너뜀, "조각 N개 중 하나") → 돌봄 카드 → 마무리.
- 모든 단계에서 건너뛰기 · 잠시 쉬기(타이머 없음) · 나가기, 하단 [지금 도움이 필요해요] 위기 안내.
- 가장 무거운 마음(폭풍)을 고르면 안내를 먼저 보여 주되 체험은 막지 않음.

### STEP 03 — 출시 품질
- 내 모자이크(썸네일, 이어서 놓기, 개별·전체 삭제), 오래된 톤(기본 꺼짐), DB 스키마 v2 마이그레이션.
- 질감 바꾸기, 키워드 칩, 틀(원·둥근 사각·없음, 밖의 조각을 자르지 않음), 제목·날짜, PNG 저장(메모·제목 미포함), 직접 쓰는 돌봄, 돌봄의 빛.
- 효과음·배경음(Web Audio 합성, 기본 꺼짐), 햅틱(기본 켬), 가벼운 화면 모드(저사양 기기 자동).
- 위험 표현 기기 내 감지 → 부드러운 안내(텍스트는 어디에도 전송하지 않음).
- 접근성: 스크린리더용 조각 목록(상대 위치 안내), 드래그 대체 화면 버튼, 대화상자 포커스 가둠·Esc, 단계 전환 안내(aria-live), 동작 줄이기 대응.
- PWA: 매니페스트·아이콘·서비스 워커. 한 번 방문하면 비행기 모드에서도 여정 전체 동작.
- 익명 분석: 허용 목록에 있는 짧은 값만 전송, `NEXT_PUBLIC_ANALYTICS_URL`이 없으면 전송하지 않음.

## 폴더 구조

```
src/
  app/                 # 페이지 (/, /journey, /my, /mosaic, manifest, sw-manifest.json)
  components/
    canvas/            # Konva 캔버스, 조각, 메뉴, 질감, 스냅샷
    journey/           # 여정 틀과 단계 화면, 위기 안내, 일러스트
    maker/             # 조각 만들기 시트
  content/             # 화면 문구 (copy, story, care, crisis, journey)
  domain/              # 타입, 시드 난수, 조각 모양 생성, 팔레트, 단계
  store/               # zustand 스토어(모자이크·여정·설정), 저장 훅
  db/                  # Dexie(IndexedDB) 스키마와 마이그레이션
  analytics/           # 익명 분석
  audio/               # 효과음·배경음·햅틱
  safety/              # 위험 표현 감지와 안내
  export/              # PNG 저장
  __tests__/           # 단위 테스트
e2e/                   # Playwright E2E
public/sw.js           # 서비스 워커
scripts/               # 정적 빌드·미리보기, 아이콘 생성, 번들 예산, Lighthouse, 분석
.github/workflows/     # 테스트 + GitHub Pages 배포
```

## 개인정보 처리 방식

| 데이터 | 저장 위치 | 서버 전송 |
| --- | --- | --- |
| 조각 모양·위치·유형, 제목, 고른 돌봄 | 이 기기의 IndexedDB | 하지 않음 |
| 메모·키워드·직접 쓴 돌봄 | 이 기기의 IndexedDB | 하지 않음 (위험 표현 감지도 기기 안에서만) |
| 마음 날씨 체크 | 메모리(새로고침하면 사라짐) | 하지 않음 |
| 효과음·진동 설정 | localStorage | 하지 않음 |
| 분석 이벤트 | — | 설정한 경우에만, 이벤트 이름과 짧은 값만(메모·제목·자유 텍스트 불가, 테스트로 보장) |

외부 글꼴 CDN이나 추적 스크립트를 쓰지 않습니다. 계정·클라우드 동기화는 이번 범위에 없습니다.

## 알려진 한계와 PRD와 달라진 점

- **Lighthouse 성능**: 실제 DevTools 스로틀링(모바일, CPU 4배 느리게) 기준(여러 번 측정한 범위) 랜딩 0.92–0.94, 여정 안내 0.90–0.94, **조각 만들기 0.79–0.81**로, 조각 만들기 화면만 목표 0.85에 못 미칩니다. 원인은 캔버스 라이브러리(Konva) 초기화에 드는 약 0.5초의 메인 스레드 작업입니다(LCP는 1.3초로 기준 충족). 접근성 점수는 세 화면 모두 1.0입니다.
  기본 '시뮬레이션' 방식은 로컬 서버에서 모든 스크립트를 첫 화면 전 의존성으로 계산해 LCP를 2~3배 부풀리므로, `lighthouserc.json`은 실제 스로틀링(`devtools`)을 씁니다. 기준값(성능 0.85, 접근성 0.95, LCP 2.5초)은 PRD 그대로 두었습니다.
- **글꼴**: PRD의 Pretendard CDN은 첫 화면을 1초 넘게 막고 오프라인·개인정보 면에서도 불리해 걷어냈습니다. 기기에 Pretendard가 설치되어 있으면 그대로 쓰고, 없으면 기기의 한글 글꼴(애플 SD 산돌고딕 Neo, 맑은 고딕, Noto Sans KR)로 보입니다. 세리프(나눔명조)는 `next/font`로 자체 제공합니다.
- **모바일 E2E**: 이 Windows 환경에서는 Playwright WebKit이 필요한 시스템 DLL이 없어 실행되지 않습니다. `mobile` 프로젝트는 iPhone 13 화면·터치 환경을 Chromium으로 돌립니다. macOS·Linux·CI에서는 `PW_WEBKIT=1 npm run test:e2e`로 실제 Safari 엔진을 쓸 수 있습니다.
- **소리**: 음원 파일 대신 Web Audio로 합성한 자리표시 소리입니다. 실제 음원으로 바꿀 때는 `src/audio/feedback.ts`만 고치면 됩니다.
- **검수 필요**: 위기 상담 번호(`src/content/crisis.ts`)와 위험 표현 사전(`src/safety/keywords.ts`)은 출시 전 공식 기관 확인과 정신건강 전문가 검수가 필요합니다. `RELEASE_CHECKLIST.md`를 보세요.
- 이 체험은 상담이나 치료를 대신하지 않습니다.
