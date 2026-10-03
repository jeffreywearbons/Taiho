/**
 * Engagement layer: catch streaks, three rotating mini-goals, and one daily bounty.
 * Game code reports events; this module scores them and hands out rewards.
 */
import { G } from './state';
import { L, fmt, lang } from '../i18n';
import { toast } from './world';
import { sfx } from '../core/audio';
import { cur } from './maps';
import { pick } from '../core/rng';

export type CatchEvent = { secsLeft: number; boss: boolean; byBall: boolean; hops: number; inArena: boolean; streak: number };
export type GoalEvent = { kind: 'catch'; data: CatchEvent } | { kind: 'hop'; hopsThisChase: number } | { kind: 'smash' };

export interface GoalDef { id: string; target: number; reward: number; xp: number; applies: () => boolean; step: (e: GoalEvent) => number }
export interface Goal { def: GoalDef; progress: number }

const always = () => true;
export const POOL: GoalDef[] = [
  { id: 'catch3', target: 3, reward: 300, xp: 50, applies: always, step: (e) => (e.kind === 'catch' ? 1 : 0) },
  { id: 'fast', target: 1, reward: 400, xp: 60, applies: always, step: (e) => (e.kind === 'catch' && e.data.secsLeft >= 12 ? 1 : 0) },
  { id: 'hop3', target: 1, reward: 300, xp: 50, applies: always, step: (e) => (e.kind === 'hop' && e.hopsThisChase >= 3 ? 1 : 0) },
  { id: 'smash2', target: 2, reward: 350, xp: 60, applies: () => G.stats.strength >= 1 && (G.level >= 3 || cur.obstacleTier >= 1), step: (e) => (e.kind === 'smash' ? 1 : 0) },
  { id: 'boss', target: 1, reward: 600, xp: 120, applies: always, step: (e) => (e.kind === 'catch' && e.data.boss ? 1 : 0) },
  { id: 'ball', target: 1, reward: 600, xp: 80, applies: () => G.inv.ball > 0 || G.yen >= 1000, step: (e) => (e.kind === 'catch' && e.data.byBall ? 1 : 0) },
  { id: 'streak3', target: 1, reward: 500, xp: 80, applies: always, step: (e) => (e.kind === 'catch' && e.data.streak >= 3 ? 1 : 0) },
  { id: 'arena', target: 1, reward: 500, xp: 80, applies: () => !!cur.arena, step: (e) => (e.kind === 'catch' && e.data.inArena ? 1 : 0) },
];

export const DAILY_TARGET = 15;
export const DAILY_REWARD = 1500;
export type Daily = { day: string; progress: number; done: boolean };
export const today = (): string => new Date().toISOString().slice(0, 10);
export function freshDaily(): Daily { return { day: today(), progress: 0, done: false }; }

export const goals = { active: [] as Goal[], daily: freshDaily() };

function drawGoal(exclude: Set<string>): Goal | null {
  const cands = POOL.filter((d) => !exclude.has(d.id) && d.applies());
  if (!cands.length) return null;
  return { def: pick(cands), progress: 0 };
}
export function resetGoals(): void {
  goals.active = [];
  const used = new Set<string>();
  for (let i = 0; i < 3; i++) { const g = drawGoal(used); if (!g) break; used.add(g.def.id); goals.active.push(g); }
  if (goals.daily.day !== today()) goals.daily = freshDaily();
}
export function goalText(g: Goal): string { return fmt((L.goals as Record<string, string>)[g.def.id], { t: g.def.target }) + (g.def.target > 1 ? ` ${g.progress}/${g.def.target}` : ''); }
export function dailyText(): string { return `${L.daily}: ${fmt(L.goals.daily, { t: DAILY_TARGET })} ${Math.min(goals.daily.progress, DAILY_TARGET)}/${DAILY_TARGET}` + (goals.daily.done ? ' ✓' : ''); }

/** Report an event; returns yen + xp awarded so the caller can bank it. */
export function report(e: GoalEvent, award: (yen: number, xp: number) => void): void {
  const used = new Set(goals.active.map((g) => g.def.id));
  for (let i = 0; i < goals.active.length; i++) {
    const g = goals.active[i];
    g.progress += g.def.step(e);
    if (g.progress >= g.def.target) {
      award(g.def.reward, g.def.xp); toast(fmt(L.goal_done, { y: g.def.reward }), 2200); sfx('level');
      const next = drawGoal(used);
      if (next) { used.add(next.def.id); goals.active[i] = next; } else goals.active.splice(i, 1);
    }
  }
  if (e.kind === 'catch' && !goals.daily.done) {
    if (goals.daily.day !== today()) goals.daily = freshDaily();
    goals.daily.progress++;
    if (goals.daily.progress >= DAILY_TARGET) { goals.daily.done = true; award(DAILY_REWARD, 300); toast(fmt(L.daily_done, { y: DAILY_REWARD }), 3000); sfx('catch'); }
  }
}

/** Streak multiplier on XP and yen: 1x, 1.25x, 1.5x, 1.75x, 2x at five in a row. */
export const streakMult = (streak: number): number => Math.min(2, 1 + 0.25 * Math.max(0, streak - 1));
export const bossName = (i: number): string => L.boss_names[i % L.boss_names.length];
export const langKey = (): 'en' | 'ja' => lang;
