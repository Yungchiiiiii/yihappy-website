// Header 行為：捲動後底線 + 行動版選單（aria-expanded、role=dialog、focus trap、Esc、背景鎖定）
// 無依賴；由 Header.astro 的 <script> 呼叫。

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 捲動後在 header 加上 data-scrolled（CSS 畫底線） */
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  let ticking = false;
  const update = (): void => {
    header.toggleAttribute('data-scrolled', window.scrollY > 4);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

export function initMobileMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel) return;

  const html = document.documentElement;
  const openLabel = toggle.getAttribute('aria-label') ?? '';
  const closeLabel = toggle.dataset.closeLabel ?? openLabel;
  const desktop = window.matchMedia('(min-width: 900px)');
  let open = false;

  const inertTargets = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>('main, footer, [data-menu-inert]'));

  const focusables = (): HTMLElement[] => [
    toggle,
    ...Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null),
  ];

  const setOpen = (next: boolean, restoreFocus = true): void => {
    if (next === open) return;
    open = next;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? closeLabel : openLabel);
    html.classList.toggle('is-menu-open', open);
    for (const el of inertTargets()) {
      if (open) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    }
    if (open) {
      panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const list = focusables();
    if (list.length === 0) return;
    const first = list[0]!;
    const last = list[list.length - 1]!;
    const active = document.activeElement as HTMLElement | null;
    const inside = active !== null && list.includes(active);
    if (event.shiftKey && (active === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  });

  // 點選單內連結：關閉（同頁錨點時才看得到差別）
  panel.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('a[href]')) setOpen(false, false);
  });

  // 放大到桌機寬度時收起
  desktop.addEventListener('change', (event: MediaQueryListEvent) => {
    if (event.matches) setOpen(false, false);
  });
}
