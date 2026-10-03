import type { Pt } from './const';
import { ELEC, MALL, megaMall } from './mall';
import { TOKYO } from './tokyo';

export interface MapDef {
  id: string;
  name: { en: string; ja: string };
  w: number; h: number;
  frame: readonly string[];
  /** Where generated blocks may sit (inclusive). Chosen so every lane around the frame stays two wide. */
  interior: { x0: number; y0: number; x1: number; y1: number };
  blockTiles: readonly string[];
  blocks: [min: number, max: number];
  minBlockTiles: number;
  tiles: Record<string, string>;
  spawn: Pt; exit: Pt; elev: Pt; start: Pt; doorIn: Pt; doorOut: Pt;
  gate: number; maxNpc: number; targets: number;
  /** 0: bags only (boxes appear from level 3). 1: boxes from the start. 2: crates too (Strength 2). 3: tipped vending machines (Strength 3). */
  obstacleTier: number;
  /** Shops inside a mall: blocks placed in a room use that room's fixtures instead of blockTiles. */
  rooms?: { x0: number; y0: number; x1: number; y1: number; blockTiles: readonly string[] }[];
  /** A Tokyo street: the station stands in for the elevator and the koban for the shop. */
  outdoor?: boolean;
  /** Chases open the 'a' and 'w' tiles (back halls) into the map. */
  arena?: boolean;
}

const KONBINI_TILES: Record<string, string> = {
  W: 'wall', D: 'fridge_drinks', I: 'ice_cream', A: 'atm', E: 'elevator', V: 'vending', R: 'register', C: 'counter', H: 'hot_case',
  S: 'shelf_snacks', O: 'shelf_onigiri', '.': 'floor', M: 'magazine_rack', F: 'storefront', N: 'sign', Y: 'door', X: 'door',
  P: 'pavement', T: 'trash_bins', m: 'entrance_mat',
};

export const KONBINI: MapDef = {
  id: 'konbini', name: { en: 'Konbini', ja: 'コンビニ' }, w: 20, h: 15,
  frame: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WDDDDDDDDDDIIAAEVWWW',
    'WR..................',
    'WC..................',
    'WH..................',
    'WC..................',
    'W...................',
    'W...................',
    'W...................',
    'W...................',
    'W...................',
    'WMMM................',
    'FFFFFYFFFNFFFFXFFFFF',
    'PPPPPmPPPPPPPPmPPPTP',
    'PPPPPPPPPPPPPPPPPPPP',
  ],
  interior: { x0: 4, y0: 4, x1: 17, y1: 9 }, blockTiles: ['S', 'O'], blocks: [4, 6], minBlockTiles: 14,
  tiles: KONBINI_TILES,
  spawn: { x: 5, y: 14 }, exit: { x: 14, y: 14 }, elev: { x: 15, y: 1 }, start: { x: 9, y: 10 }, doorIn: { x: 5, y: 12 }, doorOut: { x: 14, y: 12 },
  gate: 5, maxNpc: 9, targets: 3, obstacleTier: 0,
};

export const BOUTIQUE: MapDef = {
  id: 'boutique', name: { en: 'Boutique', ja: 'ブティック' }, w: 28, h: 20,
  frame: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WQQQQQQLLUUEVLLQQQQQQUULLUUW',
    'WR.........................W',
    'WC.........................W',
    'WC.........................W',
    'WC.........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'W..........................W',
    'WJJJ.......................W',
    'ZZZZZZZYZZZZZNZZZZZZXZZZZZZZ',
    'PPPPPPPmPPPPPPPPPPPPmPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPTP',
  ],
  interior: { x0: 4, y0: 4, x1: 24, y1: 14 }, blockTiles: ['K', 'J'], blocks: [6, 9], minBlockTiles: 20,
  tiles: {
    W: 'wall_pink', Q: 'fitting_room', L: 'mirror', U: 'mannequin', E: 'elevator', V: 'vending', R: 'register_boutique', C: 'counter_boutique',
    J: 'display_table', K: 'rack_clothes', '.': 'floor_wood', Z: 'storefront_boutique', N: 'sign_boutique', Y: 'door_boutique', X: 'door_boutique',
    P: 'pavement', T: 'trash_bins', m: 'entrance_mat',
  },
  spawn: { x: 7, y: 19 }, exit: { x: 20, y: 19 }, elev: { x: 11, y: 1 }, start: { x: 13, y: 15 }, doorIn: { x: 7, y: 17 }, doorOut: { x: 20, y: 17 },
  gate: 10, maxNpc: 12, targets: 4, obstacleTier: 1,
};

export const DEPT: MapDef = {
  id: 'dept', name: { en: 'Department Store', ja: 'デパート' }, w: 36, h: 24,
  frame: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WcccccczzccccEVcccczzccccccWaaaaaaaH',
    'WR.........................WaaaaaaaH',
    'WC.........................WaaBBaaaH',
    'WC.........................WaaBBaaaH',
    'WC.........................WaaaaaaaH',
    'W..........................waaaaaaaH',
    'W..........................waaaaaaaH',
    'W..........................WaaaaaaaH',
    'W..........................WaaaaaBBH',
    'W..........................WaaaaaBBH',
    'W..........................WaaaaaaaH',
    'W..........................waaaaaaaH',
    'W..........................waaaaaaaH',
    'W..........................WaaaaaaaH',
    'W..........................WBBaaaaaH',
    'W..........................WBBaaaaaH',
    'W..........................WaaaaaaaH',
    'W..........................WaaaaaaaH',
    'W..........................WaaaaaaaH',
    'FFFFFFFFYFFFFNFFFFFXFFFFFFFFHHHHHHHH',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
  ],
  interior: { x0: 4, y0: 4, x1: 24, y1: 17 }, blockTiles: ['c', 's', 'g'], blocks: [7, 10], minBlockTiles: 24,
  tiles: {
    W: 'wall_dept', c: 'cosmetics', s: 'shoes', g: 'bags', z: 'escalator', E: 'elevator', V: 'vending', R: 'register_dept', C: 'counter_dept',
    '.': 'floor_marble', F: 'storefront_dept', N: 'sign_dept', Y: 'door_dept', X: 'door_dept', P: 'pavement', T: 'trash_bins', m: 'entrance_mat',
    a: 'hall_floor', w: 'arena_door', B: 'stock_shelf', H: 'hall_wall',
  },
  spawn: { x: 8, y: 23 }, exit: { x: 19, y: 23 }, elev: { x: 13, y: 1 }, start: { x: 13, y: 18 }, doorIn: { x: 8, y: 20 }, doorOut: { x: 19, y: 20 },
  gate: 15, maxNpc: 14, targets: 5, obstacleTier: 2, arena: true,
};

/** Maps 4 and 5 are built from fixed specs; floors 6-10 are mega malls assembled from a seed per floor. */
export const MAPS: readonly MapDef[] = [KONBINI, BOUTIQUE, DEPT, ELEC, MALL, megaMall(1), megaMall(2), megaMall(3), megaMall(4), megaMall(5), ...TOKYO];

/** The map currently loaded. Modules read dimensions and anchors from here. */
export let cur: MapDef = KONBINI;
export const dims = { w: KONBINI.w, h: KONBINI.h };
export function setMap(i: number): MapDef { cur = MAPS[Math.max(0, Math.min(MAPS.length - 1, i))]; dims.w = cur.w; dims.h = cur.h; return cur; }

/** Tiles an NPC may stop beside to "look at an item". */
export const ITEM_TILES = 'SODIMVAHRCQUJKLcsgztpkdeibqfuorhjlnxyvzG';
/** Tiles that become walkable while a chase has the arena open. */
export const ARENA_TILES = 'aw';
/** Solid for the player: anything that is not floor (the elevator opens separately). */
export const isFloor = (c: string): boolean => c === '.';

export function unlockedMaps(): number { try { return Math.max(1, Math.min(MAPS.length, Number(localStorage.getItem('taiho_unlocked') || 1))); } catch { return 1; } }
export function unlockMap(i: number): void { try { const n = Math.max(unlockedMaps(), i + 1); localStorage.setItem('taiho_unlocked', String(n)); } catch { /* ignore */ } }
