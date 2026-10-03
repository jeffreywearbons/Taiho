import type { Pt } from './const';

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
  /** 0: bags only (boxes appear from level 3). 1: boxes from the start. */
  obstacleTier: number;
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

export const MAPS: readonly MapDef[] = [KONBINI, BOUTIQUE];

/** The map currently loaded. Modules read dimensions and anchors from here. */
export let cur: MapDef = KONBINI;
export const dims = { w: KONBINI.w, h: KONBINI.h };
export function setMap(i: number): MapDef { cur = MAPS[Math.max(0, Math.min(MAPS.length - 1, i))]; dims.w = cur.w; dims.h = cur.h; return cur; }

/** Tiles an NPC may stop beside to "look at an item". */
export const ITEM_TILES = 'SODIMVAHRCQUJKL';
/** Solid for the player: anything that is not floor (the elevator opens separately). */
export const isFloor = (c: string): boolean => c === '.';

export function unlockedMaps(): number { try { return Math.max(1, Math.min(MAPS.length, Number(localStorage.getItem('taiho_unlocked') || 1))); } catch { return 1; } }
export function unlockMap(i: number): void { try { const n = Math.max(unlockedMaps(), i + 1); localStorage.setItem('taiho_unlocked', String(n)); } catch { /* ignore */ } }
