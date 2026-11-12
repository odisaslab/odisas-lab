import 'server-only';
import { nanoid } from 'nanoid';
import { CATEGORIES, PRIORITIES, SIZE_BANDS, STATUSES, WEB_STATUSES, type Company } from '@/domain/types';
import { sectorById } from '@/domain/catalog';
import { listCompanies, summarize, toCompany } from './companies';
import { nowIso, q } from './db';
import { periodCounts, staleCompanies } from './stats';
import { insert } from './sql';

export interface ReportData {
  counts: Awaited<ReturnType<typeof periodCounts>>;
  previous: Awaited<ReturnType<typeof periodCounts>>;
  top: ReturnType<typeof summarize>[];
  wins: { id: string; name: string }[];
  stale: { id: string; name: string; staleReason: string }[];
  signals: { title: string; companyName: string; url: string }[];
  openTasks: number;
}

export async function generateReport(days = 7) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400_000);
  const prev = new Date(from.getTime() - days * 86400_000);
  const f = from.toISOString();
  const t = to.toISOString();
  const top = (await q('SELECT * FROM companies WHERE NOT archived AND analyzed_at >= $1 AND analyzed_at < $2 AND score IS NOT NULL ORDER BY score DESC LIMIT 10', [f, t])).map(toCompany).map(summarize);
  const data: ReportData = {
    counts: await periodCounts(f, t),
    previous: await periodCounts(prev.toISOString(), f),
    top,
    wins: await q("SELECT DISTINCT c.id, c.name FROM activities a JOIN companies c ON c.id = a.company_id WHERE a.type = 'estado' AND a.data->>'to' = 'cliente' AND a.at >= $1 AND a.at < $2", [f, t]),
    stale: (await staleCompanies(15)).map((s) => ({ id: s.id, name: s.name, staleReason: s.staleReason })),
    signals: (await q<{ title: string; company_name: string; url: string }>('SELECT s.title, COALESCE(c.name, \'\') AS company_name, s.url FROM signals s LEFT JOIN companies c ON c.id = s.company_id WHERE s.detected_at >= $1 AND s.detected_at < $2 ORDER BY s.detected_at DESC LIMIT 15', [f, t])).map((s) => ({ title: s.title, companyName: s.company_name, url: s.url })),
    openTasks: (await q<{ n: number }>('SELECT COUNT(*)::int AS n FROM tasks WHERE NOT done'))[0].n,
  };
  const row = { id: nanoid(12), kind: days >= 28 ? 'mensual' : 'semanal', periodFrom: f, periodTo: t, data, createdAt: nowIso() };
  await insert('reports', row);
  return row;
}

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  // Evita que una hoja de cálculo interprete el contenido como fórmula.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export async function companiesCsv(): Promise<string> {
  const { items } = await listCompanies({ limit: 500, sort: 'score' });
  const head = ['Empresa', 'Razón social', 'Tipo', 'Sector', 'Actividad', 'Ciudad', 'Provincia', 'Web', 'Estado web', 'Correo', 'Teléfono', 'Empleados', 'Tamaño', 'Sedes', 'RADAR SCORE', 'Prioridad', 'Estado', 'Último contacto', 'Próximo seguimiento', 'Próxima acción', 'Fuente', 'No contactar'];
  const rows = items.map((c: Company) => [
    c.name, c.legalName, CATEGORIES[c.category], sectorById(c.sector)?.label ?? c.sector, c.activity, c.city, c.province, c.website, WEB_STATUSES[c.webStatus], c.email, c.phone, c.employees ?? '',
    c.sizeBand ? SIZE_BANDS[c.sizeBand] : '', c.branches, c.score ?? '', c.priority ? PRIORITIES[c.priority] : '', STATUSES[c.status], c.lastContactAt?.slice(0, 10) ?? '', c.nextFollowupAt?.slice(0, 10) ?? '', c.nextAction, c.source, c.doNotContact ? 'Sí' : '',
  ]);
  return '﻿' + [head, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
}
