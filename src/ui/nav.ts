import { menu, type Dir } from '../core/input';
import { L } from '../i18n';
import { sfx } from '../core/audio';

/**
 * Menu navigation for every overlay: the d-pad moves a highlight between buttons by screen position,
 * A activates, B goes back. Each screen also gets an on-screen BACK button wired to the same action.
 */
const BACK: Record<string, string | null> = {
  splash: null, title: null, end: null,
  settings: 'b-set-close', pick: 'b-pick-later', pause: 'b-resume', attr: 'b-attr-close', shop: 'b-shop-close', wardrobe: 'b-wd-close',
  offer: 'b-offer-no', pass: 'b-pass-close', calendar: 'b-cal-close', link: 'b-link-close', card: 'b-card-close', result: 'b-back',
  tmap: 'b-tmap-close', book: 'b-book-close', rank: 'b-rank-close',
};
const $ = (id: string) => document.getElementById(id);

/** The overlay on top: the visible one with the highest z-index, then the last in the document. */
function top(): HTMLElement | null {
  const vis = [...document.querySelectorAll<HTMLElement>('.overlay')].filter((o) => !o.hidden);
  if (!vis.length) return null;
  return vis.reduce((best, o) => (Number(getComputedStyle(o).zIndex) || 0) >= (Number(getComputedStyle(best).zIndex) || 0) ? o : best);
}
const visible = (el: HTMLElement): boolean => !!el.offsetParent && !(el as HTMLButtonElement).disabled && !el.hidden;
function items(ov: HTMLElement): HTMLElement[] { return [...ov.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]')].filter(visible); }
function current(ov: HTMLElement): HTMLElement | null { const a = document.activeElement as HTMLElement | null; return a && ov.contains(a) && visible(a) ? a : null; }
function focus(el: HTMLElement): void {
  document.querySelectorAll('.nav-focus').forEach((x) => x.classList.remove('nav-focus'));
  el.classList.add('nav-focus'); el.focus({ preventScroll: true });
  try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch { /* ignore */ }
}
/** Nearest item in that direction; wraps to the far side when nothing lies ahead. */
function move(ov: HTMLElement, d: Dir): void {
  const list = items(ov); if (!list.length) return;
  const cur = current(ov);
  if (!cur) { focus(list.find((x) => x.classList.contains('nav-first')) ?? list[0]); sfx('blip'); return; }
  const c = cur.getBoundingClientRect(); const cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2;
  const ahead = (r: DOMRect): [number, number] | null => {
    const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
    if (d === 'down' && r.top >= c.bottom - 2) return [y - cy, Math.abs(x - cx)];
    if (d === 'up' && r.bottom <= c.top + 2) return [cy - y, Math.abs(x - cx)];
    if (d === 'right' && r.left >= c.right - 2) return [x - cx, Math.abs(y - cy)];
    if (d === 'left' && r.right <= c.left + 2) return [cx - x, Math.abs(y - cy)];
    return null;
  };
  let best: HTMLElement | null = null, bestScore = Infinity;
  for (const el of list) { if (el === cur) continue; const a = ahead(el.getBoundingClientRect()); if (!a) continue; const score = a[0] + 2.5 * a[1]; if (score < bestScore) { bestScore = score; best = el; } }
  if (!best) { // wrap around on the same axis
    const far = (r: DOMRect) => (d === 'down' ? -r.top : d === 'up' ? r.bottom : d === 'right' ? -r.left : r.right);
    best = list.filter((x) => x !== cur).sort((p, q) => far(p.getBoundingClientRect()) - far(q.getBoundingClientRect()))[0] ?? null;
  }
  if (best) { focus(best); sfx('blip'); }
}
function activate(ov: HTMLElement): void {
  const cur = current(ov); if (!cur) { move(ov, 'down'); return; }
  if (cur.tagName === 'INPUT') return;
  cur.click();
}
export function goBack(ov: HTMLElement = top()!): void {
  if (!ov) return; const id = BACK[ov.id]; if (!id) return;
  const b = $(id); if (b && visible(b)) { b.click(); sfx('blip'); }
}
export function wireNav(): void {
  menu.active = () => { const t = top(); return !!t && t.id !== 'splash'; };
  menu.dir = (d) => { const t = top(); if (t) move(t, d); };
  menu.a = () => { const t = top(); if (t) activate(t); };
  menu.b = () => goBack();
  // an on-screen BACK on every screen that has somewhere to go back to
  for (const [id, target] of Object.entries(BACK)) {
    if (!target) continue; const ov = $(id); const card = ov?.querySelector('.card'); if (!card) continue;
    const b = document.createElement('button'); b.className = 'back-btn'; b.type = 'button'; b.setAttribute('aria-label', L.back_btn); b.dataset.for = id;
    b.onclick = () => goBack(ov!); card.prepend(b);
  }
  refreshBackLabels();
  // a pointer tap on anything drops the highlight so the two input styles never fight
  document.addEventListener('pointerdown', (e) => { if (!(e.target as HTMLElement).closest('#controls')) document.querySelectorAll('.nav-focus').forEach((x) => x.classList.remove('nav-focus')); });
}
export function refreshBackLabels(): void { document.querySelectorAll<HTMLElement>('.back-btn').forEach((b) => { b.textContent = '◀ ' + L.back_btn; }); }
