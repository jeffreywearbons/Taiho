import { describe, it, expect } from 'vitest';
import { TOKYO } from '../src/game/tokyo';
import { genMap, validMap } from '../src/game/mapgen';
import { reseed } from '../src/core/rng';
import FRAMES from '../src/assets/atlas.json';

describe('Tokyo streets', () => {
  it('ten districts, kana-only Japanese names, every tile in the atlas', () => {
    expect(TOKYO.length).toBe(10);
    for (const m of TOKYO) {
      expect(m.name.ja).not.toMatch(/[一-鿿]/);
      const used = new Set(m.frame.join('').split('').concat(m.blockTiles));
      for (const c of used) expect((FRAMES as Record<string, unknown>)['tile_' + m.tiles[c]], `${m.id}: no tile for '${c}' (${m.tiles[c]})`).toBeDefined();
    }
  });
  it('generates valid streets with the alleys reachable during a chase', () => {
    for (const m of TOKYO) for (let s = 1; s <= 20; s++) { reseed(s); const g = genMap(m); expect(validMap(g, m), `${m.id} seed ${s}`).toBe(true); expect(g).not.toEqual(m.frame); }
  });
  it('Kabukicho and Roppongi are night streets', () => {
    expect(TOKYO.find((m) => m.id === 'kabukicho')!.tiles['.']).toBe('sidewalk_night');
    expect(TOKYO.find((m) => m.id === 'roppongi')!.tiles['.']).toBe('sidewalk_night');
    expect(TOKYO.find((m) => m.id === 'asakusa')!.tiles['.']).toBe('stone_plaza');
  });
});
