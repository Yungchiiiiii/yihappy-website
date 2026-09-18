# QA 報告（Deploy Gate）— 2026-09-15

對象：`claude/laughing-ramanujan-gq3zye` 分支最新 commit（見 PR）。所有檢查都可用 `npm test`、`npm run test:screens`、`npm run lighthouse` 重跑。

| Gate | 結果 | 證據 |
| --- | --- | --- |
| Build PASS | ✅ | `astro check` 0 errors；`astro build` 12 頁（含 `og-template`、`404`） |
| Tests PASS | ✅ | `check:fonts` 無缺字；`test:links` 站內連結／錨點／資產全部存在；`test:html`（html-validate）0 錯誤；`test:form` 66 個檢查全過（空白送出錯誤與 focus、電話或 Email 擇一、內容組合、mailto 編碼、複製、帶入詢價、手機收合、無 JS 退回原生 mailto） |
| Responsive PASS | ✅ | 375／390／768／1280／1440 × 11 頁 + 手機選單開啟 = 66 張截圖（`qa/screenshots/`），無水平溢出 |
| Links PASS | ✅ | `plannedPages` 已清空，連結檢查為嚴格模式 |
| Form PASS | ✅ | 見 `test:form`；送出後顯示內容預覽、複製鈕、Email／電話 fallback |
| Accessibility | ✅ | axe（`@axe-core/playwright`）11 頁 × 桌機／手機／選單開啟：serious／critical 0；Lighthouse Accessibility 100；skip link、focus-visible、focus trap、`prefers-reduced-motion` 皆有處理 |
| SEO PASS | ✅ | 每頁唯一 `h1`、唯一 title／description、canonical、OG（含 1200×630 `og.png`）、`sitemap-index.xml`（10 個 URL，不含 og-template／404）、`robots.txt`、JSON-LD（Organization+LocalBusiness、WebSite、Service、BreadcrumbList、FAQPage）；Lighthouse SEO 100 |
| Console 無重大 Error | ✅ | 截圖與 a11y 流程皆收集 console error／warning：0（`/contact/` 的 Google 地圖 iframe 在本工作環境無法連線，外部資源失敗不計入，正式環境可載入） |
| Mobile PASS | ✅ | 375 寬第一屏可見 H1 與「詢價」；手機選單（開關、Esc、focus trap、背景鎖定）；tap target ≥ 44px |
| Existing analytics preserved | ✅（無） | 舊站沒有任何 analytics；Google Search Console 驗證 meta 保留於每一頁（11／11 可索引頁） |
| Existing important URLs preserved | ✅ | 舊站只有 `/`；新首頁保留舊錨點 `#products` `#process` `#why` `#about` `#contact`；`www` → apex 301 由 GitHub Pages 維持 |
| Company information verified | ✅ | 名稱、地址、電話、Email、營業時間、成立年份、設備、紙張、裝訂、加工、起印量、試算公式逐字對照 `docs/01-audit.md` §4.1；禁用字眼（24 年、0.3%、圓背、布面、書匣、職人、收藏級）全站 0 筆 |
| Performance | ✅ | Lighthouse（mobile 模擬）首頁 97／100／100／100，詢價頁 99／100／100／100；CLS 0.000；LCP 2.4s／2.0s（模擬 4G）；最大頁面 JS 2.5KB gzip；自建字型三檔 210KB（400/500/700 subset）+ mono 29KB |

## 視覺 Review 紀錄（設計負責人）

- Hero、事實條、我要印什麼、流程 scroll 序列（桌機 sticky 兩欄／手機 sticky 舞台）、為什麼找倚樂、規格卡、關於摘要、ContactCta、Footer 逐一以 1280／375 截圖檢視。
- 修正回合：中文標題斷行（`<Phrased>` 片語控制，含 U+200B 手動斷點）、scroll 舞台桌機置中與放大、手機舞台裁切置中、手機無 JS 導覽、OG 圖標題斷行。
- 保留決定：Hero 紙張底部的印刷色條（四製程色的第二個出現位置，已寫進 spec §1）。

## 已知限制與待老闆確認

- 表單仍以 `mailto:` 送出（靜態託管、無後端）；已加上內容預覽、複製、Email／電話 fallback。若要改成直接送信，需要一個後端（Cloudflare Worker 或 Supabase Edge Function + Resend），我可以再做。
- 沒有真實成品照片；作品展示以「常見做法」規格卡呈現，`SpecSheet`／頁面結構已可直接加照片。
- `docs/01-audit.md` §4.2 的待確認事實（24 年、瑕疵率、精裝、海外物流、平面設計範圍）新版採保守寫法。
- Google Analytics：舊站沒有；若要加 GA4，提供 Measurement ID 即可加到 `Base.astro`。
