import { describe, it, expect } from 'vitest';
import { genMap, hasOneWideLane, allFloorConnected, validMap } from '../src/game/mapgen';
import { MAPS, KONBINI, BOUTIQUE } from '../src/game/maps';
import { reseed } from '../src/core/rng';

describe('aisle generator', () => {
  for (const def of MAPS) {
    it(`produces valid ${def.id} layouts across many seeds`, () => {
      for (let s = 1; s <= 150; s++) {
        reseed(s);
        const m = genMap(def);
        expect(m.length).toBe(def.h); for (const r of m) expect(r.length).toBe(def.w);
        expect(hasOneWideLane(m), `${def.id} seed ${s} has a one-wide lane`).toBeNull();
        expect(allFloorConnected(m, def.start), `${def.id} seed ${s} has unreachable floor`).toBe(true);
        expect(validMap(m, def)).toBe(true);
        expect(m).not.toEqual(def.frame);
      }
    });
    it(`keeps the ${def.id} frame intact`, () => {
      reseed(7); const m = genMap(def);
      expect(m[0]).toBe(def.frame[0]); expect(m[1]).toBe(def.frame[1]);
      for (let y = def.doorIn.y; y < def.h; y++) expect(m[y]).toBe(def.frame[y]);
      expect(m[def.spawn.y][def.spawn.x]).toBe('P'); expect(m[def.doorIn.y][def.doorIn.x]).toBe('Y'); expect(m[def.doorOut.y][def.doorOut.x]).toBe('X');
      expect(m[def.elev.y][def.elev.x]).toBe('E'); expect(m[def.elev.y + 1][def.elev.x]).toBe('.');
    });
  }
  it('varies between seeds', () => {
    reseed(1); const a = genMap(KONBINI).join(''); reseed(2); const b = genMap(KONBINI).join('');
    expect(a).not.toBe(b);
  });
  it('rejects a hand-made one-wide lane', () => {
    const m = KONBINI.frame.map((r) => r.split(''));
    for (let x = 4; x < 10; x++) { m[4][x] = 'S'; m[6][x] = 'S'; }
    expect(hasOneWideLane(m.map((r) => r.join('')))).not.toBeNull();
  });
  it('boutique is bigger with a higher gate', () => { expect(BOUTIQUE.w * BOUTIQUE.h).toBeGreaterThan(KONBINI.w * KONBINI.h); expect(BOUTIQUE.gate).toBeGreaterThan(KONBINI.gate); });
});
