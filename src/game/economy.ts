import { G, type Inv } from './state';
import { L } from '../i18n';

export const ITEM_KEYS: (keyof Inv)[] = ['ball', 'juice', 'vita'];

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
export const leaderboard: Leaderboard = new LocalLeaderboard();

export function buy(i: number): 'ok' | 'broke' {
  const price = L.items[i][2];
  if (G.yen < price) return 'broke';
  G.yen -= price; G.inv[ITEM_KEYS[i]]++; return 'ok';
}
