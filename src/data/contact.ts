import { pageMeta } from './pages';

// /contact/ 文案（§5.6）
export const contact = {
  ...pageMeta.contact,
  h1: '聯絡倚樂。',
  note: '詢價請用表單，內容會整理得比較完整；急件直接來電。',
  map: {
    title: '倚樂企業位置地圖',
    embedSrc: 'https://www.google.com/maps?q=新北市中和區中山路二段530號&output=embed',
    link: {
      label: '在 Google 地圖開啟',
      href: 'https://www.google.com/maps/search/?api=1&query=新北市中和區中山路二段530號',
    },
  },
} as const;
