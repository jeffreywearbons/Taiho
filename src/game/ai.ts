import { G, type Ent } from './state';
import { DIRS, BOLT_RANGE, type Spot } from './const';
import { cur } from './maps';
import { pervParams } from './difficulty';
import { rnd, pick } from '../core/rng';
import { ch, cheb, manh, entAt, updMove, stepTo, goTo, atGoal, faceSpot, randSpot, toast } from './world';
import { L } from '../i18n';
import { sfx } from '../core/audio';
import { startChase } from './chase';
import { tutBox, tutFail } from './tutorial';

export const PERV_ICON: Record<string, string> = { scoping: 'icon_scoping', setup: 'icon_setting_up', live: 'icon_in_progress', finish: 'icon_finishing' };

export function updNpc(e: Ent, dt: number): void {
  updMove(e, dt);
  if (e.kind === 'perv') updPerv(e, dt); else updShopper(e, dt);
  if (e.moving || e.chasing) return;
  if (e.path.length) {
    const n = e.path[0];
    const blocked = entAt(n.x, n.y, e) || (G.player.tx === n.x && G.player.ty === n.y);
    if (blocked) { e.waitT += dt; if (e.waitT > 250) { e.waitT = 0; if (e.goal) goTo(e, e.goal); else e.path = []; } return; }
    e.waitT = 0; e.path.shift(); stepTo(e, n.x, n.y);
  }
}

function beginLook(e: Ent, quick: boolean): void {
  faceSpot(e); e.looking = true; e.idleT = quick ? rnd(900, 1800) : rnd(2500, 6000);
}

function updShopper(e: Ent, dt: number): void {
  e.dwell -= dt; e.age += dt;
  const quick = e.kind === 'shopper';
  if (e.state === 'enter') {
    if (!e.goal || e.goal.fx === undefined) e.goal = randSpot();
    if (!e.path.length && !e.moving) { if (atGoal(e)) { e.state = 'wander'; beginLook(e, quick); } else goTo(e, e.goal); }
    return;
  }
  const mustLeave = (quick && e.age > 6500) || e.dwell < 0;
  if (mustLeave && !e.leaving) { e.leaving = true; e.looking = false; e.state = 'leave'; goTo(e, cur.exit); return; }
  if (e.state === 'leave') { if (!e.moving && !e.path.length) { if (e.tx === cur.exit.x && e.ty === cur.exit.y) e.dead = true; else goTo(e, cur.exit); } return; }
  if (e.state === 'wander') {
    if (e.moving || e.path.length) return;
    if (e.looking) { e.idleT -= dt; if (e.idleT <= 0) { e.looking = false; if (quick) e.dwell = -1; else goTo(e, randSpot()); } return; }
    if (atGoal(e)) beginLook(e, quick); else goTo(e, e.goal || randSpot());
  }
}

function findTarget(e: Ent): Ent | null {
  const ts = G.ents.filter((t) => t.kind === 'target' && !t.leaving && t.state === 'wander');
  if (!ts.length) return null;
  ts.sort((a, b) => manh(a, e) - manh(b, e));
  return ts[0];
}

export function setState(e: Ent, s: Ent['state']): void {
  e.state = s; e.st = 0;
  const P = pervParams(G.level), sc = e.scripted;
  const pace = G.mode === 'time' ? 0.6 : 1;
  if (s === 'nothing') e.timer = sc ? 1500 : rnd(2500, 6000) * pace;
  if (s === 'scoping') e.timer = sc ? 4000 : rnd(3000, 6000) * pace;
  if (s === 'setup') e.timer = sc ? 2500 : rnd(1500, 3000) * pace;
  if (s === 'live') e.timer = sc ? 30000 : P.windowSec * 1000 * (e.boss ? 0.7 : 1);
  if (G.tutorial && sc) { if (s === 'scoping') tutBox('t4'); if (s === 'setup') tutBox('t5'); if (s === 'live') tutBox('t6'); }
}

function updPerv(e: Ent, dt: number): void {
  if (e.chasing) return;
  e.st += dt; e.dwell -= dt;
  if (e.state === 'enter') { if (!e.path.length && !e.moving) { if (atGoal(e)) setState(e, 'nothing'); else goTo(e, e.goal!); } return; }
  if (e.state === 'nothing') {
    if (!e.moving && !e.path.length) {
      if (atGoal(e) && e.goal!.fx !== undefined) { faceSpot(e); e.idleT -= dt; if (e.idleT <= 0) { goTo(e, randSpot()); e.idleT = rnd(800, 2200); } }
      else goTo(e, randSpot());
    }
    if (e.st > e.timer) { const t = findTarget(e); if (t) { e.target = t; setState(e, 'scoping'); } else e.st = 0; }
    if (e.dwell < 0) setState(e, 'finish');
    return;
  }
  if (e.state === 'scoping') {
    const t = e.target; if (!t || t.dead || t.leaving) { setState(e, 'nothing'); return; }
    if (!e.scripted && cheb(e, G.player) <= 1) { e.bailT = 1200; setState(e, 'nothing'); toast(L.bail); sfx('bail'); return; }
    if (!e.moving && !e.path.length) {
      const cands = G.floorTiles.filter((f) => Math.abs(f.x - t.tx) + Math.abs(f.y - t.ty) === 2);
      if (cands.length) goTo(e, pick(cands));
    }
    if (e.st > e.timer) setState(e, 'setup');
    return;
  }
  if (e.state === 'setup') {
    const t = e.target; if (!t || t.dead || t.leaving) { setState(e, 'nothing'); return; }
    if (manh(e, t) !== 1) {
      if (!e.moving && !e.path.length) {
        const cands: Spot[] = DIRS.map(([dx, dy]) => ({ x: t.tx + dx, y: t.ty + dy })).filter((c) => ch(c.x, c.y) === '.' && !entAt(c.x, c.y, e));
        if (cands.length) goTo(e, pick(cands));
      }
      if (e.st > e.timer + 7000) setState(e, 'nothing');
      return;
    }
    e.path = []; if (e.st > e.timer) setState(e, 'live');
    return;
  }
  if (e.state === 'live') {
    e.path = [];
    if (cheb(e, G.player) <= BOLT_RANGE) { startChase(e); return; }
    if (e.st > e.timer) setState(e, 'finish');
    return;
  }
  if (e.state === 'finish') {
    e.leaving = true;
    if (!e.moving && !e.path.length) {
      if (e.tx === cur.exit.x && e.ty === cur.exit.y) { e.dead = true; G.escapes++; if (e.scripted) tutFail(); } else goTo(e, cur.exit);
    }
  }
}
