'use client';
import Link from 'next/link';
import { use, useState } from 'react';
import { Composer, MessageCard } from '@/components/Messages';
import { useMeta } from '@/components/Shell';
import { ActionButton, Field, Icon, Loading, Modal, PriorityBadge, ScoreRing, WebBadge } from '@/components/ui';
import { SECTORS } from '@/domain/catalog';
import { ACTIVITY_TYPES, CATEGORIES, FACT_FIELDS, SERVICES, SIGNAL_TYPES, SIZE_BANDS, STATUSES, type Activity, type ActivityType, type Company, type Contact, type Message, type Signal, type Status, type Task } from '@/domain/types';
import { api, fmtDate, refreshAll, relDays, toast, toInputDate, useData } from '@/lib/client';

interface Detail {
  company: Company;
  contacts: Contact[];
  activities: Activity[];
  tasks: Task[];
  messages: Message[];
  signals: Signal[];
  stale: { stale: boolean; reason: string };
  job: { status: string; error: string } | null;
}
const FACT_BADGE = { verificado: ['ok', 'Verificado'], estimado: ['warn', 'Estimado'], no_encontrado: ['', 'No encontrado'] } as const;
const SEV = { critical: 'alert', high: 'alert', medium: 'warn', low: '' } as Record<string, string>;

export default function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, reload, error } = useData<Detail>(`/companies/${id}`);
  const { meta } = useMeta();
  const [tab, setTab] = useState('resumen');
  const [modal, setModal] = useState<'edit' | 'log' | 'contact' | null>(null);
  if (error) return <div className="notice alert">{error} <Link href="/empresas">Volver a empresas</Link></div>;
  if (!data) return <Loading />;
  const { company: c } = data;
  const r = c.report;
  const busy = data.job?.status === 'pendiente' || data.job?.status === 'en_curso';
  const patch = async (body: Record<string, unknown>): Promise<void> => {
    await api(`/companies/${id}`, { method: 'PATCH', body });
    await reload();
    refreshAll();
  };
  const place = [c.address, c.postalCode, c.city, c.province].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');

  return (
    <>
      <div className="small muted" style={{ marginBottom: 8 }}><Link href="/empresas">Empresas</Link> / {c.name}</div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', minWidth: 0 }}>
            <ScoreRing value={c.score} size={64} />
            <div style={{ minWidth: 0 }}>
              <h1>{c.name}</h1>
              <div className="muted small">{[CATEGORIES[c.category], c.activity || SECTORS.find((s) => s.id === c.sector)?.label, [c.city, c.province].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')].filter(Boolean).join(' · ')}</div>
              <div className="row" style={{ gap: 6, marginTop: 8 }}>
                <PriorityBadge p={c.priority} />
                <WebBadge s={c.webStatus} />
                {c.inCrm && <span className="badge ok">En el pipeline{c.crmId ? ` · CRM ${c.crmId}` : ''}</span>}
                {c.doNotContact && <span className="badge alert">No contactar</span>}
                {c.archived && <span className="badge">Archivada</span>}
                {busy && <span className="badge info"><span className="spin dark" style={{ width: 10, height: 10 }} /> Analizando…</span>}
              </div>
            </div>
          </div>
          <div className="actions">
            <select className="input" style={{ width: 'auto' }} value={c.status} onChange={(e) => void patch({ status: e.target.value })} aria-label="Estado comercial">
              {(Object.keys(STATUSES) as Status[]).map((s) => <option key={s} value={s}>{STATUSES[s]}</option>)}
            </select>
            <ActionButton className="btn" onAct={async () => (await api(`/companies/${id}/analyze`, { body: { research: true } }), toast('Empresa investigada y analizada.'), await reload(), refreshAll())}>{c.analyzedAt ? 'Volver a analizar' : 'Investigar y analizar'}</ActionButton>
            {!c.inCrm && <ActionButton className="btn primary" onAct={async () => { const x = await api<{ taskCreated: boolean; sync: { ok: boolean; skipped?: boolean; error?: string } }>(`/companies/${id}/crm`, { body: {} }); toast(`Guardada en el pipeline${x.taskCreated ? ' con tarea de primer contacto' : ''}${x.sync.skipped ? '' : x.sync.ok ? ' y enviada al CRM' : `. El CRM no ha respondido: ${x.sync.error}`}.`, !x.sync.ok); await reload(); refreshAll(); }}>Guardar en el pipeline</ActionButton>}
          </div>
        </div>
        {data.job?.status === 'error' && <div className="notice warn" style={{ marginTop: 12 }}>El último análisis automático falló: {data.job.error}</div>}
        {data.stale.stale && <div className="notice alert" style={{ marginTop: 12 }}><Icon name="warn" /> {data.stale.reason}. {c.nextAction && <>Siguiente paso: {c.nextAction}</>}</div>}
      </div>

      <div className="tabs" role="tablist">
        {[['resumen', 'Datos'], ['analisis', 'Análisis'], ['mensajes', `Mensajes${data.messages.length ? ` (${data.messages.length})` : ''}`], ['seguimiento', 'Seguimiento'], ['senales', `Señales${data.signals.length ? ` (${data.signals.length})` : ''}`]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'resumen' && (
        <div className="grid split">
          <div className="stack">
            <div className="card">
              <div className="card-head"><h2>Ficha de la empresa</h2><button className="btn sm" onClick={() => setModal('edit')}>Editar</button></div>
              <dl className="dl">
                <dt>Razón social</dt><dd>{c.legalName || '—'}{c.taxId && ` · CIF ${c.taxId}`}</dd>
                <dt>Descripción</dt><dd>{c.description || '—'}</dd>
                <dt>Dirección</dt><dd>{place || '—'}</dd>
                <dt>Página web</dt><dd>{c.website ? <a href={c.website} target="_blank" rel="noreferrer noopener">{c.website.replace(/^https?:\/\//, '')}</a> : 'No se ha encontrado'}</dd>
                <dt>Correo</dt><dd>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '—'}</dd>
                <dt>Teléfono</dt><dd>{c.phone ? <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a> : '—'}</dd>
                <dt>Formulario</dt><dd>{c.contactFormUrl ? <a href={c.contactFormUrl} target="_blank" rel="noreferrer noopener">Abrir formulario de contacto</a> : '—'}</dd>
                <dt>Redes</dt><dd>{Object.keys(c.socials).length ? Object.entries(c.socials).map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer noopener" style={{ marginRight: 10, textTransform: 'capitalize' }}>{k}</a>) : '—'}</dd>
                <dt>Tamaño</dt><dd>{c.employees ? `${c.employees} empleados · ` : ''}{c.sizeBand ? SIZE_BANDS[c.sizeBand] : 'No consta'}{c.branches > 1 && ` · ${c.branches} sedes`}</dd>
                <dt>Origen</dt><dd>{c.source} · añadida {fmtDate(c.createdAt)}</dd>
              </dl>
            </div>
            <div className="card">
              <h2>Procedencia de los datos</h2>
              <p className="muted small" style={{ marginBottom: 10 }}>De dónde sale cada dato y si está comprobado. Lo que no aparece publicado se deja como «no encontrado»: RADAR no lo inventa.</p>
              <div className="table-wrap">
                <table className="t">
                  <tbody>
                    {(Object.keys(FACT_FIELDS) as (keyof typeof FACT_FIELDS)[]).filter((k) => c.facts[k]).map((k) => {
                      const f = c.facts[k];
                      return (
                        <tr key={k}>
                          <td className="muted nowrap">{FACT_FIELDS[k]}</td>
                          <td style={{ overflowWrap: 'anywhere' }}>{f.value || '—'}</td>
                          <td><span className={`badge ${FACT_BADGE[f.status][0]}`}>{FACT_BADGE[f.status][1]}</span></td>
                          <td className="small muted">{f.url ? <a href={f.url} target="_blank" rel="noreferrer noopener">{f.source}</a> : f.source}{f.at && ` · ${fmtDate(f.at)}`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="stack">
            <div className="card">
              <h2>Diagnóstico de la web</h2>
              {!c.website ? <p className="muted small">No se ha encontrado página web. Si la conoces, añádela en «Editar».</p> : !c.audit ? <p className="muted small">Todavía no se ha revisado.</p> : !c.audit.ok ? <div className="notice warn">{c.audit.error}</div> : (
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row"><ScoreRing value={c.audit.score ?? null} /><div className="small"><b>Nota técnica de la portada</b><div className="muted">Revisada {fmtDate(c.audit.checkedAt)} · {c.audit.pages?.length ?? 1} página(s) leídas</div></div></div>
                  {c.audit.categories?.map((x) => <div key={x.id} className="small"><div className="row between"><span>{x.label}</span><b className="num">{x.score}</b></div><div className="bar"><i style={{ width: `${x.score}%` }} /></div></div>)}
                  {c.audit.signals && (
                    <div className="chips">
                      {([['https', 'HTTPS'], ['responsive', 'Adaptada a móvil'], ['form', 'Formulario'], ['whatsapp', 'WhatsApp'], ['chat', 'Chat o asistente'], ['ecommerce', 'Tienda online'], ['booking', 'Reserva online'], ['clientArea', 'Área de clientes'], ['analytics', 'Analítica']] as const).map(([k, l]) => <span key={k} className={`badge ${c.audit!.signals![k] ? 'ok' : ''}`}>{c.audit!.signals![k] ? '✓' : '✗'} {l}</span>)}
                      {c.audit.signals.copyrightYear && <span className="badge">© {c.audit.signals.copyrightYear}</span>}
                      {c.audit.signals.generator && <span className="badge">{c.audit.signals.generator}</span>}
                    </div>
                  )}
                  {!!c.audit.issues?.length && <ul className="list small">{c.audit.issues.slice(0, 8).map((i, k) => <li key={k}><span className={`badge ${SEV[i.severity]}`}>{i.title}</span><div className="muted">{i.evidence}</div></li>)}</ul>}
                </div>
              )}
            </div>
            <div className="card">
              <h2>Gestión de datos</h2>
              <div className="stack" style={{ gap: 8 }}>
                <label className="check"><input type="checkbox" checked={c.doNotContact} onChange={(e) => void patch({ doNotContact: e.target.checked })} /> <span><b>No contactar.</b> Bloquea el registro y el envío de comunicaciones comerciales.</span></label>
                <label className="check"><input type="checkbox" checked={c.archived} onChange={(e) => void patch({ archived: e.target.checked })} /> <span><b>Archivada.</b> Deja de aparecer en listados y recomendaciones.</span></label>
                <div className="actions">
                  <ActionButton className="btn sm danger" onAct={async () => { if (!window.confirm(`Se borrarán definitivamente la ficha de «${c.name}», sus contactos, mensajes e historial, y no volverá a importarse. ¿Continuar?`)) return; await api(`/companies/${id}?exclude=1`, { method: 'DELETE' }); window.location.href = '/empresas'; }}>Borrar y excluir (derecho de supresión)</ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'analisis' && (!r ? (
        <div className="card empty"><b>Esta empresa aún no se ha analizado</b>Pulsa «Investigar y analizar» para revisar su web y generar el informe.</div>
      ) : (
        <div className="grid split">
          <div className="stack">
            <div className="card stack" style={{ gap: 12 }}>
              <div className="card-head"><h2>Informe de oportunidad</h2><span className="badge">{r.engine === 'ia' ? `Analizado con IA · ${fmtDate(r.createdAt)}` : `Análisis por reglas, sin IA · ${fmtDate(r.createdAt)}`}</span></div>
              {r.engine === 'reglas' && meta && !meta.ai && <div className="notice info">Informe básico generado por reglas. Con la clave de IA configurada, el análisis lee el contenido de la web y es mucho más específico.</div>}
              <section><h3>1 · Descripción de la empresa</h3><p>{r.description}</p></section>
              <section>
                <h3>2 · Necesidades observadas <span className="badge ok">Comprobado</span></h3>
                {r.observed.length ? <ul className="bul">{r.observed.map((o, i) => <li key={i}><b>{o.title}.</b> {o.evidence}</li>)}</ul> : <p className="muted">No hay carencias comprobadas en las fuentes consultadas.</p>}
              </section>
              <section>
                <h3>3 · Posibles problemas y oportunidades <span className="badge warn">Hipótesis a validar</span></h3>
                <p className="muted small" style={{ marginBottom: 6 }}>No están confirmadas: son suposiciones razonables que hay que comprobar en una reunión.</p>
                <ul className="bul">{r.hypotheses.map((h, i) => <li key={i}><b>{h.title}.</b> {h.rationale} <span className="muted">Cómo validarlo: {h.validate}</span></li>)}{r.problems.map((p, i) => <li key={`p${i}`}>{p}</li>)}</ul>
              </section>
              <section>
                <h3>4 · Servicios de Odisas Lab que encajan</h3>
                <ul className="list">{r.services.map((s) => <li key={s.id} className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}><span className={`badge ${s.fit === 'alto' ? 'dark' : s.fit === 'medio' ? 'brand' : ''}`}>Encaje {s.fit}</span><span><b>{SERVICES[s.id]}.</b> {s.why}</span></li>)}</ul>
              </section>
              <section><h3>5 · Por qué podría estar interesada</h3><p>{r.whyInterested}</p></section>
              <section><h3>6 · Propuesta comercial</h3><p>{r.proposal}</p></section>
              <section><h3>7 · Información que falta por investigar</h3><ul className="bul">{r.missing.map((m, i) => <li key={i}>{m}</li>)}</ul></section>
            </div>
          </div>
          <div className="stack">
            {c.scoreData && (
              <div className="card">
                <div className="card-head"><h2>RADAR SCORE</h2><span className={`badge ${c.scoreData.confidence === 'alta' ? 'ok' : c.scoreData.confidence === 'media' ? 'warn' : ''}`}>Confianza {c.scoreData.confidence}</span></div>
                <div className="row" style={{ marginBottom: 12 }}><ScoreRing value={c.scoreData.total} size={72} /><div><PriorityBadge p={c.scoreData.priority} /><div className="small muted" style={{ marginTop: 4 }}>Prioridad de contacto</div></div></div>
                <div className="stack" style={{ gap: 9 }}>
                  {c.scoreData.components.map((x) => (
                    <div key={x.id} className="small">
                      <div className="row between"><span>{x.label} <span className="muted tiny">· pesa {x.weight} %</span></span><b className="num">{x.value}</b></div>
                      <div className="bar"><i style={{ width: `${x.value}%`, background: x.weight >= 10 ? 'var(--series-1)' : '#b9b5aa' }} /></div>
                      <div className="muted tiny">{x.reason}</div>
                    </div>
                  ))}
                </div>
                <ul className="bul small" style={{ marginTop: 12 }}>{c.scoreData.explanation.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            <div className="card"><h2>Siguiente acción recomendada</h2><p>{r.nextAction}</p><div className="actions" style={{ marginTop: 10 }}><button className="btn sm primary" onClick={() => setTab('mensajes')}>Preparar mensaje</button></div></div>
          </div>
        </div>
      ))}

      {tab === 'mensajes' && (
        <div className="stack">
          {c.doNotContact && <div className="notice alert">Empresa marcada como «no contactar»: puedes preparar textos, pero no registrar ni enviar comunicaciones.</div>}
          {!r && <div className="notice info">Analiza primero la empresa: los mensajes se personalizan con lo que se ha comprobado de ella.</div>}
          <div className="card"><h2>Preparar un mensaje</h2><Composer companyId={id} onCreated={reload} /></div>
          {data.messages.map((m) => <MessageCard key={m.id + m.updatedAt} m={m} email={c.email} canContact={!c.doNotContact} onChange={reload} />)}
        </div>
      )}

      {tab === 'seguimiento' && (
        <div className="grid split">
          <div className="card">
            <div className="card-head"><h2>Historial</h2><button className="btn sm primary" onClick={() => setModal('log')} disabled={c.doNotContact}>Registrar acción</button></div>
            <ul className="list">
              {data.activities.map((a) => (
                <li key={a.id}>
                  <div className="row between"><span><span className={`badge ${a.type === 'respuesta' ? 'ok' : a.type === 'estado' ? 'info' : a.type === 'sistema' ? '' : 'brand'}`}>{ACTIVITY_TYPES[a.type]}</span> <b className="small">{a.summary}</b></span><span className="muted tiny nowrap">{fmtDate(a.at, true)}{a.userName && ` · ${a.userName}`}</span></div>
                  {a.body && <details className="small"><summary className="muted">Ver detalle</summary><div className="pre" style={{ marginTop: 6 }}>{a.body}</div></details>}
                </li>
              ))}
            </ul>
          </div>
          <div className="stack">
            <div className="card">
              <h2>Seguimiento</h2>
              <dl className="dl" style={{ marginBottom: 12 }}>
                <dt>Último contacto</dt><dd>{c.lastContactAt ? `${fmtDate(c.lastContactAt)} (${relDays(c.lastContactAt)})${c.lastChannel ? ` · ${c.lastChannel}` : ''}` : 'Ninguno'}</dd>
                <dt>Persona de contacto</dt><dd>{c.contactPerson || '—'}</dd>
              </dl>
              <FollowForm c={c} onSave={patch} />
            </div>
            <div className="card">
              <div className="card-head"><h2>Contactos</h2><button className="btn sm" onClick={() => setModal('contact')}>Añadir</button></div>
              {!data.contacts.length ? <p className="muted small">Sin personas de contacto. Añade solo datos publicados o facilitados por la propia persona.</p> : (
                <ul className="list small">{data.contacts.map((p) => <li key={p.id} className="row between"><span><b>{p.name}</b>{p.role && ` · ${p.role}`}<div className="muted">{[p.email, p.phone].filter(Boolean).join(' · ')}{p.linkedin && <> · <a href={p.linkedin} target="_blank" rel="noreferrer noopener">LinkedIn</a></>}</div><div className="tiny muted">Origen: {p.source}</div></span><ActionButton className="btn sm ghost danger" onAct={async () => (await api(`/contacts/${p.id}`, { method: 'DELETE' }), reload())}>Quitar</ActionButton></li>)}</ul>
              )}
            </div>
            <div className="card">
              <h2>Tareas</h2>
              <TaskAdd companyId={id} onDone={reload} />
              <ul className="list small" style={{ marginTop: 10 }}>{data.tasks.map((t) => <li key={t.id}><label className="check"><input type="checkbox" checked={t.done} onChange={async (e) => (await api(`/tasks/${t.id}`, { method: 'PATCH', body: { done: e.target.checked } }), reload(), refreshAll())} /><span style={{ textDecoration: t.done ? 'line-through' : undefined }}>{t.title}{t.dueAt && <span className="muted"> · {relDays(t.dueAt)}</span>}</span></label></li>)}</ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'senales' && (
        <div className="card">
          <div className="card-head"><h2>Señales de oportunidad</h2><ActionButton className="btn sm" disabled={!meta?.ai} title={meta?.ai ? '' : 'Necesita la clave de IA'} onAct={async () => { const x = await api<{ found: number }>(`/companies/${id}/news`, { body: {} }); toast(x.found ? `${x.found} señales nuevas.` : 'No se han encontrado noticias fiables de esta empresa.'); await reload(); }}>Buscar noticias con IA</ActionButton></div>
          {!data.signals.length ? <p className="muted small">Sin señales. Se detectan al revisar la web (ofertas de empleo, cambios de contenido), con las búsquedas periódicas y con la búsqueda de noticias.</p> : (
            <ul className="list">{data.signals.map((s) => <li key={s.id}><div className="row" style={{ gap: 6 }}><span className="badge info">{SIGNAL_TYPES[s.type]}</span><span className={`badge ${s.reliability === 'verificado' ? 'ok' : 'warn'}`}>{s.reliability === 'verificado' ? 'Verificado' : 'A confirmar'}</span><span className="muted tiny">{fmtDate(s.detectedAt)} · {s.source}</span></div><b>{s.title}</b><div className="small muted">{s.detail} {s.url && <a href={s.url} target="_blank" rel="noreferrer noopener">Ver fuente</a>}</div></li>)}</ul>
          )}
        </div>
      )}

      {modal === 'edit' && <EditModal c={c} onClose={() => setModal(null)} onSave={async (b) => (await patch(b), setModal(null))} />}
      {modal === 'log' && <LogModal c={c} onClose={() => setModal(null)} onDone={async () => (setModal(null), await reload(), refreshAll())} />}
      {modal === 'contact' && <ContactModal id={id} onClose={() => setModal(null)} onDone={async () => (setModal(null), await reload())} />}
    </>
  );
}

function FollowForm({ c, onSave }: { c: Company; onSave: (b: Record<string, unknown>) => Promise<void> }) {
  const [date, setDate] = useState(toInputDate(c.nextFollowupAt));
  const [action, setAction] = useState(c.nextAction);
  const [notes, setNotes] = useState(c.notes);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <Field label="Próxima fecha de seguimiento"><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Próxima acción"><input className="input" value={action} onChange={(e) => setAction(e.target.value)} /></Field>
      <Field label="Notas comerciales"><textarea className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div><ActionButton className="btn sm primary" onAct={async () => (await onSave({ nextFollowupAt: date || null, nextAction: action, notes }), toast('Seguimiento guardado.'))}>Guardar seguimiento</ActionButton></div>
    </div>
  );
}

function TaskAdd({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  return (
    <div className="row" style={{ flexWrap: 'nowrap' }}>
      <input className="input" placeholder="Nueva tarea" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Nueva tarea" />
      <input className="input" type="date" style={{ width: 150 }} value={due} onChange={(e) => setDue(e.target.value)} aria-label="Fecha" />
      <ActionButton className="btn sm" disabled={!title.trim()} onAct={async () => (await api('/tasks', { body: { companyId, title, dueAt: due || null } }), setTitle(''), setDue(''), onDone(), refreshAll())}>Añadir</ActionButton>
    </div>
  );
}

function EditModal({ c, onClose, onSave }: { c: Company; onClose: () => void; onSave: (b: Record<string, unknown>) => Promise<void> }) {
  const [f, setF] = useState({ name: c.name, legalName: c.legalName, category: c.category, sector: c.sector, activity: c.activity, description: c.description, address: c.address, city: c.city, province: c.province, website: c.website, email: c.email, phone: c.phone, employees: c.employees ?? '', branches: c.branches, contactPerson: c.contactPerson });
  const inp = (k: keyof typeof f, label: string, type = 'text') => <Field label={label}><input className="input" type={type} value={String(f[k] ?? '')} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>;
  return (
    <Modal title="Editar ficha" onClose={onClose} wide>
      <p className="small muted" style={{ marginBottom: 12 }}>Lo que escribas aquí queda anotado como dato verificado, introducido a mano.</p>
      <div className="form-grid">
        {inp('name', 'Nombre comercial')}{inp('legalName', 'Razón social')}
        <Field label="Tipo"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Company['category'] })}>{Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label="Sector"><select className="input" value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })}><option value="">Sin sector</option>{SECTORS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
        {inp('activity', 'Actividad')}{inp('website', 'Página web')}{inp('email', 'Correo corporativo', 'email')}{inp('phone', 'Teléfono')}{inp('address', 'Dirección')}{inp('city', 'Ciudad')}{inp('province', 'Provincia')}{inp('employees', 'Empleados', 'number')}{inp('branches', 'Sedes', 'number')}{inp('contactPerson', 'Persona de contacto')}
      </div>
      <Field label="Descripción"><textarea className="input" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Cancelar</button><ActionButton className="btn primary" onAct={() => onSave(f)}>Guardar</ActionButton></div>
    </Modal>
  );
}

function LogModal({ c, onClose, onDone }: { c: Company; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ type: 'llamada' as ActivityType, summary: '', body: '', nextFollowupAt: '', status: '', contactPerson: c.contactPerson });
  return (
    <Modal title="Registrar acción comercial" onClose={onClose}>
      <div className="stack">
        <div className="chips">{(['llamada', 'correo', 'linkedin', 'reunion', 'respuesta', 'nota'] as ActivityType[]).map((t) => <button key={t} className={`chip${f.type === t ? ' on' : ''}`} onClick={() => setF({ ...f, type: t })}>{ACTIVITY_TYPES[t]}</button>)}</div>
        <Field label="Resumen"><input className="input" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} placeholder="Ej.: hablé con gerencia, piden propuesta" autoFocus /></Field>
        <Field label="Detalle (opcional)"><textarea className="input" rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
        <div className="form-grid">
          <Field label="Persona con la que se habló"><input className="input" value={f.contactPerson} onChange={(e) => setF({ ...f, contactPerson: e.target.value })} /></Field>
          <Field label="Próximo seguimiento" hint="Vacío: se programa automáticamente."><input className="input" type="date" value={f.nextFollowupAt} onChange={(e) => setF({ ...f, nextFollowupAt: e.target.value })} /></Field>
          <Field label="Cambiar estado a"><select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">No cambiar</option>{(Object.keys(STATUSES) as Status[]).map((s) => <option key={s} value={s}>{STATUSES[s]}</option>)}</select></Field>
        </div>
      </div>
      <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Cancelar</button><ActionButton className="btn primary" disabled={!f.summary.trim()} onAct={async () => (await api(`/companies/${c.id}/activities`, { body: { ...f, nextFollowupAt: f.nextFollowupAt || undefined, status: f.status || undefined } }), onDone())}>Registrar</ActionButton></div>
    </Modal>
  );
}

function ContactModal({ id, onClose, onDone }: { id: string; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: '', role: '', email: '', phone: '', linkedin: '', source: '' });
  const inp = (k: keyof typeof f, label: string, ph = '') => <Field label={label}><input className="input" value={f[k]} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>;
  return (
    <Modal title="Añadir persona de contacto" onClose={onClose}>
      <div className="form-grid">{inp('name', 'Nombre')}{inp('role', 'Cargo')}{inp('email', 'Correo')}{inp('phone', 'Teléfono')}{inp('linkedin', 'Perfil de LinkedIn')}{inp('source', 'De dónde sale el dato', 'Ej.: web de la empresa, tarjeta')}</div>
      <div className="modal-foot"><button className="btn ghost" onClick={onClose}>Cancelar</button><ActionButton className="btn primary" disabled={!f.name.trim()} onAct={async () => (await api(`/companies/${id}/contacts`, { body: f }), onDone())}>Añadir</ActionButton></div>
    </Modal>
  );
}
