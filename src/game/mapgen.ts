import { FRAME, MW, MH, DIRS, type Pt } from './const';
import { rint, random } from '../core/rng';

/** Rule: every lane is at least two tiles wide. A walkable tile may never be
 *  pinched between solids on both sides, horizontally or vertically. */
export function hasOneWideLane(m: readonly string[]): Pt | null {
  const sol = (x: number, y: number) => !(x >= 0 && y >= 0 && x < MW && y < MH) || m[y][x] !== '.';
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (m[y][x] !== '.') continue;
    if ((sol(x - 1, y) && sol(x + 1, y)) || (sol(x, y - 1) && sol(x, y + 1))) return { x, y };
  }
  return null;
}

export function allFloorConnected(m: readonly string[], from: Pt): boolean {
  const sol = (x: number, y: number) => !(x >= 0 && y >= 0 && x < MW && y < MH) || m[y][x] !== '.';
  let floor = 0;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (m[y][x] === '.') floor++;
  const seen = new Set<number>([from.x * 100 + from.y]);
  const q: Pt[] = [from];
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (sol(nx, ny) || seen.has(nx * 100 + ny)) continue;
      seen.add(nx * 100 + ny); q.push({ x: nx, y: ny });
    }
  }
  return seen.size === floor;
}

export function validMap(m: readonly string[], from: Pt): boolean {
  if (hasOneWideLane(m)) return false;
  let shelves = 0;
  for (const row of m) for (const c of row) if (c === 'S' || c === 'O') shelves++;
  if (shelves < 14) return false;
  return allFloorConnected(m, from);
}

type Block = { x: number; y: number; w: number; h: number; t: 'S' | 'O' };

/** Blocks live inside x 4..17, y 4..9 so every lane around the frame stays two wide. */
export function genMap(from: Pt, attempts = 300): string[] {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const rows = FRAME.map((r) => r.split(''));
    const blocks: Block[] = [];
    const want = rint(4, 6);
    for (let tries = 0; tries < 80 && blocks.length < want; tries++) {
      const vert = random() < 0.4;
      const w = vert ? rint(1, 2) : rint(3, 7);
      const h = vert ? rint(3, 5) : rint(1, 2);
      const x = rint(4, 17 - w + 1), y = rint(4, 9 - h + 1);
      if (x + w - 1 > 17 || y + h - 1 > 9) continue;
      const clash = blocks.some((b) => !(x > b.x + b.w + 1 || x + w + 1 < b.x || y > b.y + b.h + 1 || y + h + 1 < b.y));
      if (clash) continue;
      blocks.push({ x, y, w, h, t: random() < 0.55 ? 'S' : 'O' });
    }
    if (blocks.length < 3) continue;
    for (const b of blocks) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) rows[yy][xx] = b.t;
    const m = rows.map((r) => r.join(''));
    if (validMap(m, from)) return m;
  }
  return FRAME.slice();
}
