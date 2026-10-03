/**
 * All sound is synthesized with WebAudio: no audio files, nothing to license.
 * sfx() plays short effects; music handles two looping chiptune tracks.
 */
let AC: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
try { muted = localStorage.getItem('taiho_mute') === '1'; } catch { /* ignore */ }

export function audioInit(): void {
  if (AC) return;
  try {
    AC = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted ? 0 : 1; master.connect(AC.destination);
    document.addEventListener('visibilitychange', () => { if (!AC) return; if (document.hidden) void AC.suspend(); else void AC.resume(); });
  } catch { AC = null; }
}
export const isMuted = (): boolean => muted;
export function setMuted(m: boolean): void {
  muted = m; if (master) master.gain.value = m ? 0 : 1;
  try { localStorage.setItem('taiho_mute', m ? '1' : '0'); } catch { /* ignore */ }
}
const resume = (): void => { if (AC && AC.state === 'suspended') void AC.resume(); };

function tone(f: number, d: number, type: OscillatorType = 'square', vol = 0.05, when = 0, slideTo?: number): void {
  if (!AC || !master) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f; o.connect(g); g.connect(master);
  const t = AC.currentTime + when;
  if (slideTo) o.frequency.linearRampToValueAtTime(slideTo, t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.start(t); o.stop(t + d);
}
let noiseBuf: AudioBuffer | null = null;
function noise(d: number, vol = 0.04, when = 0, hp = 2000): void {
  if (!AC || !master) return;
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const s = AC.createBufferSource(); s.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
  const g = AC.createGain(); s.connect(f); f.connect(g); g.connect(master);
  const t = AC.currentTime + when; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
  s.start(t); s.stop(t + d);
}

export type Sfx = 'blip' | 'jump' | 'smash' | 'chase' | 'catch' | 'escape' | 'level' | 'buy' | 'throw' | 'notyet' | 'bail';
export function sfx(k: Sfx): void {
  if (!AC) return; resume();
  switch (k) {
    case 'blip': tone(880, 0.05); break;
    case 'jump': tone(330, 0.12, 'triangle', 0.06, 0, 660); break;
    case 'smash': tone(110, 0.18, 'sawtooth', 0.08); noise(0.15, 0.06, 0, 800); break;
    case 'chase': tone(660, 0.08); tone(880, 0.08, 'square', 0.05, 0.09); tone(1175, 0.12, 'square', 0.05, 0.18); break;
    case 'catch': [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, 'square', 0.06, i * 0.07)); noise(0.2, 0.05, 0, 3000); break;
    case 'escape': tone(500, 0.6, 'triangle', 0.07, 0, 120); break;
    case 'level': [659, 784, 988, 1319, 1568].forEach((f, i) => tone(f, 0.12, 'square', 0.05, i * 0.07)); break;
    case 'buy': tone(1568, 0.06, 'square', 0.05); tone(2093, 0.14, 'square', 0.05, 0.07); break;
    case 'throw': tone(900, 0.1, 'triangle', 0.05, 0, 300); break;
    case 'notyet': tone(220, 0.1, 'square', 0.04); tone(185, 0.14, 'square', 0.04, 0.1); break;
    case 'bail': tone(1200, 0.05, 'square', 0.05); tone(900, 0.08, 'square', 0.05, 0.06); break;
  }
}

// ---------------- music ----------------
// A pattern is a list of 16th steps per voice: MIDI note number, or 0 for rest.
// Voices: lead (square), bass (triangle), hat (noise). Tracks are original.
type Track = { bpm: number; lead: number[]; bass: number[]; hat: number[] };
const N = (s: string): number[] => s.trim().split(/\s+/).map((t) => (t === '.' ? 0 : Number(t)));

// Store loop: bright, bouncy, major. 8 bars.
const STORE: Track = {
  bpm: 124,
  lead: N(`
    72 . 76 . 79 . 76 . 72 . 76 . 79 81 79 .
    77 . 81 . 84 . 81 . 77 . 76 . 74 . 72 .
    72 . 76 . 79 . 76 . 72 . 76 . 79 81 79 .
    77 . 79 . 81 . 79 . 77 76 74 . 72 . . .
    74 . 77 . 81 . 77 . 74 . 77 . 81 83 81 .
    72 . 76 . 79 . 76 . 72 . 76 . 79 . . .
    77 . 79 . 81 . 84 . 81 . 79 . 77 . 76 .
    74 . 76 . 77 . 79 . 72 . . . . . . .`),
  bass: N(`
    48 . . . 48 . 55 . 48 . . . 48 . 55 .
    53 . . . 53 . 60 . 53 . . . 55 . 53 .
    48 . . . 48 . 55 . 48 . . . 48 . 55 .
    53 . . . 55 . . . 48 . . . 48 . 55 .
    50 . . . 50 . 57 . 50 . . . 50 . 57 .
    48 . . . 48 . 55 . 48 . . . 48 . 55 .
    53 . . . 53 . 60 . 55 . . . 55 . 62 .
    50 . . . 55 . . . 48 . . . 48 . . .`),
  hat: N(`1 . 1 . 1 . 1 1 1 . 1 . 1 . 1 1`),
};
// Chase loop: fast, minor, driving. 4 bars.
const CHASE: Track = {
  bpm: 168,
  lead: N(`
    69 . 69 72 . 69 . 67 69 . 72 . 76 . 75 .
    72 . 72 75 . 72 . 71 72 . 75 . 79 . 77 .
    69 . 69 72 . 69 . 67 69 . 72 . 76 . 79 .
    77 . 76 . 75 . 74 . 72 . 71 . 69 . . .`),
  bass: N(`
    45 45 45 45 45 45 45 45 48 48 48 48 48 48 48 48
    41 41 41 41 41 41 41 41 43 43 43 43 43 43 43 43
    45 45 45 45 45 45 45 45 48 48 48 48 48 48 48 48
    41 41 41 41 43 43 43 43 44 44 44 44 47 47 47 47`),
  hat: N(`1 . 1 . 1 . 1 . 1 . 1 . 1 1 1 .`),
};
const TRACKS: Record<string, Track> = { store: STORE, chase: CHASE };
const midi = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

let current: string | null = null; let step = 0; let nextT = 0; let timer: number | null = null;
function schedule(): void {
  if (!AC || !master || !current) return;
  const tr = TRACKS[current]; const dt = 60 / tr.bpm / 4;
  while (nextT < AC.currentTime + 0.12) {
    const i = step % tr.lead.length, j = step % tr.bass.length, h = step % tr.hat.length;
    const when = Math.max(0, nextT - AC.currentTime);
    if (tr.lead[i]) tone(midi(tr.lead[i]), dt * 0.9, 'square', 0.028, when);
    if (tr.bass[j]) tone(midi(tr.bass[j]), dt * 0.8, 'triangle', 0.05, when);
    if (tr.hat[h]) noise(0.03, 0.012, when, 6000);
    nextT += dt; step++;
  }
}
export const music = {
  play(name: 'store' | 'chase'): void {
    if (!AC) return; resume();
    if (current === name) return;
    current = name; step = 0; nextT = AC.currentTime + 0.05;
    if (timer === null) timer = window.setInterval(schedule, 30);
  },
  stop(): void { current = null; if (timer !== null) { clearInterval(timer); timer = null; } },
  playing(): string | null { return current; },
};
