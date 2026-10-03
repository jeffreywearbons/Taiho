import { describe, it, expect } from 'vitest';
import ja from '../src/i18n/ja';
import en from '../src/i18n/en';

const KANJI = /[一-龯㐀-䶿]/;
function walk(v: unknown, path: string, out: string[]): void {
  if (typeof v === 'string') { if (KANJI.test(v)) out.push(path); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k, out);
}
describe('japanese strings', () => {
  it('contain no kanji', () => { const bad: string[] = []; walk(ja, '', bad); expect(bad).toEqual([]); });
  it('cover every english key', () => { expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort()); });
  it('keep tutorial lines to two short rows', () => {
    for (const k of ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 'tf'] as const) for (const [, txt] of ja[k]) {
      const lines = txt.split('\n'); expect(lines.length).toBeLessThanOrEqual(2); for (const ln of lines) expect(ln.length).toBeLessThanOrEqual(26);
    }
  });
});
