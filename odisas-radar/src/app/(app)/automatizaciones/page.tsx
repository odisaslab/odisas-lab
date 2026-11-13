'use client';
import { useState } from 'react';
import { PageHead } from '@/components/CompanyList';
import { useMeta } from '@/components/Shell';
import { ActionButton, Empty, Field, Loading, Modal } from '@/components/ui';
import { PROVINCES, SECTORS } from '@/domain/catalog';
import { AUTOMATION_TYPES, FREQUENCIES, type Automation, type AutomationType, type Frequency } from '@/domain/types';
import { api, fmtDate, refreshAll, toast, useData } from '@/lib/client';

type Row = Automation & { description: string };
const blank = (type: AutomationType): Partial<Automation> => ({ name: '', type, frequency: type === 'seguimiento' ? 'diaria' : 'semanal', enabled: true, config: type === 'busqueda' ? { provider: 'osm', query: { limit: 30 }, research: true, analyze: true, minScore: 45, createTasks: true } : type === 'senales' ? { maxCompanies: 25, news: false } : {} });

export default function AutomationsPage() {
  const { data, reload, setData } = useData<{ automations: Row[]; runs: { id: string; name: string; started_at: string; status: string; summary: string }[] }>('/automations');
  const { meta, kick } = useMeta();
  const [edit, setEdit] = useState<Partial<Automation> | null>(null);
  if (!data) return <Loading />;
  return (
    <>
      <PageHead title="Automatizaciones" text="Tareas que RADAR repite solo: buscar, investigar, puntuar, avisar y preparar informes. Ninguna envía comunicaciones: los mensajes siempre los revisa y envía una persona.">
        <button className="btn primary" onClick={() => setEdit(blank('busqueda'))}>Nueva automatización</button>
      </PageHead>
      {meta && !meta.cron && <div className="notice warn" style={{ marginBottom: 14 }}><span><b>La ejecución periódica no está activa.</b> Falta la variable <code>CRON_SECRET</code> en el servidor. Mientras tanto puedes lanzar cada automatización a mano con «Ejecutar ahora».</span></div>}
      <div className="stack" style={{ marginBottom: 14 }}>
        {!data.automations.length ? (
          <div className="card"><Empty title="Sin automatizaciones">
            <p style={{ marginBottom: 12 }}>Por ejemplo: buscar cada semana distribuidoras en tu provincia, analizarlas y crear una tarea para las prioritarias.</p>
            <div className="chips" style={{ justifyContent: 'center' }}>{(Object.keys(AUTOMATION_TYPES) as AutomationType[]).map((t) => <button key={t} className="chip" onClick={() => setEdit(blank(t))}>{AUTOMATION_TYPES[t]}</button>)}</div>
          </Empty></div>
        ) : data.automations.map((a) => (
          <div className="card" key={a.id}>
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row" style={{ gap: 6 }}><h2>{a.name}</h2><span className="badge">{FREQUENCIES[a.frequency]}</span><span className={`badge ${a.enabled ? 'ok' : ''}`}>{a.enabled ? 'Activa' : 'Desactivada'}</span></div>
                <p className="small" style={{ marginTop: 4 }}>{a.description}</p>
                <p className="tiny muted" style={{ marginTop: 4 }}>{a.lastRunAt ? `Última ejecución ${fmtDate(a.lastRunAt, true)}: ${a.lastResult}` : 'Aún no se ha ejecutado.'}{a.enabled && a.nextRunAt && ` · Próxima: ${fmtDate(a.nextRunAt)}`}</p>
              </div>
              <div className="actions">
                <label className="check"><input type="checkbox" checked={a.enabled} onChange={async (e) => { const enabled = e.target.checked; setData({ ...data, automations: data.automations.map((x) => (x.id === a.id ? { ...x, enabled } : x)) }); await api(`/automations/${a.id}`, { method: 'PATCH', body: { enabled } }); await reload(); }} /> Activa</label>
                <ActionButton className="btn sm dark" onAct={async () => { const r = await api<{ summary: string; jobs: { pending: number } }>(`/automations/${a.id}/run`, { body: {} }); toast(r.summary); if (r.jobs.pending) kick(); await reload(); refreshAll(); }}>Ejecutar ahora</ActionButton>
                <button className="btn sm" onClick={() => setEdit(a)}>Configurar</button>
                <ActionButton className="btn sm ghost danger" onAct={async () => { if (window.confirm(`¿Eliminar «${a.name}»?`)) (await api(`/automations/${a.id}`, { method: 'DELETE' }), reload()); }}>Eliminar</ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!!data.runs.length && (
        <div className="card">
          <h2>Últimas ejecuciones</h2>
          <ul className="list small">{data.runs.map((r) => <li key={r.id} className="row between"><span><b>{r.name}</b> · {r.summary}</span><span className="nowrap"><span className={`badge ${r.status === 'error' ? 'alert' : 'ok'}`}>{r.status === 'error' ? 'Error' : 'Correcta'}</span> <span className="muted">{fmtDate(r.started_at, true)}</span></span></li>)}</ul>
        </div>
      )}
      {edit && <EditModal a={edit} providers={meta?.providers ?? []} onClose={() => setEdit(null)} onSaved={() => (setEdit(null), void reload())} />}
    </>
  );
}

function EditModal({ a, providers, onClose, onSaved }: { a: Partial<Automation>; providers: { id: string; label: string; available: boolean; requires: string }[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(a);
  const c = f.config ?? {};
  const q = c.query ?? {};
  const cfg = (patch: Record<string, unknown>) => setF({ ...f, config: { ...c, ...patch } });
  const qry = (patch: Record<string, unknown>) => cfg({ query: { ...q, ...patch } });
  return (
    <Modal title={a.id ? 'Configurar automatización' : 'Nueva automatización'} onClose={onClose} wide>
      <div className="stack">
        {!a.id && <div className="chips">{(Object.keys(AUTOMATION_TYPES) as AutomationType[]).map((t) => <button key={t} className={`chip${f.type === t ? ' on' : ''}`} onClick={() => setF({ ...blank(t), name: f.name })}>{AUTOMATION_TYPES[t]}</button>)}</div>}
        <div className="form-grid">
          <Field label="Nombre"><input className="input" value={f.name ?? ''} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={AUTOMATION_TYPES[f.type as AutomationType]} /></Field>
          <Field label="Frecuencia"><select className="input" value={f.frequency} onChange={(e) => setF({ ...f, frequency: e.target.value as Frequency })}>{Object.entries(FREQUENCIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        </div>
        {f.type === 'busqueda' && (
          <>
            <div className="form-grid">
              <Field label="Sector"><select className="input" value={q.sector ?? ''} onChange={(e) => qry({ sector: e.target.value })}><option value="">Cualquiera</option>{SECTORS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
              <Field label="Actividad o descripción"><input className="input" value={q.activity ?? ''} onChange={(e) => qry({ activity: e.target.value, text: e.target.value })} /></Field>
              <Field label="Provincia"><select className="input" value={q.province ?? ''} onChange={(e) => qry({ province: e.target.value })}><option value="">Toda España</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>
              <Field label="Ciudad"><input className="input" value={q.city ?? ''} onChange={(e) => qry({ city: e.target.value })} /></Field>
              <Field label="Fuente de datos"><select className="input" value={c.provider ?? 'osm'} onChange={(e) => cfg({ provider: e.target.value })}>{providers.map((p) => <option key={p.id} value={p.id} disabled={!p.available}>{p.label}{p.available ? '' : ` (necesita: ${p.requires})`}</option>)}</select></Field>
              <Field label="Máximo por ejecución"><input className="input" type="number" min={1} max={100} value={q.limit ?? 30} onChange={(e) => qry({ limit: Number(e.target.value) })} /></Field>
              <Field label="Puntuación mínima para conservarlas" hint="Las que queden por debajo se archivan."><input className="input" type="number" min={0} max={100} value={c.minScore ?? ''} onChange={(e) => cfg({ minScore: e.target.value === '' ? undefined : Number(e.target.value) })} /></Field>
            </div>
            <label className="check"><input type="checkbox" checked={c.research !== false} onChange={(e) => cfg({ research: e.target.checked })} /> Investigar automáticamente la web de las empresas encontradas</label>
            <label className="check"><input type="checkbox" checked={c.analyze !== false} onChange={(e) => cfg({ analyze: e.target.checked })} /> Analizar sus oportunidades y asignarles RADAR SCORE</label>
            <label className="check"><input type="checkbox" checked={!!c.createTasks} onChange={(e) => cfg({ createTasks: e.target.checked })} /> Crear una tarea para las de prioridad alta o muy alta</label>
          </>
        )}
        {f.type === 'senales' && (
          <>
            <Field label="Empresas a revisar por ejecución"><input className="input" type="number" min={1} max={100} value={c.maxCompanies ?? 25} onChange={(e) => cfg({ maxCompanies: Number(e.target.value) })} /></Field>
            <label className="check"><input type="checkbox" checked={!!c.news} onChange={(e) => cfg({ news: e.target.checked })} /> Buscar además noticias de las más prioritarias (necesita la clave de IA)</label>
          </>
        )}
        {f.type === 'seguimiento' && <p className="small muted">Crea una tarea por cada oportunidad abierta que haya superado su fecha de seguimiento o lleve demasiados días sin actividad (el umbral se ajusta en Configuración).</p>}
        {f.type === 'informe' && <p className="small muted">Genera el informe de captación del periodo y lo deja en la sección Informes.</p>}
      </div>
      <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Cancelar</button><ActionButton className="btn primary" onAct={async () => (await api('/automations', { body: f }), onSaved())}>Guardar</ActionButton></div>
    </Modal>
  );
}
