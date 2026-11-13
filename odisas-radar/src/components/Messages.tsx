'use client';
import { useState } from 'react';
import { MESSAGE_KINDS, type Message, type MessageKind } from '@/domain/types';
import { api, fmtDate, refreshAll, toast } from '@/lib/client';
import { useMeta } from './Shell';
import { ActionButton, Field } from './ui';

/** Genera un borrador para una empresa. */
export function Composer({ companyId, onCreated }: { companyId: string; onCreated: () => void }) {
  const [kind, setKind] = useState<MessageKind>('email');
  const [instructions, setInstructions] = useState('');
  const { meta } = useMeta();
  return (
    <div className="stack">
      <div className="chips">
        {(Object.keys(MESSAGE_KINDS) as MessageKind[]).map((k) => <button key={k} className={`chip${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>{MESSAGE_KINDS[k]}</button>)}
      </div>
      <Field label="Indicaciones para este mensaje (opcional)">
        <input className="input" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Ej.: menciona que hablamos en la feria; trátales de usted" />
      </Field>
      {meta && !meta.ai && <p className="tiny muted">Sin clave de IA se genera un borrador con plantilla a partir de los datos comprobados. Con IA el mensaje se redacta a medida.</p>}
      <div>
        <ActionButton className="btn primary" onAct={async () => {
          const r = await api<{ note?: string }>(`/companies/${companyId}/messages`, { body: { kind, instructions } });
          if (r.note) toast(r.note);
          setInstructions('');
          onCreated();
        }}>Preparar {MESSAGE_KINDS[kind].toLowerCase()}</ActionButton>
      </div>
    </div>
  );
}

/** Borrador editable: nada se envía ni se da por enviado sin que alguien lo decida. */
export function MessageCard({ m, canContact, email, onChange }: { m: Message; canContact: boolean; email: string; onChange: () => void }) {
  const [subject, setSubject] = useState(m.subject);
  const [body, setBody] = useState(m.body);
  const { meta } = useMeta();
  const dirty = subject !== m.subject || body !== m.body;
  const save = () => api(`/messages/${m.id}`, { method: 'PATCH', body: { subject, body } });
  const isMail = ['email', 'seguimiento', 'reunion'].includes(m.kind);
  const sent = m.status === 'enviado';
  return (
    <div className="card stack" style={{ gap: 10 }}>
      <div className="row between">
        <div className="row" style={{ gap: 6 }}>
          <b>{MESSAGE_KINDS[m.kind]}</b>
          {m.companyName && <span className="muted small">· {m.companyName}</span>}
          <span className={`badge ${sent ? 'ok' : ''}`}>{sent ? `Enviado ${fmtDate(m.sentAt)}` : 'Borrador'}</span>
          <span className="badge">{m.engine === 'ia' ? 'Redactado con IA' : 'Plantilla'}</span>
        </div>
        <span className="muted tiny">{fmtDate(m.updatedAt, true)}</span>
      </div>
      {m.kind !== 'linkedin' && <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Asunto" placeholder="Asunto" disabled={sent} />}
      <textarea className="input" rows={Math.min(22, Math.max(6, body.split('\n').length + 2))} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Texto del mensaje" disabled={sent} />
      {m.kind === 'linkedin' && <span className="tiny muted">{body.length} caracteres</span>}
      <div className="actions">
        {!sent && <ActionButton className="btn sm" disabled={!dirty} onAct={async () => (await save(), toast('Cambios guardados.'), onChange())}>Guardar cambios</ActionButton>}
        <button className="btn sm" onClick={async () => (await navigator.clipboard.writeText((subject ? subject + '\n\n' : '') + body), toast('Copiado al portapapeles.'))}>Copiar</button>
        {!sent && isMail && email && <a className="btn sm" href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>Abrir en mi correo</a>}
        {!sent && m.kind !== 'resumen' && (
          <ActionButton className="btn sm" disabled={!canContact} title={canContact ? '' : 'Empresa marcada como «no contactar»'} onAct={async () => {
            if (dirty) await save();
            await api(`/messages/${m.id}/sent`, { body: {} });
            toast('Registrado como enviado en el historial.');
            onChange();
            refreshAll();
          }}>Marcar como enviado</ActionButton>
        )}
        {!sent && isMail && meta?.mail && (
          <ActionButton className="btn sm dark" disabled={!canContact || !email} title={!email ? 'La empresa no tiene correo' : ''} onAct={async () => {
            if (!window.confirm(`Se va a enviar este correo a ${email} desde la cuenta de Odisas Lab. ¿Lo envío?`)) return;
            if (dirty) await save();
            await api(`/messages/${m.id}/sent`, { body: { send: true } });
            toast(`Correo enviado a ${email}.`);
            onChange();
            refreshAll();
          }}>Enviar por correo</ActionButton>
        )}
        <ActionButton className="btn sm ghost danger" onAct={async () => { if (window.confirm('¿Eliminar este mensaje?')) (await api(`/messages/${m.id}`, { method: 'DELETE' }), onChange()); }}>Eliminar</ActionButton>
      </div>
    </div>
  );
}
