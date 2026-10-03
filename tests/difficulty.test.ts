import { describe, it, expect } from 'vitest';
import { pervParams, ANCHORS } from '../src/game/difficulty';

describe('difficulty curve', () => {
  it('hits the anchors exactly', () => {
    for (const lv of [1, 25, 50, 75, 100]) { const p = pervParams(lv); for (const k of Object.keys(ANCHORS) as (keyof typeof ANCHORS)[]) expect(p[k]).toBeCloseTo(ANCHORS[k][lv]); }
  });
  it('is monotonic where it should be and clamps past 100', () => {
    let prev = pervParams(1);
    for (let lv = 2; lv <= 100; lv++) { const p = pervParams(lv); expect(p.speed).toBeGreaterThanOrEqual(prev.speed); expect(p.windowSec).toBeLessThanOrEqual(prev.windowSec); expect(p.rerollSec).toBeLessThanOrEqual(prev.rerollSec); prev = p; }
    expect(pervParams(250)).toEqual(pervParams(100));
    expect(pervParams(100).windowSec).toBeGreaterThanOrEqual(5);
  });
});
