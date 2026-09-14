// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 倚樂企業有限公司官網（見 docs/02-design-spec.md §11）
export default defineConfig({
  site: 'https://yihappy.com.tw',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      // OG 模板只給 scripts/og.mjs 截圖用，不進 sitemap（404 由 integration 自動排除）
      filter: (page) => !page.includes('/og-template/'),
    }),
  ],
});
