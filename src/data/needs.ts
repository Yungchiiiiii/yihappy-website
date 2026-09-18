import type { Need } from './types';

// 首頁區 2「我要印什麼」六張卡（也用於 /services/ 區 A）
export const needs: Need[] = [
  {
    id: 'textbooks',
    title: '教科書・教材',
    summary: '內頁黑白輪轉大量印製，封面彩色印刷、上光或上霧，膠裝或線膠裝。',
    method: '黑白輪轉 + 數位封面 + 膠裝／線膠裝',
    href: '/services/books/',
    icon: 'textbook',
  },
  {
    id: 'books',
    title: '書籍・手冊・型錄',
    summary: '平裝書、作品集、產品型錄與簡介。少量走數位印刷，大量另行安排。',
    method: '數位印刷／黑白輪轉 + 膠裝／騎馬釘',
    href: '/services/books/',
    icon: 'book',
  },
  {
    id: 'samples',
    title: '少量樣書・提案書',
    summary: '2 本起印。樣書、提案、試銷版，不用等大量開機。',
    method: 'Canon 彩色雷射・Ricoh 黑白雷射・Kyocera 彩色噴墨',
    href: '/services/print-on-demand/',
    icon: 'copies',
  },
  {
    id: 'cards',
    title: '卡片・DM・書封',
    summary: '名片、卡片、DM，以及書封（折封口或不折封口），可上膜與裁切。',
    method: '數位印刷 + 覆膜 + 裁切／摺紙',
    href: '/services/print-on-demand/',
    icon: 'card',
  },
  {
    id: 'large-format',
    title: '大圖輸出',
    summary: '海報、展示與看板用大圖，數位直噴。',
    method: '大圖機',
    href: '/services/large-format/',
    icon: 'poster',
  },
  {
    id: 'ctp',
    title: 'CTP 製版・打樣',
    summary: '給印刷同業與設計公司：CTP 出版、多種板材尺寸、底片、出版打樣大圖。',
    method: '出版機',
    href: '/services/ctp/',
    icon: 'plate',
  },
];

/** NeedCard 上「做法」一行的標籤 */
export const needMethodLabel = '做法';
