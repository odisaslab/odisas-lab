/**
 * Imágenes reales (cuando existan) o placeholders elegantes. Lee el manifiesto que genera `npm run photos`
 * (src/data/photo-manifest.json). Si una foto no está en el manifiesto, se pinta el placeholder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(path.join(here, '../data/photo-manifest.json'), 'utf8'));
} catch {
  /* aún no hay fotos: todo son placeholders */
}

export const hasPhoto = (file) => Boolean(file && manifest[file]);

/** <picture> con AVIF/WebP/JPG responsive y carga diferida. */
export function picture(file, alt, { sizes = '(min-width: 900px) 33vw, 80vw', cls = '', eager = false } = {}) {
  const m = manifest[file];
  if (!m) return '';
  const set = (ext) => m.widths.map((w) => `/img/${file}-${w}.${ext} ${w}w`).join(', ');
  const largest = m.widths[m.widths.length - 1];
  return `<picture class="${esc(cls)}"><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="/img/${file}-${largest}.jpg" width="${m.w}" height="${m.h}" alt="${esc(alt)}" ${eager ? '' : 'loading="lazy"'} decoding="async"></picture>`;
}

/** Hueco de foto pendiente: degradado + etiqueta. */
export function placeholder(label, tint, { note = '[ FOTO PENDIENTE ]', cls = '' } = {}) {
  return `<span class="ph ${esc(cls)}" style="--a:${tint[0]};--b:${tint[1]}" role="img" aria-label="${esc(label)}: foto pendiente"><span class="ph__note">${esc(note)}</span></span>`;
}
