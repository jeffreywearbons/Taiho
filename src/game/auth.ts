/**
 * Linking a save to an account. Guest first: nothing here runs until the player asks.
 * Native sign-in uses a Capacitor social-login plugin when the app is wrapped; on the web the
 * transfer code is the way to move a save between devices.
 */
import { api, setSession, sessionToken } from './api';
import { G } from './state';
import { applyProfile, blank, saveProfile, type Profile } from './profile';

export const linked = (): boolean => !!sessionToken();

function takeBetter(remote: Profile | null | undefined): void {
  if (!remote || remote.v !== 1) return;
  const mine = G.totalCatches;
  if ((remote.totalCatches ?? 0) > mine || ((remote.totalCatches ?? 0) === mine && (remote.ts ?? 0) > Date.now() - 1)) { applyProfile({ ...blank(), ...remote }); G.player.sprite = G.player.sprite; }
  saveProfile();
}

export async function makeCode(): Promise<string | null> { const r = await api.newCode(); return r?.code ?? null; }
export async function claimCode(code: string): Promise<boolean> {
  const r = await api.claimCode<Profile>(code); if (!r) return false;
  setSession(r.token); takeBetter(r.save?.data); return true;
}
/** Sign in with Apple or Google via the native plugin; resolves false when it is not available (web). */
export async function nativeSignIn(provider: 'apple' | 'google'): Promise<boolean> {
  const plugin = (window as any).Capacitor?.Plugins?.SocialLogin;
  if (!plugin) return false;
  try {
    const res = await plugin.login({ provider, options: { scopes: ['email'] } });
    const idToken: string | undefined = res?.result?.idToken ?? res?.result?.identityToken ?? res?.idToken;
    if (!idToken) return false;
    const r = await api.signIn(provider, idToken); if (!r) return false;
    setSession(r.token);
    const remote = await api.getSave<Profile>(); takeBetter(remote?.data); return true;
  } catch { return false; }
}
export async function signOut(): Promise<void> { await api.logout(); setSession(null); }
export const hasNativeSignIn = (): boolean => !!(window as any).Capacitor?.Plugins?.SocialLogin;
