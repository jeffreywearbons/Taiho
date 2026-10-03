import { G, type Stats, type Inv, emptyInv } from './state';
import { api } from './api';

/** Career progress that outlives a run. Kept on the device and mirrored to the cloud when an API is configured. */
import { goals, type Daily } from './goals';
import { login, type LoginState } from './login';
import { season, type SeasonState } from './season';
export interface Profile { v: 1; level: number; xp: number; stats: Stats; yen: number; inv: Inv; totalCatches: number; ts: number; daily?: Daily; bossDone?: number; wardrobe?: string[]; wearing?: string | null; aura?: string | null; trail?: string | null; bestStreak?: number; login?: LoginState; season?: SeasonState }

const KEY = 'taiho_profile';
export const blank = (): Profile => ({ v: 1, level: 1, xp: 0, stats: { speed: 0, detect: 0, strength: 0 }, yen: 0, inv: emptyInv(), totalCatches: 0, ts: 0 });

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const p = JSON.parse(raw) as Profile; if (p && p.v === 1) return { ...blank(), ...p }; }
    const legacy = Number(localStorage.getItem('taiho_total') || 0) || 0;
    return { ...blank(), totalCatches: legacy };
  } catch { return blank(); }
}
export function applyProfile(p: Profile): void {
  G.level = p.level; G.xp = p.xp; G.stats = { ...p.stats }; G.yen = p.yen; G.inv = { ...emptyInv(), ...p.inv }; G.totalCatches = p.totalCatches; G.bossDone = p.bossDone ?? 0; G.wardrobe = [...(p.wardrobe ?? [])]; G.wearing = p.wearing ?? null; G.aura = p.aura ?? null; G.trail = p.trail ?? null; G.bestStreak = p.bestStreak ?? 0; if (p.login) login.state = { ...p.login }; if (p.season) season.state = { ...p.season, free: [...(p.season.free ?? [])], prem: [...(p.season.prem ?? [])] };
}
export function snapshot(): Profile {
  return { v: 1, level: G.level, xp: G.xp, stats: { ...G.stats }, yen: G.yen, inv: { ...G.inv }, totalCatches: G.totalCatches, ts: Date.now(), daily: { ...goals.daily }, bossDone: G.bossDone, wardrobe: [...G.wardrobe], wearing: G.wearing, aura: G.aura, trail: G.trail, bestStreak: G.bestStreak, login: { ...login.state }, season: { ...season.state, free: [...season.state.free], prem: [...season.state.prem] } };
}
let pushTimer: number | null = null;
export function saveProfile(): void {
  const p = snapshot();
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
  if (api.enabled) { if (pushTimer !== null) clearTimeout(pushTimer); pushTimer = window.setTimeout(async () => { const r = await api.putSave<Profile>(p); if (r && r.kept === 'existing' && r.data && r.data.v === 1 && (r.data.totalCatches ?? 0) > G.totalCatches) { applyProfile({ ...blank(), ...r.data }); try { localStorage.setItem(KEY, JSON.stringify(r.data)); } catch { /* ignore */ } } }, 1500); }
}
export function resetProfile(): void { try { localStorage.removeItem(KEY); localStorage.removeItem('taiho_total'); localStorage.removeItem('taiho_unlocked'); } catch { /* ignore */ } }

/** On boot: if the cloud copy is newer than the local one, take it. */
export async function syncProfile(): Promise<Profile> {
  const local = loadProfile();
  if (!api.enabled) return local;
  const remote = await api.getSave<Profile>();
  // merge rule: more career catches wins, then the newer save
  if (remote && remote.data && remote.data.v === 1 && ((remote.data.totalCatches ?? 0) > (local.totalCatches ?? 0) || ((remote.data.totalCatches ?? 0) === (local.totalCatches ?? 0) && (remote.ts || 0) > (local.ts || 0)))) {
    try { localStorage.setItem(KEY, JSON.stringify(remote.data)); } catch { /* ignore */ }
    return { ...blank(), ...remote.data };
  }
  return local;
}
