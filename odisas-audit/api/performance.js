// Rendimiento real con Google PageSpeed Insights (Lighthouse, simulación móvil).
const { normalizeUrl } = require('./_lib/safe-fetch');
const { sign } = require('./_lib/token');

const THRESHOLDS = {
  'largest-contentful-paint': { label: 'LCP (carga del contenido principal)', good: 2500, poor: 4000, unit: 'ms' },
  'cumulative-layout-shift': { label: 'CLS (estabilidad visual)', good: 0.1, poor: 0.25, unit: '' },
  'total-blocking-time': { label: 'TBT (bloqueo de interacción)', good: 200, poor: 600, unit: 'ms' },
  'first-contentful-paint': { label: 'FCP (primer contenido visible)', good: 1800, poor: 3000, unit: 'ms' },
  'speed-index': { label: 'Speed Index', good: 3400, poor: 5800, unit: 'ms' },
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  let url;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    url = normalizeUrl(body.url);
  } catch (e) {
    return res.status(400).json({ available: false, reason: 'URL no válida' });
  }
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  api.searchParams.set('url', url.href);
  api.searchParams.set('strategy', 'mobile');
  api.searchParams.set('category', 'performance');
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set('key', process.env.PAGESPEED_API_KEY);

  try {
    const r = await fetch(api, { signal: AbortSignal.timeout(55000) });
    if (r.status === 429) return res.status(200).json({ available: false, reason: 'Límite de consultas a Google PageSpeed alcanzado. Configura PAGESPEED_API_KEY.' });
    if (!r.ok) return res.status(200).json({ available: false, reason: `Google PageSpeed no ha podido medir la web (HTTP ${r.status}).` });
    const data = await r.json();
    const lh = data.lighthouseResult;
    if (!lh) return res.status(200).json({ available: false, reason: 'Google PageSpeed no devolvió resultados.' });
    const metrics = Object.entries(THRESHOLDS).map(([id, t]) => {
      const a = lh.audits[id];
      if (!a || typeof a.numericValue !== 'number') return { id, label: t.label, value: null, status: 'unavailable' };
      const v = a.numericValue;
      return {
        id, label: t.label, value: v, display: a.displayValue,
        status: v <= t.good ? 'good' : v <= t.poor ? 'needs-improvement' : 'poor',
        threshold: t.unit === 'ms' ? `Bueno ≤ ${t.good / 1000} s` : `Bueno ≤ ${t.good}`,
      };
    });
    // Datos de usuarios reales (CrUX) solo si Google los tiene
    const field = data.loadingExperience && data.loadingExperience.metrics ? data.loadingExperience.overall_category : null;
    const score = Math.round((lh.categories.performance.score || 0) * 100);
    return res.status(200).json({
      available: true,
      perfToken: sign({ kind: 'perf', url: url.href, score, metrics: metrics.filter(m => m.value != null).map(m => ({ label: m.label, display: m.display, status: m.status })) }),
      source: 'Google PageSpeed Insights · Lighthouse · simulación móvil',
      score,
      metrics,
      fieldData: field ? { overall: field } : null,
    });
  } catch (e) {
    return res.status(200).json({ available: false, reason: e.name === 'TimeoutError' ? 'La medición de rendimiento ha superado el tiempo máximo.' : 'No se ha podido conectar con Google PageSpeed.' });
  }
};
