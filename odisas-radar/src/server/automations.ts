import 'server-only';
import { nanoid } from 'nanoid';
import { sectorById } from '@/domain/catalog';
import { AUTOMATION_TYPES, FREQUENCIES, type Automation, type AutomationConfig, type AutomationType, type Frequency } from '@/domain/types';
import { aiAvailable } from './ai/client';
import { importCandidates } from './companies';
import { nowIso, q, q1 } from './db';
import { HttpError } from './http';
import { createTask, enqueue, workJobs } from './jobs';
import { providerById } from './providers';
import { addSignal, dueForRecheck } from './research';
import { periodCounts, recommended, staleCompanies } from './stats';
import { camelize, insert, update } from './sql';

const DAY = 86400_000;

export function nextRun(frequency: Frequency, from = new Date()): string {
  const d = new Date(from);
  if (frequency === 'diaria') d.setUTCDate(d.getUTCDate() + 1);
  else if (frequency === 'semanal') d.setUTCDate(d.getUTCDate() + 7);
  else d.setUTCMonth(d.getUTCMonth() + 1);
  // El cron diario pasa a las 05:00 UTC: se deja margen para que no se salte un día por minutos.
  d.setUTCHours(4, 0, 0, 0);
  return d.toISOString();
}

export async function listAutomations(): Promise<Automation[]> {
  return (await q('SELECT * FROM automations ORDER BY created_at')).map((r) => camelize<Automation>(r));
}

function cleanConfig(type: AutomationType, c: AutomationConfig): AutomationConfig {
  const num = (v: unknown, min: number, max: number, def: number) => (v == null || v === '' ? def : Math.max(min, Math.min(max, Math.round(Number(v)) || def)));
  if (type === 'busqueda') {
    if (!c.query || !(c.query.sector || c.query.category || c.query.activity || c.query.text)) throw new HttpError(400, 'La búsqueda necesita al menos un sector, un tipo de empresa o una actividad.');
    if (!providerById(c.provider ?? 'osm')) throw new HttpError(400, 'Fuente de datos no válida.');
    return { query: { ...c.query, limit: num(c.query.limit, 1, 100, 30) }, provider: c.provider ?? 'osm', research: c.research !== false, analyze: c.analyze !== false, minScore: c.minScore == null || (c.minScore as unknown) === '' ? undefined : num(c.minScore, 0, 100, 0), createTasks: !!c.createTasks };
  }
  if (type === 'senales') return { maxCompanies: num(c.maxCompanies, 1, 100, 25), news: !!c.news };
  return {};
}

export async function saveAutomation(input: Partial<Automation> & { id?: string }): Promise<Automation[]> {
  const type = input.type as AutomationType;
  if (!(type in AUTOMATION_TYPES)) throw new HttpError(400, 'Tipo de automatización no válido.');
  const frequency = (input.frequency && input.frequency in FREQUENCIES ? input.frequency : 'semanal') as Frequency;
  const name = String(input.name ?? '').trim().slice(0, 120) || AUTOMATION_TYPES[type];
  const config = cleanConfig(type, input.config ?? {});
  if (input.id) await update('automations', input.id, { name, type, frequency, config, enabled: input.enabled !== false });
  else await insert('automations', { id: nanoid(12), name, type, frequency, config, enabled: input.enabled !== false, nextRunAt: nextRun(frequency, new Date(Date.now() - DAY)), createdAt: nowIso() });
  return listAutomations();
}

/** Ejecuta una automatización. Nunca envía comunicaciones: solo busca, analiza, avisa y prepara. */
export async function runAutomation(id: string): Promise<string> {
  const row = await q1('SELECT * FROM automations WHERE id = $1', [id]);
  if (!row) throw new HttpError(404, 'Automatización no encontrada.');
  const a = camelize<Automation>(row);
  const runId = nanoid(12);
  await insert('runs', { id: runId, automationId: id, startedAt: nowIso(), status: 'en_curso' });
  let summary = '';
  let status = 'hecho';
  try {
    if (a.type === 'busqueda') {
      const provider = providerById(a.config.provider) ?? providerById('osm')!;
      if (!(await provider.available())) throw new HttpError(400, `La fuente «${provider.label}» no está disponible: ${provider.requires}.`);
      const found = await provider.search(a.config.query ?? {});
      const res = await importCandidates(found);
      const queued = a.config.research !== false || a.config.analyze !== false ? await enqueue(res.added.map((c) => c.id), { research: a.config.research, analyze: a.config.analyze, minScore: a.config.minScore, createTasks: a.config.createTasks, origin: id }) : 0;
      // A partir de la segunda ejecución, una empresa nueva en la misma búsqueda es una señal en sí misma.
      if (a.lastRunAt) for (const c of res.added.slice(0, 40)) await addSignal(c.id, 'nueva_empresa', `${c.name} aparece por primera vez en «${a.name}»`, `No estaba en ${provider.label} en la ejecución anterior (${a.lastRunAt.slice(0, 10)}). Puede ser una empresa nueva o un alta reciente en la fuente.`, provider.label, c.facts.name?.url ?? '', 'estimado');
      summary = `${found.length} encontradas · ${res.added.length} nuevas · ${res.duplicates.length} ya estaban · ${res.excluded.length} excluidas · ${queued} en cola de análisis`;
    } else if (a.type === 'seguimiento') {
      const stale = await staleCompanies(100);
      let created = 0;
      for (const c of stale) if (await createTask(c.id, `Seguimiento de ${c.name}: ${c.staleReason.toLowerCase()}`, 0, 'alerta')) created++;
      summary = `${stale.length} oportunidades sin seguimiento · ${created} tareas nuevas`;
    } else if (a.type === 'senales') {
      const ids = await dueForRecheck(a.config.maxCompanies ?? 25);
      const queued = await enqueue(ids, { research: true, analyze: false }, 'revision');
      let news = 0;
      if (a.config.news && (await aiAvailable())) news = await enqueue((await recommended(8)).map((c) => c.id), {}, 'news');
      summary = `${queued} webs en cola de revisión${a.config.news ? ` · ${news} empresas en cola de búsqueda de noticias` : ''}`;
    } else {
      const { generateReport } = await import('./reports');
      const r = await generateReport(a.frequency === 'mensual' ? 30 : 7);
      summary = `Informe generado (${r.periodFrom.slice(0, 10)} a ${r.periodTo.slice(0, 10)})`;
    }
  } catch (error) {
    status = 'error';
    summary = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[automations] fallo en', a.name, error);
  }
  await update('runs', runId, { finishedAt: nowIso(), status, summary });
  await update('automations', id, { lastRunAt: nowIso(), nextRunAt: nextRun(a.frequency), lastResult: `${status === 'error' ? 'Error: ' : ''}${summary}` });
  return summary;
}

/** Latido del sistema: ejecuta lo que toca y avanza la cola. Lo llama el cron diario. */
export async function tick(budgetMs = 240_000) {
  const startedAt = Date.now();
  const due = await q<{ id: string }>('SELECT id FROM automations WHERE enabled AND (next_run_at IS NULL OR next_run_at <= $1) ORDER BY next_run_at NULLS FIRST', [nowIso()]);
  const ran: string[] = [];
  for (const { id } of due) {
    if (Date.now() - startedAt > budgetMs * 0.4) break;
    ran.push(await runAutomation(id));
  }
  const jobs = await workJobs(Math.max(5000, budgetMs - (Date.now() - startedAt) - 10_000));
  return { automations: ran.length, results: ran, jobs };
}

export async function describeAutomation(a: Automation): Promise<string> {
  const c = a.config;
  if (a.type === 'busqueda') {
    const qy = c.query ?? {};
    const what = [sectorById(qy.sector)?.label, qy.activity, qy.text].filter(Boolean).join(' · ') || 'empresas';
    const where = [qy.city, qy.province, qy.location].filter(Boolean).join(', ') || 'España';
    return `Busca ${what} en ${where} (${providerById(c.provider)?.label ?? 'OpenStreetMap'}, hasta ${qy.limit ?? 30})${c.research !== false ? ', investiga su web' : ''}${c.analyze !== false ? ', las analiza y puntúa' : ''}${c.minScore != null ? `, archiva las de menos de ${c.minScore} puntos` : ''}${c.createTasks ? ' y crea tareas para las prioritarias' : ''}.`;
  }
  if (a.type === 'seguimiento') return 'Revisa las oportunidades abiertas y crea una tarea por cada una que lleve demasiado tiempo sin seguimiento.';
  if (a.type === 'senales') return `Vuelve a revisar la web de hasta ${c.maxCompanies ?? 25} empresas guardadas para detectar cambios y ofertas de empleo${c.news ? ', y busca noticias de las más prioritarias' : ''}.`;
  return `Prepara el informe de captación ${a.frequency === 'mensual' ? 'del último mes' : 'de la última semana'}.`;
}
