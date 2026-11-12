import 'server-only';
import { q } from './db';

const snake = (k: string) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function camelize<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[camel(k)] = v;
  return out as T;
}

function bind(obj: Record<string, unknown>) {
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined);
  const params = keys.map((k) => (obj[k] !== null && typeof obj[k] === 'object' ? JSON.stringify(obj[k]) : obj[k]));
  const marks = keys.map((k, i) => (obj[k] !== null && typeof obj[k] === 'object' ? `$${i + 1}::jsonb` : `$${i + 1}`));
  return { cols: keys.map(snake), params, marks };
}

export async function insert(table: string, obj: Record<string, unknown>) {
  const { cols, params, marks } = bind(obj);
  await q(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${marks.join(', ')})`, params);
}

export async function update(table: string, id: string, obj: Record<string, unknown>) {
  const { cols, params, marks } = bind(obj);
  if (!cols.length) return;
  await q(`UPDATE ${table} SET ${cols.map((c, i) => `${c} = ${marks[i]}`).join(', ')} WHERE id = $${cols.length + 1}`, [...params, id]);
}
