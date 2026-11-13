'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PROVINCES, SECTORS } from '@/domain/catalog';
import { CATEGORIES, PRIORITIES, SERVICES, SIZE_BANDS, STATUSES, WEB_STATUSES, type ServiceId } from '@/domain/types';
import { api, fail, refreshAll, relDays, toast, useData } from '@/lib/client';
import type { CompanySummary } from '@/server/companies';
import { useMeta } from './Shell';
import { ActionButton, Empty, Loading, PriorityBadge, ScoreRing, StatusBadge, WebBadge } from './ui';

export type Filters = Record<string, string>;

/** Tabla de empresas con filtros. Cada sección del menú la usa con una vista distinta. */
export function CompanyList({ preset = {}, view = 'general', emptyTitle, emptyText }: { preset?: Filters; view?: 'general' | 'analisis' | 'prioritarias'; emptyTitle: string; emptyText: string }) {
  const [f, setF] = useState<Filters>({});
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [more, setMore] = useState(false);
  const { kick } = useMeta();
  const qs = useMemo(() => new URLSearchParams(Object.entries({ limit: '200', ...preset, ...f }).filter(([, v]) => v !== '')).toString(), [preset, f]);
  const { data, loading, reload } = useData<{ items: CompanySummary[]; total: number }>(`/companies?${qs}`);
  const set = (k: string, v: string) => (setF((p) => ({ ...p, [k]: v })), setSel(new Set()));
  const toggle = (k: string) => set(k, f[k] === '1' ? '' : '1');
  const items = data?.items ?? [];
  const bulk = async (action: string, extra: Record<string, unknown> = {}) => {
    const r = await api<{ queued?: number; done?: number }>('/bulk', { body: { ids: [...sel], action, ...extra } });
    setSel(new Set());
    if (action === 'analyze') (toast(`${r.queued} empresas en cola de análisis.`), kick());
    else toast(`Hecho: ${r.done} empresas.`);
    await reload();
    refreshAll();
  };
  const archived = f.archived === '1';

  return (
    <div className="card">
      <div className="stack" style={{ marginBottom: 14 }}>
        <div className="form-grid">
          <input className="input" placeholder="Buscar por nombre, actividad o ciudad" value={f.q ?? ''} onChange={(e) => set('q', e.target.value)} aria-label="Buscar" />
          <select className="input" value={f.sector ?? ''} onChange={(e) => set('sector', e.target.value)} aria-label="Sector">
            <option value="">Todos los sectores</option>
            {SECTORS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select className="input" value={f.province ?? ''} onChange={(e) => set('province', e.target.value)} aria-label="Provincia">
            <option value="">Todas las provincias</option>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select className="input" value={f.sort ?? preset.sort ?? 'score'} onChange={(e) => set('sort', e.target.value)} aria-label="Orden">
            <option value="score">Mayor puntuación</option>
            <option value="reciente">Más recientes</option>
            <option value="nombre">Nombre</option>
            <option value="seguimiento">Próximo seguimiento</option>
          </select>
        </div>
        <div className="chips">
          <button className={`chip${f.webStatus === 'sin_web' ? ' on' : ''}`} onClick={() => set('webStatus', f.webStatus === 'sin_web' ? '' : 'sin_web')}>Sin página web</button>
          <button className={`chip${f.webStatus === 'desactualizada,caida' ? ' on' : ''}`} onClick={() => set('webStatus', f.webStatus === 'desactualizada,caida' ? '' : 'desactualizada,caida')}>Web desactualizada</button>
          <button className={`chip${f.oppAutomation === '1' ? ' on' : ''}`} onClick={() => toggle('oppAutomation')}>Automatizables</button>
          <button className={`chip${f.oppAi === '1' ? ' on' : ''}`} onClick={() => toggle('oppAi')}>Candidatas a IA</button>
          <button className={`chip${f.multiBranch === '1' ? ' on' : ''}`} onClick={() => toggle('multiBranch')}>Varias sedes</button>
          {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).filter((c) => c !== 'otro').map((c) => (
            <button key={c} className={`chip${f.category === c ? ' on' : ''}`} onClick={() => set('category', f.category === c ? '' : c)}>{CATEGORIES[c]}</button>
          ))}
          <button className="chip" onClick={() => setMore(!more)}>{more ? 'Menos filtros' : 'Más filtros'}</button>
        </div>
        {more && (
          <div className="form-grid">
            <select className="input" value={f.status ?? ''} onChange={(e) => set('status', e.target.value)} aria-label="Estado">
              <option value="">Cualquier estado</option>
              {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="input" value={f.priority ?? ''} onChange={(e) => set('priority', e.target.value)} aria-label="Prioridad">
              <option value="">Cualquier prioridad</option>
              {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="input" value={f.size ?? ''} onChange={(e) => set('size', e.target.value)} aria-label="Tamaño">
              <option value="">Cualquier tamaño</option>
              {Object.entries(SIZE_BANDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="input" value={f.webStatus ?? ''} onChange={(e) => set('webStatus', e.target.value)} aria-label="Estado de la web">
              <option value="">Cualquier estado de web</option>
              {Object.entries(WEB_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="input" type="number" min={0} placeholder="Mín. empleados" value={f.minEmployees ?? ''} onChange={(e) => set('minEmployees', e.target.value)} aria-label="Mínimo de empleados" />
            <input className="input" placeholder="Ciudad" value={f.city ?? ''} onChange={(e) => set('city', e.target.value)} aria-label="Ciudad" />
            <label className="check"><input type="checkbox" checked={archived} onChange={() => toggle('archived')} /> Ver archivadas</label>
          </div>
        )}
      </div>

      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="muted small">{data ? `${data.total} empresa${data.total === 1 ? '' : 's'}${data.total > items.length ? ` (se muestran ${items.length})` : ''}` : ''}</span>
        {sel.size > 0 && (
          <div className="actions">
            <span className="small">{sel.size} seleccionadas</span>
            <ActionButton className="btn sm" onAct={() => bulk('analyze')}>Investigar y analizar</ActionButton>
            <ActionButton className="btn sm" onAct={() => bulk('crm')}>Guardar en el pipeline</ActionButton>
            <ActionButton className="btn sm" onAct={() => bulk(archived ? 'unarchive' : 'archive')}>{archived ? 'Recuperar' : 'Archivar'}</ActionButton>
          </div>
        )}
      </div>

      {loading && !data ? <Loading /> : !items.length ? <Empty title={emptyTitle}>{emptyText}</Empty> : (
        <div className="table-wrap">
          <table className="t cards">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="Seleccionar todas" checked={sel.size === items.length} onChange={(e) => setSel(e.target.checked ? new Set(items.map((i) => i.id)) : new Set())} /></th>
                <th className="c">Score</th>
                <th>Empresa</th>
                {view === 'general' && <><th>Web</th><th>Contacto</th><th>Estado</th></>}
                {view === 'analisis' && <><th>Por qué podría interesarle</th><th>Servicios que encajan</th></>}
                {view === 'prioritarias' && <><th>Prioridad</th><th>Próxima acción</th><th>Seguimiento</th></>}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><input type="checkbox" aria-label={`Seleccionar ${c.name}`} checked={sel.has(c.id)} onChange={(e) => { const n = new Set(sel); if (e.target.checked) n.add(c.id); else n.delete(c.id); setSel(n); }} /></td>
                  <td className="c"><ScoreRing value={c.score} /></td>
                  <td>
                    <Link className="name" href={`/empresas/${c.id}`}>{c.name}</Link>
                    {c.doNotContact && <span className="badge alert" style={{ marginLeft: 6 }}>No contactar</span>}
                    {c.inCrm && <span className="badge ok" style={{ marginLeft: 6 }}>En pipeline</span>}
                    <div className="muted small">{[CATEGORIES[c.category], c.activity || SECTORS.find((s) => s.id === c.sector)?.label, [c.city, c.province].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')].filter(Boolean).join(' · ')}{c.branches > 1 ? ` · ${c.branches} sedes` : ''}</div>
                    {c.archived && <div className="tiny muted">{c.archiveReason}</div>}
                  </td>
                  {view === 'general' && (
                    <>
                      <td className="wide"><WebBadge s={c.webStatus} /></td>
                      <td className="hide-m small">{c.email || c.phone ? <>{c.email && <div>{c.email}</div>}{c.phone && <div className="muted">{c.phone}</div>}</> : <span className="muted">Sin datos</span>}</td>
                      <td className="wide"><StatusBadge s={c.status} /></td>
                    </>
                  )}
                  {view === 'analisis' && (
                    <>
                      <td className="wide small">{c.why || <span className="muted">Pendiente de analizar</span>}{c.engine === 'reglas' && <div className="tiny muted">Análisis por reglas (sin IA)</div>}</td>
                      <td className="wide"><div className="chips">{c.topServices.map((s) => <span key={s} className="badge brand">{SERVICES[s as ServiceId].split(' ').slice(0, 3).join(' ')}</span>)}</div></td>
                    </>
                  )}
                  {view === 'prioritarias' && (
                    <>
                      <td className="wide"><PriorityBadge p={c.priority} /> <StatusBadge s={c.status} /></td>
                      <td className="wide small">{c.nextAction || '—'}</td>
                      <td className="wide small nowrap">{c.nextFollowupAt ? relDays(c.nextFollowupAt) : <span className="muted">Sin fecha</span>}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function PageHead({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children && <div className="actions no-print">{children}</div>}
    </div>
  );
}
export { fail };
