// Playwright 共用：啟動 Chromium、收集 console error／warning、等待字型載入
import { chromium } from 'playwright';

export const launch = () => chromium.launch({ headless: true });

/** 回傳一個會持續累積問題的陣列 */
export function collectIssues(page) {
  const issues = [];
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') issues.push(`console.${type}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => issues.push(`pageerror: ${err.message}`));
  // 只把站內資源的失敗當成問題；外部資源（例如 /contact/ 的 Google 地圖 iframe）在沒有網路的環境會失敗，只印警告
  page.on('requestfailed', (req) => {
    const host = new URL(req.url()).hostname;
    const local = host === '127.0.0.1' || host === 'localhost';
    const line = `requestfailed: ${req.url()} ${req.failure()?.errorText ?? ''}`;
    if (local) issues.push(line);
    else console.warn(`  ⚠ 外部資源（不計入）${line}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().endsWith('/404.html')) issues.push(`HTTP ${res.status()}: ${res.url()}`);
  });
  return issues;
}

export async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}
