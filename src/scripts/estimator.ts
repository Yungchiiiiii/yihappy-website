// 書籍印刷快速試算（§5.5）：range 與 number 同步、結果 NT$ lo – hi、帶入詢價；公式與常數只從 data/estimator.ts 讀。
// 外層 <details open>：手機（<900）初始化時收合、放大到桌機時展開。由 quote.astro 的 <script> 呼叫。
import { PAGES, QTY, estimate, type ColorMode } from '../data/estimator';

export interface EstimatorSpecs {
  pages: number;
  qty: number;
  mode: ColorMode;
}

interface Options {
  /** 「帶入詢價」：把目前的頁數／本數／色數交給詢價表單 */
  apply?: ((specs: EstimatorSpecs) => void) | undefined;
}

type Range = readonly [number, number, number];

/** 夾在 [min, max] 內並對齊 step；不是數字就用 min */
const clamp = (raw: number, [min, max, step]: Range): number => {
  if (!Number.isFinite(raw)) return min;
  const v = Math.min(max, Math.max(min, raw));
  return min + Math.round((v - min) / step) * step;
};

const fmt = (n: number): string => n.toLocaleString('en-US');

export function initEstimator({ apply }: Options = {}): void {
  const root = document.querySelector<HTMLDetailsElement>('[data-estimator]');
  if (!root) return;
  const pagesNum = root.querySelector<HTMLInputElement>('[data-est-number="pages"]');
  const pagesRange = root.querySelector<HTMLInputElement>('[data-est-range="pages"]');
  const qtyNum = root.querySelector<HTMLInputElement>('[data-est-number="qty"]');
  const qtyRange = root.querySelector<HTMLInputElement>('[data-est-range="qty"]');
  const output = root.querySelector<HTMLOutputElement>('[data-est-result]');
  const applyBtn = root.querySelector<HTMLButtonElement>('[data-est-apply]');
  if (!pagesNum || !pagesRange || !qtyNum || !qtyRange || !output) return;

  const currency = output.dataset.estCurrency ?? 'NT$';

  const mode = (): ColorMode =>
    root.querySelector<HTMLInputElement>('input[name="est-color"]:checked')?.value === 'bw' ? 'bw' : 'color';
  const read = (): EstimatorSpecs => ({
    pages: clamp(Number(pagesNum.value), PAGES),
    qty: clamp(Number(qtyNum.value), QTY),
    mode: mode(),
  });

  const render = (): void => {
    const { pages, qty, mode } = read();
    const { lo, hi } = estimate(pages, qty, mode);
    output.textContent = `${currency} ${fmt(lo)} – ${fmt(hi)}`;
  };

  // range → number 立即同步；number → range 邊打邊同步，離開欄位時把值夾回範圍
  const link = (range: HTMLInputElement, num: HTMLInputElement, limits: Range): void => {
    range.addEventListener('input', () => {
      num.value = range.value;
      render();
    });
    num.addEventListener('input', () => {
      range.value = String(clamp(Number(num.value), limits));
      render();
    });
    num.addEventListener('change', () => {
      num.value = range.value;
      render();
    });
  };
  link(pagesRange, pagesNum, PAGES);
  link(qtyRange, qtyNum, QTY);
  for (const radio of root.querySelectorAll<HTMLInputElement>('input[name="est-color"]')) {
    radio.addEventListener('change', render);
  }
  render();

  applyBtn?.addEventListener('click', () => apply?.(read()));

  // 手機預設收合、桌機永遠展開（summary 在桌機以 CSS 隱藏）
  const desktop = window.matchMedia('(min-width: 900px)');
  if (!desktop.matches) root.open = false;
  desktop.addEventListener('change', (event) => {
    if (event.matches) root.open = true;
  });
}
