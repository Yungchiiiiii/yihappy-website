// 公司事實（只能使用 docs/01-audit.md §4.1 的內容）
export const company = {
  name: '倚樂企業有限公司',
  shortName: '倚樂',
  nameEn: 'Yi Happy Co., Ltd.',
  founded: 2009,
  url: 'https://yihappy.com.tw',
  domain: 'yihappy.com.tw',
  /** 所在地簡稱（文案用） */
  location: '新北中和',
  address: {
    full: '新北市中和區中山路二段 530 號 4 樓之一',
    streetAddress: '中山路二段 530 號 4 樓之一',
    addressLocality: '中和區',
    addressRegion: '新北市',
    addressCountry: 'TW',
  },
  phone: {
    display: '02-2226-5720',
    href: 'tel:+886222265720',
    /** schema.org telephone */
    international: '+886-2-2226-5720',
  },
  email: 'yihappy.dp@gmail.com',
  hours: {
    display: '週一至週五 09:00–22:00',
    /** schema.org openingHours 縮寫 */
    schema: 'Mo-Fr 09:00-22:00',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '22:00',
  },
  /** 回覆承諾 */
  reply: '1 個工作日內',
  /** Google Search Console 驗證碼（照舊站保留） */
  googleSiteVerification: '0uVWEFKhEAOmZFFGGEUCC6ubA3wS7F4Vp8mSKGQshFE',
  areaServed: 'TW',
} as const;

export type Company = typeof company;
