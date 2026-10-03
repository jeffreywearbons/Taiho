/**
 * Daily login calendar. Seven days in a row; day 7 is a cosmetic of the player's choice.
 * Missing a day resets the streak to zero. After day 7 a new seven-day cycle starts.
 */
import { G, type ItemKey } from './state';
import { saveProfile } from './profile';
import { maxOf, COSMETICS } from './economy';

export type LoginState = { last: string; streak: number; claimed: string };   // claimed = the date the current day's reward was taken
export type Reward = { yen?: number; item?: ItemKey; n?: number; pick?: true };

export const CALENDAR: Reward[] = [
  { yen: 500 }, { item: 'vita', n: 1 }, { yen: 1000 }, { item: 'peel', n: 1 }, { yen: 1500 }, { item: 'ball', n: 1 }, { pick: true },
];

export const dayKey = (d = new Date()): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayKey = (): string => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };

export const login = { state: { last: '', streak: 0, claimed: '' } as LoginState };

/** Advance the streak for today. Returns true when there is an unclaimed reward waiting. */
export function checkIn(): boolean {
  const s = login.state, today = dayKey();
  if (s.last !== today) {
    s.streak = s.last === yesterdayKey() ? s.streak + 1 : 1;
    s.last = today;
    saveProfile();
  }
  return s.claimed !== today;
}
/** 0-based slot in the seven-day cycle for today. */
export const slot = (): number => (Math.max(1, login.state.streak) - 1) % 7;
export const claimable = (): boolean => login.state.last === dayKey() && login.state.claimed !== dayKey();
export const canPick = (): string[] => COSMETICS.map((c) => c.id).filter((id) => !G.wardrobe.includes(id));

/** Claim today's reward. For day 7 pass the chosen cosmetic id. Returns what was granted. */
export function claim(pickId?: string): Reward | null {
  if (!claimable()) return null;
  const r = CALENDAR[slot()];
  if (r.pick) {
    const choices = canPick();
    if (!choices.length) { G.yen += 5000; login.state.claimed = dayKey(); saveProfile(); return { yen: 5000 }; }   // everything owned already: cash instead
    if (!pickId || !choices.includes(pickId)) return null;
    G.wardrobe.push(pickId);
  }
  if (r.yen) G.yen += r.yen;
  if (r.item) G.inv[r.item] = Math.min(maxOf(r.item), G.inv[r.item] + (r.n ?? 1));
  login.state.claimed = dayKey(); saveProfile();
  return r;
}
