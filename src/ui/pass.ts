import { G } from '../game/state';
import { L, fmt } from '../i18n';
import { SEASON, season, tier, hasPremium, claimTier, freeReward, premReward, daysLeft, ensureSeason, type TierReward } from '../game/season';
import { buySet } from '../game/purchases';
import { setById } from '../game/sets';
import { sfx } from '../core/audio';
import { applyProfile, loadProfile } from '../game/profile';
import { lang } from '../i18n';
import { renderProfileLine } from './overlays';

const $ = (id: string) => document.getElementById(id)!;
function rewardText(r: TierReward): string { if (r.cosmetic) return L.cosmetics[r.cosmetic][0]; if (r.item) return `${L.items[r.item][0]} ×${r.n ?? 1}`; return '¥' + (r.yen ?? 0); }

export function openPass(): void {
  if (G.scene === 'title') applyProfile(loadProfile());
  ensureSeason();
  const t = tier(), pts = season.state.points, into = pts - t * SEASON.pointsPerTier;
  $('pass-title').textContent = fmt(L.pass_title, { n: 1 }); $('pass-sub').textContent = fmt(L.pass_sub, { d: daysLeft(), t, max: SEASON.tiers, p: into, q: SEASON.pointsPerTier });
  $('b-pass-close').textContent = L.close; $('pass-msg').textContent = '';
  const buy = $('b-pass-buy') as HTMLButtonElement; const set = setById('pass_' + SEASON.id)!;
  buy.hidden = hasPremium(); buy.textContent = `${L.pass_unlock} ${lang === 'ja' ? '¥' + set.yen : '$' + set.usd.toFixed(2)}`;
  buy.onclick = async () => { $('pass-msg').textContent = '…'; const r = await buySet(set.id); $('pass-msg').textContent = r === 'done' ? L.bought : r === 'opened' ? L.sets_opening : L.sets_unavailable; if (r === 'done') openPass(); };
  const list = $('pass-list'); list.innerHTML = '';
  for (let i = 1; i <= SEASON.tiers; i++) {
    const row = document.createElement('div'); row.className = 'tier' + (i <= t ? ' reached' : '');
    const n = document.createElement('b'); n.textContent = String(i);
    const mk = (track: 'free' | 'prem') => {
      const cell = document.createElement('div'); cell.className = 'cell ' + track;
      const r = track === 'free' ? freeReward(i) : premReward(i);
      const txt = document.createElement('span'); txt.textContent = rewardText(r); cell.appendChild(txt);
      const claimed = (track === 'free' ? season.state.free : season.state.prem).includes(i);
      const b = document.createElement('button');
      if (claimed) { b.textContent = '✓'; b.disabled = true; }
      else if (i > t) { b.textContent = L.pass_locked; b.disabled = true; }
      else if (track === 'prem' && !hasPremium()) { b.textContent = L.pass_premium; b.disabled = true; }
      else { b.textContent = L.pass_claim; b.onclick = () => { const got = claimTier(i, track); if (got) { sfx(got.cosmetic ? 'catch' : 'buy'); openPass(); $('pass-msg').textContent = fmt(L.pass_got, { r: rewardText(got) }); } }; }
      cell.appendChild(b); return cell;
    };
    row.append(n, mk('free'), mk('prem')); list.appendChild(row);
  }
  $('pass').hidden = false; sfx('blip');
}
export function wirePass(): void { $('b-pass-close').onclick = () => { $('pass').hidden = true; renderProfileLine(); }; }
