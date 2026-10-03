import { TW } from '../game/const';
import { dims } from '../game/maps';

/** Viewport in tiles, chosen from the screen. The camera follows the player and clamps to the map. */
export const cam = { x: 0, y: 0, w: dims.w, h: dims.h, scale: 1 };
let stage = { w: 320, h: 240 };

export function chooseViewport(stageW: number, stageH: number): void {
  stage = { w: stageW, h: stageH };
  const full = stageW / dims.w >= 22 && stageH / dims.h >= 22;
  if (full) { cam.w = dims.w; cam.h = dims.h; }
  else {
    cam.w = Math.max(10, Math.min(dims.w, Math.round(stageW / 26)));
    cam.h = Math.max(8, Math.min(dims.h, Math.round(stageH / 26)));
  }
  let s = Math.min(stageW / (cam.w * TW), stageH / (cam.h * TW));
  if (s >= 2) s = Math.floor(s);
  cam.scale = Math.max(0.5, s);
}
/** Re-run the viewport choice after a map change; the page hooks in to resize its canvas. */
export const hooks = { afterRefit: (): void => undefined };
export function refit(): void { chooseViewport(stage.w, stage.h); hooks.afterRefit(); }

export function follow(px: number, py: number): void {
  const vw = cam.w * TW, vh = cam.h * TW;
  let x = Math.round(px + TW / 2 - vw / 2), y = Math.round(py + TW / 2 - vh / 2);
  x = Math.max(0, Math.min(dims.w * TW - vw, x)); y = Math.max(0, Math.min(dims.h * TW - vh, y));
  cam.x = x; cam.y = y;
}
