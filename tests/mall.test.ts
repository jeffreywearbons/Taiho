import { describe, it, expect } from 'vitest';
import { MAPS } from '../src/game/maps';
import { megaMall, ELEC, MALL } from '../src/game/mall';
import { genMap, validMap } from '../src/game/mapgen';
import { reseed } from '../src/core/rng';
import { OBSTACLE_STR } from '../src/game/state';

describe('big floors', () => {
  it('twenty floors: the store run grows every floor, the gate climbs all the way', () => {
    expect(MAPS.length).toBe(20);
    for (let i = 1; i < 10; i++) expect(MAPS[i].w * MAPS[i].h).toBeGreaterThan(MAPS[i - 1].w * MAPS[i - 1].h);
    for (let i = 1; i < MAPS.length; i++) expect(MAPS[i].gate).toBeGreaterThan(MAPS[i - 1].gate);
    expect(MAPS.slice(10).every((m) => m.outdoor)).toBe(true); expect(MAPS.slice(0, 10).some((m) => m.outdoor)).toBe(false);
  });
  it('built frames are valid before any blocks are added', () => {
    for (const d of MAPS.slice(3)) { expect(validMap(d.frame.map((r) => r.replace(/[^.#]/g, (c) => c)), { ...d, minBlockTiles: 0 })).toBe(true); expect(d.frame[d.elev.y + 1][d.elev.x]).toBe('.'); expect(d.frame[d.start.y][d.start.x]).toBe('.'); }
  });
  it('places each shop\'s own fixtures inside its room', () => {
    reseed(11); const m = genMap(MALL);
    for (const room of MALL.rooms!) {
      const others = MALL.blockTiles.filter((t) => !room.blockTiles.includes(t));
      for (let y = room.y0; y <= room.y1; y++) for (let x = room.x0; x <= room.x1; x++) expect(others.includes(m[y][x]), `${m[y][x]} at ${x},${y} is from another shop`).toBe(false);
    }
    expect(m.some((r) => /[SO]/.test(r))).toBe(true); expect(m.some((r) => /[KJ]/.test(r))).toBe(true);
  });
  it('mega malls are deterministic per floor and differ between floors', () => {
    expect(megaMall(2).frame).toEqual(megaMall(2).frame);
    expect(megaMall(2).frame.join('')).not.toBe(megaMall(3).frame.join(''));
    expect(megaMall(5).w).toBeLessThanOrEqual(72); expect(megaMall(5).h).toBeLessThanOrEqual(52);
  });
  it('electronics store needs Strength 3 for a tipped vending machine', () => { expect(ELEC.obstacleTier).toBe(3); expect(OBSTACLE_STR.vending).toBe(3); });
});
