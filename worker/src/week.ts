/** ISO week key for the weekly rankings, e.g. "2026-W40". UTC so every player shares the same reset (Monday 00:00 UTC). */
export function weekKey(ts: number = Date.now()): string {
  const d = new Date(ts); d.setUTCHours(0, 0, 0, 0);
  // ISO weeks start on Monday; the week containing Thursday decides the year.
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const y = d.getUTCFullYear(); const jan4 = new Date(Date.UTC(y, 0, 4));
  const week = 1 + Math.round(((d.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${y}-W${String(week).padStart(2, '0')}`;
}
/** Milliseconds until the next Monday 00:00 UTC. */
export function weekEndsIn(ts: number = Date.now()): number {
  const d = new Date(ts); const dow = (d.getUTCDay() + 6) % 7;
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + (7 - dow));
  return next - ts;
}
