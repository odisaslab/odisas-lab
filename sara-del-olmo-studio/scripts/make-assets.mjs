/**
 * Genera las imágenes de marca que no son fotografías: favicon, iconos de app e imagen para redes (og.png).
 * Son ilustraciones vectoriales (la mano y la uña lacada del sitio). Requiere Playwright (devDependency).
 *   node scripts/make-assets.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handMarkup } from '../src/js/art/hand.js';
import { nailMarkup } from '../src/js/art/nail-markup.js';
import { DEFAULT_LOOK } from '../src/data/look.js';
import { CONFIG } from '../src/data/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const font = (pkg, f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'node_modules', pkg, 'files', f)).toString('base64');
fs.mkdirSync(pub, { recursive: true });

/* favicon: una uña de cereza lacada con su reflejo, sobre fondo oscuro redondeado */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="15" fill="#2A1418"/>
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B01329"/><stop offset=".55" stop-color="#7A1027"/><stop offset="1" stop-color="#4D0818"/></linearGradient></defs>
  <path transform="translate(19.5 8) scale(.43)" fill="url(#g)" d="M50 2 C68 6 94 44 94 84 L94 132 C94 152 76 162 50 162 C24 162 6 152 6 132 L6 84 C6 44 32 6 50 2Z"/>
  <path d="M25 30 C24 38 24 46 26 52" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" fill="none"/>
  <ellipse cx="41" cy="25" rx="2.1" ry="5.2" fill="#fff" fill-opacity=".85" transform="rotate(14 41 25)"/>
</svg>`;
fs.writeFileSync(path.join(pub, 'favicon.svg'), favicon);

const manifest = {
  name: CONFIG.name,
  short_name: CONFIG.shortName,
  description: 'Estudio de uñas, cejas y piercing en Humanes de Madrid.',
  lang: 'es',
  start_url: '/',
  display: 'standalone',
  background_color: '#2A1418',
  theme_color: '#2A1418',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
fs.writeFileSync(path.join(pub, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url(${font('@fontsource-variable/bodoni-moda', 'bodoni-moda-latin-wght-normal.woff2')});font-weight:400 900}
@font-face{font-family:B;font-style:italic;src:url(${font('@fontsource-variable/bodoni-moda', 'bodoni-moda-latin-wght-italic.woff2')});font-weight:400 900}
@font-face{font-family:A;src:url(${font('@fontsource-variable/albert-sans', 'albert-sans-latin-wght-normal.woff2')});font-weight:100 900}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#12080A;color:#F8EAE7;font-family:A,sans-serif;position:relative;overflow:hidden}
.bg{position:absolute;inset:0;background:radial-gradient(60% 70% at 78% 40%,rgba(122,16,39,.55),transparent 70%),radial-gradient(90% 70% at 50% 120%,#2A1418,transparent 60%)}
svg{position:absolute;right:-30px;top:-70px;width:620px;height:806px;overflow:visible}
.t{position:absolute;left:70px;top:150px}
.n{font:italic 400 40px/1 B;margin-bottom:6px}.s{font-size:15px;letter-spacing:.5em;text-transform:uppercase;font-weight:600;opacity:.85}
h1{font:400 128px/.86 B;letter-spacing:-.045em;margin:34px 0 26px}h1 i{display:block}
.p{font-size:20px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;display:flex;align-items:center;gap:16px}.p:before{content:"";width:52px;height:1px;background:#E7788F}
</style></head><body><div class="bg"></div>
<svg viewBox="0 0 1000 1300">${handMarkup('og', DEFAULT_LOOK, { skin: CONFIG.skinTone })}</svg>
<div class="t"><div class="n">Sara del Olmo</div><div class="s">Studio</div><h1>Uñas<i>con arte.</i></h1><div class="p">Humanes de Madrid</div></div></body></html>`;

const iconHtml = (size) => `<!doctype html><body style="margin:0;width:${size}px;height:${size}px">${favicon.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const shot = async (html, file, w, h) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(pub, file) });
  await page.close();
};
await shot(ogHtml, 'og.png', 1200, 630);
await shot(iconHtml(180), 'apple-touch-icon.png', 180, 180);
await shot(iconHtml(192), 'icon-192.png', 192, 192);
await shot(iconHtml(512), 'icon-512.png', 512, 512);
await browser.close();
console.log('Assets generados en public/');
