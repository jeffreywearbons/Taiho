import { G } from './state';
import { dims, cur } from './maps';
import { random } from '../core/rng';

/**
 * Level 100+: pervs that have studied the player. Every catch feeds a small profile (where on the floor
 * catches happen, from which side the hero closes in, which items finish the job) and each chase picks an
 * evasion style with Thompson sampling over how often that style has escaped. The profile is part of the
 * save, decays so the player can change habits, and stays inside the level-100 speed curve: the pervs get
 * smarter, never faster. Below level 100 none of this runs.
 */
export const ADAPT_LEVEL = 100;
export type Strategy = 'far' | 'zigzag' | 'avoid' | 'hall' | 'juke' | 'wary';
export const STRATEGIES: readonly Strategy[] = ['far', 'zigzag', 'avoid', 'hall', 'juke', 'wary'];
const ZONES = 4;          // catch heatmap is a 4x4 grid over the floor
const DECAY = 0.96;       // per outcome, so ~25 chases of memory

export interface AdaptState {
  v: 1;
  heat: number[];                          // ZONES*ZONES catch counts, decayed
  ax: number; ay: number; n: number;       // mean sign of (perv - hero) at the catch, and the sample weight
  items: Record<string, number>;           // which items finished chases
  bandit: Record<Strategy, [number, number]>; // [escapes, catches] per style
}
export const blankAdapt = (): AdaptState => ({ v: 1, heat: new Array(ZONES * ZONES).fill(0), ax: 0, ay: 0, n: 0, items: {}, bandit: { far: [0, 0], zigzag: [0, 0], avoid: [0, 0], hall: [0, 0], juke: [0, 0], wary: [0, 0] } });
export const adapt = { state: blankAdapt() };

export const adaptive = (): boolean => G.level >= ADAPT_LEVEL;
const zone = (x: number, y: number): number => Math.min(ZONES - 1, Math.floor((x / dims.w) * ZONES)) + Math.min(ZONES - 1, Math.floor((y / dims.h) * ZONES)) * ZONES;

/** The hero caught a perv: remember where, from which side, and with what. */
export function recordCatch(hero: { tx: number; ty: number }, perv: { tx: number; ty: number }, used: readonly string[], byBall: boolean): void {
  const s = adapt.state;
  for (let i = 0; i < s.heat.length; i++) s.heat[i] *= DECAY;
  s.heat[zone(perv.tx, perv.ty)] += 1;
  const dx = Math.sign(perv.tx - hero.tx), dy = Math.sign(perv.ty - hero.ty);
  const w = Math.min(s.n, 20); s.ax = (s.ax * w + dx) / (w + 1); s.ay = (s.ay * w + dy) / (w + 1); s.n++;
  for (const k of Object.keys(s.items)) s.items[k] *= DECAY;
  for (const k of new Set(used)) s.items[k] = (s.items[k] ?? 0) + 1;
  if (byBall) s.items.ball = (s.items.ball ?? 0) + 1;
}
/** How the chosen style did; escapes count as wins for the perv. Everything decays so old habits fade. */
export function recordOutcome(strat: Strategy, caught: boolean): void {
  const b = adapt.state.bandit;
  for (const k of STRATEGIES) { b[k][0] *= DECAY; b[k][1] *= DECAY; }
  b[strat][caught ? 1 : 0] += 1;
}
/** 0..1: how much of the recent catch history happened in this tile's zone. */
export function heatAt(x: number, y: number): number {
  const h = adapt.state.heat; const max = Math.max(...h); return max > 0 ? h[zone(x, y)] / max : 0;
}
/** Side the hero usually closes from, as the mean sign of (perv - hero). */
export const approach = (): { ax: number; ay: number } => ({ ax: adapt.state.ax, ay: adapt.state.ay });
/** Items the player leans on (decayed counts), e.g. to decide how wary of decoys to be. */
export const leansOn = (k: string): number => adapt.state.items[k] ?? 0;

// Marsaglia-Tsang gamma sampler (shape >= 1) and a Beta draw from two gammas.
function gamma(k: number, rng: () => number): number {
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do { const u1 = rng() || 1e-9, u2 = rng(); x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); v = 1 + c * x; } while (v <= 0);
    v = v * v * v; const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
const beta = (a: number, b: number, rng: () => number): number => { const x = gamma(a, rng), y = gamma(b, rng); return x / (x + y); };

/** Thompson sampling: the style with the luckiest draw from its escape/catch record. */
export function chooseStrategy(rng: () => number = random, allowHall = !!cur.arena): Strategy {
  let best: Strategy = 'far', bestV = -1;
  for (const s of STRATEGIES) {
    if (s === 'hall' && !allowHall) continue;
    const [w, l] = adapt.state.bandit[s];
    const v = beta(w + 1, l + 1, rng);
    if (v > bestV) { bestV = v; best = s; }
  }
  return best;
}
