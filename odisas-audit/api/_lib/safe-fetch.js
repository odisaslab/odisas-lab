// Descarga segura de URLs públicas: bloquea IPs privadas (SSRF), limita tiempo, tamaño y redirecciones.
const dns = require('node:dns').promises;
const net = require('node:net');

const UA = 'Mozilla/5.0 (compatible; OdisasLabAudit/1.0)';
const MAX_BYTES = 4 * 1024 * 1024;

class AuditError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
}

async function assertPublicHost(hostname) {
  if (process.env.ALLOW_PRIVATE_HOSTS === '1') return; // solo para pruebas locales
  let addrs;
  try { addrs = await dns.lookup(hostname, { all: true }); }
  catch { throw new AuditError('dns', 'El dominio no existe o no responde.'); }
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) {
    throw new AuditError('invalid_url', 'La dirección no apunta a una web pública.');
  }
}

function normalizeUrl(input) {
  let v = String(input || '').trim();
  if (!v || v.length > 2048) throw new AuditError('invalid_url', 'URL no válida');
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  let u;
  try { u = new URL(v); } catch { throw new AuditError('invalid_url', 'URL no válida'); }
  const hostOk = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname) || (process.env.ALLOW_PRIVATE_HOSTS === '1' && u.hostname === 'localhost');
  if (!['http:', 'https:'].includes(u.protocol) || !hostOk || u.username || u.password) {
    throw new AuditError('invalid_url', 'URL no válida');
  }
  u.hash = '';
  return u;
}

// fetch con redirecciones manuales: cada salto se valida contra IPs privadas
async function safeFetch(url, { maxRedirects = 5, timeout = 12000, readBody = true, followRedirects = true } = {}) {
  let current = new URL(url);
  const redirects = [];
  const started = Date.now();
  for (let i = 0; i <= maxRedirects; i++) {
    await assertPublicHost(current.hostname);
    let res;
    const t0 = Date.now();
    try {
      res = await fetch(current, {
        redirect: 'manual',
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'es-ES,es;q=0.9' },
        signal: AbortSignal.timeout(timeout),
      });
    } catch (e) {
      if (e && (e.name === 'TimeoutError' || e.name === 'AbortError')) throw new AuditError('timeout', 'La web ha tardado demasiado en responder.');
      throw new AuditError('connection', 'No se ha podido conectar con la web.');
    }
    const headersMs = Date.now() - t0;
    const loc = res.headers.get('location');
    if (followRedirects && res.status >= 300 && res.status < 400 && loc) {
      redirects.push({ url: current.href, status: res.status });
      current = new URL(loc, current);
      if (!['http:', 'https:'].includes(current.protocol)) throw new AuditError('connection', 'Redirección no válida.');
      continue;
    }
    let body = '';
    let truncated = false;
    if (readBody && res.body) {
      const reader = res.body.getReader();
      const chunks = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length; chunks.push(value);
        if (size > MAX_BYTES) { truncated = true; try { await reader.cancel(); } catch {} break; }
      }
      body = Buffer.concat(chunks).toString('utf8');
    } else if (res.body) {
      try { await res.body.cancel(); } catch {}
    }
    return {
      url: current.href, status: res.status, headers: res.headers, body, truncated,
      bytes: Buffer.byteLength(body), headersMs, totalMs: Date.now() - started, redirects,
    };
  }
  throw new AuditError('connection', 'Demasiadas redirecciones.');
}

module.exports = { safeFetch, normalizeUrl, AuditError };
