import { G, type Ent, playerMs, xpNeed } from './state';
import { checkCostume } from './costume';
import { CHASE_MS } from './const';
import { cur, dims, unlockMap } from './maps';
import { pervParams } from './difficulty';
import { random, pick } from '../core/rng';
import { ch, entAt, obstacleAt, updMove, stepTo, randFloor, toast, manh } from './world';
import { bfs, distMap } from './path';
import { L, fmt } from '../i18n';
import { sfx } from '../core/audio';
import { setState } from './ai';
import { tutBox } from './tutorial';
import { haptic } from '../core/input';

export function startChase(p: Ent): void {
  const P = pervParams(G.level);
  p.chasing = true; p.path = []; p.state = 'chase';
  G.chase = { perv: p, t: CHASE_MS, reroll: 0, obsT: 0, P, juice: false, vita: false };
  if (G.inv.juice > 0) { G.inv.juice--; G.chase.juice = true; toast(L.used_juice, 1500); }
  if (G.inv.vita > 0) { G.inv.vita--; G.chase.vita = true; toast(L.used_vita, 1500); }
  if (G.tutorial && p.scripted) tutBox('t7');
  sfx('chase');
}

export function updChase(dt: number): void {
  const c = G.chase; if (!c) return;
  const p = c.perv;
  c.t -= dt; if (c.t <= 0) { endChase(false); return; }
  updMove(p, dt);
  c.reroll -= dt;
  // the perv obeys the same rules as the player: shelves, boxes and shoppers block him; bags must be hopped
  const walk = (x: number, y: number): boolean => {
    if (ch(x, y) !== '.') return false;
    if (G.player.tx === x && G.player.ty === y) return false;
    const o = obstacleAt(x, y); if (o && o.type === 'box') return false;
    if (entAt(x, y, p)) return false;
    return true;
  };
  if (!p.moving) {
    if (c.reroll <= 0 || !p.path.length) {
      c.reroll = c.P.rerollSec * 1000;
      const dm = distMap(G.player.tx, G.player.ty, walk);
      let goal = null as { x: number; y: number } | null;
      if (random() < c.P.feint) goal = randFloor();
      else {
        let best = -1;
        for (const f of G.floorTiles) {
          const d = dm[f.y * dims.w + f.x]; if (d < 0) continue;
          const dp = Math.abs(f.x - p.tx) + Math.abs(f.y - p.ty);
          const score = d - 0.35 * dp + random() * 2;
          if (score > best) { best = score; goal = f; }
        }
      }
      if (goal) { const g = goal; p.path = bfs(p.tx, p.ty, (x, y) => x === g.x && y === g.y, walk) || []; }
    }
    if (p.path.length) {
      const n = p.path[0];
      if (!walk(n.x, n.y)) { p.path = []; c.reroll = 0; }
      else {
        p.path.shift();
        const base = Math.round(playerMs() / c.P.speed);
        const bag = obstacleAt(n.x, n.y);
        if (random() < 0.35 && !obstacleAt(p.tx, p.ty) && G.obstacles.length < 12) G.obstacles.push({ x: p.tx, y: p.ty, type: 'bag' });
        stepTo(p, n.x, n.y, bag ? Math.round(base * 1.9) : base);
        if (bag) p.jump = true;
      }
    }
  }
  c.obsT -= dt;
  if (c.obsT <= 0 && G.obstacles.length < 12) {
    c.obsT = c.P.obsRate * 1000 * 1.5;
    const cands = G.floorTiles.filter((f) => Math.abs(f.x - p.tx) <= 3 && Math.abs(f.y - p.ty) <= 3 && !(f.x === G.player.tx && f.y === G.player.ty) && !obstacleAt(f.x, f.y) && !(f.x === p.tx && f.y === p.ty) && !entAt(f.x, f.y));
    if (cands.length) { const f = pick(cands); const box = (G.level >= 3 || cur.obstacleTier >= 1) && random() < 0.35; G.obstacles.push({ x: f.x, y: f.y, type: box ? 'box' : 'bag' }); }
  }
  if (!G.player.moving && !p.moving && manh(p, G.player) === 0) endChase(true);
}

export function gainXp(n: number): void {
  G.xp += n;
  while (G.xp >= xpNeed(G.level)) { G.xp -= xpNeed(G.level); G.level++; G.pendingLevel++; }
}

export function endChase(caught: boolean): void {
  const c = G.chase; if (!c) return;
  const p = c.perv;
  G.chase = null; G.obstacles = []; G.ball = null;
  if (caught) {
    p.dead = true; G.catches++; G.totalCatches++; try { localStorage.setItem('taiho_total', String(G.totalCatches)); } catch { /* ignore */ }
    sfx('catch'); haptic(60);
    G.freeze = 1100; G.stamp = { t: 0, txt: L.caught }; G.shake = 300;
    const secs = Math.round(c.t / 1000);
    gainXp(100 + secs * 5);
    const yen = 100 + secs * 20; G.yen += yen; toast(fmt(L.reward, { y: yen }), 1800);
    if (G.catches === cur.gate && !G.elevOpen && G.mode === 'story') { G.elevOpen = true; unlockMap(G.mapIndex + 1); toast(L.elev, 2500); sfx('level'); }
    if (G.tutorial && p.scripted) G.tut.step = 8;
    checkCostume();
  } else {
    G.escapes++; toast(L.escaped, 1800); sfx('escape');
    p.chasing = false; p.path = []; p.ms = 170; p.leaving = true; setState(p, 'finish');
  }
}
