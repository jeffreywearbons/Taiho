export const TW = 16;
export type Pt = { x: number; y: number };
export type Spot = Pt & { fx?: number; fy?: number };
export const DIRS: ReadonlyArray<readonly [number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
export const CHASE_MS = 20000;
export const TIME_ATTACK_MS = 90000;
export const BOLT_RANGE = 3;
