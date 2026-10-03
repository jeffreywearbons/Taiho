import { G } from '../game/state';
import { L, fmt } from '../i18n';
import { CALENDAR, checkIn, slot, claimable, claim, canPick, login } from '../game/login';
import { sfx } from '../core/audio';
import { applyProfile, loadProfile } from '../game/profile';
import { renderProfileLine } from './overlays';

const $ = (id: string) => document.getElementById(id)!;
function rewardText(i: number): string {
  const r = CALENDAR[i];
  if (r.pick) return L.cal_pick;
  if (r.yen) return '¥' + r.yen;
  return `${L.items[r.item!][0]} ×${r.n ?? 1}`;
}
export function openCalendar(auto = false): void {
  if (G.scene === 'title') applyProfile(loadProfile());
  const waiting = checkIn();
  if (auto && !waiting) return;
  $('cal-title').textContent = L.cal_title; $('cal-sub').textContent = fmt(L.cal_sub, { n: login.state.streak });
  $('b-cal-close').textContent = L.close; $('cal-msg').textContent = '';
  const grid = $('cal-grid'); grid.innerHTML = '';
  const today = slot();
  for (let i = 0; i < 7; i++) {
    const cell = document.createElement('div'); cell.className = 'cal-cell' + (i < today || (i === today && !claimable()) ? ' done' : i === today ? ' today' : '');
    const d = document.createElement('b'); d.textContent = fmt(L.cal_day, { n: i + 1 });
    const r = document.createElement('span'); r.textContent = rewardText(i);
    cell.append(d, r); grid.appendChild(cell);
  }
  const btn = $('b-cal-claim') as HTMLButtonElement; btn.textContent = L.cal_claim; btn.disabled = !claimable(); btn.hidden = false;
  $('cal-pick').hidden = true;
  $('calendar').hidden = false; sfx('blip');
}
export function wireCalendar(): void {
  $('b-cal-close').onclick = () => { $('calendar').hidden = true; renderProfileLine(); };
  $('b-cal-claim').onclick = () => {
    if (CALENDAR[slot()].pick && canPick().length) { renderPick(); return; }
    const r = claim(); if (!r) return; sfx('level'); $('cal-msg').textContent = L.cal_got; openCalendar();
    $('cal-msg').textContent = L.cal_got;
  };
}
function renderPick(): void {
  const box = $('cal-pick'); box.innerHTML = ''; box.hidden = false; ($('b-cal-claim') as HTMLButtonElement).hidden = true;
  const h = document.createElement('p'); h.className = 'bt'; h.textContent = L.cal_choose; box.appendChild(h);
  for (const id of canPick()) {
    const b = document.createElement('button'); b.className = 'map'; b.textContent = L.cosmetics[id][0];
    b.onclick = () => { if (claim(id)) { sfx('catch'); openCalendar(); $('cal-msg').textContent = fmt(L.cal_picked, { c: L.cosmetics[id][0] }); } };
    box.appendChild(b);
  }
}
