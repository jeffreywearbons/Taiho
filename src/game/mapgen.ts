import { DIRS, type Pt } from './const';
import type { MapDef } from './maps';
import { rint, random } from '../core/rng';

const OPEN_CHASE = '.aw';

/** Rule: every lane is at least two tiles wide. A walkable tile may never be
 *  pinched between solids on both sides, horizontally or vertically. */
export function hasOneWideLane(m: readonly string[], open = OPEN_CHASE): Pt | null {
  const h = m.length, w = m[0].length;
  const sol = (x: number, y: number) => !(x >= 0 && y >= 0 && x < w && y < h) || !open.includes(m[y][x]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!open.includes(m[y][x])) continue;
    if ((sol(x - 1, y) && sol(x + 1, y)) || (sol(x, y - 1) && sol(x, y + 1))) return { x, y };
  }
  return null;
}

export function allFloorConnected(m: readonly string[], from: Pt, open = '.'): boolean {
  const h = m.length, w = m[0].length;
  const sol = (x: number, y: number) => !(x >= 0 && y >= 0 && x < w && y < h) || !open.includes(m[y][x]);
  let floor = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (open.includes(m[y][x])) floor++;
  const seen = new Set<number>([from.x * 1000 + from.y]);
  const q: Pt[] = [from];
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (sol(nx, ny) || seen.has(nx * 1000 + ny)) continue;
      seen.add(nx * 1000 + ny); q.push({ x: nx, y: ny });
    }
  }
  return seen.size === floor;
}

export function validMap(m: readonly string[], def: MapDef): boolean {
  if (hasOneWideLane(m)) return false;
  let blocks = 0;
  for (const row of m) for (const c of row) if (def.blockTiles.includes(c)) blocks++;
  if (blocks < def.minBlockTiles) return false;
  if (!allFloorConnected(m, def.start, '.')) return false;
  return !def.arena || allFloorConnected(m, def.start, OPEN_CHASE);
}

type Block = { x: number; y: number; w: number; h: number; t: string };

/** Random shelf blocks inside the map's interior, at least two tiles apart, validated. */
export function genMap(def: MapDef, attempts = 300): string[] {
  const { x0, y0, x1, y1 } = def.interior;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const rows = def.frame.map((r) => r.split(''));
    const blocks: Block[] = [];
    const want = rint(def.blocks[0], def.blocks[1]);
    for (let tries = 0; tries < 120 && blocks.length < want; tries++) {
      const vert = random() < 0.4;
      const w = vert ? rint(1, 2) : rint(3, 7);
      const h = vert ? rint(3, 5) : rint(1, 2);
      if (x0 + w - 1 > x1 || y0 + h - 1 > y1) continue;
      const x = rint(x0, x1 - w + 1), y = rint(y0, y1 - h + 1);
      const clash = blocks.some((b) => !(x > b.x + b.w + 1 || x + w + 1 < b.x || y > b.y + b.h + 1 || y + h + 1 < b.y));
      if (clash) continue;
      // the footprint must be floor, and nothing solid inside the interior (shop partitions) may sit within two tiles of it
      let bad = false;
      for (let yy = y - 2; yy <= y + h + 1 && !bad; yy++) for (let xx = x - 2; xx <= x + w + 1; xx++) {
        const inside = xx >= x && xx < x + w && yy >= y && yy < y + h;
        const c = rows[yy]?.[xx];
        if (inside ? c !== '.' : xx >= x0 && xx <= x1 && yy >= y0 && yy <= y1 && c !== '.') { bad = true; break; }
      }
      if (bad) continue;
      const room = def.rooms?.find((r) => x >= r.x0 && x + w - 1 <= r.x1 && y >= r.y0 && y + h - 1 <= r.y1);
      if (def.rooms && !room) continue;
      const tiles = room ? room.blockTiles : def.blockTiles;
      blocks.push({ x, y, w, h, t: tiles[Math.floor(random() * tiles.length)] });
    }
    if (blocks.length < 3) continue;
    for (const b of blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) rows[yy][xx] = b.t;
    const m = rows.map((r) => r.join(''));
    if (validMap(m, def)) return m;
  }
  return def.frame.slice();
}
