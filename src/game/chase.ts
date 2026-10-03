import { G, type Ent, playerMs, xpNeed } from './state';
import { checkCostume } from './costume';
import { saveProfile } from './profile';
import { report, streakMult } from './goals';
import { addSeasonPoints, SEASON } from './season';
import { adsAvailable } from './ads';
import { openOffer } from '../ui/offer';
import { CHASE_MS } from './const';
import { cur, dims, unlockMap } from './maps';
import { pervParams } from './difficulty';
import { random, pick } from '../core/rng';
import { ch, entAt, obstacleAt, updMove, stepTo, toast, manh, chaseFloor, chaseTiles } from './world';
import { ARENA_TILES } from './maps';
import { pick as pickOne } from '../core/rng';
import { bfs, distMap } from './path';
import { L, fmt } from '../i18n';
import { sfx, music } from '../core/audio';
import { setState } from './ai';
import { tutBox } from './tutorial';
import { haptic } from '../core/input';

export function startChase(p: Ent): void {
  const P = pervParams(G.level);
  p.chasing = true; p.path = []; p.state = 'chase';
  if (p.boss) { P.speed += 0.1; P.rerollSec *= 0.6; }
  const chase = { perv: p, t: CHASE_MS, reroll: 0, obsT: 0, P, juice: false, vita: false, charm: false, frozen: 0, hops: 0, smashes: 0, byBall: false };
  G.chase = chase; G.balls = []; G.peels = []; G.decoy = null; G.cartT = 0; p.stunT = 0;
  if (G.inv.juice > 0) { G.inv.juice--; chase.juice = true; toast(L.used_juice, 1500); }
  if (G.inv.vita > 0) { G.inv.vita--; chase.vita = true; toast(L.used_vita, 1500); }
  if (G.inv.charm > 0) { G.inv.charm--; chase.charm = true; toast(L.used_charm, 1500); }
  if (cur.arena) { G.arena = true; G.arenaT = 0; toast(L.arena_open, 2000); }
  if (G.tutorial && p.scripted) tutBox('t7');
  sfx('chase'); music.play('chase');
}

export function updChase(dt: number): void {
  const c = G.chase; if (!c) return;
  const p = c.perv;
  if (c.frozen > 0) c.frozen -= dt; else { c.t -= dt; if (c.t <= 0) { endChase(false); return; } }
  updMove(p, dt);
  if (p.stunT > 0) { p.stunT -= dt; if (!p.moving) { if (!G.player.moving && manh(p, G.player) === 0) endChase(true); return; } }
  c.reroll -= dt;
  // the perv obeys the same rules as the player: shelves, boxes and shoppers block him; bags must be hopped
  const walk = (x: number, y: number): boolean => {
    if (!chaseFloor(x, y)) return false;
    if (G.player.tx === x && G.player.ty === y) return false;
    const o = obstacleAt(x, y); if (o && o.type !== 'bag') return false;
    if (entAt(x, y, p)) return false;
    return true;
  };
  if (!p.moving) {
    if (c.reroll <= 0 || !p.path.length) {
      c.reroll = c.P.rerollSec * 1000;
      const dm = distMap(G.player.tx, G.player.ty, walk);
      let goal = null as { x: number; y: number } | null;
      const tiles = chaseTiles();
      if (G.decoy) { goal = { x: G.decoy.x, y: G.decoy.y }; c.reroll = G.decoy.t; }
      else if (random() < c.P.feint) goal = pickOne(tiles);
      else {
        let best = -1;
        for (const f of tiles) {
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
        const peel = G.peels.findIndex((q) => q.x === n.x && q.y === n.y);
        if (peel >= 0) { G.peels.splice(peel, 1); p.stunT = 1500 + p.ms; toast(L.peel_slip, 1200); sfx('smash'); }
      }
    }
  }
  c.obsT -= dt;
  if (c.obsT <= 0 && G.obstacles.length < 12) {
    c.obsT = c.P.obsRate * 1000 * 1.5;
    const cands = chaseTiles().filter((f) => Math.abs(f.x - p.tx) <= 3 && Math.abs(f.y - p.ty) <= 3 && !(f.x === G.player.tx && f.y === G.player.ty) && !obstacleAt(f.x, f.y) && !(f.x === p.tx && f.y === p.ty) && !entAt(f.x, f.y));
    if (cands.length) {
      const f = pick(cands); const r = random();
      const type = cur.obstacleTier >= 3 && r < 0.12 ? 'vending' : cur.obstacleTier >= 2 && r < 0.3 ? 'crate' : (G.level >= 3 || cur.obstacleTier >= 1) && r < 0.58 ? 'box' : 'bag';
      G.obstacles.push({ x: f.x, y: f.y, type });
    }
  }
  if (!G.player.moving && !p.moving && manh(p, G.player) === 0) endChase(true);
}

/** Shut the back halls: anyone still inside is moved to the nearest shop floor tile. */
function closeArena(p: Ent, caught: boolean): void {
  G.arena = false;
  const inArena = (e: Ent) => ARENA_TILES.includes(ch(e.tx, e.ty));
  if (inArena(G.player)) {
    const path = bfs(G.player.tx, G.player.ty, (x, y) => ch(x, y) === '.', (x, y) => ch(x, y) === '.' || ARENA_TILES.includes(ch(x, y)));
    const dest = path && path.length ? path[path.length - 1] : cur.start;
    const P = G.player; P.tx = dest.x; P.ty = dest.y; P.px = dest.x * 16; P.py = dest.y * 16; P.moving = false;
  }
  if (!caught && inArena(p)) { p.dead = true; }
}

/** Second chance: the perv is dragged back next to the hero and the chase restarts with a short clock. */
export function secondChance(p: Ent): void {
  G.offerUsed = true; p.dead = false; p.leaving = false; p.path = []; p.moving = false;
  const P = G.player; p.tx = P.tx + (P.fx || 1); p.ty = P.ty; if (ch(p.tx, p.ty) !== '.') { p.tx = P.tx; p.ty = P.ty - 1; } p.px = p.tx * 16; p.py = p.ty * 16;
  if (!G.ents.includes(p)) G.ents.push(p);
  setState(p, 'live'); startChase(p); if (G.chase) G.chase.t = 12000;
}
export function gainXp(n: number): void {
  G.xp += n;
  while (G.xp >= xpNeed(G.level)) { G.xp -= xpNeed(G.level); G.level++; G.pendingLevel++; }
}

export function endChase(caught: boolean): void {
  const c = G.chase; if (!c) return;
  const p = c.perv;
  G.chase = null; G.obstacles = []; G.balls = []; G.peels = []; G.decoy = null; G.cartT = 0; p.stunT = 0; music.play('store');
  const inArena = ARENA_TILES.includes(ch(G.player.tx, G.player.ty));
  if (G.arena) closeArena(p, caught);
  if (caught) {
    p.dead = true; G.catches++; G.totalCatches++;
    sfx('catch'); haptic(60);
    G.freeze = 1100; G.stamp = { t: 0, txt: L.caught }; G.shake = 300;
    G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
    const secs = Math.round(c.t / 1000);
    const mult = streakMult(G.streak) * (p.boss ? 3 : 1);
    gainXp(Math.round((100 + secs * 5) * mult));
    const yen = Math.round((100 + secs * 20) * mult * (c.charm ? 2 : 1)); G.yen += yen; toast(fmt(L.reward, { y: yen }), 1800);
    if (c.charm) toast(L.charm_paid, 1500);
    if (G.streak >= 2) toast(fmt(L.streak, { n: G.streak, m: streakMult(G.streak).toFixed(2).replace(/\.?0+$/, '') }), 1800);
    addSeasonPoints(p.boss ? SEASON.bossPoints : SEASON.catchPoints);
    if (p.boss && adsAvailable()) { G.offer = { kind: 'double_boss', yen, xp: Math.round((100 + secs * 5) * mult) }; }
    if (p.boss) { toast(L.boss_caught, 2200); G.bossDone = Math.max(G.bossDone, p.bossId * 5 + 5); G.lastBossLevel = G.bossDone; }
    report({ kind: 'catch', data: { secsLeft: secs, boss: p.boss, byBall: c.byBall, hops: c.hops, inArena, streak: G.streak } }, (y, x) => { G.yen += y; gainXp(x); });
    if (G.catches === cur.gate && !G.elevOpen && G.mode === 'story') { G.elevOpen = true; unlockMap(G.mapIndex + 1); toast(L.elev, 2500); sfx('level'); }
    if (G.tutorial && p.scripted) G.tut.step = 8;
    checkCostume(); saveProfile();
  } else {
    G.escapes++; toast(L.escaped, 1800); sfx('escape');
    if (p.boss) G.lastBossLevel = 0; // let him come back
    if (G.inv.shield > 0 && G.streak >= 1) { G.inv.shield--; toast(L.shield_used, 1800); }
    else { if (G.streak >= 2) toast(L.streak_lost, 1600); G.streak = 0; }
    p.chasing = false; p.path = []; p.ms = 170; p.leaving = true; setState(p, 'finish');
    if (adsAvailable() && !G.offerUsed && G.hp > 0 && !p.dead) { G.offer = { kind: 'second_chance', perv: p }; }
  }
}
