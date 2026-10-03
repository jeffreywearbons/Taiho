/**
 * TAIHO!! API on Cloudflare Workers + D1.
 *
 * Anonymous play:   GET/PUT /api/save/:device            device-keyed save (first run, no account)
 * Accounts:         POST /api/auth/apple | /api/auth/google   { id_token, device } -> { token }
 *                   POST /api/auth/code                   (Bearer or {device}) -> { code }  transfer code, 24h
 *                   POST /api/auth/claim                  { code, device } -> { token }     link this device to that save
 *                   GET  /api/me                          (Bearer) -> { account, provider, devices }
 *                   GET/PUT /api/save                     (Bearer) account save; PUT merges: more career catches wins
 *                   POST /api/auth/logout                 (Bearer)
 * Ranking:          GET  /api/scores?limit=10&map=0&week=2026-W40   best entry per account/device on that map; week=all for all time, omit for this week
 *                   POST /api/scores                      { name, catches, level, lang, device, card, map }, Bearer optional; the server stamps the week
 *
 * Saves are keyed by owner: "d:<device>" before linking, "a:<account>" after. Linking moves the
 * device save onto the account with the merge rule, so nothing is lost in either direction.
 */
import { verifyIdToken, APPLE, GOOGLE } from './jwt';
import { createCheckout, verifyStripeSignature } from './stripe';
import { weekKey } from './week';

export interface Env { DB: D1Database; ALLOWED_ORIGIN: string; APPLE_AUDIENCES?: string; GOOGLE_AUDIENCES?: string; STRIPE_SECRET?: string; STRIPE_WEBHOOK_SECRET?: string; STRIPE_PRICES?: string; REVENUECAT_WEBHOOK_SECRET?: string }
const SET_IDS = ['starter', 'konbini', 'police', 'shonen', 'trainer', 'darkknight', 'auras', 'trails', 'everything', 'pass_s1'];

const DEVICE = /^[A-Za-z0-9_-]{8,64}$/;
const WEEK = /^\d{4}-W\d{2}$/;
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L

const json = (data: unknown, status = 200, origin = '*'): Response =>
  new Response(data === null ? null : JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST,PUT,OPTIONS', 'access-control-allow-headers': 'content-type, authorization' } });

function randomToken(bytes = 24): string { const a = new Uint8Array(bytes); crypto.getRandomValues(a); return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join(''); }
function randomCode(): string { const a = new Uint8Array(8); crypto.getRandomValues(a); return Array.from(a, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(''); }

type Save = { data: Record<string, unknown>; ts: number };
const progress = (s: Record<string, unknown> | null | undefined): number => Number((s as { totalCatches?: number } | null)?.totalCatches ?? -1);

async function readSave(env: Env, owner: string): Promise<Save | null> {
  const r = await env.DB.prepare('SELECT data, ts FROM saves WHERE device = ?').bind(owner).first<{ data: string; ts: number }>();
  if (!r) return null; try { return { data: JSON.parse(r.data), ts: r.ts }; } catch { return null; }
}
async function writeSave(env: Env, owner: string, data: Record<string, unknown>): Promise<number> {
  const now = Date.now();
  await env.DB.prepare('INSERT INTO saves (device, data, ts) VALUES (?, ?, ?) ON CONFLICT(device) DO UPDATE SET data = excluded.data, ts = excluded.ts').bind(owner, JSON.stringify(data), now).run();
  return now;
}
/** Merge rule: the save with more career catches wins; on a tie the newer one. */
function better(a: Save | null, b: Save | null): Save | null {
  if (!a) return b; if (!b) return a;
  const pa = progress(a.data), pb = progress(b.data);
  if (pa !== pb) return pa > pb ? a : b; return a.ts >= b.ts ? a : b;
}

async function accountFor(env: Env, provider: string, sub: string): Promise<string> {
  const r = await env.DB.prepare('SELECT id FROM accounts WHERE provider = ? AND sub = ?').bind(provider, sub).first<{ id: string }>();
  if (r) return r.id;
  const id = 'u_' + randomToken(12);
  await env.DB.prepare('INSERT INTO accounts (id, provider, sub, created) VALUES (?, ?, ?, ?)').bind(id, provider, sub, Date.now()).run();
  return id;
}
/** Attach a device to an account and fold its anonymous save into the account save. */
async function linkDevice(env: Env, account: string, device: string): Promise<void> {
  await env.DB.prepare('INSERT INTO devices (device, account, linked) VALUES (?, ?, ?) ON CONFLICT(device) DO UPDATE SET account = excluded.account, linked = excluded.linked').bind(device, account, Date.now()).run();
  const dev = await readSave(env, 'd:' + device), acc = await readSave(env, 'a:' + account);
  const best = better(dev, acc);
  if (best && best !== acc) await writeSave(env, 'a:' + account, best.data);
}
async function session(env: Env, account: string): Promise<string> {
  const token = randomToken(32);
  await env.DB.prepare('INSERT INTO sessions (token, account, created) VALUES (?, ?, ?)').bind(token, account, Date.now()).run();
  return token;
}
async function auth(env: Env, req: Request): Promise<string | null> {
  const h = req.headers.get('authorization') || ''; const m = h.match(/^Bearer ([a-f0-9]{64})$/); if (!m) return null;
  const r = await env.DB.prepare('SELECT account FROM sessions WHERE token = ?').bind(m[1]).first<{ account: string }>();
  return r?.account ?? null;
}
/** Who owns things: the account when the device is linked, else the device. */
async function ownerFor(env: Env, req: Request, device: string): Promise<string> {
  const acc = (await auth(env, req)) ?? (await env.DB.prepare('SELECT account FROM devices WHERE device = ?').bind(device).first<{ account: string }>())?.account ?? null;
  return acc ? 'a:' + acc : 'd:' + device;
}
async function grant(env: Env, owner: string, set: string, platform: string, ref: string): Promise<void> {
  await env.DB.prepare('INSERT OR IGNORE INTO purchases (owner, sku, platform, ref, ts) VALUES (?, ?, ?, ?, ?)').bind(owner, set, platform, ref, Date.now()).run();
}
function sanitizeCard(c: unknown): string | null {
  if (!c || typeof c !== 'object') return null;
  const o = c as Record<string, unknown>;
  const n = (v: unknown, hi: number) => Math.max(0, Math.min(hi, Number(v) || 0));
  const safe = { sprite: String(o.sprite ?? '').slice(0, 32), aura: o.aura ? String(o.aura).slice(0, 32) : null, trail: o.trail ? String(o.trail).slice(0, 32) : null, total: n(o.total, 999999), streak: n(o.streak, 9999), maps: Math.max(1, n(o.maps, 99)), stats: Array.isArray(o.stats) ? o.stats.slice(0, 3).map((x) => n(x, 999)) : [0, 0, 0] };
  const s = JSON.stringify(safe); return s.length > 400 ? null : s;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // ALLOWED_ORIGIN may list several origins, comma-separated; the request's own origin is echoed when it is one of them
    const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map((o) => o.trim()).filter(Boolean);
    const reqOrigin = req.headers.get('origin') || '';
    const origin = allowed.includes('*') ? '*' : allowed.includes(reqOrigin) ? reqOrigin : allowed[0];
    if (req.method === 'OPTIONS') return json(null, 204, origin);
    const url = new URL(req.url); const path = url.pathname.replace(/\/+$/, '');
    const body = async (): Promise<Record<string, unknown>> => ((await req.json().catch(() => null)) as Record<string, unknown> | null) ?? {};
    try {
      // ---- ranking ----
      if (path === '/api/scores' && req.method === 'GET') {
        const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') || 10)));
        const map = Math.max(0, Math.min(99, Number(url.searchParams.get('map') || 0) || 0));
        // week: an ISO key, "all" for all time, or omitted for the current week
        const wk = url.searchParams.get('week') || weekKey();
        const week = wk === 'all' ? null : WEEK.test(wk) ? wk : weekKey();
        // best entry per owner (account when linked, else device) within the map and week
        const where = 'map = ?' + (week ? ' AND week = ?' : '');
        const args = week ? [map, week, map, week, limit] : [map, map, limit];
        const r = await env.DB.prepare(`SELECT name, catches, level, lang, ts, card, map, week FROM scores s WHERE ${where} AND s.id = (SELECT id FROM scores t WHERE ${where} AND COALESCE(t.account, t.device) = COALESCE(s.account, s.device) ORDER BY catches DESC, ts ASC LIMIT 1) ORDER BY catches DESC, ts ASC LIMIT ?`).bind(...args).all<{ card: string | null }>();
        const rows = r.results.map((row) => { let card: unknown = null; try { card = row.card ? JSON.parse(row.card) : null; } catch { card = null; } return { ...row, card }; });
        return json({ rows, week: week ?? 'all', map }, 200, origin);
      }
      if (path === '/api/scores' && req.method === 'POST') {
        const b = await body();
        const name = String(b.name ?? '').trim().slice(0, 12);
        const catches = Number(b.catches), level = Number(b.level), device = String(b.device ?? ''), map = Number(b.map ?? 0);
        const lang = b.lang === 'ja' ? 'ja' : 'en';
        if (!name || !Number.isInteger(catches) || catches < 0 || catches > 200 || !Number.isInteger(level) || level < 1 || level > 999 || !Number.isInteger(map) || map < 0 || map > 99 || !DEVICE.test(device)) return json({ error: 'invalid' }, 400, origin);
        const now = Date.now();
        const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE device = ? AND ts > ?').bind(device, now - 60_000).first<{ n: number }>();
        if ((recent?.n ?? 0) >= 5) return json({ error: 'slow down' }, 429, origin);
        const account = (await auth(env, req)) ?? (await env.DB.prepare('SELECT account FROM devices WHERE device = ?').bind(device).first<{ account: string }>())?.account ?? null;
        await env.DB.prepare('INSERT INTO scores (name, catches, level, lang, device, account, ts, card, map, week) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(name, catches, level, lang, device, account, now, sanitizeCard(b.card), map, weekKey(now)).run();
        return json({ ok: true }, 201, origin);
      }
      // ---- anonymous saves ----
      const m = path.match(/^\/api\/save\/([A-Za-z0-9_-]{8,64})$/);
      if (m && req.method === 'GET') {
        const linked = await env.DB.prepare('SELECT account FROM devices WHERE device = ?').bind(m[1]).first<{ account: string }>();
        const s = await readSave(env, linked ? 'a:' + linked.account : 'd:' + m[1]);
        return s ? json({ ...s, linked: !!linked }, 200, origin) : json({ error: 'not found' }, 404, origin);
      }
      if (m && req.method === 'PUT') {
        const text = await req.text(); if (text.length > 8192) return json({ error: 'too large' }, 413, origin);
        let data: unknown; try { data = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400, origin); }
        if (!data || typeof data !== 'object') return json({ error: 'invalid' }, 400, origin);
        const linked = await env.DB.prepare('SELECT account FROM devices WHERE device = ?').bind(m[1]).first<{ account: string }>();
        const owner = linked ? 'a:' + linked.account : 'd:' + m[1];
        const incoming: Save = { data: data as Record<string, unknown>, ts: Date.now() };
        const keep = linked ? better(await readSave(env, owner), incoming) : incoming;
        const ts = keep === incoming ? await writeSave(env, owner, incoming.data) : (keep as Save).ts;
        return json({ ok: true, ts, kept: keep === incoming ? 'incoming' : 'existing', data: keep === incoming ? undefined : keep!.data }, 200, origin);
      }
      // ---- sign in ----
      if ((path === '/api/auth/apple' || path === '/api/auth/google') && req.method === 'POST') {
        const b = await body(); const token = String(b.id_token ?? ''), device = String(b.device ?? '');
        if (!token || !DEVICE.test(device)) return json({ error: 'invalid' }, 400, origin);
        const apple = path.endsWith('apple');
        const audiences = (apple ? env.APPLE_AUDIENCES : env.GOOGLE_AUDIENCES)?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
        if (!audiences.length) return json({ error: 'provider not configured' }, 503, origin);
        let claims; try { claims = await verifyIdToken(token, { ...(apple ? APPLE : GOOGLE), audiences }); } catch (e) { return json({ error: 'token rejected: ' + (e as Error).message }, 401, origin); }
        const account = await accountFor(env, apple ? 'apple' : 'google', claims.sub);
        await linkDevice(env, account, device);
        return json({ token: await session(env, account), account }, 200, origin);
      }
      // ---- transfer codes ----
      if (path === '/api/auth/code' && req.method === 'POST') {
        const b = await body(); let account = await auth(env, req);
        if (!account) {
          // an anonymous device can mint a code too: it gets a code-only account so another device can join it
          const device = String(b.device ?? ''); if (!DEVICE.test(device)) return json({ error: 'invalid' }, 400, origin);
          const linked = await env.DB.prepare('SELECT account FROM devices WHERE device = ?').bind(device).first<{ account: string }>();
          account = linked?.account ?? (await accountFor(env, 'code', device));
          await linkDevice(env, account, device);
        }
        const code = randomCode();
        await env.DB.prepare('INSERT INTO codes (code, account, expires) VALUES (?, ?, ?)').bind(code, account, Date.now() + 24 * 3600_000).run();
        return json({ code, expires_in: 86400 }, 200, origin);
      }
      if (path === '/api/auth/claim' && req.method === 'POST') {
        const b = await body(); const code = String(b.code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, ''), device = String(b.device ?? '');
        if (code.length !== 8 || !DEVICE.test(device)) return json({ error: 'invalid' }, 400, origin);
        const r = await env.DB.prepare('SELECT account, expires FROM codes WHERE code = ?').bind(code).first<{ account: string; expires: number }>();
        if (!r || r.expires < Date.now()) return json({ error: 'code not found or expired' }, 404, origin);
        await env.DB.prepare('DELETE FROM codes WHERE code = ?').bind(code).run();
        await linkDevice(env, r.account, device);
        const save = await readSave(env, 'a:' + r.account);
        return json({ token: await session(env, r.account), account: r.account, save }, 200, origin);
      }
      // ---- purchases ----
      if (path === '/api/entitlements' && req.method === 'GET') {
        const device = url.searchParams.get('device') || ''; if (!DEVICE.test(device)) return json({ error: 'invalid' }, 400, origin);
        const owner = await ownerFor(env, req, device);
        // a linked account also inherits anything bought on this device before linking
        const r = await env.DB.prepare('SELECT DISTINCT sku FROM purchases WHERE owner = ? OR owner = ?').bind(owner, 'd:' + device).all<{ sku: string }>();
        return json({ sets: r.results.map((x) => x.sku) }, 200, origin);
      }
      if (path === '/api/checkout' && req.method === 'POST') {
        const b = await body(); const set = String(b.set ?? ''), device = String(b.device ?? ''), back = String(b.back ?? '');
        if (!SET_IDS.includes(set) || !DEVICE.test(device) || !/^https?:\/\//.test(back)) return json({ error: 'invalid' }, 400, origin);
        if (!env.STRIPE_SECRET || !env.STRIPE_PRICES) return json({ error: 'payments not configured' }, 503, origin);
        const prices = Object.fromEntries(env.STRIPE_PRICES.split(',').map((p) => p.trim().split(':') as [string, string]));
        if (!prices[set]) return json({ error: 'no price for set' }, 503, origin);
        const owner = await ownerFor(env, req, device);
        const base = back.replace(/#.*$/, '');
        const r = await createCheckout(env.STRIPE_SECRET, prices[set], `${owner}|${set}`, base + '#purchased', base);
        return r ? json(r, 200, origin) : json({ error: 'stripe error' }, 502, origin);
      }
      if (path === '/api/webhooks/stripe' && req.method === 'POST') {
        if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'not configured' }, 503, origin);
        const payload = await req.text();
        if (!(await verifyStripeSignature(payload, req.headers.get('stripe-signature') || '', env.STRIPE_WEBHOOK_SECRET))) return json({ error: 'bad signature' }, 400, origin);
        const ev = JSON.parse(payload) as { type: string; data: { object: { id: string; client_reference_id?: string; payment_status?: string } } };
        if (ev.type === 'checkout.session.completed' && ev.data.object.payment_status === 'paid') {
          const [owner, set] = String(ev.data.object.client_reference_id || '').split('|');
          if (owner && SET_IDS.includes(set)) await grant(env, owner, set, 'stripe', ev.data.object.id);
        }
        return json({ received: true }, 200, origin);
      }
      if (path === '/api/webhooks/revenuecat' && req.method === 'POST') {
        // RevenueCat relays App Store and Play purchases. app_user_id is set by the client to the owner key.
        if (!env.REVENUECAT_WEBHOOK_SECRET || req.headers.get('authorization') !== 'Bearer ' + env.REVENUECAT_WEBHOOK_SECRET) return json({ error: 'unauthorized' }, 401, origin);
        const ev = (await body()) as { event?: { type: string; app_user_id: string; product_id: string; id: string; store: string } };
        const e = ev.event;
        if (e && ['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'RENEWAL', 'UNCANCELLATION'].includes(e.type)) {
          const set = String(e.product_id || '').replace(/^taiho_/, '');
          if (SET_IDS.includes(set) && /^[ad]:[A-Za-z0-9_-]+$/.test(e.app_user_id)) await grant(env, e.app_user_id, set, e.store || 'revenuecat', e.id);
        }
        return json({ ok: true }, 200, origin);
      }
      // ---- account routes ----
      const account = await auth(env, req);
      if (path === '/api/me' && req.method === 'GET') {
        if (!account) return json({ error: 'unauthorized' }, 401, origin);
        const a = await env.DB.prepare('SELECT provider, created FROM accounts WHERE id = ?').bind(account).first<{ provider: string; created: number }>();
        const d = await env.DB.prepare('SELECT COUNT(*) AS n FROM devices WHERE account = ?').bind(account).first<{ n: number }>();
        return json({ account, provider: a?.provider, created: a?.created, devices: d?.n ?? 0 }, 200, origin);
      }
      if (path === '/api/save' && req.method === 'GET') {
        if (!account) return json({ error: 'unauthorized' }, 401, origin);
        const s = await readSave(env, 'a:' + account); return s ? json(s, 200, origin) : json({ error: 'not found' }, 404, origin);
      }
      if (path === '/api/save' && req.method === 'PUT') {
        if (!account) return json({ error: 'unauthorized' }, 401, origin);
        const text = await req.text(); if (text.length > 8192) return json({ error: 'too large' }, 413, origin);
        let data: unknown; try { data = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400, origin); }
        if (!data || typeof data !== 'object') return json({ error: 'invalid' }, 400, origin);
        const incoming: Save = { data: data as Record<string, unknown>, ts: Date.now() };
        const keep = better(await readSave(env, 'a:' + account), incoming)!;
        const ts = keep === incoming ? await writeSave(env, 'a:' + account, incoming.data) : keep.ts;
        return json({ ok: true, ts, kept: keep === incoming ? 'incoming' : 'existing', data: keep === incoming ? undefined : keep.data }, 200, origin);
      }
      if (path === '/api/auth/logout' && req.method === 'POST') {
        if (account) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind((req.headers.get('authorization') || '').slice(7)).run();
        return json({ ok: true }, 200, origin);
      }
      return json({ error: 'not found' }, 404, origin);
    } catch {
      return json({ error: 'server error' }, 500, origin);
    }
  },
};
