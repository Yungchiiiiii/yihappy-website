import { company } from './company';
import { pageMeta } from './pages';

// /quote/ 文案（§5.5）。表單邏輯在 src/scripts/quote-form.ts（Phase 2）。
export const quote = {
  ...pageMeta.quote,
  h1: '告訴我們你要印什麼。',
  lede: '不確定規格也可以送出。留下用途與大概數量，我們在 1 個工作日內回覆需要確認的問題。急的話直接來電 02-2226-5720。',
  mailto: company.email,
  /** subject：【倚樂詢價】{類別}｜{姓名} */
  subject: (category: string, name: string) => `【倚樂詢價】${category}｜${name}`,
  sections: {
    category: '你要印什麼',
    basics: '基本資料',
    specs: '我知道詳細規格（選填）',
  },
  categories: ['教科書・教材', '書籍・手冊', '少量樣書', '卡片・DM・書封', '大圖', 'CTP 製版', '其他／不確定'],
  fields: {
    name: { label: '姓名', required: true },
    org: { label: '公司／單位', required: false },
    phone: { label: '電話', required: false },
    email: { label: 'Email', required: false },
    contactHint: '電話或 Email 至少留一個',
    brief: {
      label: '需求描述',
      required: true,
      placeholder: '例如：國中數學講義，B5，約 120 頁，黑白，封面彩色，先印 30 本，希望月底前拿到。',
    },
    qty: { label: '數量' },
    size: { label: '成品尺寸', placeholder: 'A4、B5、或 21×29.7cm' },
    pages: { label: '頁數' },
    color: { label: '色數', options: ['黑白', '彩色', '黑白為主，部分彩色'] },
    innerPaper: { label: '內頁紙張' },
    coverPaper: { label: '封面紙張' },
    binding: { label: '裝訂' },
    finishing: { label: '加工' },
    due: { label: '希望交期' },
    files: { label: '檔案狀態', options: ['已有完稿', '需要設計協助', '還在規劃'] },
  },
  requiredMark: '必填',
  submit: '送出詢價',
  submitNote: '送出後會開啟你的郵件程式，內容已整理好，確認後寄出即可。',
  errors: {
    name: '請填寫姓名。',
    contact: '電話或 Email 至少留一個。',
    brief: '請描述你的需求。',
    email: '請確認 Email 格式。',
    summary: '有幾個欄位需要補上。',
  },
  success: {
    banner: '已開啟郵件程式。如果沒有自動開啟，請用下面的方式寄給我們。',
    copy: '複製內容',
    copied: '已複製',
    mail: '用 Email 寄出',
  },
  /** 送出內容的純文字格式（§5.5） */
  bodyTemplate: {
    heading: (category: string) => `倚樂詢價｜${category}`,
    specsDivider: '── 規格（有填才列） ──',
    footer: `（此內容由 ${company.domain} 詢價表單產生）`,
  },
  direct: {
    title: '直接聯絡',
  },
} as const;
