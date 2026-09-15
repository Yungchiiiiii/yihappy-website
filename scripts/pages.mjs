// QA 腳本共用的頁面清單（screens／a11y／links／lighthouse）。
// 新增頁面時：把路徑加進 pages（name 用於截圖檔名）；links.mjs 會嚴格檢查所有站內連結。

/** 已建立的頁面 */
export const pages = [
  { name: 'home', path: '/', lighthouse: true },
  { name: 'services', path: '/services/' },
  { name: 'services-books', path: '/services/books/' },
  { name: 'services-print-on-demand', path: '/services/print-on-demand/' },
  { name: 'services-ctp', path: '/services/ctp/' },
  { name: 'services-large-format', path: '/services/large-format/' },
  { name: 'services-finishing', path: '/services/finishing/' },
  { name: 'about', path: '/about/' },
  { name: 'quote', path: '/quote/', lighthouse: true },
  { name: 'contact', path: '/contact/' },
  { name: '404', path: '/404.html' },
];

/** 規劃中、尚未建立的頁面：links.mjs 對這些連結只警告不報錯（目前沒有） */
export const plannedPages = [];

/** 截圖寬度（§11.1） */
export const widths = [375, 390, 768, 1280, 1440];
