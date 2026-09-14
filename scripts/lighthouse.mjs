#!/usr/bin/env node
// Lighthouse（§10、§11.1）：mobile 預設設定，對 preview 的首頁與 /quote/（pages.mjs 內 lighthouse: true）跑，
// 輸出 qa/lighthouse/{page}.report.{json,html}。--strict：分數低於目標時非零結束。
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { ROOT } from './lib/files.mjs';
import { startPreview } from './lib/server.mjs';
import { pages } from './pages.mjs';

const TARGETS = { performance: 95, accessibility: 100, 'best-practices': 95, seo: 100 };
const strict = process.argv.includes('--strict');
const outDir = path.join(ROOT, 'qa/lighthouse');
mkdirSync(outDir, { recursive: true });

const targets = pages.filter((p) => p.lighthouse);
const server = await startPreview();
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH || chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
let failed = false;

try {
  for (const p of targets) {
    const result = await lighthouse(server.baseUrl + p.path, {
      port: chrome.port,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: Object.keys(TARGETS),
    });
    if (!result) throw new Error(`Lighthouse 沒有結果：${p.path}`);
    writeFileSync(path.join(outDir, `${p.name}.report.json`), result.report[0]);
    writeFileSync(path.join(outDir, `${p.name}.report.html`), result.report[1]);
    const { lhr } = result;
    const scores = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
    const cls = lhr.audits['cumulative-layout-shift']?.numericValue;
    const lcp = lhr.audits['largest-contentful-paint']?.numericValue;
    const line = Object.entries(TARGETS)
      .map(([k, target]) => {
        const ok = scores[k] >= target;
        if (!ok) failed = true;
        return `${k} ${scores[k]}${ok ? '' : `（目標 ${target}）`}`;
      })
      .join('，');
    console.log(`${failed ? '  ✗' : '  ✓'} ${p.path}：${line}；CLS ${cls?.toFixed(3)}，LCP ${lcp ? Math.round(lcp) : '?'}ms`);
  }
} finally {
  await chrome.kill();
  await server.stop();
}

console.log(`報告 → qa/lighthouse/`);
if (strict && failed) {
  console.error('✗ Lighthouse 分數未達 §10 目標');
  process.exit(1);
}
