import { describe, it, expect } from 'vitest';
import { weekKey, weekEndsIn } from '../src/game/week';

describe('weekKey', () => {
  it('matches ISO week numbering', () => {
    expect(weekKey(Date.UTC(2026, 9, 3))).toBe('2026-W40');   // Sat 3 Oct 2026
    expect(weekKey(Date.UTC(2026, 9, 5))).toBe('2026-W41');   // Mon 5 Oct 2026
    expect(weekKey(Date.UTC(2026, 0, 1))).toBe('2026-W01');   // Thu 1 Jan 2026
    expect(weekKey(Date.UTC(2027, 0, 1))).toBe('2026-W53');   // Fri 1 Jan 2027 belongs to 2026's last week
    expect(weekKey(Date.UTC(2024, 11, 30))).toBe('2025-W01'); // Mon 30 Dec 2024 starts 2025-W01
  });
  it('resets Monday 00:00 UTC', () => {
    const sun = Date.UTC(2026, 9, 4, 23, 59, 0);
    expect(weekEndsIn(sun)).toBe(60_000);
    expect(weekKey(sun)).not.toBe(weekKey(sun + 60_000));
  });
});
