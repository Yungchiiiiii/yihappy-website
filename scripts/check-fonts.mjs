#!/usr/bin/env node
// 驗證字型子集涵蓋 dist 內所有字元（§11.4.4）。預設先 astro build；--no-build 用現有 dist。
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ASTRO_BIN, DIST, ROOT } from './lib/files.mjs';
import { WEIGHTS, collectGlyphs, sortedChars } from './lib/glyphs.mjs';

const FONT_DIR = path.join(ROOT, 'public/fonts');
const glyphsPath = path.join(FONT_DIR, 'glyphs.json');
const noBuild = process.argv.includes('--no-build');

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`✗ ${msg}`);
};

for (const w of WEIGHTS) {
  if (!existsSync(path.join(FONT_DIR, `noto-sans-tc-${w}.woff2`))) fail(`缺少 public/fonts/noto-sans-tc-${w}.woff2，請執行 npm run fonts`);
}
for (const w of ['400', '500']) {
  if (!existsSync(path.join(FONT_DIR, `ibm-plex-mono-latin-${w}-normal.woff2`))) fail(`缺少 public/fonts/ibm-plex-mono-latin-${w}-normal.woff2，請執行 npm run fonts`);
}
if (!existsSync(glyphsPath)) fail('缺少 public/fonts/glyphs.json，請執行 npm run fonts');
if (failed) process.exit(1);

if (!noBuild) {
  console.log('▶ astro build');
  execFileSync(process.execPath, [ASTRO_BIN, 'build'], { cwd: ROOT, stdio: 'inherit' });
}

const glyphs = JSON.parse(readFileSync(glyphsPath, 'utf8'));
const { sets, files } = collectGlyphs(DIST);
console.log(`▶ 掃描 ${files.length} 個 HTML`);
for (const w of WEIGHTS) {
  const have = new Set(glyphs[w] ?? []);
  const missing = sortedChars(sets[w]).filter((ch) => !have.has(ch));
  if (missing.length > 0) {
    fail(`字型缺少 ${missing.length} 個字元（wght ${w}）：${missing.join('')}，請執行 npm run fonts`);
  } else {
    console.log(`✓ wght ${w}：子集 ${have.size} 字，dist 需要 ${sets[w].size} 字，無缺字`);
  }
}
process.exit(failed ? 1 : 0);
