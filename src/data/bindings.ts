// 裝訂方式（詢價表單 select，§5.5）
export const bindings = ['膠裝', '線膠裝', '騎馬釘', '平釘'] as const;
export const bindingUnsure = '不確定';
export type Binding = (typeof bindings)[number];
