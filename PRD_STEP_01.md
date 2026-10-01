# PRD STEP 01 — 기반 구축: 조각 생성과 자유 배치 캔버스

> 상위 문서: 「PRD: 불완전한 모자이크」
> 이 단계의 목표: **조각 하나를 만들어 캔버스 위 아무 곳에나 놓고, 새로고침해도 그대로 남아 있는 것**까지를 실제로 실행되는 앱으로 만든다.

---

## 1. 이 단계가 끝나면 할 수 있는 것

- `npm run dev`로 앱을 띄우고 브라우저에서 `/mosaic` 화면을 연다.
- 다섯 가지 유형(기쁨·실패·상처·도움받은 순간·이름 없는 조각)의 조각을 만든다.
- 조각을 드래그하고, 회전하고, 겹쳐 놓고, 빈 공간을 그대로 둘 수 있다. 스냅이나 정렬은 없다.
- 조각을 숨기기 / 흐리게 / 보관함으로 / 지우기 할 수 있고, 되돌리기·다시하기가 된다.
- 새로고침해도 배치가 그대로 복원된다(IndexedDB).
- `npm test`로 단위 테스트가 통과한다.

## 2. 범위

| 포함 (이번 단계) | 제외 (다음 단계) |
| --- | --- |
| 프로젝트 셋업, 디자인 토큰, 라이트/다크 | 온보딩, 스토리, 바라보기, 돌봄 카드 (STEP 02) |
| 조각 절차적 생성 (시드 기반) | 사운드, 햅틱, PNG 내보내기 (STEP 03) |
| 조각 만들기 시트 (PC-1~4, PC-6, PC-8) | 접근성 전체 감사, PWA, 분석 (STEP 03) |
| 캔버스 배치 (CV-1~9) | 계정·클라우드 동기화 (이번 3단계 범위 밖) |
| 로컬 저장, 되돌리기 30단계 | |

---

## 3. 개발 프롬프트 (그대로 복사해 사용)

```text
너는 시니어 프론트엔드 엔지니어다. "불완전한 모자이크"라는 힐링 웹앱의 1단계를 구현한다.
제품 메시지는 "어떤 경험이 있어도 그것이 나를 구성하는 전부는 아니다"이다.
따라서 정렬·스냅·완성도 표시·빈칸 채우기 유도는 절대 넣지 않는다.

[기술 스택 — 반드시 이대로]
- Next.js 15 (App Router) + TypeScript (strict) + npm
- 캔버스: react-konva + konva
- 상태: zustand (+ 직접 구현한 undo/redo 히스토리, 최대 30단계)
- 로컬 저장: dexie (IndexedDB)
- 조각 모양 생성: d3-delaunay, simplex-noise, 시드 PRNG(mulberry32 직접 구현)
- 스타일: CSS Modules + CSS 변수 디자인 토큰 (Tailwind 사용 안 함)
- 테스트: vitest + @testing-library/react + fake-indexeddb

[폴더 구조]
src/
  app/
    layout.tsx, page.tsx(임시: /mosaic로 가는 링크만), globals.css(토큰)
    mosaic/page.tsx            ← 이번 단계의 메인 화면
  domain/
    types.ts                   ← Piece, Mosaic, PieceKind 등
    rng.ts                     ← mulberry32(seed)
    pieceShape.ts              ← generatePieceShape(kind, seed, presetIndex, size) → 다각형 점 배열
    palette.ts                 ← 유형별 팔레트 6색, 기본 질감 키
  store/
    mosaicStore.ts             ← zustand 스토어 + history
  db/
    db.ts                      ← Dexie 스키마, saveMosaic / loadLatestMosaic
  components/
    canvas/MosaicCanvas.tsx    ← Stage, 그라우트 배경, 조각 렌더, 드래그/회전
    canvas/PieceNode.tsx
    canvas/PieceMenu.tsx       ← 수정/숨기기/흐리게/보관함으로/지우기
    maker/PieceMakerSheet.tsx  ← 하단 시트
    StorageTray.tsx            ← 보관함 (캔버스 밖)
    UndoToast.tsx
  __tests__/ ...

[데이터 모델]
type PieceKind = 'joy' | 'failure' | 'wound' | 'helped' | 'unnamed';
interface Piece {
  id: string; kind: PieceKind; seed: number; presetIndex: 0|1|2;
  size: 'S'|'M'|'L'; color: string; texture: string;
  x: number; y: number;      // 캔버스 대비 상대 좌표 0..1
  rotation: number;          // deg, 제한 없음
  z: number;
  state: 'placed'|'hidden'|'faded'|'stored';
  note?: string;             // 최대 60자
  createdAt: string;
}
interface Mosaic { id: string; title?: string; frame: 'circle'|'rounded'|'none';
  pieces: Piece[]; createdAt: string; updatedAt: string; }

[조각 생성 규칙]
- 같은 (kind, seed, presetIndex, size)는 항상 같은 점 배열을 반환해야 한다.
- 유형별 기본 형태:
  joy: 둥근 다각형(꼭짓점 7~9개, 모서리 곡률 큼)
  failure: 비대칭 사각형에서 한 모서리가 잘린 형태
  wound: 날카로운 각 + 내부에 금(crack) 선 1~3개 (금은 메우거나 금박 처리하지 않는다)
  helped: 두 다각형이 일부 겹친 합성 형태
  unnamed: 완전 무작위 다각형
- 가장자리에 simplex-noise로 미세한 흔들림을 준다.
- 크기 S/M/L = 기준 반지름 36/56/80px.
- 어떤 유형도 더 밝거나 더 예쁘게 보이지 않도록 명도·채도 범위를 비슷하게 맞춘다.

[조각 만들기 시트]
- 유형 선택(5개) → 모양 프리셋 3종 + "다시 깨기"(새 seed) → 크기 3단계 → 색 6개 → 한 줄 메모(선택, 60자)
- 크기 설명 문구: "마음에서 차지하는 정도"
- [캔버스에 놓기] 누르면 캔버스 중앙 근처 무작위 위치에 놓인다. 조각 개수 상한 60개.

[캔버스]
- 배경은 줄눈(grout) 질감의 은은한 패턴. 빈 공간이 허전해 보이지 않게.
- 자유 드래그, 스냅/격자/자동 정렬 없음. 겹침 허용(겹친 조각은 옅은 그림자).
- 선택 시 회전 핸들. 두 손가락 회전도 지원.
- 선택한 조각 메뉴: 수정 / 숨기기 / 흐리게 / 보관함으로 / 지우기.
- 지우기는 확인 대화상자 없이 사라지고 5초간 [되돌리기] 토스트.
- 키보드: Tab으로 조각 선택, 방향키 이동(Shift=10배), Q/E 회전 15°, Delete 지우기, Ctrl+Z / Ctrl+Shift+Z.
- 상단 우측 [다 놓았어요] 버튼은 조각 1개 이상이면 활성. 이번 단계에서는 누르면 콘솔 로그만.
- 화면 어디에도 "채우세요", "완성도", 퍼센트 표시를 넣지 않는다.

[저장]
- 상태 변경 후 2초 디바운스로 IndexedDB에 자동 저장.
- 페이지 진입 시 가장 최근 Mosaic를 불러오고, 없으면 새로 만든다.
- 개발용 [모두 지우기] 버튼(설정 메뉴 안)으로 DB 초기화.

[디자인 토큰 — globals.css]
- 라이트: 배경 따뜻한 미색, 다크: 짙은 숯색. prefers-color-scheme 대응.
- 본문 Pretendard(CDN), 최소 16px. 터치 대상 최소 44×44px.
- 문구는 부드러운 해요체, 느낌표·이모지 금지.

[테스트 — 반드시 작성]
1. rng.test.ts: 같은 seed → 같은 수열
2. pieceShape.test.ts: 5개 유형 × 3 프리셋 × 3 크기에서 같은 입력 → 같은 출력, 점 개수 ≥ 3, 자기교차 없음(간단 검사)
3. mosaicStore.test.ts: add/move/rotate/delete 후 undo·redo가 정확히 복원, 히스토리 31번째부터 오래된 것 폐기, 60개 상한
4. db.test.ts (fake-indexeddb): 저장 후 불러오면 동일
5. copy.test.ts: src 전체 문자열에서 금지어("극복", "이겨내", "완성도", "채워", "!") 미포함

[package.json 스크립트]
"dev", "build", "start", "test"(vitest run), "test:watch", "lint", "typecheck"(tsc --noEmit)

완료 후 README.md에 실행 방법과 STEP 01 수동 테스트 체크리스트를 적어라.
```

---

## 4. 실행 방법

```bash
npm install
npm run dev          # http://localhost:3000/mosaic
npm test             # 단위 테스트
npm run typecheck
npm run lint
npm run build        # 프로덕션 빌드가 깨지지 않는지 확인
```

## 5. 수용 기준 (자동 테스트)

| ID | 기준 | 확인 방법 |
| --- | --- | --- |
| T1-1 | 시드가 같으면 조각 모양이 같다 | `pieceShape.test.ts` |
| T1-2 | undo/redo 30단계가 정확히 복원된다 | `mosaicStore.test.ts` |
| T1-3 | 조각 60개 초과 생성이 막힌다 | `mosaicStore.test.ts` |
| T1-4 | 저장 → 불러오기 결과가 동일하다 | `db.test.ts` |
| T1-5 | 금지 문구가 코드에 없다 | `copy.test.ts` |
| T1-6 | 타입 오류·빌드 오류가 없다 | `npm run typecheck`, `npm run build` |

## 6. 수동 테스트 시나리오

- [ ] 다섯 유형의 조각을 하나씩 만들면 모양과 질감이 서로 다르게 보인다
- [ ] "다시 깨기"를 누를 때마다 모양이 바뀐다
- [ ] 조각을 캔버스 구석, 가장자리, 다른 조각 위 어디에 놓아도 그 자리에 머문다(스냅 없음)
- [ ] 조각을 45°, 170° 등 임의 각도로 돌릴 수 있다
- [ ] 조각 1개만 놓아도 [다 놓았어요]가 활성화된다
- [ ] 지우기 직후 [되돌리기] 토스트로 복원된다
- [ ] 보관함으로 보낸 조각은 캔버스 밖 보관함에 있고, 다시 꺼낼 수 있다
- [ ] 마우스 없이 키보드만으로 조각 선택·이동·회전·삭제가 된다
- [ ] 새로고침해도 모든 조각의 위치·각도·상태가 그대로다
- [ ] OS를 다크 모드로 바꾸면 화면이 어두운 테마로 바뀐다
- [ ] 휴대폰(또는 DevTools 모바일 뷰 375px)에서 드래그와 두 손가락 회전이 된다

## 7. 다음 단계로 넘어가는 조건

위 자동 테스트가 모두 통과하고, 수동 시나리오 중 "스냅 없음", "새로고침 복원", "키보드 조작" 세 항목이 확인되면 STEP 02로 진행한다.
