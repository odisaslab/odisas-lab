// Email personalizado que Odisas Lab envía a la empresa analizada.
// Todo el contenido sale de los datos firmados del análisis: no se inventan cifras ni resultados.

const SERVICES = {
  security: 'Mantenimiento y seguridad web',
  seo: 'SEO técnico y local',
  mobile: 'Diseño web adaptado a móvil y accesible',
  conversion: 'Optimización de la conversión (más llamadas y contactos)',
  performance: 'Optimización de velocidad',
};
const SEV = { critical: 'Crítico', high: 'Alto', medium: 'Medio', low: 'Bajo' };
const SEV_COLOR = { critical: '#E5383B', high: '#FF6807', medium: '#C99A00', low: '#6B6F7B' };

const esc = v => String(v ?? '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
const scoreColor = s => (s >= 80 ? '#17B287' : s >= 50 ? '#C99A00' : '#E5383B');

function buildEmail({ audit, perf, companyName, config }) {
  const brand = config.brandName;
  const company = companyName || audit.siteName;
  const host = audit.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const date = new Date(audit.analyzedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });

  const cats = [...audit.categories];
  if (perf) cats.push({ id: 'performance', label: 'Rendimiento en móvil', score: perf.score });
  const score = Math.round(cats.reduce((s, c) => s + c.score, 0) / cats.length);

  const top = audit.issues.filter(i => ['critical', 'high', 'medium'].includes(i.severity)).slice(0, 4);
  const shown = top.length ? top : audit.issues.slice(0, 3);
  const important = audit.counts.critical + audit.counts.high;
  const totalIssues = audit.counts.critical + audit.counts.high + audit.counts.medium + audit.counts.low;

  // Servicios relacionados con lo detectado, ordenados por la categoría con peor nota
  const weakCats = cats.filter(c => c.score < 80).sort((a, b) => a.score - b.score).map(c => c.id);
  const services = weakCats.map(id => SERVICES[id]).filter(Boolean).slice(0, 3);

  const subject = important
    ? `${company}: ${important} ${important === 1 ? 'punto importante' : 'puntos importantes'} a mejorar en vuestra web`
    : `${company}: así os están viendo Google y vuestros clientes ahora mismo`;

  const intro = score >= 80
    ? `La web está en buen estado general, pero hemos encontrado algunos detalles que, bien resueltos, pueden ayudaros a conseguir más contactos.`
    : score >= 50
      ? `La web cumple su función, pero hemos encontrado varios puntos que probablemente os están haciendo perder visibilidad en Google y contactos de clientes.`
      : `Hemos encontrado problemas importantes que conviene resolver cuanto antes, porque afectan a cómo os encuentra Google y a la confianza de quien entra en la web.`;

  // El texto del CTA refleja la urgencia real según la nota, sin exagerarla
  const ctaLabel = score >= 80
    ? 'Agendar una llamada de 15 minutos'
    : score >= 50
      ? 'Agendar una llamada de 15 minutos para resolverlo'
      : 'Agendar una llamada de 15 minutos cuanto antes';

  const meetingUrl = config.meetingUrl
    || `mailto:${config.replyTo}?subject=${encodeURIComponent(`Llamada sobre la web de ${company}`)}&body=${encodeURIComponent(`Hola, nos interesa una llamada para revisar el diagnóstico de ${host}.\n\nNos viene bien: \nTeléfono de contacto: `)}`;

  // ---------- versión HTML ----------
  const issueRows = shown.map(i => `
    <tr><td style="padding:0 0 14px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EDE7E2;border-radius:12px;background:#FBF9F7">
        <tr><td style="padding:14px 16px">
          <span style="display:inline-block;font-size:11px;font-weight:bold;color:${SEV_COLOR[i.severity]};border:1px solid ${SEV_COLOR[i.severity]};border-radius:5px;padding:2px 6px">${SEV[i.severity]}</span>
          <p style="margin:8px 0 0;font-size:16px;font-weight:bold;color:#211F1F">${esc(i.title)}</p>
          ${i.impact ? `<p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:#4A4744"><b>Por qué importa:</b> ${esc(i.impact)}</p>` : ''}
          <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:#4A4744"><b>Qué haríamos:</b> ${esc(i.recommendation)}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#8A8580">Evidencia: ${esc(i.evidence)}</p>
        </td></tr>
      </table>
    </td></tr>`).join('');

  const catRows = cats.map(c => `
    <tr>
      <td style="padding:6px 0;font-size:14px;color:#211F1F">${esc(c.label)}</td>
      <td style="padding:6px 0;font-size:14px;font-weight:bold;color:${scoreColor(c.score)};text-align:right;white-space:nowrap">${c.score}/100</td>
    </tr>`).join('');

  const passedHtml = audit.passed.length
    ? `<p style="margin:24px 0 8px;font-size:16px;font-weight:bold;color:#211F1F">Lo que ya estáis haciendo bien</p>
       <p style="margin:0;font-size:14px;line-height:1.7;color:#4A4744">${audit.passed.slice(0, 4).map(p => `✓ ${esc(p.title)}`).join('<br>')}</p>`
    : '';

  const servicesHtml = services.length
    ? `<p style="margin:24px 0 8px;font-size:16px;font-weight:bold;color:#211F1F">Cómo podemos ayudaros</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:#4A4744">Por lo que hemos visto, donde más margen de mejora tenéis es en: <b>${services.map(esc).join('</b>, <b>')}</b>. En ${esc(brand)} trabajamos precisamente en esto, y nos gustaría explicaros en una llamada breve qué haríamos primero en vuestro caso y qué podéis esperar.</p>`
    : `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#4A4744">Nos gustaría explicaros en una llamada breve cómo sacarle aún más partido a la web.</p>`;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F7F4F1;font-family:Arial,Helvetica,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">Nota ${score}/100 · ${totalIssues} puntos detectados en ${esc(host)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F1;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden">
  <tr><td style="padding:24px 28px;border-bottom:3px solid #FF6807">
    ${config.logoUrl ? `<img src="${esc(config.logoUrl)}" width="30" height="31" alt="" style="vertical-align:middle;border:0">` : ''}
    <span style="vertical-align:middle;font-size:20px;font-weight:bold;color:#211F1F;margin-left:8px;letter-spacing:.5px">ODISAS <span style="color:#FF6807">LAB</span></span>
  </td></tr>
  <tr><td style="padding:28px">
    <p style="margin:0 0 16px;font-size:16px;color:#211F1F">Hola, equipo de ${esc(company)}:</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4A4744">Soy ${esc(config.senderName)}, de ${esc(brand)}. Nos hemos tomado la iniciativa de analizar vuestra web, <b>${esc(host)}</b>, el ${esc(date)}, porque creemos que os puede ser útil conocer de primera mano cómo os están viendo Google y vuestros clientes potenciales. Os resumo lo que hemos encontrado.</p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4A4744">${intro}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#211F1F;border-radius:14px">
      <tr><td style="padding:20px 22px">
        <p style="margin:0;font-size:13px;color:#BDB6B0">Nota general de la web</p>
        <p style="margin:4px 0 0;font-size:40px;font-weight:bold;color:#FFFFFF">${score}<span style="font-size:16px;color:#BDB6B0">/100</span></p>
        <p style="margin:6px 0 0;font-size:13px;color:#BDB6B0">${audit.counts.critical} críticos · ${audit.counts.high} altos · ${audit.counts.medium} medios · ${audit.counts.low} bajos</p>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${catRows}</table>
    ${perf ? '' : `<p style="margin:8px 0 0;font-size:12px;color:#8A8580">El rendimiento no se ha podido medir en este análisis y no se incluye en la nota.</p>`}
    <p style="margin:14px 0 0;font-size:14px;line-height:1.5"><a href="${esc(meetingUrl)}" style="color:#DD3B04;font-weight:bold;text-decoration:none">→ ${esc(ctaLabel)}</a> <span style="color:#8A8580">— o sigue leyendo el detalle</span></p>

    <p style="margin:26px 0 12px;font-size:16px;font-weight:bold;color:#211F1F">Lo que más os está afectando</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${issueRows}</table>
    ${totalIssues > shown.length ? `<p style="margin:0;font-size:13px;color:#8A8580">Hay ${totalIssues - shown.length} ${totalIssues - shown.length === 1 ? 'punto más' : 'puntos más'} que os podemos detallar en la llamada.</p>` : ''}

    ${passedHtml}
    ${servicesHtml}

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 10px"><tr><td style="background:#FF6807;border-radius:10px">
      <a href="${esc(meetingUrl)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:bold;color:#211F1F;text-decoration:none">${esc(ctaLabel)}</a>
    </td></tr></table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#4A4744">También podéis responder a este correo con el día y la hora que mejor os venga, o llamarnos al <a href="tel:${esc(config.phone.replace(/\s/g, ''))}" style="color:#DD3B04">${esc(config.phone)}</a>. Sin compromiso.</p>

    <p style="margin:26px 0 0;font-size:15px;line-height:1.5;color:#211F1F">Un saludo,<br><b>${esc(config.senderName)}</b><br><span style="color:#4A4744">${esc(brand)} · Marketing digital</span><br><a href="mailto:${esc(config.replyTo)}" style="color:#DD3B04">${esc(config.replyTo)}</a> · ${esc(config.phone)}</p>
  </td></tr>
  <tr><td style="padding:18px 28px;background:#FBF9F7;font-size:11px;line-height:1.5;color:#8A8580">
    Diagnóstico automático de la página ${esc(audit.url)} realizado el ${esc(date)}. Revisa la página indicada, no el sitio completo, y no incluye pruebas intrusivas.
    Este diagnóstico se ha elaborado por iniciativa de ${esc(brand)}, a partir de datos públicos de vuestra web, sin ningún compromiso por vuestra parte. Si preferís no recibir más comunicaciones como esta, respondednos indicándolo y no volveremos a escribiros.
  </td></tr>
</table>
</td></tr></table></body></html>`;

  // ---------- versión texto ----------
  const text = [
    `Hola, equipo de ${company}:`, '',
    `Soy ${config.senderName}, de ${brand}. Nos hemos tomado la iniciativa de analizar vuestra web, ${host}, el ${date}, porque creemos que os puede ser útil conocer de primera mano cómo os están viendo Google y vuestros clientes potenciales. Os resumo lo que hemos encontrado.`, '',
    intro, '',
    `NOTA GENERAL: ${score}/100 (${audit.counts.critical} críticos, ${audit.counts.high} altos, ${audit.counts.medium} medios, ${audit.counts.low} bajos)`,
    ...cats.map(c => `- ${c.label}: ${c.score}/100`), '',
    `→ ${ctaLabel}: ${config.meetingUrl || `responded a este correo o llamadnos al ${config.phone}`}`, '',
    'LO QUE MÁS OS ESTÁ AFECTANDO',
    ...shown.flatMap(i => [`[${SEV[i.severity]}] ${i.title}`, i.impact ? `  Por qué importa: ${i.impact}` : '', `  Qué haríamos: ${i.recommendation}`, '']).filter((l, idx, arr) => l !== '' || arr[idx - 1] !== ''),
    audit.passed.length ? `LO QUE YA HACÉIS BIEN\n${audit.passed.slice(0, 4).map(p => `✓ ${p.title}`).join('\n')}\n` : '',
    services.length ? `Donde más margen de mejora tenéis es en: ${services.join(', ')}. Nos gustaría explicaros en una llamada breve qué haríamos primero en vuestro caso.` : 'Nos gustaría explicaros en una llamada breve cómo sacarle aún más partido a la web.', '',
    `${ctaLabel}: ${config.meetingUrl || `responded a este correo o llamadnos al ${config.phone}`}`, '',
    `Un saludo,`, config.senderName, `${brand} · Marketing digital`, `${config.replyTo} · ${config.phone}`, '',
    `Este diagnóstico se ha elaborado por iniciativa de ${brand}, a partir de datos públicos de vuestra web, sin ningún compromiso por vuestra parte. Si preferís no recibir más comunicaciones como esta, respondednos indicándolo y no volveremos a escribiros.`,
  ].join('\n');

  return { subject, html, text, score };
}

module.exports = { buildEmail };
