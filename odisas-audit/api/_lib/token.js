// Firma los resultados del análisis para que el email solo pueda contener datos generados por nuestro servidor.
const crypto = require('node:crypto');

const secret = () => process.env.AUDIT_SECRET || '';
const b64 = buf => Buffer.from(buf).toString('base64url');

function sign(payload, ttlHours = 24) {
  if (!secret()) return null;
  const body = b64(JSON.stringify({ ...payload, exp: Date.now() + ttlHours * 3600e3 }));
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!secret() || typeof token !== 'string' || token.length > 20000) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

module.exports = { sign, verify };
