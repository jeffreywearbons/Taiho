import { G } from '../game/state';
import { L, fmt } from '../i18n';
import { api } from '../game/api';
import { linked, makeCode, claimCode, nativeSignIn, hasNativeSignIn, signOut } from '../game/auth';
import { sfx } from '../core/audio';
import { renderProfileLine } from './overlays';

const $ = (id: string) => document.getElementById(id)!;

export function openLink(): void {
  $('link-title').textContent = L.link_title; $('link-code-title').textContent = L.link_code_title; $('link-code-help').textContent = L.link_code_help;
  $('b-code-new').textContent = L.link_get_code; $('b-code-claim').textContent = L.link_claim; $('b-link-close').textContent = L.close; $('link-msg').textContent = ''; $('link-code').textContent = '';
  ($('code-in') as HTMLInputElement).value = '';
  $('link-native').hidden = !hasNativeSignIn();
  refreshStatus(); $('link').hidden = false; sfx('blip');
}
function refreshStatus(): void {
  if (!api.enabled) { $('link-status').textContent = L.link_offline; $('b-code-new').setAttribute('disabled', ''); $('b-code-claim').setAttribute('disabled', ''); return; }
  $('b-code-new').removeAttribute('disabled'); $('b-code-claim').removeAttribute('disabled');
  $('link-status').textContent = linked() ? fmt(L.link_linked, { c: G.totalCatches }) : L.link_unlinked;
}
export function wireLink(): void {
  $('b-link-close').onclick = () => { $('link').hidden = true; renderProfileLine(); };
  $('b-code-new').onclick = async () => { $('link-msg').textContent = '…'; const c = await makeCode(); if (c) { $('link-code').textContent = c.slice(0, 4) + '-' + c.slice(4); $('link-msg').textContent = L.link_code_made; sfx('level'); } else $('link-msg').textContent = L.link_failed; refreshStatus(); };
  $('b-code-claim').onclick = async () => { const v = ($('code-in') as HTMLInputElement).value; if (!v.trim()) return; $('link-msg').textContent = '…'; const ok = await claimCode(v); $('link-msg').textContent = ok ? L.link_claimed : L.link_bad_code; if (ok) sfx('catch'); else sfx('notyet'); refreshStatus(); };
  $('b-apple').onclick = async () => { const ok = await nativeSignIn('apple'); $('link-msg').textContent = ok ? L.link_claimed : L.link_failed; refreshStatus(); };
  $('b-google').onclick = async () => { const ok = await nativeSignIn('google'); $('link-msg').textContent = ok ? L.link_claimed : L.link_failed; refreshStatus(); };
  void signOut; // reserved for a future "sign out" control
}
