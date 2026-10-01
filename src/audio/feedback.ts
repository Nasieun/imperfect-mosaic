import type { PieceKind } from '@/domain/types';
import { useSettings } from '@/store/settingsStore';

/**
 * 조각을 놓을 때의 짧은 소리와 진동, 그리고 조용한 배경음.
 * 음원 파일 대신 Web Audio로 합성한 플레이스홀더다. 실제 음원으로 바꿀 때는 이 파일만 고치면 된다.
 * 모든 효과음은 200ms 이하, 작은 음량이다.
 */
let ctx: AudioContext | null = null;
let ambient: { gain: GainNode; stop: () => void } | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function noiseBuffer(ac: AudioContext, seconds: number): AudioBuffer {
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function envelope(ac: AudioContext, peak: number, duration: number): GainNode {
  const g = ac.createGain();
  const t = ac.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  g.connect(ac.destination);
  return g;
}

function tone(ac: AudioContext, freq: number, duration: number, peak: number, type: OscillatorType = 'sine') {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(envelope(ac, peak, duration));
  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
}

function noise(ac: AudioContext, duration: number, peak: number, filter: BiquadFilterType, freq: number) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, duration + 0.05);
  const f = ac.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  src.connect(f);
  f.connect(envelope(ac, peak, duration));
  src.start();
  src.stop(ac.currentTime + duration + 0.05);
}

const SOUNDS: Record<PieceKind, (ac: AudioContext) => void> = {
  joy: (ac) => tone(ac, 660, 0.16, 0.06), // 세라믹 톡
  failure: (ac) => noise(ac, 0.09, 0.08, 'lowpass', 700), // 돌 톡
  wound: (ac) => {
    tone(ac, 2400, 0.12, 0.025); // 유리 찰랑
    tone(ac, 3600, 0.09, 0.015);
  },
  helped: (ac) => noise(ac, 0.14, 0.04, 'bandpass', 1200), // 천 스침
  unnamed: (ac) => noise(ac, 0.07, 0.04, 'highpass', 2500), // 종이
};

/** 조각이 캔버스에 안착했을 때 */
export function pieceLanded(kind: PieceKind) {
  const { sound, haptic } = useSettings.getState();
  if (sound) {
    const ac = audio();
    if (ac) SOUNDS[kind](ac);
  }
  if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(10);
    } catch {
      // 지원하지 않는 환경은 무시
    }
  }
}

/** 배경음: 낮게 걸러낸 잡음에 아주 느린 숨결 같은 흔들림. 단계가 바뀌어도 끊기지 않는다. */
export function syncAmbient() {
  const { sound, ambientVolume } = useSettings.getState();
  if (!sound || ambientVolume <= 0) {
    ambient?.stop();
    ambient = null;
    return;
  }
  const ac = audio();
  if (!ac) return;
  if (ambient) {
    ambient.gain.gain.setTargetAtTime(ambientVolume * 0.05, ac.currentTime, 0.4);
    return;
  }
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 4);
  src.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  const gain = ac.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(ambientVolume * 0.05, ac.currentTime, 1.2);
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 120;
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  src.connect(lp);
  lp.connect(gain);
  gain.connect(ac.destination);
  src.start();
  lfo.start();
  ambient = {
    gain,
    stop: () => {
      gain.gain.setTargetAtTime(0, ac.currentTime, 0.3);
      window.setTimeout(() => {
        src.stop();
        lfo.stop();
      }, 1200);
    },
  };
}
