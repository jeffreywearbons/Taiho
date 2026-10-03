import { G, type Inv, type ItemKey } from './state';
import { api } from './api';
import { saveProfile } from './profile';

/** The register catalog. Prices are steep on purpose: an item should take several catches to earn. */
export const CATALOG: { key: ItemKey; price: number; kind: 'active' | 'passive' }[] = [
  { key: 'ball', price: 3000, kind: 'active' },
  { key: 'net', price: 4500, kind: 'active' },
  { key: 'peel', price: 1200, kind: 'active' },
  { key: 'decoy', price: 1800, kind: 'active' },
  { key: 'stop', price: 2000, kind: 'active' },
  { key: 'cart', price: 2500, kind: 'active' },
  { key: 'juice', price: 1200, kind: 'passive' },
  { key: 'vita', price: 800, kind: 'passive' },
  { key: 'shield', price: 1500, kind: 'passive' },
  { key: 'charm', price: 2000, kind: 'passive' },
];
export const ITEM_KEYS: ItemKey[] = CATALOG.map((c) => c.key);

/** Wardrobe: purely cosmetic, priced to be a long-term goal. Ordered most to least expensive. */
export type CosmeticKind = 'costume' | 'aura' | 'trail';
export const COSMETICS: { id: string; price: number; kind: CosmeticKind }[] = [
  { id: 'dark', price: 50000, kind: 'costume' },
  { id: 'trainer', price: 30000, kind: 'costume' },
  { id: 'police', price: 20000, kind: 'costume' },
  { id: 'clerk_stripe', price: 12000, kind: 'costume' },
  { id: 'clerk_blue', price: 12000, kind: 'costume' },
  { id: 'clerk_green', price: 12000, kind: 'costume' },
  { id: 'clerk_red', price: 12000, kind: 'costume' },
  { id: 'clerk_yellow', price: 12000, kind: 'costume' },
  { id: 'aura_shonen', price: 8000, kind: 'aura' },
  { id: 'aura_lightning', price: 8000, kind: 'aura' },
  { id: 'aura_smoke', price: 8000, kind: 'aura' },
  { id: 'aura_sakura', price: 8000, kind: 'aura' },
  { id: 'trail_sakura', price: 6000, kind: 'trail' },
  { id: 'trail_bats', price: 6000, kind: 'trail' },
  { id: 'trail_neon', price: 6000, kind: 'trail' },
  { id: 'trail_fire', price: 6000, kind: 'trail' },
];
export const cosmeticKind = (id: string): CosmeticKind => COSMETICS.find((c) => c.id === id)?.kind ?? 'costume';
export function buyCosmetic(id: string): 'ok' | 'broke' | 'owned' {
  const c = COSMETICS.find((x) => x.id === id)!;
  if (G.wardrobe.includes(id)) return 'owned';
  if (G.yen < c.price) return 'broke';
  G.yen -= c.price; G.wardrobe.push(id); saveProfile(); return 'ok';
}
export const priceOf = (k: ItemKey): number => CATALOG.find((c) => c.key === k)!.price;

export type ScoreRow = { name: string; catches: number; level: number; lang: string; ts: number };

/** Leaderboard storage. Local for now; a remote backend drops in behind the same interface. */
export interface Leaderboard { top(n: number): Promise<ScoreRow[]>; submit(row: ScoreRow): Promise<boolean>; readonly shared: boolean; }

export class LocalLeaderboard implements Leaderboard {
  readonly shared = false;
  private read(): ScoreRow[] { try { return JSON.parse(localStorage.getItem('taiho_board') || '[]'); } catch { return []; } }
  async top(n: number): Promise<ScoreRow[]> { return this.read().sort((a, b) => b.catches - a.catches).slice(0, n); }
  async submit(row: ScoreRow): Promise<boolean> {
    try { const b = this.read(); b.push(row); b.sort((a, c) => c.catches - a.catches); localStorage.setItem('taiho_board', JSON.stringify(b.slice(0, 50))); return true; } catch { return false; }
  }
}
/** Uses the Worker when the build has an API URL; otherwise, or when the network fails, the device-local board. */
export class RemoteLeaderboard implements Leaderboard {
  private local = new LocalLeaderboard();
  shared = api.enabled;
  async top(n: number): Promise<ScoreRow[]> {
    const r = await api.topScores(n);
    if (r && r.rows) { this.shared = true; return r.rows.map((x) => ({ name: x.name, catches: x.catches, level: x.level, lang: x.lang, ts: x.ts })); }
    this.shared = false; return this.local.top(n);
  }
  async submit(row: ScoreRow): Promise<boolean> {
    await this.local.submit(row);
    const r = await api.postScore(row); this.shared = !!r; return !!r;
  }
}
export const leaderboard: Leaderboard = api.enabled ? new RemoteLeaderboard() : new LocalLeaderboard();

export function buy(k: ItemKey): 'ok' | 'broke' {
  const price = priceOf(k);
  if (G.yen < price) return 'broke';
  G.yen -= price; G.inv[k]++;
  const active = CATALOG.find((c) => c.key === k)!.kind === 'active';
  if (!G.inv[G.equip] && active) G.equip = k;
  if (active) { try { if (!localStorage.getItem('taiho_tbuy')) { localStorage.setItem('taiho_tbuy', '1'); G.pendingTutBuy = true; } } catch { /* ignore */ } }
  saveProfile(); return 'ok';
}
/** Cycle B to the next active item the player owns. */
export function cycleEquip(): ItemKey | null {
  const owned = CATALOG.filter((c) => c.kind === 'active' && G.inv[c.key] > 0).map((c) => c.key);
  if (!owned.length) return null;
  const i = owned.indexOf(G.equip); G.equip = owned[(i + 1) % owned.length]; return G.equip;
}
