// QA 腳本共用的頁面清單（screens／a11y／links／lighthouse）。
// Phase 2 補頁面時：把 plannedPages 內的路徑搬進 pages（name 用於截圖檔名）。

/** 已建立的頁面 */
export const pages = [
  { name: 'home', path: '/', lighthouse: true },
  { name: 'services', path: '/services/' },
  { name: 'services-books', path: '/services/books/' },
  { name: 'services-print-on-demand', path: '/services/print-on-demand/' },
  { name: 'services-ctp', path: '/services/ctp/' },
  { name: 'services-large-format', path: '/services/large-format/' },
  { name: 'services-finishing', path: '/services/finishing/' },
  { name: 'quote', path: '/quote/', lighthouse: true },
  { name: '404', path: '/404.html' },
];

/** 規劃中、尚未建立的頁面：links.mjs 對這些連結只警告不報錯（Phase 2 完成後應清空） */
export const plannedPages = ['/about/', '/contact/'];

/** 截圖寬度（§11.1） */
export const widths = [375, 390, 768, 1280, 1440];
