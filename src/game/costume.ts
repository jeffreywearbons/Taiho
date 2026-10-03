import { G, COSTUME_SPRITES, costumeTier } from './state';
import { L, fmt } from '../i18n';
import { toast } from './world';
import { saveProfile } from './profile';
import { cosmeticKind, type CosmeticKind } from './economy';

/** The sprite the hero wears: a purchased costume if one is on, otherwise the earned tier. */
export const heroSprite = (): string => (G.wearing ? 'cos_' + G.wearing : COSTUME_SPRITES[G.costume]);
export const bonsaiSprite = (): string => (G.wearing === 'trainer' ? 'bonsai_pika' : 'bonsai');

/** Apply the costume the player has earned; announce it when it changes. */
export function checkCostume(): void {
  const tier = costumeTier(G.level, G.totalCatches);
  if (tier !== G.costume) { G.costume = tier; toast(fmt(L.costume_toast, { c: L.costumes[tier] }), 2500); }
  G.player.sprite = heroSprite();
}
export function wear(id: string | null, kind: CosmeticKind = id ? cosmeticKind(id) : 'costume'): void {
  if (id && !G.wardrobe.includes(id)) return;
  if (kind === 'aura') G.aura = id; else if (kind === 'trail') G.trail = id; else { G.wearing = id; G.player.sprite = heroSprite(); }
  saveProfile();
}
export const wornOf = (kind: CosmeticKind): string | null => (kind === 'aura' ? G.aura : kind === 'trail' ? G.trail : G.wearing);
