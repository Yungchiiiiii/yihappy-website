import type { Service } from './types';
import { faq } from './faq';
import { pageMeta } from './pages';

// /services/ 總覽頁文案（§5.2）
export const servicesIndex = {
  ...pageMeta.services,
  name: '印刷服務',
  h1: '用你要印的東西來找。',
  lede: '第一層是你的需求，第二層是我們用什麼設備與方式做。兩層都看不懂也沒關係，直接詢價。',
  needsTitle: '我要印',
  methodsTitle: '同一個窗口，這幾種做法。',
  methodsLabel: '我們怎麼做',
} as const;

// 五個服務內頁（§5.3）。`how` 的 `name：detail` 依 spec 原文以全形冒號拆開。
export const services: Service[] = [
  {
    ...pageMeta.books,
    slug: 'books',
    name: '教科書、書籍與手冊印刷',
    h1: '教科書、書籍與手冊。',
    lede: '從十冊教材到上萬本教科書，從一本樣書到一批型錄，我們用不同的機台做，但由同一個窗口負責。',
    fit: [
      '出版社與教育機構的教科書、教材、講義',
      '平裝書、作品集、產品型錄、公司簡介',
      '改版後需要小量補印的書',
      '先印幾本確認再大量印製',
    ],
    how: [
      { name: '內頁黑白大量', detail: '黑白輪轉機' },
      { name: '內頁彩色或少量', detail: 'Canon 彩色雷射、Kyocera 彩色噴墨、Ricoh 黑白雷射' },
      { name: '封面', detail: '數位印刷，或平版印刷與協力廠配合' },
      { name: '裝訂', detail: '膠裝、線膠裝、騎馬釘、平釘' },
    ],
    specs: [
      { label: '內頁紙張', value: '道林紙 70・75・80・120・150g、特銅 120・200g、雪銅 120・200g、日本上質紙 80・100・120g' },
      { label: '封面紙張', value: '銅西 200・250g、雪銅 200・250g' },
      { label: '封面加工', value: '上光、上霧、亮膜、霧膜、局部光' },
      { label: '裝訂', value: '膠裝、線膠裝、騎馬釘、平釘' },
      { label: '起印量', value: '數位印刷 2 本起，教科書 10 冊起' },
      { label: '頁數', value: '32–1312 頁' },
    ],
    notes: [
      '精裝與特殊裝幀請於詢價時說明，我們評估做法。',
      '頁數需為偶數；騎馬釘適合頁數較少的冊子。',
      '有現成檔案請一併提供，沒有也可以先談。',
    ],
    faq: faq.books,
  },
  {
    ...pageMeta.printOnDemand,
    slug: 'print-on-demand',
    name: '依需印刷（POD）、少量印刷與卡片 DM',
    h1: '依需印刷：要幾本印幾本。',
    lede: '2 本起印。樣書、提案書、試銷版、少量書籍，以及卡片、DM 與書封，用數位印刷直接做，不用等大量開機。',
    fit: [
      '只需要幾本到幾十本的書或手冊',
      '提案、比稿、內部審閱用的樣書',
      '名片、卡片、DM、邀請卡',
      '書封（折封口或不折封口）與少量封面',
    ],
    how: [
      { name: '彩色', detail: 'Canon 彩色雷射、Kyocera 彩色噴墨、彩色噴墨' },
      { name: '黑白', detail: 'Ricoh 黑白雷射' },
      { name: '數位打樣' },
      { name: '裝訂與加工在廠內完成' },
    ],
    specs: [
      { label: '項目', value: '內文、卡片類、封面類（折封口／不折封口）、DM' },
      { label: '紙張', value: '道林紙、特銅、雪銅、日本上質紙、銅西' },
      { label: '加工', value: '上光、上霧、亮膜、霧膜、裁切、摺紙（對折、三折）' },
      { label: '起印量', value: '2 本起' },
    ],
    notes: [
      '少量印刷每本單價較高，數量到一定程度會建議改用其他方式，報價時我們會說明。',
      '色彩要求高的案子，建議先做數位打樣。',
    ],
    faq: faq.printOnDemand,
  },
  {
    ...pageMeta.ctp,
    slug: 'ctp',
    name: 'CTP 製版與打樣',
    h1: 'CTP 製版與打樣。',
    lede: '給印刷同業、設計公司與出版社：出版機 CTP 出版、多種板材尺寸、底片與出版打樣大圖。',
    fit: [
      '印刷廠需要穩定的外包製版',
      '設計公司要交付印刷廠的版材與打樣',
      '需要平版印刷的書籍封面與內頁，由倚樂統籌協力印刷',
    ],
    how: [
      { name: '出版機（CTP）出版' },
      { name: '底片' },
      { name: '出版打樣大圖' },
      { name: '平版印刷與協力印刷廠配合' },
    ],
    specs: [
      { label: '板材尺寸', value: '多種尺寸，詢價時告知印刷機型' },
      { label: '打樣', value: '出版打樣大圖、數位打樣' },
      { label: '急件', value: '可洽詢' },
    ],
    notes: ['提供完稿 PDF 與拼版需求；沒有拼版檔我們可以協助。', '打樣費用與次數在報價時說明。'],
    faq: faq.ctp,
  },
  {
    ...pageMeta.largeFormat,
    slug: 'large-format',
    name: '大圖輸出',
    h1: '大圖輸出。',
    lede: '海報、展示與看板用大圖，大圖機數位直噴輸出，可搭配裁切與後加工。',
    fit: ['活動與展示海報', '店面與教室用大圖', '出版打樣大圖'],
    how: [{ name: '大圖機數位直噴' }, { name: '裁切與後加工' }],
    specs: [
      { label: '尺寸', value: '依大圖機規格，詢價時提供成品尺寸' },
      { label: '加工', value: '裁切、覆膜（詢價時確認）' },
    ],
    notes: ['大圖檔案請以實際尺寸或等比例製作，解析度與出血詢價時一起確認。'],
    faq: faq.largeFormat,
  },
  {
    ...pageMeta.finishing,
    slug: 'finishing',
    name: '裝訂與後加工',
    h1: '裝訂與後加工。',
    lede: '印好只是一半。裝訂、覆膜、裁切、摺紙、包裝與配送，在中和廠內接著做完。',
    fit: ['書籍與冊子的裝訂', '封面與卡片的上光、上霧、覆膜', 'DM 摺紙、裁切', '收縮膜包裝、裝箱、分點配送'],
    how: [
      { name: '裝訂', detail: '膠裝、線膠裝、騎馬釘、平釘' },
      { name: '摺紙', detail: '對折、三折' },
      { name: '表面', detail: '上光、上霧、亮膜、霧膜、局部光' },
      { name: '裁切' },
      { name: '包裝', detail: '收縮膜包裝、裝箱' },
      { name: '運送', detail: '可分多個地點' },
    ],
    specs: [
      { label: '特殊加工', value: '燙金、打凹、UV：詢價時說明用途，我們評估做法' },
      { label: '精裝', value: '請於詢價時說明' },
    ],
    notes: ['加工方式會影響紙張選擇與頁數安排，建議在報價階段一起決定。'],
    faq: faq.finishing,
  },
];

export const getService = (slug: string): Service | undefined => services.find((s) => s.slug === slug);
