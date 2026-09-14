import type { PageMeta } from './types';

// §2 Sitemap：每頁的 URL、title（≤ 60 字元）與 description
export const pageMeta = {
  home: {
    path: '/',
    title: '倚樂企業有限公司｜教科書、書籍與少量印刷，從製版到裝訂',
    description:
      '新北中和的印刷公司，自 2009 年。自有 CTP 製版、數位印刷、黑白輪轉與裝訂加工設備，教科書、書籍、手冊、少量印刷到大圖輸出，一個窗口負責到底。',
  },
  services: {
    path: '/services/',
    title: '印刷服務｜倚樂企業有限公司',
    description:
      '用你要印的東西來找：教科書教材、書籍手冊、少量樣書、卡片 DM、大圖輸出、CTP 製版。每一項都說明用什麼設備與方式製作。',
  },
  books: {
    path: '/services/books/',
    title: '教科書、書籍與手冊印刷｜倚樂',
    description:
      '教科書與教材內頁黑白輪轉大量印製，少量書籍數位印刷 2 本起印；膠裝、線膠裝、騎馬釘、平釘，封面上光上霧。',
  },
  printOnDemand: {
    path: '/services/print-on-demand/',
    title: '依需印刷 POD、少量印刷與卡片 DM｜倚樂',
    description:
      '2 本起印的樣書、提案書、少量書籍，以及卡片、DM、書封（折封口／不折封口）；Canon 彩色雷射、Kyocera 彩色噴墨、Ricoh 黑白雷射。',
  },
  ctp: {
    path: '/services/ctp/',
    title: 'CTP 製版與數位打樣｜倚樂',
    description:
      '提供印刷同業與設計公司 CTP 出版、多種板材尺寸、底片與出版打樣大圖；平版印刷與協力廠配合，由倚樂統籌。',
  },
  largeFormat: {
    path: '/services/large-format/',
    title: '大圖輸出、數位直噴｜倚樂',
    description: '海報、展示與看板用大圖，大圖機數位直噴輸出；可搭配裁切與後加工。',
  },
  finishing: {
    path: '/services/finishing/',
    title: '裝訂與後加工｜倚樂',
    description:
      '膠裝、線膠裝、騎馬釘、平釘、摺紙、上光上霧、覆膜、局部光、裁切、收縮膜包裝、裝箱與配送。',
  },
  about: {
    path: '/about/',
    title: '關於倚樂｜新北中和的印刷公司，自 2009 年',
    description:
      '倚樂企業有限公司 2009 年於新北中和成立，專注教科書與書籍印刷。自有數位印刷、黑白輪轉、CTP 製版與裝訂加工設備，一個窗口把案子做到出貨。',
  },
  quote: {
    path: '/quote/',
    title: '詢價｜告訴我們你要印什麼',
    description:
      '不確定規格也可以送出。填好用途與大概數量，我們在 1 個工作日內回覆需要確認的問題；也可以直接來電 02-2226-5720。',
  },
  contact: {
    path: '/contact/',
    title: '聯絡倚樂｜電話、地址、營業時間',
    description:
      '倚樂企業有限公司，新北市中和區中山路二段 530 號 4 樓之一。電話 02-2226-5720，週一至週五 09:00–22:00。',
  },
  notFound: {
    path: '/404.html',
    title: '找不到這一頁｜倚樂',
    // §2 未指定 404 的 description（—）；Seo 每頁必填，這裡沿用 404 內文。
    description: '可能是網址打錯，或這一頁已經搬家。',
  },
} as const satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pageMeta;
