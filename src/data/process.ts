import type { ProcessStep } from './types';

// 首頁區 3 五步（§5.1）；/about/ 的流程列表共用
export const processSteps: ProcessStep[] = [
  {
    id: 'brief',
    title: '說明需求',
    text: '電話、Email 或詢價表單都可以。不確定規格沒關係，我們會問你需要的問題。',
  },
  {
    id: 'spec',
    title: '確認規格與報價',
    text: '尺寸、頁數、紙張、裝訂、數量、交期逐項確認。完成詳細需求後，1 個工作日內提供正式報價單。',
  },
  {
    id: 'proof',
    title: '打樣校色',
    text: '需要時提供實體樣書與校色印樣，色彩、紙張、裝幀先看過再印。',
  },
  {
    id: 'print',
    title: '製版、印製、裝訂',
    text: '依規格安排數位印刷或黑白輪轉，接著裝訂與後加工。',
  },
  {
    id: 'ship',
    title: '品檢與出貨',
    text: '出貨前逐冊檢驗。全台配送，海外物流可洽詢。',
  },
];

/** ProcessScroller 舞台用的文字（§6） */
export const processStage = {
  /** stage 0：工單四行 */
  workOrder: ['品項：教材', '頁數：120', '紙張：道林 80g', '裝訂：膠裝'],
  /** stage 1：印章 */
  stamp: 'OK',
  /** stage 2：色層點 */
  inks: ['C', 'M', 'Y', 'K'],
  /** stage 4 */
  inspected: '檢驗 ✓',
  shipped: '出貨',
} as const;
