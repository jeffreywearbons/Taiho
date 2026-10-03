import { G, COSTUME_SPRITES, costumeTier } from './state';
import { L, fmt } from '../i18n';
import { toast } from './world';

/** Apply the costume the player has earned; announce it when it changes. */
export function checkCostume(): void {
  const tier = costumeTier(G.level, G.totalCatches);
  if (tier === G.costume) return;
  G.costume = tier; G.player.sprite = COSTUME_SPRITES[tier];
  toast(fmt(L.costume_toast, { c: L.costumes[tier] }), 2500);
}
