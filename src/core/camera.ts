import { TW, MW, MH } from '../game/const';

/** Viewport in tiles, chosen from the screen. The camera follows the player and clamps to the map. */
export const cam = { x: 0, y: 0, w: MW, h: MH, scale: 1 };

export function chooseViewport(stageW: number, stageH: number): void {
  // Full map when it fits at a comfortable tile size; otherwise a window that scrolls.
  const full = stageW / MW >= 22 && stageH / MH >= 22;
  if (full) { cam.w = MW; cam.h = MH; }
  else {
    cam.w = Math.max(10, Math.min(MW, Math.round(stageW / 26)));
    cam.h = Math.max(8, Math.min(MH, Math.round(stageH / 26)));
  }
  let s = Math.min(stageW / (cam.w * TW), stageH / (cam.h * TW));
  if (s >= 2) s = Math.floor(s);
  cam.scale = Math.max(0.5, s);
}

export function follow(px: number, py: number): void {
  const vw = cam.w * TW, vh = cam.h * TW;
  let x = Math.round(px + TW / 2 - vw / 2), y = Math.round(py + TW / 2 - vh / 2);
  x = Math.max(0, Math.min(MW * TW - vw, x)); y = Math.max(0, Math.min(MH * TW - vh, y));
  cam.x = x; cam.y = y;
}
