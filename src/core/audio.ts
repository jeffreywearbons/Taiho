let AC: AudioContext | null = null;
export function audioInit(): void {
  if (AC) return;
  try { AC = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { AC = null; }
}
function beep(f: number, d: number, type: OscillatorType = 'square', vol = 0.05, when = 0): void {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f; o.connect(g); g.connect(AC.destination);
  const t = AC.currentTime + when;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.start(t); o.stop(t + d);
}
export type Sfx = 'blip' | 'jump' | 'smash' | 'chase' | 'catch' | 'escape' | 'level';
export function sfx(k: Sfx): void {
  if (!AC) return;
  if (AC.state === 'suspended') void AC.resume();
  switch (k) {
    case 'blip': beep(880, 0.05); break;
    case 'jump': beep(440, 0.08, 'triangle', 0.06); break;
    case 'smash': beep(120, 0.15, 'sawtooth', 0.08); break;
    case 'chase': beep(660, 0.08); beep(880, 0.08, 'square', 0.05, 0.09); break;
    case 'catch': [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.12, 'square', 0.06, i * 0.09)); break;
    case 'escape': [400, 350, 300, 200].forEach((f, i) => beep(f, 0.18, 'triangle', 0.06, i * 0.15)); break;
    case 'level': [659, 784, 988, 1319].forEach((f, i) => beep(f, 0.1, 'square', 0.05, i * 0.07)); break;
  }
}
