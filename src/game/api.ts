/** Thin client for worker/. Disabled unless VITE_API_URL is set at build time; everything then stays on the device. */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '';

function deviceId(): string {
  try {
    let id = localStorage.getItem('taiho_device');
    if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('taiho_device', id); }
    return id;
  } catch { return 'anon-' + Math.random().toString(36).slice(2, 14); }
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!BASE) return null;
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(BASE + path, { ...init, signal: ctrl.signal, headers: { 'content-type': 'application/json', ...(init?.headers || {}) } });
    clearTimeout(t);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch { return null; }
}

export const api = {
  enabled: !!BASE,
  device: deviceId,
  topScores: (limit = 10) => call<{ rows: { name: string; catches: number; level: number; lang: string; ts: number; card?: unknown }[] }>(`/api/scores?limit=${limit}`),
  postScore: (row: { name: string; catches: number; level: number; lang: string; card?: unknown }) => call<{ ok: true }>('/api/scores', { method: 'POST', body: JSON.stringify({ ...row, device: deviceId() }) }),
  getSave: <T>() => call<{ data: T; ts: number }>(`/api/save/${deviceId()}`),
  putSave: (data: unknown) => call<{ ok: true; ts: number }>(`/api/save/${deviceId()}`, { method: 'PUT', body: JSON.stringify(data) }),
};
