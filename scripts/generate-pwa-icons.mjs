/**
 * PWA 用 PNG（192 / 512）を public/favicon.svg から生成する。
 * npm run build の前（prebuild）で自動実行。
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = join(root, 'public', 'favicon.svg');
const out192 = join(root, 'public', 'pwa-192.png');
const out512 = join(root, 'public', 'pwa-512.png');
const out180 = join(root, 'public', 'pwa-180.png');

const paper = { r: 250, g: 247, b: 242, alpha: 1 };
const svg = readFileSync(svgPath);

try {
  await sharp(svg, { density: 300 })
    .resize(192, 192, { fit: 'contain', background: paper })
    .png()
    .toFile(out192);
  await sharp(svg, { density: 300 })
    .resize(512, 512, { fit: 'contain', background: paper })
    .png()
    .toFile(out512);
  console.log('PWA icons from SVG:', out192, out512);
} catch (e) {
  console.error('SVG rasterize failed, using flat fallback:', e.message || e);
  await sharp({ create: { width: 192, height: 192, channels: 4, background: paper } }).png().toFile(out192);
  await sharp({ create: { width: 512, height: 512, channels: 4, background: paper } }).png().toFile(out512);
}

await sharp(readFileSync(out512)).resize(180, 180).png().toFile(out180);
console.log('apple-touch:', out180);
