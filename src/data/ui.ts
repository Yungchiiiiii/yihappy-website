import { company } from './company';

// 全站共用的介面文字（導覽、CTA、頁尾、404 等）
export const ui = {
  skipLink: '跳到主要內容',
  nav: {
    label: '主選單',
    mobileLabel: '行動版選單',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
    items: [
      { label: '印刷服務', href: '/services/' },
      { label: '關於倚樂', href: '/about/' },
      { label: '聯絡我們', href: '/contact/' },
    ],
  },
  /** 全站唯一 primary CTA 文案：「詢價」；次要：「看我們能印什麼」「撥打 02-2226-5720」 */
  cta: {
    quote: { label: '詢價', href: '/quote/' },
    services: { label: '看我們能印什麼', href: '/services/' },
    call: { label: `撥打 ${company.phone.display}`, href: company.phone.href },
  },
  /** 首頁區 7／各頁尾前的 ContactCta */
  contactCta: {
    id: 'contact',
    title: '先把需求告訴我們。',
    text: '不確定規格也可以。留下用途與大概數量，我們在 1 個工作日內回覆。',
  },
  contact: {
    labels: {
      address: '地址',
      phone: '電話',
      email: 'Email',
      hours: '營業時間',
    },
  },
  footer: {
    tagline: '教科書、書籍與少量印刷，從製版到裝訂，一次做好。',
    servicesLabel: '印刷服務',
    servicesIndex: '印刷服務總覽',
    companyLabel: '公司',
    contactLabel: '聯絡',
    companyLinks: [
      { label: '關於倚樂', href: '/about/' },
      { label: '詢價', href: '/quote/' },
      { label: '聯絡我們', href: '/contact/' },
    ],
    copyright: (year: number) => `© ${company.founded}–${year} ${company.name}`,
  },
  breadcrumb: {
    label: '麵包屑',
    home: '首頁',
  },
  /** 服務內頁各區標題（§5.3） */
  service: {
    fit: '適合什麼情況',
    how: '怎麼做',
    specs: '規格選項',
    notes: '注意事項',
    faq: '常見問題',
  },
  notFound: {
    title: '找不到這一頁。',
    text: '可能是網址打錯，或這一頁已經搬家。',
    links: [
      { label: '回首頁', href: '/' },
      { label: '印刷服務', href: '/services/' },
      { label: '詢價', href: '/quote/' },
    ],
  },
} as const;
