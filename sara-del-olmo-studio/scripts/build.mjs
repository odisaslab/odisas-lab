/**
 * Build de producción: JS/CSS con esbuild (code splitting + minificado), fuentes autoalojadas,
 * prerender del HTML desde los datos editables, sitemap y robots.
 *
 *   node scripts/build.mjs            → dist/
 *   node scripts/build.mjs --dev      → sin minificar (lo usa scripts/dev.mjs)
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const DEV = process.argv.includes('--dev');

const rel = (p) => path.relative(root, p);
const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length;
const kb = (n) => (n / 1024).toFixed(1) + ' kB';

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

export async function buildSite() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'assets', 'fonts'), { recursive: true });

  // 1) public/ → dist/
  copyDir(path.join(root, 'public'), dist);

  // 2) fuentes (solo subconjunto latino, variable)
  const fonts = [
    ['@fontsource-variable/bodoni-moda', 'bodoni-moda-latin-wght-normal.woff2'],
    ['@fontsource-variable/bodoni-moda', 'bodoni-moda-latin-wght-italic.woff2'],
    ['@fontsource-variable/albert-sans', 'albert-sans-latin-wght-normal.woff2'],
  ];
  for (const [pkg, file] of fonts) {
    fs.copyFileSync(path.join(root, 'node_modules', pkg, 'files', file), path.join(dist, 'assets', 'fonts', file));
  }

  // 3) JS y CSS
  const common = { absWorkingDir: root, bundle: true, minify: !DEV, sourcemap: DEV, metafile: true, logLevel: 'warning', legalComments: 'none' };
  const js = await build({
    ...common,
    entryPoints: { main: 'src/js/main.js' },
    outdir: 'dist/assets',
    entryNames: '[name]-[hash]',
    chunkNames: 'c/[name]-[hash]',
    format: 'esm',
    splitting: true,
    target: 'es2020',
  });
  const css = await build({
    ...common,
    entryPoints: { main: 'src/css/main.css' },
    outdir: 'dist/assets',
    entryNames: '[name]-[hash]',
    external: ['/assets/*'],
    target: 'es2020',
  });
  const out = (meta, ext) => Object.keys(meta.outputs).find((f) => f.endsWith(ext) && !f.includes('/c/') && !f.endsWith('.map'));
  const jsFile = '/' + out(js.metafile, '.js').replace(/^dist\//, '');
  const cssFile = '/' + out(css.metafile, '.css').replace(/^dist\//, '');

  // 4) HTML prerenderizado
  const { renderPage, renderNotFound, renderLegalPages } = await import(pathToFileURL(path.join(root, 'src/templates/page.js')).href + `?t=${Date.now()}`);
  const assets = { js: jsFile, css: cssFile, fonts: fonts.map(([, f]) => `/assets/fonts/${f}`) };
  fs.writeFileSync(path.join(dist, 'index.html'), renderPage(assets));
  fs.writeFileSync(path.join(dist, '404.html'), renderNotFound(assets));
  for (const [name, html] of Object.entries(renderLegalPages(assets))) fs.writeFileSync(path.join(dist, name), html);

  // 5) sitemap + robots
  const { CONFIG } = await import(pathToFileURL(path.join(root, 'src/data/config.js')).href);
  const base = CONFIG.siteUrl.replace(/\/$/, '');
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`);
  fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);

  // 6) informe de pesos
  const files = Object.keys({ ...js.metafile.outputs, ...css.metafile.outputs }).filter((f) => !f.endsWith('.map'));
  let first = 0;
  const rows = files.map((f) => {
    const abs = path.join(root, f);
    const g = gz(abs);
    if (!f.includes('/c/') && f.endsWith('.js')) first += g;
    return `  ${rel(abs).padEnd(46)} ${kb(fs.statSync(abs).size).padStart(10)}  gzip ${kb(g).padStart(9)}`;
  });
  const htmlG = gz(path.join(dist, 'index.html'));
  console.log(`\nBuild OK${DEV ? ' (dev)' : ''}\n${rows.join('\n')}\n  index.html${' '.repeat(36)} ${kb(fs.statSync(path.join(dist, 'index.html')).size).padStart(10)}  gzip ${kb(htmlG).padStart(9)}\n`);
  return { jsFile, cssFile };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSite().catch((e) => { console.error(e); process.exit(1); });
}
