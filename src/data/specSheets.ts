import type { SpecSheetData } from './types';

// 首頁區 5「常見做法」四張規格卡（§5.1）
export const specSheets: SpecSheetData[] = [
  {
    id: 'textbook',
    title: '教科書・教材',
    rows: [
      { label: '內頁', value: '道林紙 70–80g，黑白輪轉' },
      { label: '封面', value: '銅西 250g，彩色，上霧膜' },
      { label: '裝訂', value: '膠裝或線膠裝' },
      { label: '數量', value: '大量' },
    ],
    note: '10 冊起',
  },
  {
    id: 'samples',
    title: '少量樣書',
    rows: [
      { label: '內頁', value: '日本上質紙 100g，數位黑白或彩色' },
      { label: '封面', value: '雪銅 250g，亮膜' },
      { label: '裝訂', value: '膠裝' },
      { label: '數量', value: '2 本起' },
    ],
    note: '適合提案、試銷',
  },
  {
    id: 'catalog',
    title: '型錄・手冊',
    rows: [
      { label: '內頁', value: '特銅 120g，彩色噴墨' },
      { label: '封面', value: '雪銅 200g，上光' },
      { label: '裝訂', value: '騎馬釘或膠裝' },
      { label: '數量', value: '少量到中量' },
    ],
    note: '可搭配摺頁',
  },
  {
    id: 'cards',
    title: '卡片・DM',
    rows: [
      { label: '紙張', value: '銅西 250g，彩色雷射' },
      { label: '加工', value: '上霧膜、裁切' },
      { label: '摺紙', value: '對折或三折' },
      { label: '數量', value: '少量起' },
    ],
    note: '書封可折封口',
  },
];
