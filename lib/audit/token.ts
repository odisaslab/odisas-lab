/**
 * Firma los resultados del análisis para que el email solo pueda contener datos
 * generados por nuestro servidor (nadie puede inventar el contenido del correo).
 */
import crypto from "node:crypto";

function secret(): string {
  if (process.env.AUDIT_SECRET) return process.env.AUDIT_SECRET;
  // Sin AUDIT_SECRET se deriva una clave estable de otra credencial ya configurada
  const seed = process.env.RESEND_API_KEY || process.env.SMTP_PASS || process.env.CONTACT_WEBHOOK_URL;
  if (seed) return crypto.createHash("sha256").update(`odisas-audit:${seed}`).digest("hex");
  if (process.env.MAIL_DEV_OUTBOX) return "solo-para-desarrollo-local";
  return "";
}

const b64 = (value: string | Buffer) => Buffer.from(value).toString("base64url");

export function sign(payload: Record<string, unknown>, ttlHours = 24): string | null {
  const key = secret();
  if (!key) return null;
  const body = b64(JSON.stringify({ ...payload, exp: Date.now() + ttlHours * 3600e3 }));
  const sig = crypto.createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verify<T = Record<string, unknown>>(token: unknown): (T & { exp: number }) | null {
  const key = secret();
  if (!key || typeof token !== "string" || token.length > 20000) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", key).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp: number };
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}
