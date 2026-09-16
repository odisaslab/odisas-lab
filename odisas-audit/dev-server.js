// Servidor local de desarrollo: sirve /public y emula las funciones /api de Vercel.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const PORT = process.env.PORT || 3000;
process.env.AUDIT_SECRET = process.env.AUDIT_SECRET || 'solo-para-desarrollo-local';
if (!process.env.SMTP_HOST && !process.env.RESEND_API_KEY) process.env.MAIL_DEV_OUTBOX = process.env.MAIL_DEV_OUTBOX || path.join(__dirname, 'outbox');
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.js': 'text/javascript', '.css': 'text/css' };

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname.startsWith('/api/')) {
    const name = u.pathname.slice(5).replace(/[^a-z-]/g, '');
    const file = path.join(__dirname, 'api', name + '.js');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    let raw = ''; for await (const c of req) raw += c;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    res.status = code => { res.statusCode = code; return res; };
    res.json = obj => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); };
    return require(file)(req, res);
  }
  const p = path.join(__dirname, 'public', u.pathname === '/' ? 'index.html' : path.normalize(u.pathname));
  if (!p.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(p)) { res.writeHead(404); return res.end('No encontrado'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log(`Odisas Lab en http://localhost:${PORT}`));
