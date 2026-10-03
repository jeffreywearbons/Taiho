import { describe, it, expect, beforeEach } from 'vitest';
import { adapt, blankAdapt, chooseStrategy, recordCatch, recordOutcome, heatAt, approach, leansOn, STRATEGIES } from '../src/game/adapt';
import { dims } from '../src/game/maps';
import { reseed, random } from '../src/core/rng';

describe('adaptive pervs', () => {
  beforeEach(() => { adapt.state = blankAdapt(); reseed(42); });
  it('with no history every style gets a turn', () => {
    const seen = new Set<string>(); for (let i = 0; i < 300; i++) seen.add(chooseStrategy(random, true));
    expect(seen.size).toBe(STRATEGIES.length);
    for (let i = 0; i < 100; i++) expect(chooseStrategy(random, false)).not.toBe('hall');
  });
  it('leans toward the style that keeps escaping', () => {
    for (let i = 0; i < 40; i++) for (const s of STRATEGIES) recordOutcome(s, s !== 'zigzag');
    let z = 0; for (let i = 0; i < 200; i++) if (chooseStrategy(random, true) === 'zigzag') z++;
    expect(z).toBeGreaterThan(150);
  });
  it('forgets: decayed counts stay bounded and a habit change shows within ~25 chases', () => {
    for (let i = 0; i < 500; i++) recordOutcome('far', false);   // 500 escapes
    expect(adapt.state.bandit.far[0]).toBeLessThan(30);
    for (let i = 0; i < 30; i++) recordOutcome('far', true);     // then the player starts catching
    expect(adapt.state.bandit.far[1]).toBeGreaterThan(adapt.state.bandit.far[0]);
  });
  it('builds a catch heatmap and an approach side', () => {
    const hero = { tx: 2, ty: 2 }, perv = { tx: 4, ty: 2 };          // hero closes from the left, catches top-left
    for (let i = 0; i < 5; i++) recordCatch(hero, perv, ['peel'], false);
    expect(heatAt(3, 3)).toBe(1); expect(heatAt(dims.w - 1, dims.h - 1)).toBe(0);
    expect(approach().ax).toBeGreaterThan(0.9); expect(Math.abs(approach().ay)).toBeLessThan(0.01);
    expect(leansOn('peel')).toBeGreaterThan(leansOn('decoy'));
    recordCatch(hero, perv, [], true); expect(leansOn('ball')).toBe(1);
  });
});
