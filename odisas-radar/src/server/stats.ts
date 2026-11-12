import 'server-only';
import { sectorById } from '@/domain/catalog';
import { staleInfo } from '@/domain/score';
import { ACTIVE_STATUSES, CONTACTED_STATUSES, PRIORITIES, STATUSES, STATUS_IDS, type Company, type Status } from '@/domain/types';
import { summarize, toCompany } from './companies';
import { q, q1 } from './db';
import { getSettings } from './settings';

const DAY = 86400_000;
const iso = (d: Date) => d.toISOString();

/** Lunes de la semana (UTC) de una fecha. */
function weekStart(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x;
}

export interface PeriodCounts {
  found: number;
  researched: number;
  analyzed: number;
  contacts: number;
  replies: number;
  meetings: number;
  quotes: number;
  won: number;
  lost: number;
}

/** Actividad comercial entre dos fechas, contada a partir del registro (no del estado actual). */
export async function periodCounts(from: string, to: string): Promise<PeriodCounts> {
  const n = async (sql: string) => (await q1<{ n: number }>(sql, [from, to]))!.n;
  const moved = (st: Status) => n(`SELECT COUNT(DISTINCT company_id)::int AS n FROM activities WHERE type = 'estado' AND data->>'to' = '${st}' AND at >= $1 AND at < $2`);
  return {
    found: await n('SELECT COUNT(*)::int AS n FROM companies WHERE created_at >= $1 AND created_at < $2'),
    researched: await n('SELECT COUNT(*)::int AS n FROM companies WHERE researched_at >= $1 AND researched_at < $2'),
    analyzed: await n('SELECT COUNT(*)::int AS n FROM companies WHERE analyzed_at >= $1 AND analyzed_at < $2'),
    contacts: await n("SELECT COUNT(*)::int AS n FROM activities WHERE type IN ('llamada','correo','linkedin') AND at >= $1 AND at < $2"),
    replies: await n("SELECT COUNT(*)::int AS n FROM activities WHERE type = 'respuesta' AND at >= $1 AND at < $2"),
    meetings: await moved('reunion_concertada'),
    quotes: await moved('presupuesto_enviado'),
    won: await moved('cliente'),
    lost: await moved('perdida'),
  };
}

export async function staleCompanies(limit = 50) {
  const { followupDays } = await getSettings();
  const rows = await q(`SELECT * FROM companies WHERE NOT archived AND status = ANY($1::text[]) ORDER BY next_followup_at ASC NULLS LAST, last_contact_at ASC NULLS FIRST LIMIT 400`, [ACTIVE_STATUSES]);
  return rows
    .map(toCompany)
    .map((c) => ({ c, s: staleInfo(c, followupDays) }))
    .filter((x) => x.s.stale)
    .sort((a, b) => b.s.days - a.s.days)
    .slice(0, limit)
    .map(({ c, s }) => ({ ...summarize(c), staleReason: s.reason, staleDays: s.days }));
}

/**
 * Oportunidades recomendadas para hoy: combina el RADAR SCORE con el momento
 * (seguimientos vencidos, señales recientes, respuestas pendientes de atender).
 */
export async function recommended(limit = 6) {
  const { followupDays } = await getSettings();
  const rows = (await q("SELECT * FROM companies WHERE NOT archived AND NOT do_not_contact AND score IS NOT NULL AND status NOT IN ('cliente','perdida','descartada') ORDER BY score DESC LIMIT 150")).map(toCompany);
  if (!rows.length) return [];
  const since = iso(new Date(Date.now() - 21 * DAY));
  const sig = await q<{ company_id: string; title: string }>('SELECT DISTINCT ON (company_id) company_id, title FROM signals WHERE NOT dismissed AND detected_at > $1 AND company_id IS NOT NULL ORDER BY company_id, detected_at DESC', [since]);
  const reply = await q<{ company_id: string }>("SELECT DISTINCT company_id FROM activities WHERE type = 'respuesta' AND at > $1", [iso(new Date(Date.now() - 5 * DAY))]);
  const signalOf = new Map(sig.map((s) => [s.company_id, s.title]));
  const replied = new Set(reply.map((r) => r.company_id));
  return rows
    .map((c: Company) => {
      const reasons: string[] = [];
      let rank = c.score ?? 0;
      const stale = staleInfo(c, followupDays);
      if (replied.has(c.id)) (rank += 30), reasons.push('Ha respondido hace poco: conviene contestar hoy.');
      if (stale.stale) (rank += 18), reasons.push(`${stale.reason}.`);
      if (signalOf.has(c.id)) (rank += 12), reasons.push(`Señal reciente: ${signalOf.get(c.id)}.`);
      if (c.status === 'analizada' || c.status === 'pendiente_contactar') (rank += 8), reasons.push('Analizada y todavía sin primer contacto.');
      if (!c.email && !c.phone && !c.contactFormUrl) (rank -= 25), reasons.push('Aún no hay vía de contacto: toca localizarla.');
      reasons.unshift(`RADAR SCORE ${c.score} (prioridad ${PRIORITIES[c.priority ?? 'baja'].toLowerCase()}). ${c.report?.whyInterested ?? ''}`.trim());
      return { ...summarize(c), rank, reasons, action: stale.stale && c.nextAction ? c.nextAction : (c.report?.nextAction ?? c.nextAction) };
    })
    .filter((x) => (x.score ?? 0) >= 45 || x.reasons.length > 2)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit);
}

export async function dashboard() {
  const byStatus = Object.fromEntries((await q<{ status: Status; n: number }>('SELECT status, COUNT(*)::int AS n FROM companies WHERE NOT archived GROUP BY status')).map((r) => [r.status, r.n])) as Partial<Record<Status, number>>;
  const st = (list: Status[]) => list.reduce((s, k) => s + (byStatus[k] ?? 0), 0);
  const one = async (sql: string, p: unknown[] = []) => (await q1<{ n: number }>(sql, p))!.n;
  const total = await one('SELECT COUNT(*)::int AS n FROM companies WHERE NOT archived');
  const contacted = st(CONTACTED_STATUSES);
  const won = byStatus.cliente ?? 0;
  const everMoved = (s: Status) => one(`SELECT COUNT(DISTINCT company_id)::int AS n FROM activities WHERE type = 'estado' AND data->>'to' = '${s}'`);

  // Evolución semanal de las últimas 12 semanas.
  const start = weekStart(new Date(Date.now() - 11 * 7 * DAY));
  const weeks: ({ week: string } & PeriodCounts)[] = [];
  for (let i = 0; i < 12; i++) {
    const from = new Date(start.getTime() + i * 7 * DAY);
    weeks.push({ week: iso(from).slice(0, 10), ...(await periodCounts(iso(from), iso(new Date(from.getTime() + 7 * DAY)))) });
  }

  const sectors = (await q<{ sector: string; category: string; n: number; avg: number; top: number }>(
    `SELECT sector, MIN(category) AS category, COUNT(*)::int AS n, ROUND(AVG(score))::int AS avg, COUNT(*) FILTER (WHERE score >= 65)::int AS top
     FROM companies WHERE NOT archived AND score IS NOT NULL GROUP BY sector HAVING COUNT(*) > 0 ORDER BY top DESC, avg DESC LIMIT 8`,
  )).map((r) => ({ ...r, label: sectorById(r.sector)?.label ?? (r.sector || 'Sin sector') }));
  const places = await q<{ place: string; n: number; avg: number; top: number }>(
    `SELECT COALESCE(NULLIF(province, ''), NULLIF(city, ''), 'Sin ubicación') AS place, COUNT(*)::int AS n, ROUND(AVG(score))::int AS avg, COUNT(*) FILTER (WHERE score >= 65)::int AS top
     FROM companies WHERE NOT archived AND score IS NOT NULL GROUP BY 1 ORDER BY top DESC, n DESC LIMIT 8`,
  );
  const meetings = await everMoved('reunion_concertada');
  const quotes = await everMoved('presupuesto_enviado');
  return {
    kpis: {
      found: total,
      researched: await one('SELECT COUNT(*)::int AS n FROM companies WHERE NOT archived AND researched_at IS NOT NULL'),
      opportunities: await one('SELECT COUNT(*)::int AS n FROM companies WHERE NOT archived AND score >= 65'),
      toContact: st(['analizada', 'pendiente_contactar']),
      contactsMade: await one("SELECT COUNT(*)::int AS n FROM activities WHERE type IN ('llamada','correo','linkedin')"),
      contacted,
      replies: await one("SELECT COUNT(DISTINCT company_id)::int AS n FROM activities WHERE type = 'respuesta'"),
      meetings: Math.max(meetings, st(['reunion_concertada', 'presupuesto_enviado', 'negociacion', 'cliente'])),
      quotes: Math.max(quotes, st(['presupuesto_enviado', 'negociacion', 'cliente'])),
      won,
      // Clientes conseguidos sobre empresas con las que se ha llegado a contactar.
      conversion: contacted ? Math.round((won / contacted) * 1000) / 10 : null,
    },
    funnel: STATUS_IDS.map((s) => ({ status: s, label: STATUSES[s], n: byStatus[s] ?? 0 })),
    priorities: Object.fromEntries((await q<{ priority: string; n: number }>('SELECT priority, COUNT(*)::int AS n FROM companies WHERE NOT archived AND priority IS NOT NULL GROUP BY priority')).map((r) => [r.priority, r.n])),
    weeks,
    sectors,
    places,
    recommended: await recommended(6),
    stale: await staleCompanies(8),
    signals: (await q('SELECT s.*, c.name AS company_name FROM signals s LEFT JOIN companies c ON c.id = s.company_id WHERE NOT s.dismissed ORDER BY s.detected_at DESC LIMIT 6')) as Record<string, unknown>[],
    openTasks: await one('SELECT COUNT(*)::int AS n FROM tasks WHERE NOT done'),
  };
}
