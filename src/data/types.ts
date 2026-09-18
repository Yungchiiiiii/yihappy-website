// 共用型別（src/data 為全站文案與事實的單一來源，見 docs/02-design-spec.md §7）

export interface Link {
  label: string;
  href: string;
}

export interface PageMeta {
  path: string;
  title: string;
  description: string;
}

export type IconName = 'textbook' | 'book' | 'copies' | 'card' | 'poster' | 'plate';

export interface Need {
  id: string;
  title: string;
  summary: string;
  method: string;
  href: string;
  icon: IconName;
}

export interface Method {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface SpecSheetData {
  id: string;
  title: string;
  rows: SpecRow[];
  note: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  text: string;
}

/** 服務頁「怎麼做」一列：`name：detail`；沒有冒號的項目只有 name */
export interface HowItem {
  name: string;
  detail?: string;
}

export interface Service extends PageMeta {
  slug: string;
  /** §2 的頁面名稱，用於導覽、頁尾、麵包屑 */
  name: string;
  h1: string;
  lede: string;
  fit: string[];
  how: HowItem[];
  specs: SpecRow[];
  notes: string[];
  faq: FaqItem[];
}
