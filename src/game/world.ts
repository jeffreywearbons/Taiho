import { G, type Ent, type Kind, mk } from './state';
import { TW, DIRS, type Pt, type Spot } from './const';
import { cur, dims, ITEM_TILES, ARENA_TILES, setMap } from './maps';
import { genMap } from './mapgen';
import { bfs } from './path';
import { pick, rnd } from '../core/rng';

export const inb = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < dims.w && y < dims.h;
export const ch = (x: number, y: number): string => (inb(x, y) ? G.map[y][x] : 'W');
export const cheb = (a: Pt | Ent, b: Pt | Ent): number => Math.max(Math.abs(tx(a) - tx(b)), Math.abs(ty(a) - ty(b)));
export const manh = (a: Pt | Ent, b: Pt | Ent): number => Math.abs(tx(a) - tx(b)) + Math.abs(ty(a) - ty(b));
const tx = (e: Pt | Ent) => ('tx' in e ? e.tx : e.x);
const ty = (e: Pt | Ent) => ('ty' in e ? e.ty : e.y);

export function solidForPlayer(x: number, y: number): boolean {
  const c = ch(x, y);
  if (c === 'E') return !G.elevOpen;
  if (ARENA_TILES.includes(c)) return !G.arena;
  return c !== '.';
}
/** Floor a chase may run over: the shop, plus the back halls while the arena is open. */
export const chaseFloor = (x: number, y: number): boolean => { const c = ch(x, y); return c === '.' || (G.arena && ARENA_TILES.includes(c)); };
export const chaseTiles = (): Pt[] => (G.arena ? G.floorTiles.concat(G.arenaTiles) : G.floorTiles);
export function solidForNpc(x: number, y: number, leaving: boolean): boolean {
  const c = ch(x, y);
  if (c === 'Y') return leaving;       // IN door: entering only
  if (c === 'X') return !leaving;      // OUT door: leaving only
  return !'.mP'.includes(c);
}
export const obstacleAt = (x: number, y: number) => G.obstacles.find((o) => o.x === x && o.y === y);
export const entAt = (x: number, y: number, except?: Ent): Ent | undefined =>
  G.ents.find((e) => e !== except && e.kind !== 'bonsai' && ((e.tx === x && e.ty === y) || (e.moving && e.to.x === x && e.to.y === y)));

export function rebuildTiles(): void {
  G.floorTiles = []; G.browseSpots = []; G.arenaTiles = [];
  for (let y = 0; y < dims.h; y++) for (let x = 0; x < dims.w; x++) { const c = ch(x, y); if (c === '.') G.floorTiles.push({ x, y }); else if (ARENA_TILES.includes(c)) G.arenaTiles.push({ x, y }); }
  for (const f of G.floorTiles) for (const [dx, dy] of DIRS) {
    if (ITEM_TILES.includes(ch(f.x + dx, f.y + dy)) && f.y < cur.doorIn.y - 1) { G.browseSpots.push({ x: f.x, y: f.y, fx: dx, fy: dy }); break; }
  }
}
export function loadLayout(mapIndex = G.mapIndex): void { const def = setMap(mapIndex); G.mapIndex = mapIndex; G.map = genMap(def); rebuildTiles(); }
export const randFloor = (): Pt => pick(G.floorTiles);
export const randSpot = (): Spot => pick(G.browseSpots);

// ---------- movement ----------
export function stepTo(e: Ent, x: number, y: number, ms?: number): void {
  e.from = { x: e.tx, y: e.ty }; e.to = { x, y }; e.t = 0; e.moving = true; if (ms) e.ms = ms;
  if (x < e.tx) e.flip = true; if (x > e.tx) e.flip = false;
  e.fx = Math.sign(x - e.tx); e.fy = Math.sign(y - e.ty);
  e.dir = y < e.ty ? 'up' : y > e.ty ? 'down' : 'side';
}
export function face(e: Ent, dx: number, dy: number): void {
  e.fx = dx; e.fy = dy; if (dx < 0) e.flip = true; if (dx > 0) e.flip = false;
  e.dir = dy < 0 ? 'up' : dy > 0 ? 'down' : 'side';
}
export function updMove(e: Ent, dt: number): void {
  if (e.moving) {
    e.t += dt / e.ms;
    if (e.t >= 1) { e.t = 1; e.tx = e.to.x; e.ty = e.to.y; e.moving = false; e.jump = false; }
    const t = e.t;
    e.px = e.from.x * TW + (e.to.x - e.from.x) * TW * t;
    e.py = e.from.y * TW + (e.to.y - e.from.y) * TW * t;
    e.animT += dt; if (e.animT > 110) { e.animT = 0; e.frame = (e.frame + 1) % 4; }
  } else { e.px = e.tx * TW; e.py = e.ty * TW; }
}
export function npcWalk(e: Ent, strict: boolean) {
  return (x: number, y: number): boolean =>
    !solidForNpc(x, y, e.leaving) && (!strict || (!!e.goal && x === e.goal.x && y === e.goal.y) || (!entAt(x, y, e) && !(G.player.tx === x && G.player.ty === y)));
}
export function goTo(e: Ent, goal: Spot): void {
  e.goal = goal;
  const g = (x: number, y: number) => x === goal.x && y === goal.y;
  e.path = bfs(e.tx, e.ty, g, npcWalk(e, true)) || bfs(e.tx, e.ty, g, npcWalk(e, false)) || [];
}
export const atGoal = (e: Ent): boolean => !!e.goal && e.tx === e.goal.x && e.ty === e.goal.y;
export function faceSpot(e: Ent): void {
  if (e.goal && e.goal.fx !== undefined) face(e, e.goal.fx, e.goal.fy!);
}
export function spawnNpc(kind: Kind, sprite: string): Ent {
  const e = mk(kind, sprite, cur.spawn.x, cur.spawn.y);
  e.goal = randSpot(); e.state = 'enter'; e.dwell = rnd(50000, 110000); G.ents.push(e); return e;
}
export function toast(txt: string, ms = 1400): void { G.toasts.push({ txt, t: ms }); }
