import { G } from '../game/state';
import { L, fmt, lang } from '../i18n';
import { sfx, isMuted, setMuted } from '../core/audio';
import { clearPresses } from '../core/input';
import { buy, leaderboard, CATALOG, COSMETICS, buyCosmetic, type ScoreRow } from '../game/economy';
import { wear, wornOf, heroSprite } from '../game/costume';
import { unlockedMaps as unlocked } from '../game/maps';
import { openCard } from './card';
import type { Card } from '../game/economy';
import { toast } from '../game/world';
import { tutBox, finishTutorial, showBox } from '../game/tutorial';
import { MAPS, cur, unlockedMaps } from '../game/maps';
import { checkCostume } from '../game/costume';
import { saveProfile, resetProfile, loadProfile } from '../game/profile';

export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

export function applyStrings(): void {
  $('t-title').textContent = L.title; $('t-sub').textContent = L.sub; $('b-start').textContent = L.start;
  $('b-time').textContent = L.mode_time; $('b-rank').textContent = L.rank; $('b-lang').textContent = L.lang;
  $('b-tut').textContent = L.tut + (G.tutorial ? L.on : L.off); $('t-keys').textContent = L.keys;
  $('b-rank-close').textContent = L.close; $('b-submit').textContent = L.submit; $('b-again').textContent = L.again; $('b-back').textContent = L.back;
  $<HTMLInputElement>('name').placeholder = L.name_ph; $('b-shop-close').textContent = L.close;
  $('maps-title').textContent = L.maps_title; renderProfileLine();
  $('b-install').textContent = L.install; $('t-install-hint').textContent = L.install_ios;
  $('b-wardrobe').textContent = L.wardrobe; $('b-shop-wd').textContent = L.wardrobe; $('b-mycard').textContent = L.my_card; $('b-link').textContent = L.link_btn; $('b-mute').textContent = L.sound + (isMuted() ? L.off : L.on);
  renderMapSelect();
}
let resetArmed = false;
export function renderProfileLine(): void {
  const p = loadProfile();
  $('t-profile').textContent = fmt(L.profile_line, { l: p.level, c: p.totalCatches, y: p.yen });
  $('b-reset').textContent = resetArmed ? L.reset_confirm : L.reset;
}
export function pressReset(): void {
  if (!resetArmed) { resetArmed = true; renderProfileLine(); setTimeout(() => { resetArmed = false; renderProfileLine(); }, 4000); return; }
  resetArmed = false; resetProfile(); renderProfileLine(); renderMapSelect();
}
export function myCard(): Card { return { sprite: heroSprite(), aura: G.aura, trail: G.trail, total: G.totalCatches, streak: G.bestStreak, maps: unlocked(), stats: [G.stats.speed, G.stats.detect, G.stats.strength] }; }
export function toggleMute(): void { setMuted(!isMuted()); $('b-mute').textContent = L.sound + (isMuted() ? L.off : L.on); }
export let onMapPick: (i: number) => void = () => undefined;
export function setMapPick(fn: (i: number) => void): void { onMapPick = fn; }
function renderMapSelect(): void {
  const box = $('maps'); box.innerHTML = '';
  const open = unlockedMaps();
  MAPS.forEach((m, i) => {
    const b = document.createElement('button'); b.className = 'map' + (i < open ? '' : ' locked'); b.disabled = i >= open;
    b.textContent = `${i + 1}. ${m.name[lang]}` + (i < open ? '' : `  (${L.locked})`);
    b.onclick = () => onMapPick(i); box.appendChild(b);
  });
}

// ---- level up ----
export function openPick(): void {
  G.pendingLevel--; G.scene = 'pick';
  $('pick-title').textContent = L.pick_title;
  const vals = [G.stats.speed, G.stats.detect, G.stats.strength];
  for (let i = 0; i < 3; i++) { const b = $('p' + i); b.querySelector('b')!.textContent = L.stat[i]; b.querySelector('span')!.textContent = L.statd[i]; b.querySelector('i')!.textContent = '+'.repeat(vals[i]) || '-'; }
  $('pick').hidden = false; toast(L.levelup, 1500); sfx('level');
}
export function choosePick(i: number): void {
  if (G.scene !== 'pick') return;
  (['speed', 'detect', 'strength'] as const).forEach((k, j) => { if (j === i) G.stats[k]++; });
  $('pick').hidden = true; G.scene = 'play'; clearPresses(); saveProfile();
  if (G.tutorial && !G.tut.done && G.tut.step === 9) tutBox('t9', finishTutorial);
  checkCostume();
}

// ---- shop ----
export function openShop(): void {
  G.scene = 'shop'; $('shop-title').textContent = L.shop_title; $('shop-hint').textContent = L.shop_hint; $('shop-msg').textContent = '';
  renderShop(); $('shop').hidden = false; sfx('blip');
}
function renderShop(): void {
  $('shop-yen').textContent = '¥' + G.yen;
  const list = $('shop-list'); list.innerHTML = '';
  let lastKind = '';
  for (const c of CATALOG) {
    if (c.kind !== lastKind) { lastKind = c.kind; const h = document.createElement('p'); h.className = 'bt'; h.textContent = c.kind === 'active' ? L.shop_active : L.shop_passive; list.appendChild(h); }
    const it = L.items[c.key];
    const row = document.createElement('div'); row.className = 'item';
    const info = document.createElement('div'); info.className = 'info';
    const b = document.createElement('b'); b.textContent = it[0];
    const sp = document.createElement('span'); sp.textContent = it[1];
    const own = document.createElement('i'); own.textContent = `${L.owned} ${G.inv[c.key]}`;
    info.append(b, sp, own);
    const btn = document.createElement('button'); btn.textContent = `${L.buy} ¥${c.price}`; btn.disabled = G.yen < c.price;
    btn.onclick = () => { const r = buy(c.key); $('shop-msg').textContent = r === 'ok' ? L.bought : L.broke; sfx(r === 'ok' ? 'buy' : 'notyet'); renderShop(); };
    row.append(info, btn); list.appendChild(row);
  }
}
// ---- wardrobe ----
export function openWardrobe(from: 'title' | 'shop'): void {
  $('wd-title').textContent = L.wardrobe; $('wd-hint').textContent = L.wardrobe_hint; $('b-wd-close').textContent = L.close; $('wd-msg').textContent = '';
  (window as any).__wdFrom = from; renderWardrobe(); $('wardrobe').hidden = false; sfx('blip');
}
function renderWardrobe(): void {
  $('wd-yen').textContent = '¥' + G.yen;
  const list = $('wd-list'); list.innerHTML = '';
  const mkRow = (name: string, desc: string, right: HTMLElement) => { const row = document.createElement('div'); row.className = 'item'; const info = document.createElement('div'); info.className = 'info'; const b = document.createElement('b'); b.textContent = name; const sp = document.createElement('span'); sp.textContent = desc; info.append(b, sp); row.append(info, right); list.appendChild(row); };
  const wearBtn = (id: string | null, kind: 'costume' | 'aura' | 'trail') => { const btn = document.createElement('button'); const on = wornOf(kind) === id; btn.textContent = on ? L.wearing : L.wear; btn.disabled = on; btn.onclick = () => { wear(id, kind); sfx('blip'); renderWardrobe(); }; return btn; };
  const head = (t: string) => { const h = document.createElement('p'); h.className = 'bt'; h.textContent = t; list.appendChild(h); };
  let lastKind = '';
  for (const c of COSMETICS) {
    if (c.kind !== lastKind) {
      lastKind = c.kind; head(L.wd_sections[c.kind]);
      if (c.kind === 'costume') mkRow(L.earned_look, fmt(L.earned_desc, { c: L.costumes[G.costume] }), wearBtn(null, 'costume'));
      else mkRow(L.none, L.none_desc, wearBtn(null, c.kind));
    }
    const [name, desc] = L.cosmetics[c.id];
    if (G.wardrobe.includes(c.id)) mkRow(name, desc, wearBtn(c.id, c.kind));
    else { const btn = document.createElement('button'); btn.textContent = `${L.buy} ¥${c.price}`; btn.disabled = G.yen < c.price; btn.onclick = () => { const r = buyCosmetic(c.id); $('wd-msg').textContent = r === 'ok' ? L.bought : L.broke; sfx(r === 'ok' ? 'buy' : 'notyet'); if (r === 'ok') wear(c.id, c.kind); renderWardrobe(); }; mkRow(name, desc, btn); }
  }
}
export function closeWardrobe(): void { $('wardrobe').hidden = true; if ((window as any).__wdFrom === 'shop') G.scene = 'shop'; else if (G.scene !== 'title') G.scene = 'play'; clearPresses(); renderProfileLine(); }

export function closeShop(): void { $('shop').hidden = true; G.scene = 'play'; clearPresses(); if (G.pendingTutBuy) { G.pendingTutBuy = false; showBox(L.tbuy); } }

// ---- end of floor ----
export function openEnd(): void {
  G.scene = 'end'; const last = G.mapIndex + 1 >= MAPS.length;
  $('end-title').textContent = fmt(L.end_title, { m: cur.name[lang] }); $('end-body').textContent = last ? L.end_body_last : fmt(L.end_body, { m: MAPS[G.mapIndex + 1].name[lang] });
  $('end-stats').textContent = fmt(L.stats, { c: G.catches, e: G.escapes, l: G.level }); $('b-end').textContent = L.end_btn;
  $('end').hidden = false; sfx('level');
}

// ---- time attack result + ranking ----
function renderBoard(listEl: HTMLElement, titleEl: HTMLElement, rows: ScoreRow[]): void {
  titleEl.textContent = leaderboard.shared ? L.board_shared : L.board_local; listEl.innerHTML = '';
  if (!rows.length) { const li = document.createElement('li'); li.textContent = L.board_empty; li.className = 'empty'; listEl.appendChild(li); return; }
  rows.forEach((r, i) => { const li = document.createElement('li'); const n = document.createElement('span'); n.textContent = `${i + 1}. ${String(r.name || '???').slice(0, 12)}` + (r.card ? ' ▸' : ''); const c = document.createElement('b'); c.textContent = String(r.catches); li.append(n, c); if (r.card) { li.className = 'has-card'; li.onclick = () => openCard(String(r.name || '???'), r.card!, r); } listEl.appendChild(li); });
}
export async function openBoard(id: 'rank' | 'result'): Promise<void> { $(id).hidden = false; renderBoard($(id + '-list'), $(id + '-title'), await leaderboard.top(10)); }
export function openResult(): void {
  G.scene = 'result'; G.lastRun = { catches: G.catches, level: G.level };
  $('res-title').textContent = L.res_title; $('res-body').textContent = fmt(L.res_body, { c: G.catches }); $('res-msg').textContent = '';
  $<HTMLButtonElement>('b-submit').disabled = false; const nm = $<HTMLInputElement>('name'); nm.disabled = false;
  try { nm.value = localStorage.getItem('taiho_name') || ''; } catch { /* ignore */ }
  $('result').hidden = false; sfx('level'); void openBoard('result');
}
export async function submitScore(): Promise<void> {
  const nm = $<HTMLInputElement>('name'); const name = (nm.value || '').trim().slice(0, 12);
  if (!name || !G.lastRun) { nm.focus(); return; }
  try { localStorage.setItem('taiho_name', name); } catch { /* ignore */ }
  $<HTMLButtonElement>('b-submit').disabled = true; nm.disabled = true;
  await leaderboard.submit({ name, catches: G.lastRun.catches, level: G.lastRun.level, lang, ts: Date.now(), card: myCard() });
  $('res-msg').textContent = L.saved; sfx('catch'); renderBoard($('result-list'), $('result-title'), await leaderboard.top(10));
}
