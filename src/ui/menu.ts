import { G, COSTUME_SPRITES, costumeTier } from '../game/state';
import { MAPS, unlockedMaps } from '../game/maps';
import { L, fmt, lang } from '../i18n';
import { ctx, setContext, spr } from '../core/render';
import { heroSprite, bonsaiSprite } from '../game/costume';
import { sfx } from '../core/audio';

const $ = (id: string) => document.getElementById(id)!;
let raf = 0; let dismissed = false; const afterSplash: (() => void)[] = [];

/** Attract scene on the splash: a konbini aisle, the hero walking in place with Bonsai, a perv scoping by the shelf. */
function splashLoop(now: number): void {
  const cv = $('splash-cv') as HTMLCanvasElement; const c2 = cv.getContext('2d')!; c2.imageSmoothingEnabled = false;
  const main = ctx; setContext(c2);
  for (let x = 0; x < cv.width; x += 16) for (let y = 0; y < cv.height; y += 16) spr('tile_floor', x, y);
  const strip = ['tile_fridge_drinks', 'tile_fridge_drinks', 'tile_shelf_onigiri', 'tile_shelf_snacks', 'tile_hot_case', 'tile_shelf_snacks', 'tile_ice_cream', 'tile_atm', 'tile_vending', 'tile_magazine_rack', 'tile_shelf_onigiri'];
  strip.forEach((t, i) => spr(t, i * 16, 0));
  for (let i = 0; i < 4; i++) spr('tile_shelf_snacks', 40 + i * 16, 40);
  const f = [1, 0, 2, 0][Math.floor(now / 140) % 4];
  // perv at the shelf with a camera, hero + Bonsai running past
  spr('perv_side_0', 112, 32, true); spr('icon_scoping', 116, 16 + Math.round(Math.sin(now / 180)));
  const hx = 28 + ((now / 25) % 140);
  spr(bonsaiSprite() + (Math.floor(now / 300) % 2 ? '_1' : '_0'), hx - 20, 52 + Math.round(Math.sin(now / 200) * 2));
  spr(`${heroSprite()}_side_${f}`, hx, 48);
  setContext(main);
  raf = requestAnimationFrame(splashLoop);
}
function dismiss(): void {
  if (dismissed) return; dismissed = true; cancelAnimationFrame(raf);
  $('splash').hidden = true; $('title').hidden = false; sfx('blip');
  renderMenu(); for (const f of afterSplash) f(); afterSplash.length = 0;
}
/** Run a callback once the player has left the splash (so the daily calendar never covers it). */
export function onceInMenu(f: () => void): void { if (dismissed) f(); else afterSplash.push(f); }

/** Small sprite icons on the menu tiles, redrawn whenever the menu shows so the hero icon matches the worn costume. */
function tileIcon(id: string, sprite: string): void {
  const cv = $(id).querySelector('canvas') as HTMLCanvasElement; const c2 = cv.getContext('2d')!; c2.imageSmoothingEnabled = false;
  const main = ctx; setContext(c2); c2.clearRect(0, 0, 16, 24); spr(sprite, 0, 0); setContext(main);
}
export function renderMenu(): void {
  const open = unlockedMaps(); const m = MAPS[open - 1];
  $('t-floor').textContent = fmt(L.floor_line, { n: open, m: m.name[lang] });
  tileIcon('b-rank', 'boss_down_0'); tileIcon('b-book', 'cos_dark_down_0'); tileIcon('b-wardrobe', 'cos_gi_down_0');
  tileIcon('b-mycard', `${G.wearing ? 'cos_' + G.wearing : COSTUME_SPRITES[costumeTier(G.level, G.totalCatches)]}_down_0`);
  tileIcon('b-cal', bonsaiSprite() + '_0'); tileIcon('b-pass', 'cos_trainer_down_0');
}
export function wireMenu(): void {
  $('s-title').textContent = L.title; $('s-sub').textContent = L.sub; $('s-tap').textContent = L.tap_start;
  $('b-settings').textContent = L.settings; $('set-title').textContent = L.settings_title; $('b-set-close').textContent = L.close;
  $('splash').addEventListener('pointerdown', dismiss);
  window.addEventListener('keydown', (e) => { if (!dismissed && ['Enter', 'Space', 'KeyZ', 'KeyX'].includes(e.code)) dismiss(); });
  $('d-a').addEventListener('pointerdown', () => { if (!dismissed) dismiss(); });
  $('b-settings').onclick = () => { $('settings').hidden = false; sfx('blip'); };
  $('b-set-close').onclick = () => { $('settings').hidden = true; };
  raf = requestAnimationFrame(splashLoop);
}
