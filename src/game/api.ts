/** Thin client for worker/. Disabled unless VITE_API_URL is set at build time; everything then stays on the device. */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '';

function deviceId(): string {
  try {
    let id = localStorage.getItem('taiho_device');
    if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('taiho_device', id); }
    return id;
  } catch { return 'anon-' + Math.random().toString(36).slice(2, 14); }
}

export function sessionToken(): string | null { try { return localStorage.getItem('taiho_session'); } catch { return null; } }
export function setSession(t: string | null): void { try { if (t) localStorage.setItem('taiho_session', t); else localStorage.removeItem('taiho_session'); } catch { /* ignore */ } }

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!BASE) return null;
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000);
    const tok = sessionToken();
    const r = await fetch(BASE + path, { ...init, signal: ctrl.signal, headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}), ...(init?.headers || {}) } });
    clearTimeout(t);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch { return null; }
}

export const api = {
  enabled: !!BASE,
  device: deviceId,
  topScores: (limit = 10, map = 0, week: string = 'all') => call<{ rows: { name: string; catches: number; level: number; lang: string; ts: number; card?: unknown; map?: number; week?: string }[] }>(`/api/scores?limit=${limit}&map=${map}&week=${encodeURIComponent(week)}`),
  postScore: (row: { name: string; catches: number; level: number; lang: string; card?: unknown; map: number }) => call<{ ok: true }>('/api/scores', { method: 'POST', body: JSON.stringify({ ...row, device: deviceId() }) }),
  getSave: <T>() => (sessionToken() ? call<{ data: T; ts: number }>('/api/save') : call<{ data: T; ts: number; linked?: boolean }>(`/api/save/${deviceId()}`)),
  putSave: <T>(data: unknown) => (sessionToken() ? call<{ ok: true; ts: number; kept: 'incoming' | 'existing'; data?: T }>('/api/save', { method: 'PUT', body: JSON.stringify(data) }) : call<{ ok: true; ts: number; kept: 'incoming' | 'existing'; data?: T }>(`/api/save/${deviceId()}`, { method: 'PUT', body: JSON.stringify(data) })),
  signIn: (provider: 'apple' | 'google', idToken: string) => call<{ token: string; account: string }>(`/api/auth/${provider}`, { method: 'POST', body: JSON.stringify({ id_token: idToken, device: deviceId() }) }),
  newCode: () => call<{ code: string; expires_in: number }>('/api/auth/code', { method: 'POST', body: JSON.stringify({ device: deviceId() }) }),
  claimCode: <T>(code: string) => call<{ token: string; account: string; save: { data: T; ts: number } | null }>('/api/auth/claim', { method: 'POST', body: JSON.stringify({ code, device: deviceId() }) }),
  me: () => call<{ account: string; provider: string; devices: number }>('/api/me'),
  entitlements: () => call<{ sets: string[] }>(`/api/entitlements?device=${deviceId()}`),
  checkout: (set: string, back: string) => call<{ url: string }>('/api/checkout', { method: 'POST', body: JSON.stringify({ set, device: deviceId(), back }) }),
  logout: () => call<{ ok: true }>('/api/auth/logout', { method: 'POST', body: '{}' }),
};
