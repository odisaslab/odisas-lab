import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { parseQuery, type PostFilters } from '@/domain/catalog';
import { staleInfo } from '@/domain/score';
import { ACTIVITY_TYPES, MESSAGE_KINDS, PIPELINE_COLUMNS, STATUSES, type Activity, type Candidate, type Message, type MessageKind, type Role, type SearchQuery, type SessionUser, type Signal, type Status, type Task } from '@/domain/types';
import { aiAvailable } from './ai/client';
import { analyzeCompany, draftMessage } from './ai/analyze';
import { checkSetupCode, countUsers, createUser, currentUser, endSession, listUsers, login, setupCodeRequired, startSession, updateUser } from './auth';
import { describeAutomation, listAutomations, runAutomation, saveAutomation, tick } from './automations';
import { addActivity, addExclusion, createCompany, deleteCompany, findDuplicate, getCompany, importCandidates, isExcluded, listCompanies, setStatus, summarize, toCompany, updateCompany, type ListFilters } from './companies';
import { addContact, crmConfigured, listContacts, saveToCrm, syncCompany } from './crm';
import { dbMode, nowIso, q, q1 } from './db';
import { HttpError, json, readJson, str } from './http';
import { createTask, enqueue, findNews, jobCounts, workJobs } from './jobs';
import { mailConfigured, sendMail } from './mail';
import { csvToCandidates, PROVIDERS, providerById } from './providers';
import { companiesCsv, generateReport } from './reports';
import { researchCompany } from './research';
import { anthropicKey, getSecret, getSettings, maskSecret, saveSettings, setSecret } from './settings';
import { camelize, update } from './sql';
import { dashboard, staleCompanies } from './stats';

type Body = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
interface Ctx {
  req: Request;
  user: SessionUser;
  p: Record<string, string>;
  query: URLSearchParams;
  body: Body;
}
type Handler = (c: Ctx) => Promise<unknown>;
const routes: { method: string; parts: string[]; fn: Handler; open?: boolean; admin?: boolean }[] = [];
const on = (method: string, path: string, fn: Handler, opts: { open?: boolean; admin?: boolean } = {}) => routes.push({ method, parts: path.split('/').filter(Boolean), fn, ...opts });

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : undefined);
const flag = (v: string | null) => (v === '1' || v === 'true' ? true : v === '0' || v === 'false' ? false : undefined);

// ——— Sesión ———
on('GET', '/auth/status', async () => ({ needsSetup: (await countUsers()) === 0, setupCode: setupCodeRequired(), user: await currentUser() }), { open: true });
on('POST', '/auth/setup', async ({ body }) => {
  if ((await countUsers()) > 0) throw new HttpError(409, 'La cuenta de administración ya existe.');
  checkSetupCode(str(body.code, 200));
  const user = await createUser({ email: str(body.email), name: str(body.name), role: 'admin', password: String(body.password ?? '') });
  await startSession(user.id);
  if (str(body.name)) await saveSettings({ sender: { ...(await getSettings()).sender, name: str(body.name), email: str(body.email) } });
  return { user };
}, { open: true });
on('POST', '/auth/login', async ({ body }) => ({ user: await login(str(body.email), String(body.password ?? '')) }), { open: true });
on('POST', '/auth/logout', async () => (await endSession(), { ok: true }), { open: true });
on('GET', '/health', async () => ({ ok: true, db: await dbMode() }), { open: true });

// El cron de Vercel envía «Authorization: Bearer CRON_SECRET».
on('GET', '/cron/tick', async ({ req }) => {
  const secret = process.env.CRON_SECRET ?? '';
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  if (!secret || got.length !== want.length || !timingSafeEqual(got, want)) throw new HttpError(401, 'No autorizado.');
  return tick();
}, { open: true });

// ——— Contexto general ———
on('GET', '/meta', async ({ user }) => ({
  user,
  ai: await aiAvailable(),
  mail: mailConfigured(),
  crm: await crmConfigured(),
  db: await dbMode(),
  cron: !!process.env.CRON_SECRET,
  jobs: await jobCounts(),
  providers: await Promise.all(PROVIDERS.map(async (p) => ({ id: p.id, label: p.label, description: p.description, requires: p.requires, license: p.license, available: await p.available() }))),
  followupDays: (await getSettings()).followupDays,
}));
on('GET', '/dashboard', () => dashboard());

// ——— Búsqueda ———
on('POST', '/search/parse', async ({ body }) => parseQuery(str(body.text, 300)));
on('POST', '/search', async ({ body, user }) => {
  const provider = providerById(str(body.provider) || 'osm');
  if (!provider) throw new HttpError(400, 'Fuente de datos no válida.');
  if (!(await provider.available())) throw new HttpError(400, `La fuente «${provider.label}» no está activa. Necesita: ${provider.requires}.`);
  const query = (body.query ?? {}) as SearchQuery;
  const found = await provider.search({ ...query, limit: Math.max(1, Math.min(provider.id === 'ia' ? 40 : 200, Number(query.limit) || 40)) });
  return finishImport(found, user, { provider: provider.id, query, autoAnalyze: body.autoAnalyze !== false, post: body.post });
});
on('POST', '/import/csv', async ({ body, user }) => finishImport(csvToCandidates(String(body.text ?? ''), str(body.source, 80)), user, { provider: 'csv', query: {}, autoAnalyze: !!body.autoAnalyze }));

async function finishImport(found: Candidate[], user: SessionUser, o: { provider: string; query: SearchQuery; autoAnalyze: boolean; post?: PostFilters }) {
  const res = await importCandidates(found, { userId: user.id });
  const queued = o.autoAnalyze ? await enqueue(res.added.map((c) => c.id), { research: true, analyze: true }) : 0;
  const id = nanoid(12);
  await q('INSERT INTO searches (id, query, provider, found, added, duplicates, user_id, created_at) VALUES ($1,$2::jsonb,$3,$4,$5,$6,$7,$8)', [id, JSON.stringify({ ...o.query, post: o.post }), o.provider, found.length, res.added.length, res.duplicates.length, user.id, nowIso()]);
  return { searchId: id, found: found.length, added: res.added.map(summarize), duplicates: res.duplicates, excluded: res.excluded, queued, ids: [...res.added.map((c) => c.id), ...res.duplicates.map((d) => d.existingId)] };
}
on('GET', '/searches', async () => q('SELECT * FROM searches ORDER BY created_at DESC LIMIT 15'));

// ——— Empresas ———
on('GET', '/companies', async ({ query: s }) => {
  const f: ListFilters = {
    q: s.get('q') ?? undefined, status: list(s.get('status')), priority: list(s.get('priority')), webStatus: list(s.get('webStatus')), ids: list(s.get('ids')),
    category: s.get('category') ?? undefined, sector: s.get('sector') ?? undefined, province: s.get('province') ?? undefined, city: s.get('city') ?? undefined, size: s.get('size') ?? undefined,
    minScore: s.get('minScore') ? Number(s.get('minScore')) : undefined, minEmployees: s.get('minEmployees') ? Number(s.get('minEmployees')) : undefined,
    hasWeb: (s.get('hasWeb') as 'si' | 'no' | null) ?? undefined, oppAutomation: flag(s.get('oppAutomation')), oppAi: flag(s.get('oppAi')), multiBranch: flag(s.get('multiBranch')),
    analyzed: flag(s.get('analyzed')), inCrm: flag(s.get('inCrm')), archived: flag(s.get('archived')), sort: (s.get('sort') as ListFilters['sort']) ?? undefined,
    limit: s.get('limit') ? Number(s.get('limit')) : 100, offset: s.get('offset') ? Number(s.get('offset')) : 0,
  };
  const { items, total } = await listCompanies(f);
  return { items: items.map(summarize), total };
});
on('POST', '/companies', async ({ body, user }) => {
  const c: Candidate = { name: str(body.name, 160), website: str(body.website), email: str(body.email), phone: str(body.phone), city: str(body.city), province: str(body.province), sector: str(body.sector), activity: str(body.activity), category: body.category, source: 'Introducido a mano', reliability: 'verificado' };
  if (!c.name) throw new HttpError(400, 'El nombre de la empresa es obligatorio.');
  const excluded = await isExcluded(c);
  if (excluded) throw new HttpError(409, `Esta empresa está en la lista de exclusión (${excluded}).`);
  const dup = await findDuplicate(c);
  if (dup) return NextResponse.json({ error: `Ya existe una ficha de «${dup.name}».`, existingId: dup.id }, { status: 409 });
  const created = await createCompany(c, { userId: user.id });
  if (body.autoAnalyze !== false) await enqueue([created.id], { research: true, analyze: true });
  return { company: summarize(created) };
});
on('GET', '/companies/:id', async ({ p }) => {
  const company = await getCompany(p.id);
  const { followupDays } = await getSettings();
  return {
    company,
    contacts: await listContacts(p.id),
    activities: (await q('SELECT a.*, u.name AS user_name FROM activities a LEFT JOIN users u ON u.id = a.user_id WHERE a.company_id = $1 ORDER BY a.at DESC LIMIT 200', [p.id])).map((r) => camelize<Activity>(r)),
    tasks: (await q('SELECT * FROM tasks WHERE company_id = $1 ORDER BY done, due_at NULLS LAST', [p.id])).map((r) => camelize<Task>(r)),
    messages: (await q('SELECT * FROM messages WHERE company_id = $1 ORDER BY created_at DESC', [p.id])).map((r) => camelize<Message>(r)),
    signals: (await q('SELECT * FROM signals WHERE company_id = $1 ORDER BY detected_at DESC', [p.id])).map((r) => camelize<Signal>(r)),
    stale: staleInfo(company, followupDays),
    job: await q1("SELECT status, error FROM jobs WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1", [p.id]),
  };
});
on('PATCH', '/companies/:id', async ({ p, body, user }) => {
  const before = await getCompany(p.id);
  const company = await updateCompany(p.id, body, user);
  if (company.inCrm) void syncCompany(p.id, before.status !== company.status ? 'company.status' : 'company.updated');
  return { company };
});
on('DELETE', '/companies/:id', async ({ p, query }) => (await deleteCompany(p.id, query.get('exclude') === '1'), { ok: true }));
on('POST', '/companies/:id/research', async ({ p }) => ({ company: await researchCompany(p.id) }));
on('POST', '/companies/:id/analyze', async ({ p, body }) => {
  const c = await getCompany(p.id);
  if (body.research || !c.researchedAt) await researchCompany(p.id);
  return { company: await analyzeCompany(p.id) };
});
on('POST', '/companies/:id/news', async ({ p }) => {
  if (!(await aiAvailable())) throw new HttpError(400, 'La búsqueda de noticias necesita la clave de IA.');
  return { found: await findNews(p.id) };
});
on('POST', '/companies/:id/crm', async ({ p, body, user }) => saveToCrm(p.id, user, { task: body.task !== false }));
on('POST', '/companies/:id/contacts', async ({ p, body }) => {
  try {
    return { contacts: await addContact(p.id, body) };
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : 'Contacto no válido.');
  }
});
on('DELETE', '/contacts/:id', async ({ p }) => (await q('DELETE FROM contacts WHERE id = $1', [p.id]), { ok: true }));

/** Registra una acción comercial y actualiza el seguimiento de la empresa. */
async function logAction(companyId: string, user: SessionUser, a: { type: string; summary: string; body?: string; at?: string; nextFollowupAt?: string | null; status?: string; contactPerson?: string }) {
  if (!(a.type in ACTIVITY_TYPES) || a.type === 'estado' || a.type === 'sistema') throw new HttpError(400, 'Tipo de actividad no válido.');
  const c = await getCompany(companyId);
  const at = a.at ? new Date(a.at).toISOString() : nowIso();
  await addActivity(companyId, a.type, a.summary || ACTIVITY_TYPES[a.type as keyof typeof ACTIVITY_TYPES], a.body ?? '', user.id, undefined, at);
  const patch: Record<string, unknown> = { updatedAt: nowIso() };
  const outbound = ['llamada', 'correo', 'linkedin', 'reunion'].includes(a.type);
  if (outbound || a.type === 'respuesta') {
    if (!c.lastContactAt || at > c.lastContactAt) (patch.lastContactAt = at), (patch.lastChannel = ACTIVITY_TYPES[a.type as keyof typeof ACTIVITY_TYPES]);
  }
  if (a.nextFollowupAt !== undefined) patch.nextFollowupAt = a.nextFollowupAt ? new Date(a.nextFollowupAt).toISOString() : null;
  else if (outbound) patch.nextFollowupAt = new Date(Date.now() + (await getSettings()).followupDays * 86400_000).toISOString();
  if (a.contactPerson) patch.contactPerson = str(a.contactPerson, 120);
  await update('companies', companyId, patch);
  // El primer contacto mueve la empresa en el pipeline; a partir de ahí decide el comercial.
  const early: Status[] = ['nueva', 'pendiente_investigar', 'analizada', 'pendiente_contactar'];
  const next = a.status && a.status in STATUSES ? (a.status as Status) : outbound && early.includes(c.status) ? 'primer_contacto' : null;
  if (next) await setStatus(companyId, next, user.id);
  if (c.inCrm) void syncCompany(companyId, 'activity.added', { activity: { type: a.type, summary: a.summary, at } });
}
on('POST', '/companies/:id/activities', async ({ p, body, user }) => {
  await logAction(p.id, user, { type: str(body.type), summary: str(body.summary, 240), body: str(body.body, 8000), at: body.at, nextFollowupAt: body.nextFollowupAt, status: body.status, contactPerson: body.contactPerson });
  return { ok: true };
});

// ——— Tareas ———
on('GET', '/tasks', async ({ query }) => ({ tasks: (await q(`SELECT t.*, c.name AS company_name FROM tasks t LEFT JOIN companies c ON c.id = t.company_id WHERE ${query.get('all') ? 'TRUE' : 'NOT t.done'} ORDER BY t.done, t.due_at NULLS LAST, t.created_at LIMIT 300`)).map((r) => camelize<Task>(r)) }));
on('POST', '/tasks', async ({ body, user }) => {
  if (!str(body.title)) throw new HttpError(400, 'La tarea necesita un título.');
  await createTask(body.companyId || null, str(body.title, 240), null, 'manual', user.id);
  if (body.dueAt) await q('UPDATE tasks SET due_at = $1 WHERE id = (SELECT id FROM tasks ORDER BY created_at DESC LIMIT 1)', [new Date(body.dueAt).toISOString()]);
  return { ok: true };
});
on('PATCH', '/tasks/:id', async ({ p, body }) => (await update('tasks', p.id, { done: !!body.done, doneAt: body.done ? nowIso() : null }), { ok: true }));
on('DELETE', '/tasks/:id', async ({ p }) => (await q('DELETE FROM tasks WHERE id = $1', [p.id]), { ok: true }));

// ——— Mensajes ———
on('GET', '/messages', async () => ({ messages: (await q('SELECT m.*, c.name AS company_name FROM messages m JOIN companies c ON c.id = m.company_id ORDER BY m.updated_at DESC LIMIT 100')).map((r) => camelize<Message>(r)) }));
on('POST', '/companies/:id/messages', async ({ p, body, user }) => {
  const kind = str(body.kind) as MessageKind;
  if (!(kind in MESSAGE_KINDS)) throw new HttpError(400, 'Tipo de mensaje no válido.');
  const d = await draftMessage(p.id, kind, str(body.instructions, 600));
  const id = nanoid(12);
  await q('INSERT INTO messages (id, company_id, kind, subject, body, engine, created_by, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)', [id, p.id, kind, d.subject, d.body, d.engine, user.id, nowIso()]);
  return { message: camelize<Message>((await q1('SELECT * FROM messages WHERE id = $1', [id]))!), note: d.note };
});
on('PATCH', '/messages/:id', async ({ p, body }) => (await update('messages', p.id, { subject: str(body.subject, 300), body: String(body.body ?? '').slice(0, 20000), updatedAt: nowIso() }), { ok: true }));
on('DELETE', '/messages/:id', async ({ p }) => (await q('DELETE FROM messages WHERE id = $1', [p.id]), { ok: true }));
/** Marca un mensaje como enviado. Con `send`, además lo envía por correo: siempre a petición expresa de una persona. */
on('POST', '/messages/:id/sent', async ({ p, body, user }) => {
  const m = camelize<Message>((await q1('SELECT * FROM messages WHERE id = $1', [p.id])) ?? {});
  if (!m.id) throw new HttpError(404, 'Mensaje no encontrado.');
  const c = await getCompany(m.companyId);
  if (m.kind === 'resumen') throw new HttpError(400, 'El resumen de llamada es un documento interno: no se envía.');
  if (c.doNotContact || (await isExcluded(c))) throw new HttpError(409, 'Esta empresa está marcada como «no contactar». No se registran envíos comerciales.');
  if (body.send) {
    if (!['email', 'seguimiento', 'reunion'].includes(m.kind)) throw new HttpError(400, 'Solo los correos se pueden enviar desde RADAR.');
    const to = str(body.to) || c.email;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw new HttpError(400, 'La empresa no tiene un correo válido al que enviar.');
    if (await isExcluded({ email: to })) throw new HttpError(409, 'Ese correo está en la lista de exclusión.');
    const { sender } = await getSettings();
    try {
      await sendMail({ to, subject: m.subject || `Contacto de ${sender.company}`, text: m.body, replyTo: sender.email || undefined, fromName: sender.name || sender.company });
    } catch (e) {
      throw new HttpError(502, `No se ha podido enviar el correo: ${e instanceof Error ? e.message : 'error de envío'}`);
    }
  }
  await update('messages', m.id, { status: 'enviado', sentAt: nowIso(), updatedAt: nowIso() });
  const type = m.kind === 'llamada' ? 'llamada' : m.kind === 'linkedin' ? 'linkedin' : 'correo';
  await logAction(c.id, user, { type, summary: `${MESSAGE_KINDS[m.kind]}${m.subject ? `: ${m.subject}` : ''}${body.send ? ' (enviado desde RADAR)' : ''}`, body: m.body, status: m.kind === 'seguimiento' ? 'pendiente_respuesta' : m.kind === 'reunion' ? 'reunion_propuesta' : undefined });
  return { ok: true };
});

// ——— Acciones en bloque y pipeline ———
on('POST', '/bulk', async ({ body, user }) => {
  const ids = (Array.isArray(body.ids) ? body.ids : []).map(String).slice(0, 300);
  if (!ids.length) throw new HttpError(400, 'No hay empresas seleccionadas.');
  if (body.action === 'analyze') return { queued: await enqueue(ids, { research: true, analyze: true }) };
  if (body.action === 'archive' || body.action === 'unarchive') {
    await q('UPDATE companies SET archived = $1, archive_reason = $2, updated_at = $3 WHERE id = ANY($4::text[])', [body.action === 'archive', body.action === 'archive' ? 'Archivada a mano' : '', nowIso(), ids]);
    return { done: ids.length };
  }
  if (body.action === 'crm') {
    for (const id of ids) await saveToCrm(id, user);
    return { done: ids.length };
  }
  if (body.action === 'status' && body.status in STATUSES) {
    for (const id of ids) await setStatus(id, body.status, user.id);
    return { done: ids.length };
  }
  throw new HttpError(400, 'Acción no válida.');
});
on('GET', '/pipeline', async () => {
  const rows = (await q('SELECT * FROM companies WHERE NOT archived AND status = ANY($1::text[]) ORDER BY score DESC NULLS LAST', [PIPELINE_COLUMNS])).map(toCompany).map(summarize);
  return { columns: PIPELINE_COLUMNS.map((s) => ({ status: s, label: STATUSES[s], items: rows.filter((r) => r.status === s) })), stale: await staleCompanies(60) };
});

// ——— Automatizaciones y cola ———
on('GET', '/automations', async () => {
  const items = await listAutomations();
  return {
    automations: await Promise.all(items.map(async (a) => ({ ...a, description: await describeAutomation(a) }))),
    runs: await q('SELECT r.*, a.name FROM runs r JOIN automations a ON a.id = r.automation_id ORDER BY r.started_at DESC LIMIT 20'),
  };
});
on('POST', '/automations', async ({ body }) => ({ automations: await saveAutomation(body) }));
on('PATCH', '/automations/:id', async ({ p, body }) => (await update('automations', p.id, { enabled: !!body.enabled }), { ok: true }));
on('DELETE', '/automations/:id', async ({ p }) => (await q('DELETE FROM automations WHERE id = $1', [p.id]), { ok: true }));
on('POST', '/automations/:id/run', async ({ p }) => ({ summary: await runAutomation(p.id), jobs: await jobCounts() }));
on('GET', '/jobs', () => jobCounts());
on('POST', '/jobs/work', async () => workJobs(Number(process.env.RADAR_WORK_BUDGET_MS) || 40_000));

// ——— Señales ———
on('GET', '/signals', async () => ({ signals: (await q('SELECT s.*, c.name AS company_name FROM signals s LEFT JOIN companies c ON c.id = s.company_id WHERE NOT s.dismissed ORDER BY s.detected_at DESC LIMIT 100')).map((r) => camelize<Signal>(r)) }));
on('PATCH', '/signals/:id', async ({ p, body }) => (await update('signals', p.id, { dismissed: !!body.dismissed }), { ok: true }));

// ——— Informes ———
on('GET', '/reports', async () => ({ reports: (await q('SELECT * FROM reports ORDER BY created_at DESC LIMIT 30')).map((r) => camelize(r)) }));
on('POST', '/reports', async ({ body }) => ({ report: await generateReport(Number(body.days) === 30 ? 30 : 7) }));
on('GET', '/export/companies.csv', async () => new Response(await companiesCsv(), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="odisas-radar-empresas-${nowIso().slice(0, 10)}.csv"` } }));

// ——— Configuración ———
on('GET', '/settings', async () => ({
  settings: await getSettings(),
  anthropicKey: process.env.ANTHROPIC_API_KEY ? 'Definida en el servidor (variable de entorno)' : maskSecret(await getSecret('anthropic')),
  anthropicFromEnv: !!process.env.ANTHROPIC_API_KEY,
  modelFromEnv: !!process.env.RADAR_AI_MODEL,
  crmToken: maskSecret(await getSecret('crm_token')),
  mail: mailConfigured(),
  db: await dbMode(),
  cron: !!process.env.CRON_SECRET,
  authSecretFromEnv: (process.env.AUTH_SECRET ?? '').length >= 32,
  exclusions: await q('SELECT * FROM exclusions ORDER BY created_at DESC LIMIT 300'),
  users: await listUsers(),
}));
on('PUT', '/settings', async ({ body }) => {
  if (body.settings) await saveSettings(body.settings);
  if (body.anthropicKey !== undefined) await setSecret('anthropic', str(body.anthropicKey, 300) || null);
  if (body.crmToken !== undefined) await setSecret('crm_token', str(body.crmToken, 300) || null);
  void anthropicKey;
  return { ok: true };
}, { admin: true });
on('POST', '/exclusions', async ({ body }) => (await addExclusion(str(body.type), str(body.value, 200), str(body.reason, 200)), { ok: true }));
on('DELETE', '/exclusions/:id', async ({ p }) => (await q('DELETE FROM exclusions WHERE id = $1', [p.id]), { ok: true }), { admin: true });
on('POST', '/users', async ({ body }) => ({ user: await createUser({ email: str(body.email), name: str(body.name), role: (body.role === 'admin' ? 'admin' : 'comercial') as Role, password: String(body.password ?? '') }) }), { admin: true });
on('PATCH', '/users/:id', async ({ p, body }) => (await updateUser(p.id, { role: body.role, disabled: body.disabled, name: body.name, password: body.password }), { ok: true }), { admin: true });

export async function dispatch(req: Request, path: string[]): Promise<Response> {
  try {
    const route = routes.find((r) => r.method === req.method && r.parts.length === path.length && r.parts.every((part, i) => part.startsWith(':') || part === path[i]));
    if (!route) return json({ error: 'Ruta no encontrada.' }, 404);
    const p: Record<string, string> = {};
    route.parts.forEach((part, i) => part.startsWith(':') && (p[part.slice(1)] = decodeURIComponent(path[i])));
    let user = null as SessionUser | null;
    if (!route.open) {
      user = await currentUser();
      if (!user) return json({ error: 'Sesión no iniciada o caducada.' }, 401);
      if (route.admin && user.role !== 'admin') return json({ error: 'Solo una cuenta de administración puede hacer esto.' }, 403);
      // Protección CSRF: las peticiones que modifican datos deben venir de la propia aplicación.
      if (req.method !== 'GET') {
        const origin = req.headers.get('origin');
        const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
        if (origin && host && new URL(origin).host !== host) return json({ error: 'Origen no permitido.' }, 403);
      }
    }
    const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await readJson<Body>(req).catch((e) => (req.headers.get('content-length') === '0' || !req.headers.get('content-type') ? {} : Promise.reject(e)));
    const out = await route.fn({ req, user: user as SessionUser, p, query: new URL(req.url).searchParams, body: body ?? {} });
    return out instanceof Response ? out : json(out);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error('[api] error no controlado', req.method, path.join('/'), error);
    return json({ error: 'Error interno del servidor.' }, 500);
  }
}
