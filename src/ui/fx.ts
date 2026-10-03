import { G, type Particle } from '../game/state';
import { ctx } from '../core/render';
import { rnd, random } from '../core/rng';

/** Run trails are emitted when a hero steps; auras are drawn fresh every frame. Both are purely cosmetic. */
export function emitTrail(k: string | null, px: number, py: number, into: Particle[] = G.particles): void {
  if (!k) return;
  const cx = px + 8, cy = py + 14;
  const push = (p: Partial<Particle>) => into.push({ x: cx, y: cy, vx: 0, vy: 0, t: 0, life: 500, kind: k, c: '#fff', s: 2, ...p });
  if (k === 'trail_sakura') for (let i = 0; i < 2; i++) push({ x: cx + rnd(-5, 5), y: cy + rnd(-4, 2), vx: rnd(-6, 6), vy: rnd(4, 12), life: 700, c: random() < 0.5 ? '#ffb7d5' : '#ff8fb8', s: 2 });
  else if (k === 'trail_bats') push({ x: cx + rnd(-4, 4), y: cy - 6, vx: rnd(-10, 10), vy: rnd(-16, -6), life: 650, c: '#1a1a2e', s: 3 });
  else if (k === 'trail_neon') for (let i = 0; i < 2; i++) push({ x: cx + rnd(-3, 3), y: cy + rnd(-2, 2), life: 400, c: i ? '#59f0ff' : '#ff5ad6', s: 3 });
  else if (k === 'trail_fire') for (let i = 0; i < 2; i++) push({ x: cx + rnd(-4, 4), y: cy + rnd(-2, 2), vx: rnd(-3, 3), vy: rnd(-18, -8), life: 450, c: i ? '#ffd23f' : '#ff7a1a', s: 2 });
}
export function updParticles(dt: number, list: Particle[] = G.particles): Particle[] {
  if (!list.length) return list;
  const s = dt / 1000;
  for (const p of list) { p.t += dt; p.x += p.vx * s; p.y += p.vy * s; if (p.kind === 'trail_fire') p.vy -= 10 * s; }
  const kept = list.filter((p) => p.t < p.life);
  if (list === G.particles) G.particles = kept;
  return kept;
}
export function drawParticles(list: Particle[] = G.particles): void {
  for (const p of list) {
    const a = 1 - p.t / p.life; ctx.globalAlpha = a;
    const x = Math.round(p.x), y = Math.round(p.y); ctx.fillStyle = p.c;
    if (p.kind === 'trail_bats') { ctx.fillRect(x - 3, y, 2, 1); ctx.fillRect(x + 2, y, 2, 1); ctx.fillRect(x - 1, y - 1, 3, 2); ctx.fillRect(x - 4, y - 1, 1, 1); ctx.fillRect(x + 4, y - 1, 1, 1); }
    else if (p.kind === 'trail_neon') ctx.fillRect(x - 1, y - 1, p.s, p.s);
    else ctx.fillRect(x, y, p.s, p.s);
  }
  ctx.globalAlpha = 1;
}
export function drawAura(k: string | null, px: number, py: number, t: number = G.time): void {
  if (!k) return;
  const cx = px + 8, cy = py + 6;
  if (k === 'aura_shonen') {
    const r = 12 + Math.sin(t / 150) * 2;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t / 600; const len = 4 + ((i * 7 + Math.floor(t / 90)) % 4); ctx.globalAlpha = 0.55; ctx.fillStyle = i % 2 ? '#ffe066' : '#ffb000'; ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 1.3 - 2), 2, len); }
    ctx.globalAlpha = 0.18; ctx.fillStyle = '#ffe066'; ctx.fillRect(cx - 12, cy - 14, 24, 30); ctx.globalAlpha = 1;
  } else if (k === 'aura_lightning') {
    ctx.fillStyle = '#7ff3ff'; ctx.globalAlpha = 0.9;
    for (let i = 0; i < 3; i++) { if (Math.floor(t / 70 + i * 13) % 3) continue; let x = cx + Math.round(rnd(-12, 12)), y = cy - 12; for (let s = 0; s < 5; s++) { ctx.fillRect(x, y, 1, 3); x += Math.round(rnd(-3, 3)); y += 4; } }
    ctx.globalAlpha = 1;
  } else if (k === 'aura_smoke') {
    for (let i = 0; i < 6; i++) { const ph = (t / 900 + i / 6) % 1; const x = cx + Math.round(Math.sin((t / 300) + i) * 8), y = cy + 12 - ph * 26; ctx.globalAlpha = 0.5 * (1 - ph); ctx.fillStyle = i % 2 ? '#3a2a5a' : '#241a3a'; ctx.fillRect(x - 2, Math.round(y), 4 + Math.round(ph * 3), 3); }
    ctx.globalAlpha = 1;
  } else if (k === 'aura_s1') {
    // season 1 flare: two counter-rotating gold rings with a warm core
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t / 500; const r = 11 + Math.sin(t / 200 + i) * 1.5; ctx.globalAlpha = 0.7; ctx.fillStyle = '#ffb000'; ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.6), 2, 2); }
    for (let i = 0; i < 6; i++) { const a = -i / 6 * Math.PI * 2 - t / 350; ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff1a8'; ctx.fillRect(Math.round(cx + Math.cos(a) * 7), Math.round(cy + 2 + Math.sin(a) * 4), 1, 1); }
    ctx.globalAlpha = 0.14; ctx.fillStyle = '#ff9a1f'; ctx.fillRect(cx - 11, cy - 13, 22, 28); ctx.globalAlpha = 1;
  } else if (k === 'aura_sakura') {
    for (let i = 0; i < 5; i++) { const ph = (t / 1400 + i / 5) % 1; const x = cx + Math.round(Math.sin(t / 250 + i * 2) * 10), y = cy - 14 + ph * 30; ctx.globalAlpha = 0.9 * (1 - ph * 0.6); ctx.fillStyle = i % 2 ? '#ffb7d5' : '#ff8fb8'; ctx.fillRect(x, Math.round(y), 2, 2); }
    ctx.globalAlpha = 1;
  }
}
