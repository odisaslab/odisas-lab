/**
 * Revisa los datos editables y lista lo que sigue pendiente de confirmar con Sara.
 *   npm run check
 */
import { CONFIG } from '../src/data/config.js';
import { SERVICES, CATS } from '../src/data/services.js';
import { TEAM } from '../src/data/team.js';
import { STUDIO_PHOTOS, INSTAGRAM_POSTS } from '../src/data/media.js';
import { PROMOS } from '../src/data/promos.js';

let errors = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

console.log('\nServicios');
const ids = new Set();
SERVICES.forEach((s) => {
  if (ids.has(s.id)) err(`id repetido: ${s.id}`);
  ids.add(s.id);
  if (!CATS[s.cat]) err(`${s.id}: categoría desconocida «${s.cat}»`);
  if (typeof s.price !== 'number' || !(s.price > 0)) err(`${s.id}: precio no válido`);
  if (!s.dur) err(`${s.id}: falta la duración`);
  if (!s.desc) err(`${s.id}: falta la descripción`);
});
ok(`${SERVICES.length} servicios (${Object.keys(CATS).map((k) => `${CATS[k].short}: ${SERVICES.filter((s) => s.cat === k).length}`).join(', ')})`);
if (SERVICES.length !== 25) err('Booksy publicaba 25 servicios: revisa si falta o sobra alguno.');
const odd = SERVICES.filter((s) => s.price <= 1);
if (odd.length) console.log(`  ! Revisar con Sara: «${odd.map((s) => `${s.name} (${s.price} €)`).join('», «')}» (tal cual aparecía en Booksy).`);

console.log('\nDatos pendientes de Sara  [ DATOS PENDIENTES ]');
const pending = [];
if (!CONFIG.phone) pending.push('Teléfono (CONFIG.phone, phoneDisplay)');
if (!CONFIG.whatsapp) pending.push('WhatsApp (CONFIG.whatsapp)');
if (CONFIG.hours.some((h) => h.pending)) pending.push('Horario completo por días (CONFIG.hours)');
if (!CONFIG.siteUrlConfirmed) pending.push('Dominio definitivo (CONFIG.siteUrl → canonical, Open Graph, sitemap, Schema.org)');
if (!CONFIG.gtmId) pending.push('ID de Google Tag Manager (CONFIG.gtmId)');
if (!CONFIG.facebookConfirmed) pending.push('Confirmar que facebook.com/saramagicnails es su página (CONFIG.facebookConfirmed)');
if (!CONFIG.formEndpoint) pending.push('Servicio de formularios (CONFIG.formEndpoint); mientras tanto el formulario abre WhatsApp');
if (!CONFIG.voucherUrl) pending.push('Cómo vender vales y cobrarlos (CONFIG.voucherUrl); mientras tanto el vale se pide por WhatsApp');
TEAM.filter((m) => !m.bio).forEach((m) => pending.push(`Biografía de ${m.name}`));
TEAM.filter((m) => !m.photo).forEach((m) => pending.push(`Foto de ${m.name}`));
TEAM.filter((m) => m.pendingNote).forEach((m) => pending.push(`${m.name}: ${m.pendingNote}`));
const photos = STUDIO_PHOTOS.filter((p) => !p.file);
if (photos.length) pending.push(`Fotos del estudio (${photos.map((p) => p.label.toLowerCase()).join(', ')})`);
if (!INSTAGRAM_POSTS.length) pending.push('Trabajos reales para «See the work» (INSTAGRAM_POSTS)');
if (!PROMOS.length) pending.push('Promociones activas, si las hay (PROMOS)');
pending.push('Logo y colores de marca (para confirmar o ajustar la paleta)', 'Textos legales: aviso legal, privacidad y cookies', 'Revisar precios y duraciones de la tabla de tarifas');
pending.forEach((p) => console.log('  · ' + p));

console.log(errors ? `\n${errors} error(es) en los datos.\n` : '\nDatos correctos.\n');
process.exit(errors ? 1 : 0);
