import './style.css';
import { G } from './game/state';
import { loadLayout } from './game/world';
import { startGame, nextFloor, update } from './game/loop';
import { loadAssets } from './core/loader';
import { setContext } from './core/render';
import { cam, chooseViewport, follow } from './core/camera';
import { initKeyboard, bindPad, bindDpadSlide, pressA, type Dir } from './core/input';
import { setLang, detectLang, lang } from './i18n';
import { TW } from './game/const';
import { drawWorld, drawHud } from './ui/draw';
import { $, applyStrings, choosePick, closeShop, openBoard, submitScore } from './ui/overlays';

const cv = $<HTMLCanvasElement>('cv');
const stage = $('stage');

function fit(): void {
  chooseViewport(stage.clientWidth, stage.clientHeight);
  const w = cam.w * TW, h = cam.h * TW;
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; setContext(cv.getContext('2d')!); }
  cv.style.width = Math.floor(w * cam.scale) + 'px'; cv.style.height = Math.floor(h * cam.scale) + 'px';
}

function wire(): void {
  try { G.tutorial = localStorage.getItem('taiho_tut') !== '1'; } catch { /* ignore */ }
  $('b-tut').dataset.on = G.tutorial ? '1' : '0';
  setLang(detectLang()); applyStrings();
  $('b-start').onclick = () => startGame('story');
  $('b-time').onclick = () => startGame('time');
  $('b-rank').onclick = () => { void openBoard('rank'); };
  $('b-rank-close').onclick = () => { $('rank').hidden = true; };
  $('b-lang').onclick = () => { setLang(lang === 'en' ? 'ja' : 'en'); applyStrings(); };
  $('b-tut').onclick = () => { G.tutorial = !G.tutorial; $('b-tut').dataset.on = G.tutorial ? '1' : '0'; applyStrings(); };
  for (let i = 0; i < 3; i++) $('p' + i).onclick = () => choosePick(i);
  $('b-end').onclick = () => { $('end').hidden = true; nextFloor(); };
  $('b-shop-close').onclick = () => closeShop();
  $('b-submit').onclick = () => { void submitScore(); };
  $('b-again').onclick = () => startGame('time');
  $('b-back').onclick = () => { $('result').hidden = true; $('title').hidden = false; G.scene = 'title'; };
  initKeyboard(choosePick);
  const dirs: Record<Dir, HTMLElement> = { up: $('d-up'), down: $('d-down'), left: $('d-left'), right: $('d-right') };
  bindDpadSlide($('dpad'), dirs);
  bindPad($('d-a'), 'a'); bindPad($('d-b'), 'b');
  cv.addEventListener('pointerdown', () => { if (G.scene === 'play' && G.box) pressA(); });
  window.addEventListener('resize', fit);
  if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('./sw.js').catch(() => undefined);
}

async function boot(): Promise<void> {
  setContext(cv.getContext('2d')!);
  loadLayout(); wire(); fit();
  await loadAssets();
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(50, now - last); last = now;
    update(dt);
    if (G.scene !== 'title') follow(G.player.px, G.player.py);
    drawWorld(); if (G.scene !== 'title') drawHud();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  // debug hook for automated tests
  (window as any).__taiho = { G };
}
void boot();
