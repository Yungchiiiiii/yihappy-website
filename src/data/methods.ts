import type { Method } from './types';

// /services/ 區 B「我們怎麼做」技術層六列（§5.2）
export const methods: Method[] = [
  {
    id: 'digital',
    name: '數位印刷（依需印刷 POD）',
    description: '少量、急件、每本內容都一樣或不一樣都可以。內文、卡片、封面、DM。',
    tags: ['Canon 彩色雷射', 'Kyocera 彩色噴墨', 'Ricoh 黑白雷射', '彩色噴墨'],
  },
  {
    id: 'web-offset',
    name: '黑白輪轉印刷',
    description: '教科書、教材內頁的大量黑白印製。',
    tags: ['黑白輪轉機'],
  },
  {
    id: 'ctp',
    name: 'CTP 製版與傳統印刷',
    description:
      '出版機 CTP 出版，多種板材尺寸，底片與出版打樣大圖。平版印刷與協力印刷廠配合，由倚樂統籌品質與交期。',
    tags: ['出版機（CTP）'],
  },
  {
    id: 'large-format',
    name: '大圖輸出',
    description: '海報、展示與看板用大圖，數位直噴。',
    tags: ['大圖機'],
  },
  {
    id: 'finishing',
    name: '裝訂與後加工',
    description:
      '膠裝、線膠裝、騎馬釘、平釘、摺紙（對折、三折）、上光、上霧、亮膜、霧膜、局部光、裁切、收縮膜包裝、裝箱與配送。燙金、打凹、UV 等特殊加工，詢價時說明用途，我們評估做法。',
    tags: ['廠內加工'],
  },
  {
    id: 'prepress',
    name: '設計協助與印前',
    description: '檔案檢查、拼版、版面設計協助。沒有完稿也可以先談。',
    tags: ['電腦室'],
  },
];
