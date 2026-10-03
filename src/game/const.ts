export const TW = 16;
export const MW = 20;
export const MH = 15;

export type Pt = { x: number; y: number };
export type Spot = Pt & { fx?: number; fy?: number };

export const DIRS: ReadonlyArray<readonly [number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** Map legend. Everything but '.' is solid for the player. */
export const TILE: Record<string, string> = {
  W: 'wall', D: 'fridge_drinks', I: 'ice_cream', A: 'atm', E: 'elevator', V: 'vending',
  R: 'register', C: 'counter', H: 'hot_case', S: 'shelf_snacks', O: 'shelf_onigiri',
  '.': 'floor', M: 'magazine_rack', F: 'storefront', N: 'sign', Y: 'door', X: 'door',
  P: 'pavement', T: 'trash_bins', m: 'entrance_mat',
};

/** Tiles an NPC may stop beside to "look at an item". */
export const ITEM_TILES = 'SODIMVAHRC';

/** Fixed frame of map 1, the Konbini. Aisles are generated inside it per run. */
export const FRAME: readonly string[] = [
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
];

export const SPAWN: Pt = { x: 5, y: 14 };   // below the IN door
export const EXIT: Pt = { x: 14, y: 14 };   // below the OUT door
export const ELEV: Pt = { x: 15, y: 1 };
export const PLAYER_START: Pt = { x: 9, y: 10 };
export const MAX_NPC = 9;
export const GATE_CATCHES = 5;
export const CHASE_MS = 20000;
export const TIME_ATTACK_MS = 90000;
export const BOLT_RANGE = 3;
