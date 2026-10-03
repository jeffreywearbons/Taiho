import { type Pt, type Spot } from './const';
import { KONBINI } from './maps';
import type { PervParams } from './difficulty';
import type { Page } from '../i18n/en';

export type Kind = 'player' | 'shopper' | 'target' | 'perv' | 'bonsai';
export type PervState = 'enter' | 'nothing' | 'scoping' | 'setup' | 'live' | 'finish' | 'chase';
export type NpcState = 'enter' | 'wander' | 'leave' | PervState;

export interface Ent {
  kind: Kind; sprite: string;
  tx: number; ty: number; px: number; py: number;
  moving: boolean; from: Pt; to: Pt; t: number; ms: number;
  flip: boolean; frame: number; animT: number;
  path: Pt[]; goal: Spot | null; waitT: number; idleT: number;
  state: NpcState; st: number; timer: number; dwell: number;
  target: Ent | null; jump: boolean; fx: number; fy: number;
  leaving: boolean; bailT: number; scripted: boolean; age: number; looking: boolean;
  chasing: boolean; dead: boolean; onElev: boolean;
  dir: Facing;
}
export type Facing = 'down' | 'up' | 'side';

export type Obstacle = { x: number; y: number; type: 'bag' | 'box' };
export type Chase = { perv: Ent; t: number; reroll: number; obsT: number; P: PervParams; juice: boolean; vita: boolean };
export type Ball = { x: number; y: number; dx: number; dy: number; d: number };
export type TextBox = { pages: Page[]; i: number; shown: number; onDone?: () => void };
export type Toast = { txt: string; t: number };
export type Mode = 'story' | 'time';
export type Scene = 'title' | 'play' | 'pick' | 'shop' | 'end' | 'result';
export type Stats = { speed: number; detect: number; strength: number };
export type Inv = { ball: number; juice: number; vita: number };
export type Tut = { step: number; moved: number; done: boolean; perv: Ent | null; shown: Set<string>; s3?: boolean };

export interface Game {
  scene: Scene; mode: Mode;
  map: string[]; floorTiles: Pt[]; browseSpots: Spot[];
  ents: Ent[]; obstacles: Obstacle[]; player: Ent; bonsai: Ent;
  chase: Chase | null; ball: Ball | null; toasts: Toast[]; box: TextBox | null;
  catches: number; escapes: number; level: number; xp: number; pendingLevel: number; stats: Stats;
  yen: number; inv: Inv; floor: number; elevOpen: boolean;
  tutorial: boolean; tut: Tut; freeze: number; stamp: { t: number; txt: string } | null; shake: number;
  spawnT: number; time: number; timeLeft: number; lastRun: { catches: number; level: number } | null;
  totalCatches: number; costume: number; mapIndex: number;
}

export function mk(kind: Kind, sprite: string, tx: number, ty: number): Ent {
  return {
    kind, sprite, tx, ty, px: tx * 16, py: ty * 16,
    moving: false, from: { x: tx, y: ty }, to: { x: tx, y: ty }, t: 0, ms: 170,
    flip: false, frame: 0, animT: 0, path: [], goal: null, waitT: 0, idleT: 0,
    state: 'enter', st: 0, timer: 0, dwell: 0, target: null, jump: false, fx: 0, fy: 1,
    leaving: false, bailT: 0, scripted: false, age: 0, looking: false, chasing: false, dead: false, onElev: false, dir: 'down',
  };
}

export function newGame(): Game {
  return {
    scene: 'title', mode: 'story', map: KONBINI.frame.slice(), floorTiles: [], browseSpots: [],
    ents: [], obstacles: [], player: mk('player', 'hero', 9, 10), bonsai: mk('bonsai', 'bonsai', 8, 10),
    chase: null, ball: null, toasts: [], box: null,
    catches: 0, escapes: 0, level: 1, xp: 0, pendingLevel: 0, stats: { speed: 0, detect: 0, strength: 0 },
    yen: 0, inv: { ball: 0, juice: 0, vita: 0 }, floor: 1, elevOpen: false,
    tutorial: true, tut: { step: 0, moved: 0, done: false, perv: null, shown: new Set() }, freeze: 0, stamp: null, shake: 0,
    spawnT: 2000, time: 0, timeLeft: 0, lastRun: null, totalCatches: 0, costume: 0, mapIndex: 0,
  };
}

/** The single live game. Modules operate on it directly; keeps the port close to the proven demo. */
export const G: Game = newGame();

export const xpNeed = (l: number): number => 100 * l;
export const playerMs = (): number => Math.round(150 * (1 - 0.08 * G.stats.speed) * (G.chase && G.chase.vita ? 0.66 : 1));
export const detectR = (): number => 6 + 2 * G.stats.detect;

/** Costume tiers: 0 civilian, 1 masked (Lv5), 2 caped (Lv10), 3 vigilante (Lv15), 4 gold (100 career catches). */
export const COSTUME_SPRITES = ['hero', 'hero_mask', 'hero_cape', 'hero_vig', 'hero_gold'] as const;
export function costumeTier(level: number, totalCatches: number): number {
  if (totalCatches >= 100) return 4;
  if (level >= 15) return 3;
  if (level >= 10) return 2;
  if (level >= 5) return 1;
  return 0;
}
/** Walk cycle: stand, step, stand, other step. */
export const WALK_SEQ = [1, 0, 2, 0] as const;
export const frameName = (e: Ent): string => `${e.sprite}_${e.dir}_${e.moving ? WALK_SEQ[e.frame % 4] : 0}`;
