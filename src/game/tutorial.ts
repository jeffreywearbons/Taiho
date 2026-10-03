import { G } from './state';
import { L } from '../i18n';
import type { Page } from '../i18n/en';
import { spawnNpc } from './world';
import { cur } from './maps';
import { sfx } from '../core/audio';

export function showBox(pages: Page[], onDone?: () => void): void { G.box = { pages, i: 0, shown: 0, onDone }; sfx('blip'); }
export function advanceBox(): void {
  const b = G.box; if (!b) return;
  if (b.shown < b.pages[b.i][1].length) { b.shown = 999; return; }
  b.i++; b.shown = 0; sfx('blip');
  if (b.i >= b.pages.length) { G.box = null; if (b.onDone) b.onDone(); }
}

type TutKey = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 't9' | 'tf';
export function tutBox(k: TutKey, onDone?: () => void): void {
  if (!G.tutorial || G.tut.done) return;
  if (G.tut.shown.has(k)) return;
  G.tut.shown.add(k); showBox(L[k], onDone);
}
export function tutSpawnPerv() {
  const p = spawnNpc('perv', 'perv'); p.scripted = true; p.dwell = 1e9; G.tut.perv = p;
  if (!G.ents.some((e) => e.kind === 'target' && !e.leaving)) { const t = spawnNpc('target', 'target'); t.dwell = 1e9; }
  return p;
}
export function tutFail(): void { if (G.tut.done) return; showBox(L.tf, () => { tutSpawnPerv(); }); }
export function finishTutorial(): void { G.tut.done = true; try { localStorage.setItem('taiho_tut', '1'); } catch { /* ignore */ } }

export function updTutorial(): void {
  if (!G.tutorial || G.tut.done) return;
  const T = G.tut;
  if (T.step === 0) { T.step = 1; showBox(L.t1); }
  else if (T.step === 1) { if (T.moved >= 3) { T.step = 2; showBox(L.t2, () => { T.step = 3; tutSpawnPerv(); }); } }
  else if (T.step === 3) { const p = T.perv; if (p && p.ty < cur.doorIn.y && !T.s3) { T.s3 = true; showBox(L.t3); T.step = 4; } }
}
