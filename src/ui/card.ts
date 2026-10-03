import { G, COSTUME_SPRITES, costumeTier } from '../game/state';
import { L, fmt } from '../i18n';
import { ctx, setContext, spr } from '../core/render';
import { drawAura, drawParticles, emitTrail, updParticles } from './fx';
import type { Card, ScoreRow } from '../game/economy';
import type { Particle } from '../game/state';
import { sfx } from '../core/audio';

const $ = (id: string) => document.getElementById(id)!;
let raf = 0;

/** Name of a cosmetic for the card, falling back to the earned tier name for a tier sprite. */
function lookName(sprite: string): string {
  if (sprite.startsWith('cos_')) return L.cosmetics[sprite.slice(4)]?.[0] ?? sprite;
  const i = (COSTUME_SPRITES as readonly string[]).indexOf(sprite); return i >= 0 ? L.costumes[i] : sprite;
}
const fxName = (id: string | null): string => (id ? L.cosmetics[id]?.[0] ?? id : L.none);

/** Animated preview: the hero walks in place on a little floor with their aura and trail. */
function animate(card: Card): void {
  const cv = $('card-cv') as HTMLCanvasElement; const c2 = cv.getContext('2d')!; c2.imageSmoothingEnabled = false;
  const main = ctx; let particles: Particle[] = []; let last = performance.now(); let walk = 0, emitT = 0;
  const frames = [1, 0, 2, 0];
  const loop = (now: number) => {
    const dt = Math.min(50, now - last); last = now; walk += dt; emitT += dt;
    setContext(c2);
    c2.fillStyle = '#ecece8'; c2.fillRect(0, 0, cv.width, cv.height);
    for (let x = 0; x < cv.width; x += 16) for (let y = 0; y < cv.height; y += 16) spr('tile_floor', x, y);
    const px = 24, py = 20;
    particles = updParticles(dt, particles);
    if (emitT > 70) { emitT = 0; emitTrail(card.trail, px, py, particles); }
    drawParticles(particles);
    drawAura(card.aura, px, py - 8, now);
    const dir = Math.floor(now / 1400) % 3; const d = ['down', 'side', 'up'][dir]; const flip = Math.floor(now / 2800) % 2 === 1 && d === 'side';
    spr(`${card.sprite}_${d}_${frames[Math.floor(walk / 110) % 4]}`, px, py - 8, flip);
    setContext(main);
    raf = requestAnimationFrame(loop);
  };
  cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
}

export function openCard(name: string, card: Card, row?: ScoreRow): void {
  $('card-name').textContent = name;
  $('card-look').textContent = lookName(card.sprite);
  $('card-fx').textContent = `${L.card_aura}: ${fxName(card.aura)}   ${L.card_trail}: ${fxName(card.trail)}`;
  $('card-stats').textContent = fmt(L.card_stats, { l: row ? row.level : G.level, c: card.total, s: card.streak, m: card.maps });
  $('card-build').textContent = `${L.stat[0]} +${card.stats[0]}   ${L.stat[1]} +${card.stats[1]}   ${L.stat[2]} +${card.stats[2]}`;
  $('card-run').textContent = row ? fmt(L.card_run, { c: row.catches }) : L.card_mine;
  $('b-card-close').textContent = L.close; $('card-title').textContent = L.player_card;
  $('card').hidden = false; sfx('blip'); animate(card);
}
export function closeCard(): void { cancelAnimationFrame(raf); $('card').hidden = true; }
export function tierName(): string { return L.costumes[costumeTier(G.level, G.totalCatches)]; }
