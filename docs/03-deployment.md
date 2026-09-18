# 部署、回復與上線流程

## 現況（重新設計前）

- 託管：GitHub Pages，Source＝「Deploy from a branch」：`main` / `(root)`，由 GitHub 內建的 `pages build and deployment`（Jekyll）發布。
- 自訂網域：`yihappy.com.tw`（`CNAME` 檔）；`www.yihappy.com.tw` 由 GitHub Pages 301 到 apex。
- DNS：Cloudflare（DNS only），apex 四筆 A 指向 GitHub Pages IP、`www` CNAME 指向 `yungchiiiiii.github.io`（備份見 ERP repo `docs/infrastructure/DNS備份-2026-07-22.md`）。**本次不需要動 DNS。**
- Production commit（舊站）：`de6a0cb99fc169024141b5cb439b021d04603b02`（`docs/PRODUCTION_BASELINE.txt`）。
- 舊站完整檔案保留在 `legacy-site/`（`index.html`、`logo-new.png`、`logo.svg`、`robots.txt`、`sitemap.xml`、`CNAME`）。

## 部署規則（2026-09-18 起）

- 根目錄 `DEPLOY_TARGET` 檔案決定 push 到 `main` 時部署哪一版：`legacy`＝舊站（`legacy-site/`）、`site`＝新站（`dist/`）。
- **合併 PR 不等於上架**：只要 `DEPLOY_TARGET` 是 `legacy`，正式站就維持舊站，新版可以在 `main` 上慢慢修。
- 正式上架只有一種方式：老闆看過預覽並同意後，把 `DEPLOY_TARGET` 改成 `site` 並合併（或在 Actions 手動 Run workflow 選 `site`）。AI agent 不得自行把 `DEPLOY_TARGET` 改成 `site`。
- 預覽方式：每一輪修改都會提供（1）私人預覽網頁連結（Claude Artifact，整站可點）與（2）五種寬度截圖，看過再決定。

## 新版部署方式

新版是 Astro 靜態網站，需要 build，因此 Pages Source 改為 **GitHub Actions**：

- `.github/workflows/deploy.yml`：`push` 到 `main` 時 `npm ci && npm run build` → `actions/upload-pages-artifact`（`dist/`）→ `actions/deploy-pages`。
- `.github/workflows/ci.yml`：PR 與非 `main` 分支 push 時執行 `npm test`（build、字型覆蓋檢查、連結、HTML 驗證、axe），並上傳截圖 artifact。
- `dist/` 內含 `CNAME`、`.nojekyll`、`robots.txt`、`sitemap-index.xml`。

## 上線步驟（需要老闆做的只有第 1 步）

1. **GitHub → `Yungchiiiiii/yihappy-website` → Settings → Pages → Build and deployment → Source：改成「GitHub Actions」。**（這個設定無法由本次工作環境的 API 代理修改，所以需要人工點一次。切換後舊站仍然在線，直到下一次部署。）
2. 合併 PR（`claude/laughing-ramanujan-gq3zye` → `main`）。合併會觸發 `deploy.yml`，約 1–2 分鐘完成。
3. 到 Actions 看 `Deploy site` 綠燈，開 https://yihappy.com.tw/ 確認新版；`https://yihappy.com.tw/sitemap-index.xml` 與 `robots.txt` 正常。
4. Google Search Console：提交新的 sitemap `https://yihappy.com.tw/sitemap-index.xml`（舊的 `sitemap.xml` 可以移除）。

順序若倒過來（先合併 PR、還沒切換 Source）：`main` 根目錄不再有 `index.html`，舊的 Jekyll 發布會讓網站 404。**所以請先切換 Source，再合併。**

## 回復（Rollback）

兩種方式，都不需要動 DNS：

1. **一鍵回舊站**：Actions → `Deploy site` → Run workflow → `target` 選 `legacy` → Run。會把 `legacy-site/` 原封不動部署上去（約 1 分鐘）。要再回新版：Run workflow 選 `site`，或 push 任何 commit 到 `main`。
2. **Git 回復**：`git revert <merge commit>` 後 push `main`；若當時 Pages Source 仍是 GitHub Actions，因為 revert 後沒有 Astro 專案，`deploy.yml` 會失敗，所以請改用方式 1；或把 Pages Source 切回「Deploy from a branch：main /(root)」並確認根目錄有舊的 `index.html`（可從 `legacy-site/` 複製）。

## 之後怎麼改網站

- 文案與資料都在 `src/data/`；頁面在 `src/pages/`；元件在 `src/components/`。
- 改完：`npm run fonts`（只有在新增了字型子集沒有的字時需要；`npm test` 會告訴你）→ `npm test` → 開 PR → CI 綠燈 → 合併 → 自動部署。
- 不要直接改 `dist/`；不要在 `main` 直接 push 未經 CI 的內容。
