import { describe, it, expect, beforeEach } from 'vitest';
import { login, checkIn, slot, claimable, claim, dayKey } from '../src/game/login';
import { G, emptyInv } from '../src/game/state';

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return dayKey(d); };
describe('daily check-in', () => {
  beforeEach(() => { G.inv = emptyInv(); G.yen = 0; G.wardrobe = []; login.state = { last: '', streak: 0, claimed: '' }; });
  it('starts a streak and pays day 1', () => { expect(checkIn()).toBe(true); expect(login.state.streak).toBe(1); expect(slot()).toBe(0); expect(claim()).toEqual({ yen: 500 }); expect(G.yen).toBe(500); expect(claimable()).toBe(false); });
  it('continues when yesterday was checked in', () => { login.state = { last: daysAgo(1), streak: 3, claimed: daysAgo(1) }; checkIn(); expect(login.state.streak).toBe(4); expect(slot()).toBe(3); });
  it('resets after a missed day', () => { login.state = { last: daysAgo(2), streak: 6, claimed: daysAgo(2) }; checkIn(); expect(login.state.streak).toBe(1); });
  it('day 7 grants a chosen cosmetic and the cycle restarts', () => {
    login.state = { last: daysAgo(1), streak: 6, claimed: daysAgo(1) }; checkIn(); expect(slot()).toBe(6);
    expect(claim()).toBeNull(); expect(claim('straw')).toEqual({ pick: true }); expect(G.wardrobe).toContain('straw');
    login.state.last = daysAgo(1); login.state.claimed = daysAgo(1); checkIn(); expect(login.state.streak).toBe(8); expect(slot()).toBe(0);
  });
  it('does not pay twice in one day', () => { checkIn(); claim(); expect(claim()).toBeNull(); expect(checkIn()).toBe(false); });
});
