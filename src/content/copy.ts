import type { Mosaic, PieceKind, PieceSize, PieceState, TextureKey } from '@/domain/types';

export const TEXTURE_LABEL: Record<TextureKey, string> = {
  ceramic: '세라믹',
  stone: '석재',
  glass: '유리',
  fabric: '패브릭',
  paper: '종이',
};

export const FRAME_LABEL: Record<Mosaic['frame'], string> = {
  none: '틀 없음',
  circle: '원',
  rounded: '둥근 사각',
};

/**
 * 화면에 보이는 모든 문구.
 * 부드러운 해요체, 문장당 40자 이내, 느낌표·이모지 금지.
 * 회복이나 채움을 요구하는 말, 경험을 평가하는 말은 쓰지 않는다.
 */
export const KIND_LABEL: Record<PieceKind, string> = {
  joy: '기쁨',
  failure: '실패',
  wound: '상처',
  helped: '도움받았던 순간',
  unnamed: '이름 없는 조각',
};

export const KIND_HINT: Record<PieceKind, string> = {
  joy: '빛을 받아 따뜻하게 빛나던 순간',
  failure: '계획대로 되지 않았던 일',
  wound: '아직 마음에 남아 있는 아픔',
  helped: '누군가와 맞닿았던 자리',
  unnamed: '아직 이름 붙이고 싶지 않은 경험',
};

export const SIZE_LABEL: Record<PieceSize, string> = { S: '작게', M: '보통', L: '크게' };
export const SIZE_SPOKEN: Record<PieceSize, string> = { S: '작은 크기', M: '보통 크기', L: '큰 크기' };

export const STATE_LABEL: Record<PieceState, string> = {
  placed: '',
  hidden: '숨김',
  faded: '흐리게',
  stored: '보관함',
};

export const COPY = {
  appTitle: '불완전한 모자이크',
  landingLine: '완벽하지 않은 나도 하나의 모습이 됩니다.',
  landingCta: '모자이크 놓아 보기',
  mosaicTitle: '나의 모자이크',
  done: '다 놓았어요',
  makePiece: '조각 만들기',
  storage: '보관함',
  undo: '되돌리기',
  redo: '다시하기',
  emptyCanvas: '조각 하나만 있어도 괜찮아요. 원하는 곳에 놓아 보세요.',
  canvasLabel: '모자이크 캔버스. Tab으로 조각을 고르고 방향키로 옮길 수 있어요.',
  keyboardHelp: 'Tab 조각 선택 · 방향키 이동(Shift 크게) · Q/E 회전 · Delete 지우기',

  makerTitle: '조각 만들기',
  makerEditTitle: '조각 바꾸기',
  makerKind: '어떤 경험인가요',
  makerShape: '모양',
  makerRebreak: '다시 깨기',
  makerSize: '크기',
  makerSizeHint: '마음에서 차지하는 정도',
  makerColor: '색',
  makerNote: '한 줄 메모 (선택)',
  makerNotePlaceholder: '적지 않아도 괜찮아요',
  makerNoteHint: '메모는 길게 누를 때만 보여요.',
  makerPlace: '캔버스에 놓기',
  makerApply: '이대로 바꾸기',
  makerClose: '닫기',
  makerLimit: '조각은 60개까지 놓을 수 있어요.',
  makerTexture: '질감',
  makerTextureHint: '유형과 다르게 골라도 괜찮아요',
  makerKeywords: '키워드 (선택)',
  makerKeywordsHint: '메모 대신 골라도 돼요',

  frame: '틀',
  menuUp: '위로 옮기기',
  menuDown: '아래로 옮기기',
  menuLeft: '왼쪽으로 옮기기',
  menuRight: '오른쪽으로 옮기기',

  menuEdit: '수정',
  menuHide: '숨기기',
  menuShow: '다시 보이기',
  menuFade: '흐리게',
  menuUnfade: '선명하게',
  menuStore: '보관함으로',
  menuDelete: '지우기',
  menuRotateLeft: '왼쪽으로 돌리기',
  menuRotateRight: '오른쪽으로 돌리기',

  trayTitle: '보관함',
  trayHint: '만들었지만 아직 놓고 싶지 않은 조각을 두는 곳이에요.',
  trayEmpty: '보관함이 비어 있어요.',
  trayTakeOut: '꺼내기',

  toastDeleted: '조각을 지웠어요.',

  settings: '설정',
  clearAll: '모두 지우기',
  clearConfirm: '이 기기에 저장된 모자이크를 모두 지울까요? 지운 뒤에는 되돌릴 수 없어요.',
  savedLocal: '이 기기에만 저장돼요.',

  settingsTitle: '설정',
  settingsSound: '효과음',
  settingsSoundHint: '조각을 놓을 때 짧은 소리가 나요.',
  settingsAmbient: '배경음 크기',
  settingsHaptic: '진동',
  settingsHapticHint: '휴대폰에서 조각이 놓일 때 한 번 가볍게 울려요.',
  settingsSimple: '가벼운 화면',
  settingsSimpleHint: '질감과 그림자를 줄여 오래된 기기에서도 부드럽게 움직여요.',
  settingsPrivacy: '모든 기록은 이 기기에만 저장돼요. 메모는 어디에도 보내지 않아요.',

  myTitle: '내 모자이크',
  mySub: '만든 날짜순으로 모아 두었어요.',
  myEmpty: '아직 저장한 모자이크가 없어요.',
  myContinue: '이어서 놓기',
  myDelete: '지우기',
  myDeleteConfirm: '이 모자이크를 지울까요? 되돌릴 수 없어요.',
  myUntitled: '제목 없는 모자이크',
  myNew: '새로 만들기',
  myBack: '처음으로',

  continueTitle: '이어서 놓기',
  newMosaic: '새로 만들기',
  agedToggle: '이전 조각에 오래된 톤 입히기',
  myLink: '내 모자이크 보기',
} as const;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function describePiece(kindLabel: string, sizeSpoken: string, where: string, rotation: number): string {
  const deg = Math.round(((rotation % 360) + 360) % 360);
  return `${kindLabel} 조각, ${sizeSpoken}, ${where}, ${deg}도`;
}

export function describeWhere(x: number, y: number): string {
  const h = x < 0.34 ? '왼쪽' : x > 0.66 ? '오른쪽' : '가운데';
  const v = y < 0.34 ? '위' : y > 0.66 ? '아래' : '';
  if (h === '가운데' && !v) return '화면 가운데';
  return `화면 ${h}${v ? ' ' + v : ''}`;
}
