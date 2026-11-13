'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch('/api' + path, {
    method: opts.method ?? (opts.body === undefined ? 'GET' : 'POST'),
    headers: opts.body === undefined ? undefined : { 'content-type': 'application/json' },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  if (res.status === 401 && !path.startsWith('/auth')) {
    window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
    throw new ApiError(401, 'Sesión caducada.');
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ApiError(res.status, String(data.error ?? 'No se ha podido completar la operación.'), data);
  return data as T;
}

/** Carga datos de la API y los recarga cuando termina una tanda de análisis en segundo plano. */
export function useData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!path);
  const current = useRef(path);
  current.current = path;
  const reload = useCallback(async () => {
    if (!path) return;
    try {
      const d = await api<T>(path);
      if (current.current === path) (setData(d), setError(''));
    } catch (e) {
      if (current.current === path) setError(e instanceof Error ? e.message : 'Error');
    } finally {
      if (current.current === path) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    setLoading(!!path);
    void reload();
    const h = () => void reload();
    window.addEventListener('radar:refresh', h);
    return () => window.removeEventListener('radar:refresh', h);
  }, [reload, path]);
  return { data, error, loading, reload, setData };
}

export const refreshAll = () => window.dispatchEvent(new Event('radar:refresh'));
export const toast = (message: string, error = false) => window.dispatchEvent(new CustomEvent('radar:toast', { detail: { message, error } }));
export const fail = (e: unknown) => toast(e instanceof Error ? e.message : 'Ha ocurrido un error.', true);

export function fmtDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }) + (withTime ? ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '');
}

export function relDays(iso: string | null | undefined): string {
  if (!iso) return '—';
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400_000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'mañana';
  if (days === -1) return 'ayer';
  return days > 0 ? `en ${days} días` : `hace ${-days} días`;
}

export const toInputDate = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '');
