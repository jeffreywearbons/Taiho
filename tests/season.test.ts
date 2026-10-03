import { describe, it, expect, beforeEach } from 'vitest';
import { season, SEASON, tier, claimTier, addSeasonPoints, ensureSeason, freeReward, premReward } from '../src/game/season';
import { G, emptyInv } from '../src/game/state';

describe('season pass', () => {
  beforeEach(() => { G.inv = emptyInv(); G.yen = 0; G.wardrobe = []; season.state = { id: SEASON.id, points: 0, free: [], prem: [] }; try { localStorage.setItem('taiho_sets', '[]'); } catch { /* ignore */ } });
  it('turns catches into tiers', () => { addSeasonPoints(SEASON.pointsPerTier * 2 + 1); expect(tier()).toBe(2); });
  it('claims free rewards once and refuses premium without the pass', () => {
    addSeasonPoints(SEASON.pointsPerTier * 5);
    expect(claimTier(1, 'free')).toEqual({ yen: 300 }); expect(claimTier(1, 'free')).toBeNull();
    expect(claimTier(5, 'free')).toEqual({ item: 'vita', n: 1 }); expect(G.inv.vita).toBe(1);
    expect(claimTier(5, 'prem')).toBeNull(); expect(claimTier(6, 'free')).toBeNull();
  });
  it('premium tiers hand out cosmetics with the exclusive at the top', () => { expect(premReward(5).cosmetic).toBe('trail_neon'); expect(premReward(30).cosmetic).toBe('aura_s1'); expect(freeReward(30).item).toBe('shield'); });
  it('resets when the season changes', () => { season.state = { id: 'old', points: 99, free: [1], prem: [] }; ensureSeason(); expect(season.state.id).toBe(SEASON.id); expect(season.state.points).toBe(0); });
});
