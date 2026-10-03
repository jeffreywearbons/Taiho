import type { MapDef } from './maps';

/** Builds the frame of a big floor: register corner, fixture strip with the elevator, shop partitions with
 *  two-wide openings, the back halls on the right, and the storefront with separate IN and OUT doors.
 *  Maps 4 and 5 use fixed specs; the mega malls draw a fresh spec from a seed per floor. */
export interface FloorSpec {
  id: string; name: { en: string; ja: string }; w: number; h: number;
  /** Fixture chars cycled along the top strip. */
  strip: string;
  /** Partition columns (x) and rows (y) inside the shop floor. */
  cols: number[]; rows: number[];
  /** Block tiles per room, left-to-right then top-to-bottom; cycles when short. */
  roomTiles: readonly (readonly string[])[];
  tiles: Record<string, string>;
  gate: number; maxNpc: number; targets: number; obstacleTier: number;
  /** Deterministic placement of stock shelves and hall openings. */
  seed: number;
}

/** Small deterministic generator so the frame never depends on the game's rng. */
function lcg(seed: number): () => number { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

export function buildFloor(sp: FloorSpec): MapDef {
  const { w, h } = sp; const ys = h - 4, hx = w - 9; const r = lcg(sp.seed);
  const rows: string[][] = [];
  for (let y = 0; y < h; y++) rows.push(new Array<string>(w).fill('.'));
  // outer walls and the hall
  for (let x = 0; x < w; x++) { rows[0][x] = 'W'; rows[ys][x] = x >= hx ? 'H' : 'F'; for (let y = ys + 1; y < h; y++) rows[y][x] = 'P'; }
  for (let y = 1; y < ys; y++) { rows[y][0] = 'W'; rows[y][hx] = 'W'; rows[y][w - 1] = 'H'; for (let x = hx + 1; x < w - 1; x++) rows[y][x] = 'a'; }
  // fixture strip with the elevator and a vending machine in the middle
  const xe = Math.floor(hx / 2);
  // partitions keep clear of the elevator column and the start tile below it
  const cols = sp.cols.map((px) => (px >= xe - 2 && px <= xe + 3 ? xe + 4 : px));
  for (let x = 1, i = 0; x < hx; x++, i++) rows[1][x] = sp.strip[i % sp.strip.length];
  rows[1][xe] = 'E'; rows[1][xe + 1] = 'V';
  rows[2][1] = 'R'; rows[3][1] = 'C'; rows[4][1] = 'C';
  // hall openings: pairs of rows, two or three of them spread down the divider
  const nOpen = ys > 30 ? 3 : 2;
  for (let i = 0; i < nOpen; i++) { const y = 5 + Math.floor(((ys - 9) * (i + 0.5)) / nOpen); rows[y][hx] = 'w'; rows[y + 1][hx] = 'w'; }
  // stock shelves in the hall, 2x2, at least two tiles apart
  const shelves: number[] = [];
  for (let y = 3; y <= ys - 4; y += 2) if (r() < 0.3 && (shelves.length === 0 || y - shelves[shelves.length - 1] >= 4)) { const sx = hx + 3 + (r() < 0.5 ? 0 : 1); shelves.push(y); for (const dy of [0, 1]) for (const dx of [0, 1]) rows[y + dy][sx + dx] = 'B'; }
  // shop partitions with 3-tall / 3-wide openings
  for (const px of cols) {
    const o1 = 4 + Math.floor((ys - 10) / 3), o2 = ys - 4 - Math.floor((ys - 10) / 3);
    for (let y = 2; y < ys; y++) rows[y][px] = (y >= o1 && y < o1 + 3) || (y >= o2 - 2 && y <= o2) ? '.' : '#';
  }
  const bounds = [0, ...cols, hx];
  for (const py of sp.rows) for (let x = 1; x < hx; x++) {
    if (cols.includes(x)) continue;
    const ci = bounds.findIndex((b, i) => x > b && x < bounds[i + 1]); const a = bounds[ci] + 1, b = bounds[ci + 1] - 1;
    const mid = Math.floor((a + b) / 2);
    rows[py][x] = x >= mid - 1 && x <= mid + 1 ? '.' : '#';
  }
  // the lane in front of the register stays open
  for (let y = 2; y <= 5; y++) for (let x = 2; x <= 3; x++) rows[y][x] = '.';
  // doors: IN on the left third, OUT on the right third, sign between
  const xin = Math.max(6, Math.floor(hx * 0.3)), xout = Math.min(hx - 6, Math.floor(hx * 0.7));
  rows[ys][xin] = 'Y'; rows[ys][xout] = 'X'; rows[ys][Math.floor((xin + xout) / 2)] = 'N';
  rows[ys + 1][xin] = 'm'; rows[ys + 1][xout] = 'm'; rows[h - 2][w - 2] = 'T';
  const frame = rows.map((rw) => rw.join(''));
  // rooms from the partitions
  const xs = [1, ...cols.map((c) => c + 1)], xe2 = [...cols.map((c) => c - 1), hx - 1];
  const ys0 = [2, ...sp.rows.map((c) => c + 1)], ys1 = [...sp.rows.map((c) => c - 1), ys - 1];
  const rooms: NonNullable<MapDef['rooms']> = []; let k = 0;
  for (let j = 0; j < ys0.length; j++) for (let i = 0; i < xs.length; i++) rooms.push({ x0: xs[i], y0: ys0[j], x1: xe2[i], y1: ys1[j], blockTiles: sp.roomTiles[k++ % sp.roomTiles.length] });
  const blockTiles = [...new Set(rooms.flatMap((rm) => rm.blockTiles))];
  const area = (hx - 2) * (ys - 2);
  const min = Math.max(6, Math.round(area / 95)), max = Math.max(min + 3, Math.round(area / 60));
  return {
    id: sp.id, name: sp.name, w, h, frame,
    interior: { x0: 4, y0: 4, x1: hx - 3, y1: ys - 3 }, blockTiles, blocks: [min, max], minBlockTiles: min * 3,
    tiles: sp.tiles, rooms,
    spawn: { x: xin, y: h - 1 }, exit: { x: xout, y: h - 1 }, elev: { x: xe, y: 1 }, start: { x: xe, y: ys - 2 }, doorIn: { x: xin, y: ys }, doorOut: { x: xout, y: ys },
    gate: sp.gate, maxNpc: sp.maxNpc, targets: sp.targets, obstacleTier: sp.obstacleTier, arena: true,
  };
}

/** Every fixture any shop can use. Each floor's own walls, floor and front override the first entries. */
export const SHOP_TILES: Record<string, string> = {
  E: 'elevator', V: 'vending', P: 'pavement', T: 'trash_bins', m: 'entrance_mat', a: 'hall_floor', w: 'arena_door', B: 'stock_shelf', H: 'hall_wall', z: 'escalator', '#': 'partition',
  S: 'shelf_snacks', O: 'shelf_onigiri', D: 'fridge_drinks', I: 'ice_cream', M: 'magazine_rack', A: 'atm',
  Q: 'fitting_room', L: 'mirror', U: 'mannequin', J: 'display_table', K: 'rack_clothes',
  c: 'cosmetics', s: 'shoes', g: 'bags',
  t: 'tv_wall', p: 'phone_counter', k: 'camera_case', d: 'pc_desk', e: 'speakers',
  i: 'kiosk', b: 'bench', q: 'planter', f: 'fountain', u: 'gacha',
};
const theme = (n: string): Record<string, string> => ({ ...SHOP_TILES, W: `wall_${n}`, '.': `floor_${n}`, F: `storefront_${n}`, N: `sign_${n}`, Y: `door_${n}`, X: `door_${n}`, R: `register_${n}`, C: `counter_${n}` });

/** Shops a mega mall can be assembled from: [fixture strip, block tiles]. */
const SHOPS: readonly [string, readonly string[]][] = [
  ['DDDSSOOMIA', ['S', 'O']],            // konbini
  ['QQLLUUKKJJ', ['K', 'J']],            // boutique
  ['ccsszzggcc', ['c', 's', 'g']],       // department floor
  ['ttppkkddee', ['t', 'p', 'k', 'd']],  // electronics
  ['bbqqiiuuff', ['b', 'q', 'i', 'u']],  // food court / arcade corner
];

export const ELEC: MapDef = buildFloor({
  id: 'elec', name: { en: 'Electronics Store', ja: 'でんきや' }, w: 44, h: 32,
  strip: 'ttppkkddeez', cols: [17], rows: [], roomTiles: [['t', 'e', 'd'], ['p', 'k']],
  tiles: theme('elec'), gate: 20, maxNpc: 16, targets: 6, obstacleTier: 3, seed: 4,
});
export const MALL: MapDef = buildFloor({
  id: 'mall', name: { en: 'Shopping Mall', ja: 'モール' }, w: 56, h: 40,
  strip: 'SSDDQQUUttppbbqqz', cols: [23], rows: [18], roomTiles: [['S', 'O'], ['K', 'J'], ['t', 'p', 'k'], ['b', 'q', 'i', 'u']],
  tiles: theme('mall'), gate: 25, maxNpc: 18, targets: 7, obstacleTier: 3, seed: 5,
});
/** Mega mall floor n (1-based): bigger each floor, shops drawn from the catalogue by seed. */
export function megaMall(n: number): MapDef {
  const r = lcg(1000 + n * 7919);
  const w = Math.min(72, 52 + 5 * n), h = Math.min(52, 38 + 3 * n);
  const hx = w - 9, ys = h - 4;
  const nCols = n >= 2 ? 3 : 2, nRows = n >= 3 ? 2 : 1 + (r() < 0.5 ? 1 : 0);
  const cols: number[] = []; for (let i = 1; i < nCols; i++) cols.push(Math.round((hx * i) / nCols) + Math.floor(r() * 3) - 1);
  const rows: number[] = []; for (let i = 1; i < nRows; i++) rows.push(Math.round(((ys - 2) * i) / nRows) + 2 + Math.floor(r() * 3) - 1);
  const picks = Array.from({ length: nCols * nRows }, () => SHOPS[Math.floor(r() * SHOPS.length)]);
  const strip = picks.map((p) => p[0]).join('') + 'z';
  return buildFloor({
    id: `mega${n}`, name: { en: `Mega Mall ${n}F`, ja: `メガモール ${n}かい` }, w, h,
    strip, cols, rows, roomTiles: picks.map((p) => p[1]),
    tiles: theme('mall'), gate: 25 + 5 * n, maxNpc: 18 + 2 * n, targets: 7 + n, obstacleTier: 3, seed: 100 + n,
  });
}
