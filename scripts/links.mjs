#!/usr/bin/env node
// 檢查 dist 內所有站內連結／資產／錨點都存在（§11.1 test:links）
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { DIST, walk } from './lib/files.mjs';
import { plannedPages } from './pages.mjs';

const SITE = 'https://yihappy.com.tw';
if (!existsSync(DIST)) {
  console.error('找不到 dist/，請先執行 npm run build');
  process.exit(1);
}

const files = walk(DIST, '.html');
const errors = new Set();
const warnings = new Set();
const idCache = new Map();

const idsOf = (file) => {
  if (!idCache.has(file)) {
    const root = parse(readFileSync(file, 'utf8'));
    idCache.set(file, new Set(root.querySelectorAll('[id]').map((el) => el.getAttribute('id'))));
  }
  return idCache.get(file);
};

/** URL 路徑 → dist 檔案 */
const toDistFile = (urlPath) => {
  const p = decodeURIComponent(urlPath);
  if (p.endsWith('/')) return { file: path.join(DIST, p, 'index.html'), page: true, missingSlash: false };
  const ext = path.extname(p);
  if (ext) return { file: path.join(DIST, p), page: ext === '.html', missingSlash: false };
  return { file: path.join(DIST, p, 'index.html'), page: true, missingSlash: true };
};

let checked = 0;
for (const file of files) {
  const rel = '/' + path.relative(DIST, file).split(path.sep).join('/');
  const pageUrl = new URL(rel.replace(/index\.html$/, ''), SITE);
  const root = parse(readFileSync(file, 'utf8'));
  const refs = [];
  for (const el of root.querySelectorAll('a[href]')) refs.push({ tag: 'a', value: el.getAttribute('href') });
  for (const el of root.querySelectorAll('img[src]')) refs.push({ tag: 'img', value: el.getAttribute('src') });
  for (const el of root.querySelectorAll('img[srcset], source[srcset]')) {
    for (const part of el.getAttribute('srcset').split(',')) refs.push({ tag: 'srcset', value: part.trim().split(/\s+/)[0] });
  }
  for (const el of root.querySelectorAll('link[href]')) refs.push({ tag: `link[rel=${el.getAttribute('rel')}]`, value: el.getAttribute('href') });
  for (const el of root.querySelectorAll('script[src]')) refs.push({ tag: 'script', value: el.getAttribute('src') });
  for (const el of root.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')) refs.push({ tag: 'meta', value: el.getAttribute('content') });

  for (const { tag, value } of refs) {
    if (!value) continue;
    if (/^(mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    if (value === '#') {
      errors.add(`${rel}: <${tag}> href="#"`);
      continue;
    }
    let url;
    try {
      url = new URL(value, pageUrl);
    } catch {
      errors.add(`${rel}: <${tag}> 無法解析 ${value}`);
      continue;
    }
    if (url.origin !== SITE) continue; // 外部連結不檢查
    checked++;
    const { file: target, page, missingSlash } = toDistFile(url.pathname);
    if (missingSlash) warnings.add(`${rel}: <${tag}> ${value} 沒有以 / 結尾`);
    if (!existsSync(target)) {
      if (plannedPages.includes(url.pathname)) {
        warnings.add(`${rel}: <${tag}> ${value} → 尚未建立的頁面（scripts/pages.mjs plannedPages）`);
      } else {
        errors.add(`${rel}: <${tag}> ${value} → 找不到 dist/${path.relative(DIST, target)}`);
      }
      continue;
    }
    if (url.hash && page) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && !idsOf(target).has(id)) errors.add(`${rel}: <${tag}> ${value} → 目標頁沒有 id="${id}"`);
    }
  }
}

console.log(`▶ ${files.length} 個 HTML，${checked} 個站內參照`);
for (const w of warnings) console.warn(`  ⚠ ${w}`);
for (const e of errors) console.error(`  ✗ ${e}`);
if (errors.size > 0) {
  console.error(`✗ ${errors.size} 個壞連結／缺資產／缺錨點`);
  process.exit(1);
}
console.log(`✓ 連結檢查通過${warnings.size ? `（${warnings.size} 個警告）` : ''}`);
