import en, { type Strings } from './en';
import ja from './ja';

export type Lang = 'en' | 'ja';
export const STRINGS: Record<Lang, Strings> = { en, ja };
export let L: Strings = en;
export let lang: Lang = 'en';

export function setLang(l: Lang): void {
  lang = l; L = STRINGS[l];
  document.documentElement.lang = l;
  try { localStorage.setItem('taiho_lang', l); } catch { /* storage may be blocked */ }
}
export function detectLang(): Lang {
  try { const s = localStorage.getItem('taiho_lang'); if (s === 'en' || s === 'ja') return s; } catch { /* ignore */ }
  return (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
}
export const fmt = (s: string, vars: Record<string, string | number>): string =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
