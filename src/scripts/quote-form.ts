// 詢價表單（§5.5）：驗證 → 組合純文字 → mailto → 切到「已整理好內容」狀態（不換頁）→ 複製／重新編輯。
// 無依賴；文案都在 DOM（data-* 與 hidden 元素），這裡不帶文字。由 quote.astro 的 <script> 呼叫。

export type ColorMode = 'color' | 'bw';

export interface QuoteSpecs {
  pages: number;
  qty: number;
  mode: ColorMode;
}

export interface QuoteFormApi {
  /** 快速試算「帶入詢價」：寫入頁數／本數／色數、展開規格區、focus 需求描述 */
  apply(specs: QuoteSpecs): void;
}

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** mailto 連結超過這個長度時提示可能被郵件程式截斷 */
const MAILTO_LIMIT = 1800;
/** 同一行的規格欄位之間的分隔（全形空白） */
const SEP = '　';

export function initQuoteForm(): QuoteFormApi | null {
  const root = document.querySelector<HTMLElement>('[data-quote]');
  const form = root?.querySelector<HTMLFormElement>('[data-qf-form]');
  if (!root || !form) return null;

  const $ = <T extends HTMLElement>(sel: string, from: ParentNode = root): T | null => from.querySelector<T>(sel);
  const alert = $<HTMLElement>('[data-qf-alert]', form);
  const alertList = $<HTMLUListElement>('[data-qf-alert-list]', form);
  const specs = $<HTMLDetailsElement>('[data-qf-specs]', form);
  const done = $<HTMLElement>('[data-qf-done]');
  const banner = $<HTMLElement>('[data-qf-banner]');
  const warn = $<HTMLElement>('[data-qf-warn]');
  const preview = $<HTMLPreElement>('[data-qf-preview]');
  const mailLink = $<HTMLAnchorElement>('[data-qf-mail]');
  const copyBtn = $<HTMLButtonElement>('[data-qf-copy]');
  const copyLabel = $<HTMLElement>('[data-qf-copy-label]');
  const copiedText = $<HTMLElement>('[data-qf-copied]')?.textContent?.trim() ?? '';
  const editBtn = $<HTMLButtonElement>('[data-qf-edit]');
  if (!alert || !alertList || !done || !banner || !warn || !preview || !mailLink) return null;

  const d = form.dataset;
  const mailto = d.mailto ?? '';
  const empty = d.empty ?? '—';

  // 有 JS 就自己驗證（錯誤訊息、focus 第一個錯誤欄位）
  form.noValidate = true;

  const control = (name: string): Control | null => form.querySelector<Control>(`[name="${name}"]`);
  const value = (name: string): string => control(name)?.value.trim() ?? '';
  const checked = (name: string): string[] =>
    Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)).map((el) => el.value);
  const label = (key: string): string => form.querySelector<HTMLElement>(`[data-field="${key}"]`)?.dataset.label ?? key;

  /* ---------- 驗證 ---------- */

  interface Problem {
    el: Control;
    errorId: string;
  }

  const describedBy = new Map<Control, string>();
  const rememberDescribedBy = (el: Control): string => {
    if (!describedBy.has(el)) describedBy.set(el, el.getAttribute('aria-describedby') ?? '');
    return describedBy.get(el) ?? '';
  };

  const clearError = (el: Control): void => {
    if (!el.hasAttribute('aria-invalid')) return;
    el.removeAttribute('aria-invalid');
    const base = rememberDescribedBy(el);
    if (base) el.setAttribute('aria-describedby', base);
    else el.removeAttribute('aria-describedby');
  };

  const showError = ({ el, errorId }: Problem): void => {
    const base = rememberDescribedBy(el);
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', base ? `${base} ${errorId}` : errorId);
    const msg = document.getElementById(errorId);
    if (msg) msg.hidden = false;
  };

  const hideErrors = (): void => {
    for (const el of form.querySelectorAll<Control>('[aria-invalid="true"]')) clearError(el);
    for (const msg of form.querySelectorAll<HTMLElement>('[id$="-error"]')) msg.hidden = true;
    alert.hidden = true;
    alertList.textContent = '';
  };

  const validate = (): boolean => {
    hideErrors();
    const problems: Problem[] = [];
    const name = control('name');
    const phone = control('phone');
    const email = control('email') as HTMLInputElement | null;
    const brief = control('brief');
    if (name && !value('name')) problems.push({ el: name, errorId: 'f-name-error' });
    if (phone && email) {
      if (!value('phone') && !value('email')) {
        problems.push({ el: phone, errorId: 'f-contact-error' }, { el: email, errorId: 'f-contact-error' });
      } else if (value('email') && !email.validity.valid) {
        problems.push({ el: email, errorId: 'f-email-error' });
      }
    }
    if (brief && !value('brief')) problems.push({ el: brief, errorId: 'f-brief-error' });
    if (problems.length === 0) return true;

    const listed = new Set<string>();
    for (const p of problems) {
      showError(p);
      if (listed.has(p.errorId)) continue;
      listed.add(p.errorId);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${p.el.id}`;
      a.textContent = document.getElementById(p.errorId)?.textContent?.trim() ?? '';
      a.addEventListener('click', (event) => {
        event.preventDefault();
        p.el.focus();
      });
      li.append(a);
      alertList.append(li);
    }
    alert.hidden = false;
    problems[0]?.el.focus();
    return false;
  };

  // 使用者修改過的欄位先把錯誤拿掉（共用同一則錯誤的電話／Email 一起清）；摘要對應的項目移除，清空時摘要收起
  form.addEventListener('input', (event) => {
    const el = event.target as Control | null;
    if (!el || !el.hasAttribute('aria-invalid')) return;
    const ids = (el.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => id.endsWith('-error'));
    const cleared = new Set<Control>([el]);
    for (const id of ids) {
      for (const other of form.querySelectorAll<Control>(`[aria-describedby~="${id}"]`)) cleared.add(other);
      const msg = document.getElementById(id);
      if (msg) msg.hidden = true;
    }
    for (const item of cleared) {
      clearError(item);
      alertList.querySelector(`a[href="#${item.id}"]`)?.parentElement?.remove();
    }
    if (!alertList.firstChild) alert.hidden = true;
  });

  /* ---------- 組合純文字（§5.5 格式） ---------- */

  const pair = (key: string, val: string): string => (val ? `${label(key)}：${val}` : '');
  const row = (...parts: string[]): string => parts.filter(Boolean).join(SEP);

  const compose = (): { subject: string; body: string } => {
    const category = checked('category')[0] || d.categoryDefault || '';
    const name = value('name');
    const lines = [
      `${d.headingPrefix ?? ''}${category}`,
      `${label('name')}：${name}`,
      `${label('org')}：${value('org') || empty}`,
      `${label('phone')}：${value('phone') || empty}`,
      `${label('email')}：${value('email') || empty}`,
      '',
      `${label('brief')}：`,
      value('brief'),
    ];
    const specLines = [
      row(pair('qty', value('qty')), pair('size', value('size')), pair('pages', value('pages'))),
      row(pair('color', checked('color')[0] ?? '')),
      row(pair('innerPaper', value('innerPaper')), pair('coverPaper', value('coverPaper'))),
      row(pair('binding', value('binding')), pair('finishing', checked('finishing[]').join('、'))),
      row(pair('due', value('due')), pair('files', checked('files')[0] ?? '')),
    ].filter(Boolean);
    if (specLines.length > 0) lines.push('', d.divider ?? '', ...specLines);
    lines.push('', d.footer ?? '');
    return { subject: `${d.subjectPrefix ?? ''}${category}｜${name}`, body: lines.join('\n') };
  };

  /* ---------- 送出 ---------- */

  const showForm = (): void => {
    done.hidden = true;
    form.hidden = false;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;
    const { subject, body } = compose();
    const href = `mailto:${mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    preview.textContent = body;
    mailLink.href = href;
    warn.hidden = href.length <= MAILTO_LIMIT;
    form.hidden = true;
    done.hidden = false;
    banner.focus();
    // 可取消的事件：測試（或分析）可以攔下 mailto 導向
    const proceed = form.dispatchEvent(
      new CustomEvent('quote:submit', { bubbles: true, cancelable: true, detail: { href, subject, body } }),
    );
    if (proceed) window.location.href = href;
  });

  /* ---------- 複製／重新編輯 ---------- */

  let copiedTimer = 0;
  const flashCopied = (): void => {
    if (!copyLabel || !copiedText) return;
    const original = copyLabel.dataset.original ?? (copyLabel.dataset.original = copyLabel.textContent ?? '');
    copyLabel.textContent = copiedText;
    window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => {
      copyLabel.textContent = original;
    }, 2500);
  };

  const selectPreview = (): boolean => {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  };

  copyBtn?.addEventListener('click', async () => {
    const text = preview.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      flashCopied();
    } catch {
      // 沒有 clipboard 權限：選取文字（execCommand 成功也算複製）
      if (selectPreview()) flashCopied();
    }
  });

  editBtn?.addEventListener('click', () => {
    showForm();
    form.focus();
  });

  /* ---------- 帶入詢價 ---------- */

  return {
    apply({ pages, qty, mode }) {
      showForm();
      const pagesEl = control('pages');
      const qtyEl = control('qty');
      if (pagesEl) pagesEl.value = String(pages);
      if (qtyEl) qtyEl.value = String(qty);
      const radio = form.querySelector<HTMLInputElement>(`input[name="color"][data-mode="${mode}"]`);
      if (radio) radio.checked = true;
      if (specs) specs.open = true;
      const brief = control('brief');
      if (brief) {
        brief.focus({ preventScroll: true });
        brief.scrollIntoView({ block: 'center' });
      }
    },
  };
}
