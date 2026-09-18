#!/usr/bin/env node
// 產生 OG 圖（§8）：對 /og-template/ 以 1200×630 截圖 → public/og.png
import path from 'node:path';
import { ROOT } from './lib/files.mjs';
import { collectIssues, launch, settle } from './lib/browser.mjs';
import { startPreview } from './lib/server.mjs';

const server = await startPreview();
const browser = await launch();
try {
  const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const issues = collectIssues(page);
  await page.goto(`${server.baseUrl}/og-template/`, { waitUntil: 'load' });
  await settle(page);
  const out = path.join(ROOT, 'public/og.png');
  await page.screenshot({ path: out, type: 'png', fullPage: false });
  for (const issue of issues) console.warn(`  ⚠ ${issue}`);
  console.log(`✓ ${path.relative(ROOT, out)}（1200×630）`);
} finally {
  await browser.close();
  await server.stop();
}
