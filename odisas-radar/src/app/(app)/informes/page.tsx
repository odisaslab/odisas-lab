'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PageHead } from '@/components/CompanyList';
import { ActionButton, Empty, Loading, ScoreRing } from '@/components/ui';
import { fmtDate, api, useData } from '@/lib/client';
import type { ReportData } from '@/server/reports';

interface Rep {
  id: string;
  kind: string;
  periodFrom: string;
  periodTo: string;
  data: ReportData;
  createdAt: string;
}
const ROWS: [keyof ReportData['counts'], string][] = [['found', 'Empresas encontradas'], ['researched', 'Investigadas'], ['analyzed', 'Analizadas'], ['contacts', 'Contactos realizados'], ['replies', 'Respuestas recibidas'], ['meetings', 'Reuniones concertadas'], ['quotes', 'Presupuestos enviados'], ['won', 'Clientes conseguidos'], ['lost', 'Oportunidades perdidas']];

export default function ReportsPage() {
  const { data, reload } = useData<{ reports: Rep[] }>('/reports');
  const [openId, setOpenId] = useState('');
  if (!data) return <Loading />;
  const r = data.reports.find((x) => x.id === openId) ?? data.reports[0];
  const make = (days: number) => async () => {
    const x = await api<{ report: Rep }>('/reports', { body: { days } });
    setOpenId(x.report.id);
    await reload();
  };
  return (
    <>
      <PageHead title="Informes" text="Resumen de la captación por periodo, comparado con el periodo anterior.">
        <ActionButton className="btn" onAct={make(30)}>Informe del último mes</ActionButton>
        <ActionButton className="btn primary" onAct={make(7)}>Informe de la última semana</ActionButton>
        <a className="btn" href="/api/export/companies.csv">Exportar empresas (CSV)</a>
        {r && <button className="btn" onClick={() => window.print()}>Imprimir o guardar PDF</button>}
      </PageHead>
      {!r ? <div className="card"><Empty title="Aún no hay informes">Genera el primero con los botones de arriba, o programa uno semanal en Automatizaciones.</Empty></div> : (
        <div className="grid split">
          <div className="stack">
            <div className="card">
              <h2>Informe {r.kind} · {fmtDate(r.periodFrom)} a {fmtDate(r.periodTo)}</h2>
              <div className="table-wrap">
                <table className="t" style={{ marginTop: 8 }}>
                  <thead><tr><th>Indicador</th><th>Este periodo</th><th>Periodo anterior</th><th>Variación</th></tr></thead>
                  <tbody>
                    {ROWS.map(([k, label]) => {
                      const a = r.data.counts[k];
                      const b = r.data.previous[k];
                      return <tr key={k}><td>{label}</td><td className="num"><b>{a}</b></td><td className="num muted">{b}</td><td className="num">{a === b ? '=' : `${a > b ? '▲ +' : '▼ '}${a - b}`}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <h2>Mejores oportunidades analizadas en el periodo</h2>
              {!r.data.top.length ? <p className="muted small">No se analizó ninguna empresa en este periodo.</p> : (
                <ul className="list">{r.data.top.map((c) => <li key={c.id} className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}><ScoreRing value={c.score} size={38} /><div><Link href={`/empresas/${c.id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</Link> <span className="muted small">{c.city}</span><div className="small muted">{c.why}</div></div></li>)}</ul>
              )}
            </div>
          </div>
          <div className="stack">
            <div className="card">
              <h2>Clientes conseguidos</h2>
              {r.data.wins.length ? <ul className="bul">{r.data.wins.map((w) => <li key={w.id}><Link href={`/empresas/${w.id}`}>{w.name}</Link></li>)}</ul> : <p className="muted small">Ninguno en este periodo.</p>}
            </div>
            <div className="card">
              <h2>Necesitan seguimiento</h2>
              {r.data.stale.length ? <ul className="list small">{r.data.stale.map((s) => <li key={s.id}><Link href={`/empresas/${s.id}`}>{s.name}</Link><div className="muted">{s.staleReason}</div></li>)}</ul> : <p className="muted small">Todo al día.</p>}
              <p className="tiny muted" style={{ marginTop: 8 }}>{r.data.openTasks} tareas abiertas en el momento del informe.</p>
            </div>
            <div className="card">
              <h2>Señales detectadas</h2>
              {r.data.signals.length ? <ul className="list small">{r.data.signals.map((s, i) => <li key={i}>{s.title}{s.url && <> · <a href={s.url} target="_blank" rel="noreferrer noopener">fuente</a></>}</li>)}</ul> : <p className="muted small">Ninguna en este periodo.</p>}
            </div>
            <div className="card no-print">
              <h2>Informes anteriores</h2>
              <ul className="list small">{data.reports.map((x) => <li key={x.id}><button className="btn sm ghost" onClick={() => setOpenId(x.id)} style={{ fontWeight: x.id === r.id ? 700 : 400 }}>{x.kind === 'mensual' ? 'Mensual' : 'Semanal'} · {fmtDate(x.periodFrom)} a {fmtDate(x.periodTo)}</button></li>)}</ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
