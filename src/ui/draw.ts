import { G, detectR, xpNeed, type Ent } from '../game/state';
import { TW, MW, MH, TILE, GATE_CATCHES } from '../game/const';
import { ch, cheb } from '../game/world';
import { PERV_ICON } from '../game/ai';
import { cam } from '../core/camera';
import { ctx, spr, text, otext } from '../core/render';
import { L, lang } from '../i18n';
import { rint } from '../core/rng';

function iconVisible(e: Ent): 'full' | 'hint' | null {
  if (e.scripted || e.chasing) return 'full';
  const d = cheb(e, G.player);
  if (d <= detectR()) return 'full';
  if (d <= detectR() + 3) return 'hint';
  return null;
}

export function drawWorld(): void {
  const vw = cam.w * TW, vh = cam.h * TW;
  ctx.save();
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, vw, vh);
  if (G.scene === 'title') { ctx.restore(); return; }
  if (G.shake > 0) ctx.translate(rint(-2, 2), rint(-2, 2));
  ctx.translate(-cam.x, -cam.y);
  const x0 = Math.max(0, Math.floor(cam.x / TW)), y0 = Math.max(0, Math.floor(cam.y / TW));
  const x1 = Math.min(MW - 1, Math.ceil((cam.x + vw) / TW)), y1 = Math.min(MH - 1, Math.ceil((cam.y + vh) / TW));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const c = ch(x, y);
    spr('tile_floor', x * TW, y * TW);
    if (c !== '.') spr('tile_' + TILE[c], x * TW, y * TW);
    if (c === 'E' && G.elevOpen) { ctx.fillStyle = '#5de36a'; ctx.fillRect(x * TW + 7, y * TW + 1, 2, 2); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x * TW + 6, y * TW + 4, 4, 10); ctx.fillStyle = '#ffe066'; ctx.fillRect(x * TW + 7, y * TW + 5, 2, 8); }
  }
  otext('IN', 5 * TW + 8, 12 * TW - 4, '#fff', 'center'); otext('OUT', 14 * TW + 8, 12 * TW - 4, '#fff', 'center');
  for (const o of G.obstacles) spr(o.type === 'bag' ? 'obs_bag' : 'obs_box', o.x * TW, o.y * TW);
  const draw = [...G.ents.filter((e) => e.kind !== 'bonsai'), G.player].sort((a, b) => a.py - b.py);
  for (const e of draw) {
    const yo = e.jump ? -8 * Math.sin(Math.PI * e.t) : 0;
    spr(e.sprite + '_' + (e.moving ? e.frame : 0), e.px, e.py - 8 + yo, e.flip);
    if (e.kind !== 'perv') continue;
    const v = iconVisible(e);
    let ic: string | null = null;
    if (e.chasing) ic = 'icon_finishing'; else if (e.bailT > 0) ic = 'bang'; else if (PERV_ICON[e.state]) ic = PERV_ICON[e.state];
    if (ic === 'bang') otext('!', e.px + 8, e.py - 20, '#ffe066', 'center');
    else if (ic && v === 'full') {
      let by = Math.round(Math.sin(G.time / 180));
      if (e.state === 'live') { by = Math.floor(G.time / 160) % 2 ? -1 : 1; ctx.fillStyle = 'rgba(255,90,90,0.35)'; ctx.fillRect(e.px + 2, e.py - 21 + by, 12, 12); }
      spr(ic, e.px + 4, e.py - 19 + by);
    } else if (ic && v === 'hint') spr('icon_hint', e.px + 4, e.py - 19);
  }
  if (G.ball) { const b = G.ball; ctx.fillStyle = '#1a1a2e'; ctx.fillRect(b.x - 1, b.y - 1, 10, 10); ctx.fillStyle = '#e63c3c'; ctx.fillRect(b.x, b.y, 8, 4); ctx.fillStyle = '#fff'; ctx.fillRect(b.x, b.y + 4, 8, 4); ctx.fillStyle = '#1a1a2e'; ctx.fillRect(b.x, b.y + 3, 8, 1); ctx.fillRect(b.x + 3, b.y + 2, 2, 3); }
  const B = G.bonsai; spr('bonsai_0', B.px, B.py - 8 + Math.round(Math.sin(G.time / 250) * 1.5) - 4, B.flip);
  ctx.restore();
}

export function drawHud(): void {
  const vw = cam.w * TW, vh = cam.h * TW;
  ctx.fillStyle = 'rgba(26,26,46,0.85)'; ctx.fillRect(0, 0, vw, 12);
  text(`${L.hud_caught} ${G.catches}/${GATE_CATCHES}`, 3, 1, '#ffe066');
  if (G.elevOpen) text('▲', 62, 1, '#5de36a');
  const narrow = vw < 300;
  text('¥' + G.yen, narrow ? 70 : 76, 1, '#fff');
  if (!narrow) text(`B×${G.inv.ball} J×${G.inv.juice} V×${G.inv.vita}`, 122, 1, '#c8c8d2');
  text(L.hud_lv + G.level, vw - 78, 1, '#fff');
  ctx.fillStyle = '#3a3a4a'; ctx.fillRect(vw - 48, 3, 45, 6);
  ctx.fillStyle = '#5de36a'; ctx.fillRect(vw - 48, 3, Math.round(45 * G.xp / xpNeed(G.level)), 6);
  if (narrow) text(`B${G.inv.ball} J${G.inv.juice} V${G.inv.vita}`, 3, vh - 11, '#c8c8d2');
  if (G.mode === 'time') { const tl = Math.ceil(G.timeLeft / 1000); otext(`${L.hud_time} ${tl}`, vw / 2, 14, tl <= 10 ? '#ff5a5a' : '#fff', 'center'); }
  if (G.chase) { const s = (G.chase.t / 1000).toFixed(1); otext(`${L.hud_timer} ${s}`, vw / 2, G.mode === 'time' ? 26 : 14, G.chase.t < 5000 ? '#ff5a5a' : '#ffe066', 'center'); }
  let ty = G.mode === 'time' ? 40 : 28;
  for (const t of G.toasts) { otext(t.txt, vw / 2, ty, '#fff', 'center'); ty += 12; }
  if (G.stamp) {
    const k = Math.min(1, G.stamp.t / 200);
    ctx.save(); ctx.translate(vw / 2, vh / 2 - 10); ctx.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 40, Math.sin(a) * 24); ctx.lineTo(Math.cos(a) * 120, Math.sin(a) * 90); ctx.stroke(); }
    ctx.restore();
    otext(G.stamp.txt, vw / 2, vh / 2 - 22, '#ffe066', 'center', 20);
    if (lang === 'ja') otext('CAUGHT', vw / 2, vh / 2 + 2, '#fff', 'center');
  }
  if (G.box) drawBox();
}

function drawBox(): void {
  const vw = cam.w * TW, vh = cam.h * TW;
  const b = G.box!, pg = b.pages[b.i], who = pg[0], full = pg[1], shown = full.slice(0, Math.floor(b.shown));
  const H = 44, y0 = vh - H - 2;
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(2, y0, vw - 4, H); ctx.fillStyle = '#f8f8f8'; ctx.fillRect(4, y0 + 2, vw - 8, H - 4); ctx.fillStyle = '#c8c8d2'; ctx.fillRect(4, y0 + 2, vw - 8, 1);
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(7, y0 + 5, 36, 36); ctx.fillStyle = '#dcebff'; ctx.fillRect(9, y0 + 7, 32, 32);
  if (who === 'b') spr('bonsai_portrait', 9, y0 + 7); else spr(G.player.sprite + '_0', 17, y0 + 9);
  const name = who === 'b' ? L.bonsai : L.hero;
  ctx.font = '10px PM10'; const w = ctx.measureText(name).width + 8;
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(6, y0 - 10, w, 12); text(name, 10, y0 - 9, '#f8f8f8');
  let ty = y0 + 8; for (const ln of shown.split('\n')) { text(ln, 48, ty, '#282834'); ty += 13; }
  if (b.shown >= full.length && Math.floor(G.time / 400) % 2) { ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.moveTo(vw - 14, vh - 11); ctx.lineTo(vw - 8, vh - 11); ctx.lineTo(vw - 11, vh - 7); ctx.fill(); }
}
