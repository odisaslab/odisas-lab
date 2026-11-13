'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SessionUser } from '@/domain/types';
import { api, refreshAll, useData } from '@/lib/client';
import { Icon, Toaster } from './ui';

export interface Meta {
  user: SessionUser;
  ai: boolean;
  mail: boolean;
  crm: boolean;
  db: 'postgres' | 'archivo' | 'memoria';
  cron: boolean;
  jobs: { pending: number; done: number; failed: number };
  providers: { id: string; label: string; description: string; requires: string; license: string; available: boolean }[];
  followupDays: number;
}
const MetaCtx = createContext<{ meta: Meta | null; reload: () => void; kick: () => void }>({ meta: null, reload: () => {}, kick: () => {} });
export const useMeta = () => useContext(MetaCtx);

const NAV = [
  ['/', 'dashboard', 'Dashboard'],
  ['/buscar', 'search', 'Buscar empresas'],
  ['/empresas', 'building', 'Empresas encontradas'],
  ['/analisis', 'insight', 'Análisis de oportunidades'],
  ['/prioritarias', 'star', 'Empresas prioritarias'],
  ['/mensajes', 'mail', 'Generador de mensajes'],
  ['/seguimiento', 'pipeline', 'Seguimiento comercial'],
  ['/automatizaciones', 'auto', 'Automatizaciones'],
  ['/informes', 'report', 'Informes'],
  ['/configuracion', 'settings', 'Configuración'],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { data: meta, reload } = useData<Meta>('/meta');
  const [pending, setPending] = useState(0);
  const working = useRef(false);

  // Mientras haya empresas en cola, la propia app va procesándolas por tandas.
  const kick = async () => {
    if (working.current) return;
    working.current = true;
    try {
      for (let i = 0; i < 200; i++) {
        const r = await api<{ processed: number; pending: number }>('/jobs/work', { method: 'POST', body: {} });
        setPending(r.pending);
        if (r.processed) refreshAll();
        if (!r.pending) break;
      }
    } catch {
      /* se reintenta al volver a cargar */
    } finally {
      working.current = false;
      setPending(0);
    }
  };
  useEffect(() => {
    if (meta?.jobs.pending) (setPending(meta.jobs.pending), void kick());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta?.jobs.pending]);
  useEffect(() => setOpen(false), [path]);

  return (
    <MetaCtx.Provider value={{ meta, reload, kick: () => (setPending((p) => p || 1), void kick()) }}>
      <div className="shell">
        <div className="topbar">
          <button onClick={() => setOpen(true)} aria-label="Abrir menú">
            <Icon name="menu" size={22} />
          </button>
          <b>ODISAS RADAR</b>
        </div>
        <aside className={`side${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/simbolo-blanco.png" alt="" />
            <div>
              <b>ODISAS</b>
              <span>RADAR</span>
            </div>
          </div>
          <div className="nav-title">Odisas Radar</div>
          <nav className="nav">
            {NAV.map(([href, icon, label]) => (
              <Link key={href} href={href} className={(href === '/' ? path === '/' : path.startsWith(href)) ? 'on' : ''} onClick={() => setOpen(false)}>
                <Icon name={icon} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="side-foot">
            {meta && (
              <>
                <div style={{ color: '#fff' }}>{meta.user.name}</div>
                <div className="tiny" style={{ marginBottom: 6 }}>
                  IA {meta.ai ? 'activa' : 'sin configurar'} · {meta.db === 'postgres' ? 'Base de datos conectada' : meta.db === 'memoria' ? 'Datos temporales' : 'Datos en local'}
                </div>
              </>
            )}
            <button onClick={async () => (await api('/auth/logout', { method: 'POST', body: {} }), (window.location.href = '/login'))}>Cerrar sesión</button>
          </div>
        </aside>
        <main className="main">
          {meta?.db === 'memoria' && (
            <div className="notice alert" style={{ marginBottom: 16 }}>
              <Icon name="warn" />
              <span>
                <b>Base de datos temporal.</b> Falta la variable <code>DATABASE_URL</code>: lo que guardes se perderá cuando el servidor se reinicie. Conecta una base de datos PostgreSQL para trabajar de verdad (ver Configuración).
              </span>
            </div>
          )}
          {children}
        </main>
      </div>
      {pending > 0 && (
        <div className="jobpill" role="status">
          <span className="spin" /> Investigando y analizando · {pending} en cola
        </div>
      )}
      <Toaster />
    </MetaCtx.Provider>
  );
}
