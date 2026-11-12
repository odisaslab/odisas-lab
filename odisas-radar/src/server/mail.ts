import 'server-only';

/** Envío de correo por SMTP (por ejemplo, Gmail con contraseña de aplicación). Solo por variables de entorno. */
export function mailConfigured(): boolean {
  return !!(process.env.MAIL_DEV_OUTBOX || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
}

export async function sendMail(m: { to: string; subject: string; text: string; replyTo?: string; fromName?: string }) {
  if (process.env.MAIL_DEV_OUTBOX) {
    const fs = await import('node:fs');
    const path = await import('node:path');
    fs.mkdirSync(process.env.MAIL_DEV_OUTBOX, { recursive: true });
    fs.writeFileSync(path.join(process.env.MAIL_DEV_OUTBOX, `${Date.now()}-${m.to.replace(/[^a-z0-9@.]/gi, '_')}.txt`), `Para: ${m.to}\nAsunto: ${m.subject}\n\n${m.text}`);
    return;
  }
  if (!mailConfigured()) throw new Error('El envío de correo no está configurado (variables SMTP_HOST, SMTP_USER y SMTP_PASS).');
  const nodemailer = (await import('nodemailer')).default;
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await transport.sendMail({ from: process.env.MAIL_FROM || `${m.fromName || 'Odisas Lab'} <${process.env.SMTP_USER}>`, to: m.to, subject: m.subject, text: m.text, replyTo: m.replyTo });
}
