import 'server-only';
import { nanoid } from 'nanoid';
import { STATUSES, type Company, type Contact, type SessionUser } from '@/domain/types';
import { addActivity, getCompany, setStatus } from './companies';
import { nowIso, q } from './db';
import { createTask } from './jobs';
import { getSecret, getSettings } from './settings';
import { camelize, update } from './sql';

/**
 * Conexión con el CRM.
 *
 * RADAR lleva su propio pipeline (estados, contactos, tareas y actividad). Si
 * además se configura un webhook del CRM corporativo, cada cambio relevante se
 * envía allí como JSON. Cambiar de CRM solo exige otra implementación de
 * CrmConnector: el resto de la aplicación llama a `syncCompany`.
 */
export interface CrmConnector {
  id: string;
  push(event: string, company: Company, extra?: Record<string, unknown>): Promise<{ id?: string } | null>;
}

const webhook: CrmConnector = {
  id: 'webhook',
  async push(event, company, extra) {
    const { crmWebhookUrl } = await getSettings();
    if (!crmWebhookUrl) return null;
    const token = await getSecret('crm_token');
    const { audit, facts, ...core } = company;
    void audit;
    const res = await fetch(crmWebhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ source: 'odisas-radar', event, sentAt: nowIso(), company: { ...core, statusLabel: STATUSES[company.status], provenance: facts }, ...extra }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`El CRM ha respondido ${res.status}`);
    const data = (await res.json().catch(() => null)) as { id?: unknown } | null;
    return data?.id ? { id: String(data.id) } : {};
  },
};

export async function crmConfigured(): Promise<boolean> {
  return !!(await getSettings()).crmWebhookUrl;
}

/** Envía la ficha al CRM externo, si lo hay. Nunca rompe la operación principal. */
export async function syncCompany(companyId: string, event: string, extra?: Record<string, unknown>): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  try {
    const company = await getCompany(companyId);
    if (!company.inCrm) return { ok: true, skipped: true };
    const r = await webhook.push(event, company, { ...extra, contacts: await listContacts(companyId) });
    if (r === null) return { ok: true, skipped: true };
    await update('companies', companyId, { crmSyncedAt: nowIso(), ...(r.id && !company.crmId ? { crmId: r.id } : {}) });
    return { ok: true };
  } catch (error) {
    console.error('[crm] sincronización fallida', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Error de conexión con el CRM' };
  }
}

/** Guarda la empresa como potencial: entra en el pipeline, con tarea de seguimiento, y se envía al CRM. */
export async function saveToCrm(companyId: string, user: SessionUser, opts: { task?: boolean } = {}) {
  const c = await getCompany(companyId);
  if (!c.inCrm) {
    await update('companies', companyId, { inCrm: true, archived: false, archiveReason: '', updatedAt: nowIso() });
    await addActivity(companyId, 'sistema', 'Guardada como empresa potencial en el pipeline', '', user.id);
  }
  if (['nueva', 'pendiente_investigar', 'analizada', 'descartada'].includes(c.status)) await setStatus(companyId, 'pendiente_contactar', user.id);
  const task = opts.task !== false && (await createTask(companyId, `Primer contacto con ${c.name}`, 2, 'crm', user.id));
  const sync = await syncCompany(companyId, 'company.saved');
  return { company: await getCompany(companyId), taskCreated: !!task, sync };
}

export async function listContacts(companyId: string): Promise<Contact[]> {
  return (await q('SELECT * FROM contacts WHERE company_id = $1 ORDER BY created_at', [companyId])).map((r) => camelize<Contact>(r));
}

export async function addContact(companyId: string, input: Partial<Contact>): Promise<Contact[]> {
  const s = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
  if (!s(input.name, 120)) throw new Error('El nombre del contacto es obligatorio.');
  await q('INSERT INTO contacts (id, company_id, name, role, email, phone, linkedin, source, source_url, notes, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [
    nanoid(12), companyId, s(input.name, 120), s(input.role, 120), s(input.email, 160).toLowerCase(), s(input.phone, 40), s(input.linkedin, 300), s(input.source, 120) || 'Introducido a mano', s(input.sourceUrl, 400), s(input.notes, 1000), nowIso(),
  ]);
  const c = await getCompany(companyId);
  if (!c.contactPerson) await update('companies', companyId, { contactPerson: s(input.name, 120) });
  void syncCompany(companyId, 'contact.added');
  return listContacts(companyId);
}
