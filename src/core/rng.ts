/** Small seedable RNG (mulberry32) so layouts and tests can be reproduced. */
let seed = (Date.now() >>> 0) || 1;
export function reseed(s: number): void { seed = s >>> 0 || 1; }
export function random(): number {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rnd = (a: number, b: number): number => a + random() * (b - a);
export const rint = (a: number, b: number): number => Math.floor(rnd(a, b + 1));
export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(random() * arr.length)];
