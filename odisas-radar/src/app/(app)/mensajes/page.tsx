'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PageHead } from '@/components/CompanyList';
import { Composer, MessageCard } from '@/components/Messages';
import { Empty, Field, Loading } from '@/components/ui';
import type { Message } from '@/domain/types';
import { useData } from '@/lib/client';
import type { CompanySummary } from '@/server/companies';

export default function MessagesPage() {
  const companies = useData<{ items: CompanySummary[] }>('/companies?analyzed=1&limit=300&sort=score');
  const msgs = useData<{ messages: Message[] }>('/messages');
  const [id, setId] = useState('');
  const [filter, setFilter] = useState<'borrador' | 'enviado' | ''>('borrador');
  const byId = new Map((companies.data?.items ?? []).map((c) => [c.id, c]));
  const list = (msgs.data?.messages ?? []).filter((m) => !filter || m.status === filter);
  return (
    <>
      <PageHead title="Generador de mensajes" text="Correos, seguimientos, guiones de llamada y mensajes de LinkedIn escritos a partir de lo investigado de cada empresa. Siempre son borradores: se revisan y se envían a mano." />
      <div className="grid split">
        <div className="stack">
          <div className="chips">
            {([['borrador', 'Borradores'], ['enviado', 'Enviados'], ['', 'Todos']] as const).map(([k, l]) => <button key={k} className={`chip${filter === k ? ' on' : ''}`} onClick={() => setFilter(k)}>{l}</button>)}
          </div>
          {!msgs.data ? <Loading /> : !list.length ? <div className="card"><Empty title="No hay mensajes aquí">Elige una empresa analizada y prepara el primero.</Empty></div> : list.map((m) => <MessageCard key={m.id + m.updatedAt} m={m} email={byId.get(m.companyId)?.email ?? ''} canContact={!byId.get(m.companyId)?.doNotContact} onChange={msgs.reload} />)}
        </div>
        <div className="card stack">
          <h2>Preparar un mensaje</h2>
          <Field label="Empresa" hint="Solo aparecen las ya analizadas.">
            <select className="input" value={id} onChange={(e) => setId(e.target.value)}>
              <option value="">Elige una empresa…</option>
              {(companies.data?.items ?? []).map((c) => <option key={c.id} value={c.id}>{c.score ?? '–'} · {c.name}{c.city ? ` (${c.city})` : ''}</option>)}
            </select>
          </Field>
          {id ? (
            <>
              <p className="small muted">{byId.get(id)?.why}</p>
              <Composer companyId={id} onCreated={() => (setFilter('borrador'), void msgs.reload())} />
              <Link className="small" href={`/empresas/${id}`}>Ver la ficha y el informe</Link>
            </>
          ) : !companies.data?.items.length && <p className="small muted">Todavía no hay empresas analizadas. <Link href="/buscar">Buscar empresas</Link></p>}
        </div>
      </div>
    </>
  );
}
