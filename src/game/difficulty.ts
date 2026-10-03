/**
 * Levels 1-100 are a tuned curve: anchor values at a few levels, linearly
 * interpolated between them. A balance change is a data edit here.
 */
export type PervParams = {
  speed: number;      // perv speed relative to player base
  rerollSec: number;  // seconds between evasion re-rolls
  feint: number;      // chance a re-roll is a random feint
  windowSec: number;  // Recording window length
  obsRate: number;    // seconds between random obstacle spawns in a chase
  pervs: number;      // concurrent pervs
};

type Anchors = Record<keyof PervParams, Record<number, number>>;

export const ANCHORS: Anchors = {
  speed:     { 1: 0.85, 25: 0.95, 50: 1.0, 75: 1.05, 100: 1.1 },
  rerollSec: { 1: 2.0, 25: 1.5, 50: 1.0, 75: 0.7, 100: 0.5 },
  feint:     { 1: 0.0, 25: 0.15, 50: 0.3, 75: 0.45, 100: 0.55 },
  windowSec: { 1: 10, 25: 8, 50: 7, 75: 6, 100: 5 },
  obsRate:   { 1: 1.6, 25: 1.2, 50: 0.9, 75: 0.7, 100: 0.6 },
  pervs:     { 1: 2, 25: 2, 50: 3, 75: 3, 100: 4 },
};

export function pervParams(level: number): PervParams {
  const L = Math.max(1, Math.min(level, 100));
  const out: Partial<PervParams> = {};
  for (const key of Object.keys(ANCHORS) as (keyof PervParams)[]) {
    const pts = ANCHORS[key];
    const ks = Object.keys(pts).map(Number).sort((a, b) => a - b);
    const hi = ks.find((k) => k >= L) ?? 100;
    const lo = [...ks].reverse().find((k) => k <= L) ?? 1;
    const t = hi === lo ? 0 : (L - lo) / (hi - lo);
    out[key] = pts[lo] + (pts[hi] - pts[lo]) * t;
  }
  return out as PervParams;
}
