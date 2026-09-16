// Envía a la empresa analizada un email personalizado de Odisas Lab con el diagnóstico y una invitación a una llamada.
const { verify } = require('./_lib/token');
const { buildEmail } = require('./_lib/email-template');
const { sendMail, mailConfig, provider } = require('./_lib/mailer');

// Límite básico anti-abuso (por instancia): 5 envíos por IP cada hora y 2 por análisis
const byIp = new Map();
const byAudit = new Map();
function allowed(map, key, max, windowMs) {
  const now = Date.now();
  const list = (map.get(key) || []).filter(t => now - t < windowMs);
  if (list.length >= max) return false;
  list.push(now); map.set(key, list);
  return true;
}

const EMAIL_RE = /^[^\s@<>"',;]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  if (body.website) return res.status(200).json({ ok: true }); // honeypot: bots
  const email = String(body.email || '').trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid_email', message: 'Escribe un email válido.' });
  if (body.consent !== true) return res.status(400).json({ error: 'consent', message: 'Marca la casilla para poder enviaros el diagnóstico.' });

  const audit = verify(body.emailToken);
  if (!audit || audit.kind !== 'audit') return res.status(400).json({ error: 'expired', message: 'El análisis ha caducado. Vuelve a analizar la web.' });
  if (!provider()) return res.status(503).json({ error: 'not_configured', message: 'El envío de emails no está configurado.' });

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (!allowed(byIp, ip, 5, 3600e3) || !allowed(byAudit, body.emailToken.slice(-24), 2, 24 * 3600e3)) {
    return res.status(429).json({ error: 'rate_limited', message: 'Has alcanzado el límite de envíos. Inténtalo más tarde.' });
  }

  // Rendimiento solo si viene firmado y corresponde a la misma web
  let perf = null;
  const p = verify(body.perfToken);
  const sameHost = (a, b) => { try { return new URL(a).hostname.replace(/^www\./, '') === new URL(b).hostname.replace(/^www\./, ''); } catch { return false; } };
  if (p && p.kind === 'perf' && sameHost(p.url, audit.url)) perf = p;

  const companyName = String(body.companyName || '').replace(/[\r\n<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  const config = mailConfig();
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  config.logoUrl = process.env.PUBLIC_BASE_URL ? `${process.env.PUBLIC_BASE_URL.replace(/\/$/, '')}/logo-icon.png` : (hostHeader ? `${proto}://${hostHeader}/logo-icon.png` : '');

  const mail = buildEmail({ audit, perf, companyName, config });
  try {
    await sendMail({ to: email, bcc: config.internalCopy, subject: mail.subject, html: mail.html, text: mail.text, replyTo: config.replyTo, fromName: config.brandName });
    return res.status(200).json({ ok: true, subject: mail.subject });
  } catch (e) {
    console.error('send-report', e.message);
    return res.status(502).json({ error: 'send_failed', message: 'No se ha podido enviar el email. Inténtalo de nuevo en unos minutos.' });
  }
};
