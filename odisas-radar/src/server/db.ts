import 'server-only';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Base de datos PostgreSQL.
 *  - Producción (Vercel): DATABASE_URL apunta a un Postgres alojado (Neon, Supabase…).
 *  - Sin DATABASE_URL: PostgreSQL embebido (PGlite). En local guarda en ./data; en un
 *    hosting sin disco persistente (Vercel) vive en memoria y se pierde al reiniciar,
 *    por lo que la app lo avisa en pantalla.
 * El SQL es el mismo en ambos casos.
 */
export type DbMode = 'postgres' | 'archivo' | 'memoria';
type Row = Record<string, unknown>;
interface Driver {
  query(sql: string, params?: unknown[]): Promise<{ rows: Row[] }>;
  exec(sql: string): Promise<unknown>;
  close(): Promise<void>;
}

const MIGRATIONS: string[] = [
  `CREATE TABLE users (
     id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL,
     password_hash TEXT NOT NULL, disabled BOOLEAN NOT NULL DEFAULT FALSE, created_at TEXT NOT NULL);
   CREATE TABLE sessions (
     id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at TEXT NOT NULL, expires_at TEXT NOT NULL);
   CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
   CREATE TABLE companies (
     id TEXT PRIMARY KEY, name TEXT NOT NULL, norm_name TEXT NOT NULL, legal_name TEXT NOT NULL DEFAULT '', tax_id TEXT NOT NULL DEFAULT '',
     category TEXT NOT NULL DEFAULT 'otro', sector TEXT NOT NULL DEFAULT '', activity TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
     address TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', province TEXT NOT NULL DEFAULT '', postal_code TEXT NOT NULL DEFAULT '', country TEXT NOT NULL DEFAULT 'España',
     lat DOUBLE PRECISION, lon DOUBLE PRECISION,
     website TEXT NOT NULL DEFAULT '', domain TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', phone_norm TEXT NOT NULL DEFAULT '',
     contact_form_url TEXT NOT NULL DEFAULT '', socials JSONB NOT NULL DEFAULT '{}',
     employees INTEGER, size_band TEXT, branches INTEGER NOT NULL DEFAULT 1,
     status TEXT NOT NULL DEFAULT 'nueva', score INTEGER, priority TEXT, web_status TEXT NOT NULL DEFAULT 'desconocido',
     opp_automation BOOLEAN NOT NULL DEFAULT FALSE, opp_ai BOOLEAN NOT NULL DEFAULT FALSE,
     source TEXT NOT NULL DEFAULT '', source_ref TEXT NOT NULL DEFAULT '',
     do_not_contact BOOLEAN NOT NULL DEFAULT FALSE, archived BOOLEAN NOT NULL DEFAULT FALSE, archive_reason TEXT NOT NULL DEFAULT '',
     in_crm BOOLEAN NOT NULL DEFAULT FALSE, crm_id TEXT NOT NULL DEFAULT '', crm_synced_at TEXT,
     contact_person TEXT NOT NULL DEFAULT '', last_channel TEXT NOT NULL DEFAULT '', last_contact_at TEXT, next_followup_at TEXT,
     next_action TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
     facts JSONB NOT NULL DEFAULT '{}', audit JSONB, report JSONB, score_data JSONB,
     created_at TEXT NOT NULL, updated_at TEXT NOT NULL, researched_at TEXT, analyzed_at TEXT);
   CREATE INDEX companies_domain ON companies(domain);
   CREATE INDEX companies_norm ON companies(norm_name);
   CREATE INDEX companies_phone ON companies(phone_norm);
   CREATE INDEX companies_ref ON companies(source_ref);
   CREATE INDEX companies_status ON companies(status);
   CREATE TABLE contacts (
     id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
     name TEXT NOT NULL, role TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', linkedin TEXT NOT NULL DEFAULT '',
     source TEXT NOT NULL DEFAULT '', source_url TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
   CREATE INDEX contacts_company ON contacts(company_id);
   CREATE TABLE activities (
     id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
     type TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', data JSONB, at TEXT NOT NULL, user_id TEXT);
   CREATE INDEX activities_company ON activities(company_id, at);
   CREATE INDEX activities_at ON activities(at);
   CREATE TABLE tasks (
     id TEXT PRIMARY KEY, company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
     title TEXT NOT NULL, due_at TEXT, done BOOLEAN NOT NULL DEFAULT FALSE, origin TEXT NOT NULL DEFAULT 'manual',
     created_by TEXT, created_at TEXT NOT NULL, done_at TEXT);
   CREATE INDEX tasks_company ON tasks(company_id);
   CREATE TABLE messages (
     id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
     kind TEXT NOT NULL, subject TEXT NOT NULL DEFAULT '', body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'borrador', engine TEXT NOT NULL,
     created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, sent_at TEXT);
   CREATE INDEX messages_company ON messages(company_id);
   CREATE TABLE searches (
     id TEXT PRIMARY KEY, query JSONB NOT NULL, provider TEXT NOT NULL, found INTEGER NOT NULL, added INTEGER NOT NULL, duplicates INTEGER NOT NULL,
     user_id TEXT, created_at TEXT NOT NULL);
   CREATE TABLE automations (
     id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, frequency TEXT NOT NULL, enabled BOOLEAN NOT NULL DEFAULT TRUE,
     config JSONB NOT NULL DEFAULT '{}', last_run_at TEXT, next_run_at TEXT, last_result TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
   CREATE TABLE runs (
     id TEXT PRIMARY KEY, automation_id TEXT REFERENCES automations(id) ON DELETE CASCADE,
     started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '');
   CREATE TABLE signals (
     id TEXT PRIMARY KEY, company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
     type TEXT NOT NULL, title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '',
     reliability TEXT NOT NULL DEFAULT 'estimado', detected_at TEXT NOT NULL, dismissed BOOLEAN NOT NULL DEFAULT FALSE);
   CREATE INDEX signals_company ON signals(company_id);
   CREATE TABLE exclusions (
     id TEXT PRIMARY KEY, type TEXT NOT NULL, value TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL,
     UNIQUE (type, value));
   CREATE TABLE reports (
     id TEXT PRIMARY KEY, kind TEXT NOT NULL, period_from TEXT NOT NULL, period_to TEXT NOT NULL, data JSONB NOT NULL, created_at TEXT NOT NULL);
   CREATE TABLE jobs (
     id TEXT PRIMARY KEY, type TEXT NOT NULL, company_id TEXT REFERENCES companies(id) ON DELETE CASCADE, payload JSONB NOT NULL DEFAULT '{}',
     status TEXT NOT NULL DEFAULT 'pendiente', error TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, started_at TEXT, finished_at TEXT);
   CREATE INDEX jobs_status ON jobs(status, created_at);
   CREATE TABLE events (id TEXT PRIMARY KEY, at TEXT NOT NULL, user_id TEXT, type TEXT NOT NULL, data JSONB);`,
];

const holder = globalThis as unknown as { __radarDb?: Promise<{ driver: Driver; mode: DbMode }> | null };

async function open(): Promise<{ driver: Driver; mode: DbMode }> {
  let driver: Driver;
  let mode: DbMode;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    const { Pool } = await import('pg');
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    const pool = new Pool({ connectionString: url, max: 3, ssl: local || /sslmode=disable/.test(url) ? undefined : { rejectUnauthorized: false } });
    driver = { query: (sql, params) => pool.query(sql, params) as Promise<{ rows: Row[] }>, exec: (sql) => pool.query(sql), close: () => pool.end() };
    mode = 'postgres';
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const ephemeral = !!process.env.VERCEL || process.env.RADAR_DB === 'memory';
    let pg: InstanceType<typeof PGlite>;
    if (ephemeral) pg = new PGlite();
    else {
      const dir = path.resolve(process.cwd(), process.env.DATA_DIR ?? 'data', 'pg');
      mkdirSync(dir, { recursive: true });
      pg = new PGlite(dir);
    }
    await pg.waitReady;
    driver = { query: (sql, params) => pg.query(sql, params) as Promise<{ rows: Row[] }>, exec: (sql) => pg.exec(sql), close: () => pg.close() };
    mode = ephemeral ? 'memoria' : 'archivo';
  }
  await driver.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const row = (await driver.query('SELECT version FROM schema_version')).rows[0] as { version: number } | undefined;
  let version = row?.version ?? 0;
  if (!row) await driver.query('INSERT INTO schema_version (version) VALUES (0)');
  while (version < MIGRATIONS.length) {
    await driver.exec(`BEGIN; ${MIGRATIONS[version]}; UPDATE schema_version SET version = ${version + 1}; COMMIT;`);
    version++;
  }
  return { driver, mode };
}

function conn() {
  if (!holder.__radarDb) {
    holder.__radarDb = open().catch((e) => {
      holder.__radarDb = null;
      throw e;
    });
  }
  return holder.__radarDb;
}

export async function dbMode(): Promise<DbMode> {
  return (await conn()).mode;
}

export async function q<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  const { driver } = await conn();
  return (await driver.query(sql, params)).rows as T[];
}

export async function q1<T = Row>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(sql, params))[0];
}

export async function closeDb() {
  const c = holder.__radarDb;
  holder.__radarDb = null;
  if (c) await (await c).driver.close();
}

export const nowIso = () => new Date().toISOString();

export async function getSetting(key: string): Promise<string | null> {
  return (await q1<{ value: string }>('SELECT value FROM settings WHERE key = $1', [key]))?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await q('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, value]);
}

export async function logEvent(type: string, userId: string | null, data?: Record<string, unknown>) {
  try {
    const { nanoid } = await import('nanoid');
    await q('INSERT INTO events (id, at, user_id, type, data) VALUES ($1, $2, $3, $4, $5)', [nanoid(12), nowIso(), userId, type, data ? JSON.stringify(data) : null]);
  } catch (error) {
    console.error('[events] no se pudo registrar', type, error);
  }
}
