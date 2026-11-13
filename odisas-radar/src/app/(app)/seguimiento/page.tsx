'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PageHead } from '@/components/CompanyList';
import { ActionButton, Empty, Loading, ScoreRing, StatusBadge } from '@/components/ui';
import type { Status, Task } from '@/domain/types';
import { api, fmtDate, refreshAll, relDays, useData } from '@/lib/client';
import type { CompanySummary } from '@/server/companies';

type Stale = CompanySummary & { staleReason: string; staleDays: number };
interface Pipe {
  columns: { status: Status; label: string; items: CompanySummary[] }[];
  stale: Stale[];
}

export default function FollowupPage() {
  const { data, reload } = useData<Pipe>('/pipeline');
  const tasks = useData<{ tasks: Task[] }>('/tasks');
  const [view, setView] = useState<'tablero' | 'lista'>('tablero');
  if (!data) return <Loading />;
  const staleIds = new Set(data.stale.map((s) => s.id));
  const total = data.columns.reduce((s, c) => s + c.items.length, 0);
  return (
    <>
      <PageHead title="Seguimiento comercial" text="El pipeline de captación: de «pendiente de contactar» a cliente. Abre una empresa para registrar llamadas, correos y la próxima fecha de seguimiento.">
        <div className="chips">
          <button className={`chip${view === 'tablero' ? ' on' : ''}`} onClick={() => setView('tablero')}>Tablero</button>
          <button className={`chip${view === 'lista' ? ' on' : ''}`} onClick={() => setView('lista')}>Lista</button>
        </div>
      </PageHead>

      {data.stale.length > 0 && (
        <div className="card" style={{ marginBottom: 14, borderColor: '#f3c2bd' }}>
          <div className="card-head"><h2>Alertas: {data.stale.length} oportunidad{data.stale.length === 1 ? '' : 'es'} sin seguimiento</h2></div>
          <ul className="list">
            {data.stale.slice(0, 8).map((s) => (
              <li key={s.id} className="row between">
                <span><Link href={`/empresas/${s.id}`} style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</Link> <StatusBadge s={s.status} /><div className="small" style={{ color: 'var(--alert)' }}>{s.staleReason}{s.nextAction && <span className="muted"> · Siguiente paso: {s.nextAction}</span>}</div></span>
                <Link className="btn sm" href={`/empresas/${s.id}`}>Abrir</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!total ? (
        <div className="card"><Empty title="El pipeline está vacío">Guarda en el pipeline las empresas que quieras trabajar desde su ficha o desde los listados.</Empty></div>
      ) : view === 'tablero' ? (
        <div className="board" style={{ marginBottom: 14 }}>
          {data.columns.map((col) => (
            <div className="col" key={col.status}>
              <h3><span>{col.label}</span><span>{col.items.length}</span></h3>
              {col.items.map((c) => (
                <Link key={c.id} href={`/empresas/${c.id}`} className={`tile${staleIds.has(c.id) ? ' stale' : ''}`}>
                  <div className="row between" style={{ flexWrap: 'nowrap' }}><b>{c.name}</b><span className="badge">{c.score ?? '–'}</span></div>
                  <div className="muted tiny">{c.city}{c.contactPerson && ` · ${c.contactPerson}`}</div>
                  <div className="tiny" style={{ marginTop: 4 }}>{c.nextFollowupAt ? `Seguimiento ${relDays(c.nextFollowupAt)}` : c.lastContactAt ? `Último contacto ${relDays(c.lastContactAt)}` : 'Sin contactar'}</div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="table-wrap">
            <table className="t cards">
              <thead><tr><th className="c">Score</th><th>Empresa</th><th>Estado</th><th>Último contacto</th><th>Canal</th><th>Próximo seguimiento</th><th>Próxima acción</th></tr></thead>
              <tbody>
                {data.columns.flatMap((col) => col.items).map((c) => (
                  <tr key={c.id}>
                    <td className="c"><ScoreRing value={c.score} size={38} /></td>
                    <td><Link className="name" href={`/empresas/${c.id}`}>{c.name}</Link><div className="muted small">{c.contactPerson || c.city}</div></td>
                    <td className="wide"><StatusBadge s={c.status} /></td>
                    <td className="hide-m small">{fmtDate(c.lastContactAt)}</td>
                    <td className="hide-m small">{c.lastChannel || '—'}</td>
                    <td className="wide small" style={{ color: staleIds.has(c.id) ? 'var(--alert)' : undefined }}>{c.nextFollowupAt ? `${fmtDate(c.nextFollowupAt)} (${relDays(c.nextFollowupAt)})` : 'Sin fecha'}</td>
                    <td className="wide small">{c.nextAction || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Tareas pendientes</h2>
        {!tasks.data?.tasks.length ? <p className="muted small">No hay tareas pendientes.</p> : (
          <ul className="list">
            {tasks.data.tasks.map((t) => (
              <li key={t.id} className="row between">
                <label className="check"><input type="checkbox" checked={t.done} onChange={async (e) => (await api(`/tasks/${t.id}`, { method: 'PATCH', body: { done: e.target.checked } }), tasks.reload(), reload(), refreshAll())} /><span>{t.title}<div className="muted tiny">{t.dueAt ? `Vence ${relDays(t.dueAt)}` : 'Sin fecha'}{t.origin !== 'manual' && ` · creada por ${t.origin === 'alerta' ? 'una alerta de seguimiento' : t.origin === 'crm' ? 'el alta en el pipeline' : 'una automatización'}`}</div></span></label>
                <span className="actions">{t.companyId && <Link className="btn sm" href={`/empresas/${t.companyId}`}>Abrir empresa</Link>}<ActionButton className="btn sm ghost danger" onAct={async () => (await api(`/tasks/${t.id}`, { method: 'DELETE' }), tasks.reload())}>Quitar</ActionButton></span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
