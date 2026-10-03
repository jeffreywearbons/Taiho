import { DIRS, type Pt } from './const';
import { dims } from './maps';

type Walk = (x: number, y: number) => boolean;
const inb = (x: number, y: number) => x >= 0 && y >= 0 && x < dims.w && y < dims.h;

/** Breadth-first path on the tile grid. Returns the steps after the start, or null. */
export function bfs(sx: number, sy: number, goal: (x: number, y: number) => boolean, walk: Walk): Pt[] | null {
  const W = dims.w;
  const key = (x: number, y: number) => y * W + x;
  const prev = new Map<number, number>();
  prev.set(key(sx, sy), -1);
  const q: [number, number][] = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.shift()!;
    if (goal(x, y) && !(x === sx && y === sy)) {
      const path: Pt[] = [];
      let k = key(x, y);
      while (k !== -1 && k !== key(sx, sy)) { path.push({ x: k % W, y: Math.floor(k / W) }); k = prev.get(k)!; }
      return path.reverse();
    }
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!inb(nx, ny) || prev.has(key(nx, ny)) || !walk(nx, ny)) continue;
      prev.set(key(nx, ny), key(x, y)); q.push([nx, ny]);
    }
  }
  return null;
}

/** Distance from (sx,sy) to every tile, -1 where unreachable. Index with y * dims.w + x. */
export function distMap(sx: number, sy: number, walk: Walk): Int16Array {
  const W = dims.w;
  const d = new Int16Array(W * dims.h).fill(-1);
  d[sy * W + sx] = 0;
  const q: [number, number][] = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.shift()!;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!inb(nx, ny) || d[ny * W + nx] >= 0 || !walk(nx, ny)) continue;
      d[ny * W + nx] = d[y * W + x] + 1; q.push([nx, ny]);
    }
  }
  return d;
}
