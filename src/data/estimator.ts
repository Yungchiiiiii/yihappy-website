// 快速試算（§5.5）：公式與舊站完全一致
export const COLOR_RATE: readonly [number, number] = [1, 1.8];
export const BW_RATE: readonly [number, number] = [0.25, 0.35];
export const BOOK_FEE = 25;
/** [min, max, step] */
export const PAGES: readonly [number, number, number] = [16, 1312, 2];
/** [min, max, step] */
export const QTY: readonly [number, number, number] = [10, 2000, 2];
export const PAGES_DEFAULT = 128;
export const QTY_DEFAULT = 10;

export type ColorMode = 'color' | 'bw';

/** lo/hi = round((頁數 × 單價 + 25) × 本數) */
export function estimate(pages: number, qty: number, mode: ColorMode): { lo: number; hi: number } {
  const [rateLo, rateHi] = mode === 'color' ? COLOR_RATE : BW_RATE;
  return {
    lo: Math.round((pages * rateLo + BOOK_FEE) * qty),
    hi: Math.round((pages * rateHi + BOOK_FEE) * qty),
  };
}

export const estimatorCopy = {
  title: '書籍印刷快速試算（參考）',
  color: '色彩',
  colorOptions: [
    { value: 'color', label: '彩色' },
    { value: 'bw', label: '黑白' },
  ] as const,
  pages: '頁數',
  qty: '本數',
  result: '預估價格區間',
  currency: 'NT$',
  note: '此為線上速算僅供參考。彩色每面 NT$1–1.8，黑白每面 NT$0.25–0.35，每本加計 25 元成書費。完成詳細需求後，我們將於 1 個工作日內提供正式報價單。',
  apply: '帶入詢價',
  directContact: '直接聯絡',
} as const;
