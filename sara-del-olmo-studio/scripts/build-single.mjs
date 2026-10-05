/**
 * Versión de previsualización en UN solo archivo HTML (JS, CSS y fuentes incrustados).
 * Útil para enseñar la web sin servidor (abrir el archivo, adjuntarlo, previsualizarlo en un panel).
 * No es la build de producción: para publicar usa `npm run build`.
 *   node scripts/build-single.mjs   →  preview/sara-del-olmo-studio.html
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const common = { absWorkingDir: root, bundle: true, minify: true, write: false, logLevel: 'warning', legalComments: 'none', target: 'es2020' };

const js = await build({ ...common, entryPoints: ['src/js/main.js'], format: 'iife' });
const css = await build({ ...common, entryPoints: ['src/css/main.css'], external: ['/assets/*'] });

const fontFiles = {
  'bodoni-moda-latin-wght-normal.woff2': '@fontsource-variable/bodoni-moda',
  'bodoni-moda-latin-wght-italic.woff2': '@fontsource-variable/bodoni-moda',
  'albert-sans-latin-wght-normal.woff2': '@fontsource-variable/albert-sans',
};
let cssText = css.outputFiles[0].text;
for (const [file, pkg] of Object.entries(fontFiles)) {
  const b64 = fs.readFileSync(path.join(root, 'node_modules', pkg, 'files', file)).toString('base64');
  cssText = cssText.split(`/assets/fonts/${file}`).join(`data:font/woff2;base64,${b64}`);
}
const jsText = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

const { renderPage } = await import(pathToFileURL(path.join(root, 'src/templates/page.js')).href + `?t=${Date.now()}`);
let html = renderPage({ js: '/__js__', css: '/__css__', fonts: [] });
html = html
  .replace(/<link rel="stylesheet" href="\/__css__">/, () => `<style>${cssText}</style>`)
  .replace(/<link rel="modulepreload" href="\/__js__">\n?/, '')
  .replace(/<script type="module" src="\/__js__"><\/script>/, () => `<script>${jsText}</script>`);

// Las fotos de las escenas se incrustan en WebP y a la mitad de resolución: así el archivo pesa ~1,5 MB (en vez de 4 MB)
// y lo abre cualquier visor. Es solo la vista previa; la build de verdad usa AVIF/WebP a resolución completa.
const { default: sharp } = await import('sharp');
const inline = new Map();
const files = [...new Set([...html.matchAll(/\/img\/scene\/([\w-]+)\.(?:avif|webp)/g)].map((m) => m[1]))];
for (const f of files) {
  const src = path.join(root, 'public/img/scene', `${f}.webp`);
  const meta = await sharp(src).metadata();
  const w = /blur/.test(f) ? meta.width : Math.round(meta.width / 2);
  const buf = await sharp(src).resize({ width: w }).webp({ quality: 55, alphaQuality: 70 }).toBuffer();
  inline.set(f, `data:image/webp;base64,${buf.toString('base64')}`);
}
html = html.replace(/<link rel="preload" as="image"[^>]*>\n?/, '').replace(/ type="image\/avif"/g, ' type="image/webp"');
html = html.replace(/\/img\/scene\/([\w-]+)\.(?:avif|webp)/g, (m, f) => inline.get(f));

const out = path.join(root, 'preview');
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, 'sara-del-olmo-studio.html');
fs.writeFileSync(file, html);
console.log(`Preview: ${path.relative(root, file)}  (${(fs.statSync(file).size / 1024).toFixed(0)} kB)`);
