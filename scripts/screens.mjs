#!/usr/bin/env node
// 截圖（§11.1 test:screens）：每頁 × 375／390／768／1280／1440 全頁截圖到 qa/screenshots/{page}-{width}.png；
// 375 另外截一張選單開啟狀態。收集 console error／warning、pageerror、失敗請求與水平溢出，有問題就非零結束。
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/files.mjs';
import { collectIssues, launch, settle } from './lib/browser.mjs';
import { startPreview } from './lib/server.mjs';
import { pages, widths } from './pages.mjs';

const outDir = path.join(ROOT, 'qa/screenshots');
mkdirSync(outDir, { recursive: true });

const server = await startPreview();
const browser = await launch();
const problems = [];
let shots = 0;

try {
  for (const p of pages) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, locale: 'zh-TW' });
      const page = await context.newPage();
      const issues = collectIssues(page);
      const res = await page.goto(server.baseUrl + p.path, { waitUntil: 'load' });
      if (!res || (!res.ok() && res.status() !== 404)) problems.push(`${p.path} @${width}: HTTP ${res?.status()}`);
      await settle(page);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) problems.push(`${p.path} @${width}: 水平溢出 ${overflow}px`);

      await page.screenshot({ path: path.join(outDir, `${p.name}-${width}.png`), fullPage: true });
      shots++;

      if (width === 375) {
        const toggle = page.locator('[data-menu-toggle]');
        if (await toggle.isVisible()) {
          await toggle.click();
          await page.waitForTimeout(400);
          await page.screenshot({ path: path.join(outDir, `${p.name}-${width}-menu.png`), fullPage: false });
          shots++;
          await page.keyboard.press('Escape');
        }
      }

      for (const issue of issues) problems.push(`${p.path} @${width}: ${issue}`);
      console.log(`  ✓ ${p.name}-${width}.png`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server.stop();
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} 個問題：`);
  for (const x of problems) console.error(`  ${x}`);
  process.exit(1);
}
console.log(`✓ ${shots} 張截圖 → qa/screenshots/，無 console error／warning、無水平溢出`);
