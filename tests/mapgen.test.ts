import { describe, it, expect } from 'vitest';
import { genMap, hasOneWideLane, allFloorConnected, validMap } from '../src/game/mapgen';
import { FRAME, PLAYER_START, MW, MH } from '../src/game/const';
import { reseed } from '../src/core/rng';

describe('aisle generator', () => {
  it('produces valid layouts across many seeds', () => {
    for (let s = 1; s <= 200; s++) {
      reseed(s);
      const m = genMap(PLAYER_START);
      expect(m.length).toBe(MH); for (const r of m) expect(r.length).toBe(MW);
      expect(hasOneWideLane(m), `seed ${s} has a one-wide lane`).toBeNull();
      expect(allFloorConnected(m, PLAYER_START), `seed ${s} has unreachable floor`).toBe(true);
      expect(validMap(m, PLAYER_START)).toBe(true);
    }
  });
  it('keeps the frame intact', () => {
    reseed(7); const m = genMap(PLAYER_START);
    expect(m[0]).toBe(FRAME[0]); expect(m[1]).toBe(FRAME[1]); expect(m[12]).toBe(FRAME[12]); expect(m[13]).toBe(FRAME[13]); expect(m[14]).toBe(FRAME[14]);
    expect(m[11].slice(0, 4)).toBe('WMMM');
  });
  it('varies between seeds', () => {
    reseed(1); const a = genMap(PLAYER_START).join(''); reseed(2); const b = genMap(PLAYER_START).join('');
    expect(a).not.toBe(b);
  });
  it('rejects a hand-made one-wide lane', () => {
    const m = FRAME.map((r) => r.split(''));
    for (let x = 4; x < 10; x++) { m[4][x] = 'S'; m[6][x] = 'S'; }  // row 5 becomes a one-wide lane
    expect(hasOneWideLane(m.map((r) => r.join('')))).not.toBeNull();
  });
});
