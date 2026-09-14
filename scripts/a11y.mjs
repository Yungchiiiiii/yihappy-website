#!/usr/bin/env node
// axe（§9、§11.1 test:a11y）：每頁在 1280 與 390 寬度各跑一次，390 再跑一次選單開啟狀態；serious／critical 必須為 0。
import AxeBuilder from '@axe-core/playwright';
import { collectIssues, launch, settle } from './lib/browser.mjs';
import { startPreview } from './lib/server.mjs';
import { pages } from './pages.mjs';

const server = await startPreview();
const browser = await launch();
let blocking = 0;
let minor = 0;

const report = (results, label) => {
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const rest = results.violations.filter((v) => !bad.includes(v));
  blocking += bad.length;
  minor += rest.length;
  console.log(`${bad.length === 0 ? '  ✓' : '  ✗'} ${label}：${results.violations.length} 個違規（serious/critical ${bad.length}）`);
  for (const v of [...bad, ...rest]) {
    console.log(`      [${v.impact}] ${v.id} — ${v.help}`);
    for (const node of v.nodes.slice(0, 3)) console.log(`        ${node.target.join(' ')}`);
  }
};

try {
  for (const p of pages) {
    for (const width of [1280, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'zh-TW' });
      const page = await context.newPage();
      const issues = collectIssues(page);
      await page.goto(server.baseUrl + p.path, { waitUntil: 'load' });
      await settle(page);
      report(await new AxeBuilder({ page }).analyze(), `${p.path} @${width}`);
      if (width === 390) {
        const toggle = page.locator('[data-menu-toggle]');
        if (await toggle.isVisible()) {
          await toggle.click();
          await page.waitForTimeout(300);
          report(await new AxeBuilder({ page }).analyze(), `${p.path} @${width}（選單開啟）`);
        }
      }
      for (const issue of issues) console.warn(`      ⚠ ${issue}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server.stop();
}

if (blocking > 0) {
  console.error(`✗ axe：${blocking} 個 serious／critical 違規`);
  process.exit(1);
}
console.log(`✓ axe：serious／critical 為 0${minor ? `（另有 ${minor} 個 moderate／minor，請視情況處理）` : ''}`);
