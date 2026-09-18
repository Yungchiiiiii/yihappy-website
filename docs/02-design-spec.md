# 倚樂官網 Design Specification v1（Implementation-ready）

> 讀者：實作工程 agent（Codex 角色）。這份文件是唯一規格來源；有疑問先照文件做，再回報。
> 事實邊界：只能使用 `docs/01-audit.md` §4.1 的公司事實；§4.2 的項目只能用文件指定的保守寫法。不得新增設備、客戶、認證、年份、交期、價格、最低印量。

## 0. 定位

一句話：**倚樂是新北中和一間把「教科書、書籍、少量印刷」從製版做到裝訂出貨的印刷公司；自己有數位印刷、黑白輪轉、CTP 製版與裝訂加工設備。**

網站要在 5 秒內回答：

1. 做什麼：印教科書、書籍、手冊、少量印刷、卡片 DM、大圖；CTP 製版。
2. 擅長：書籍類（大量黑白輪轉、少量數位）、裝訂加工、CTP。
3. 什麼情況找倚樂：要印教材／書／手冊；只要幾本樣書；設計公司或同業需要 CTP 出版與打樣；不懂規格但有東西要印。
4. 不同之處：設備在自己手上（數位 + 輪轉 + CTP + 裝訂）；一個窗口負責到底；價格實在。
5. 怎麼開始：詢價（不需要先懂規格）。

語氣：具體、平實、專業，像一位資深印務在跟你講話。不用「創造無限可能」「值得信賴」「職人」「收藏級」。全站繁體中文；英文只用在技術名詞（CTP、POD、CMYK、DM）。

## 1. 視覺語言：從印刷借三樣東西，只借三樣

1. **紙與墨**：暖白紙色背景、黑墨文字、單一品牌紅（logo 的 `#CC0029`）。全站沒有漸層、沒有發光、沒有玻璃。
2. **裁切線與套色**：裁切角線（crop marks）只用在「規格卡」與少數容器角落；套色（C/M/Y/K 四層對位）只用在首頁「一張紙變成一本書」的 scroll 序列。四個製程色只出現在那裡與 Hero 印刷紙張底部的小色條（印刷色條，8px 高），其他地方不用。
3. **工單／規格表的排版**：mono 小標籤（`尺寸`／`內頁`／`裝訂`）配合對齊的數值，像一張工單。這是站上「有印刷產業感」的主要來源。

不做：網點紋理背景、noise overlay、跑馬燈、ticker、浮動物件、文字飛入、視差背景、3D。

## 2. Sitemap 與 URL

| URL | 頁面 | Title（≤ 60 字元） | Description |
| --- | --- | --- | --- |
| `/` | 首頁 | 倚樂企業有限公司｜教科書、書籍與少量印刷，從製版到裝訂 | 新北中和的印刷公司，自 2009 年。自有 CTP 製版、數位印刷、黑白輪轉與裝訂加工設備，教科書、書籍、手冊、少量印刷到大圖輸出，一個窗口負責到底。 |
| `/services/` | 印刷服務 | 印刷服務｜倚樂企業有限公司 | 用你要印的東西來找：教科書教材、書籍手冊、少量樣書、卡片 DM、大圖輸出、CTP 製版。每一項都說明用什麼設備與方式製作。 |
| `/services/books/` | 教科書、書籍與手冊印刷 | 教科書、書籍與手冊印刷｜倚樂 | 教科書與教材內頁黑白輪轉大量印製，少量書籍數位印刷 2 本起印；膠裝、線膠裝、騎馬釘、平釘，封面上光上霧。 |
| `/services/print-on-demand/` | 依需印刷（POD）、少量印刷與卡片 DM | 依需印刷 POD、少量印刷與卡片 DM｜倚樂 | 2 本起印的樣書、提案書、少量書籍，以及卡片、DM、書封（折封口／不折封口）；Canon 彩色雷射、Kyocera 彩色噴墨、Ricoh 黑白雷射。 |
| `/services/ctp/` | CTP 製版與打樣 | CTP 製版與數位打樣｜倚樂 | 提供印刷同業與設計公司 CTP 出版、多種板材尺寸、底片與出版打樣大圖；平版印刷與協力廠配合，由倚樂統籌。 |
| `/services/large-format/` | 大圖輸出 | 大圖輸出、數位直噴｜倚樂 | 海報、展示與看板用大圖，大圖機數位直噴輸出；可搭配裁切與後加工。 |
| `/services/finishing/` | 裝訂與後加工 | 裝訂與後加工｜倚樂 | 膠裝、線膠裝、騎馬釘、平釘、摺紙、上光上霧、覆膜、局部光、裁切、收縮膜包裝、裝箱與配送。 |
| `/about/` | 關於倚樂 | 關於倚樂｜新北中和的印刷公司，自 2009 年 | 倚樂企業有限公司 2009 年於新北中和成立，專注教科書與書籍印刷。自有數位印刷、黑白輪轉、CTP 製版與裝訂加工設備，一個窗口把案子做到出貨。 |
| `/quote/` | 詢價 | 詢價｜告訴我們你要印什麼 | 不確定規格也可以送出。填好用途與大概數量，我們在 1 個工作日內回覆需要確認的問題；也可以直接來電 02-2226-5720。 |
| `/contact/` | 聯絡我們 | 聯絡倚樂｜電話、地址、營業時間 | 倚樂企業有限公司，新北市中和區中山路二段 530 號 4 樓之一。電話 02-2226-5720，週一至週五 09:00–22:00。 |
| `/404.html` | 找不到頁面 | 找不到這一頁｜倚樂 | — |

- 所有 URL 以 `/` 結尾（Astro `trailingSlash: 'always'`，`build.format: 'directory'`）。
- 首頁保留舊站錨點 id：`products`（我要印什麼區）、`process`、`why`、`about`、`contact`。舊連結 `/#contact` 等仍可用。
- 主導覽只有三個連結 + 一個 CTA：`印刷服務`、`關於倚樂`、`聯絡我們`、**`詢價`**（primary）。
- 全站唯一 primary CTA 文案：**「詢價」**（按鈕）／「先把需求告訴我們」（區塊標題）。次要 CTA：「看我們能印什麼」「撥打 02-2226-5720」。不再出現「立即報價／索取報價／加入報價／取得正式報價」。

## 3. Design System

### 3.1 Tokens（`src/styles/tokens.css`，以 CSS custom properties 定義；light only）

```css
:root {
  /* color */
  --paper: #F8F5EF;        /* page background */
  --paper-2: #EFEAE0;      /* alternate section background */
  --white: #FFFFFF;        /* cards, inputs */
  --ink: #17150F;          /* primary text */
  --ink-2: #3F3B33;        /* secondary text */
  --ink-3: #6B665C;        /* muted text, min 4.5:1 on --paper */
  --line: rgba(23, 21, 15, 0.14);
  --line-strong: rgba(23, 21, 15, 0.32);
  --red: #CC0029;          /* brand accent, primary button */
  --red-hover: #A80022;
  --red-tint: #FBE7EB;
  --success: #1E7B4A; --warning: #9A6B00; --error: #B3261E;
  --c: #00AEEF; --m: #EC008C; --y: #FFE600; --k: #231F20;  /* only for CMYK sequence */

  /* type */
  --font-sans: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --t-display: clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem);  /* 40 → 72 */
  --t-h1: clamp(2rem, 1.35rem + 2.6vw, 3.5rem);        /* 32 → 56 */
  --t-h2: clamp(1.625rem, 1.3rem + 1.4vw, 2.5rem);     /* 26 → 40 */
  --t-h3: clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem);     /* 20 → 24 */
  --t-body: 1.0625rem;  /* 17px desktop */ 
  --t-body-m: 1rem;     /* 16px mobile */
  --t-small: 0.875rem;  /* 14 */
  --t-label: 0.75rem;   /* 12, mono, letter-spacing .08em */
  --t-caption: 0.75rem;
  --lh-tight: 1.15; --lh-heading: 1.25; --lh-body: 1.75;

  /* spacing scale (4-base) */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px;
  --s-7: 48px; --s-8: 64px; --s-9: 96px; --s-10: 128px;
  --section-y: clamp(var(--s-8), 6vw + 16px, var(--s-10));
  --container: 1200px; --container-narrow: 760px;
  --gutter: clamp(20px, 4vw, 48px);

  /* radius: one value for containers, one for controls */
  --r-card: 8px; --r-control: 6px; --r-pill: 999px;

  /* elevation: only for sticky header and dialogs */
  --shadow-1: 0 1px 2px rgba(23,21,15,.06), 0 8px 24px -16px rgba(23,21,15,.18);

  /* motion */
  --ease: cubic-bezier(.2,.7,.2,1); --dur-1: 160ms; --dur-2: 320ms; --dur-3: 600ms;
}
```

- 中文標題：`font-weight: 700`，`letter-spacing: 0`（中文不做負字距），`line-height: var(--lh-heading)`；Display 用 `--lh-tight`。
- 正文：400，`line-height: 1.75`，段落 `max-width: 36em`。
- Mono label：`--t-label`、`letter-spacing: .08em`、顏色 `--ink-3`，數字用 `font-variant-numeric: tabular-nums`。
- 內文與段落的中英文之間不加空白處理（維持來源文字），標點採全形。

### 3.2 字型

- `Noto Sans TC` 400／500／700，**build-time subset** 成三個 woff2：400 涵蓋全站文字、500 只涵蓋導覽／按鈕／標籤文字、700 只涵蓋標題文字（依 build 輸出掃描，見 §11.4），放在 `public/fonts/`，`font-display: swap`，並在 `<head>` 對 700 與 400 做 `<link rel="preload" as="font" type="font/woff2" crossorigin>`。
- `IBM Plex Mono` 400／500 latin subset（`@fontsource/ibm-plex-mono` 的 latin woff2 複製到 `public/fonts/`）。
- 詳見 §11.4 字型管線。

### 3.3 元件（`src/components/`）

| 元件 | 說明與狀態 |
| --- | --- |
| `Container` | `max-width: var(--container)`，左右 `var(--gutter)`；`narrow` 變體 760px |
| `Section` | 垂直 `var(--section-y)`；props：`tone: paper | paper-2 | white | ink`、`id` |
| `SectionHead` | eyebrow（mono label，可選）+ h2 + lede（`--ink-2`，max 36em）；對齊左，不置中 |
| `Button` | 變體 `primary`（紅底白字）、`secondary`（墨色 1px 外框）、`text`（底線）；尺寸 `md` 44px 高、`lg` 52px；狀態 hover／focus-visible（2px `--ink` outline offset 2px）／disabled（opacity .5）；可渲染為 `<a>` 或 `<button>`；圖示只用簡單箭頭 `→`（文字），不用 icon library |
| `Header` | 固定頂端、高度 64px（mobile 56px），背景 `--paper` 92% + `backdrop-filter: blur(8px)`，捲動後底線 `--line`；左 logo（SVG 字標，高 26px）+ 右導覽 + CTA；`aria-current="page"` |
| `MobileMenu` | ≤ 900px 顯示漢堡按鈕（44×44，`aria-expanded`、`aria-controls`），開啟為全寬面板（`role="dialog"`、`aria-modal`、focus trap、Esc 關閉、背景不可捲動），內容：三個連結、`詢價` primary、`撥打 02-2226-5720` secondary、Email |
| `Footer` | 墨色底 `--ink`／紙色字；四欄→手機兩欄→單欄：品牌（完整 PNG logo，寬 160px，白底圓角容器讓 logo 保持原色）+ 一句話；服務連結；公司連結；聯絡資訊（地址、電話 `tel:`、Email `mailto:`、營業時間）；底列 © 2009–{年份} 倚樂企業有限公司 |
| `NeedCard` | 「我要印…」卡：icon（28px 線條 SVG）、標題、一句說明、mono「做法」一行、整卡可點（`<a>` 包裹，hover 底線於標題、邊框 `--line-strong`）；不做位移動畫 |
| `MethodRow` | 技術層列表列：左 mono 編號 + 名稱，右說明與設備 tag（`Tag`） |
| `Tag` | 小標籤（`--r-pill`，1px `--line`，mono 12px） |
| `SpecSheet` | 「規格卡」：白底、1px `--line`、四角 crop marks（CSS pseudo elements，8px 線）、標題、mono 標籤 + 值的兩欄表格（`<dl>`）、底部備註 |
| `ProcessScroller` | 首頁 scroll-driven 序列（§6） |
| `Step` | 流程步驟（編號 mono、標題、說明） |
| `FaqList` | `<details>` 為基礎的 FAQ，`summary` 44px 高，帶 FAQPage schema |
| `ContactBlock` | 電話／Email／地址／營業時間 `<dl>`，電話與 Email 可點 |
| `QuoteForm` | 詢價表單（§5.7） |
| `Estimator` | 快速試算（§5.7） |
| `Seo` | `<head>` 內 title／description／canonical／OG／Twitter／JSON-LD；每頁必填 title、description |
| `Logo` | inline SVG 字標（`legacy-site/logo.svg` 路徑），`aria-label="倚樂 首頁"` |

規則：同一種元素只有一種圓角；所有可點擊區域最小 44×44；每頁只有一個 `<h1>`；卡片不使用 hover 位移，只改邊框或底線。

## 4. 全域版型

- Header 固定；頁面內容 `padding-top: 64px`。
- 桌機主導覽字級 15px、間距 32px；目前頁面底線 2px `--ink`。
- 手機：header 56px，只有 logo + `詢價`（小尺寸 primary，高 40px）+ 漢堡。
- Footer 前面永遠是 `ContactCta` 區（§5.1 第 8 區），除了 `/quote/` 與 `/contact/`。
- Skip link：`<a href="#main">跳到主要內容</a>`，focus 時可見。
- 版面斷點：`--bp-sm: 640px`、`--bp-md: 900px`、`--bp-lg: 1200px`。所有 grid 在 <900px 收成單欄（規格卡 grid 在 640–900 兩欄）。

## 5. 頁面規格與文案

所有文案照抄；如需換行由排版決定。

### 5.1 首頁 `/`

**區 1 Hero**（`Section tone=paper`，高度自然，不強制 100vh；桌機兩欄 7/5，手機單欄圖在下）

- Eyebrow（mono）：`倚樂企業有限公司　新北中和　自 2009 年`
- H1（display）：`教科書、書籍與少量印刷，從製版到裝訂，一次做好。`
- Lede：`自有 CTP 製版、數位印刷、黑白輪轉與裝訂加工設備。幾本樣書到上萬本教材，先告訴我們你要印什麼，規格細節我們一起確認。`
- CTA：`詢價`（primary lg → `/quote/`）、`看我們能印什麼`（secondary lg → `/services/`）
- 右側視覺：`HeroSheet`——一張靜態的「已對位」印刷紙張插圖（SVG）：紙張矩形帶裁切角線、四角十字對位標記，紙上是一個簡化的書封版面（一個粗體字塊「倚樂」、一條紅色色帶、一組 mono 規格行）。**靜態**，不動畫。顏色：紙 `--white`、線 `--ink`、色帶 `--red`。
- Hero 下方「事實條」（`FactStrip`，4 格，mono label + 值，手機 2×2）：
  - `起印量`／`數位印刷 2 本起・教科書 10 冊起`
  - `裝訂`／`膠裝・線膠裝・騎馬釘・平釘`
  - `設備`／`CTP・數位印刷・黑白輪轉・大圖`
  - `回覆`／`1 個工作日內`

**區 2 我要印什麼**（`id="products"`，`tone=white`）

- Eyebrow：`用需求找`
- H2：`你要印的是哪一種？`
- Lede：`不用先懂印刷名詞。每一項我們都說明用什麼方式做，點進去看細節，或直接詢價。`
- 6 張 `NeedCard`（桌機 3×2，平板 2 欄，手機 1 欄）：
  1. `教科書・教材`｜`內頁黑白輪轉大量印製，封面彩色印刷、上光或上霧，膠裝或線膠裝。`｜做法：`黑白輪轉 + 數位封面 + 膠裝／線膠裝`｜→ `/services/books/`
  2. `書籍・手冊・型錄`｜`平裝書、作品集、產品型錄與簡介。少量走數位印刷，大量另行安排。`｜做法：`數位印刷／黑白輪轉 + 膠裝／騎馬釘`｜→ `/services/books/`
  3. `少量樣書・提案書`｜`2 本起印。樣書、提案、試銷版，不用等大量開機。`｜做法：`Canon 彩色雷射・Ricoh 黑白雷射・Kyocera 彩色噴墨`｜→ `/services/print-on-demand/`
  4. `卡片・DM・書封`｜`名片、卡片、DM，以及書封（折封口或不折封口），可上膜與裁切。`｜做法：`數位印刷 + 覆膜 + 裁切／摺紙`｜→ `/services/print-on-demand/`
  5. `大圖輸出`｜`海報、展示與看板用大圖，數位直噴。`｜做法：`大圖機`｜→ `/services/large-format/`
  6. `CTP 製版・打樣`｜`給印刷同業與設計公司：CTP 出版、多種板材尺寸、底片、出版打樣大圖。`｜做法：`出版機`｜→ `/services/ctp/`
- 卡片下方一行文字連結：`還是不確定？直接告訴我們你要做什麼 →`（→ `/quote/`）

**區 3 一張紙，怎麼變成一本書**（`id="process"`，`tone=paper-2`，`ProcessScroller`，§6）

- Eyebrow：`製作流程`
- H2：`一張紙，怎麼變成一本書。`
- 五步（右欄文字，每步一個 `Step`）：
  1. `說明需求`｜`電話、Email 或詢價表單都可以。不確定規格沒關係，我們會問你需要的問題。`
  2. `確認規格與報價`｜`尺寸、頁數、紙張、裝訂、數量、交期逐項確認。完成詳細需求後，1 個工作日內提供正式報價單。`
  3. `打樣校色`｜`需要時提供實體樣書與校色印樣，色彩、紙張、裝幀先看過再印。`
  4. `製版、印製、裝訂`｜`依規格安排數位印刷或黑白輪轉，接著裝訂與後加工。`
  5. `品檢與出貨`｜`出貨前逐冊檢驗。全台配送，海外物流可洽詢。`

**區 4 為什麼找倚樂**（`id="why"`，`tone=paper`）

不是四張卡。版型：左欄 H2 sticky（桌機），右欄三段有 mono 編號的段落，每段之間 1px `--line`。

- H2：`跟其他印刷廠不一樣的地方，不在口號，在做法。`
- `01　設備在自己手上`｜`數位印刷、黑白輪轉、CTP 製版、裝訂加工都在中和廠區。少量與大量各有適合的機台，不用為了湊量而妥協。`
- `02　一個窗口負責到底`｜`從報價、打樣、印製到出貨，由同一組人跟進。進度和問題直接說，不經層層轉手。`
- `03　價格實在`｜`中型自有產線，沒有中間加價。預算放在紙張、色彩與裝訂上。`

**區 5 常見做法**（`tone=white`）

- Eyebrow：`規格範例`
- H2：`幾種常見做法。`
- Lede：`實際規格依你的內容、數量與預算調整；這裡先讓你知道我們平常怎麼配。`
- 4 張 `SpecSheet`（桌機 4 欄、平板 2、手機 1）：
  1. 標題 `教科書・教材`：`內頁`／`道林紙 70–80g，黑白輪轉`；`封面`／`銅西 250g，彩色，上霧膜`；`裝訂`／`膠裝或線膠裝`；`數量`／`大量`；備註 `10 冊起`
  2. 標題 `少量樣書`：`內頁`／`日本上質紙 100g，數位黑白或彩色`；`封面`／`雪銅 250g，亮膜`；`裝訂`／`膠裝`；`數量`／`2 本起`；備註 `適合提案、試銷`
  3. 標題 `型錄・手冊`：`內頁`／`特銅 120g，彩色噴墨`；`封面`／`雪銅 200g，上光`；`裝訂`／`騎馬釘或膠裝`；`數量`／`少量到中量`；備註 `可搭配摺頁`
  4. 標題 `卡片・DM`：`紙張`／`銅西 250g，彩色雷射`；`加工`／`上霧膜、裁切`；`摺紙`／`對折或三折`；`數量`／`少量起`；備註 `書封可折封口`
- 卡片下方：`需要別的配法？詢價時告訴我們用途就好 →`（→ `/quote/`）

**區 6 關於（摘要）**（`id="about"`，`tone=paper-2`，兩欄：左 H2，右兩段 + 連結）

- H2：`2009 年起，在中和印書。`
- 段 1：`倚樂企業有限公司從教科書與書籍印刷做起。廠區在新北中和，自有數位印刷、黑白輪轉、CTP 製版與裝訂加工設備，從打樣到出貨在同一個地方完成。`
- 段 2：`我們相信的事很簡單：把規格說清楚，把承諾的做到，把價格放實在。`
- 連結：`認識倚樂 →`（→ `/about/`）

**區 7 先把需求告訴我們**（`id="contact"`，`ContactCta`，`tone=ink`；也用於其他頁）

- H2：`先把需求告訴我們。`
- 文：`不確定規格也可以。留下用途與大概數量，我們在 1 個工作日內回覆。`
- CTA：`詢價`（primary，紙色底墨字變體 `primary-on-ink`）、`撥打 02-2226-5720`（secondary 反白）
- 右側 `ContactBlock`（反白）：地址、Email、營業時間 `週一至週五 09:00–22:00`

### 5.2 印刷服務總覽 `/services/`

- Breadcrumb：`首頁 / 印刷服務`
- H1：`用你要印的東西來找。`
- Lede：`第一層是你的需求，第二層是我們用什麼設備與方式做。兩層都看不懂也沒關係，直接詢價。`
- 區 A「我要印」：同首頁區 2 的 6 張 `NeedCard`（共用資料）。
- 區 B「我們怎麼做」（`tone=paper-2`）：H2 `同一個窗口，這幾種做法。`，`MethodRow` ×6：
  1. `數位印刷（依需印刷 POD）`｜`少量、急件、每本內容都一樣或不一樣都可以。內文、卡片、封面、DM。`｜設備 tag：`Canon 彩色雷射`、`Kyocera 彩色噴墨`、`Ricoh 黑白雷射`、`彩色噴墨`
  2. `黑白輪轉印刷`｜`教科書、教材內頁的大量黑白印製。`｜tag：`黑白輪轉機`
  3. `CTP 製版與傳統印刷`｜`出版機 CTP 出版，多種板材尺寸，底片與出版打樣大圖。平版印刷與協力印刷廠配合，由倚樂統籌品質與交期。`｜tag：`出版機（CTP）`
  4. `大圖輸出`｜`海報、展示與看板用大圖，數位直噴。`｜tag：`大圖機`
  5. `裝訂與後加工`｜`膠裝、線膠裝、騎馬釘、平釘、摺紙（對折、三折）、上光、上霧、亮膜、霧膜、局部光、裁切、收縮膜包裝、裝箱與配送。燙金、打凹、UV 等特殊加工，詢價時說明用途，我們評估做法。`｜tag：`廠內加工`
  6. `設計協助與印前`｜`檔案檢查、拼版、版面設計協助。沒有完稿也可以先談。`｜tag：`電腦室`
- 區 C：`ContactCta`。

### 5.3 服務內頁（共用模板 `ServiceLayout`）

結構：Breadcrumb → H1 + lede → 「適合什麼情況」（3–4 條 `<ul>`）→ 「怎麼做」（設備／方式，`MethodRow` 精簡版）→ 「規格選項」（`SpecSheet` 樣式的 `<dl>`：紙張／裝訂／加工／起印量／頁數）→ 「注意事項」（2–3 條）→ FAQ（2–3 題）→ `ContactCta`（文案帶入服務名）。

**`/services/books/` 教科書、書籍與手冊印刷**
- H1：`教科書、書籍與手冊。`
- Lede：`從十冊教材到上萬本教科書，從一本樣書到一批型錄，我們用不同的機台做，但由同一個窗口負責。`
- 適合：`出版社與教育機構的教科書、教材、講義`；`平裝書、作品集、產品型錄、公司簡介`；`改版後需要小量補印的書`；`先印幾本確認再大量印製`
- 怎麼做：`內頁黑白大量：黑白輪轉機`；`內頁彩色或少量：Canon 彩色雷射、Kyocera 彩色噴墨、Ricoh 黑白雷射`；`封面：數位印刷，或平版印刷與協力廠配合`；`裝訂：膠裝、線膠裝、騎馬釘、平釘`
- 規格：`內頁紙張`／`道林紙 70・75・80・120・150g、特銅 120・200g、雪銅 120・200g、日本上質紙 80・100・120g`；`封面紙張`／`銅西 200・250g、雪銅 200・250g`；`封面加工`／`上光、上霧、亮膜、霧膜、局部光`；`裝訂`／`膠裝、線膠裝、騎馬釘、平釘`；`起印量`／`數位印刷 2 本起，教科書 10 冊起`；`頁數`／`32–1312 頁`
- 注意：`精裝與特殊裝幀請於詢價時說明，我們評估做法。`；`頁數需為偶數；騎馬釘適合頁數較少的冊子。`；`有現成檔案請一併提供，沒有也可以先談。`
- FAQ：`最少可以印幾本？`／`數位印刷 2 本起印，教科書 10 冊起。`；`可以先看樣書嗎？`／`可以。需要時我們提供實體樣書與校色印樣，確認後再正式印製。`；`交期多久？`／`依規格與數量不同，報價時一併確認。`

**`/services/print-on-demand/` 依需印刷 POD、少量印刷與卡片 DM**
- H1：`依需印刷：要幾本印幾本。`
- Lede：`2 本起印。樣書、提案書、試銷版、少量書籍，以及卡片、DM 與書封，用數位印刷直接做，不用等大量開機。`
- 適合：`只需要幾本到幾十本的書或手冊`；`提案、比稿、內部審閱用的樣書`；`名片、卡片、DM、邀請卡`；`書封（折封口或不折封口）與少量封面`
- 怎麼做：`彩色：Canon 彩色雷射、Kyocera 彩色噴墨、彩色噴墨`；`黑白：Ricoh 黑白雷射`；`數位打樣`；`裝訂與加工在廠內完成`
- 規格：`項目`／`內文、卡片類、封面類（折封口／不折封口）、DM`；`紙張`／`道林紙、特銅、雪銅、日本上質紙、銅西`；`加工`／`上光、上霧、亮膜、霧膜、裁切、摺紙（對折、三折）`；`起印量`／`2 本起`
- 注意：`少量印刷每本單價較高，數量到一定程度會建議改用其他方式，報價時我們會說明。`；`色彩要求高的案子，建議先做數位打樣。`
- FAQ：`沒有檔案可以印嗎？`／`可以先談。我們提供設計協助與印前檔案處理。`；`可以每本內容不同嗎？`／`詢價時告訴我們用途與數量，我們評估做法。`

**`/services/ctp/` CTP 製版與打樣**
- H1：`CTP 製版與打樣。`
- Lede：`給印刷同業、設計公司與出版社：出版機 CTP 出版、多種板材尺寸、底片與出版打樣大圖。`
- 適合：`印刷廠需要穩定的外包製版`；`設計公司要交付印刷廠的版材與打樣`；`需要平版印刷的書籍封面與內頁，由倚樂統籌協力印刷`
- 怎麼做：`出版機（CTP）出版`；`底片`；`出版打樣大圖`；`平版印刷與協力印刷廠配合`
- 規格：`板材尺寸`／`多種尺寸，詢價時告知印刷機型`；`打樣`／`出版打樣大圖、數位打樣`；`急件`／`可洽詢`
- 注意：`提供完稿 PDF 與拼版需求；沒有拼版檔我們可以協助。`；`打樣費用與次數在報價時說明。`
- FAQ：`製版可以只做製版不印刷嗎？`／`可以。`；`要提供什麼檔案？`／`完稿 PDF，附上尺寸、出血與印刷機型；不確定的部分詢價時一起確認。`

**`/services/large-format/` 大圖輸出**
- H1：`大圖輸出。`
- Lede：`海報、展示與看板用大圖，大圖機數位直噴輸出，可搭配裁切與後加工。`
- 適合：`活動與展示海報`；`店面與教室用大圖`；`出版打樣大圖`
- 怎麼做：`大圖機數位直噴`；`裁切與後加工`
- 規格：`尺寸`／`依大圖機規格，詢價時提供成品尺寸`；`加工`／`裁切、覆膜（詢價時確認）`
- 注意：`大圖檔案請以實際尺寸或等比例製作，解析度與出血詢價時一起確認。`
- FAQ：`可以只印一張嗎？`／`可以。`

**`/services/finishing/` 裝訂與後加工**
- H1：`裝訂與後加工。`
- Lede：`印好只是一半。裝訂、覆膜、裁切、摺紙、包裝與配送，在中和廠內接著做完。`
- 適合：`書籍與冊子的裝訂`；`封面與卡片的上光、上霧、覆膜`；`DM 摺紙、裁切`；`收縮膜包裝、裝箱、分點配送`
- 怎麼做（列表）：`裝訂：膠裝、線膠裝、騎馬釘、平釘`；`摺紙：對折、三折`；`表面：上光、上霧、亮膜、霧膜、局部光`；`裁切`；`包裝：收縮膜包裝、裝箱`；`運送：可分多個地點`
- 規格：`特殊加工`／`燙金、打凹、UV：詢價時說明用途，我們評估做法`；`精裝`／`請於詢價時說明`
- 注意：`加工方式會影響紙張選擇與頁數安排，建議在報價階段一起決定。`
- FAQ：`只有加工可以嗎？`／`可以，詢價時說明來源與數量。`

### 5.4 關於倚樂 `/about/`

- H1：`一間把書印好的印刷公司。`
- Lede：`倚樂企業有限公司 2009 年在新北中和成立，從教科書與書籍印刷做起。`
- 區「我們在意什麼」（三段，同首頁區 4 版型）：
  - `說清楚`｜`規格、價格、交期在動工前講明白。你不用懂印刷名詞，我們會用你聽得懂的方式問。`
  - `做得到`｜`設備在自己手上：數位印刷、黑白輪轉、CTP 製版、裝訂加工。承諾的，是我們自己做得到的。`
  - `價格實在`｜`中型自有產線，沒有中間加價。預算放在紙張、色彩與裝訂上。`
- 區「我們怎麼跟你工作」：H2 `從詢價到出貨，同一個窗口。`，五步 `Step` 列表（文案同首頁區 3，簡版）。
- 區「設備與產線」（`tone=paper-2`）：H2 `廠內設備。`，`<dl>` 分組：
  - `製版`／`出版機（CTP）`
  - `數位印刷`／`Canon 彩色雷射、Kyocera 彩色噴墨、彩色噴墨、Ricoh 黑白雷射`
  - `輪轉印刷`／`黑白輪轉機`
  - `大圖`／`大圖機`
  - `裝訂與加工`／`膠裝、線膠裝、騎馬釘、平釘、摺紙、上光上霧、覆膜、局部光、裁切、收縮膜包裝`
  - `印前`／`電腦室：檔案檢查、拼版`
  - 註：`平版印刷與協力印刷廠配合，由倚樂統籌。`
- 區「地點」：`ContactBlock` + 完整 logo（`legacy-site/logo-new.png` 移到 `src/assets/logo-full.png`，用 Astro `<Image>` 輸出 webp，寬 240）。
- `ContactCta`。

### 5.5 詢價 `/quote/`（最重要的頁）

版型：桌機兩欄——左 7 欄表單，右 5 欄 sticky 的「快速試算 + 直接聯絡」；手機單欄，試算收在表單下方（`<details>`，預設收合），聯絡資訊在最後。

- H1：`告訴我們你要印什麼。`
- Lede：`不確定規格也可以送出。留下用途與大概數量，我們在 1 個工作日內回覆需要確認的問題。急的話直接來電 02-2226-5720。`

**表單（`QuoteForm`，純 HTML + 少量 TS，不用框架）**

第 1 段「你要印什麼」：單選 chip（`<input type="radio">` 視覺化，鍵盤可用）：`教科書・教材`、`書籍・手冊`、`少量樣書`、`卡片・DM・書封`、`大圖`、`CTP 製版`、`其他／不確定`。

第 2 段「基本資料」：
- `姓名`（必填，text）
- `公司／單位`（選填）
- `電話`（tel）與 `Email`（email）：**至少填一項**（欄位說明：`電話或 Email 至少留一個`）
- `需求描述`（必填，textarea 5 行；placeholder：`例如：國中數學講義，B5，約 120 頁，黑白，封面彩色，先印 30 本，希望月底前拿到。`）

第 3 段「我知道詳細規格（選填）」：`<details>` 收合，展開後：
- `數量`（number）、`成品尺寸`（text，placeholder `A4、B5、或 21×29.7cm`）、`頁數`（number，min 2，step 2）
- `色數`（radio：`黑白`、`彩色`、`黑白為主，部分彩色`）
- `內頁紙張`（select：道林紙 70g／75g／80g／120g／150g、特銅 120g／200g、雪銅 120g／200g、日本上質紙 80g／100g／120g、`不確定，請建議`）
- `封面紙張`（select：銅西 200g／250g、雪銅 200g／250g、`不確定，請建議`）
- `裝訂`（select：膠裝、線膠裝、騎馬釘、平釘、`不確定`）
- `加工`（checkbox：上光、上霧、亮膜、霧膜、局部光、摺紙、裁切、收縮膜包裝、`其他（燙金／打凹／UV 等）`）
- `希望交期`（text 或 date）
- `檔案狀態`（radio：`已有完稿`、`需要設計協助`、`還在規劃`）

送出鈕：`送出詢價`（primary lg）；旁註：`送出後會開啟你的郵件程式，內容已整理好，確認後寄出即可。`

**驗證**：HTML5 + TS 補強；錯誤在欄位下方紅字（`--error`），`aria-invalid`、`aria-describedby`；送出時第一個錯誤欄位 focus。

**送出行為**：
1. 組合純文字內容（固定格式，見下）。
2. `window.location.href = mailto:yihappy.dp@gmail.com?subject=...&body=...`（subject：`【倚樂詢價】{類別}｜{姓名}`）。
3. 同時把頁面切換成「已整理好內容」狀態（不離開頁面）：顯示綠色成功條 `已開啟郵件程式。如果沒有自動開啟，請用下面的方式寄給我們。`，下面是 `<pre>` 顯示同一份內容 + `複製內容` 按鈕（`navigator.clipboard`，成功顯示 `已複製`）+ `mailto` 連結按鈕 `用 Email 寄出` + `撥打 02-2226-5720`。
4. 內容格式：
```
倚樂詢價｜{類別}
姓名：{姓名}
公司／單位：{公司}
電話：{電話}
Email：{email}

需求描述：
{需求描述}

── 規格（有填才列） ──
數量：{n}　成品尺寸：{size}　頁數：{pages}
色數：{color}
內頁紙張：{paper}　封面紙張：{cover}
裝訂：{binding}　加工：{finishing}
希望交期：{due}　檔案狀態：{files}

（此內容由 yihappy.com.tw 詢價表單產生）
```

**快速試算（`Estimator`，右欄）**
- 標題：`書籍印刷快速試算（參考）`
- 控制：`色彩`（segmented：彩色／黑白）、`頁數`（range 16–1312，step 2，預設 128，旁邊顯示數值可直接輸入的 number）、`本數`（range 10–2000，step 2，預設 10，同樣可輸入）
- 結果：`預估價格區間`／`NT$ {lo} – {hi}`（tabular-nums，大字 `--t-h2`）
- 公式（與舊站完全一致）：`每面單價` 彩色 `[1, 1.8]`、黑白 `[0.25, 0.35]`；`lo/hi = round((頁數 × 單價 + 25) × 本數)`
- 註：`此為線上速算僅供參考。彩色每面 NT$1–1.8，黑白每面 NT$0.25–0.35，每本加計 25 元成書費。完成詳細需求後，我們將於 1 個工作日內提供正式報價單。`
- 按鈕 `帶入詢價`：把頁數、本數、色數填進表單的規格區（展開 `<details>`）並 focus 需求描述。

**FAQ**（`FaqList`，FAQPage schema）：
- `沒有檔案也可以詢價嗎？`／`可以。先說用途、數量與大概的規格，我們回覆時會告訴你需要準備什麼。`
- `最少可以印幾本？`／`數位印刷 2 本起印，教科書 10 冊起。`
- `報價要多久？`／`完成詳細需求後，1 個工作日內提供正式報價單。`
- `可以先看樣書嗎？`／`可以。需要時我們提供實體樣書與校色印樣。`
- `檔案怎麼給你們？`／`回覆時我們會告訴你檔案提供方式；完稿請以 PDF 為主。`
- `交期多久？`／`依規格與數量不同，報價時一併確認。`

右欄底部 `直接聯絡`：電話（`tel:`）、Email、營業時間。

### 5.6 聯絡我們 `/contact/`

- H1：`聯絡倚樂。`
- 兩欄：左 `ContactBlock`（地址、電話、Email、營業時間）+ `詢價` primary + 說明 `詢價請用表單，內容會整理得比較完整；急件直接來電。`；右 Google Maps iframe（`loading="lazy"`，`title="倚樂企業位置地圖"`，比例 4:3，`https://www.google.com/maps?q=新北市中和區中山路二段530號&output=embed`），下方文字連結 `在 Google 地圖開啟 →`（`https://www.google.com/maps/search/?api=1&query=新北市中和區中山路二段530號`）。
- 無 `ContactCta`。

### 5.7 404

- H1：`找不到這一頁。`
- 文：`可能是網址打錯，或這一頁已經搬家。`
- 連結：`回首頁`、`印刷服務`、`詢價`。

## 6. 互動：`ProcessScroller`（使用者要求的「往下滑、圖會動」）

只有這一個 scroll-driven 序列；其餘動畫限於 hover／focus 與 `FaqList` 展開。

**結構**（桌機）：區塊高度 = `5 × 100vh`（每步一個 viewport）。內部 grid 兩欄：左欄 `position: sticky; top: 64px; height: calc(100vh - 64px)` 放 SVG 舞台；右欄放五個 `Step`，每個 `min-height: 100vh`，垂直置中文字。**手機**：舞台 sticky 在頂端（`top: 56px`，高 `42vh`，背景 `--paper-2`），步驟在下方依序捲動，每步 `min-height: 58vh`。

**驅動**：`src/scripts/process-scroller.ts`（無依賴）：
- 用 `IntersectionObserver` 決定目前步驟（`data-stage` = 0–4，各 `Step` 進入 viewport 中線時切換），並用 `scroll` 事件（`passive`，`requestAnimationFrame` 節流）計算整段進度 `--p`（0–1）與步驟內進度 `--sp`（0–1），寫在容器 style 上。
- `prefers-reduced-motion: reduce`：不綁事件，`data-stage="4"`，舞台顯示最終狀態，右欄步驟正常排版（不 sticky、`min-height: auto`）。
- 不支援 sticky／JS 關閉：舞台正常排在步驟前，顯示最終狀態。

**舞台 SVG**（單一 inline SVG，`viewBox 0 0 640 480`，群組以 `data-layer` 命名，全部用 CSS `transform`／`opacity` 過渡，`transition: transform var(--dur-3) var(--ease), opacity var(--dur-3)`）：

| stage | 標題 | 畫面目標狀態 |
| --- | --- | --- |
| 0 說明需求 | 一張紙（白矩形 360×270，帶四角裁切線）置中；紙上出現一張「工單」：4 行 mono 文字（`品項：教材`／`頁數：120`／`紙張：道林 80g`／`裝訂：膠裝`），逐行出現（用 `--sp` 控制 opacity 門檻 .2/.4/.6/.8） |
| 1 確認規格與報價 | 工單縮到紙張左上角成小標籤；紙上畫出版面框線（灰線的文字塊示意），右下角出現印章式的紅色小方塊寫 `OK` |
| 2 打樣校色 | **CMYK 對位**：四個色層（各是同一個簡化圖形：一個大字塊 + 色帶，`fill` 分別 `--c` `--m` `--y` `--k`，`mix-blend-mode: multiply`）從偏移位置（C 向左上 18px、M 右上、Y 左下、K 右下，opacity 0）依 `--sp` 連續移回原位並淡入；`--sp` = 1 時完全對齊。左下角四個小圓點 C/M/Y/K 依序點亮 |
| 3 製版、印製、裝訂 | 對位好的紙張複製成一疊（後方兩張偏移 6px／12px，opacity .6/.35），接著整疊在右側「收攏」成書：出現書脊矩形（寬 22px，`--ink`）與封面（帶紅色色帶），紙疊 opacity 淡出 |
| 4 品檢與出貨 | 書本置中略放大 1.04；書上方出現 mono 標籤 `檢驗 ✓`；裁切線淡出；下方出現一條細線與文字 `出貨` |

所有轉場只用 transform／opacity；SVG 不超過 12KB；不使用外部圖片。

## 7. 資料層（`src/data/`，TypeScript，單一事實來源）

- `company.ts`：名稱、英文名、成立年、地址（含結構化欄位）、電話（顯示用 `02-2226-5720`、`tel:+886222265720`）、Email、營業時間（`Mo-Fr 09:00-22:00`）、GSC 驗證碼、網址。
- `needs.ts`：首頁區 2 六張卡。
- `methods.ts`：技術層六列與設備 tag。
- `services.ts`：五個服務內頁的完整內容（§5.3）。
- `specSheets.ts`：四張規格卡。
- `papers.ts`、`bindings.ts`、`finishing.ts`：表單選項（§5.5 的列表）。
- `faq.ts`：各頁 FAQ。
- `process.ts`：五步。
- `estimator.ts`：公式常數（`COLOR_RATE=[1,1.8]`、`BW_RATE=[0.25,0.35]`、`BOOK_FEE=25`、`PAGES=[16,1312,2]`、`QTY=[10,2000,2]`）。

任何頁面文字不得硬寫在 `.astro` 內超過一次；共用文案從 data 取。

## 8. SEO

- `Seo` 元件輸出：`<title>`、`meta description`、`link canonical`（絕對網址，`/` 結尾）、`og:title/description/type/url/site_name/locale=zh_TW/image`、`twitter:card=summary_large_image`、`meta name="google-site-verification"`（值照舊）。
- `og:image`：`public/og.png` 1200×630（由 `scripts/og.mjs` 用 Playwright 對 `/og-template/` 截圖產生；模板：紙色底、左上 logo 字標、中央 H1 `教科書、書籍與少量印刷，從製版到裝訂，一次做好。`、下方一行 `倚樂企業有限公司　新北中和　自 2009 年`；`/og-template/` 以 `noindex` 且不進 sitemap）。
- JSON-LD：
  - 全站 `Organization` + `LocalBusiness`（`name`、`alternateName`、`url`、`logo`、`telephone: +886-2-2226-5720`、`email`、`address`（PostalAddress：`streetAddress: 中山路二段 530 號 4 樓之一`、`addressLocality: 中和區`、`addressRegion: 新北市`、`postalCode` 不填、`addressCountry: TW`）、`foundingDate: 2009`、`openingHoursSpecification` Mo–Fr 09:00–22:00、`areaServed: TW`）。
  - `WebSite`（首頁）。
  - 每個服務頁 `Service`（`serviceType`、`provider` 指向 Organization、`areaServed`）+ `BreadcrumbList`。
  - `/quote/` 與服務頁 `FAQPage`。
- `@astrojs/sitemap` 產生 `sitemap-index.xml` + `sitemap-0.xml`，排除 `/og-template/` 與 `/404/`；`public/robots.txt`：`User-agent: *`、`Allow: /`、`Sitemap: https://yihappy.com.tw/sitemap-index.xml`。
- 語義：每頁一個 `h1`，區塊 `h2`，卡片 `h3`；`<main id="main">`、`<nav aria-label="主選單">`、`<footer>`；圖片皆有 `alt`（裝飾 SVG 用 `aria-hidden="true"`）。
- 不放 keywords meta；不做 keyword stuffing。

## 9. 無障礙

- 鍵盤：所有互動元件可 Tab 到達，順序合理；`MobileMenu` focus trap；`FaqList` 用原生 `details`。
- Focus：`:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px }`；紅底按鈕用紙色 outline。
- 對比：正文 `--ink` on `--paper` ≥ 12:1；`--ink-3` on `--paper` ≥ 4.5:1；`--red` 白字 ≥ 4.5:1（`#CC0029` 對白 5.9:1）；mono 標籤不得小於 12px。
- 表單：每個欄位 `<label for>`；錯誤訊息 `role="alert"` 區塊 + 欄位 `aria-describedby`；必填以文字「必填」標示，不只靠星號顏色。
- 動態：`prefers-reduced-motion: reduce` 時關閉所有 transition／sticky 序列；`html { scroll-behavior: smooth }` 只在非 reduced-motion 啟用。
- 點擊區域 ≥ 44×44；行動版導覽按鈕 48×48。
- axe（`@axe-core/playwright`）每頁 0 個 serious／critical。

## 10. 效能

- 靜態輸出；每頁 JS ≤ 15KB（gzip）；只有 `MobileMenu`、`ProcessScroller`（首頁）、`QuoteForm`＋`Estimator`（詢價頁）三個 script，皆以 `<script>`（Astro 打包、`type="module"`）載入，無框架。
- 字型：subset woff2 ×3（目標每個 ≤ 180KB）+ mono ×2；`preload` 400 與 700；`font-display: swap`；用 `size-adjust` 的 fallback `@font-face`（`local("PingFang TC")`）減少 CLS。
- 圖片：logo SVG inline；PNG logo 經 Astro `<Image>` 轉 webp 並指定寬高；OG 為 PNG。
- 無外部請求，除了 `/contact/` 的 Google Maps iframe（lazy）。
- 目標 Lighthouse（mobile）：Performance ≥ 95、Accessibility 100、Best Practices ≥ 95、SEO 100；CLS < 0.05；LCP < 2.0s（模擬 4G）。

## 11. 技術規格

### 11.1 Stack
- Astro（最新 7.x）、TypeScript strict、純 CSS（scoped `<style>` + `src/styles/{tokens,base,utilities}.css`），不用 Tailwind、不用 UI library。
- Node 22（`.nvmrc`＝`22`）；`package.json` scripts：
  - `dev`、`build`（`astro build`）、`preview`
  - `fonts`（產生 subset 字型）、`check:fonts`（驗證字元覆蓋）
  - `og`（產生 og.png）
  - `test:build`（`astro check` + `astro build`）、`test:links`（dist 內部連結／錨點／資產檢查）、`test:a11y`（Playwright + axe 每頁）、`test:screens`（截圖 375／390／768／1280／1440 每頁到 `qa/screenshots/`）、`test:html`（`html-validate` dist）
  - `test`＝`check:fonts` → `test:build` → `test:links` → `test:html` → `test:a11y`
  - `lighthouse`（本機對 preview 跑 mobile 設定，輸出 `qa/lighthouse/*.json|html`）

### 11.2 目錄
```
astro.config.mjs  package.json  tsconfig.json  .nvmrc  .gitignore  README.md
public/            CNAME  robots.txt  favicon.svg  favicon.ico  apple-touch-icon.png  og.png  fonts/  .nojekyll
src/
  assets/          logo-full.png  logo-mark.svg
  components/      (依 §3.3)
  data/            (依 §7)
  layouts/         Base.astro  ServiceLayout.astro
  pages/           index.astro  about.astro  quote.astro  contact.astro  404.astro  og-template.astro  services/index.astro  services/[slug].astro
  scripts/         mobile-menu.ts  process-scroller.ts  quote-form.ts  estimator.ts
  styles/          tokens.css  base.css  utilities.css
scripts/           fonts.mjs  check-fonts.mjs  og.mjs  links.mjs  screens.mjs  a11y.mjs  lighthouse.mjs
qa/                screenshots/  lighthouse/  (gitignored except README)
legacy-site/       舊站完整檔案（rollback 用）
docs/              01-audit.md  02-design-spec.md  03-deployment.md  04-qa-report.md
.github/workflows/ ci.yml  deploy.yml
```

### 11.3 CI／Deploy
- `ci.yml`：`pull_request` 與 `push`（非 main）→ `npm ci` → `npx playwright install-deps` 不需要（runner 自帶）→ `npm test`；上傳 `qa/screenshots` 為 artifact。
- `deploy.yml`：`push` 到 `main` + `workflow_dispatch`（input `target`: `site`（預設）| `legacy`）→ `site`：`npm ci && npm run build` → `actions/upload-pages-artifact`（path `dist`）→ `actions/deploy-pages`；`legacy`：直接上傳 `legacy-site/` 為 artifact 部署（rollback）。`permissions: pages: write, id-token: write`；`concurrency: group: pages`。
- `public/CNAME`＝`yihappy.com.tw`；`public/.nojekyll`。

### 11.4 字型管線（`scripts/fonts.mjs`，以 build 輸出為準）
1. `npm run fonts`：先 `astro build`（用目前已有的字型檔），再掃描 `dist/**/*.html`（用 `node-html-parser`），收集三組字元：
   - `w700`：`h1, h2, h3, h4, .t-display, [data-font="700"]` 內的文字。
   - `w500`：`nav, button, .btn, label, summary, strong, b, dt, th, .tag, .eyebrow, [data-font="500"]` 內的文字。
   - `w400`：頁面全部文字。
   每組再加上 ASCII 32–126、全形標點「，。、；：？！「」『』（）《》〈〉—…・‧·×–－％」、`NT$`、`✓`、`→`、`©`、`｜`、`　`。
2. 從 `https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf` 下載變體字型到 `.cache/fonts/NotoSansTC.ttf`（已存在則跳過），並核對 sha256 `864727d210d54f2537bbe23b3a839436c3992af72de9322af5270897246bd44f`（不符則只警告、不中止，並印出新 hash 方便更新）。
3. 用 `subset-font`（`variationAxes: { wght: N }`，`targetFormat: 'woff2'`）輸出 `public/fonts/noto-sans-tc-{400,500,700}.woff2`；寫 `public/fonts/glyphs.json`（`{ "400": [...chars], "500": [...], "700": [...] }`，排序）。印出每個檔案大小。
4. `npm run check:fonts`（在 `astro build` 之後執行）：重新掃描 `dist`，與 `glyphs.json` 比對；任一組有缺字就列出並以非零結束（訊息：`字型缺少 N 個字元（wght 700）：…，請執行 npm run fonts`）。
5. CSS：`@font-face` 三組 weight 對應三個檔案；`h1–h4` 用 700、`nav/button/label/strong/dt/th/summary/.tag/.eyebrow` 用 500、其餘 400。**禁止**在其他元素上使用 500／700 以外的字重，也不得對未列入 `w700`／`w500` 選擇器的元素設定粗體（否則會落到 fallback 字型）。
6. 三個 woff2 與 `glyphs.json` 納入版控；`.cache/` 與 `dist/` 不納入。
7. `IBM Plex Mono`：把 `@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-{400,500}-normal.woff2` 複製到 `public/fonts/`（由 `fonts.mjs` 一併處理），`@font-face` 只宣告 latin `unicode-range`。

### 11.5 Legacy 相容
- 首頁 id：`products`、`process`、`why`、`about`、`contact`。
- `www.yihappy.com.tw` → apex 301 由 GitHub Pages 處理（既有）。
- GSC meta 保留。

## 12. 驗收標準（全部必須通過才算完成）

1. `npm test` 全綠（build、check、links、html、a11y）。
2. 五個寬度（375／390／768／1280／1440）每頁截圖：無水平捲動、無重疊、無被截斷的文字、CTA 可見。
3. 首頁 5 秒測試：Hero 可見範圍內（375 寬第一屏）看得到 H1 與 `詢價` 按鈕。
4. 詢價表單：空白送出顯示錯誤並 focus；只填電話或只填 Email 皆可送出；送出後顯示內容預覽與複製鈕；`mailto` 連結內容正確編碼。
5. 手機選單：開關、Esc、focus trap、背景鎖定；連結可達每一頁。
6. `ProcessScroller`：桌機捲動時舞台依步驟變化；手機舞台 sticky；`prefers-reduced-motion` 時無動畫且內容完整；JS 關閉時內容完整。
7. Lighthouse mobile 首頁與詢價頁達 §10 目標。
8. `dist/` 內：每頁唯一 `h1`、title／description 唯一、canonical 正確、sitemap 含 9 個 URL（不含 og-template／404）、robots 正確、`google-site-verification` 存在於每頁。
9. 公司資訊逐字核對 `docs/01-audit.md` §4.1；不得出現 §4.2 未核准寫法（「24」「0.3%」「圓背」「布面」「書匣」「職人」「收藏級」）。
10. 沒有 console error／warning（Playwright 收集）。
11. 每頁 JS ≤ 15KB gzip；字型三檔合計 ≤ 540KB。
12. `legacy-site/` 完整、`docs/03-deployment.md` 含 rollback 步驟與 production commit。
