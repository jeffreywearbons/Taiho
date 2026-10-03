import { describe, it, expect } from 'vitest';
import { SETS } from '../src/game/sets';
import { COSMETICS } from '../src/game/economy';

describe('real-money sets', () => {
  it('only reference cosmetics that exist and have ascending-sensible prices', () => {
    const ids = new Set(COSMETICS.map((c) => c.id));
    for (const s of SETS) { for (const c of s.cosmetics) expect(ids.has(c), `${s.id} references ${c}`).toBe(true); expect(s.yen).toBeGreaterThan(0); expect(s.usd).toBeGreaterThan(0); }
    const every = SETS.find((s) => s.id === 'everything')!;
    for (const s of SETS) if (s !== every) expect(s.yen).toBeLessThan(every.yen);
  });
  it('covers every cosmetic through at least one set', () => {
    const covered = new Set(SETS.flatMap((s) => s.cosmetics));
    for (const c of COSMETICS) if (c.price > 0) expect(covered.has(c.id), c.id).toBe(true);
  });
});
