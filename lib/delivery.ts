/**
 * Entrega de avisos internos al equipo (solicitudes del formulario, leads del diagnóstico).
 * Orden de canales: webhook (Zapier, Make, n8n, CRM) → email (SMTP o Resend).
 * Devuelve false si no hay ningún canal configurado, para no fingir un envío correcto.
 */
import { contact } from "@/data/site";
import { mailProvider, sendMail } from "@/lib/mail";

export interface TeamMessage {
  subject: string;
  text: string;
  replyTo?: string;
  /** Datos estructurados para el webhook */
  payload: Record<string, unknown>;
}

export async function deliverToTeam({ subject, text, replyTo, payload }: TeamMessage): Promise<boolean> {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, subject, receivedAt: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error(`Webhook respondió ${response.status}`);
    return true;
  }

  const to = process.env.CONTACT_TO_EMAIL || contact.email;
  if (mailProvider() && to) {
    await sendMail({ to, subject, text, replyTo, fromName: "Web Odisas Lab" });
    return true;
  }

  return false;
}
