/**
 * Imágenes reales (cuando existan) o placeholders elegantes. Lee el manifiesto que genera `npm run photos`
 * (src/data/photo-manifest.json). Si una foto no está en el manifiesto, se pinta el placeholder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './util.js';
import { SCENE_DIR, HAND, FEET, BROWS, EAR, handWorld, earWorld } from '../data/scene-photos.js';

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

/** Foto de escena (AVIF + WebP, con transparencia si la tiene). Medidas en px de «mundo», las fija el CSS. */
export function scenePic(file, { alt = '', cls = '', w, h, priority = 'auto', lazy = false, style = '' } = {}) {
  return `<picture class="${esc(cls)}"${style ? ` style="${esc(style)}"` : ''}><source type="image/avif" srcset="${SCENE_DIR}/${file}.avif"><img src="${SCENE_DIR}/${file}.webp" width="${w}" height="${h}" alt="${esc(alt)}"${alt ? '' : ' aria-hidden="true"'} decoding="async"${lazy ? ' loading="lazy"' : ''} fetchpriority="${priority}"></picture>`;
}

/** Mano en plano general + macro de las uñas, alineadas por la uña central (portada y final). */
export function handWorldMarkup({ lazy = false, cls = '' } = {}) {
  const g = handWorld();
  const px = (n) => `${+n.toFixed(2)}px`;
  const rect = (r) => `left:${px(r.x)};top:${px(r.y)};width:${px(r.w)};height:${px(r.h)}`;
  const W = HAND.wide, C = HAND.close, M = HAND.macro, pr = lazy ? 'low' : 'high';
  const pic = (file, cls, o, extra = {}) => scenePic(file, { cls, w: o.w, h: o.h, priority: 'low', lazy, ...extra });
  // orden de apilado = orden del viaje: general nítida → general borrosa → macro borrosa → macro nítida → macro borrosa → uña borrosa → uña nítida
  return `<div class="pw ${esc(cls)}"><div class="pw__world">${scenePic(W.file, { alt: HAND.alt, cls: 'pw__a', w: W.w, h: W.h, priority: pr, lazy })}${pic(W.blur, 'pw__ab', W)}${pic(C.blur, 'pw__bb', C, { style: rect(g.b) })}${pic(C.file, 'pw__b', C, { style: rect(g.b) })}${pic(C.blur, 'pw__bb2', C, { style: rect(g.b) })}${pic(M.blur, 'pw__cb', { w: M.w * 3, h: M.h * 3 }, { style: rect(g.cp) })}${pic(M.file, 'pw__c', M, { style: rect(g.c) })}</div></div>`;
}

/** Los dos pies recortados (transparentes) sobre el color del look. */
export function feetMarkup() {
  return scenePic(FEET.img.file, { alt: FEET.alt, cls: 'pies__pic', w: FEET.img.w, h: FEET.img.h, lazy: true });
}

/** Rostro con las cejas (en «Cejas» con las guías de medida; en «Piercing» sin ellas, para continuar la cámara). */
export function browsMarkup({ guides = false } = {}) {
  const B = BROWS, p = (a) => `${a[0]} ${a[1]}`;
  const line = (d, cls = 'bz-g') => `<path class="${cls}" d="${d}" pathLength="1"/>`;
  const dots = [B.left.head, B.left.peak, B.left.tail, B.right.head, B.right.peak, B.right.tail];
  const svg = guides
    ? `<svg class="bw__guides" viewBox="0 0 ${B.img.refW} ${B.img.refH}" aria-hidden="true" focusable="false">`
      + line(`M${B.axis} 300V960`)                                                   // eje de la nariz
      + line(`M${B.eyes.inL} 470V820`) + line(`M${B.eyes.inR} 470V820`)                // comisuras internas: dónde nace la ceja
      + line(`M${B.left.peak[0]} 430V780`) + line(`M${B.right.peak[0]} 430V780`)      // el arco
      + line(`M${B.axis - 70} 940L${p(B.left.tail)}`) + line(`M${B.axis + 70} 940L${p(B.right.tail)}`)   // de la nariz a la cola
      + line(`M110 ${B.left.peak[1]}H1430`) + line(`M110 ${B.left.head[1]}H1430`)    // línea del arco y línea base
      + dots.map((d) => `<circle class="bz-p" cx="${d[0]}" cy="${d[1]}" r="9"/>`).join('')
      + '</svg>'
    : '';
  return `<div class="bw__world">${scenePic(B.img.file, { alt: B.alt, cls: 'bw__img', w: B.img.w, h: B.img.h, priority: 'low', lazy: true })}${svg}</div>`;
}

/** Joya en primer plano + oreja, alineadas por el piercing de la concha (joya nítida → joya borrosa → [oscuro] → oreja nítida). */
export function earWorldMarkup() {
  const g = earWorld(), J = EAR.jewel, E = EAR.ear;
  const px = (n) => `${+n.toFixed(2)}px`;
  const at = `left:${px(g.x)};top:${px(g.y)};width:${px(g.w)};height:${px(g.h)}`;
  const pic = (file, cls, o, extra = {}) => scenePic(file, { cls, w: o.w, h: o.h, priority: 'low', lazy: true, ...extra });
  const sparks = EAR.studs.map((st) => `<i class="spark" data-stud="${st.id}"></i>`).join('');
  return `<div class="pw piercing__pw"><div class="pw__world">${pic(J.file, 'pw__j', J, { alt: EAR.jewelAlt, style: at })}${pic(J.blur, 'pw__jb', J, { style: at })}${pic(E.file, 'pw__e', E, { alt: EAR.alt })}${sparks}</div></div>`;
}
