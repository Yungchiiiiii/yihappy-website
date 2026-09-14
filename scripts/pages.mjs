// QA 腳本共用的頁面清單（screens／a11y／links／lighthouse）。
// Phase 2 補頁面時：把 plannedPages 內的路徑搬進 pages（name 用於截圖檔名）。

/** 已建立的頁面 */
export const pages = [
  { name: 'home', path: '/', lighthouse: true },
  { name: 'about', path: '/about/' },
  { name: 'contact', path: '/contact/' },
  { name: '404', path: '/404.html' },
];

/** 規劃中、尚未建立的頁面：links.mjs 對這些連結只警告不報錯（Phase 2 完成後應清空） */
export const plannedPages = [
  '/services/',
  '/services/books/',
  '/services/print-on-demand/',
  '/services/ctp/',
  '/services/large-format/',
  '/services/finishing/',
  '/quote/',
];

/** 截圖寬度（§11.1） */
export const widths = [375, 390, 768, 1280, 1440];
