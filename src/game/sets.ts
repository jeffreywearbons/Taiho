/**
 * Real-money products. Sets are direct unlocks of cosmetics (plus a starter pack of consumables),
 * never currency. The same ids exist on the App Store, Google Play and Stripe.
 */
import type { ItemKey } from './state';

export interface SetDef { id: string; cosmetics: string[]; items?: Partial<Record<ItemKey, number>>; yen: number; usd: number; everything?: boolean }

export const SETS: SetDef[] = [
  { id: 'starter', cosmetics: ['clerk_blue'], items: { ball: 2, juice: 2, vita: 2, senzu: 1 }, yen: 160, usd: 0.99 },
  { id: 'konbini', cosmetics: ['clerk_stripe', 'clerk_blue', 'clerk_green', 'clerk_red', 'clerk_yellow'], yen: 480, usd: 2.99 },
  { id: 'police', cosmetics: ['police'], yen: 360, usd: 1.99 },
  { id: 'shonen', cosmetics: ['gi', 'ninja', 'straw'], yen: 980, usd: 6.99 },
  { id: 'trainer', cosmetics: ['trainer', 'aura_lightning'], yen: 780, usd: 4.99 },
  { id: 'darkknight', cosmetics: ['dark', 'aura_smoke', 'trail_bats'], yen: 1480, usd: 9.99 },
  { id: 'auras', cosmetics: ['aura_shonen', 'aura_lightning', 'aura_smoke', 'aura_sakura'], yen: 480, usd: 2.99 },
  { id: 'trails', cosmetics: ['trail_sakura', 'trail_bats', 'trail_neon', 'trail_fire'], yen: 360, usd: 1.99 },
  { id: 'everything', cosmetics: [], everything: true, yen: 2480, usd: 16.99 },
];
export const setById = (id: string): SetDef | undefined => SETS.find((s) => s.id === id);
