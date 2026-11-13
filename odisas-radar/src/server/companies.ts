import 'server-only';
import { nanoid } from 'nanoid';
import { sectorById } from '@/domain/catalog';
import { webStatusOf } from '@/domain/site';
import { clip, domainOf, fold, formatPhone, isSharedDomain, normName, normPhone, normalizeWebsite } from '@/domain/text';
import { CATEGORIES, PRIORITIES, SIZE_BANDS, STATUSES, WEB_STATUSES, sizeBandOf, type Candidate, type Category, type Company, type Fact, type FactStatus, type Facts, type SessionUser, type Status } from '@/domain/types';
import { nowIso, q, q1 } from './db';
import { HttpError } from './http';
import { camelize, insert, update } from './sql';

type Row = Record<string, unknown>;
export const toCompany = (row: Row) => camelize<Company>(row);

export async function getCompany(id: string): Promise<Company> {
  const row = await q1('SELECT * FROM companies WHERE id = $1', [id]);
  if (!row) throw new HttpError(404, 'Empresa no encontrada.');
  return toCompany(row);
}

// ——— Procedencia de los datos ———
const RANK: Record<FactStatus, number> = { no_encontrado: 0, estimado: 1, verificado: 2 };

/** Anota un dato con su procedencia. Un dato verificado nunca se sustituye por una estimación. */
export function setFact(facts: Facts, field: string, value: string | number | null | undefined, status: FactStatus, source: string, url?: string): boolean {
  const v = value == null ? '' : String(value).trim();
  const cur = facts[field];
  if (!v) {
    if (!cur) facts[field] = { value: '', status: 'no_encontrado', source, at: nowIso() };
    return false;
  }
  if (cur && cur.value && RANK[cur.status] > RANK[status]) return false;
  if (cur && cur.value === v && cur.status === status) return false;
  facts[field] = { value: clip(v, 600), status, source, ...(url ? { url } : {}), at: nowIso() } satisfies Fact;
  return true;
}

// ——— Exclusiones (RGPD / LSSI) ———
export async function isExcluded(c: { name?: string; website?: string; email?: string; phone?: string }): Promise<string | null> {
  const values: [string, string][] = [];
  if (c.name) values.push(['empresa', normName(c.name)]);
  const d = domainOf(c.website ?? '');
  if (d) values.push(['dominio', d]);
  if (c.email) values.push(['email', c.email.toLowerCase()], ['dominio', domainOf(c.email)]);
  if (c.phone && normPhone(c.phone)) values.push(['telefono', normPhone(c.phone)]);
  for (const [type, value] of values) {
    if (!value) continue;
    const hit = await q1<{ reason: string }>('SELECT reason FROM exclusions WHERE type = $1 AND value = $2', [type, value]);
    if (hit) return hit.reason || 'En la lista de exclusión';
  }
  return null;
}

export async function addExclusion(type: string, value: string, reason: string) {
  const v = type === 'empresa' ? normName(value) : type === 'telefono' ? normPhone(value) : type === 'dominio' ? domainOf(value) || value.trim().toLowerCase() : value.trim().toLowerCase();
  if (!v) throw new HttpError(400, 'Valor de exclusión no válido.');
  await q('INSERT INTO exclusions (id, type, value, reason, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (type, value) DO NOTHING', [nanoid(12), type, v, clip(reason, 200), nowIso()]);
  // Las empresas ya guardadas que coincidan dejan de poder contactarse.
  if (type === 'dominio') await q("UPDATE companies SET do_not_contact = TRUE WHERE domain = $1 OR lower(email) LIKE '%@' || $1", [v]);
  if (type === 'empresa') await q('UPDATE companies SET do_not_contact = TRUE WHERE norm_name = $1', [v]);
  if (type === 'email') await q('UPDATE companies SET do_not_contact = TRUE WHERE lower(email) = $1', [v]);
  if (type === 'telefono') await q('UPDATE companies SET do_not_contact = TRUE WHERE phone_norm = $1', [v]);
}

// ——— Duplicados ———
export async function findDuplicate(c: { name: string; website?: string; phone?: string; city?: string; sourceRef?: string; email?: string }, exceptId?: string): Promise<Company | null> {
  const not = exceptId ? ' AND id <> $2' : '';
  const args = (v: string) => (exceptId ? [v, exceptId] : [v]);
  if (c.sourceRef) {
    const r = await q1(`SELECT * FROM companies WHERE source_ref = $1${not} LIMIT 1`, args(c.sourceRef));
    if (r) return toCompany(r);
  }
  const domain = domainOf(c.website ?? '') || domainOf(c.email ?? '');
  if (domain && !isSharedDomain(domain)) {
    const r = await q1(`SELECT * FROM companies WHERE domain = $1${not} LIMIT 1`, args(domain));
    if (r) return toCompany(r);
  }
  const phone = normPhone(c.phone ?? '');
  if (phone) {
    const r = await q1(`SELECT * FROM companies WHERE phone_norm = $1${not} LIMIT 1`, args(phone));
    if (r) return toCompany(r);
  }
  const name = normName(c.name);
  if (name.length >= 3) {
    const rows = await q(`SELECT * FROM companies WHERE norm_name = $1${not}`, args(name));
    const city = fold(c.city ?? '');
    const hit = rows.map(toCompany).find((r) => !city || !r.city || fold(r.city) === city);
    if (hit) return hit;
  }
  return null;
}

// ——— Alta ———
function baseFacts(c: Candidate): Facts {
  const facts: Facts = {};
  const st = c.reliability;
  const src = c.source;
  const put = (f: string, v: string | number | null | undefined) => setFact(facts, f, v, st, src, c.sourceUrl);
  put('name', c.name);
  put('legalName', c.legalName);
  put('sector', sectorById(c.sector)?.label ?? c.sector);
  put('activity', c.activity);
  put('description', c.description);
  put('address', c.address);
  put('city', c.city);
  put('province', c.province);
  put('website', normalizeWebsite(c.website ?? ''));
  put('email', c.email);
  put('phone', c.phone ? formatPhone(c.phone) : '');
  put('employees', c.employees);
  if (c.branches && c.branches > 1) put('branches', c.branches);
  return facts;
}

export async function createCompany(c: Candidate, opts: { status?: Status; userId?: string | null } = {}): Promise<Company> {
  const website = normalizeWebsite(c.website ?? '');
  const now = nowIso();
  const id = nanoid(12);
  const row = {
    id,
    name: clip(c.name, 160),
    normName: normName(c.name),
    legalName: clip(c.legalName ?? '', 160),
    category: (c.category && c.category in CATEGORIES ? c.category : sectorById(c.sector)?.category) ?? 'otro',
    sector: c.sector ?? '',
    activity: clip(c.activity ?? '', 200),
    description: clip(c.description ?? '', 1200),
    address: clip(c.address ?? '', 240),
    city: clip(c.city ?? '', 80),
    province: clip(c.province ?? '', 80),
    postalCode: clip(c.postalCode ?? '', 12),
    country: c.country || 'España',
    lat: c.lat ?? null,
    lon: c.lon ?? null,
    website,
    domain: isSharedDomain(domainOf(website)) ? '' : domainOf(website),
    email: (c.email ?? '').toLowerCase().slice(0, 160),
    phone: c.phone ? formatPhone(c.phone) : '',
    phoneNorm: normPhone(c.phone ?? ''),
    socials: c.socials ?? {},
    employees: c.employees ?? null,
    sizeBand: sizeBandOf(c.employees),
    branches: Math.max(1, c.branches ?? 1),
    status: opts.status ?? 'nueva',
    webStatus: website ? 'desconocido' : 'sin_web',
    source: c.source,
    sourceRef: c.sourceRef ?? '',
    facts: baseFacts(c),
    createdAt: now,
    updatedAt: now,
  };
  await insert('companies', row);
  await addActivity(id, 'sistema', `Empresa añadida desde ${c.source}`, '', opts.userId ?? null);
  return getCompany(id);
}

/** Completa una ficha existente con los datos nuevos de una fuente, sin pisar lo que ya había. */
async function mergeCandidate(existing: Company, c: Candidate): Promise<void> {
  const patch: Record<string, unknown> = {};
  const facts = { ...existing.facts };
  const fill = (key: keyof Company, fact: string, value: string | number | null | undefined) => {
    if (value == null || value === '' || existing[key]) return;
    patch[key] = value;
    setFact(facts, fact, value, c.reliability, c.source, c.sourceUrl);
  };
  const website = normalizeWebsite(c.website ?? '');
  fill('website', 'website', website);
  if (patch.website) (patch.domain = isSharedDomain(domainOf(website)) ? '' : domainOf(website)), (patch.webStatus = 'desconocido');
  fill('email', 'email', c.email?.toLowerCase());
  fill('phone', 'phone', c.phone ? formatPhone(c.phone) : '');
  if (patch.phone) patch.phoneNorm = normPhone(c.phone ?? '');
  fill('address', 'address', c.address);
  fill('city', 'city', c.city);
  fill('province', 'province', c.province);
  fill('activity', 'activity', c.activity);
  fill('description', 'description', c.description);
  fill('employees', 'employees', c.employees);
  if (patch.employees) patch.sizeBand = sizeBandOf(c.employees);
  if ((c.branches ?? 1) > existing.branches) (patch.branches = c.branches), setFact(facts, 'branches', c.branches, c.reliability, c.source, c.sourceUrl);
  if (!Object.keys(patch).length) return;
  await update('companies', existing.id, { ...patch, facts, updatedAt: nowIso() });
}

/** Une los resultados que son la misma empresa (varias sedes de una cadena cuentan como delegaciones). */
export function groupCandidates(list: Candidate[]): Candidate[] {
  const groups = new Map<string, Candidate>();
  for (const c of list) {
    if (!c.name?.trim()) continue;
    const d = domainOf(c.website ?? '');
    const key = d && !isSharedDomain(d) ? `d:${d}` : `n:${normName(c.name)}`;
    const cur = groups.get(key);
    if (!cur) {
      groups.set(key, { ...c, branches: c.branches ?? 1 });
      continue;
    }
    cur.branches = (cur.branches ?? 1) + (c.branches ?? 1);
    for (const k of ['website', 'email', 'phone', 'address', 'city', 'province', 'activity', 'description'] as const) if (!cur[k] && c[k]) cur[k] = c[k];
  }
  return [...groups.values()];
}

export interface ImportResult {
  added: Company[];
  duplicates: { name: string; existingId: string }[];
  excluded: { name: string; reason: string }[];
}

export async function importCandidates(list: Candidate[], opts: { userId?: string | null; status?: Status } = {}): Promise<ImportResult> {
  const res: ImportResult = { added: [], duplicates: [], excluded: [] };
  for (const c of groupCandidates(list)) {
    const reason = await isExcluded(c);
    if (reason) {
      res.excluded.push({ name: c.name, reason });
      continue;
    }
    const dup = await findDuplicate(c);
    if (dup) {
      await mergeCandidate(dup, c);
      res.duplicates.push({ name: c.name, existingId: dup.id });
      continue;
    }
    res.added.push(await createCompany(c, opts));
  }
  return res;
}

// ——— Edición manual ———
const EDITABLE = ['name', 'legalName', 'taxId', 'category', 'sector', 'activity', 'description', 'address', 'city', 'province', 'postalCode', 'website', 'email', 'phone', 'contactFormUrl', 'employees', 'branches', 'contactPerson', 'nextFollowupAt', 'nextAction', 'notes', 'doNotContact', 'archived', 'lastChannel'] as const;
const FACT_OF: Record<string, string> = { contactFormUrl: 'contactForm' };

export async function updateCompany(id: string, input: Record<string, unknown>, user: SessionUser | null): Promise<Company> {
  const cur = await getCompany(id);
  const patch: Record<string, unknown> = {};
  const facts = { ...cur.facts };
  for (const k of EDITABLE) {
    if (input[k] === undefined) continue;
    let v: unknown = input[k];
    if (k === 'employees') v = v === '' || v == null ? null : Math.max(0, Math.round(Number(v))) || null;
    else if (k === 'branches') v = Math.max(1, Math.round(Number(v)) || 1);
    else if (k === 'doNotContact' || k === 'archived') v = !!v;
    else if (k === 'nextFollowupAt') v = v ? new Date(String(v)).toISOString() : null;
    else if (k === 'website') v = normalizeWebsite(String(v ?? ''));
    else if (k === 'category') v = String(v) in CATEGORIES ? v : cur.category;
    else if (k === 'phone') v = v ? formatPhone(String(v)) : '';
    else v = String(v ?? '').trim().slice(0, k === 'notes' || k === 'description' ? 4000 : 300);
    if (v === cur[k]) continue;
    patch[k] = v;
    const f = FACT_OF[k] ?? k;
    if (['name', 'legalName', 'taxId', 'sector', 'activity', 'description', 'address', 'city', 'province', 'website', 'email', 'phone', 'contactForm', 'employees', 'branches'].includes(f)) {
      // Lo que escribe una persona del equipo se da por comprobado.
      if (v === '' || v == null) delete facts[f];
      else facts[f] = { value: String(v), status: 'verificado', source: 'Introducido a mano', at: nowIso() };
    }
  }
  if (patch.name) {
    patch.normName = normName(String(patch.name));
    if (!patch.normName) throw new HttpError(400, 'El nombre es obligatorio.');
  }
  if (patch.website !== undefined) {
    const d = domainOf(String(patch.website));
    patch.domain = isSharedDomain(d) ? '' : d;
    patch.webStatus = patch.website ? 'desconocido' : 'sin_web';
    patch.audit = null;
  }
  if (patch.phone !== undefined) patch.phoneNorm = normPhone(String(patch.phone));
  if (patch.employees !== undefined) patch.sizeBand = sizeBandOf(patch.employees as number | null);
  if (patch.archived === false) patch.archiveReason = '';
  if (patch.name || patch.website || patch.phone) {
    const dup = await findDuplicate({ name: String(patch.name ?? cur.name), website: String(patch.website ?? cur.website), phone: String(patch.phone ?? cur.phone), city: String(patch.city ?? cur.city) }, id);
    if (dup) throw new HttpError(409, `Ya existe una ficha con esos datos: «${dup.name}».`);
  }
  if (Object.keys(patch).length) await update('companies', id, { ...patch, facts, updatedAt: nowIso() });
  if (input.status !== undefined && input.status !== cur.status) await setStatus(id, String(input.status) as Status, user?.id ?? null);
  return getCompany(id);
}

export async function setStatus(id: string, status: Status, userId: string | null, note = '') {
  if (!(status in STATUSES)) throw new HttpError(400, 'Estado no válido.');
  const cur = await getCompany(id);
  if (cur.status === status) return;
  await update('companies', id, { status, updatedAt: nowIso() });
  await addActivity(id, 'estado', `${STATUSES[cur.status]} → ${STATUSES[status]}`, note, userId, { from: cur.status, to: status });
}

export async function addActivity(companyId: string, type: string, summary: string, body: string, userId: string | null, data?: Record<string, unknown>, at?: string) {
  const id = nanoid(12);
  await insert('activities', { id, companyId, type, summary: clip(summary, 240), body: body.slice(0, 8000), data: data ?? null, at: at ?? nowIso(), userId });
  return id;
}

/** Borrado definitivo (derecho de supresión). Con `exclude`, además no volverá a importarse. */
export async function deleteCompany(id: string, exclude: boolean) {
  const c = await getCompany(id);
  if (exclude) {
    if (c.domain) await addExclusion('dominio', c.domain, 'Solicitud de supresión');
    else await addExclusion('empresa', c.name, 'Solicitud de supresión');
    if (c.email) await addExclusion('email', c.email, 'Solicitud de supresión');
  }
  await q('DELETE FROM companies WHERE id = $1', [id]);
}

// ——— Listado con filtros ———
export interface ListFilters {
  q?: string;
  status?: string[];
  priority?: string[];
  category?: string;
  sector?: string;
  province?: string;
  city?: string;
  webStatus?: string[];
  size?: string;
  minScore?: number;
  minEmployees?: number;
  hasWeb?: 'si' | 'no';
  oppAutomation?: boolean;
  oppAi?: boolean;
  multiBranch?: boolean;
  analyzed?: boolean;
  inCrm?: boolean;
  archived?: boolean;
  ids?: string[];
  sort?: 'score' | 'reciente' | 'nombre' | 'seguimiento';
  limit?: number;
  offset?: number;
}

export async function listCompanies(f: ListFilters): Promise<{ items: Company[]; total: number }> {
  const where: string[] = [];
  const p: unknown[] = [];
  const add = (sql: string, v: unknown) => (p.push(v), where.push(sql.replace('?', `$${p.length}`)));
  where.push(`archived = ${f.archived ? 'TRUE' : 'FALSE'}`);
  if (f.q) (p.push(`%${fold(f.q)}%`), where.push(`(norm_name LIKE $${p.length} OR lower(activity) LIKE $${p.length} OR lower(city) LIKE $${p.length} OR domain LIKE $${p.length})`));
  if (f.status?.length) add('status = ANY(?::text[])', f.status.filter((s) => s in STATUSES));
  if (f.priority?.length) add('priority = ANY(?::text[])', f.priority.filter((s) => s in PRIORITIES));
  if (f.webStatus?.length) add('web_status = ANY(?::text[])', f.webStatus.filter((s) => s in WEB_STATUSES));
  if (f.ids) add('id = ANY(?::text[])', f.ids);
  if (f.category && f.category in CATEGORIES) add('category = ?', f.category as Category);
  if (f.sector) add('sector = ?', f.sector);
  if (f.province) add('lower(province) = lower(?)', f.province);
  if (f.city) add('lower(city) = lower(?)', f.city);
  if (f.size && f.size in SIZE_BANDS) add('size_band = ?', f.size);
  if (f.minScore != null) add('score >= ?', f.minScore);
  if (f.minEmployees != null) add('employees >= ?', f.minEmployees);
  if (f.hasWeb === 'si') where.push("website <> ''");
  if (f.hasWeb === 'no') where.push("website = ''");
  if (f.oppAutomation) where.push('opp_automation');
  if (f.oppAi) where.push('opp_ai');
  if (f.multiBranch) where.push('branches > 1');
  if (f.analyzed === true) where.push('analyzed_at IS NOT NULL');
  if (f.analyzed === false) where.push('analyzed_at IS NULL');
  if (f.inCrm) where.push('in_crm');
  const order = { score: 'score DESC NULLS LAST, updated_at DESC', reciente: 'created_at DESC', nombre: 'norm_name', seguimiento: 'next_followup_at ASC NULLS LAST, last_contact_at ASC NULLS FIRST' }[f.sort ?? 'score'];
  const cond = where.join(' AND ');
  const total = (await q1<{ n: number }>(`SELECT COUNT(*)::int AS n FROM companies WHERE ${cond}`, p))!.n;
  const limit = Math.max(1, Math.min(500, f.limit ?? 100));
  const rows = await q(`SELECT * FROM companies WHERE ${cond} ORDER BY ${order} LIMIT ${limit} OFFSET ${Math.max(0, f.offset ?? 0)}`, p);
  return { items: rows.map(toCompany), total };
}

/** Versión ligera para tablas: sin el texto de la web ni el informe completo. */
export function summarize(c: Company) {
  const { audit, report, facts, scoreData, ...rest } = c;
  void facts;
  return {
    ...rest,
    webScore: audit?.score ?? null,
    why: report?.whyInterested ?? '',
    topServices: (report?.services ?? []).filter((s) => s.fit !== 'bajo').slice(0, 3).map((s) => s.id),
    engine: report?.engine ?? null,
    confidence: scoreData?.confidence ?? null,
  };
}
export type CompanySummary = ReturnType<typeof summarize>;

export const refreshWebStatus = (c: Company) => webStatusOf(c.website, c.audit);
