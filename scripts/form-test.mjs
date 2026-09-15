#!/usr/bin/env node
// 詢價表單行為測試（§12.4、test:form）：Playwright 對 preview 的 /quote/ 操作。
// 驗證：空白送出（錯誤 + focus 姓名）、只填電話／只填 Email 可送出、Email 格式、送出後預覽與 mailto 內容、
// 複製內容、重新編輯保留內容、規格（有填才列）、mailto 過長提示、快速試算同步與「帶入詢價」、手機預設收合、無 JS 退回。
// mailto 導向：quote-form.ts 在導向前發出可取消的 quote:submit 事件，這裡 preventDefault 並記下 detail，不會真的離開頁面。
import { collectIssues, launch, settle } from './lib/browser.mjs';
import { startPreview } from './lib/server.mjs';

const MAILTO = 'mailto:yihappy.dp@gmail.com?';
const failures = [];
let passed = 0;
const check = (ok, label, detail = '') => {
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failures.push(label);
    console.log(`  ✗ ${label}${detail ? `（${detail}）` : ''}`);
  }
};

const server = await startPreview();
const browser = await launch();

/** 攔下 mailto 導向並記錄送出內容（在頁面載入前注入） */
const intercept = () => {
  window.__quoteSubmits = [];
  document.addEventListener('quote:submit', (event) => {
    event.preventDefault();
    window.__quoteSubmits.push(event.detail);
  });
};

const open = async (width, options = {}) => {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    locale: 'zh-TW',
    permissions: ['clipboard-read', 'clipboard-write'],
    ...options,
  });
  await context.addInitScript(intercept);
  const page = await context.newPage();
  const issues = collectIssues(page);
  await page.goto(`${server.baseUrl}/quote/`, { waitUntil: 'load' });
  await settle(page);
  return { context, page, issues };
};

const lastSubmit = (page) => page.evaluate(() => window.__quoteSubmits.at(-1) ?? null);
const submitCount = (page) => page.evaluate(() => window.__quoteSubmits.length);
const activeId = (page) => page.evaluate(() => document.activeElement?.id ?? '');
const decodeMailto = (href) => {
  const params = new URLSearchParams(href.slice(href.indexOf('?') + 1));
  return { subject: params.get('subject') ?? '', body: params.get('body') ?? '' };
};
const submit = (page) => page.click('#quote-form button[type="submit"]');
/** chip 的 input 是視覺隱藏的，跟使用者一樣點 label */
const choose = (page, id) => page.click(`label[for="${id}"]`);
const edit = async (page) => {
  await page.click('[data-qf-edit]');
  await page.waitForSelector('#quote-form:not([hidden])');
};

try {
  /* ---------- 桌機 ---------- */
  const { context, page, issues } = await open(1280);

  console.log('▶ 空白送出');
  await submit(page);
  check(await page.locator('[data-qf-alert]').isVisible(), '顯示錯誤摘要（role=alert）');
  const listed = await page.locator('[data-qf-alert-list] li').count();
  check(listed === 3, '摘要列出姓名／聯絡方式／需求描述三個錯誤', `實際 ${listed}`);
  check((await activeId(page)) === 'f-name', 'focus 在姓名');
  check((await page.getAttribute('#f-name', 'aria-invalid')) === 'true', '姓名 aria-invalid="true"');
  check(((await page.getAttribute('#f-name', 'aria-describedby')) ?? '').includes('f-name-error'), '姓名 aria-describedby 指向錯誤訊息');
  check(await page.locator('#f-name-error').isVisible(), '姓名錯誤訊息可見');
  check(await page.locator('#f-contact-error').isVisible(), '電話或 Email 錯誤訊息可見');
  check((await page.getAttribute('#f-email', 'aria-describedby')) === 'f-contact-hint f-contact-error', 'Email aria-describedby 保留說明再加錯誤');
  check(await page.locator('#f-brief-error').isVisible(), '需求描述錯誤訊息可見');
  check((await submitCount(page)) === 0, '沒有送出');

  console.log('▶ 只填電話');
  await choose(page, 'f-category-0');
  await page.fill('#f-name', '王小明');
  await page.fill('#f-phone', '0912-345-678');
  await page.fill('#f-brief', '國中數學講義，B5，約 120 頁，先印 30 本。');
  check(await page.locator('[data-qf-alert]').isHidden(), '補上欄位後錯誤摘要收起');
  await submit(page);
  await page.waitForSelector('[data-qf-done]:not([hidden])');
  check(await page.locator('#quote-form').isHidden(), '送出後表單隱藏');
  check(await page.locator('[data-qf-done]').isVisible(), '顯示「已整理好內容」');
  check(await page.evaluate(() => document.activeElement?.hasAttribute('data-qf-banner')), 'focus 移到成功條');
  let sub = await lastSubmit(page);
  check(sub !== null && sub.href.startsWith(MAILTO), 'mailto 指向 yihappy.dp@gmail.com');
  let { subject, body } = decodeMailto(sub.href);
  check(subject === '【倚樂詢價】教科書・教材｜王小明', 'subject 解碼正確', subject);
  check(body.startsWith('倚樂詢價｜教科書・教材\n姓名：王小明\n'), '內容開頭：類別與姓名', body.slice(0, 40));
  check(body.includes('\n電話：0912-345-678\nEmail：—\n'), '電話有填、Email 顯示 —');
  check(body.includes('\n需求描述：\n國中數學講義，B5，約 120 頁，先印 30 本。\n'), '內容包含需求描述');
  check(!body.includes('── 規格'), '沒填規格就沒有規格區');
  check(body.endsWith('\n（此內容由 yihappy.com.tw 詢價表單產生）'), '內容結尾');
  check(sub.body === body && sub.subject === subject, '事件 detail 與 mailto 一致');
  check((await page.getAttribute('[data-qf-mail]', 'href')) === sub.href, '「用 Email 寄出」連結同 mailto');
  check((await page.locator('[data-qf-preview]').textContent()) === body, '<pre> 預覽同內容');
  check(await page.locator('[data-qf-warn]').isHidden(), '一般長度不提示截斷');

  console.log('▶ 複製內容');
  const copyBtn = page.locator('[data-qf-copy]');
  check(await copyBtn.isVisible(), '「複製內容」按鈕存在');
  check((await copyBtn.innerText()).trim() === '複製內容', '按鈕文字「複製內容」');
  await copyBtn.click();
  await page.waitForFunction(() => document.querySelector('[data-qf-copy-label]')?.textContent === '已複製');
  check(true, '複製後顯示「已複製」');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  check(clip === body, '剪貼簿內容正確');

  console.log('▶ 重新編輯、只填 Email');
  await edit(page);
  check(await page.locator('[data-qf-done]').isHidden(), '回到表單');
  check((await page.inputValue('#f-name')) === '王小明', '重新編輯保留姓名');
  check((await page.inputValue('#f-brief')).startsWith('國中數學講義'), '重新編輯保留需求描述');
  check(await page.isChecked('#f-category-0'), '重新編輯保留類別');
  await page.fill('#f-phone', '');
  await page.fill('#f-email', 'not-an-email');
  await submit(page);
  check(await page.locator('#f-email-error').isVisible(), 'Email 格式錯誤顯示');
  check((await activeId(page)) === 'f-email', 'focus 在 Email');
  check((await submitCount(page)) === 1, '格式錯誤沒有送出');
  await page.fill('#f-email', 'test@example.com');
  await submit(page);
  await page.waitForSelector('[data-qf-done]:not([hidden])');
  sub = await lastSubmit(page);
  ({ subject, body } = decodeMailto(sub.href));
  check(body.includes('\n電話：—\nEmail：test@example.com\n'), '只填 Email 可送出');

  console.log('▶ 快速試算');
  await edit(page);
  await choose(page, 'est-color-1');
  await page.fill('#est-pages', '200');
  await page.fill('#est-qty', '50');
  check((await page.inputValue('#est-pages-range')) === '200', 'number → range 同步');
  const price = (await page.locator('[data-est-result]').textContent()).trim();
  check(price === 'NT$ 3,750 – 4,750', '黑白 200 頁 × 50 本：NT$ 3,750 – 4,750', price);
  await page.evaluate(() => {
    const range = document.querySelector('#est-qty-range');
    range.value = '100';
    range.dispatchEvent(new Event('input', { bubbles: true }));
  });
  check((await page.inputValue('#est-qty')) === '100', 'range → number 同步');
  check((await page.locator('[data-est-result]').textContent()).trim() === 'NT$ 7,500 – 9,500', '本數 100：NT$ 7,500 – 9,500');
  await page.fill('#est-pages', '5000');
  await page.dispatchEvent('#est-pages', 'change');
  check((await page.inputValue('#est-pages')) === '1312', '超出範圍夾回 1312');
  await page.fill('#est-pages', '200');
  await page.click('[data-est-apply]');
  check((await page.inputValue('#f-pages')) === '200', '帶入詢價：頁數 200');
  check((await page.inputValue('#f-qty')) === '100', '帶入詢價：本數 100');
  check(await page.isChecked('#f-color-0'), '帶入詢價：色數 黑白');
  check(await page.evaluate(() => document.querySelector('#quote-specs').open), '帶入詢價：規格區展開');
  check((await activeId(page)) === 'f-brief', '帶入詢價：focus 需求描述');

  console.log('▶ 規格（有填才列）');
  await page.fill('#f-size', 'B5');
  await page.selectOption('#f-inner-paper', '道林紙 80g');
  await page.selectOption('#f-binding', '膠裝');
  await choose(page, 'f-finishing-0');
  await choose(page, 'f-finishing-6');
  await page.fill('#f-due', '月底前');
  await choose(page, 'f-files-0');
  await submit(page);
  await page.waitForSelector('[data-qf-done]:not([hidden])');
  sub = await lastSubmit(page);
  ({ body } = decodeMailto(sub.href));
  check(body.includes('\n── 規格（有填才列） ──\n'), '有填規格就有分隔線');
  check(body.includes('\n數量：100　成品尺寸：B5　頁數：200\n'), '數量／尺寸／頁數同一行');
  check(body.includes('\n色數：黑白\n'), '色數');
  check(body.includes('\n內頁紙張：道林紙 80g\n'), '內頁紙張（封面沒填就不列）');
  check(body.includes('\n裝訂：膠裝　加工：上光、裁切\n'), '裝訂與加工');
  check(body.includes('\n希望交期：月底前　檔案狀態：已有完稿\n'), '交期與檔案狀態');

  console.log('▶ mailto 過長提示');
  await edit(page);
  await page.fill('#f-brief', '需求說明很長。'.repeat(40));
  await submit(page);
  await page.waitForSelector('[data-qf-done]:not([hidden])');
  sub = await lastSubmit(page);
  check(sub.href.length > 1800 && (await page.locator('[data-qf-warn]').isVisible()), `超過 1800 字元（${sub.href.length}）顯示截斷提示`);

  for (const issue of issues) console.warn(`  ⚠ ${issue}`);
  check(issues.length === 0, '桌機流程沒有 console error／warning');
  await context.close();

  /* ---------- 手機 ---------- */
  console.log('▶ 手機 390');
  const m = await open(390);
  const est = m.page.locator('[data-estimator]');
  check(!(await m.page.evaluate(() => document.querySelector('[data-estimator]').open)), '快速試算預設收合');
  check(await est.locator('summary').isVisible(), '收合的 summary 可見');
  await est.locator('summary').click();
  check(await m.page.evaluate(() => document.querySelector('[data-estimator]').open), '點 summary 展開');
  await m.page.fill('#est-pages', '300');
  await m.page.click('[data-est-apply]');
  check((await m.page.inputValue('#f-pages')) === '300', '手機帶入詢價：頁數 300');
  check((await activeId(m.page)) === 'f-brief', '手機帶入詢價：focus 需求描述');
  for (const issue of m.issues) console.warn(`  ⚠ ${issue}`);
  check(m.issues.length === 0, '手機流程沒有 console error／warning');
  await m.context.close();

  /* ---------- 無 JS ---------- */
  console.log('▶ 無 JS');
  const n = await open(1280, { javaScriptEnabled: false });
  check(await n.page.locator('.estimator__noscript').isVisible(), '顯示改用表單的說明');
  check(await n.page.locator('[data-est-result]').isHidden(), '結果隱藏');
  check(await n.page.locator('[data-est-apply]').isHidden(), '「帶入詢價」隱藏');
  check(((await n.page.getAttribute('#quote-form', 'action')) ?? '').startsWith(MAILTO), '表單退回原生 mailto 送出');
  check(!(await n.page.evaluate(() => document.querySelector('#quote-form').noValidate)), '保留 HTML5 驗證');
  await n.context.close();
} finally {
  await browser.close();
  await server.stop();
}

if (failures.length > 0) {
  console.error(`✗ test:form：${failures.length} 個失敗（${passed} 個通過）`);
  process.exit(1);
}
console.log(`✓ test:form：${passed} 個檢查全部通過`);
