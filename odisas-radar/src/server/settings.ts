import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { Sender } from '@/domain/templates';
import { getSetting, setSetting } from './db';

/** Ajustes editables desde Configuración. Los secretos se guardan cifrados (AES-256-GCM). */

let cachedKey: Buffer | null = null;
async function secretKey(): Promise<Buffer> {
  if (cachedKey) return cachedKey;
  let secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32 ? process.env.AUTH_SECRET : await getSetting('auth_secret');
  if (!secret) {
    // Sin AUTH_SECRET se genera uno y se guarda en la base de datos (menos seguro que la variable de entorno).
    secret = randomBytes(48).toString('base64url');
    await setSetting('auth_secret', secret);
  }
  cachedKey = createHash('sha256').update(`odisas-radar:secrets:${secret}`).digest();
  return cachedKey;
}

export async function getSecret(name: string): Promise<string | null> {
  const raw = await getSetting(`secret:${name}`);
  if (!raw) return null;
  try {
    const [iv, tag, data] = raw.split('.').map((p) => Buffer.from(p, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', await secretKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

export async function setSecret(name: string, value: string | null) {
  if (!value) return setSetting(`secret:${name}`, '');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', await secretKey(), iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  await setSetting(`secret:${name}`, [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join('.'));
}

export const maskSecret = (value: string | null) => (value ? `••••${value.slice(-4)}` : null);

export interface AppSettings {
  sender: Sender;
  /** Días sin actividad a partir de los cuales una oportunidad abierta genera aviso. */
  followupDays: number;
  aiModel: string;
  /** Añadir la línea de baja a los correos comerciales. */
  optOutFooter: boolean;
  crmWebhookUrl: string;
  /** Correo de contacto que se envía a OpenStreetMap, como pide su política de uso. */
  osmContact: string;
}

export const DEFAULT_MODEL = 'claude-opus-5-5';
export const DEFAULT_SETTINGS: AppSettings = {
  sender: { name: '', role: '', company: 'Odisas Lab', email: '', phone: '', meetingUrl: '' },
  followupDays: 7,
  aiModel: DEFAULT_MODEL,
  optOutFooter: true,
  crmWebhookUrl: '',
  osmContact: '',
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await getSetting('app');
  const saved = raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};
  return { ...DEFAULT_SETTINGS, ...saved, sender: { ...DEFAULT_SETTINGS.sender, ...saved.sender }, aiModel: process.env.RADAR_AI_MODEL || saved.aiModel || DEFAULT_MODEL };
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const cur = await getSettings();
  const s = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const next: AppSettings = {
    sender: patch.sender
      ? { name: s(patch.sender.name, 80), role: s(patch.sender.role, 80), company: s(patch.sender.company, 80) || 'Odisas Lab', email: s(patch.sender.email, 160), phone: s(patch.sender.phone, 40), meetingUrl: s(patch.sender.meetingUrl, 300) }
      : cur.sender,
    followupDays: patch.followupDays == null ? cur.followupDays : Math.max(1, Math.min(90, Math.round(Number(patch.followupDays)) || 7)),
    aiModel: patch.aiModel == null ? cur.aiModel : s(patch.aiModel, 60) || DEFAULT_MODEL,
    optOutFooter: patch.optOutFooter == null ? cur.optOutFooter : !!patch.optOutFooter,
    crmWebhookUrl: patch.crmWebhookUrl == null ? cur.crmWebhookUrl : s(patch.crmWebhookUrl, 400),
    osmContact: patch.osmContact == null ? cur.osmContact : s(patch.osmContact, 160),
  };
  await setSetting('app', JSON.stringify(next));
  return next;
}

export async function anthropicKey(): Promise<string> {
  return process.env.ANTHROPIC_API_KEY || (await getSecret('anthropic')) || '';
}
