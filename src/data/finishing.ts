// 加工選項（詢價表單 checkbox，§5.5）
export const finishingOptions = [
  '上光',
  '上霧',
  '亮膜',
  '霧膜',
  '局部光',
  '摺紙',
  '裁切',
  '收縮膜包裝',
  '其他（燙金／打凹／UV 等）',
] as const;
export type FinishingOption = (typeof finishingOptions)[number];
