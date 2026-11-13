'use client';
import Link from 'next/link';
import { HBars, WeekBars, WeekLines } from '@/components/Charts';
import { PageHead } from '@/components/CompanyList';
import { Empty, Loading, PriorityBadge, ScoreRing, StatusBadge } from '@/components/ui';
import { SIGNAL_TYPES, type SignalType } from '@/domain/types';
import { fmtDate, useData } from '@/lib/client';

interface Dash {
  kpis: Record<string, number | null>;
  funnel: { status: string; label: string; n: number }[];
  weeks: { week: string; found: number; contacts: number; replies: number; meetings: number; won: number }[];
  sectors: { label: string; n: number; avg: number; top: number }[];
  places: { place: string; n: number; avg: number; top: number }[];
  recommended: { id: string; name: string; score: number | null; priority: 'muy_alta' | 'alta' | 'media' | 'baja' | null; status: never; reasons: string[]; action: string; city: string }[];
  stale: { id: string; name: string; staleReason: string }[];
  signals: { id: string; type: SignalType; title: string; company_id: string | null; detected_at: string }[];
  openTasks: number;
}

const KPIS: [string, string, boolean?][] = [
  ['found', 'Empresas encontradas'], ['researched', 'Investigadas'], ['opportunities', 'Oportunidades (65+)', true], ['toContact', 'Pendientes de contactar'],
  ['contactsMade', 'Contactos realizados'], ['replies', 'Respuestas recibidas'], ['meetings', 'Reuniones conseguidas'], ['quotes', 'Presupuestos enviados'], ['won', 'Clientes conseguidos', true],
];

export default function DashboardPage() {
  const { data: d } = useData<Dash>('/dashboard');
  if (!d) return <Loading />;
  const empty = !d.kpis.found;
  return (
    <>
      <PageHead title="Dashboard" text="Estado de la captación comercial de Odisas Lab.">
        <Link className="btn primary" href="/buscar">Buscar empresas</Link>
      </PageHead>
      {empty && (
        <div className="card" style={{ marginBottom: 14 }}>
          <Empty title="Todavía no hay empresas">
            <p style={{ marginBottom: 12 }}>Empieza eligiendo un sector y una zona: RADAR busca las empresas, revisa su web, las puntúa y te dice a cuáles contactar.</p>
            <Link className="btn primary" href="/buscar">Hacer la primera búsqueda</Link>
          </Empty>
        </div>
      )}
      <div className="grid kpis" style={{ marginBottom: 14 }}>
        {KPIS.map(([k, label, hl]) => (
          <div key={k} className={`card kpi${hl ? ' hl' : ''}`}>
            <div className="v num">{d.kpis[k] ?? 0}</div>
            <div className="l">{label}</div>
          </div>
        ))}
        <div className="card kpi" title="Clientes conseguidos sobre empresas con las que se ha llegado a contactar">
          <div className="v num">{d.kpis.conversion == null ? '—' : `${d.kpis.conversion} %`}</div>
          <div className="l">Tasa de conversión</div>
        </div>
      </div>

      <div className="grid split" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-head">
            <h2>Oportunidades recomendadas</h2>
            <span className="muted small">A quién contactar hoy y por qué</span>
          </div>
          {!d.recommended.length ? <Empty title="Sin recomendaciones todavía">Aparecerán cuando haya empresas analizadas.</Empty> : (
            <ul className="list">
              {d.recommended.map((r) => (
                <li key={r.id} className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                  <ScoreRing value={r.score} />
                  <div style={{ minWidth: 0 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <Link className="name" href={`/empresas/${r.id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>{r.name}</Link>
                      <PriorityBadge p={r.priority} />
                      <StatusBadge s={r.status} />
                    </div>
                    <ul className="bul small muted" style={{ marginTop: 4 }}>{r.reasons.slice(0, 3).map((x, i) => <li key={i}>{x}</li>)}</ul>
                    {r.action && <div className="small" style={{ marginTop: 4 }}><b>Siguiente paso:</b> {r.action}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="stack">
          <div className="card">
            <div className="card-head"><h2>Sin seguimiento</h2><Link className="small" href="/seguimiento">Ver todo</Link></div>
            {!d.stale.length ? <p className="muted small">Ninguna oportunidad abierta lleva demasiado tiempo parada.</p> : (
              <ul className="list">{d.stale.map((s) => <li key={s.id}><Link href={`/empresas/${s.id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</Link><div className="small" style={{ color: 'var(--alert)' }}>{s.staleReason}</div></li>)}</ul>
            )}
          </div>
          <div className="card">
            <div className="card-head"><h2>Señales recientes</h2><span className="muted small">{d.openTasks} tarea{d.openTasks === 1 ? '' : 's'} abierta{d.openTasks === 1 ? '' : 's'}</span></div>
            {!d.signals.length ? <p className="muted small">Sin señales nuevas. Se detectan al revisar webs y con las automatizaciones.</p> : (
              <ul className="list">{d.signals.map((s) => <li key={s.id} className="small"><span className="badge info">{SIGNAL_TYPES[s.type]}</span> <span className="muted">{fmtDate(s.detected_at)}</span><div>{s.company_id ? <Link href={`/empresas/${s.company_id}`}>{s.title}</Link> : s.title}</div></li>)}</ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid g2" style={{ marginBottom: 14 }}>
        <div className="card">
          <h2>Empresas encontradas por semana</h2>
          <WeekBars label="Empresas encontradas" data={d.weeks.map((w) => ({ week: w.week, value: w.found }))} />
        </div>
        <div className="card">
          <h2>Evolución de la captación</h2>
          <WeekLines weeks={d.weeks.map((w) => w.week)} series={[{ label: 'Contactos', values: d.weeks.map((w) => w.contacts) }, { label: 'Reuniones', values: d.weeks.map((w) => w.meetings) }, { label: 'Clientes', values: d.weeks.map((w) => w.won) }]} />
        </div>
      </div>
      <details className="card small" style={{ marginBottom: 14 }}>
        <summary>Ver los datos semanales en tabla</summary>
        <div className="table-wrap">
          <table className="t" style={{ marginTop: 10 }}>
            <thead><tr><th>Semana del</th><th>Encontradas</th><th>Contactos</th><th>Respuestas</th><th>Reuniones</th><th>Clientes</th></tr></thead>
            <tbody>{d.weeks.map((w) => <tr key={w.week}><td>{fmtDate(w.week)}</td><td className="num">{w.found}</td><td className="num">{w.contacts}</td><td className="num">{w.replies}</td><td className="num">{w.meetings}</td><td className="num">{w.won}</td></tr>)}</tbody>
          </table>
        </div>
      </details>

      <div className="grid g3">
        <div className="card">
          <h2>Embudo comercial</h2>
          <HBars rows={d.funnel.filter((x) => x.n > 0 || ['analizada', 'pendiente_contactar', 'cliente'].includes(x.status)).map((x) => ({ label: x.label, value: x.n }))} />
        </div>
        <div className="card">
          <h2>Sectores con mayor potencial</h2>
          <p className="muted tiny" style={{ marginBottom: 8 }}>Empresas con 65 puntos o más, por sector</p>
          {d.sectors.length ? <HBars rows={d.sectors.map((s) => ({ label: s.label, value: s.top, note: `media ${s.avg}` }))} /> : <p className="muted small">Sin empresas analizadas.</p>}
        </div>
        <div className="card">
          <h2>Ubicaciones con más oportunidades</h2>
          <p className="muted tiny" style={{ marginBottom: 8 }}>Empresas con 65 puntos o más, por zona</p>
          {d.places.length ? <HBars rows={d.places.map((s) => ({ label: s.place, value: s.top, note: `de ${s.n}` }))} /> : <p className="muted small">Sin empresas analizadas.</p>}
        </div>
      </div>
    </>
  );
}
