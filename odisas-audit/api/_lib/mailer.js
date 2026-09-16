// Envío de emails: SMTP (p. ej. Gmail con contraseña de aplicación) o Resend, según las variables configuradas.

function mailConfig() {
  return {
    brandName: process.env.BRAND_NAME || 'Odisas Lab',
    senderName: process.env.SENDER_NAME || 'Alejandro',
    replyTo: process.env.REPLY_TO_EMAIL || 'Odisaslab@gmail.com',
    phone: process.env.CONTACT_PHONE || '616 88 00 63',
    meetingUrl: process.env.MEETING_URL || '',
    internalCopy: process.env.INTERNAL_COPY_EMAIL || process.env.REPLY_TO_EMAIL || 'Odisaslab@gmail.com',
  };
}

function provider() {
  if (process.env.MAIL_DEV_OUTBOX) return 'outbox'; // pruebas locales: guarda el email en una carpeta
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) return 'resend';
  return null;
}

async function sendMail({ to, bcc, subject, html, text, replyTo, fromName }) {
  const p = provider();
  if (p === 'outbox') {
    const fs = require('node:fs'); const path = require('node:path');
    fs.mkdirSync(process.env.MAIL_DEV_OUTBOX, { recursive: true });
    const base = path.join(process.env.MAIL_DEV_OUTBOX, `${Date.now()}-${to.replace(/[^a-z0-9@.]/gi, '_')}`);
    fs.writeFileSync(base + '.html', html); fs.writeFileSync(base + '.txt', `Para: ${to}\nCCO: ${bcc}\nAsunto: ${subject}\n\n${text}`);
    return;
  }
  if (p === 'smtp') {
    const nodemailer = require('nodemailer');
    const port = Number(process.env.SMTP_PORT || 465);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const from = process.env.MAIL_FROM || `${fromName} <${process.env.SMTP_USER}>`;
    await transport.sendMail({ from, to, bcc, subject, html, text, replyTo });
    return;
  }
  if (p === 'resend') {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], bcc: bcc ? [bcc] : undefined, subject, html, text, reply_to: replyTo }),
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
    return;
  }
  const err = new Error('not_configured'); err.code = 'not_configured'; throw err;
}

module.exports = { sendMail, mailConfig, provider };
