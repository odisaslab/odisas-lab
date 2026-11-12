import 'server-only';
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import type { Role, SessionUser } from '@/domain/types';
import { logEvent, nowIso, q, q1 } from './db';
import { HttpError } from './http';

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number }) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1 };
export const SESSION_COOKIE = 'radar_session';
const SESSION_DAYS = Number(process.env.SESSION_DAYS ?? 14);
const SECURE = process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('base64')}$${(await scrypt(password, salt, 64, SCRYPT)).toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  return timingSafeEqual(await scrypt(password, Buffer.from(salt, 'base64'), expected.length, SCRYPT), expected);
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  password_hash: string;
  disabled: boolean;
  created_at: string;
}

export async function countUsers(): Promise<number> {
  return (await q1<{ n: number }>('SELECT COUNT(*)::int AS n FROM users'))!.n;
}

export async function createUser(input: { email: string; name: string; role: Role; password: string }): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, 'Email no válido.');
  if (!input.name.trim()) throw new HttpError(400, 'El nombre es obligatorio.');
  if (input.password.length < 10) throw new HttpError(400, 'La contraseña debe tener al menos 10 caracteres.');
  if (await q1('SELECT 1 FROM users WHERE email = $1', [email])) throw new HttpError(409, 'Ya existe un usuario con ese email.');
  const id = nanoid(12);
  await q('INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES ($1,$2,$3,$4,$5,$6)', [id, email, input.name.trim(), input.role, await hashPassword(input.password), nowIso()]);
  return { id, email, name: input.name.trim(), role: input.role };
}

export async function listUsers() {
  return (await q<UserRow>('SELECT id, email, name, role, disabled, created_at FROM users ORDER BY created_at')).map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, disabled: u.disabled, createdAt: u.created_at }));
}

export async function updateUser(id: string, patch: { role?: Role; disabled?: boolean; name?: string; password?: string }) {
  if (patch.role) await q('UPDATE users SET role = $1 WHERE id = $2', [patch.role, id]);
  if (patch.name) await q('UPDATE users SET name = $1 WHERE id = $2', [patch.name.trim(), id]);
  if (patch.password) {
    if (patch.password.length < 10) throw new HttpError(400, 'La contraseña debe tener al menos 10 caracteres.');
    await q('UPDATE users SET password_hash = $1 WHERE id = $2', [await hashPassword(patch.password), id]);
  }
  if (patch.disabled !== undefined) await q('UPDATE users SET disabled = $1 WHERE id = $2', [patch.disabled, id]);
  if (patch.disabled || patch.password) await q('DELETE FROM sessions WHERE user_id = $1', [id]);
  const admins = (await q1<{ n: number }>("SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin' AND NOT disabled"))!.n;
  if (!admins) throw new HttpError(400, 'Tiene que quedar al menos una cuenta de administración activa.');
}

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

export async function startSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await q('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES ($1,$2,$3,$4)', [tokenHash(token), userId, nowIso(), expires.toISOString()]);
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: SECURE, path: '/', expires });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await q('DELETE FROM sessions WHERE id = $1', [tokenHash(token)]);
  jar.delete(SESSION_COOKIE);
}

export async function login(email: string, password: string): Promise<SessionUser> {
  const row = await q1<UserRow>('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  // Se verifica igualmente para no revelar por el tiempo de respuesta qué correos existen.
  const ok = await verifyPassword(password, row?.password_hash ?? 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$' + 'A'.repeat(86) + '==');
  if (!row || !ok || row.disabled) {
    await logEvent('auth.login_failed', row?.id ?? null);
    throw new HttpError(401, 'Email o contraseña incorrectos.');
  }
  await startSession(row.id);
  await q('DELETE FROM sessions WHERE expires_at < $1', [nowIso()]);
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await q1<UserRow & { expires_at: string }>('SELECT u.id, u.email, u.name, u.role, u.disabled, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = $1', [tokenHash(token)]);
  if (!row || row.disabled || row.expires_at < nowIso()) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

/** En producción, crear la primera cuenta exige el código de instalación (SETUP_CODE). */
export function setupCodeRequired(): boolean {
  return !!process.env.SETUP_CODE || process.env.NODE_ENV === 'production';
}

export function checkSetupCode(code: string) {
  const expected = process.env.SETUP_CODE ?? '';
  if (!setupCodeRequired()) return;
  if (!expected) throw new HttpError(403, 'Falta la variable SETUP_CODE en el servidor: sin ella no se puede crear la primera cuenta.');
  const a = Buffer.from(code.trim());
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(403, 'Código de instalación incorrecto.');
}
