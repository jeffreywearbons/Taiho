/**
 * Entitlements: which sets this player has bought, kept on the server and mirrored locally.
 * Buying goes through the platform (store sheet in the app, Stripe Checkout on the web).
 */
import { G } from './state';
import { api } from './api';
import { SETS, setById } from './sets';
import { COSMETICS, maxOf } from './economy';
import { saveProfile } from './profile';

export const owned = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem('taiho_sets') || '[]')); } catch { return new Set(); } };
function remember(ids: Iterable<string>): void { try { localStorage.setItem('taiho_sets', JSON.stringify([...ids])); } catch { /* ignore */ } }

/** Unlock everything a set contains into the wardrobe and inventory. Idempotent for cosmetics; items only on first grant. */
export function applySet(id: string, firstTime: boolean): void {
  const s = setById(id); if (!s) return;
  const cos = s.everything ? COSMETICS.map((c) => c.id) : s.cosmetics;
  for (const c of cos) if (!G.wardrobe.includes(c)) G.wardrobe.push(c);
  if (firstTime && s.items) for (const [k, n] of Object.entries(s.items)) { const key = k as keyof typeof G.inv; G.inv[key] = Math.min(maxOf(key), G.inv[key] + (n ?? 0)); }
  saveProfile();
}
export const hasSet = (id: string): boolean => owned().has(id) || owned().has('everything');

/** Pull entitlements from the server and apply anything new. Safe to call on boot and after a purchase. */
export async function syncEntitlements(): Promise<Set<string>> {
  const r = await api.entitlements();
  if (!r) return owned();
  const before = owned(); const now = new Set(r.sets);
  for (const id of now) applySet(id, !before.has(id));
  remember(now); return now;
}

/** Start a purchase. Resolves 'opened' when a checkout was launched, 'done' when the store confirmed in-app. */
export async function buySet(id: string): Promise<'opened' | 'done' | 'unavailable'> {
  const rc = (window as any).Capacitor?.Plugins?.Purchases;
  if (rc) {
    try {
      const offerings = await rc.getOfferings();
      const pkg = offerings?.current?.availablePackages?.find((p: any) => p.product?.identifier === 'taiho_' + id);
      if (!pkg) return 'unavailable';
      await rc.purchasePackage({ aPackage: pkg });
      await syncEntitlements(); return 'done';
    } catch { return 'unavailable'; }
  }
  const r = await api.checkout(id, location.href);
  if (!r?.url) return 'unavailable';
  location.href = r.url; return 'opened';
}
export async function restorePurchases(): Promise<number> {
  const rc = (window as any).Capacitor?.Plugins?.Purchases;
  if (rc) { try { await rc.restorePurchases(); } catch { /* ignore */ } }
  return (await syncEntitlements()).size;
}
export const allSets = SETS;
