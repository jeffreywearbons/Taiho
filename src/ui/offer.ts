import { G } from '../game/state';
import { L, fmt } from '../i18n';
import { showRewarded } from '../game/ads';
import { secondChance, gainXp } from '../game/chase';
import { toast } from '../game/world';
import { sfx } from '../core/audio';
import { clearPresses } from '../core/input';

const $ = (id: string) => document.getElementById(id)!;
/** A rewarded-ad offer. Declining costs nothing; the game never blocks on it. */
export function openOffer(): void {
  const o = G.offer; if (!o) return;
  G.scene = 'offer';
  $('offer-title').textContent = o.kind === 'second_chance' ? L.offer_sc_title : L.offer_boss_title;
  $('offer-body').textContent = o.kind === 'second_chance' ? L.offer_sc_body : fmt(L.offer_boss_body, { y: o.yen });
  $('b-offer-yes').textContent = L.offer_watch; $('b-offer-no').textContent = L.offer_no;
  $('offer').hidden = false; sfx('blip');
}
function close(): void { $('offer').hidden = true; G.offer = null; G.scene = 'play'; clearPresses(); }
export function wireOffer(): void {
  $('b-offer-no').onclick = () => close();
  $('b-offer-yes').onclick = async () => {
    const o = G.offer; if (!o) return close();
    ($('b-offer-yes') as HTMLButtonElement).disabled = true;
    const ok = await showRewarded(o.kind);
    ($('b-offer-yes') as HTMLButtonElement).disabled = false;
    if (!ok) { toast(L.offer_failed, 1500); return close(); }
    if (o.kind === 'second_chance') { close(); secondChance(o.perv); toast(L.offer_sc_go, 1500); sfx('chase'); }
    else { G.yen += o.yen; gainXp(o.xp); toast(fmt(L.offer_doubled, { y: o.yen }), 2000); sfx('catch'); close(); }
  };
}
