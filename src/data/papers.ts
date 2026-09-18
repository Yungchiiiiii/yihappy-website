// 詢價表單的紙張選項（§5.5）；來源：docs/01-audit.md §4.1 紙張

export interface PaperGroup {
  name: string;
  weights: string[];
}

export const innerPaperGroups: PaperGroup[] = [
  { name: '道林紙', weights: ['70g', '75g', '80g', '120g', '150g'] },
  { name: '特銅', weights: ['120g', '200g'] },
  { name: '雪銅', weights: ['120g', '200g'] },
  { name: '日本上質紙', weights: ['80g', '100g', '120g'] },
];

export const coverPaperGroups: PaperGroup[] = [
  { name: '銅西', weights: ['200g', '250g'] },
  { name: '雪銅', weights: ['200g', '250g'] },
];

/** 兩個 select 的最後一個選項 */
export const paperUnsure = '不確定，請建議';

const flatten = (groups: PaperGroup[]): string[] =>
  groups.flatMap((g) => g.weights.map((w) => `${g.name} ${w}`));

/** 內頁紙張 select 選項（不含「不確定，請建議」） */
export const innerPapers: string[] = flatten(innerPaperGroups);
/** 封面紙張 select 選項（不含「不確定，請建議」） */
export const coverPapers: string[] = flatten(coverPaperGroups);
