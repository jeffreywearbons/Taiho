import { G } from '../game/state';
import { L, fmt, lang } from '../i18n';
import { sfx } from '../core/audio';
import { clearPresses } from '../core/input';
import { buy, leaderboard, type ScoreRow } from '../game/economy';
import { toast } from '../game/world';
import { tutBox, finishTutorial } from '../game/tutorial';
import { checkCostume } from '../game/costume';

export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

export function applyStrings(): void {
  $('t-title').textContent = L.title; $('t-sub').textContent = L.sub; $('b-start').textContent = L.start;
  $('b-time').textContent = L.mode_time; $('b-rank').textContent = L.rank; $('b-lang').textContent = L.lang;
  $('b-tut').textContent = L.tut + (G.tutorial ? L.on : L.off); $('t-keys').textContent = L.keys;
  $('b-rank-close').textContent = L.close; $('b-submit').textContent = L.submit; $('b-again').textContent = L.again; $('b-back').textContent = L.back;
  $<HTMLInputElement>('name').placeholder = L.name_ph; $('b-shop-close').textContent = L.close;
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
  $('pick').hidden = true; G.scene = 'play'; clearPresses();
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
  const keys = ['ball', 'juice', 'vita'] as const;
  L.items.forEach((it, i) => {
    const row = document.createElement('div'); row.className = 'item';
    const info = document.createElement('div'); info.className = 'info';
    const b = document.createElement('b'); b.textContent = it[0];
    const sp = document.createElement('span'); sp.textContent = it[1];
    const own = document.createElement('i'); own.textContent = `${L.owned} ${G.inv[keys[i]]}`;
    info.append(b, sp, own);
    const btn = document.createElement('button'); btn.textContent = `${L.buy} ¥${it[2]}`; btn.disabled = G.yen < it[2];
    btn.onclick = () => { const r = buy(i); $('shop-msg').textContent = r === 'ok' ? L.bought : L.broke; if (r === 'ok') sfx('catch'); renderShop(); };
    row.append(info, btn); list.appendChild(row);
  });
}
export function closeShop(): void { $('shop').hidden = true; G.scene = 'play'; clearPresses(); }

// ---- end of floor ----
export function openEnd(): void {
  G.scene = 'end'; $('end-title').textContent = L.end_title; $('end-body').textContent = L.end_body;
  $('end-stats').textContent = fmt(L.stats, { c: G.catches, e: G.escapes, l: G.level }); $('b-end').textContent = L.end_btn;
  $('end').hidden = false; sfx('level');
}

// ---- time attack result + ranking ----
function renderBoard(listEl: HTMLElement, titleEl: HTMLElement, rows: ScoreRow[]): void {
  titleEl.textContent = leaderboard.shared ? L.board_shared : L.board_local; listEl.innerHTML = '';
  if (!rows.length) { const li = document.createElement('li'); li.textContent = L.board_empty; li.className = 'empty'; listEl.appendChild(li); return; }
  rows.forEach((r, i) => { const li = document.createElement('li'); const n = document.createElement('span'); n.textContent = `${i + 1}. ${String(r.name || '???').slice(0, 12)}`; const c = document.createElement('b'); c.textContent = String(r.catches); li.append(n, c); listEl.appendChild(li); });
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
  await leaderboard.submit({ name, catches: G.lastRun.catches, level: G.lastRun.level, lang, ts: Date.now() });
  $('res-msg').textContent = L.saved; sfx('catch'); renderBoard($('result-list'), $('result-title'), await leaderboard.top(10));
}
