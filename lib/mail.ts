/**
 * Envío de emails: SMTP (p. ej. Gmail con contraseña de aplicación) o Resend,
 * según las variables de entorno configuradas. En desarrollo, MAIL_DEV_OUTBOX
 * guarda el correo en una carpeta en lugar de enviarlo.
 */
import { serverEnv } from "@/lib/clean-env";
import { contact } from "@/data/site";

export type MailProvider = "outbox" | "smtp" | "resend" | null;

export interface MailMessage {
  to: string;
  bcc?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  fromName?: string;
}

export function mailConfig() {
  return {
    brandName: serverEnv("BRAND_NAME") || "Odisas Lab",
    senderName: serverEnv("SENDER_NAME") || "El equipo de Odisas Lab",
    replyTo: serverEnv("REPLY_TO_EMAIL") || contact.email || "Odisaslab@gmail.com",
    phone: serverEnv("CONTACT_PHONE") || contact.phoneDisplay || "616 88 00 63",
    meetingUrl: serverEnv("MEETING_URL"),
    /** Copia oculta de cada envío al cliente (opcional) */
    internalCopy: serverEnv("INTERNAL_COPY_EMAIL"),
    logoUrl: "",
  };
}

export function mailFrom(): string {
  return serverEnv("MAIL_FROM") || serverEnv("CONTACT_FROM_EMAIL");
}

export function mailProvider(): MailProvider {
  if (serverEnv("MAIL_DEV_OUTBOX")) return "outbox";
  if (serverEnv("SMTP_HOST") && serverEnv("SMTP_USER") && serverEnv("SMTP_PASS")) return "smtp";
  if (serverEnv("RESEND_API_KEY") && mailFrom()) return "resend";
  return null;
}

export async function sendMail({ to, bcc, subject, html, text, replyTo, fromName }: MailMessage): Promise<void> {
  const provider = mailProvider();

  if (provider === "outbox") {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dir = serverEnv("MAIL_DEV_OUTBOX");
    fs.mkdirSync(dir, { recursive: true });
    const base = path.join(dir, `${Date.now()}-${to.replace(/[^a-z0-9@.]/gi, "_")}`);
    if (html) fs.writeFileSync(`${base}.html`, html);
    fs.writeFileSync(`${base}.txt`, `Para: ${to}\nCCO: ${bcc ?? ""}\nAsunto: ${subject}\n\n${text}`);
    return;
  }

  if (provider === "smtp") {
    const nodemailer = (await import("nodemailer")).default;
    const port = Number(serverEnv("SMTP_PORT") || 465);
    const transport = nodemailer.createTransport({
      host: serverEnv("SMTP_HOST"),
      port,
      secure: port === 465,
      auth: { user: serverEnv("SMTP_USER"), pass: serverEnv("SMTP_PASS") },
    });
    const from = mailFrom() || `${fromName ?? "Odisas Lab"} <${serverEnv("SMTP_USER")}>`;
    await transport.sendMail({ from, to, bcc, subject, html, text, replyTo });
    return;
  }

  if (provider === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${serverEnv("RESEND_API_KEY")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: mailFrom(),
        to: [to],
        bcc: bcc ? [bcc] : undefined,
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
    return;
  }

  const error = new Error("not_configured") as Error & { code: string };
  error.code = "not_configured";
  throw error;
}
