import './style.css';
import { G } from './game/state';
import { loadLayout } from './game/world';
import { startGame, nextFloor, update } from './game/loop';
import { startChase, endChase } from './game/chase';
import { showSign } from './game/player';
import { setState } from './game/ai';
import { spawnNpc } from './game/world';
import { loadAssets } from './core/loader';
import { setContext } from './core/render';
import { cam, chooseViewport, follow, hooks } from './core/camera';
import { initKeyboard, bindPad, bindDpadSlide, pressA, type Dir } from './core/input';
import { setLang, detectLang, lang, L } from './i18n';
import { TW } from './game/const';
import { drawWorld, drawHud } from './ui/draw';
import { $, applyStrings, choosePick, closeShop, openBoard, submitScore, setMapPick, toggleMute, pressReset, renderProfileLine, openWardrobe, closeWardrobe } from './ui/overlays';
import { loadProfile, applyProfile } from './game/profile';
import { syncProfile } from './game/profile';
import { openCard, closeCard } from './ui/card';
import { myCard } from './ui/overlays';

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
  $('b-start').onclick = () => startGame('story', 0);
  setMapPick((i) => startGame('story', i));
  $('b-time').onclick = () => startGame('time');
  $('b-rank').onclick = () => { void openBoard('rank'); };
  $('b-rank-close').onclick = () => { $('rank').hidden = true; };
  $('b-lang').onclick = () => { setLang(lang === 'en' ? 'ja' : 'en'); applyStrings(); };
  $('b-mute').onclick = () => toggleMute();
  $('b-wardrobe').onclick = () => { if (G.scene === 'title') applyProfile(loadProfile()); openWardrobe('title'); };
  $('b-shop-wd').onclick = () => openWardrobe('shop');
  $('b-wd-close').onclick = () => closeWardrobe();
  $('b-mycard').onclick = () => { if (G.scene === 'title') applyProfile(loadProfile()); let nm = ''; try { nm = localStorage.getItem('taiho_name') || ''; } catch { /* ignore */ } openCard(nm || L.you, myCard()); };
  $('b-card-close').onclick = () => closeCard();
  $('b-reset').onclick = () => pressReset();
  $('b-back').addEventListener('click', renderProfileLine);
  $('b-tut').onclick = () => { G.tutorial = !G.tutorial; $('b-tut').dataset.on = G.tutorial ? '1' : '0'; applyStrings(); };
  for (let i = 0; i < 3; i++) $('p' + i).onclick = () => choosePick(i);
  $('b-end').onclick = () => { $('end').hidden = true; nextFloor(); };
  $('b-shop-close').onclick = () => closeShop();
  $('b-submit').onclick = () => { void submitScore(); };
  $('b-again').onclick = () => startGame('time');
  $('b-back').onclick = () => { $('result').hidden = true; $('title').hidden = false; G.scene = 'title'; };
  initKeyboard(choosePick);
  // "Install app": Android/desktop Chrome fire beforeinstallprompt; iOS Safari needs the Share menu, so show a hint there.
  let installEvt: (Event & { prompt: () => Promise<void> }) | null = null;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e as any; if (!standalone) $('b-install').hidden = false; });
  $('b-install').onclick = async () => { if (!installEvt) return; await installEvt.prompt(); $('b-install').hidden = true; installEvt = null; };
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
  if (ios && !standalone) $('t-install-hint').hidden = false;
  const dirs: Record<Dir, HTMLElement> = { up: $('d-up'), down: $('d-down'), left: $('d-left'), right: $('d-right') };
  bindDpadSlide($('dpad'), dirs);
  bindPad($('d-a'), 'a'); bindPad($('d-b'), 'b'); bindPad($('d-sel'), 'sel');
  cv.addEventListener('pointerdown', (e) => {
    if (G.scene !== 'play') return;
    if (G.box) { pressA(); return; }
    if (G.sign) { G.sign = null; return; }
    if (G.chase) return;
    const r = cv.getBoundingClientRect();
    const tx = Math.floor(((e.clientX - r.left) / r.width * cv.width + cam.x) / TW), ty = Math.floor(((e.clientY - r.top) / r.height * cv.height + cam.y) / TW);
    const P = G.player;
    if (Math.max(Math.abs(tx - P.tx), Math.abs(ty - P.ty)) <= 2) showSign(tx, ty);
  });
  window.addEventListener('resize', fit); hooks.afterRefit = fit;
  if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('./sw.js').catch(() => undefined);
}

async function boot(): Promise<void> {
  setContext(cv.getContext('2d')!);
  loadLayout(); wire(); fit();
  await loadAssets();
  void syncProfile().then(renderProfileLine);
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
  (window as any).__taiho = { G, startChase, endChase, setState, spawnNpc };
}
void boot();
