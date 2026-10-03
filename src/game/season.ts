/**
 * Season pass. One season at a time, eight weeks. Catches earn season points; every 8 points is a tier.
 * The free track pays yen and items; the premium track (the 'pass_<season>' set) adds cosmetics and an
 * exclusive aura at the top. Claims persist in the profile and reset when the season id changes.
 */
import { G, type ItemKey } from './state';
import { saveProfile } from './profile';
import { maxOf } from './economy';
import { hasSet } from './purchases';

export const SEASON = { id: 's1', start: '2026-10-01', weeks: 8, tiers: 30, pointsPerTier: 8, catchPoints: 1, bossPoints: 3 };
export type TierReward = { yen?: number; item?: ItemKey; n?: number; cosmetic?: string };
export type SeasonState = { id: string; points: number; free: number[]; prem: number[] };

const FREE_ITEMS: ItemKey[] = ['vita', 'peel', 'juice', 'senzu', 'ball', 'shield'];
const PREM_COSMETICS: Record<number, string> = { 5: 'trail_neon', 10: 'aura_sakura', 15: 'clerk_red', 20: 'police', 25: 'trail_fire', 30: 'aura_s1' };
export function freeReward(tier: number): TierReward { return tier % 5 === 0 ? { item: FREE_ITEMS[(tier / 5 - 1) % FREE_ITEMS.length], n: 1 } : { yen: 300 }; }
export function premReward(tier: number): TierReward { return PREM_COSMETICS[tier] ? { cosmetic: PREM_COSMETICS[tier] } : tier % 3 === 0 ? { item: 'ball', n: 1 } : { yen: 600 }; }

export const season = { state: { id: SEASON.id, points: 0, free: [], prem: [] } as SeasonState };
export const seasonEnd = (): Date => { const d = new Date(SEASON.start + 'T00:00:00'); d.setDate(d.getDate() + SEASON.weeks * 7); return d; };
export const seasonActive = (): boolean => Date.now() < seasonEnd().getTime();
export const daysLeft = (): number => Math.max(0, Math.ceil((seasonEnd().getTime() - Date.now()) / 86400000));
export const tier = (): number => Math.min(SEASON.tiers, Math.floor(season.state.points / SEASON.pointsPerTier));
export const hasPremium = (): boolean => hasSet('pass_' + SEASON.id);

export function ensureSeason(): void { if (season.state.id !== SEASON.id) season.state = { id: SEASON.id, points: 0, free: [], prem: [] }; }
export function addSeasonPoints(n: number): void { if (!seasonActive()) return; ensureSeason(); season.state.points += n; saveProfile(); }

function grant(r: TierReward): void {
  if (r.yen) G.yen += r.yen;
  if (r.item) G.inv[r.item] = Math.min(maxOf(r.item), G.inv[r.item] + (r.n ?? 1));
  if (r.cosmetic && !G.wardrobe.includes(r.cosmetic)) G.wardrobe.push(r.cosmetic);
}
export function claimTier(t: number, track: 'free' | 'prem'): TierReward | null {
  ensureSeason();
  if (t < 1 || t > tier()) return null;
  const list = track === 'free' ? season.state.free : season.state.prem;
  if (list.includes(t)) return null;
  if (track === 'prem' && !hasPremium()) return null;
  const r = track === 'free' ? freeReward(t) : premReward(t);
  grant(r); list.push(t); saveProfile(); return r;
}
export const unclaimed = (): number => { let n = 0; for (let t = 1; t <= tier(); t++) { if (!season.state.free.includes(t)) n++; if (hasPremium() && !season.state.prem.includes(t)) n++; } return n; };
