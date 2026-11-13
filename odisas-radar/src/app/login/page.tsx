'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import { Field } from '@/components/ui';

export default function LoginPage() {
  const [st, setSt] = useState<{ needsSetup: boolean; setupCode: boolean } | null>(null);
  const [f, setF] = useState({ name: '', email: '', password: '', code: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ needsSetup: boolean; setupCode: boolean; user: unknown }>('/auth/status')
      .then((s) => (s.user ? (window.location.href = '/') : setSt(s)))
      .catch((e) => setError(e.message));
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(st?.needsSetup ? '/auth/setup' : '/auth/login', { body: f });
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      setBusy(false);
    }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="auth">
      <form className="card stack" onSubmit={submit}>
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/simbolo.png" alt="" />
          <div>
            <b>ODISAS</b>
            <span>RADAR</span>
          </div>
        </div>
        {st?.needsSetup ? (
          <>
            <h1>Crear la cuenta de administración</h1>
            <p className="muted small">Es la primera vez que se abre RADAR. Esta cuenta podrá crear las del resto del equipo.</p>
            <Field label="Tu nombre">
              <input className="input" required value={f.name} onChange={set('name')} autoComplete="name" />
            </Field>
          </>
        ) : (
          <h1>Iniciar sesión</h1>
        )}
        <Field label="Correo electrónico">
          <input className="input" type="email" required value={f.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field label="Contraseña" hint={st?.needsSetup ? 'Mínimo 10 caracteres.' : undefined}>
          <input className="input" type="password" required minLength={st?.needsSetup ? 10 : 1} value={f.password} onChange={set('password')} autoComplete={st?.needsSetup ? 'new-password' : 'current-password'} />
        </Field>
        {st?.needsSetup && st.setupCode && (
          <Field label="Código de instalación" hint="Es el valor de la variable SETUP_CODE del servidor.">
            <input className="input" required value={f.code} onChange={set('code')} autoComplete="off" />
          </Field>
        )}
        {error && <div className="notice alert">{error}</div>}
        <button className="btn primary" disabled={busy || !st}>
          {st?.needsSetup ? 'Crear cuenta y entrar' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
