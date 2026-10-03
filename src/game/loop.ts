import { G, mk, COSTUME_SPRITES, costumeTier } from './state';
import { TW, TIME_ATTACK_MS } from './const';
import { cur, MAPS, unlockedMaps } from './maps';
import { refit } from '../core/camera';
import { pervParams } from './difficulty';
import { rnd, pick } from '../core/rng';
import { consumeA, consumeB, clearPresses } from '../core/input';
import { loadLayout, spawnNpc, updMove, randSpot, toast } from './world';
import { updNpc } from './ai';
import { updChase } from './chase';
import { updPlayer, playerAction, throwBall, updBall } from './player';
import { updTutorial, advanceBox, showBox } from './tutorial';
import { openPick, openEnd, openResult, $ } from '../ui/overlays';
import { L, fmt, lang } from '../i18n';
import { audioInit, music } from '../core/audio';
import { loadProfile, applyProfile, saveProfile } from './profile';

export function startGame(mode: 'story' | 'time', mapIndex = 0): void {
  loadLayout(Math.min(mapIndex, unlockedMaps() - 1)); refit();
  G.mode = mode; G.timeLeft = TIME_ATTACK_MS;
  G.tutorial = mode === 'time' ? false : $('b-tut').dataset.on === '1';
  G.scene = 'play'; $('title').hidden = true; $('result').hidden = true;
  G.ents = []; G.obstacles = []; G.catches = 0; G.escapes = 0; G.pendingLevel = 0;
  G.elevOpen = false; G.chase = null; G.box = null; G.ball = null; G.arena = false;
  G.floor = 1; G.toasts = []; G.freeze = 0; G.stamp = null;
  applyProfile(loadProfile());
  G.tut = { step: 0, moved: 0, done: !G.tutorial, perv: null, shown: new Set() };
  G.costume = costumeTier(G.level, G.totalCatches);
  G.player = mk('player', COSTUME_SPRITES[G.costume], cur.start.x, cur.start.y); G.player.fy = -1; G.player.dir = 'up';
  G.bonsai = mk('bonsai', 'bonsai', cur.start.x - 1, cur.start.y);
  if (!G.tutorial) for (let i = 0; i < cur.targets; i++) { const t = spawnNpc('target', pick(['target', 'shopper3'])); const f = randSpot(); t.tx = f.x; t.ty = f.y; t.goal = f; t.state = 'wander'; }
  audioInit(); music.play('store');
}

export function nextFloor(): void {
  const next = G.mapIndex + 1 < MAPS.length ? G.mapIndex + 1 : G.mapIndex;
  loadLayout(next); refit();
  G.catches = 0; G.elevOpen = false; G.ents = []; G.obstacles = []; G.chase = null; G.ball = null; G.arena = false; G.floor++;
  const P = G.player; P.tx = cur.start.x; P.ty = cur.start.y; P.px = P.tx * TW; P.py = P.ty * TW; P.moving = false; P.onElev = false;
  G.bonsai.px = P.px - 14; G.bonsai.py = P.py; saveProfile();
  G.scene = 'play'; toast(fmt(L.floor_toast, { n: G.floor, m: cur.name[lang] }), 2000);
}

function updSpawner(dt: number): void {
  if (G.tutorial && !G.tut.done && G.tut.step < 3) return;
  G.spawnT -= dt; if (G.spawnT > 0) return; G.spawnT = rnd(1200, 2600);
  const P = pervParams(G.level);
  const n = (k: string) => G.ents.filter((e) => e.kind === k && !e.leaving).length;
  if (G.ents.length >= cur.maxNpc) return;
  if (n('target') < cur.targets) { spawnNpc('target', pick(['target', 'shopper3'])); return; }
  const wantPervs = Math.max(G.mode === 'time' ? 3 : 0, Math.round(P.pervs));
  if (n('perv') < wantPervs && !(G.tutorial && !G.tut.done)) { const p = spawnNpc('perv', pick(['perv', 'perv2'])); p.dwell = rnd(45000, 90000); return; }
  if (n('shopper') < 2) spawnNpc('shopper', pick(['shopper1', 'shopper2']));
}

export function update(dt: number): void {
  G.time += dt;
  if (G.scene !== 'play') return;
  for (const t of G.toasts) t.t -= dt; G.toasts = G.toasts.filter((t) => t.t > 0);
  if (G.shake > 0) G.shake -= dt;
  if (G.arena) G.arenaT += dt;
  if (G.freeze > 0) {
    clearPresses(); G.freeze -= dt; if (G.stamp) G.stamp.t += dt;
    if (G.freeze <= 0) {
      G.stamp = null;
      if (G.tutorial && !G.tut.done && G.tut.step === 8) { G.tut.step = 9; showBox(L.t8); }
      else if (G.pendingLevel) openPick();
    }
    return;
  }
  if (G.box) { if (consumeA()) advanceBox(); if (G.box) G.box.shown += dt * 0.04; updMove(G.player, dt); return; }
  if (G.mode === 'time') {
    G.timeLeft -= dt;
    if (G.timeLeft <= 0) { G.timeLeft = 0; if (G.chase) { const p = G.chase.perv; G.chase = null; G.obstacles = []; G.ball = null; p.dead = true; music.play('store'); } openResult(); return; }
  }
  if (G.player.onElev) { G.player.onElev = false; openEnd(); return; }
  if (consumeB()) throwBall();
  updBall(dt); if (G.scene !== 'play') return;
  if (consumeA()) playerAction();
  updPlayer(dt);
  for (const e of G.ents) { if (e.chasing) continue; updNpc(e, dt); if (e.bailT > 0) e.bailT -= dt; }
  if (G.chase) updChase(dt);
  G.ents = G.ents.filter((e) => !e.dead);
  const B = G.bonsai, P = G.player, k = Math.min(1, dt / 140), side = P.flip ? 14 : -14;
  B.px += (P.px + side - B.px) * k; B.py += (P.py - 6 - B.py) * k; B.flip = !P.flip;
  updSpawner(dt); updTutorial();
  if (G.pendingLevel && !G.chase && !G.freeze && G.scene === 'play') openPick();
}
