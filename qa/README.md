# qa/

QA 腳本的輸出目錄（除本檔外皆不納入版控）。

| 目錄 | 產生方式 | 內容 |
| --- | --- | --- |
| `screenshots/` | `npm run test:screens` | 每頁 × 375／390／768／1280／1440 的全頁截圖 `{page}-{width}.png`；375 另有 `{page}-375-menu.png`（行動版選單開啟）。同時檢查 console error／warning 與水平溢出，有問題就非零結束。 |
| `lighthouse/` | `npm run lighthouse` | Lighthouse mobile 報告 `{page}.report.json` / `.html`（首頁與 `/quote/`；加 `--strict` 會依 §10 目標判定）。 |

頁面清單集中在 `scripts/pages.mjs`；新增頁面時把路徑加進 `pages`（並從 `plannedPages` 移除）。

其他 QA 指令（輸出在終端機）：`npm run test:links`（連結／資產／錨點）、`npm run test:html`（html-validate）、`npm run test:a11y`（axe，serious／critical 必須為 0）、`npm run test:form`（Playwright 操作 `/quote/` 表單與快速試算，攔下 `mailto:` 導向後檢查內容）、`npm run check:fonts`（字型子集缺字）。
