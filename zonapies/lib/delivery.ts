/**
 * Entrega de las solicitudes al equipo de Zona Pies.
 * Orden de canales: webhook (Zapier, Make, n8n, CRM) → email (SMTP o Resend).
 * Devuelve false si no hay ningún canal configurado, para no fingir un envío correcto.
 */
import { serverEnv } from "@/lib/clean-env";
import { mailProvider, sendMail } from "@/lib/mail";

export interface TeamMessage {
  subject: string;
  text: string;
  replyTo?: string;
  /** Datos estructurados para el webhook */
  payload: Record<string, unknown>;
}

export async function deliverToTeam({ subject, text, replyTo, payload }: TeamMessage): Promise<boolean> {
  const webhook = serverEnv("QUOTE_WEBHOOK_URL");
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, subject, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Webhook respondió ${response.status}`);
    return true;
  }

  const to = serverEnv("QUOTE_TO_EMAIL");
  if (mailProvider() && to) {
    await sendMail({ to, subject, text, replyTo, fromName: "Web Zona Pies" });
    return true;
  }

  return false;
}
