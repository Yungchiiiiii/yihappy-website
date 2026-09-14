import { company } from './company';

// 首頁文案（§5.1）。區 2 的卡片在 needs.ts，區 3 在 process.ts，區 5 在 specSheets.ts。

export const hero = {
  eyebrow: `${company.name}　${company.location}　自 ${company.founded} 年`,
  title: '教科書、書籍與少量印刷，從製版到裝訂，一次做好。',
  lede: '自有 CTP 製版、數位印刷、黑白輪轉與裝訂加工設備。幾本樣書到上萬本教材，先告訴我們你要印什麼，規格細節我們一起確認。',
  primary: { label: '詢價', href: '/quote/' },
  secondary: { label: '看我們能印什麼', href: '/services/' },
} as const;

/** Hero 下方事實條（4 格） */
export const facts = [
  { label: '起印量', value: '數位印刷 2 本起・教科書 10 冊起' },
  { label: '裝訂', value: '膠裝・線膠裝・騎馬釘・平釘' },
  { label: '設備', value: 'CTP・數位印刷・黑白輪轉・大圖' },
  { label: '回覆', value: '1 個工作日內' },
] as const;

/** 區 2 我要印什麼 */
export const productsSection = {
  id: 'products',
  eyebrow: '用需求找',
  title: '你要印的是哪一種？',
  lede: '不用先懂印刷名詞。每一項我們都說明用什麼方式做，點進去看細節，或直接詢價。',
  more: { label: '還是不確定？直接告訴我們你要做什麼', href: '/quote/' },
} as const;

/** 區 3 一張紙，怎麼變成一本書 */
export const processSection = {
  id: 'process',
  eyebrow: '製作流程',
  title: '一張紙，怎麼變成一本書。',
} as const;

/** 區 4 為什麼找倚樂 */
export const whySection = {
  id: 'why',
  title: '跟其他印刷廠不一樣的地方，不在口號，在做法。',
  items: [
    {
      n: '01',
      title: '設備在自己手上',
      text: '數位印刷、黑白輪轉、CTP 製版、裝訂加工都在中和廠區。少量與大量各有適合的機台，不用為了湊量而妥協。',
    },
    {
      n: '02',
      title: '一個窗口負責到底',
      text: '從報價、打樣、印製到出貨，由同一組人跟進。進度和問題直接說，不經層層轉手。',
    },
    {
      n: '03',
      title: '價格實在',
      text: '中型自有產線，沒有中間加價。預算放在紙張、色彩與裝訂上。',
    },
  ],
} as const;

/** 區 5 常見做法 */
export const specsSection = {
  eyebrow: '規格範例',
  title: '幾種常見做法。',
  lede: '實際規格依你的內容、數量與預算調整；這裡先讓你知道我們平常怎麼配。',
  more: { label: '需要別的配法？詢價時告訴我們用途就好', href: '/quote/' },
} as const;

/** 區 6 關於（摘要） */
export const aboutSection = {
  id: 'about',
  title: '2009 年起，在中和印書。',
  paragraphs: [
    '倚樂企業有限公司從教科書與書籍印刷做起。廠區在新北中和，自有數位印刷、黑白輪轉、CTP 製版與裝訂加工設備，從打樣到出貨在同一個地方完成。',
    '我們相信的事很簡單：把規格說清楚，把承諾的做到，把價格放實在。',
  ],
  more: { label: '認識倚樂', href: '/about/' },
} as const;
