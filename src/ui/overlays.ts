import { G } from '../game/state';
import { L, fmt, lang } from '../i18n';
import { sfx, isMuted, setMuted } from '../core/audio';
import { clearPresses } from '../core/input';
import { buy, leaderboard, CATALOG, COSMETICS, buyCosmetic, isExclusive, type ScoreRow, type BoardQuery } from '../game/economy';
import { weekKey, weekEndsIn } from '../game/week';
import { wear, wornOf, heroSprite } from '../game/costume';
import { allSets, buySet, hasSet, restorePurchases } from '../game/purchases';
import { api, sessionToken } from '../game/api';
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
  $('b-time').textContent = L.mode_time; $('b-rank').querySelector('span')!.textContent = L.rank; $('b-book').querySelector('span')!.textContent = L.book; $('b-lang').textContent = L.lang;
  $('b-tut').textContent = L.tut + (G.tutorial ? L.on : L.off); $('t-keys').textContent = L.keys;
  $('b-rank-close').textContent = L.close; $('b-submit').textContent = L.submit; $('b-again').textContent = L.again; $('b-back').textContent = L.back;
  $<HTMLInputElement>('name').placeholder = L.name_ph; $('b-shop-close').textContent = L.close;
  $('maps-title').textContent = L.maps_title; renderProfileLine();
  $('b-settings').querySelector('span')!.textContent = L.settings; $('b-attr').querySelector('span')!.textContent = L.attr_btn; $('set-title').textContent = L.settings_title; $('b-set-close').textContent = L.close; $('s-title').textContent = L.title; $('s-sub').textContent = L.sub; $('s-tap').textContent = L.tap_start;
  $('b-install').textContent = L.install; $('t-install-hint').textContent = L.install_ios;
  $('b-wardrobe').querySelector('span')!.textContent = L.wardrobe; $('b-shop-wd').textContent = L.wardrobe; $('b-mycard').querySelector('span')!.textContent = L.my_card; $('b-link').textContent = L.link_btn; $('b-cal').querySelector('span')!.textContent = L.cal_btn; $('b-pass').querySelector('span')!.textContent = L.pass_btn; $('b-mute').textContent = L.sound + (isMuted() ? L.off : L.on);
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
/** Bring one button of a scrolling strip into view (the newest open floor, the chosen tab) without moving the page. */
export function revealIn(strip: HTMLElement, index: number): void {
  const b = strip.children[index] as HTMLElement | undefined; if (!b) return;
  const left = b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2;
  try { strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' }); } catch { strip.scrollLeft = Math.max(0, left); }
}
function renderMapSelect(): void {
  const box = $('maps'); box.innerHTML = '';
  const open = unlockedMaps();
  MAPS.forEach((m, i) => {
    const b = document.createElement('button'); b.className = 'map' + (i < open ? '' : ' locked'); b.disabled = i >= open;
    b.textContent = `${i + 1}. ${m.name[lang]}` + (i < open ? '' : `  (${L.locked})`);
    b.onclick = () => onMapPick(i); box.appendChild(b);
  });
  revealIn(box, open - 1);
}

// ---- level up ----
export function openPick(): void {
  G.pendingLevel--; G.scene = 'pick';
  $('pick-title').textContent = L.pick_title;
  const vals = [G.stats.speed, G.stats.detect, G.stats.strength];
  for (let i = 0; i < 3; i++) { const b = $('p' + i); b.querySelector('b')!.textContent = L.stat[i]; b.querySelector('span')!.textContent = L.statd[i]; b.querySelector('i')!.textContent = '+'.repeat(vals[i]) || '-'; }
  $('b-pick-later').textContent = L.pick_later; $('b-pick-later').hidden = G.tutorial && !G.tut.done;
  $('pick').hidden = false; toast(L.levelup, 1500); sfx('level');
}
export function choosePick(i: number): void {
  if (G.scene !== 'pick') return;
  (['speed', 'detect', 'strength'] as const).forEach((k, j) => { if (j === i) G.stats[k]++; });
  $('pick').hidden = true; G.scene = 'play'; clearPresses(); saveProfile(); afterPick();
}
/** Keep the point for the Attributes screen (START menu). The pick stops nagging until the next level-up. */
export function pickLater(): void {
  if (G.scene !== 'pick') return;
  G.pendingLevel++; G.pickLater = true; $('pick').hidden = true; G.scene = 'play'; clearPresses(); saveProfile();
}
function afterPick(): void {
  if (G.tutorial && !G.tut.done && G.tut.step === 9) tutBox('t9', finishTutorial);
  else if (api.enabled && !sessionToken()) { try { if (!localStorage.getItem('taiho_tlink')) { localStorage.setItem('taiho_tlink', '1'); showBox(L.tlink); } } catch { /* ignore */ } }
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
    const own = document.createElement('i'); own.textContent = `${L.owned} ${G.inv[c.key]}/${c.max}`;
    info.append(b, sp, own);
    const full = G.inv[c.key] >= c.max;
    const btn = document.createElement('button'); btn.textContent = full ? L.full : `${L.buy} ¥${c.price}`; btn.disabled = full || G.yen < c.price;
    btn.onclick = () => { const r = buy(c.key); $('shop-msg').textContent = r === 'ok' ? L.bought : r === 'full' ? L.full_msg : L.broke; sfx(r === 'ok' ? 'buy' : 'notyet'); renderShop(); };
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
  // real-money sets first: direct unlocks, no currency
  head(L.wd_sets); const note = document.createElement('p'); note.className = 'small'; note.textContent = api.enabled || (window as any).Capacitor?.Plugins?.Purchases ? L.sets_hint : L.sets_offline; list.appendChild(note);
  for (const s of allSets) {
    if (s.id.startsWith('pass_')) continue;
    const [name, desc] = L.sets[s.id];
    const btn = document.createElement('button');
    if (hasSet(s.id)) { btn.textContent = L.owned_set; btn.disabled = true; }
    else { btn.textContent = lang === 'ja' ? `¥${s.yen}` : `$${s.usd.toFixed(2)}`; btn.disabled = !(api.enabled || (window as any).Capacitor?.Plugins?.Purchases); btn.onclick = async () => { $('wd-msg').textContent = '…'; const r = await buySet(s.id); $('wd-msg').textContent = r === 'done' ? L.bought : r === 'opened' ? L.sets_opening : L.sets_unavailable; if (r === 'done') { sfx('catch'); renderWardrobe(); } }; }
    mkRow(name, desc, btn);
  }
  const restore = document.createElement('button'); restore.className = 'link'; restore.textContent = L.restore; restore.onclick = async () => { $('wd-msg').textContent = '…'; const n = await restorePurchases(); $('wd-msg').textContent = fmt(L.restored, { n }); renderWardrobe(); }; list.appendChild(restore);
  let lastKind = '';
  for (const c of COSMETICS) {
    if (c.kind !== lastKind) {
      lastKind = c.kind; head(L.wd_sections[c.kind]);
      if (c.kind === 'costume') mkRow(L.earned_look, fmt(L.earned_desc, { c: L.costumes[G.costume] }), wearBtn(null, 'costume'));
      else mkRow(L.none, L.none_desc, wearBtn(null, c.kind));
    }
    const [name, desc] = L.cosmetics[c.id];
    if (G.wardrobe.includes(c.id)) mkRow(name, desc, wearBtn(c.id, c.kind));
    else if (isExclusive(c.id)) { const tag = document.createElement('button'); tag.textContent = L.exclusive; tag.disabled = true; mkRow(name, desc, tag); }
    else { const btn = document.createElement('button'); btn.textContent = `${L.buy} ¥${c.price}`; btn.disabled = G.yen < c.price; btn.onclick = () => { const r = buyCosmetic(c.id); $('wd-msg').textContent = r === 'ok' ? L.bought : L.broke; sfx(r === 'ok' ? 'buy' : 'notyet'); if (r === 'ok') wear(c.id, c.kind); renderWardrobe(); }; mkRow(name, desc, btn); }
  }
}
export function closeWardrobe(): void { $('wardrobe').hidden = true; if ((window as any).__wdFrom === 'shop') G.scene = 'shop'; else if (G.scene !== 'title') G.scene = 'play'; clearPresses(); renderProfileLine(); }

export function closeShop(): void { $('shop').hidden = true; G.scene = 'play'; clearPresses(); if (G.pendingTutBuy) { G.pendingTutBuy = false; showBox(L.tbuy); } }

// ---- end of floor ----
export function openEnd(): void {
  G.scene = 'end'; const last = G.mapIndex + 1 >= MAPS.length;
  const next = last ? cur : MAPS[G.mapIndex + 1]; const out = !!next.outdoor;
  $('end-title').textContent = fmt(L.end_title, { m: cur.name[lang] });
  $('end-body').textContent = last ? (out ? L.end_body_last_out : L.end_body_last) : fmt(out ? L.end_body_out : L.end_body, { m: next.name[lang] });
  $('end-stats').textContent = fmt(L.stats, { c: G.catches, e: G.escapes, l: G.level }); $('b-end').textContent = out ? L.end_btn_out : L.end_btn;
  $('end').hidden = false; sfx('level');
}

// ---- time attack result + ranking ----
const fmtLeft = (ms: number): string => { const h = Math.floor(ms / 3600000); return h >= 48 ? `${Math.floor(h / 24)}d` : h >= 1 ? `${h}h` : `${Math.max(1, Math.floor(ms / 60000))}m`; };
const board: BoardQuery = { map: 0, week: weekKey() };
function boardSub(q: BoardQuery): string {
  const m = MAPS[q.map]?.name[lang] ?? `#${q.map + 1}`;
  return q.week ? fmt(L.board_week, { m, w: Number(q.week.slice(-2)), d: fmtLeft(weekEndsIn()) }) : fmt(L.board_all, { m });
}
function renderBoard(listEl: HTMLElement, titleEl: HTMLElement, rows: ScoreRow[]): void {
  titleEl.textContent = leaderboard.shared ? L.board_shared : L.board_local; listEl.innerHTML = '';
  if (!rows.length) { const li = document.createElement('li'); li.textContent = L.board_empty; li.className = 'empty'; listEl.appendChild(li); return; }
  rows.forEach((r, i) => { const li = document.createElement('li'); const n = document.createElement('span'); n.textContent = `${i + 1}. ${String(r.name || '???').slice(0, 12)}` + (r.card ? ' ▸' : ''); const c = document.createElement('b'); c.textContent = String(r.catches); li.append(n, c); if (r.card) { li.className = 'has-card'; li.onclick = () => openCard(String(r.name || '???'), r.card!, r); } listEl.appendChild(li); });
}
function renderRankTabs(): void {
  const maps = $('rank-maps'); maps.innerHTML = '';
  MAPS.forEach((m, i) => { const b = document.createElement('button'); b.textContent = m.name[lang]; b.className = i === board.map ? 'on' : ''; b.onclick = () => { board.map = i; void openBoard('rank'); }; maps.appendChild(b); });
  revealIn(maps, board.map);
  const span = $('rank-span'); span.innerHTML = '';
  ([[L.tab_week, weekKey()], [L.tab_all, null]] as [string, string | null][]).forEach(([t, w]) => { const b = document.createElement('button'); b.textContent = t; b.className = board.week === w ? 'on' : ''; b.onclick = () => { board.week = w; void openBoard('rank'); }; span.appendChild(b); });
  $('rank-sub').textContent = boardSub(board);
}
/** The ranking screen shows one map at a time, this week or all time; the result screen shows the floor just played, this week. */
export async function openBoard(id: 'rank' | 'result'): Promise<void> {
  $(id).hidden = false;
  const q: BoardQuery = id === 'rank' ? board : { map: G.lastRun?.map ?? G.mapIndex, week: weekKey() };
  if (id === 'rank') renderRankTabs();
  const listEl = $(id + '-list'); listEl.innerHTML = '';
  const rows = await leaderboard.top(10, q);
  // a slower response must not overwrite a newer tab choice
  if (id === 'rank' && (q.map !== board.map || q.week !== board.week)) return;
  renderBoard(listEl, $(id + '-title'), rows);
  if (id === 'result') $('result-title').textContent += '  ·  ' + boardSub(q);
}
export function openResult(): void {
  G.scene = 'result'; G.lastRun = { catches: G.catches, level: G.level, map: G.mapIndex };
  $('res-title').textContent = L.res_title; $('res-body').textContent = fmt(L.res_body, { c: G.catches }); $('res-msg').textContent = '';
  $<HTMLButtonElement>('b-submit').disabled = false; const nm = $<HTMLInputElement>('name'); nm.disabled = false;
  try { nm.value = localStorage.getItem('taiho_name') || ''; } catch { /* ignore */ }
  $('result').hidden = false; sfx('level'); void openBoard('result');
}
/** Time Attack asks which floor when more than one is open; each floor has its own board. */
export function openTimePick(start: (map: number) => void): void {
  const open = unlockedMaps(); if (open <= 1) { start(0); return; }
  $('tmap-title').textContent = L.tmap_title; $('tmap-body').textContent = L.tmap_body; $('b-tmap-close').textContent = L.close;
  const box = $('tmap-maps'); box.innerHTML = '';
  MAPS.forEach((m, i) => { if (i >= open) return; const b = document.createElement('button'); b.className = 'map'; b.textContent = `${i + 1}. ${m.name[lang]}`; b.onclick = () => { $('tmap').hidden = true; start(i); }; box.appendChild(b); });
  $('tmap').hidden = false; sfx('blip'); revealIn(box, Math.min(open - 1, G.lastRun?.map ?? open - 1));
}
export async function submitScore(): Promise<void> {
  const nm = $<HTMLInputElement>('name'); const name = (nm.value || '').trim().slice(0, 12);
  if (!name || !G.lastRun) { nm.focus(); return; }
  try { localStorage.setItem('taiho_name', name); } catch { /* ignore */ }
  $<HTMLButtonElement>('b-submit').disabled = true; nm.disabled = true;
  const ts = Date.now(); await leaderboard.submit({ name, catches: G.lastRun.catches, level: G.lastRun.level, lang, ts, card: myCard(), map: G.lastRun.map, week: weekKey(ts) });
  $('res-msg').textContent = L.saved; sfx('catch'); void openBoard('result');
}
