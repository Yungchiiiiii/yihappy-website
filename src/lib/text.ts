/**
 * 中文標題斷行控制。
 * 中文沒有空白，瀏覽器可以在任兩個字之間換行，標題常常斷在詞中間（例如「裝／訂」）。
 * 把標題依標點切成片語，每個片語用 display:inline-block 的 <span class="ph"> 包起來，
 * 換行就只會發生在片語之間；片語比容器還寬時仍可在內部換行（inline-block 會 shrink-to-fit）。
 */
// U+200B（零寬空白）也視為片語邊界：文案裡可以用它指定沒有標點的斷行位置。
const BREAK_AFTER = /([，。、；：！？｜\u200B])/u;

export function splitPhrases(text: string): string[] {
  const parts = text.split(BREAK_AFTER);
  const phrases: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const chunk = ((parts[i] ?? '') + (parts[i + 1] ?? '')).replace(/\u200B/g, '');
    if (chunk) phrases.push(chunk);
  }
  return phrases.length ? phrases : [text];
}
