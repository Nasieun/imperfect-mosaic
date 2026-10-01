import { create } from 'zustand';

export interface Settings {
  /** 효과음 (기본 끔) */
  sound: boolean;
  /** 배경음 볼륨 0..1 (사운드가 켜져 있을 때만) */
  ambientVolume: number;
  /** 조각이 놓일 때 약한 진동 (기본 켬, 모바일만) */
  haptic: boolean;
  /** 질감·그림자를 줄인 가벼운 모드. null이면 기기 성능으로 자동 결정 */
  simpleTextures: boolean | null;
}

const KEY = 'imperfect-mosaic:settings';
export const DEFAULT_SETTINGS: Settings = { sound: false, ambientVolume: 0.4, haptic: true, simpleTextures: null };

function read(): Settings {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function write(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // 저장할 수 없는 환경에서는 이번 방문 동안만 유지한다.
  }
}

interface SettingsState extends Settings {
  hydrated: boolean;
  hydrate: () => void;
  update: (patch: Partial<Settings>) => void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ ...read(), hydrated: true });
  },
  update: (patch) => {
    const { sound, ambientVolume, haptic, simpleTextures } = { ...get(), ...patch };
    const next = { sound, ambientVolume, haptic, simpleTextures };
    write(next);
    set(next);
  },
}));

/** 저사양 기기 추정: 코어 4개 이하 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  return cores <= 4;
}

export function useSimpleTextures(): boolean {
  const pref = useSettings((s) => s.simpleTextures);
  return pref ?? isLowEndDevice();
}
