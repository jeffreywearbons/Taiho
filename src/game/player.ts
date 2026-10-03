import { G, playerMs, OBSTACLE_STR } from './state';
import { TW } from './const';
import { held, consumeTap } from '../core/input';
import { sfx } from '../core/audio';
import { L, fmt } from '../i18n';
import { ch, solidForPlayer, obstacleAt, entAt, stepTo, updMove, manh, toast, face, chaseFloor } from './world';
import { cycleEquip } from './economy';
import { startChase, endChase, gainXp } from './chase';
import { report } from './goals';
import { openShop } from '../ui/overlays';

export function playerAction(): void {
  const P = G.player; if (P.moving) return;
  const fx = P.tx + P.fx, fy = P.ty + P.fy;
  if ('RCH'.includes(ch(fx, fy))) { openShop(); return; }
  const o = obstacleAt(fx, fy);
  if (o) {
    if (o.type === 'bag') {
      const lx = fx + P.fx, ly = fy + P.fy;
      if (!solidForPlayer(lx, ly) && !obstacleAt(lx, ly) && !entAt(lx, ly)) { stepTo(P, lx, ly, 260); P.jump = true; sfx('jump'); hopped(); }
      return;
    }
    const need = OBSTACLE_STR[o.type];
    if (G.stats.strength >= need) { G.obstacles = G.obstacles.filter((x) => x !== o); toast(L.smash, 900); sfx('smash'); G.shake = 150; if (G.chase) G.chase.smashes++; report({ kind: 'smash' }, bank); }
    else { toast(fmt(L.heavy, { n: need }), 1500); sfx('notyet'); }
    return;
  }
  const near = G.ents.filter((e) => e.kind === 'perv' && manh(e, P) === 1);
  const chasing = near.find((e) => e.chasing); if (chasing) { endChase(true); return; }
  const live = near.find((e) => e.state === 'live'); if (live) { startChase(live); return; }
  if (near.length) { toast(L.notyet, 1400); sfx('notyet'); }
}

const bank = (y: number, x: number): void => { G.yen += y; gainXp(x); };
function hopped(): void { if (G.chase) { G.chase.hops++; report({ kind: 'hop', hopsThisChase: G.chase.hops }, bank); } }

/** B during a chase fires whatever is equipped. Every active item is a one-use consumable. */
export function useItem(): void {
  if (!G.chase) return;
  const k = G.equip; const P = G.player;
  if (!G.inv[k]) { toast(L.no_item, 1500); sfx('notyet'); return; }
  const c = G.chase;
  switch (k) {
    case 'ball':
      if (G.balls.length) return;
      G.balls.push({ x: P.px + 8, y: P.py + 4, dx: P.fx, dy: P.fy, d: 0 }); sfx('throw'); break;
    case 'net': {
      if (G.balls.length) return;
      const px = P.fy !== 0 ? 1 : 0, py = P.fx !== 0 ? 1 : 0;  // perpendicular offset
      for (const o of [-1, 0, 1]) G.balls.push({ x: P.px + 8 + o * px * TW, y: P.py + 4 + o * py * TW, dx: P.fx, dy: P.fy, d: 0 });
      sfx('throw'); break;
    }
    case 'peel':
      if (G.peels.some((p) => p.x === P.tx && p.y === P.ty) || obstacleAt(P.tx, P.ty)) return;
      G.peels.push({ x: P.tx, y: P.ty }); sfx('jump'); break;
    case 'decoy': {
      const dx = P.tx + P.fx, dy = P.ty + P.fy;
      const spot = ch(dx, dy) === '.' && !obstacleAt(dx, dy) && !entAt(dx, dy) ? { x: dx, y: dy } : { x: P.tx, y: P.ty };
      G.decoy = { x: spot.x, y: spot.y, t: 3000 }; c.reroll = 0; toast(L.decoy_set, 1500); sfx('blip'); break;
    }
    case 'stop':
      c.frozen = 5000; toast(L.time_stop, 1800); sfx('level'); break;
    case 'cart':
      G.cartT = 4000; toast(L.cart_ride, 1500); sfx('chase'); break;
    default: return;
  }
  G.inv[k]--;
  if (!G.inv[k]) { const next = cycleEquip(); if (next) G.equip = next; }
}

export function updBalls(dt: number): void {
  const c = G.chase; if (!c || !G.balls.length) return;
  const sp = dt * 0.22; const pv = c.perv;
  for (const b of G.balls) { b.x += b.dx * sp; b.y += b.dy * sp; b.d += sp; }
  G.balls = G.balls.filter((b) => { const tx = Math.floor((b.x + 4) / TW), ty = Math.floor((b.y + 4) / TW); return chaseFloor(tx, ty) && b.d <= 7 * TW; });
  const hit = G.balls.find((b) => Math.abs(b.x + 4 - (pv.px + 8)) < 9 && Math.abs(b.y + 4 - (pv.py + 4)) < 12);
  if (hit) { G.balls = []; toast(L.ball_hit, 1200); c.byBall = true; endChase(true); }
}

export function updPlayer(dt: number): void {
  const P = G.player; updMove(P, dt);
  if (P.moving) return;
  let dx = 0, dy = 0;
  if (held.left) dx = -1; else if (held.right) dx = 1; else if (held.up) dy = -1; else if (held.down) dy = 1;
  if (!dx && !dy) { const t = consumeTap(); if (t === 'left') dx = -1; else if (t === 'right') dx = 1; else if (t === 'up') dy = -1; else if (t === 'down') dy = 1; }
  if (!dx && !dy) return;
  consumeTap();
  face(P, dx, dy);
  const nx = P.tx + dx, ny = P.ty + dy;
  const e = entAt(nx, ny); if (e && e.chasing) { endChase(true); return; }
  let ob = obstacleAt(nx, ny);
  if (ob && ob.type === 'bag' && G.cartT > 0) { G.obstacles = G.obstacles.filter((x) => x !== ob); sfx('smash'); ob = undefined; }
  if (ob && ob.type === 'bag' && G.chase && G.chase.juice) {
    const lx = nx + dx, ly = ny + dy;
    if (!solidForPlayer(lx, ly) && !obstacleAt(lx, ly) && !entAt(lx, ly)) { stepTo(P, lx, ly, 220); P.jump = true; sfx('jump'); hopped(); return; }
  }
  if (!solidForPlayer(nx, ny) && !ob && !e) {
    stepTo(P, nx, ny, playerMs()); G.tut.moved++;
    if (ch(nx, ny) === 'E' && G.elevOpen) P.onElev = true;
  }
}
