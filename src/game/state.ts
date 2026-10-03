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
  dir: Facing; boss: boolean; bossId: number; stunT: number;
}
export type Facing = 'down' | 'up' | 'side';

export type ObstacleType = 'bag' | 'box' | 'crate' | 'vending';
export type Obstacle = { x: number; y: number; type: ObstacleType };
/** Strength needed to smash each obstacle; bags are hopped instead. */
export const OBSTACLE_STR: Record<ObstacleType, number> = { bag: 0, box: 1, crate: 2, vending: 3 };
export type Chase = { perv: Ent; t: number; reroll: number; obsT: number; P: PervParams; juice: boolean; vita: boolean; charm: boolean; frozen: number; hops: number; smashes: number; byBall: boolean };
export type Ball = { x: number; y: number; dx: number; dy: number; d: number };
export type TextBox = { pages: Page[]; i: number; shown: number; onDone?: () => void };
export type Toast = { txt: string; t: number };
export type Particle = { x: number; y: number; vx: number; vy: number; t: number; life: number; kind: string; c: string; s: number };
export type Sign = { title: string; lines: [string, string][]; t: number };
export type Mode = 'story' | 'time';
export type Scene = 'title' | 'play' | 'pick' | 'shop' | 'end' | 'result' | 'offer';
export type Stats = { speed: number; detect: number; strength: number };
export type ItemKey = 'ball' | 'net' | 'peel' | 'decoy' | 'stop' | 'cart' | 'senzu' | 'juice' | 'vita' | 'shield' | 'charm';
export type Inv = Record<ItemKey, number>;
export const emptyInv = (): Inv => ({ ball: 0, net: 0, peel: 0, decoy: 0, stop: 0, cart: 0, senzu: 0, juice: 0, vita: 0, shield: 0, charm: 0 });
export const ACTIVE_ITEMS: ItemKey[] = ['ball', 'net', 'peel', 'decoy', 'stop', 'cart', 'senzu'];
export const MAX_HP = 10;
/** HP lost when the hero bumps into an obstacle instead of hopping or smashing it. */
export const OBSTACLE_DMG: Record<ObstacleType, number> = { bag: 1, box: 2, crate: 3, vending: 4 };
export type Peel = { x: number; y: number };
export type Decoy = { x: number; y: number; t: number };
export type Tut = { step: number; moved: number; done: boolean; perv: Ent | null; shown: Set<string>; s3?: boolean };

export interface Game {
  scene: Scene; mode: Mode;
  map: string[]; floorTiles: Pt[]; browseSpots: Spot[];
  ents: Ent[]; obstacles: Obstacle[]; player: Ent; bonsai: Ent;
  sign: Sign | null; pendingTutBuy: boolean;
  chase: Chase | null; balls: Ball[]; peels: Peel[]; decoy: Decoy | null; cartT: number; equip: ItemKey; toasts: Toast[]; box: TextBox | null;
  catches: number; escapes: number; level: number; xp: number; pendingLevel: number; stats: Stats;
  yen: number; inv: Inv; floor: number; elevOpen: boolean;
  tutorial: boolean; tut: Tut; freeze: number; stamp: { t: number; txt: string } | null; shake: number;
  spawnT: number; time: number; timeLeft: number; lastRun: { catches: number; level: number; map: number } | null;
  totalCatches: number; costume: number; mapIndex: number;
  /** Purchased cosmetic ids and the one being worn (null = earned look). */
  wardrobe: string[]; wearing: string | null; aura: string | null; trail: string | null;
  particles: Particle[]; trailT: number;
  hp: number; hurtT: number; regenT: number; koT: number;
  offer: { kind: 'second_chance'; perv: Ent } | { kind: 'double_boss'; yen: number; xp: number } | null; offerUsed: boolean;
  arena: boolean; arenaT: number; arenaTiles: Pt[];
  streak: number; bestStreak: number; pervSpawns: number;
  /** Highest level whose boss has already been caught (persisted) or spawned this session. */
  lastBossLevel: number; bossDone: number;
}

export function mk(kind: Kind, sprite: string, tx: number, ty: number): Ent {
  return {
    kind, sprite, tx, ty, px: tx * 16, py: ty * 16,
    moving: false, from: { x: tx, y: ty }, to: { x: tx, y: ty }, t: 0, ms: 170,
    flip: false, frame: 0, animT: 0, path: [], goal: null, waitT: 0, idleT: 0,
    state: 'enter', st: 0, timer: 0, dwell: 0, target: null, jump: false, fx: 0, fy: 1,
    leaving: false, bailT: 0, scripted: false, age: 0, looking: false, chasing: false, dead: false, onElev: false, dir: 'down', boss: false, bossId: 0, stunT: 0,
  };
}

export function newGame(): Game {
  return {
    scene: 'title', mode: 'story', map: KONBINI.frame.slice(), floorTiles: [], browseSpots: [],
    ents: [], obstacles: [], player: mk('player', 'hero', 9, 10), bonsai: mk('bonsai', 'bonsai', 8, 10),
    sign: null, pendingTutBuy: false,
    chase: null, balls: [], peels: [], decoy: null, cartT: 0, equip: 'ball', toasts: [], box: null,
    catches: 0, escapes: 0, level: 1, xp: 0, pendingLevel: 0, stats: { speed: 0, detect: 0, strength: 0 },
    yen: 0, inv: emptyInv(), floor: 1, elevOpen: false,
    tutorial: true, tut: { step: 0, moved: 0, done: false, perv: null, shown: new Set() }, freeze: 0, stamp: null, shake: 0,
    spawnT: 2000, time: 0, timeLeft: 0, lastRun: null, totalCatches: 0, costume: 0, mapIndex: 0, wardrobe: [], wearing: null, aura: null, trail: null, particles: [], trailT: 0, hp: 10, hurtT: 0, regenT: 0, koT: 0, offer: null, offerUsed: false, arena: false, arenaT: 0, arenaTiles: [],
    streak: 0, bestStreak: 0, pervSpawns: 0, lastBossLevel: 0, bossDone: 0,
  };
}

/** The single live game. Modules operate on it directly; keeps the port close to the proven demo. */
export const G: Game = newGame();

export const xpNeed = (l: number): number => 100 * l;
export const playerMs = (): number => Math.round(150 * (1 - 0.08 * G.stats.speed) * (G.chase && G.chase.vita ? 0.66 : 1) * (G.cartT > 0 ? 0.5 : 1));
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
