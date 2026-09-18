# 倚樂官網 Audit（2026-09-14）

對象：正式站 https://yihappy.com.tw/ 與 repository `Yungchiiiiii/yihappy-website`（`main` @ `de6a0cb`）。
交叉比對來源：ERP repository `Yungchiiiiii/internal-ops-app`（`docs/architecture/需求藍圖-數位印刷ERP.md`、`docs/infrastructure/DNS備份-2026-07-22.md`）與官網 git 歷史（47 commits）。

## 0. 結論摘要

| 項目 | 現況 | 判斷 |
| --- | --- | --- |
| 網站型態 | 單一 `index.html`（1,093 行），全部 CSS inline，React 18 UMD + `@babel/standalone` 從 unpkg 載入，JSX 在瀏覽器即時編譯 | 效能與可維護性都不合格；沒有 JS 就是一片空白（`<div id="root">`） |
| 託管 | GitHub Pages，來源為 `main` 分支根目錄（GitHub 內建 `pages build and deployment`／Jekyll），自訂網域 `yihappy.com.tw`（`CNAME`），DNS 在 Cloudflare（DNS only，指向 GitHub Pages IP） | 可用、免費、穩定；但要換成有 build 的框架，需要把 Pages Source 切成 GitHub Actions |
| Production commit | `de6a0cb99fc169024141b5cb439b021d04603b02`（2026-07-10 "Limit quote quantity to 2000"），最後一次 pages build 成功部署此 commit | 記錄於 `docs/PRODUCTION_BASELINE.txt`；舊站完整保留在 `legacy-site/` 供 rollback |
| Analytics | 無 GA／GTM／其他追蹤碼 | 沒有東西可以保留；GA4 之後要加需要使用者提供 Measurement ID |
| Search Console | `<meta name="google-site-verification" content="0uVWEFKhEAOmZFFGGEUCC6ubA3wS7F4Vp8mSKGQshFE">` | **必須保留** |
| 已索引 URL | sitemap 只有 `https://yihappy.com.tw/`；站內全部是 hash 錨點（`#about` `#products` `#process` `#why` `#contact`） | 首頁 URL 不變；新首頁保留同名錨點 id，不需要 301 |
| 表單 | `mailto:` 開啟郵件草稿（2026-07-02 由 Formspree 類服務改為 mailto） | 靜態託管、無可用後端憑證 → 新版保留 mailto，改善流程與 fallback |
| 字型 | Google Fonts（Noto Sans TC + Noto Serif TC）外連 | 改為自建 subset 字型（效能、隱私、無外部依賴） |
| 圖片素材 | **完全沒有真實成品照片**；Hero、About、服務卡全部是 placeholder（`[ 高解析印刷成品特寫 ]`、`[ paper stack ]`、`[ service mark ]` 直接顯示在正式站） | 真實素材只有 logo（`logo-new.png`、`logo.svg`）；新版不得虛構照片 |

## 1. 品牌與「5 秒測試」

第一次進站的潛在客戶，5 秒內要知道的五件事，目前網站的表現：

| 問題 | 現況 | 結果 |
| --- | --- | --- |
| 倚樂是做什麼的？ | Hero 主標是英文「Pages that last, ink that speaks.」，副標「為知識而印 · 為品牌而印」。要讀到第三行才看到「教科書與精緻書籍印刷」 | 不及格：主標是任何公司都能用的句子 |
| 倚樂擅長什麼？ | 「五大服務」用 Textbook Printing／Digital Short-Run／Hardcover & Softcover／Corporate Identity／Custom Solutions 英文優先 | 不及格：客戶要翻譯；且 logo 上真正的業務（CTP、依需印刷、數位直噴、平面設計）在內文完全沒出現 |
| 我什麼情況適合找倚樂？ | 沒有以客戶需求切入的入口；卡片是服務名詞，不是「我要印什麼」 | 不及格 |
| 跟其他印刷公司有什麼不同？ | 「Why Yi Happy」四張卡：教科書專業／合理價格／自有產線／一站式 | 及格邊緣：內容是對的，但形式是四張 Card 兩行字，讀起來像模板 |
| 怎麼開始詢問？ | 「立即報價」「索取報價」「加入報價」「取得正式報價」「立即詢價」「送出詢問」六種 CTA 文案並存；「加入報價清單」的購物車式 tray 對 B2B 詢價沒有意義 | 不及格：轉換路徑不一致 |

「AI 模板感」的具體來源：
- 英文義大利體 Times 大標 + 中文副標的雙語裝飾排版；mono 字型編號（`01 關於`）、跑馬燈 ticker、noise 紋理覆蓋、`Made with care in Zhonghe`。
- 每一區都是「大標 + 兩行說明 + N 張卡片」。
- 服務卡與 modal 的「線條圖示 + 黑底方塊」全是 placeholder。
- 文案：「職人精神 · 一冊一品」「收藏級的細節，由倚樂職人逐冊把關」與實際業務（教科書、黑白輪轉、POD）不一致。

## 2. 逐區檢視

| 區塊 | 問題 |
| --- | --- |
| Nav | 700px 以下直接 `display:none` 所有連結，**手機版沒有選單**；logo 高度 76–96px 太大；連結沒有目前頁狀態 |
| Hero | 主標無法回答「做什麼」；`hero-figure` 是黑色方塊 + 文字 placeholder；三個數字「24 YRS／高效 交貨／5 項」：24 年與「自 2009 年」矛盾（git 歷史：2026-07-10 由 17 改成 24） |
| Ticker | 純裝飾，無資訊 |
| About | placeholder 圖；文案可用但偏抽象；「一條龍／高 CP 值／長期作伴」三欄 |
| Products | 五張卡 + modal + 「加入報價」購物車；卡片 `article onClick` 無鍵盤操作；modal 無 focus trap、無 `role="dialog"` |
| Process | 五欄可用；「瑕疵率低於 0.3%」無法驗證 |
| Why | 四張卡，內容合理 |
| Quote tool | 公式：`(頁數 × 每面單價 + 25) × 本數`，彩色 1–1.8、黑白 0.25–0.35，頁數 16–1312、本數 10–2000。是老闆本人多次調整的內容（git 歷史 5 個 commit）→ **保留公式與數值** |
| Contact | 資訊正確；表單 5 個必填欄位一次出現；`select` 無 label 關聯；mailto 後沒有任何 fallback |
| Footer | 可用；logo 佔太大 |
| 全站 | 無 skip link、focus 樣式依賴瀏覽器預設、`button` 只有「×」無 aria-label、`prefers-reduced-motion` 未處理、`html { scroll-behavior: smooth }` 未依 reduced-motion 關閉 |

## 3. 技術與 SEO 盤點

- `<html lang="zh-Hant">` 正確。
- Title／description／OG 有，但 OG 沒有 `og:image`；sitemap 宣告 `hreflang="en"` 指向同一個 URL（錯誤，移除）。
- LocalBusiness schema：`openingHours: Mo-Fr 09:00-18:00`，但頁面顯示 09:00–22:00（老闆 2026-05-13 自行把 18:00 改成 22:00，schema 沒同步）。
- 無 `og:image`、無 BreadcrumbList／Service／FAQ schema。
- React + Babel 在瀏覽器編譯：主執行緒阻塞、LCP 差、`unpkg` 第三方依賴；`react.production.min.js` 沒有 SRI。
- 沒有 build、沒有 lint、沒有測試、沒有 CI。
- Google Maps iframe（`filter: grayscale`）可保留，改 lazy。

## 4. 公司事實盤點

### 4.1 可直接使用（有來源）

| 事實 | 值 | 來源 |
| --- | --- | --- |
| 公司名稱 | 倚樂企業有限公司／Yi Happy Co., Ltd. | 官網 |
| 成立年份 | 2009 | 官網 meta、schema、內文一致 |
| 地址 | 新北市中和區中山路二段 530 號 4 樓之一 | 官網 |
| 電話 | 02-2226-5720 | 官網 |
| Email | yihappy.dp@gmail.com | 官網（2026-07-02 老闆更新） |
| 營業時間 | 週一至週五 09:00–22:00 | 官網頁面（2026-05-13 老闆從 18:00 改成 22:00；schema 未同步） |
| Logo 標語 | CTP · 依需印刷 · 數位直噴 · 平面設計 | `logo-new.png` |
| 服務範疇 | 教科書印刷、數位短版印刷、精裝平裝書籍、企業形象印刷品、客製化印刷 | 官網 |
| 起印量 | 教科書 10 冊起；數位短版 2 本起印 | 官網（2026-07-10 老闆從 500 冊／1 本改為 10 冊／2 本） |
| 裝訂方式 | 膠裝、線膠裝、騎馬釘、平釘、摺紙（對折、三折）；穿線 | ERP 藍圖 + 官網 |
| 後加工 | 亮膜、霧膜、上光上霧、局部光、上膜、燙金、打凹、UV、裁切、收縮膜包裝、裝箱、運送（可多地點） | ERP 藍圖 + 官網（2026-07-10 老闆新增） |
| 設備 | 出版機（CTP）、大圖機、Canon 彩色雷射、Kyocera 彩色噴墨、彩色噴墨（中國製）、黑白輪轉機、Ricoh 黑白雷射 | ERP 藍圖 §4.1 |
| 數位印刷項目 | POD（內文、卡片類、封面類：折封口／不折封口、DM）、數位打樣、大圖印製、裝訂、裁切 | ERP 藍圖 §4.1 |
| 傳統印刷項目 | 製版、印刷（封面／內頁，通常與協力廠配合）、裝訂、裁切、底片、出版打樣大圖 | ERP 藍圖 §4.1 |
| 紙張 | 封面：銅西 200/250、雪銅 200/250；內文：道林紙 70/75/80/120/150g、特銅 120/200、雪銅 120/200、日本上質紙 80/100/120；噴墨卷裝紙 | ERP 藍圖 §10 |
| 印前 | 電腦室處理檔案、拼版 | ERP 藍圖 §11.2、§16 |
| 頁數範圍 | 16–1312 頁（試算）；32–1312 頁（書籍） | 官網 |
| 快速試算 | 彩色每面 NT$1–1.8、黑白每面 NT$0.25–0.35、每本 25 元成書費；頁數 16–1312（步進 2）、本數 10–2000（步進 2） | 官網（老闆 2026-07-10 五次調整） |
| 回覆承諾 | 1 個工作日內回覆；完成詳細需求後 1 個工作日內提供正式報價單 | 官網 |
| 流程 | 需求洽談 → 打樣校色 → 正式印製 → 品檢包裝 → 出貨配送；全台配送、海外物流可協助 | 官網 |
| 客群 | 出版社、教育機構、品牌客戶 | 官網 |
| 經營理念 | 「以實在對待每一本書，以誠心對待每一位客戶」；中型自有產線、不轉手不加價、一站式 | 官網 |

### 4.2 待老闆確認（新版不採用或改為保守寫法）

| 項目 | 現況 | 新版處理 |
| --- | --- | --- |
| 「24 YRS 深耕印刷產業」 | 與「自 2009 年」（17 年）矛盾 | 不放年數，只寫「自 2009 年」；確認後可加「團隊 24 年印刷經驗」 |
| 「瑕疵率低於 0.3%」 | 無法驗證 | 改寫為「出貨前逐冊檢驗」，不放數字 |
| 精裝（圓背／方背／布面／燙金／書匣／刷邊） | 只出現在官網，ERP 裝訂項目沒有精裝 | 寫成「精裝與特殊裝幀請於詢價時說明」 |
| 「海外物流皆可協助」 | 官網既有 | 保留為「海外物流可洽詢」 |
| 「輪轉機支援快速量產／高效交貨」 | 官網既有，無具體數字 | 只描述設備用途，不做交期承諾 |
| 「平面設計」服務範圍 | 只在 logo | 寫成「設計協助與印前檔案處理（檔案檢查、拼版）」 |
| 營業時間 22:00 | 老闆自行修改 | 採用 09:00–22:00 並同步 schema |

## 5. 部署與安全流程（發現）

- GitHub Pages 目前是「Deploy from a branch：`main` / (root)」。要用有 build 的框架（Astro），正規做法是 Pages Source 改為 **GitHub Actions**。
- 本工作環境的 GitHub API 代理**不允許** `/repos/{owner}/{repo}/pages` 路徑，所以無法代為切換此設定；這一步需要老闆在 GitHub 網頁上點一次（見 `docs/03-deployment.md`）。
- 在切換前，`main` 分支不動（正式站維持舊版）；新版在 `claude/laughing-ramanujan-gq3zye` 分支開發、以 PR 合併。切換設定 → 合併 PR → Actions 自動 build 與部署，零停機。
- Rollback：`legacy-site/` 保留舊站，`deploy.yml` 提供 `workflow_dispatch` 的 `target=legacy` 手動部署舊站；或把 Pages Source 切回 branch 並 revert。
