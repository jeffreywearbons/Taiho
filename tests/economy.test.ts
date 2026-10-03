import { describe, it, expect, beforeEach } from 'vitest';
import { G, emptyInv } from '../src/game/state';
import { buy, CATALOG, maxOf } from '../src/game/economy';

describe('register stack caps', () => {
  beforeEach(() => { G.inv = emptyInv(); G.yen = 1_000_000; });
  it('stops at each item cap and reports full', () => {
    for (const c of CATALOG) {
      for (let i = 0; i < c.max; i++) expect(buy(c.key)).toBe('ok');
      expect(buy(c.key)).toBe('full'); expect(G.inv[c.key]).toBe(c.max);
    }
  });
  it('keeps the strongest tools at three', () => { for (const k of ['ball', 'net', 'stop', 'senzu', 'shield', 'charm'] as const) expect(maxOf(k)).toBe(3); });
  it('refuses when broke', () => { G.yen = 0; expect(buy('vita')).toBe('broke'); });
});
