import type { Category, SearchQuery } from './types';
import { fold } from './text';

/**
 * Sectores de búsqueda. `osm` son los filtros de etiquetas de OpenStreetMap que
 * describen esa actividad; `keywords` permite reconocer el sector en texto libre.
 */
export interface Sector {
  id: string;
  label: string;
  category: Category;
  keywords: string[];
  osm: string[];
}

export const SECTORS: Sector[] = [
  { id: 'industria', label: 'Industria y fabricación', category: 'industrial', keywords: ['industrial', 'industriales', 'industria', 'fabrica', 'fabricas', 'fabricante', 'fabricantes', 'fabricacion', 'manufactura'], osm: ['man_made=works', 'industrial', 'craft', 'office=company'] },
  { id: 'metal', label: 'Metal y mecanizado', category: 'industrial', keywords: ['metal', 'metalurgia', 'mecanizado', 'mecanizados', 'calderer', 'soldadura', 'cerrajer'], osm: ['craft=metal_construction', 'craft=blacksmith', 'craft=welder', 'industrial=metal_processing', 'craft=locksmith'] },
  { id: 'alimentacion', label: 'Industria alimentaria', category: 'industrial', keywords: ['alimentaria', 'alimentacion', 'conservas', 'carnica', 'bodega', 'bodegas', 'panificadora', 'lacteos'], osm: ['industrial=food', 'craft=winery', 'craft=brewery', 'craft=distillery', 'industrial=slaughterhouse', 'craft=bakery'] },
  { id: 'madera', label: 'Madera y mueble', category: 'industrial', keywords: ['carpinteria', 'madera', 'mueble', 'muebles', 'ebanist'], osm: ['craft=carpenter', 'craft=joiner', 'craft=cabinet_maker', 'industrial=sawmill', 'shop=furniture'] },
  { id: 'construccion', label: 'Construcción y reformas', category: 'servicios', keywords: ['construccion', 'constructora', 'constructoras', 'reformas', 'albañil', 'fontaner', 'electricista', 'instalador', 'instaladores'], osm: ['office=construction_company', 'craft=builder', 'craft=plumber', 'craft=electrician', 'craft=hvac', 'craft=roofer', 'craft=painter'] },
  { id: 'logistica', label: 'Logística y transporte', category: 'distribucion', keywords: ['logistica', 'transporte', 'transportes', 'transportista', 'almacen', 'almacenes', 'paqueteria', 'mensajeria'], osm: ['office=logistics', 'industrial=logistics', 'industrial=warehouse', 'office=courier', 'office=moving_company', 'industrial=depot'] },
  { id: 'mayorista', label: 'Distribución y mayoristas', category: 'distribucion', keywords: ['distribuidor', 'distribuidora', 'distribuidoras', 'distribuidores', 'distribucion', 'mayorista', 'mayoristas', 'suministros', 'almacenista'], osm: ['shop=wholesale', 'wholesale', 'shop=trade', 'industrial=distributor'] },
  { id: 'peluqueria', label: 'Peluquería y estética profesional', category: 'distribucion', keywords: ['peluqueria', 'peluquerias', 'estetica', 'cosmetica', 'belleza', 'barberia'], osm: ['shop=hairdresser_supply', 'shop=cosmetics', 'shop=beauty', 'shop=hairdresser', 'shop=perfumery'] },
  { id: 'comercio', label: 'Comercio minorista', category: 'comercial', keywords: ['tienda', 'tiendas', 'comercio', 'comercios', 'comercial', 'comerciales', 'minorista'], osm: ['shop'] },
  { id: 'automocion', label: 'Automoción y talleres', category: 'comercial', keywords: ['taller', 'talleres', 'automocion', 'concesionario', 'concesionarios', 'recambios', 'neumaticos'], osm: ['shop=car', 'shop=car_repair', 'shop=car_parts', 'shop=tyres', 'shop=motorcycle'] },
  { id: 'hosteleria', label: 'Hostelería y turismo', category: 'servicios', keywords: ['restaurante', 'restaurantes', 'hotel', 'hoteles', 'hosteleria', 'catering', 'turismo', 'alojamiento'], osm: ['amenity=restaurant', 'tourism=hotel', 'tourism=guest_house', 'tourism=hostel', 'craft=caterer', 'shop=travel_agency'] },
  { id: 'salud', label: 'Clínicas y salud', category: 'servicios', keywords: ['clinica', 'clinicas', 'dental', 'dentista', 'fisioterapia', 'veterinari', 'optica', 'salud'], osm: ['amenity=clinic', 'amenity=dentist', 'amenity=veterinary', 'healthcare=physiotherapist', 'shop=optician', 'amenity=doctors'] },
  { id: 'asesoria', label: 'Asesorías y despachos', category: 'servicios', keywords: ['asesoria', 'asesorias', 'gestoria', 'gestorias', 'abogados', 'despacho', 'consultoria', 'consultora', 'contable'], osm: ['office=accountant', 'office=tax_advisor', 'office=lawyer', 'office=consulting', 'office=financial_advisor', 'office=notary'] },
  { id: 'inmobiliaria', label: 'Inmobiliarias', category: 'servicios', keywords: ['inmobiliaria', 'inmobiliarias', 'promotora', 'administrador de fincas'], osm: ['office=estate_agent', 'office=property_management'] },
  { id: 'seguros', label: 'Seguros y finanzas', category: 'servicios', keywords: ['seguros', 'correduria', 'aseguradora', 'financiera'], osm: ['office=insurance', 'office=financial'] },
  { id: 'formacion', label: 'Formación y academias', category: 'servicios', keywords: ['academia', 'academias', 'formacion', 'autoescuela', 'autoescuelas', 'idiomas'], osm: ['amenity=language_school', 'amenity=driving_school', 'office=educational_institution', 'amenity=training', 'amenity=music_school'] },
  { id: 'agro', label: 'Agricultura y ganadería', category: 'industrial', keywords: ['agricola', 'agricultura', 'ganaderia', 'cooperativa', 'agraria', 'vivero', 'viveros'], osm: ['shop=agrarian', 'craft=agricultural_engines', 'shop=garden_centre', 'industrial=agriculture', 'landuse=plant_nursery'] },
  { id: 'servicios', label: 'Servicios a empresas', category: 'servicios', keywords: ['servicios', 'limpieza', 'mantenimiento', 'seguridad', 'imprenta', 'publicidad', 'energia'], osm: ['office=company', 'office=cleaning', 'craft=cleaning', 'office=security', 'craft=printer', 'office=advertising_agency', 'office=energy_supplier', 'office=telecommunication'] },
];

export const sectorById = (id: string | undefined) => SECTORS.find((s) => s.id === id);

export const PROVINCES = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona', 'Bizkaia', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón',
  'Ceuta', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Gipuzkoa', 'Girona', 'Granada', 'Guadalajara', 'Huelva', 'Huesca', 'Illes Balears', 'Jaén', 'La Rioja', 'Las Palmas', 'León',
  'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla',
  'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza',
];
/** Códigos ISO 3166-2 de cada provincia (y de su comunidad, cuando es uniprovincial). */
export const PROVINCE_ISO: Record<string, string> = {
  'A Coruña': 'C', 'Álava': 'VI', Albacete: 'AB', Alicante: 'A', 'Almería': 'AL', Asturias: 'O|AS', 'Ávila': 'AV', Badajoz: 'BA', Barcelona: 'B', Bizkaia: 'BI', Burgos: 'BU', 'Cáceres': 'CC',
  'Cádiz': 'CA', Cantabria: 'S|CB', 'Castellón': 'CS', Ceuta: 'CE', 'Ciudad Real': 'CR', 'Córdoba': 'CO', Cuenca: 'CU', Gipuzkoa: 'SS', Girona: 'GI', Granada: 'GR', Guadalajara: 'GU',
  Huelva: 'H', Huesca: 'HU', 'Illes Balears': 'PM|IB', 'Jaén': 'J', 'La Rioja': 'LO|RI', 'Las Palmas': 'GC', 'León': 'LE', Lleida: 'L', Lugo: 'LU', Madrid: 'M|MD', 'Málaga': 'MA',
  Melilla: 'ML', Murcia: 'MU|MC', Navarra: 'NA|NC', Ourense: 'OR', Palencia: 'P', Pontevedra: 'PO', Salamanca: 'SA', 'Santa Cruz de Tenerife': 'TF', Segovia: 'SG', Sevilla: 'SE',
  Soria: 'SO', Tarragona: 'T', Teruel: 'TE', Toledo: 'TO', Valencia: 'V', Valladolid: 'VA', Zamora: 'ZA', Zaragoza: 'Z',
};
const PROVINCE_ALIASES: Record<string, string> = { vizcaya: 'Bizkaia', guipuzcoa: 'Gipuzkoa', 'la coruña': 'A Coruña', coruña: 'A Coruña', gerona: 'Girona', lerida: 'Lleida', orense: 'Ourense', baleares: 'Illes Balears', mallorca: 'Illes Balears', tenerife: 'Santa Cruz de Tenerife', araba: 'Álava', rioja: 'La Rioja' };

export function findProvince(text: string): string | null {
  const t = ` ${fold(text)} `;
  for (const [alias, name] of Object.entries(PROVINCE_ALIASES)) if (t.includes(` ${alias} `)) return name;
  const hit = [...PROVINCES].sort((a, b) => b.length - a.length).find((p) => t.includes(` ${fold(p)} `));
  return hit ?? null;
}

/** Filtros que solo pueden aplicarse después de investigar la empresa. */
export interface PostFilters {
  webOutdated?: boolean;
  automation?: boolean;
  ai?: boolean;
  multiBranch?: boolean;
}

/**
 * Convierte una búsqueda en lenguaje natural en filtros
 * («Empresas de logística de más de 20 trabajadores en Valencia»).
 */
export function parseQuery(text: string): { query: SearchQuery; post: PostFilters } {
  const raw = text.trim();
  const t = ` ${fold(raw).replace(/[.,;:¿?¡!]/g, ' ').replace(/\s+/g, ' ')} `;
  const query: SearchQuery = {};
  const post: PostFilters = {};
  let rest = t;
  const take = (re: RegExp) => {
    const m = rest.match(re);
    if (m) rest = rest.replace(re, ' ');
    return m;
  };

  if (take(/ (que no tienen|que no tengan|sin) (una )?(pagina |sitio )?web /)) query.web = 'sin_web';
  if (take(/ (con )?(paginas? |sitios? )?webs? (antiguas?|desactualizadas?|viejas?|obsoletas?|mejorables?) /)) post.webOutdated = true;
  if (take(/ (que podrian |que pueden |susceptibles de )?automatiza\w* (de )?(la |los |sus )?(atencion al cliente|procesos|pedidos|tareas)? /)) post.automation = true;
  if (take(/ (inteligencia artificial| ia ) /) || / beneficiarse de (la )?ia /.test(t)) post.ai = true;
  if (take(/ (con )?(varias|multiples) (delegaciones|sedes|establecimientos|tiendas) /)) post.multiBranch = true;
  const emp = take(/ (de |con )?mas de (\d+) (trabajadores|empleados|personas) /);
  if (emp) query.minEmployees = Number(emp[2]);

  const province = findProvince(rest);
  if (province) {
    query.province = province;
    rest = rest.replace(new RegExp(` (en |de |la provincia de )?${fold(province)} `), ' ');
  } else if (take(/ (en|de) (toda )?espana /)) {
    query.location = 'España';
  } else {
    const loc = take(/ en ([a-zñ ]{3,40}) $/);
    if (loc) query.city = loc[1].trim().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  }

  const words = rest.trim().split(' ');
  const sector = SECTORS.map((s) => ({ s, hits: s.keywords.filter((k) => words.some((w) => w === k || (k.length > 5 && w.startsWith(k)))).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)[0]?.s;
  if (sector) {
    query.sector = sector.id;
    query.category = sector.category;
  }
  const filler = new Set(['empresas', 'empresa', 'negocios', 'negocio', 'de', 'del', 'la', 'el', 'los', 'las', 'en', 'que', 'con', 'y', 'para', 'podrian', 'pueden', 'productos', 'buscar', 'encontrar', 'al', 'cliente']);
  const leftover = words.filter((w) => w && !filler.has(w) && !(sector?.keywords ?? []).some((k) => w === k || (k.length > 5 && w.startsWith(k))));
  if (leftover.length) query.activity = leftover.join(' ');
  return { query, post };
}
