#!/usr/bin/env node
// 由 legacy-site/logo.svg 的字標路徑產生：
//   src/assets/logo-mark.svg（裁到路徑範圍、fill=currentColor，Logo.astro 以 ?raw 內嵌）
//   public/favicon.svg（方形 viewBox 置中、紅色 #CC0029）
//   public/favicon.ico（16／32／48 PNG 條目，透明底）
//   public/apple-touch-icon.png（180×180，白底）
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT } from './lib/files.mjs';

const RED = '#CC0029';
const source = readFileSync(path.join(ROOT, 'legacy-site/logo.svg'), 'utf8');
const d = source.match(/\sd="([^"]+)"/)?.[1];
if (!d) throw new Error('legacy-site/logo.svg 找不到 path d 屬性');

/** 以取樣方式估算 path（M/L/C/Z 絕對座標）的邊界框 */
function pathBBox(data) {
  const tokens = data.match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cur = [0, 0];
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const add = (x, y) => {
    box.minX = Math.min(box.minX, x);
    box.minY = Math.min(box.minY, y);
    box.maxX = Math.max(box.maxX, x);
    box.maxY = Math.max(box.maxY, y);
  };
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M' || cmd === 'L') {
      cur = [Number(tokens[i++]), Number(tokens[i++])];
      add(...cur);
    } else if (cmd === 'C') {
      const p = [cur, [Number(tokens[i++]), Number(tokens[i++])], [Number(tokens[i++]), Number(tokens[i++])], [Number(tokens[i++]), Number(tokens[i++])]];
      for (let t = 0; t <= 1.0001; t += 0.02) {
        const u = 1 - t;
        const x = u ** 3 * p[0][0] + 3 * u ** 2 * t * p[1][0] + 3 * u * t ** 2 * p[2][0] + t ** 3 * p[3][0];
        const y = u ** 3 * p[0][1] + 3 * u ** 2 * t * p[1][1] + 3 * u * t ** 2 * p[2][1] + t ** 3 * p[3][1];
        add(x, y);
      }
      cur = p[3];
    }
  }
  return { ...box, w: box.maxX - box.minX, h: box.maxY - box.minY };
}

const fmt = (n) => Number(n.toFixed(3));
const bbox = pathBBox(d);
const pad = 1;
const vb = { x: bbox.minX - pad, y: bbox.minY - pad, w: bbox.w + pad * 2, h: bbox.h + pad * 2 };
const viewBox = `${fmt(vb.x)} ${fmt(vb.y)} ${fmt(vb.w)} ${fmt(vb.h)}`;
const pathEl = (fill) => `<path d="${d}" fill="${fill}" fill-rule="evenodd"/>`;

// 1. 字標（inline 用）
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${pathEl('currentColor')}</svg>\n`;
mkdirSync(path.join(ROOT, 'src/assets'), { recursive: true });
writeFileSync(path.join(ROOT, 'src/assets/logo-mark.svg'), mark);

// 2. favicon.svg：方形、置中、紅色
const side = Math.max(vb.w, vb.h) * 1.1;
const cx = vb.x + vb.w / 2;
const cy = vb.y + vb.h / 2;
const squareVB = `${fmt(cx - side / 2)} ${fmt(cy - side / 2)} ${fmt(side)} ${fmt(side)}`;
const favicon = (size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${squareVB}"${size ? ` width="${size}" height="${size}"` : ''}>${pathEl(RED)}</svg>\n`;
writeFileSync(path.join(ROOT, 'public/favicon.svg'), favicon());

// 3. apple-touch-icon.png：180×180 白底，字標寬約 76%
const touchW = 180 * 0.76;
const touchH = touchW * (vb.h / vb.w);
const touchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">` +
  `<rect width="180" height="180" fill="#FFFFFF"/>` +
  `<svg x="${fmt((180 - touchW) / 2)}" y="${fmt((180 - touchH) / 2)}" width="${fmt(touchW)}" height="${fmt(touchH)}" viewBox="${viewBox}">${pathEl(RED)}</svg>` +
  `</svg>`;
await sharp(Buffer.from(touchSvg)).png().toFile(path.join(ROOT, 'public/apple-touch-icon.png'));

// 4. favicon.ico：PNG 條目
async function icoFromPngs(sizes) {
  const entries = [];
  for (const size of sizes) {
    const buf = await sharp(Buffer.from(favicon(size))).png().toBuffer();
    entries.push({ size, buf });
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach((e, i) => {
    const o = i * 16;
    dir[o] = e.size >= 256 ? 0 : e.size;
    dir[o + 1] = e.size >= 256 ? 0 : e.size;
    dir[o + 2] = 0; // palette
    dir[o + 3] = 0; // reserved
    dir.writeUInt16LE(1, o + 4); // planes
    dir.writeUInt16LE(32, o + 6); // bpp
    dir.writeUInt32LE(e.buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.buf.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.buf)]);
}
writeFileSync(path.join(ROOT, 'public/favicon.ico'), await icoFromPngs([16, 32, 48]));

console.log(`✓ logo bbox ${fmt(bbox.w)}×${fmt(bbox.h)}，viewBox "${viewBox}"`);
console.log('✓ src/assets/logo-mark.svg, public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png');
