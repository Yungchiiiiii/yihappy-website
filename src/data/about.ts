import { pageMeta } from './pages';

// /about/ 文案（§5.4）
export const about = {
  ...pageMeta.about,
  h1: '一間把書印好的印刷公司。',
  lede: '倚樂企業有限公司 2009 年在新北中和成立，從教科書與書籍印刷做起。',
  values: {
    title: '我們在意什麼',
    items: [
      {
        n: '01',
        title: '說清楚',
        text: '規格、價格、交期在動工前講明白。你不用懂印刷名詞，我們會用你聽得懂的方式問。',
      },
      {
        n: '02',
        title: '做得到',
        text: '設備在自己手上：數位印刷、黑白輪轉、CTP 製版、裝訂加工。承諾的，是我們自己做得到的。',
      },
      {
        n: '03',
        title: '價格實在',
        text: '中型自有產線，沒有中間加價。預算放在紙張、色彩與裝訂上。',
      },
    ],
  },
  process: {
    title: '從詢價到出貨，同一個窗口。',
  },
  equipment: {
    title: '廠內設備。',
    groups: [
      { label: '製版', value: '出版機（CTP）' },
      { label: '數位印刷', value: 'Canon 彩色雷射、Kyocera 彩色噴墨、彩色噴墨、Ricoh 黑白雷射' },
      { label: '輪轉印刷', value: '黑白輪轉機' },
      { label: '大圖', value: '大圖機' },
      { label: '裝訂與加工', value: '膠裝、線膠裝、騎馬釘、平釘、摺紙、上光上霧、覆膜、局部光、裁切、收縮膜包裝' },
      { label: '印前', value: '電腦室：檔案檢查、拼版' },
    ],
    note: '平版印刷與協力印刷廠配合，由倚樂統籌。',
  },
  location: {
    title: '地點',
    logoAlt: '倚樂企業有限公司 完整標誌',
  },
} as const;
