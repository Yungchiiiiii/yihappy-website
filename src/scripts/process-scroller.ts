// 首頁「一張紙，怎麼變成一本書」scroll 序列（§6）。無依賴；由 ProcessScroller.astro 的 <script> 呼叫。
// - IntersectionObserver（rootMargin 把 root 縮成 viewport 中線）決定目前步驟 → 舞台 data-stage、步驟 is-active
// - scroll（passive + rAF 節流）計算步驟內進度 --sp（步驟頂端到中線 0 → 底端離開中線 1）與整段進度 --p
// - prefers-reduced-motion: reduce 或沒有 IntersectionObserver：不綁事件，保留伺服器端的最終狀態（data-stage="4"、--sp:1）
// scroll 期間只讀 getBoundingClientRect、只寫 CSS 變數與 data attribute。

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);
const round3 = (n: number): number => Math.round(n * 1000) / 1000;

export function initProcessScroller(): void {
  const root = document.querySelector<HTMLElement>('[data-process]');
  const stage = root?.querySelector<HTMLElement>('[data-process-stage]');
  if (!root || !stage) return;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  const last = steps.length - 1;
  if (last < 0) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  /** IntersectionObserver 決定的目前步驟；-1 = 中線不在任何步驟內（整段之前／之後） */
  let observed = -1;
  let shownStage = -1;
  let shownSp = -1;
  let shownP = -1;
  let ticking = false;

  const setStage = (index: number): void => {
    if (index === shownStage) return;
    shownStage = index;
    stage.dataset.stage = String(index);
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
  };

  const update = (): void => {
    ticking = false;
    const mid = window.innerHeight / 2;
    const first = steps[0]!.getBoundingClientRect();
    const end = last === 0 ? first : steps[last]!.getBoundingClientRect();

    let index = observed;
    if (index < 0) {
      if (mid < first.top) index = 0;
      else if (mid >= end.bottom) index = last;
      else index = steps.findIndex((step) => step.getBoundingClientRect().bottom > mid);
      if (index < 0) index = last;
    }
    const rect = index === 0 ? first : index === last ? end : steps[index]!.getBoundingClientRect();
    const sp = round3(clamp01((mid - rect.top) / rect.height));
    const p = round3(clamp01((mid - first.top) / (end.bottom - first.top)));

    setStage(index);
    if (sp !== shownSp) {
      shownSp = sp;
      stage.style.setProperty('--sp', String(sp));
    }
    if (p !== shownP) {
      shownP = p;
      stage.style.setProperty('--p', String(p));
    }
  };

  const schedule = (): void => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const index = steps.indexOf(entry.target as HTMLElement);
        if (entry.isIntersecting) observed = index;
        else if (index === observed) observed = -1;
      }
      update();
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
  );

  // 切到 scroll 版型（舞台 sticky、步驟 100vh），第一次套用狀態不做過渡
  root.classList.add('is-live');
  stage.classList.add('is-settling');
  update();
  void stage.offsetWidth;
  stage.classList.remove('is-settling');

  for (const step of steps) observer.observe(step);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}
