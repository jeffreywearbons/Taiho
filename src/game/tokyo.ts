import type { MapDef } from './maps';
import { buildFloor, type FloorSpec } from './mall';

/**
 * Floors 11-20: outdoors in Tokyo. The same floor builder, read as a street: building fronts along the top
 * with the station entrance (the "elevator"), a koban in the corner (the shop), railings for partitions,
 * back alleys for the chase arena, and the station stairs on the road side as the IN and OUT.
 */
const STREET: Record<string, string> = {
  F: 'guardrail', N: 'district_sign', Y: 'stairs', X: 'stairs', R: 'koban', C: 'koban_wall', E: 'station', V: 'vending',
  '#': 'railing', a: 'alley', w: 'arena_door', B: 'dumpster', H: 'brick', P: 'road', m: 'crosswalk', T: 'bicycle',
  o: 'neon_sign', r: 'izakaya_lantern', h: 'hachiko', j: 'big_screen', l: 'show_window', k: 'street_clock',
  n: 'paper_lantern', x: 'nakamise_stall', d: 'incense_burner', c: 'crepe_stand', p: 'photo_booth', K: 'rack_clothes',
  y: 'arcade_cab', G: 'gacha', g: 'poster_board', s: 'fish_stall', v: 'fish_crates', S: 'market_awning',
  t: 'tower_leg', e: 'taxi', i: 'bar_sign', u: 'robot_statue', f: 'palm', z: 'ferris_cabin', b: 'bench', q: 'planter',
};
const look = (building: 'neon' | 'stone' | 'temple', ground: 'sidewalk' | 'sidewalk_night' | 'stone_plaza'): Record<string, string> => ({ ...STREET, W: `building_${building}`, '.': ground });

type District = Omit<FloorSpec, 'tiles' | 'obstacleTier' | 'seed'> & { tiles: Record<string, string> };
const d = (n: number, sp: District): MapDef => ({ ...buildFloor({ ...sp, obstacleTier: 3, seed: 200 + n }), outdoor: true });

/** Statues, the clock, the tower leg and the robot stand only along the building strip; rows of lanterns, signs,
 *  taxis and palms read fine as blocks. In the order the train stops: the run starts at the world's busiest crossing and ends by the bay. */
export const TOKYO: readonly MapDef[] = [
  d(11, { id: 'shibuya', name: { en: 'Shibuya Crossing', ja: 'しぶや スクランブル' }, w: 56, h: 40, strip: 'jjWWhhWWbbWWkkWW', cols: [23], rows: [], roomTiles: [['j', 'b'], ['q', 'j']], tiles: look('stone', 'sidewalk'), gate: 55, maxNpc: 24, targets: 9 }),
  d(12, { id: 'harajuku', name: { en: 'Harajuku Takeshita Street', ja: 'はらじゅく たけしたどおり' }, w: 58, h: 42, strip: 'ccWWppWWKKWWggWW', cols: [24], rows: [], roomTiles: [['c', 'p', 'K'], ['g', 'K', 'c']], tiles: look('stone', 'sidewalk'), gate: 60, maxNpc: 25, targets: 9 }),
  d(13, { id: 'kabukicho', name: { en: 'Kabukicho', ja: 'かぶきちょう' }, w: 60, h: 44, strip: 'ooWWrrWWiiWWooWW', cols: [25], rows: [20], roomTiles: [['o', 'r'], ['i', 'e'], ['o', 'i'], ['r', 'e']], tiles: look('neon', 'sidewalk_night'), gate: 65, maxNpc: 26, targets: 10 }),
  d(14, { id: 'ginza', name: { en: 'Ginza', ja: 'ぎんざ' }, w: 62, h: 44, strip: 'llWWkkWWllWWqqWW', cols: [26], rows: [], roomTiles: [['l', 'q'], ['b', 'l']], tiles: look('stone', 'sidewalk'), gate: 70, maxNpc: 27, targets: 10 }),
  d(15, { id: 'asakusa', name: { en: 'Asakusa Temple', ja: 'あさくさの おてら' }, w: 64, h: 46, strip: 'nnWWxxWWddWWnnWW', cols: [27], rows: [21], roomTiles: [['x', 'n'], ['n', 'q'], ['x', 'q'], ['n', 'x']], tiles: look('temple', 'stone_plaza'), gate: 75, maxNpc: 28, targets: 11 }),
  d(16, { id: 'akihabara', name: { en: 'Akihabara', ja: 'あきはばら' }, w: 64, h: 48, strip: 'yyWWGGWWggWWooWW', cols: [27], rows: [], roomTiles: [['y', 'G'], ['g', 'o', 'y']], tiles: look('neon', 'sidewalk'), gate: 80, maxNpc: 29, targets: 11 }),
  d(17, { id: 'ameyoko', name: { en: 'Ameyoko Market', ja: 'アメよこ' }, w: 66, h: 48, strip: 'SSWWssWWvvWWSSWW', cols: [28], rows: [22], roomTiles: [['S', 's'], ['v', 'S'], ['s', 'b'], ['S', 'v']], tiles: look('stone', 'sidewalk'), gate: 85, maxNpc: 30, targets: 12 }),
  d(18, { id: 'tsukiji', name: { en: 'Tsukiji Outer Market', ja: 'つきじ そとの いちば' }, w: 68, h: 50, strip: 'ssWWvvWWSSWWssWW', cols: [29], rows: [23], roomTiles: [['s', 'v'], ['S', 'v'], ['s', 'e'], ['v', 'S']], tiles: look('stone', 'sidewalk'), gate: 90, maxNpc: 31, targets: 12 }),
  d(19, { id: 'roppongi', name: { en: 'Roppongi & Tokyo Tower', ja: 'ろっぽんぎ と とうきょうタワー' }, w: 70, h: 52, strip: 'ttWWiiWWooWWeeWW', cols: [30], rows: [24], roomTiles: [['i', 'e'], ['o', 'e'], ['i', 'q'], ['o', 'i']], tiles: look('neon', 'sidewalk_night'), gate: 95, maxNpc: 32, targets: 13 }),
  d(20, { id: 'odaiba', name: { en: 'Odaiba', ja: 'おだいば' }, w: 72, h: 52, strip: 'uuWWffWWzzWWbbWW', cols: [31], rows: [24], roomTiles: [['f', 'z'], ['z', 'b'], ['f', 'q'], ['f', 'b']], tiles: look('stone', 'sidewalk'), gate: 100, maxNpc: 33, targets: 13 }),
];
