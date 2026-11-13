'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { PRIORITIES, STATUSES, WEB_STATUSES, type Priority, type Status, type WebStatus } from '@/domain/types';

const PATHS: Record<string, string> = {
  dashboard: 'M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z',
  search: 'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9',
  building: 'M4 21V3h10v6h6v12h-6v-4h-4v4zm3-13h2V6H7zm0 4h2v-2H7zm0 4h2v-2H7zm4-8h2V6h-2zm0 4h2v-2h-2zm5 4h2v-2h-2zm0-4h2v-2h-2z',
  insight: 'M9 21h6v-1H9zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2m1 9.4V14h-2v-2.6L8.9 9.3l1.4-1.4L12 9.6l1.7-1.7 1.4 1.4z',
  star: 'm12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z',
  mail: 'M3 5h18v14H3zm9 8 7-5V7l-7 5-7-5v1z',
  pipeline: 'M3 5h5v14H3zm6.5 0h5v9h-5zM16 5h5v12h-5z',
  auto: 'M13 2 4 14h6l-1 8 9-12h-6z',
  report: 'M6 2h9l5 5v15H6zm8 1.5V8h4.5zM9 13h8v-1.5H9zm0 3h8v-1.5H9zm0 3h5v-1.5H9z',
  settings: 'M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4L10.7 6a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7',
  menu: 'M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
  ext: 'M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14zM5 5h6v2H7v10h10v-4h2v6H5z',
  check: 'm9 16.2-4.2-4.2L3.4 13.4 9 19 21 7l-1.4-1.4z',
  warn: 'M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z',
};
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}

const PRIO_CLASS: Record<Priority, string> = { muy_alta: 'dark', alta: 'brand', media: 'info', baja: '' };
export const PriorityBadge = ({ p }: { p: Priority | null }) => (p ? <span className={`badge ${PRIO_CLASS[p]}`}>{PRIORITIES[p]}</span> : <span className="badge">Sin analizar</span>);

const STATUS_CLASS: Partial<Record<Status, string>> = { cliente: 'ok', perdida: 'alert', descartada: '', reunion_concertada: 'ok', reunion_propuesta: 'info', presupuesto_enviado: 'info', negociacion: 'brand', pendiente_contactar: 'brand', primer_contacto: 'info', pendiente_respuesta: 'warn' };
export const StatusBadge = ({ s }: { s: Status }) => <span className={`badge ${STATUS_CLASS[s] ?? ''}`}>{STATUSES[s]}</span>;

const WEB_CLASS: Record<WebStatus, string> = { sin_web: 'alert', caida: 'alert', desactualizada: 'warn', mejorable: 'info', correcta: 'ok', desconocido: '' };
export const WebBadge = ({ s }: { s: WebStatus }) => <span className={`badge ${WEB_CLASS[s]}`}>{WEB_STATUSES[s]}</span>;

/** Anillo con la puntuación. El número va siempre en tinta: el color solo acompaña. */
export function ScoreRing({ value, size = 44 }: { value: number | null; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const v = value ?? 0;
  const color = v >= 80 ? '#0a0a0b' : v >= 65 ? 'var(--series-1)' : v >= 45 ? 'var(--series-2)' : '#b9b5aa';
  return (
    <span className="score" style={{ width: size, height: size }} title={value == null ? 'Sin analizar' : `RADAR SCORE ${value} de 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--cream)" strokeWidth="4" />
        {value != null && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />}
      </svg>
      <b style={{ fontSize: size * 0.32 }}>{value ?? '–'}</b>
    </span>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small className="muted tiny">{hint}</small>}
    </label>
  );
}

export const Empty = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="empty">
    <b>{title}</b>
    {children}
  </div>
);

export const Loading = () => (
  <div className="empty">
    <span className="spin dark" style={{ display: 'inline-block' }} />
  </div>
);

export function Toaster() {
  const [t, setT] = useState<{ message: string; error: boolean } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const h = (e: Event) => {
      setT((e as CustomEvent).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 5000);
    };
    window.addEventListener('radar:toast', h);
    return () => (window.removeEventListener('radar:toast', h), clearTimeout(timer));
  }, []);
  return t ? (
    <div className={`toast${t.error ? ' err' : ''}`} role="status">
      {t.message}
    </div>
  ) : null;
}

/** Botón que muestra espera mientras dura la acción y enseña el error si falla. */
export function ActionButton({ onAct, children, className = 'btn', disabled, title }: { onAct: () => Promise<unknown>; children: ReactNode; className?: string; disabled?: boolean; title?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy || disabled}
      title={title}
      onClick={async () => {
        setBusy(true);
        try {
          await onAct();
        } catch (e) {
          window.dispatchEvent(new CustomEvent('radar:toast', { detail: { message: e instanceof Error ? e.message : 'Error', error: true } }));
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy && <span className={`spin${className.includes('primary') || className.includes('dark') ? '' : ' dark'}`} />}
      {children}
    </button>
  );
}
