import { G, COSTUME_SPRITES, costumeTier, type Particle } from '../game/state';
import { COSMETICS } from '../game/economy';
import { MAPS, unlockedMaps } from '../game/maps';
import { L, fmt, lang } from '../i18n';
import { ctx, setContext, spr } from '../core/render';
import { drawAura, drawParticles, emitTrail, updParticles } from './fx';
import { sfx } from '../core/audio';

const $ = (id: string) => document.getElementById(id)!;
const SHADOW = '#9a9aae';

/** A 32x32 preview cell. `draw` paints into it; unowned entries become a flat silhouette. */
function cell(name: string, got: boolean, draw: () => void, sub?: string): HTMLElement {
  const el = document.createElement('div'); el.className = 'book-cell ' + (got ? 'got' : 'miss');
  const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32;
  const c2 = cv.getContext('2d')!; c2.imageSmoothingEnabled = false;
  const main = ctx; setContext(c2); draw();
  if (!got) { c2.globalCompositeOperation = 'source-in'; c2.fillStyle = SHADOW; c2.fillRect(0, 0, 32, 32); c2.globalCompositeOperation = 'source-over'; }
  setContext(main);
  const b = document.createElement('b'); b.textContent = got ? name : L.book_unknown;
  el.append(cv, b);
  if (sub) { const s = document.createElement('span'); s.textContent = sub; el.appendChild(s); }
  return el;
}
const person = (sprite: string) => () => spr(`${sprite}_down_0`, 8, 4);
const aura = (id: string) => () => { drawAura(id, 8, 10, 600); spr(`${heroNow()}_down_0`, 8, 4); };
const trail = (id: string) => () => { const ps: Particle[] = []; for (let i = 0; i < 4; i++) emitTrail(id, 8, 4, ps); let list = ps; for (let i = 0; i < 3; i++) list = updParticles(60, list); drawParticles(list); spr(`${heroNow()}_down_0`, 8, 4); };
const heroNow = (): string => (G.wearing ? `cos_${G.wearing}` : COSTUME_SPRITES[costumeTier(G.level, G.totalCatches)]);

function section(list: HTMLElement, title: string): HTMLElement {
  const h = document.createElement('p'); h.className = 'bt'; h.textContent = title; list.appendChild(h);
  const grid = document.createElement('div'); grid.className = 'book-grid'; list.appendChild(grid); return grid;
}

/** Everything there is to find, with the found ones in colour and the rest as shadows: looks, auras, trails, bosses, floors. */
export function openBook(): void {
  $('book-title').textContent = L.book_title; $('b-book-close').textContent = L.close;
  const list = $('book-list'); list.innerHTML = '';
  let found = 0, total = 0;
  const tally = (got: boolean) => { total++; if (got) found++; return got; };
  const tier = costumeTier(G.level, G.totalCatches);

  let g = section(list, L.book_sections.costumes);
  COSTUME_SPRITES.forEach((sp, i) => g.appendChild(cell(L.costumes[i], tally(i <= tier), person(sp))));
  for (const c of COSMETICS.filter((x) => x.kind === 'costume')) g.appendChild(cell(L.cosmetics[c.id][0], tally(G.wardrobe.includes(c.id)), person(`cos_${c.id}`)));
  g = section(list, L.book_sections.auras);
  for (const c of COSMETICS.filter((x) => x.kind === 'aura')) g.appendChild(cell(L.cosmetics[c.id][0], tally(G.wardrobe.includes(c.id)), aura(c.id), c.price === 0 ? L.exclusive : undefined));
  g = section(list, L.book_sections.trails);
  for (const c of COSMETICS.filter((x) => x.kind === 'trail')) g.appendChild(cell(L.cosmetics[c.id][0], tally(G.wardrobe.includes(c.id)), trail(c.id)));
  g = section(list, L.book_sections.bosses);
  // boss i walks in at level 5*(i+1); bossDone is the highest boss level cleared
  L.boss_names.forEach((n, i) => { const lvl = 5 * (i + 1); const got = tally(G.bossDone >= lvl); g.appendChild(cell(n, got, person('boss'), got ? `Lv${lvl}` : fmt(L.book_boss_hint, { n: i + 1, l: lvl }))); });
  g = section(list, L.book_sections.maps);
  const open = unlockedMaps();
  MAPS.forEach((m, i) => g.appendChild(cell(m.name[lang], tally(i < open), () => { const fl = 'tile_' + (m.tiles['.'] ?? 'floor'); const sh = 'tile_' + (m.tiles[m.blockTiles[0]] ?? 'shelf_snacks'); spr(fl, 0, 0); spr(fl, 16, 0); spr(fl, 0, 16); spr(fl, 16, 16); spr(sh, 8, 8); })));

  $('book-sum').textContent = fmt(L.book_sum, { n: found, t: total, c: G.totalCatches, s: G.bestStreak });
  $('book').hidden = false; sfx('blip');
}
export function wireBook(onOpen: () => void): void {
  $('b-book').onclick = () => { onOpen(); openBook(); };
  $('b-book-close').onclick = () => { $('book').hidden = true; };
}
