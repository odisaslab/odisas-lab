import 'server-only';
import { z } from 'zod';
import { PROVINCE_ISO, SECTORS, findProvince, sectorById } from '@/domain/catalog';
import { fold } from '@/domain/text';
import { CATEGORIES, type Candidate, type Category, type SearchQuery } from '@/domain/types';
import { AiError, aiAvailable, extractJson, webResearch } from '../ai/client';
import { HttpError } from '../http';
import { getSettings } from '../settings';

/**
 * Proveedores de datos. Para añadir otro (un directorio de pago, un registro
 * mercantil…) basta implementar SearchProvider y registrarlo en PROVIDERS: el
 * resto de la aplicación solo conoce esta interfaz.
 */
export interface SearchProvider {
  id: string;
  label: string;
  description: string;
  /** Qué hace falta para activarlo; cadena vacía si funciona sin configurar nada. */
  requires: string;
  license: string;
  available(): Promise<boolean>;
  search(query: SearchQuery): Promise<Candidate[]>;
}

// ——— OpenStreetMap (Overpass + Nominatim) ———
const NOMINATIM = () => process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

async function osmHeaders() {
  const contact = (await getSettings()).osmContact;
  return { 'user-agent': `OdisasRadar/1.0${contact ? ` (${contact})` : ''}`, accept: 'application/json', 'accept-language': 'es' };
}

const ES_AREA = 'area["ISO3166-1"="ES"][admin_level=2]';

/**
 * Zona de búsqueda en el lenguaje de Overpass. Las provincias se resuelven por su
 * código ISO, sin llamar a ningún otro servicio; las ciudades, con Nominatim y, si
 * este no responde, buscando el municipio por su nombre dentro de la provincia.
 */
async function areaClause(q: SearchQuery): Promise<{ clause: string; label: string }> {
  const province = q.province ? findProvince(q.province) : null;
  const iso = province ? PROVINCE_ISO[province] : '';
  const provinceArea = iso ? `area["ISO3166-2"~"^ES-(${iso})$"]` : '';
  const city = (q.city || (!province && q.location && !/^espa[nñ]a$/i.test(q.location.trim()) ? q.location : '') || (!iso ? q.province : '') || '').trim();
  if (!city) return { clause: `${provinceArea || ES_AREA}->.a;`, label: province ?? 'España' };

  const url = `${NOMINATIM()}/search?format=jsonv2&limit=1&countrycodes=es&q=${encodeURIComponent(province ? `${city}, ${province}` : city)}`;
  try {
    const res = await fetch(url, { headers: await osmHeaders(), signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const hit = ((await res.json()) as { osm_type: string; osm_id: number; display_name: string; boundingbox?: string[] }[])[0];
    if (hit?.osm_type === 'relation') return { clause: `area(${3600000000 + hit.osm_id})->.a;`, label: hit.display_name };
    if (hit?.osm_type === 'way') return { clause: `area(${2400000000 + hit.osm_id})->.a;`, label: hit.display_name };
    const [s2, n, w, e] = hit?.boundingbox ?? [];
    if (s2) return { clause: '', label: `${hit.display_name}|${s2},${w},${n},${e}` };
  } catch (error) {
    console.error('[osm] Nominatim no disponible; se busca el municipio por nombre', error instanceof Error ? error.message : error);
  }
  const name = city.replace(/["\\]/g, '').replace(/[.*+?^${}()|[\]]/g, '.');
  return { clause: `${provinceArea || ES_AREA}->.p;rel(area.p)["boundary"="administrative"]["admin_level"~"^(7|8)$"]["name"~"^${name}$",i];map_to_area->.a;`, label: city };
}

const OVERPASS_MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

/** Lanza la consulta en el servidor de Overpass y, si falla o está saturado, prueba con los espejos. */
async function overpass(query: string): Promise<OsmElement[]> {
  const endpoints = process.env.OVERPASS_URL ? process.env.OVERPASS_URL.split(',').map((u) => u.trim()) : OVERPASS_MIRRORS;
  const headers = { ...(await osmHeaders()), 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' };
  let reason = 'sin respuesta';
  let busy = false;
  for (const endpoint of endpoints) {
    const host = new URL(endpoint).host;
    try {
      const res = await fetch(endpoint, { method: 'POST', headers, body: 'data=' + encodeURIComponent(query), signal: AbortSignal.timeout(45000) });
      const text = await res.text();
      if (!res.ok) {
        busy ||= res.status === 429 || res.status === 504;
        reason = `${host} respondió ${res.status}`;
        console.error('[osm] Overpass', reason, text.slice(0, 300).replace(/\s+/g, ' '));
        // Un 400 es un error de la consulta: repetirla en otro servidor no lo arregla.
        if (res.status === 400) break;
        continue;
      }
      const data = JSON.parse(text) as { elements?: OsmElement[]; remark?: string };
      if (data.remark && /timed out|out of memory|runtime error/i.test(data.remark) && !data.elements?.length) {
        busy = true;
        reason = `${host}: ${data.remark.slice(0, 120)}`;
        console.error('[osm] Overpass', reason);
        continue;
      }
      return data.elements ?? [];
    } catch (error) {
      reason = `${host}: ${error instanceof Error ? (error.name === 'TimeoutError' ? 'tiempo de espera agotado' : error.message) : 'error de conexión'}`;
      console.error('[osm] Overpass', reason);
    }
  }
  console.error('[osm] consulta fallida:', query.slice(0, 600));
  if (busy) throw new HttpError(503, `OpenStreetMap está saturado o la zona es demasiado grande (${reason}). Prueba con una provincia o una ciudad concretas, o inténtalo en unos minutos.`);
  throw new HttpError(502, `No se ha podido consultar OpenStreetMap (${reason}).`);
}

const esc = (v: string) => v.replace(/["\\]/g, '');
const tagFilter = (t: string) => (t.includes('=') ? `["${esc(t.split('=')[0])}"="${esc(t.split('=')[1])}"]` : `["${esc(t)}"]`);

export function overpassQuery(q: SearchQuery, area: { clause: string; label: string }, limit: number): string {
  const scope = area.clause ? '(area.a)' : `(${area.label.split('|')[1]})`;
  const sector = sectorById(q.sector);
  const extra = `["name"]${q.web === 'sin_web' ? '[!"website"][!"contact:website"][!"url"]' : ''}${q.name ? `["name"~"${esc(q.name)}",i]` : ''}`;
  let tags: string[];
  if (sector) tags = sector.osm.map(tagFilter);
  else if (q.category && q.category !== 'otro') tags = [...new Set(SECTORS.filter((s) => s.category === q.category).flatMap((s) => s.osm))].slice(0, 14).map(tagFilter);
  else tags = ['["office"]', '["shop"]', '["craft"]', '["industrial"]', '["man_made"="works"]'];
  // Sin sector, el texto de actividad se busca en el nombre del negocio.
  const words = !sector && q.activity ? q.activity.split(/\s+/).filter((w) => w.length >= 4).slice(0, 4) : [];
  const byWord = words.length ? `["name"~"${words.map((w) => esc(fold(w))).join('|')}",i]` : '';
  if (!sector && !q.category && !q.name && !words.length) throw new HttpError(400, 'Indica al menos un sector, un tipo de empresa, una actividad o un nombre.');
  return `[out:json][timeout:50];${area.clause}(${tags.map((t) => `nwr${t}${extra}${byWord}${scope};`).join('')});out tags center ${limit};`;
}

interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const OSM_ACTIVITY: Record<string, string> = { hairdresser_supply: 'productos de peluquería', trade: 'Suministros profesionales', wholesale: 'Venta al por mayor', logistics: 'Logística', works: 'Fábrica', company: 'Oficina de empresa', car_repair: 'Taller de automóviles', estate_agent: 'Inmobiliaria', accountant: 'Asesoría contable', construction_company: 'Constructora', warehouse: 'Almacén', carpenter: 'Carpintería', metal_construction: 'Construcciones metálicas' };

export function osmToCandidate(el: OsmElement, q: SearchQuery): Candidate | null {
  const t = el.tags ?? {};
  if (!t.name) return null;
  const kind = t.industrial || t.craft || t.office || t.shop || t.amenity || t.man_made || t.tourism || t.healthcare || '';
  const sector = sectorById(q.sector);
  const category: Category = sector?.category ?? (t.industrial || t.man_made === 'works' || t.craft ? 'industrial' : t.shop === 'wholesale' || t.wholesale ? 'distribucion' : t.shop ? 'comercial' : t.office || t.amenity ? 'servicios' : (q.category as Category) || 'otro');
  const emp = Number(t.employees);
  return {
    name: t.name,
    legalName: t.operator && /S\.?[LA]\.?/.test(t.operator) ? t.operator : undefined,
    category,
    sector: sector?.id ?? '',
    activity: [OSM_ACTIVITY[kind] ?? (kind && kind !== 'yes' ? kind.replace(/_/g, ' ') : ''), t.wholesale && t.wholesale !== 'yes' ? (OSM_ACTIVITY[t.wholesale] ?? t.wholesale.replace(/_/g, ' ')) : '', t.product?.replace(/[_;]/g, ' ') ?? ''].filter(Boolean).join(' · ') || q.activity || '',
    description: t['description:es'] || t.description || '',
    address: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', '),
    city: t['addr:city'] || q.city || '',
    province: t['addr:province'] || q.province || '',
    postalCode: t['addr:postcode'] || '',
    lat: el.lat ?? el.center?.lat ?? null,
    lon: el.lon ?? el.center?.lon ?? null,
    website: t.website || t['contact:website'] || t.url || '',
    email: t.email || t['contact:email'] || '',
    phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
    employees: Number.isFinite(emp) && emp > 0 ? emp : null,
    socials: Object.fromEntries(Object.entries({ facebook: t['contact:facebook'], instagram: t['contact:instagram'], linkedin: t['contact:linkedin'] }).filter(([, v]) => v)) as Record<string, string>,
    source: 'OpenStreetMap',
    sourceRef: `osm:${el.type}/${el.id}`,
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    reliability: 'verificado',
  };
}

const osm: SearchProvider = {
  id: 'osm',
  label: 'OpenStreetMap',
  description: 'Negocios y empresas cartografiados, con dirección y, cuando constan, web, teléfono y correo. Cobertura desigual: mejor en comercio y servicios que en industria.',
  requires: '',
  license: 'Datos abiertos © colaboradores de OpenStreetMap (licencia ODbL). Uso permitido citando la fuente.',
  available: async () => true,
  async search(q) {
    const limit = Math.max(1, Math.min(300, q.limit ?? 60));
    const elements = await overpass(overpassQuery(q, await areaClause(q), limit * 3));
    let list = elements.map((e) => osmToCandidate(e, q)).filter((c): c is Candidate => !!c);
    if (q.web === 'con_web') list = list.filter((c) => c.website);
    if (q.minEmployees) list = list.filter((c) => (c.employees ?? 0) >= q.minEmployees!);
    return list.slice(0, limit);
  },
};

// ——— Búsqueda con IA y búsqueda web ———
const IaCandidate = z.object({
  name: z.string(),
  website: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  activity: z.string().optional(),
  description: z.string().optional(),
  employees: z.number().nullable().optional(),
  sourceUrl: z.string(),
});

const ia: SearchProvider = {
  id: 'ia',
  label: 'Búsqueda con IA',
  description: 'Claude busca en internet empresas que encajen con la descripción y devuelve cada una con la página donde la ha encontrado. Útil para nichos que los mapas no cubren (por ejemplo, «distribuidoras de productos de peluquería en España»).',
  requires: 'Clave de la API de Anthropic',
  license: 'Resultados de búsqueda web pública a través de Anthropic. Cada empresa conserva el enlace de origen; los datos quedan como estimados hasta comprobarlos en la web de la empresa.',
  available: aiAvailable,
  async search(q) {
    const limit = Math.max(1, Math.min(40, q.limit ?? 20));
    const sector = sectorById(q.sector);
    const what = [q.text, sector?.label, q.activity, q.category ? `empresas de tipo ${CATEGORIES[q.category as Category]?.toLowerCase()}` : '', q.name ? `nombre parecido a «${q.name}»` : ''].filter(Boolean).join('; ');
    const where = [q.city, q.province, q.location].filter(Boolean).join(', ') || 'España';
    if (!what) throw new HttpError(400, 'Describe qué empresas buscas.');
    try {
      const { text, sources } = await webResearch(
        'Localizas empresas reales para prospección comercial B2B en España. Solo incluyes empresas que has visto en los resultados de búsqueda: nunca completas la lista de memoria ni inventas webs, direcciones o cifras. Si un dato no aparece en los resultados, lo omites. Prefieres la web propia de la empresa a un directorio.',
        `Busca hasta ${limit} empresas que cumplan: ${what}. Zona: ${where}.${q.minEmployees ? ` Con más de ${q.minEmployees} empleados cuando ese dato esté publicado.` : ''}${q.web === 'sin_web' ? ' Interesan las que NO tienen web propia.' : ''}

Termina tu respuesta con un único bloque \`\`\`json que contenga un array de objetos con estas claves: "name" (nombre comercial), "website" (web propia, si la has visto), "city", "province", "activity" (a qué se dedica, en pocas palabras), "description" (una frase, solo con lo que dice la fuente), "employees" (número, solo si la fuente lo publica; si no, null), "sourceUrl" (la página exacta donde has visto la empresa). No añadas empresas sin sourceUrl.`,
        6,
      );
      const parsed = z.array(IaCandidate).safeParse(extractJson(text));
      if (!parsed.success) throw new AiError('La IA no ha devuelto una lista de empresas utilizable. Vuelve a intentarlo o concreta más la búsqueda.');
      const seen = new Set(sources.map((s) => s.url));
      return parsed.data.slice(0, limit).map(
        (c): Candidate => ({
          name: c.name,
          website: c.website,
          city: c.city || q.city,
          province: c.province || q.province,
          activity: c.activity,
          description: c.description,
          employees: c.employees ?? null,
          category: sector?.category ?? (q.category as Category) ?? undefined,
          sector: sector?.id,
          source: seen.has(c.sourceUrl) ? 'Búsqueda web (IA)' : 'Búsqueda web (IA, fuente sin confirmar)',
          sourceUrl: c.sourceUrl,
          reliability: 'estimado',
        }),
      );
    } catch (error) {
      if (error instanceof AiError) throw new HttpError(502, error.message);
      throw error;
    }
  },
};

// ——— Importación de un listado propio (CSV) ———
const ALIASES: Record<string, keyof Candidate> = {
  nombre: 'name', empresa: 'name', name: 'name', 'nombre comercial': 'name', company: 'name',
  'razon social': 'legalName', web: 'website', website: 'website', 'pagina web': 'website', url: 'website',
  email: 'email', correo: 'email', 'e-mail': 'email', telefono: 'phone', phone: 'phone', tel: 'phone',
  direccion: 'address', address: 'address', ciudad: 'city', localidad: 'city', municipio: 'city', city: 'city', provincia: 'province', province: 'province',
  cp: 'postalCode', 'codigo postal': 'postalCode', sector: 'sector', actividad: 'activity', activity: 'activity', descripcion: 'description',
  empleados: 'employees', trabajadores: 'employees', employees: 'employees', tipo: 'category',
};

export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const first = clean.split(/\r?\n/)[0] ?? '';
  const sep = (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ';' : first.includes('\t') && !first.includes(',') ? '\t' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') (cell += '"'), i++;
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) (row.push(cell.trim()), (cell = ''));
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some((c) => c)) rows.push(row);
      (row = []), (cell = '');
    } else cell += ch;
  }
  row.push(cell.trim());
  if (row.some((c) => c)) rows.push(row);
  return rows;
}

export function csvToCandidates(text: string, sourceLabel: string): Candidate[] {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new HttpError(400, 'El archivo necesita una fila de cabeceras y al menos una empresa.');
  const cols = rows[0].map((h) => ALIASES[fold(h).trim()]);
  if (!cols.includes('name')) throw new HttpError(400, 'No se encuentra la columna con el nombre de la empresa (cabecera «Nombre» o «Empresa»).');
  return rows
    .slice(1)
    .map((r) => {
      const c: Record<string, unknown> = { source: sourceLabel || 'Listado importado', reliability: 'estimado' };
      cols.forEach((k, i) => {
        if (!k || !r[i]) return;
        if (k === 'employees') c.employees = Number(r[i].replace(/\D/g, '')) || null;
        else if (k === 'sector') (c.sector = SECTORS.find((s) => fold(s.label) === fold(r[i]) || s.id === fold(r[i]))?.id ?? ''), (c.activity ??= r[i]);
        else if (k === 'category') c.category = (Object.keys(CATEGORIES) as Category[]).find((x) => fold(CATEGORIES[x]) === fold(r[i]) || x === fold(r[i]));
        else c[k] = r[i];
      });
      return c as unknown as Candidate;
    })
    .filter((c) => c.name);
}

export const PROVIDERS: SearchProvider[] = [osm, ia];
export const providerById = (id: string | undefined) => PROVIDERS.find((p) => p.id === id);
