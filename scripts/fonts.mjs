#!/usr/bin/env node
// 字型管線（§11.4）：astro build → 掃描 dist 收集字元 → 下載 Noto Sans TC 變體字型 → subset 成 400／500／700 woff2
// → 寫 public/fonts/glyphs.json → 複製 IBM Plex Mono latin 400／500。
// 選項：--no-build（跳過 astro build，用現有 dist）
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';
import { ASTRO_BIN, DIST, ROOT, formatKB } from './lib/files.mjs';
import { WEIGHTS, collectGlyphs, sortedChars } from './lib/glyphs.mjs';

const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf';
const FONT_SHA256 = '864727d210d54f2537bbe23b3a839436c3992af72de9322af5270897246bd44f';
const CACHE_FILE = path.join(ROOT, '.cache/fonts/NotoSansTC.ttf');
const OUT_DIR = path.join(ROOT, 'public/fonts');
const MONO_DIR = path.join(ROOT, 'node_modules/@fontsource/ibm-plex-mono/files');
const TOTAL_BUDGET = 540 * 1024; // §12.11：三檔合計 ≤ 540KB
const FILE_BUDGET = 180 * 1024; // §10：每個 ≤ 180KB

const noBuild = process.argv.includes('--no-build');

if (!noBuild) {
  console.log('▶ astro build（用目前的字型檔）');
  execFileSync(process.execPath, [ASTRO_BIN, 'build'], { cwd: ROOT, stdio: 'inherit' });
}

async function ensureVariableFont() {
  mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  if (!existsSync(CACHE_FILE)) {
    console.log(`▶ 下載 Noto Sans TC 變體字型\n  ${FONT_URL}`);
    try {
      const res = await fetch(FONT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(CACHE_FILE, Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      console.warn(`  fetch 失敗（${err.message}），改用 curl`);
      execFileSync('curl', ['-sSL', '--fail', '-o', CACHE_FILE, FONT_URL], { stdio: 'inherit' });
    }
  } else {
    console.log(`▶ 使用快取字型 ${path.relative(ROOT, CACHE_FILE)}`);
  }
  const buf = readFileSync(CACHE_FILE);
  const sha = createHash('sha256').update(buf).digest('hex');
  if (sha === FONT_SHA256) {
    console.log(`  sha256 OK（${formatKB(buf.length)}）`);
  } else {
    console.warn(
      `⚠ 字型 sha256 與預期不符（不中止）\n  預期 ${FONT_SHA256}\n  實際 ${sha}\n  若上游字型已更新，請把新 hash 更新到 scripts/fonts.mjs 的 FONT_SHA256。`,
    );
  }
  return buf;
}

const { sets, files } = collectGlyphs(DIST);
console.log(`▶ 掃描 ${files.length} 個 HTML：${WEIGHTS.map((w) => `${w}=${sets[w].size} 字`).join('、')}`);

const variableFont = await ensureVariableFont();
mkdirSync(OUT_DIR, { recursive: true });

console.log('▶ 產生子集');
const glyphs = {};
let total = 0;
for (const weight of WEIGHTS) {
  const chars = sortedChars(sets[weight]);
  const woff2 = await subsetFont(variableFont, chars.join(''), {
    targetFormat: 'woff2',
    variationAxes: { wght: Number(weight) },
  });
  const file = path.join(OUT_DIR, `noto-sans-tc-${weight}.woff2`);
  writeFileSync(file, woff2);
  glyphs[weight] = chars;
  total += woff2.length;
  const over = woff2.length > FILE_BUDGET ? '  ⚠ 超過 180KB' : '';
  console.log(`  ${path.basename(file)}  ${String(chars.length).padStart(5)} 字  ${formatKB(woff2.length)}${over}`);
}
console.log(`  合計 ${formatKB(total)}${total > TOTAL_BUDGET ? '  ⚠ 超過 540KB' : ''}`);

const json = `{\n${WEIGHTS.map((w) => `  ${JSON.stringify(w)}: ${JSON.stringify(glyphs[w])}`).join(',\n')}\n}\n`;
writeFileSync(path.join(OUT_DIR, 'glyphs.json'), json);
console.log('  glyphs.json');

console.log('▶ 複製 IBM Plex Mono latin');
for (const weight of ['400', '500']) {
  const name = `ibm-plex-mono-latin-${weight}-normal.woff2`;
  copyFileSync(path.join(MONO_DIR, name), path.join(OUT_DIR, name));
  console.log(`  ${name}  ${formatKB(readFileSync(path.join(OUT_DIR, name)).length)}`);
}
console.log('✓ 字型完成 → public/fonts/');
