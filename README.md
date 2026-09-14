# 倚樂企業有限公司官網

`yihappy.com.tw` 的官網原始碼。Astro 7 靜態輸出、TypeScript strict、純 CSS；部署到 GitHub Pages。
規格書：`docs/02-design-spec.md`（唯一規格來源）；公司事實邊界：`docs/01-audit.md` §4。

## 需求

- Node 22（`.nvmrc`）、npm 10
- QA 腳本需要 Playwright 的 Chromium：`npx playwright install chromium`（版本要與 `package.json` 的 `playwright` 相符）

## 指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 開發伺服器 |
| `npm run build` | `astro build` → `dist/` |
| `npm run preview` | 以 `dist/` 起本機伺服器 |
| `npm run fonts` | 字型管線：build → 掃描 `dist` 字元 → 產生 `public/fonts/noto-sans-tc-{400,500,700}.woff2` 與 `glyphs.json`，並複製 IBM Plex Mono（`--no-build` 跳過 build） |
| `npm run check:fonts` | build 後比對 `dist` 與 `glyphs.json`，缺字即失敗（`--no-build` 用現有 dist） |
| `npm run og` | 對 `/og-template/` 截圖產生 `public/og.png`（1200×630） |
| `npm run icons` | 由 `legacy-site/logo.svg` 重新產生字標 SVG、favicon 與 apple-touch-icon |
| `npm run test:build` | `astro check` + `astro build` |
| `npm run test:links` | 檢查 `dist` 內站內連結、資產、`#錨點`（`scripts/pages.mjs` 的 `plannedPages` 只警告） |
| `npm run test:html` | `html-validate dist/**/*.html`（設定：`.htmlvalidate.json`） |
| `npm run test:a11y` | axe（`@axe-core/playwright`）每頁 1280／390 寬度（含選單開啟），serious／critical 必須為 0 |
| `npm run test:screens` | 每頁 375／390／768／1280／1440 全頁截圖到 `qa/screenshots/`，並檢查 console error／warning 與水平溢出 |
| `npm test` | `check:fonts` → `test:build` → `test:links` → `test:html` → `test:a11y` |
| `npm run lighthouse` | Lighthouse mobile（首頁與 `/quote/`）→ `qa/lighthouse/` |

## 專案結構

```
astro.config.mjs        site、trailingSlash: 'always'、build.format: 'directory'、sitemap（排除 /og-template/）
public/                 CNAME、.nojekyll、robots.txt、favicon.*、apple-touch-icon.png、og.png、fonts/
src/
  assets/               logo-full.png（完整 logo，Footer／關於頁用 <Image> 轉 webp）、logo-mark.svg（字標，inline）
  components/           設計系統元件（spec §3.3）
  data/                 全站文案與事實的單一來源（spec §7）
  layouts/              Base.astro（skip link、Header、main、ContactCta、Footer、Seo）、ServiceLayout.astro（服務內頁模板）
  pages/                index、404、og-template（Phase 2：services/、about、quote、contact）
  scripts/              瀏覽器端 TS（mobile-menu；Phase 2：process-scroller、quote-form、estimator）
  styles/               tokens.css（§3.1）、base.css（reset、@font-face、基礎排版）、utilities.css
scripts/                Node 腳本：fonts、check-fonts、icons、links、screens、a11y、og、lighthouse；pages.mjs 為共用頁面清單；lib/ 共用模組
qa/                     screenshots/、lighthouse/（gitignored，見 qa/README.md）
legacy-site/            舊站完整檔案（rollback 用，請勿修改）
docs/                   01-audit、02-design-spec、PRODUCTION_BASELINE
.github/workflows/      ci.yml（PR 與非 main push 跑 npm test + 截圖 artifact）、deploy.yml（main → GitHub Pages；可手動選 legacy 回滾）
```

## 字型規則（spec §3.2、§11.4）

- 中文字型 Noto Sans TC 以 **build 輸出** 為準做子集：`400` 涵蓋全站文字、`500` 只涵蓋 `nav, button, .btn, label, summary, strong, b, dt, th, .tag, .eyebrow, [data-font="500"]` 內的文字、`700` 只涵蓋 `h1–h4, .t-display, [data-font="700"]`。
- 因此 **CSS 只能在上述元素使用 500／700**，其他元素一律 400；需要例外時在元素加 `data-font="500"` 或 `data-font="700"`，再執行 `npm run fonts`。
- 改了文案之後：`npm run fonts`，並把 `public/fonts/*.woff2` 與 `glyphs.json` 一起 commit。`npm test` 的第一步 `check:fonts` 會擋下缺字。
- 變體字型下載到 `.cache/fonts/`（不入版控），會核對 sha256；不符只警告並印出新 hash。
- 英數 mono：IBM Plex Mono 400／500 latin（`@fontsource/ibm-plex-mono`），由 `npm run fonts` 複製到 `public/fonts/`。

## 如何新增內容

1. **文案只寫在 `src/data/`**（`.astro` 內不得出現第二份文案）。首頁在 `home.ts`／`needs.ts`／`process.ts`／`specSheets.ts`；服務頁在 `services.ts`（FAQ 在 `faq.ts`）；表單選項在 `papers.ts`／`bindings.ts`／`finishing.ts`；公司事實在 `company.ts`；每頁 title／description 在 `pages.ts`；共用介面文字在 `ui.ts`。
2. 新頁面：在 `src/pages/` 建立，使用 `layouts/Base.astro`（服務內頁用 `ServiceLayout.astro`），title／description 取自 `data/pages.ts`。
3. 把新頁面路徑加到 `scripts/pages.mjs` 的 `pages`（從 `plannedPages` 移除），讓截圖、axe、Lighthouse 涵蓋它。
4. 執行 `npm run fonts`（會先 build），然後 `npm test` 與 `npm run test:screens`。
5. 只能使用 `docs/01-audit.md` §4.1 的公司事實；不得出現 §4.2 未核准寫法。

## 部署

- `main` 分支 push → `deploy.yml`：`npm ci && npm run build` → `actions/upload-pages-artifact`（`dist/`）→ `actions/deploy-pages`。
- 回滾：在 GitHub Actions 手動執行 `Deploy`，`target` 選 `legacy`，會直接部署 `legacy-site/`（舊站完整檔案，含 CNAME）。
- 自訂網域由 `public/CNAME`（`yihappy.com.tw`）與 `public/.nojekyll` 處理；`www` → apex 301 由 GitHub Pages 既有設定處理。
- 詳細步驟與 production commit 見 `docs/03-deployment.md`（Phase 2 補）與 `docs/PRODUCTION_BASELINE.txt`。
