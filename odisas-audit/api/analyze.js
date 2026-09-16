const { runAudit } = require('./_lib/audit');
const { normalizeUrl, AuditError } = require('./_lib/safe-fetch');
const { sign } = require('./_lib/token');

const MESSAGES = {
  invalid_url: 'URL no válida',
  dns: 'URL no válida: el dominio no existe o no responde.',
  blocked: 'La web no permite realizar un análisis completo',
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const url = normalizeUrl(body.url);
    const result = await runAudit(url);
    // Token firmado con los datos que podrán usarse en el email al cliente
    result.emailToken = sign({
      kind: 'audit',
      url: result.url, siteName: result.siteName, analyzedAt: result.analyzedAt,
      categories: result.categories.map(c => ({ id: c.id, label: c.label, score: c.score })),
      counts: result.counts,
      issues: result.issues.slice(0, 8).map(i => ({ category: i.category, severity: i.severity, title: i.title, evidence: i.evidence.slice(0, 160), impact: i.impact, recommendation: i.recommendation })),
      passed: result.passed.slice(0, 5).map(p => ({ category: p.category, title: p.title })),
    });
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof AuditError) {
      const status = ['invalid_url', 'dns'].includes(e.code) ? 400 : 422;
      return res.status(status).json({ error: e.code, message: MESSAGES[e.code] || e.message || 'No se ha podido completar el análisis' });
    }
    console.error(e);
    return res.status(500).json({ error: 'internal', message: 'No se ha podido completar el análisis' });
  }
};
