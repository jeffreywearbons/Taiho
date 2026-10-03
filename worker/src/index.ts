/**
 * TAIHO!! API: shared Time Attack ranking and cloud saves on Cloudflare Workers + D1.
 *   GET  /api/scores?limit=10        top scores
 *   POST /api/scores                 { name, catches, level, lang, device }
 *   GET  /api/save/:device           saved profile JSON
 *   PUT  /api/save/:device           profile JSON (<= 4 KB)
 * A "device" is a random id the client makes once and keeps in storage. There are no accounts yet.
 */
export interface Env { DB: D1Database; ALLOWED_ORIGIN: string }

const json = (data: unknown, status = 200, origin = '*'): Response =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST,PUT,OPTIONS', 'access-control-allow-headers': 'content-type' } });

const DEVICE = /^[A-Za-z0-9_-]{8,64}$/;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN || '*';
    if (req.method === 'OPTIONS') return json(null, 204, origin);
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    try {
      if (path === '/api/scores' && req.method === 'GET') {
        const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') || 10)));
        const r = await env.DB.prepare('SELECT name, catches, level, lang, ts, card FROM scores ORDER BY catches DESC, ts ASC LIMIT ?').bind(limit).all<{ card: string | null }>();
        const rows = r.results.map((row) => { let card: unknown = null; try { card = row.card ? JSON.parse(row.card) : null; } catch { card = null; } return { ...row, card }; });
        return json({ rows }, 200, origin);
      }
      if (path === '/api/scores' && req.method === 'POST') {
        const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
        if (!b) return json({ error: 'bad json' }, 400, origin);
        const name = String(b.name ?? '').trim().slice(0, 12);
        const catches = Number(b.catches), level = Number(b.level), device = String(b.device ?? '');
        const lang = b.lang === 'ja' ? 'ja' : 'en';
        if (!name || !Number.isInteger(catches) || catches < 0 || catches > 200 || !Number.isInteger(level) || level < 1 || level > 999 || !DEVICE.test(device)) return json({ error: 'invalid' }, 400, origin);
        const now = Date.now();
        const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE device = ? AND ts > ?').bind(device, now - 60_000).first<{ n: number }>();
        if ((recent?.n ?? 0) >= 5) return json({ error: 'slow down' }, 429, origin);
        let card: string | null = null;
        if (b.card && typeof b.card === 'object') { const c = b.card as Record<string, unknown>; const safe = { sprite: String(c.sprite ?? '').slice(0, 32), aura: c.aura ? String(c.aura).slice(0, 32) : null, trail: c.trail ? String(c.trail).slice(0, 32) : null, total: Math.max(0, Math.min(999999, Number(c.total) || 0)), streak: Math.max(0, Math.min(9999, Number(c.streak) || 0)), maps: Math.max(1, Math.min(99, Number(c.maps) || 1)), stats: Array.isArray(c.stats) ? c.stats.slice(0, 3).map((n) => Math.max(0, Math.min(999, Number(n) || 0))) : [0, 0, 0] }; card = JSON.stringify(safe); if (card.length > 400) card = null; }
        await env.DB.prepare('INSERT INTO scores (name, catches, level, lang, device, ts, card) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(name, catches, level, lang, device, now, card).run();
        return json({ ok: true }, 201, origin);
      }
      const m = path.match(/^\/api\/save\/([A-Za-z0-9_-]{8,64})$/);
      if (m && req.method === 'GET') {
        const r = await env.DB.prepare('SELECT data, ts FROM saves WHERE device = ?').bind(m[1]).first<{ data: string; ts: number }>();
        if (!r) return json({ error: 'not found' }, 404, origin);
        return json({ data: JSON.parse(r.data), ts: r.ts }, 200, origin);
      }
      if (m && req.method === 'PUT') {
        const text = await req.text();
        if (text.length > 4096) return json({ error: 'too large' }, 413, origin);
        let data: unknown; try { data = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400, origin); }
        if (!data || typeof data !== 'object') return json({ error: 'invalid' }, 400, origin);
        const now = Date.now();
        await env.DB.prepare('INSERT INTO saves (device, data, ts) VALUES (?, ?, ?) ON CONFLICT(device) DO UPDATE SET data = excluded.data, ts = excluded.ts').bind(m[1], JSON.stringify(data), now).run();
        return json({ ok: true, ts: now }, 200, origin);
      }
      return json({ error: 'not found' }, 404, origin);
    } catch (e) {
      return json({ error: 'server error' }, 500, origin);
    }
  },
};
