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

const artifact = process.argv.includes('--artifact');
const scenePath = (f, ext) => path.join(root, 'public/img/scene', `${f}.${ext}`);
const names = [...new Set([...html.matchAll(/\/img\/scene\/([\w-]+)\.(?:avif|webp)/g)].map((m) => m[1]))];

if (artifact) {
  // Para publicar como Artifact: el HTML es solo el contenido (la plataforma pone <html>/<head>) y las fotos van como archivos
  // aparte a resolución completa (AVIF + WebP), con rutas relativas. JS, CSS y fuentes siguen incrustados.
  html = html
    .replace(/<!doctype html>\s*<html[^>]*>\s*<head>/i, '')
    .replace(/<\/head>\s*<body>/i, '')
    .replace(/<\/body>\s*<\/html>\s*$/i, '')
    .replace(/<link rel="(?:icon|apple-touch-icon|manifest|canonical|preload)"[^>]*>\n?/g, '')
    .replace(/<title>[^<]*<\/title>/, '<title>Sara del Olmo Studio</title>')
    .replace(/\/img\/scene\//g, 'img/scene/');
  const dir = path.join(root, 'preview', 'artifact');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'img/scene'), { recursive: true });
  for (const f of names) for (const ext of ['avif', 'webp']) fs.copyFileSync(scenePath(f, ext), path.join(dir, 'img/scene', `${f}.${ext}`));
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`Artifact: ${path.relative(root, dir)}/index.html (${(html.length / 1024).toFixed(0)} kB) + ${names.length * 2} fotos`);
  process.exit(0);
}

// Vista previa en UN archivo: las fotos se incrustan en WebP (cada una UNA sola vez, aunque la web la use en varios sitios),
// a resolución completa. Solo la usa quien quiera abrir un único .html sin servidor; la build real usa AVIF/WebP.
const { default: sharp } = await import('sharp');
const uri = new Map();
for (const f of names) {
  const buf = await sharp(scenePath(f, 'webp')).webp({ quality: /blur/.test(f) ? 70 : 74, alphaQuality: 80, effort: 5 }).toBuffer();
  uri.set(f, `data:image/webp;base64,${buf.toString('base64')}`);
}
html = html.replace(/<link rel="preload" as="image"[^>]*>\n?/, '').replace(/<source type="image\/avif" srcset="[^"]*">/g, '');
// cada foto vive una sola vez en un objeto JS y se asigna a su <img> al arrancar
html = html.replace(/<img src="\/img\/scene\/([\w-]+)\.webp"/g, (m, f) => `<img data-i="${f}" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="`);
const imgScript = `<script>(function(){var D=${JSON.stringify(Object.fromEntries(uri))};document.querySelectorAll('img[data-i]').forEach(function(i){i.src=D[i.getAttribute('data-i')]})})()</script>`;
// va justo antes del script principal (el último <script> del <body>): ahí ya existen todas las etiquetas <img>
const at = html.lastIndexOf('<script>');
html = html.slice(0, at) + imgScript + '\n' + html.slice(at);

const out = path.join(root, 'preview');
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, 'sara-del-olmo-studio.html');
fs.writeFileSync(file, html);
console.log(`Preview: ${path.relative(root, file)}  (${(fs.statSync(file).size / 1024).toFixed(0)} kB)`);
