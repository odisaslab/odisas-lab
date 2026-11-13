'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CompanyList, PageHead } from '@/components/CompanyList';
import { useMeta } from '@/components/Shell';
import { ActionButton, Field, Modal } from '@/components/ui';
import { PROVINCES, SECTORS, type PostFilters } from '@/domain/catalog';
import { CATEGORIES, type SearchQuery } from '@/domain/types';
import { api, ApiError, fmtDate, refreshAll, toast, useData } from '@/lib/client';

interface Result {
  found: number;
  added: { id: string }[];
  duplicates: { name: string; existingId: string }[];
  excluded: { name: string; reason: string }[];
  queued: number;
  ids: string[];
}
const EXAMPLES = ['Empresas industriales de Madrid', 'Distribuidoras de productos de peluquería en España', 'Empresas de logística de más de 20 trabajadores en Valencia', 'Empresas que no tienen página web en Sevilla', 'Negocios que podrían automatizar la atención al cliente'];

export default function SearchPage() {
  const { meta, kick } = useMeta();
  const [text, setText] = useState('');
  const [q, setQ] = useState<SearchQuery>({ web: 'cualquiera', limit: 40 });
  const [post, setPost] = useState<PostFilters>({});
  const [provider, setProvider] = useState('osm');
  const [auto, setAuto] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [modal, setModal] = useState<'csv' | 'one' | null>(null);
  const searches = useData<{ id: string; query: SearchQuery & { post?: PostFilters }; provider: string; found: number; added: number; duplicates: number; created_at: string }[]>('/searches');
  const set = <K extends keyof SearchQuery>(k: K, v: SearchQuery[K]) => setQ((p) => ({ ...p, [k]: v }));
  const prov = meta?.providers.find((p) => p.id === provider);

  const interpret = async (t = text) => {
    if (!t.trim()) return;
    const r = await api<{ query: SearchQuery; post: PostFilters }>('/search/parse', { body: { text: t } });
    setQ({ web: 'cualquiera', limit: q.limit, ...r.query, text: t });
    setPost(r.post);
    if (!r.query.sector && !r.query.category && provider === 'osm' && meta?.ai) setProvider('ia');
  };
  const run = async () => {
    setResult(null);
    const needsAnalysis = Object.values(post).some(Boolean);
    const r = await api<Result>('/search', { body: { query: q, provider, autoAnalyze: auto || needsAnalysis, post } });
    setResult(r);
    void searches.reload();
    refreshAll();
    if (r.queued) kick();
    toast(r.found ? `${r.found} encontradas · ${r.added.length} nuevas · ${r.duplicates.length} ya estaban` : 'La fuente no ha devuelto empresas para esa búsqueda.');
  };
  const postPreset: Record<string, string> = { ...(post.webOutdated ? { webStatus: 'desactualizada,caida,mejorable' } : {}), ...(post.automation ? { oppAutomation: '1' } : {}), ...(post.ai ? { oppAi: '1' } : {}), ...(post.multiBranch ? { multiBranch: '1' } : {}) };

  return (
    <>
      <PageHead title="Buscar empresas" text="Describe lo que buscas o usa los filtros. Las empresas nuevas se guardan sin duplicar las que ya tienes.">
        <button className="btn" onClick={() => setModal('one')}>Añadir una empresa</button>
        <button className="btn" onClick={() => setModal('csv')}>Importar listado</button>
      </PageHead>

      <div className="card stack" style={{ marginBottom: 14 }}>
        <Field label="Búsqueda en lenguaje natural">
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void interpret()} placeholder="Ej.: distribuidoras de productos de peluquería en Sevilla" />
            <ActionButton className="btn dark" onAct={() => interpret()}>Interpretar</ActionButton>
          </div>
        </Field>
        <div className="chips">
          {EXAMPLES.map((e) => <button key={e} className="chip" onClick={() => (setText(e), void interpret(e))}>{e}</button>)}
        </div>
        <hr style={{ border: 0, borderTop: '1px solid var(--line)', width: '100%', margin: 0 }} />
        <div className="form-grid">
          <Field label="Sector de actividad">
            <select className="input" value={q.sector ?? ''} onChange={(e) => setQ((p) => ({ ...p, sector: e.target.value, category: SECTORS.find((s) => s.id === e.target.value)?.category ?? p.category }))}>
              <option value="">Cualquiera</option>
              {SECTORS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Tipo de empresa">
            <select className="input" value={q.category ?? ''} onChange={(e) => set('category', e.target.value as SearchQuery['category'])}>
              <option value="">Cualquiera</option>
              {Object.entries(CATEGORIES).filter(([k]) => k !== 'otro').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Actividad concreta"><input className="input" value={q.activity ?? ''} onChange={(e) => set('activity', e.target.value)} placeholder="Ej.: carpintería de aluminio" /></Field>
          <Field label="Nombre de empresa"><input className="input" value={q.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="Contiene…" /></Field>
          <Field label="Provincia">
            <select className="input" value={q.province ?? ''} onChange={(e) => setQ((p) => ({ ...p, province: e.target.value, location: '' }))}>
              <option value="">Toda España</option>
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Ciudad"><input className="input" value={q.city ?? ''} onChange={(e) => set('city', e.target.value)} placeholder="Opcional" /></Field>
          <Field label="Página web">
            <select className="input" value={q.web ?? 'cualquiera'} onChange={(e) => set('web', e.target.value as SearchQuery['web'])}>
              <option value="cualquiera">Con o sin web</option>
              <option value="con_web">Solo con web</option>
              <option value="sin_web">Solo sin web</option>
            </select>
          </Field>
          <Field label="Empleados (mínimo)" hint="Solo filtra cuando la fuente publica el dato."><input className="input" type="number" min={0} value={q.minEmployees ?? ''} onChange={(e) => set('minEmployees', e.target.value ? Number(e.target.value) : undefined)} /></Field>
          <Field label="Máximo de resultados"><input className="input" type="number" min={1} max={200} value={q.limit ?? 40} onChange={(e) => set('limit', Number(e.target.value) || 40)} /></Field>
        </div>
        <div>
          <div className="small muted" style={{ marginBottom: 6, fontWeight: 550 }}>Mostrar solo las que, tras analizarlas, cumplan:</div>
          <div className="chips">
            {([['webOutdated', 'Web desactualizada o mejorable'], ['automation', 'Procesos automatizables'], ['ai', 'Podrían beneficiarse de IA'], ['multiBranch', 'Varias delegaciones']] as const).map(([k, l]) => (
              <button key={k} className={`chip${post[k] ? ' on' : ''}`} onClick={() => setPost((p) => ({ ...p, [k]: !p[k] }))}>{l}</button>
            ))}
          </div>
        </div>
        <div className="form-grid" style={{ alignItems: 'end' }}>
          <Field label="Fuente de datos">
            <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
              {meta?.providers.map((p) => <option key={p.id} value={p.id} disabled={!p.available}>{p.label}{p.available ? '' : ` (necesita: ${p.requires})`}</option>)}
            </select>
          </Field>
          <label className="check" style={{ paddingBottom: 9 }}><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Investigar y analizar automáticamente las empresas nuevas</label>
          <ActionButton className="btn primary" onAct={run}>Buscar empresas</ActionButton>
        </div>
        {prov && <p className="tiny muted">{prov.description} {prov.license}</p>}
      </div>

      {result && (
        <div className="stack" style={{ marginBottom: 14 }}>
          <div className={`notice ${result.found ? 'ok' : 'warn'}`}>
            <span>
              <b>{result.found} empresas encontradas.</b> {result.added.length} nuevas, {result.duplicates.length} ya estaban guardadas (no se han duplicado){result.excluded.length ? `, ${result.excluded.length} omitidas por estar en la lista de exclusión` : ''}.
              {result.queued > 0 && ` ${result.queued} en cola de investigación y análisis: la puntuación irá apareciendo.`}
              {!result.found && ' Prueba con una zona más amplia, otro sector u otra fuente de datos.'}
            </span>
          </div>
          {result.ids.length > 0 && <CompanyList key={result.ids.join()} preset={{ ids: result.ids.join(','), ...postPreset }} emptyTitle="Ninguna cumple todavía los filtros de análisis" emptyText="Los filtros de web, automatización e IA se aplican cuando termina el análisis de cada empresa." />}
        </div>
      )}

      {!!searches.data?.length && (
        <div className="card">
          <h2>Búsquedas recientes</h2>
          <ul className="list small">
            {searches.data.map((s) => (
              <li key={s.id} className="row between">
                <span>{[s.query.text, SECTORS.find((x) => x.id === s.query.sector)?.label, s.query.activity, s.query.city, s.query.province].filter(Boolean).join(' · ') || (s.provider === 'csv' ? 'Importación de listado' : 'Búsqueda')}</span>
                <span className="muted nowrap">{fmtDate(s.created_at)} · {s.found} encontradas · {s.added} nuevas</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {modal === 'csv' && <CsvModal onClose={() => setModal(null)} onDone={(r) => (setResult(r), setModal(null), refreshAll(), r.queued && kick())} />}
      {modal === 'one' && <OneModal onClose={() => setModal(null)} />}
    </>
  );
}

function CsvModal({ onClose, onDone }: { onClose: () => void; onDone: (r: Result) => void }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [auto, setAuto] = useState(true);
  return (
    <Modal title="Importar un listado de empresas" onClose={onClose} wide>
      <div className="stack">
        <p className="small muted">Archivo CSV con una fila de cabeceras. Columnas reconocidas: Nombre o Empresa (obligatoria), Web, Email, Teléfono, Dirección, Ciudad, Provincia, Sector, Actividad, Empleados. Importa solo listados que tengas derecho a usar.</p>
        <input type="file" accept=".csv,text/csv,text/plain" onChange={async (e) => setText((await e.target.files?.[0]?.text()) ?? '')} />
        <textarea className="input" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Empresa;Web;Teléfono;Ciudad\nTalleres Ruiz;talleresruiz.es;956 000 111;Jerez'} />
        <Field label="Origen del listado" hint="Queda anotado como procedencia de cada dato."><input className="input" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Ej.: Feria Hostelco 2026" /></Field>
        <label className="check"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Investigar y analizar al importar</label>
      </div>
      <div className="modal-foot">
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <ActionButton className="btn primary" disabled={!text.trim()} onAct={async () => onDone(await api<Result>('/import/csv', { body: { text, source, autoAnalyze: auto } }))}>Importar</ActionButton>
      </div>
    </Modal>
  );
}

function OneModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ name: '', website: '', city: '', province: '', activity: '' });
  const [dup, setDup] = useState<{ id: string; msg: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="Añadir una empresa" onClose={onClose}>
      <div className="form-grid">
        <Field label="Nombre"><input className="input" value={f.name} onChange={set('name')} autoFocus /></Field>
        <Field label="Página web"><input className="input" value={f.website} onChange={set('website')} placeholder="empresa.es" /></Field>
        <Field label="Ciudad"><input className="input" value={f.city} onChange={set('city')} /></Field>
        <Field label="Provincia"><input className="input" value={f.province} onChange={set('province')} /></Field>
        <Field label="Actividad"><input className="input" value={f.activity} onChange={set('activity')} /></Field>
      </div>
      {dup && <div className="notice warn" style={{ marginTop: 12 }}><span>{dup.msg} <Link href={`/empresas/${dup.id}`}>Abrir la ficha existente</Link></span></div>}
      <div className="modal-foot">
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <ActionButton className="btn primary" disabled={!f.name.trim()} onAct={async () => {
          try {
            const r = await api<{ company: { id: string } }>('/companies', { body: f });
            window.location.href = `/empresas/${r.company.id}`;
          } catch (e) {
            if (e instanceof ApiError && e.data.existingId) setDup({ id: String(e.data.existingId), msg: e.message });
            else throw e;
          }
        }}>Guardar e investigar</ActionButton>
      </div>
    </Modal>
  );
}
