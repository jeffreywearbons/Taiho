/**
 * Rewarded video. The game never shows forced ads. Two placements: a second chance after an escape,
 * and doubling a boss reward. On the web there is no provider, so the offers simply never appear.
 * In the app the AdMob Capacitor plugin is used when present. `window.__taiho.mockAds = true` fakes a
 * provider for testing.
 */
export type Placement = 'second_chance' | 'double_boss';
const UNITS: Record<Placement, string> = { second_chance: (import.meta.env.VITE_AD_SECOND_CHANCE as string) || '', double_boss: (import.meta.env.VITE_AD_DOUBLE_BOSS as string) || '' };

function plugin(): any { return (window as any).Capacitor?.Plugins?.AdMob ?? null; }
export function adsAvailable(): boolean { return !!(window as any).__taiho?.mockAds || (!!plugin() && !!UNITS.second_chance); }

/** Show a rewarded ad. Resolves true only when the provider reports the reward was earned. */
export async function showRewarded(p: Placement): Promise<boolean> {
  if ((window as any).__taiho?.mockAds) return true;
  const ad = plugin(); if (!ad || !UNITS[p]) return false;
  try {
    await ad.prepareRewardVideoAd({ adId: UNITS[p] });
    const r = await ad.showRewardVideoAd();
    return !!r && (r.type !== undefined || r.amount !== undefined);
  } catch { return false; }
}
