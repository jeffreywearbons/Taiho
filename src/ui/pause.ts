import { G, xpNeed, playerMs, detectR, MAX_HP } from '../game/state';
import { cur } from '../game/maps';
import { L, fmt, lang } from '../i18n';
import { sfx, music } from '../core/audio';
import { clearPresses } from '../core/input';
import { saveProfile, loadProfile, applyProfile } from '../game/profile';
import { toast } from '../game/world';
import { checkCostume } from '../game/costume';
import { openShop, renderProfileLine, $ } from './overlays';
import { renderMenu } from './menu';

/** The START menu while playing: pause, attributes, shop, restart the floor, save, quit to the title. */
export function openPause(): void {
  if (G.scene !== 'play' || G.box) return;
  G.scene = 'pause'; music.stop();
  $('pause-title').textContent = L.pause_title; $('pause-sub').textContent = fmt(L.pause_sub, { m: cur.name[lang], f: G.floor, c: G.catches, g: cur.gate });
  $('b-resume').textContent = L.resume; $('b-p-attr').textContent = L.attr_btn + (G.pendingLevel ? ` (+${G.pendingLevel})` : ''); $('b-p-shop').textContent = L.pause_shop; $('b-p-restart').textContent = L.restart; $('b-p-save').textContent = L.save; $('b-p-quit').textContent = L.quit;
  $('pause').hidden = false; sfx('blip');
}
export function closePause(): void { $('pause').hidden = true; if (G.scene === 'pause') { G.scene = 'play'; music.play(G.chase ? 'chase' : 'store'); } clearPresses(); }
export function togglePause(): void { if (G.scene === 'pause') closePause(); else openPause(); }

/** Spend one banked level-up point on a stat. Shared with the level-up pick. */
export function spendPoint(i: 0 | 1 | 2): boolean {
  if (G.pendingLevel <= 0) return false;
  (['speed', 'detect', 'strength'] as const).forEach((k, j) => { if (j === i) G.stats[k]++; });
  G.pendingLevel--; saveProfile(); checkCostume(); sfx('level'); return true;
}
const effects = (): string[] => {
  const base = 150; const pct = Math.round((base / playerMs() - 1) * 100);
  return [fmt(L.attr_fx[0], { v: pct }), fmt(L.attr_fx[1], { v: detectR() }), fmt(L.attr_fx[2], { v: L.smash_lv[Math.min(3, G.stats.strength)] })];
};
/** Attributes screen: the three stats, what each does right now, and buttons to spend banked points. */
export function openAttr(from: 'title' | 'pause'): void {
  if (from === 'title') applyProfile(loadProfile());
  (window as any).__attrFrom = from; if (from === 'pause') G.scene = 'attr';
  $('attr-title').textContent = L.attr_title; $('b-attr-close').textContent = L.close;
  renderAttr(); $('attr').hidden = false; sfx('blip');
}
function renderAttr(): void {
  const list = $('attr-list'); list.innerHTML = '';
  const vals = [G.stats.speed, G.stats.detect, G.stats.strength]; const fx = effects();
  vals.forEach((v, i) => {
    const row = document.createElement('div'); row.className = 'attr-row';
    const info = document.createElement('div'); info.className = 'info';
    const b = document.createElement('b'); b.textContent = `${L.stat[i]}  `; const bar = document.createElement('span'); bar.className = 'bar'; bar.textContent = '+'.repeat(v) || '-'; b.appendChild(bar);
    const d = document.createElement('span'); d.textContent = `${L.statd[i]}. ${fx[i]}`;
    info.append(b, d);
    const btn = document.createElement('button'); btn.textContent = L.upgrade; btn.disabled = G.pendingLevel <= 0;
    btn.onclick = () => { if (spendPoint(i as 0 | 1 | 2)) { renderAttr(); renderProfileLine(); } };
    row.append(info, btn); list.appendChild(row);
  });
  $('attr-points').textContent = G.pendingLevel > 0 ? fmt(L.attr_points, { n: G.pendingLevel }) : L.attr_none;
  $('attr-next').textContent = fmt(L.attr_next, { l: G.level + 1, x: G.xp, n: xpNeed(G.level) }) + `   ·   HP ${G.hp}/${MAX_HP}`;
}
export function closeAttr(): void { $('attr').hidden = true; if ((window as any).__attrFrom === 'pause') { G.scene = 'play'; openPause(); } clearPresses(); }

export function wirePause(restart: () => void): void {
  $('b-resume').onclick = () => closePause();
  $('b-p-attr').onclick = () => { $('pause').hidden = true; openAttr('pause'); };
  $('b-attr-close').onclick = () => closeAttr();
  $('b-p-shop').onclick = () => { $('pause').hidden = true; G.scene = 'play'; openShop(); };
  $('b-p-save').onclick = () => { saveProfile(); toast(L.saved_ok, 1200); $('b-p-save').textContent = L.saved_ok; sfx('catch'); setTimeout(() => { $('b-p-save').textContent = L.save; }, 1200); };
  $('b-p-restart').onclick = () => { saveProfile(); $('pause').hidden = true; G.scene = 'play'; restart(); };
  $('b-p-quit').onclick = () => {
    saveProfile(); $('pause').hidden = true; music.stop();
    G.chase = null; G.freeze = 0; G.box = null; G.offer = null; G.arena = false; G.toasts = []; G.stamp = null;
    G.scene = 'title'; $('title').hidden = false; renderProfileLine(); renderMenu(); clearPresses();
  };
  $('d-start').onclick = () => togglePause();
  window.addEventListener('keydown', (e) => { if ((e.code === 'Escape' || e.code === 'KeyP') && (G.scene === 'play' || G.scene === 'pause')) { e.preventDefault(); togglePause(); } });
}
