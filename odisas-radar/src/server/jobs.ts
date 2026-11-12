import 'server-only';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { PRIORITIES, SIGNAL_TYPES, type SignalType } from '@/domain/types';
import { AiError, extractJson, webResearch } from './ai/client';
import { analyzeCompany } from './ai/analyze';
import { getCompany } from './companies';
import { nowIso, q, q1 } from './db';
import { addSignal, researchCompany } from './research';
import { insert, update } from './sql';

/**
 * Cola de trabajo. En un hosting sin procesos permanentes (Vercel) nada puede
 * quedarse corriendo en segundo plano: las tareas largas se guardan en la tabla
 * `jobs` y se procesan por tandas cortas, desde la app abierta o desde el cron.
 */
export interface JobPayload {
  research?: boolean;
  analyze?: boolean;
  news?: boolean;
  minScore?: number;
  createTasks?: boolean;
  origin?: string;
}

export async function enqueue(companyIds: string[], payload: JobPayload, type = 'pipeline'): Promise<number> {
  let n = 0;
  for (const id of companyIds) {
    if (await q1("SELECT 1 FROM jobs WHERE company_id = $1 AND type = $2 AND status IN ('pendiente','en_curso')", [id, type])) continue;
    await insert('jobs', { id: nanoid(12), type, companyId: id, payload, createdAt: nowIso() });
    if (type === 'pipeline') await q("UPDATE companies SET status = 'pendiente_investigar' WHERE id = $1 AND status = 'nueva'", [id]);
    n++;
  }
  return n;
}

export async function createTask(companyId: string | null, title: string, dueInDays: number | null, origin: string, userId: string | null = null): Promise<boolean> {
  if (companyId && origin !== 'manual' && (await q1('SELECT 1 FROM tasks WHERE company_id = $1 AND origin = $2 AND NOT done', [companyId, origin]))) return false;
  await insert('tasks', { id: nanoid(12), companyId, title: title.slice(0, 240), dueAt: dueInDays == null ? null : new Date(Date.now() + dueInDays * 86400_000).toISOString(), origin, createdBy: userId, createdAt: nowIso() });
  return true;
}

const NewsItem = z.object({ type: z.string(), title: z.string(), detail: z.string(), url: z.string() });

/** Busca noticias recientes de una empresa. Solo se guardan las que citan una página real. */
export async function findNews(companyId: string): Promise<number> {
  const c = await getCompany(companyId);
  const types = (Object.keys(SIGNAL_TYPES) as SignalType[]).filter((t) => !['nueva_empresa', 'cambio_web'].includes(t));
  const { text, sources } = await webResearch(
    'Buscas señales comerciales públicas sobre una empresa española concreta. Solo informas de lo que aparece en los resultados de búsqueda y siempre con su enlace. Si no encuentras nada fiable sobre esa empresa en concreto, devuelves una lista vacía: no rellenas con noticias del sector ni de empresas de nombre parecido.',
    `Empresa: ${c.name}${c.legalName ? ` (${c.legalName})` : ''}. Ubicación: ${[c.city, c.province].filter(Boolean).join(', ') || 'España'}. Web: ${c.website || 'no consta'}. Actividad: ${c.activity || c.sector || 'no consta'}.

Busca información de los últimos 12 meses sobre: crecimiento o ampliación de actividad, nuevas inversiones, nuevas instalaciones o sedes, ofertas de empleo abiertas, y necesidades de tecnología o digitalización que hayan hecho públicas.

Termina con un único bloque \`\`\`json: un array de objetos {"type": uno de ${types.map((t) => `"${t}"`).join(', ')}, "title": titular breve, "detail": una o dos frases con el hecho y su fecha, "url": la página donde consta}. Array vacío si no hay nada.`,
    4,
  );
  const parsed = z.array(NewsItem).safeParse(extractJson(text) ?? []);
  if (!parsed.success) return 0;
  const cited = new Set(sources.map((s) => s.url));
  let n = 0;
  for (const item of parsed.data.slice(0, 6)) {
    if (!cited.has(item.url) || !(item.type in SIGNAL_TYPES)) continue;
    await addSignal(companyId, item.type as SignalType, item.title, item.detail, 'Búsqueda web (IA)', item.url, 'estimado');
    n++;
  }
  return n;
}

async function processJob(job: { id: string; type: string; company_id: string; payload: JobPayload }) {
  const p = job.payload ?? {};
  if (job.type === 'news') {
    await findNews(job.company_id);
    return;
  }
  if (p.research !== false) await researchCompany(job.company_id);
  if (p.analyze === false) return;
  const c = await analyzeCompany(job.company_id);
  if (p.minScore != null && (c.score ?? 0) < p.minScore) {
    await update('companies', c.id, { archived: true, archiveReason: `RADAR SCORE ${c.score} por debajo del mínimo (${p.minScore}) de la automatización`, updatedAt: nowIso() });
    return;
  }
  if (p.createTasks && (c.priority === 'muy_alta' || c.priority === 'alta') && !c.doNotContact) {
    await createTask(c.id, `Contactar con ${c.name} · prioridad ${PRIORITIES[c.priority].toLowerCase()} (RADAR SCORE ${c.score})`, 2, 'automatizacion');
  }
}

async function claim(): Promise<{ id: string; type: string; company_id: string; payload: JobPayload } | undefined> {
  // Un trabajo «en curso» desde hace más de 10 minutos se da por interrumpido y se reintenta.
  await q("UPDATE jobs SET status = 'pendiente' WHERE status = 'en_curso' AND started_at < $1", [new Date(Date.now() - 600_000).toISOString()]);
  return q1(
    `UPDATE jobs SET status = 'en_curso', started_at = $1
     WHERE id = (SELECT id FROM jobs WHERE status = 'pendiente' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED)
     RETURNING id, type, company_id, payload`,
    [nowIso()],
  );
}

export async function jobCounts() {
  const rows = await q<{ status: string; n: number }>("SELECT status, COUNT(*)::int AS n FROM jobs WHERE status IN ('pendiente','en_curso') OR finished_at > $1 GROUP BY status", [new Date(Date.now() - 3600_000).toISOString()]);
  const by = Object.fromEntries(rows.map((r) => [r.status, r.n]));
  return { pending: (by.pendiente ?? 0) + (by.en_curso ?? 0), done: by.hecho ?? 0, failed: by.error ?? 0 };
}

/** Procesa trabajos pendientes hasta agotar el tiempo disponible. */
export async function workJobs(budgetMs = 40_000, concurrency = 3) {
  const deadline = Date.now() + budgetMs;
  let processed = 0;
  const worker = async () => {
    while (Date.now() < deadline) {
      const job = await claim();
      if (!job) return;
      try {
        await processJob(job);
        await q("UPDATE jobs SET status = 'hecho', finished_at = $1, error = '' WHERE id = $2", [nowIso(), job.id]);
      } catch (error) {
        const msg = error instanceof AiError || error instanceof Error ? error.message : String(error);
        console.error('[jobs] fallo en', job.type, job.company_id, error);
        await q("UPDATE jobs SET status = 'error', finished_at = $1, error = $2 WHERE id = $3", [nowIso(), msg.slice(0, 400), job.id]);
        // Si falla la investigación, la empresa no debe quedarse atascada en «pendiente de investigar».
        await q("UPDATE companies SET status = 'nueva' WHERE id = $1 AND status = 'pendiente_investigar'", [job.company_id]);
      }
      processed++;
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { processed, ...(await jobCounts()) };
}
