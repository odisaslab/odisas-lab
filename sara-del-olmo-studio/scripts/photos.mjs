/**
 * Fotos reales → imágenes optimizadas (AVIF + WebP + JPG, varios anchos) y manifiesto para las plantillas.
 *   1. Copia los originales a  photos-src/  (jpg, jpeg, png, tiff, heic si tu sharp lo soporta).
 *   2. npm run photos
 *   3. En src/data/media.js o team.js usa el nombre sin extensión:  file: 'mesa-de-trabajo'
 * Genera public/img/<nombre>-<ancho>.{avif,webp,jpg} y src/data/photo-manifest.json.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'photos-src');
const out = path.join(root, 'public', 'img');
const manifestFile = path.join(root, 'src', 'data', 'photo-manifest.json');
const WIDTHS = [480, 960, 1600];

fs.mkdirSync(src, { recursive: true });
fs.mkdirSync(out, { recursive: true });
const files = fs.readdirSync(src).filter((f) => /\.(jpe?g|png|tiff?|webp|avif|heic)$/i.test(f));
if (!files.length) { console.log('No hay fotos en photos-src/. Copia ahí los originales y vuelve a ejecutar.'); process.exit(0); }

const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};
for (const f of files) {
  const name = path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const img = sharp(path.join(src, f), { failOn: 'none' }).rotate(); // respeta la orientación EXIF
  const meta = await img.metadata();
  const widths = WIDTHS.filter((w) => w <= (meta.width || 99999)).length ? WIDTHS.filter((w) => w <= meta.width) : [meta.width];
  for (const w of widths) {
    const base = img.clone().resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 52, effort: 5 }).toFile(path.join(out, `${name}-${w}.avif`));
    await base.clone().webp({ quality: 74 }).toFile(path.join(out, `${name}-${w}.webp`));
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, `${name}-${w}.jpg`));
  }
  const rotated = meta.orientation && meta.orientation >= 5;
  manifest[name] = { w: rotated ? meta.height : meta.width, h: rotated ? meta.width : meta.height, widths };
  console.log(`✓ ${name}  (${widths.join(', ')} px)`);
}
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nManifiesto actualizado. Ahora pon  file: '<nombre>'  en la entrada correspondiente y ejecuta npm run build.`);
