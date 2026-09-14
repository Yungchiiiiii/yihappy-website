import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIST = path.join(ROOT, 'dist');
export const ASTRO_BIN = path.join(ROOT, 'node_modules/astro/bin/astro.mjs');

/** 遞迴列出目錄內符合副檔名的檔案（排序） */
export function walk(dir, ext) {
  const out = [];
  const rec = (d) => {
    for (const name of readdirSync(d)) {
      const p = path.join(d, name);
      if (statSync(p).isDirectory()) rec(p);
      else if (!ext || p.endsWith(ext)) out.push(p);
    }
  };
  rec(dir);
  return out.sort();
}

export const formatKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
