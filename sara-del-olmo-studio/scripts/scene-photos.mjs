/**
 * Fotos de las escenas (portada, pies, final) → imágenes optimizadas en public/img/scene/.
 *   Originales:  scene-src/mano.webp · mano-cerca.webp · pies.webp   (se versionan junto al código)
 *   Ejecutar:    npm run scene-photos
 *
 *   mano        → mano-2048 (+ mano-blur)      plano general, ampliado x2; el negro del fondo pasa a transparente
 *                                                  y los bordes se difuminan. «-blur» es la misma foto desenfocada.
 *   mano-cerca  → mano-cerca-3072 (+ -blur)     macro de las uñas, ampliado x2, con los bordes difuminados.
 *   pies        → pies-2048                      el fondo verde (croma) se convierte en transparencia.
 *   macro-una   → macro-una-3072 (+ -blur)      macro de una uña (la inmersión final de la portada y el arranque del cierre).
 *   cejas       → cejas-3072                     rostro con cejas (escena «Cejas» y arranque de «Piercing»).
 *   oreja/joya  → oreja-2048, joya-2508 (+ -blur) oreja con joyas y macro de una joya (escena «Piercing»).
 * Las versiones «-blur» hacen el cambio de enfoque entre la foto general y la macro (nítida → borrosa → borrosa →
 * nítida) sin filtros en tiempo real: son diminutas y el navegador las estira suavemente.
 *
 * Para sustituir una foto: pon la nueva en scene-src/ con el mismo nombre, revisa las medidas de la uña en
 * src/data/scene-photos.js (la mano y la macro se alinean por la uña central) y vuelve a ejecutar el script.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'scene-src');
const out = path.join(root, 'public', 'img', 'scene');
fs.mkdirSync(out, { recursive: true });

const only = process.argv.slice(2);                       // p. ej.  node scripts/scene-photos.mjs pies
const want = (n) => !only.length || only.includes(n);
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };

/** Lee un archivo como RGBA crudo. */
async function readRGBA(file) {
  const { data, info } = await sharp(path.join(src, file), { failOn: 'none' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** Difumina los bordes hacia transparente (px por lado). */
function feather(img, { l, r, t, b }) {
  const { data, w, h } = img;
  for (let y = 0; y < h; y++) {
    const ey = Math.min(t ? y / t : 9, b ? (h - 1 - y) / b : 9);
    for (let x = 0; x < w; x++) {
      const ex = Math.min(l ? x / l : 9, r ? (w - 1 - x) / r : 9);
      const a = smooth(Math.min(ex, ey));
      const i = (y * w + x) * 4 + 3;
      data[i] = Math.round(data[i] * a);
    }
  }
}

/** El negro del fondo se vuelve transparente (deja ver el degradado de la página); la piel y las uñas quedan sólidas. */
function lumaKey(img, lo, hi) {
  const { data, w, h } = img;
  for (let i = 0; i < w * h; i++) {
    const k = i * 4;
    const m = Math.max(data[k], data[k + 1], data[k + 2]);
    data[k + 3] = Math.round(data[k + 3] * smooth((m - lo) / (hi - lo)));
  }
}

/** Grano fino (±amp niveles) para que la ampliación no se vea plástica. */
function grain(img, amp) {
  const { data, w, h } = img;
  let s = 1234567;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < w * h; i++) {
    const n = (rnd() + rnd() + rnd() - 1.5) * amp;
    const k = i * 4;
    data[k] = clamp(data[k] + n, 0, 255); data[k + 1] = clamp(data[k + 1] + n * 0.9, 0, 255); data[k + 2] = clamp(data[k + 2] + n * 0.9, 0, 255);
  }
}

const save = async (img, name, { avifQ = 58, webpQ = 78 } = {}) => {
  const base = () => sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } });
  await base().avif({ quality: avifQ, effort: 6, chromaSubsampling: '4:4:4' }).toFile(path.join(out, `${name}.avif`));
  await base().webp({ quality: webpQ, alphaQuality: 92, effort: 5 }).toFile(path.join(out, `${name}.webp`));
  const kb = (e) => (fs.statSync(path.join(out, `${name}.${e}`)).size / 1024).toFixed(0);
  console.log(`✓ ${name}  ${img.w}×${img.h}  avif ${kb('avif')} KB · webp ${kb('webp')} KB`);
};

/** Versión desenfocada: se reduce y se aplica un desenfoque gaussiano (así el navegador la estira sin «escalones»). */
async function blurred(img, width, sigma) {
  const h = Math.round((img.h * width) / img.w);
  const { data } = await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).resize(width, h, { kernel: 'lanczos3' }).blur(sigma).raw().toBuffer({ resolveWithObject: true });
  return { data, w: width, h };
}

/** Escala RGBA con lanczos (sharp premultiplica el alfa) y afina un poco. */
async function scale(img, factor, { sharpen = true } = {}) {
  const w = Math.round(img.w * factor), h = Math.round(img.h * factor);
  let p = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).resize(w, h, { kernel: 'lanczos3' });
  if (sharpen) p = p.sharpen({ sigma: 0.9, m1: 0.5, m2: 1.4 });
  const { data } = await p.raw().toBuffer({ resolveWithObject: true });
  return { data, w, h };
}

/* ───────── 1 · mano (plano general, x2, fondo transparente) ───────── */
if (want('mano')) {
  const img = await readRGBA('mano.webp');
  lumaKey(img, 7, 34);
  const big = await scale(img, 2);
  grain(big, 3);
  feather(big, { l: 300, r: 300, t: 340, b: 460 });
  await save(big, 'mano-2048', { avifQ: 76, webpQ: 88 });
  await save(await blurred(big, 512, 7), 'mano-blur', { avifQ: 55, webpQ: 74 });
}

/* ───────── 2 · mano-cerca (macro de las uñas, x2) ───────── */
if (want('mano-cerca')) {
  const img = await scale(await readRGBA('mano-cerca.webp'), 2);
  grain(img, 3);
  feather(img, { l: 300, r: 300, t: 260, b: 320 });
  await save(img, 'mano-cerca-3072', { avifQ: 76, webpQ: 88 });
  await save(await blurred(img, 768, 9), 'mano-cerca-blur', { avifQ: 55, webpQ: 74 });
}

/* ───────── 2b · macro-una (macro de una uña, x2): la inmersión final de la portada ───────── */
if (want('macro-una')) {
  const img = await scale(await readRGBA('macro-una.webp'), 2);
  // la versión borrosa cubre el TRIPLE de área (los bordes se prolongan repitiendo el último píxel y se desenfocan): así la capa
  // nítida entra en la pantalla sobre un fondo que ya la rodea y no se ve ningún «recuadro» durante el fundido
  const padded = await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).extend({ top: img.h, bottom: img.h, left: img.w, right: img.w, extendWith: 'copy' }).raw().toBuffer({ resolveWithObject: true });
  const wide = await blurred({ data: padded.data, w: padded.info.width, h: padded.info.height }, 1152, 12);
  feather(wide, { l: 60, r: 60, t: 40, b: 60 });
  await save(wide, 'macro-una-blur', { avifQ: 55, webpQ: 74 });
  // la nítida: las esquinas negras del encuadre pasan a transparentes (dejan ver el fondo borroso, que es igual de oscuro ahí)
  lumaKey(img, 12, 30);
  grain(img, 3);   // el grano va DESPUÉS de recortar las esquinas, para que el borde transparente quede limpio
  feather(img, { l: 200, r: 200, t: 120, b: 200 });
  await save(img, 'macro-una-3072', { avifQ: 76, webpQ: 88 });
}

/* ───────── 2c · cejas (rostro con cejas, x2) ───────── */
if (want('cejas')) {
  const img = await scale(await readRGBA('cejas.webp'), 2);
  grain(img, 3);
  feather(img, { l: 120, r: 120, t: 90, b: 360 });
  await save(img, 'cejas-3072', { avifQ: 76, webpQ: 88 });
}

/* ───────── 2d · oreja y joya (piercing) ───────── */
if (want('oreja')) {
  const img = await scale(await readRGBA('oreja.webp'), 2);
  grain(img, 3);
  feather(img, { l: 620, r: 200, t: 260, b: 460 });
  await save(img, 'oreja-2048', { avifQ: 76, webpQ: 88 });
  await save(await blurred(img, 512, 6), 'oreja-blur', { avifQ: 55, webpQ: 74 });
}
if (want('joya')) {
  const img = await scale(await readRGBA('joya.webp'), 2);
  grain(img, 2.5);
  feather(img, { l: 300, r: 300, t: 300, b: 300 });
  await save(img, 'joya-2508', { avifQ: 76, webpQ: 88 });
  await save(await blurred(img, 512, 6), 'joya-blur', { avifQ: 55, webpQ: 74 });
}

/* ───────── 3 · pies (croma verde → transparencia) ───────── */
if (want('pies')) {
  const img = await readRGBA('pies.webp');
  const { data, w, h } = img;
  const RHO = 0.7;            // relación g/r de la piel (muestras: 0,67-0,75)
  for (let i = 0; i < w * h; i++) {
    const k = i * 4;
    const r = data[k], g = data[k + 1], b = data[k + 2];
    // C = αF + (1-α)·verde  ⇒  C_g - ρ·C_r = (1-α)·255
    let a = 1 - clamp((g - RHO * r) / 250);
    if (a < 0.02) { data[k] = data[k + 1] = data[k + 2] = data[k + 3] = 0; continue; }
    // recorta el borde para quitar el halo verde y deja el resto sólido
    a = clamp((a - 0.3) / 0.6);
    if (a <= 0) { data[k] = data[k + 1] = data[k + 2] = data[k + 3] = 0; continue; }
    data[k + 3] = Math.round(a * 255);
  }
  // descontamina los píxeles de borde: toman el color de la piel sólida más cercana (no queda verde ni sombra sucia)
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] >= 250;
  const copy = Uint8ClampedArray.from(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      if (data[k + 3] === 0 || data[k + 3] >= 250) continue;
      let sr = 0, sg = 0, sb = 0, n = 0;
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        if (!solid(x + dx, y + dy)) continue;
        const j = ((y + dy) * w + x + dx) * 4;
        const wgt = 1 / (1 + dx * dx + dy * dy);
        sr += copy[j] * wgt; sg += copy[j + 1] * wgt; sb += copy[j + 2] * wgt; n += wgt;
      }
      if (n > 0) { data[k] = sr / n; data[k + 1] = sg / n; data[k + 2] = sb / n; }
      else { data[k + 1] = Math.min(data[k + 1], Math.max(data[k], data[k + 2]) * 0.8); }
    }
  }
  // los tobillos continúan fuera del encuadre: difuminamos el corte inferior
  feather(img, { l: 0, r: 0, t: 0, b: 260 });
  const big = await scale(img, 2);
  grain(big, 3);
  await save(big, 'pies-2048', { avifQ: 76, webpQ: 88 });
}
console.log('\nListo. Ejecuta  npm run build  para verlo.');
