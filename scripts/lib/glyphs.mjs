// 掃描 dist/**/*.html，依 §11.4 規則收集三組字元（400／500／700）
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { DIST, walk } from './files.mjs';

const PUNCT = '，。、；：？！「」『』（）《》〈〉—…・‧·×–－％';
const EXTRA = ['NT$', '✓', '→', '©', '｜', '　'];

/** 每組固定加入：ASCII 32–126、全形標點、NT$、✓、→、©、｜、全形空白 */
export const FIXED_CHARS = (() => {
  const set = new Set();
  for (let code = 32; code <= 126; code++) set.add(String.fromCharCode(code));
  for (const ch of PUNCT) set.add(ch);
  for (const item of EXTRA) for (const ch of item) set.add(ch);
  return set;
})();

export const WEIGHTS = ['400', '500', '700'];

export const SELECTORS = {
  700: 'h1, h2, h3, h4, .t-display, [data-font="700"]',
  500: 'nav, button, .btn, label, summary, strong, b, dt, th, .tag, .eyebrow, [data-font="500"]',
};

const CONTROL = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;

function addChars(set, text) {
  for (const ch of text ?? '') {
    if (ch === ' ' || ch === ' ' || CONTROL.test(ch)) continue;
    set.add(ch);
  }
}

/** @returns {{ sets: Record<string, Set<string>>, files: string[] }} */
export function collectGlyphs(distDir = DIST) {
  if (!existsSync(distDir)) throw new Error('找不到 dist/，請先執行 astro build');
  const files = walk(distDir, '.html');
  const sets = Object.fromEntries(WEIGHTS.map((w) => [w, new Set(FIXED_CHARS)]));
  for (const file of files) {
    const root = parse(readFileSync(file, 'utf8'));
    // 不會顯示在畫面上的內容
    for (const node of root.querySelectorAll('head, script, style, template')) node.remove();
    addChars(sets['400'], root.text);
    for (const el of root.querySelectorAll('[placeholder]')) addChars(sets['400'], el.getAttribute('placeholder'));
    for (const el of root.querySelectorAll('input[value]')) {
      const type = (el.getAttribute('type') ?? 'text').toLowerCase();
      if (!['hidden', 'radio', 'checkbox'].includes(type)) addChars(sets['400'], el.getAttribute('value'));
    }
    for (const w of ['500', '700']) {
      for (const el of root.querySelectorAll(SELECTORS[w])) addChars(sets[w], el.text);
    }
  }
  return { sets, files };
}

export const sortedChars = (set) => [...set].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
