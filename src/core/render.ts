import { atlas, FRAMES } from './loader';

export let ctx: CanvasRenderingContext2D;
export function setContext(c: CanvasRenderingContext2D): void { ctx = c; ctx.imageSmoothingEnabled = false; }

export function spr(name: string, x: number, y: number, flip = false): void {
  const f = FRAMES[name]; if (!f) return;
  const rx = Math.round(x), ry = Math.round(y);
  if (flip) { ctx.save(); ctx.translate(rx + f[2], ry); ctx.scale(-1, 1); ctx.drawImage(atlas, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]); ctx.restore(); }
  else ctx.drawImage(atlas, f[0], f[1], f[2], f[3], rx, ry, f[2], f[3]);
}
export function text(s: string, x: number, y: number, col = '#fff', align: CanvasTextAlign = 'left', size = 10): void {
  ctx.font = `${size}px PM10`; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillStyle = col; ctx.fillText(s, Math.round(x), Math.round(y));
}
const RING: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
export function otext(s: string, x: number, y: number, col = '#fff', align: CanvasTextAlign = 'left', size = 10): void {
  ctx.font = `${size}px PM10`; ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillStyle = '#1a1a2e'; for (const [dx, dy] of RING) ctx.fillText(s, Math.round(x) + dx, Math.round(y) + dy);
  ctx.fillStyle = col; ctx.fillText(s, Math.round(x), Math.round(y));
}
