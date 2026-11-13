'use client';
import { useEffect, useState } from 'react';
import { PageHead } from '@/components/CompanyList';
import { useMeta } from '@/components/Shell';
import { ActionButton, Field, Loading } from '@/components/ui';
import { api, fmtDate, toast, useData } from '@/lib/client';
import type { AppSettings } from '@/server/settings';

interface Cfg {
  settings: AppSettings;
  anthropicKey: string | null;
  anthropicFromEnv: boolean;
  modelFromEnv: boolean;
  crmToken: string | null;
  mail: boolean;
  db: string;
  cron: boolean;
  authSecretFromEnv: boolean;
  exclusions: { id: string; type: string; value: string; reason: string; created_at: string }[];
  users: { id: string; email: string; name: string; role: string; disabled: boolean }[];
}
const State = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => <span className={`badge ${ok ? 'ok' : 'warn'}`}>{ok ? '✓' : '!'} {children}</span>;

export default function SettingsPage() {
  const { data, reload } = useData<Cfg>('/settings');
  const { meta, reload: reloadMeta } = useMeta();
  const [s, setS] = useState<AppSettings | null>(null);
  const [key, setKey] = useState('');
  const [crmToken, setCrmToken] = useState('');
  const [ex, setEx] = useState({ type: 'dominio', value: '', reason: '' });
  const [u, setU] = useState({ name: '', email: '', password: '', role: 'comercial' });
  useEffect(() => { if (data && !s) setS(data.settings); }, [data, s]);
  if (!data || !s) return <Loading />;
  const admin = meta?.user.role === 'admin';
  const save = async (body: Record<string, unknown>, msg = 'Configuración guardada.') => (await api('/settings', { method: 'PUT', body }), toast(msg), await reload(), reloadMeta());
  const snd = (k: keyof AppSettings['sender'], label: string, ph = '') => <Field label={label}><input className="input" value={s.sender[k]} placeholder={ph} onChange={(e) => setS({ ...s, sender: { ...s.sender, [k]: e.target.value } })} /></Field>;

  return (
    <>
      <PageHead title="Configuración" text="Credenciales, fuentes de datos, remitente de los mensajes y cumplimiento." />
      {!admin && <div className="notice info" style={{ marginBottom: 14 }}>Solo una cuenta de administración puede cambiar estos ajustes.</div>}
      <div className="grid g2">
        <div className="card stack">
          <h2>Estado del sistema</h2>
          <div className="chips">
            <State ok={data.db === 'postgres'}>{data.db === 'postgres' ? 'Base de datos PostgreSQL conectada' : data.db === 'memoria' ? 'Base de datos temporal (falta DATABASE_URL)' : 'Base de datos local en ./data'}</State>
            <State ok={!!data.anthropicKey}>{data.anthropicKey ? 'IA activa' : 'IA sin configurar'}</State>
            <State ok={data.cron}>{data.cron ? 'Ejecución periódica activa' : 'Sin ejecución periódica (falta CRON_SECRET)'}</State>
            <State ok={data.mail}>{data.mail ? 'Envío de correo activo' : 'Envío de correo sin configurar (SMTP_*)'}</State>
            <State ok={!!s.crmWebhookUrl}>{s.crmWebhookUrl ? 'CRM conectado' : 'CRM externo sin conectar'}</State>
            <State ok={data.authSecretFromEnv}>{data.authSecretFromEnv ? 'AUTH_SECRET definido' : 'AUTH_SECRET sin definir'}</State>
          </div>
          <p className="small muted">Las variables de entorno se definen en el servidor (en Vercel: Project → Settings → Environment Variables). El archivo <code>.env.example</code> del proyecto las documenta todas.</p>
        </div>

        <div className="card stack">
          <h2>Inteligencia artificial</h2>
          <p className="small muted">Con una clave de la API de Anthropic, Claude analiza cada empresa, redacta los mensajes y puede buscar empresas y noticias en internet. Sin clave, RADAR funciona con análisis por reglas y plantillas.</p>
          <Field label="Clave de la API de Anthropic" hint={data.anthropicFromEnv ? 'Definida como variable de entorno ANTHROPIC_API_KEY.' : data.anthropicKey ? `Guardada cifrada: ${data.anthropicKey}` : 'Se guarda cifrada en el servidor y nunca se muestra completa.'}>
            <input className="input" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-…" disabled={data.anthropicFromEnv || !admin} autoComplete="off" />
          </Field>
          <Field label="Modelo" hint={data.modelFromEnv ? 'Fijado por la variable RADAR_AI_MODEL.' : 'Por defecto claude-opus-5-5. Uno más económico reduce el coste por análisis.'}>
            <select className="input" value={s.aiModel} onChange={(e) => setS({ ...s, aiModel: e.target.value })} disabled={data.modelFromEnv || !admin}>
              {['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-fable-5-2'].concat(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-fable-5-2'].includes(s.aiModel) ? [] : [s.aiModel]).map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <div className="actions">
            <ActionButton className="btn primary" disabled={!admin} onAct={async () => (await save({ settings: { aiModel: s.aiModel }, ...(key ? { anthropicKey: key } : {}) }), setKey(''))}>Guardar</ActionButton>
            {data.anthropicKey && !data.anthropicFromEnv && <ActionButton className="btn ghost danger" disabled={!admin} onAct={() => save({ anthropicKey: '' }, 'Clave eliminada.')}>Quitar la clave</ActionButton>}
          </div>
        </div>

        <div className="card stack">
          <h2>Remitente de los mensajes</h2>
          <p className="small muted">Con estos datos se firman los correos, guiones y propuestas.</p>
          <div className="form-grid">{snd('name', 'Nombre')}{snd('role', 'Cargo')}{snd('company', 'Empresa')}{snd('email', 'Correo de respuesta')}{snd('phone', 'Teléfono')}{snd('meetingUrl', 'Enlace para agendar', 'https://calendly.com/…')}</div>
          <label className="check"><input type="checkbox" checked={s.optOutFooter} onChange={(e) => setS({ ...s, optOutFooter: e.target.checked })} /> <span>Añadir a los correos la línea para darse de baja (obligatoria en comunicaciones comerciales, art. 21 LSSI).</span></label>
          <Field label="Días sin actividad para avisar de falta de seguimiento"><input className="input" type="number" min={1} max={90} style={{ maxWidth: 120 }} value={s.followupDays} onChange={(e) => setS({ ...s, followupDays: Number(e.target.value) })} /></Field>
          <div><ActionButton className="btn primary" disabled={!admin} onAct={() => save({ settings: { sender: s.sender, optOutFooter: s.optOutFooter, followupDays: s.followupDays } })}>Guardar</ActionButton></div>
        </div>

        <div className="card stack">
          <h2>Fuentes de datos</h2>
          <ul className="list small">
            {meta?.providers.map((p) => <li key={p.id}><div className="row" style={{ gap: 6 }}><b>{p.label}</b><span className={`badge ${p.available ? 'ok' : 'warn'}`}>{p.available ? 'Activa' : `Necesita: ${p.requires}`}</span></div><div className="muted">{p.description}</div><div className="tiny muted">{p.license}</div></li>)}
            <li><b>Web pública de cada empresa</b> <span className="badge ok">Activa</span><div className="muted">Portada, contacto, aviso legal y «quiénes somos». Se respeta robots.txt y no se accede a zonas privadas.</div></li>
            <li><b>Listados propios (CSV)</b> <span className="badge ok">Activa</span><div className="muted">Desde «Buscar empresas → Importar listado».</div></li>
          </ul>
          <Field label="Correo de contacto para OpenStreetMap" hint="Su política de uso pide identificar a quien hace las consultas."><input className="input" value={s.osmContact} onChange={(e) => setS({ ...s, osmContact: e.target.value })} placeholder="tucorreo@odisaslab.com" /></Field>
          <div><ActionButton className="btn primary" disabled={!admin} onAct={() => save({ settings: { osmContact: s.osmContact } })}>Guardar</ActionButton></div>
        </div>

        <div className="card stack">
          <h2>Conexión con el CRM</h2>
          <p className="small muted">RADAR lleva su propio pipeline. Si indicas la dirección de un webhook de tu CRM (o de Zapier, Make o n8n), cada empresa guardada en el pipeline y cada cambio de estado, contacto o actividad se envía allí en JSON. Si el CRM responde con un <code>id</code>, queda enlazado en la ficha.</p>
          <Field label="URL del webhook del CRM"><input className="input" value={s.crmWebhookUrl} onChange={(e) => setS({ ...s, crmWebhookUrl: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Token de acceso (opcional)" hint={data.crmToken ? `Guardado cifrado: ${data.crmToken}` : 'Se envía como «Authorization: Bearer …».'}><input className="input" type="password" value={crmToken} onChange={(e) => setCrmToken(e.target.value)} autoComplete="off" /></Field>
          <div><ActionButton className="btn primary" disabled={!admin} onAct={async () => (await save({ settings: { crmWebhookUrl: s.crmWebhookUrl }, ...(crmToken ? { crmToken } : {}) }), setCrmToken(''))}>Guardar</ActionButton></div>
        </div>

        <div className="card stack">
          <h2>Protección de datos y exclusiones</h2>
          <ul className="bul small muted">
            <li>Solo se recogen datos publicados por la propia empresa o por fuentes abiertas, y cada dato guarda su procedencia y su fecha.</li>
            <li>Se priorizan buzones corporativos genéricos (info@, comercial@). Los buzones nominales son datos personales: se marcan como tales.</li>
            <li>Ningún mensaje se envía de forma automática. Los correos comerciales llevan la opción de baja.</li>
            <li>Quien pida no ser contactado va a esta lista: no se vuelve a importar ni a contactar. «Borrar y excluir», en cada ficha, elimina además todos sus datos.</li>
          </ul>
          <p className="tiny muted">Esto facilita cumplir el RGPD y la LSSI, pero no sustituye al registro de actividades de tratamiento ni al asesoramiento jurídico de Odisas Lab.</p>
          <div className="form-grid">
            <select className="input" value={ex.type} onChange={(e) => setEx({ ...ex, type: e.target.value })} aria-label="Tipo de exclusión"><option value="dominio">Dominio</option><option value="email">Correo</option><option value="empresa">Nombre de empresa</option><option value="telefono">Teléfono</option></select>
            <input className="input" placeholder="Valor" value={ex.value} onChange={(e) => setEx({ ...ex, value: e.target.value })} aria-label="Valor" />
            <input className="input" placeholder="Motivo" value={ex.reason} onChange={(e) => setEx({ ...ex, reason: e.target.value })} aria-label="Motivo" />
            <ActionButton className="btn" disabled={!ex.value.trim()} onAct={async () => (await api('/exclusions', { body: ex }), setEx({ ...ex, value: '', reason: '' }), toast('Añadido a la lista de exclusión.'), reload())}>Excluir</ActionButton>
          </div>
          {!!data.exclusions.length && <ul className="list small">{data.exclusions.map((x) => <li key={x.id} className="row between"><span><span className="badge">{x.type}</span> {x.value}<span className="muted"> · {x.reason || 'sin motivo'} · {fmtDate(x.created_at)}</span></span>{admin && <ActionButton className="btn sm ghost danger" onAct={async () => (await api(`/exclusions/${x.id}`, { method: 'DELETE' }), reload())}>Quitar</ActionButton>}</li>)}</ul>}
        </div>

        {admin && (
          <div className="card stack">
            <h2>Usuarios</h2>
            <ul className="list small">{data.users.map((x) => <li key={x.id} className="row between"><span><b>{x.name}</b> · {x.email} <span className="badge">{x.role === 'admin' ? 'Administración' : 'Comercial'}</span>{x.disabled && <span className="badge alert">Desactivada</span>}</span>{x.id !== meta?.user.id && <ActionButton className="btn sm" onAct={async () => (await api(`/users/${x.id}`, { method: 'PATCH', body: { disabled: !x.disabled } }), reload())}>{x.disabled ? 'Reactivar' : 'Desactivar'}</ActionButton>}</li>)}</ul>
            <div className="form-grid">
              <input className="input" placeholder="Nombre" value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} aria-label="Nombre" />
              <input className="input" placeholder="Correo" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} aria-label="Correo" />
              <input className="input" type="password" placeholder="Contraseña (mín. 10)" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} aria-label="Contraseña" autoComplete="new-password" />
              <select className="input" value={u.role} onChange={(e) => setU({ ...u, role: e.target.value })} aria-label="Rol"><option value="comercial">Comercial</option><option value="admin">Administración</option></select>
              <ActionButton className="btn" onAct={async () => (await api('/users', { body: u }), setU({ name: '', email: '', password: '', role: 'comercial' }), toast('Usuario creado.'), reload())}>Crear usuario</ActionButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
