// Fails when the Japanese string file contains any kanji outside the whitelist.
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/i18n/ja.ts', import.meta.url), 'utf8');
const ALLOWED = new Set([]); // grade-1 kanji could go here if we ever decide to allow them
const KANJI = /[一-龯㐀-䶿]/g;
const bad = [...new Set((src.match(KANJI) ?? []).filter((k) => !ALLOWED.has(k)))];
if (bad.length) { console.error('ja.ts contains kanji: ' + bad.join(' ')); process.exit(1); }
console.log('ja.ts is kana only');
