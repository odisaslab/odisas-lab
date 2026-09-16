// Motor de análisis rápido de Odisas Lab.
// Regla: solo se informa de lo que se ha medido o detectado en la respuesta real de la web.
const { safeFetch, AuditError } = require('./safe-fetch');

const SEVERITY_WEIGHT = { critical: 30, high: 15, medium: 8, low: 3 };
const CATEGORIES = {
  security: 'Seguridad',
  seo: 'SEO',
  mobile: 'Móvil y accesibilidad',
  conversion: 'Conversión',
};

// ---------- utilidades de HTML (sin dependencias) ----------
const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, '');
const decode = s => String(s || '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();

function tags(html, name) {
  const re = new RegExp(`<${name}\\b([^>]*)>`, 'gi');
  const out = []; let m;
  while ((m = re.exec(html))) out.push(parseAttrs(m[1]));
  return out;
}
function parseAttrs(str) {
  const attrs = {}; const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g; let m;
  while ((m = re.exec(str))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}
function inner(html, name) {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'gi');
  const out = []; let m;
  while ((m = re.exec(html))) out.push(decode(m[1].replace(/<[^>]+>/g, ' ')));
  return out;
}
const meta = (metas, key, val) => metas.find(m => (m[key] || '').toLowerCase() === val);
const short = (s, n = 90) => (s.length > n ? s.slice(0, n - 1) + '…' : s);


// Explicación en lenguaje de negocio de cada problema (se usa en el email al cliente)
const IMPACT = [
  [/no usa HTTPS/, 'Los navegadores muestran "No seguro" al entrar y muchos visitantes abandonan antes de leer nada.'],
  [/no redirige a HTTPS/, 'Parte de las visitas pueden ver la versión insegura de la web y el aviso de "No seguro".'],
  [/HSTS/, 'Deja una puerta abierta a que la conexión de un visitante se degrade a una versión no cifrada.'],
  [/Contenido mixto/, 'El navegador puede bloquear partes de la página o mostrar avisos que restan confianza.'],
  [/clickjacking/, 'Otra web podría mostrar la vuestra dentro de la suya para engañar a los usuarios.'],
  [/Content-Security-Policy/, 'Reduce la protección frente a código malicioso inyectado en la página.'],
  [/X-Content-Type-Options/, 'Es una protección básica que falta; su impacto aislado es bajo.'],
  [/versiones de su software/, 'Facilita a terceros identificar qué software usáis y buscar fallos conocidos de esa versión.'],
  [/no tiene título/, 'Google no sabe cómo presentar la página en los resultados y pierde visibilidad.'],
  [/Título demasiado corto/, 'El título que aparece en Google no explica qué ofrecéis, así que atrae menos clics.'],
  [/Título demasiado largo/, 'Google corta el título y el mensaje principal puede quedar oculto.'],
  [/Falta la meta description/, 'Google improvisa el texto que aparece bajo vuestro enlace y suele ser poco atractivo.'],
  [/texto por defecto del CMS/, 'En Google aparece un texto genérico de instalación en lugar de vuestra propuesta, lo que resta clics y profesionalidad.'],
  [/Meta description con longitud/, 'El texto que se ve en Google puede quedar cortado o resultar poco persuasivo.'],
  [/H1/, 'Google y los visitantes tardan más en entender cuál es vuestro servicio principal.'],
  [/noindex/, 'La página puede no aparecer en Google en absoluto.'],
  [/canónica/, 'Pueden aparecer versiones duplicadas de la página compitiendo entre sí en Google.'],
  [/Schema/, 'Google no recibe datos estructurados de la empresa (nombre, dirección, horario), que ayudan a destacar en búsquedas.'],
  [/Open Graph/, 'Al compartir la web por WhatsApp o redes, el enlace sale sin imagen ni título atractivo.'],
  [/robots\.txt/, 'Google podría no estar rastreando la web.'],
  [/sitemap/, 'Google tarda más en descubrir y actualizar vuestras páginas.'],
  [/viewport/, 'En el móvil la web se ve diminuta o descolocada, y la mayoría de visitas llegan desde el móvil.'],
  [/zoom/, 'Personas con dificultades de visión no pueden ampliar el contenido en el móvil.'],
  [/idioma/, 'Lectores de pantalla y buscadores no identifican correctamente el idioma.'],
  [/sin texto alternativo/, 'Las imágenes no aportan a Google Imágenes ni son accesibles para personas con discapacidad visual.'],
  [/sin etiqueta accesible/, 'Los formularios son más difíciles de usar con lectores de pantalla.'],
  [/tarda en responder/, 'Cada segundo de espera aumenta la probabilidad de que el visitante se vaya.'],
  [/HTML de la página muy pesado/, 'La página tarda más en cargar, sobre todo con conexión móvil.'],
  [/Demasiados archivos JavaScript/, 'Ralentiza la carga y la respuesta de la web en móviles.'],
  [/teléfono no es clicable/, 'Quien os visita desde el móvil tiene que copiar el número a mano para llamar; muchos no lo harán.'],
  [/WhatsApp/, 'Perdéis a los clientes que prefieren escribir antes que llamar.'],
  [/formulario de contacto/, 'Quien no quiere llamar no tiene una forma rápida de pediros información.'],
  [/ninguna vía de contacto/, 'Un visitante interesado no tiene una forma directa de contactaros.'],
];

function detectSiteName(head, html, final) {
  const blocks = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const b of blocks) {
    try {
      const json = JSON.parse(b.replace(/^<script[^>]*>|<\/script>$/gi, ''));
      const nodes = [].concat(json['@graph'] || json);
      const org = nodes.find(n => n && n.name && /Organization|LocalBusiness|Store|Restaurant|Bakery|WebSite/i.test([].concat(n['@type']).join(' ')));
      if (org && typeof org.name === 'string') return { name: decode(org.name), source: 'schema' };
    } catch {}
  }
  const ogSite = (head.match(/<meta[^>]+property=["']og:site_name["'][^>]*>/i) || [])[0];
  const ogContent = ogSite && (ogSite.match(/content=["']([^"']+)["']/i) || [])[1];
  if (ogContent) return { name: decode(ogContent), source: 'og:site_name' };
  const host = final.hostname.replace(/^www\./, '').split('.')[0];
  const domainName = host.charAt(0).toUpperCase() + host.slice(1);
  return { name: domainName, source: 'dominio' };
}

// ---------- análisis ----------
async function runAudit(targetUrl) {
  const page = await safeFetch(targetUrl.href);

  if ([401, 403, 429, 503].includes(page.status)) {
    throw new AuditError('blocked', 'La web no permite realizar un análisis completo');
  }
  if (page.status >= 400) {
    throw new AuditError('http_error', `La web responde con un error HTTP ${page.status}.`);
  }
  const ctype = page.headers.get('content-type') || '';
  if (ctype && !/html/i.test(ctype)) {
    throw new AuditError('not_html', 'La dirección no devuelve una página web (HTML).');
  }

  const final = new URL(page.url);
  const raw = page.body;
  const html = stripComments(raw);
  const head = (html.match(/<head\b[\s\S]*?<\/head>/i) || [html])[0];
  const bodyHtml = (html.match(/<body\b[\s\S]*<\/body>/i) || [html])[0];
  const metas = tags(head, 'meta');
  const links = tags(head, 'link');
  const anchors = tags(bodyHtml, 'a');
  const imgs = tags(bodyHtml, 'img');
  const scripts = tags(html, 'script');
  const issues = [];
  const passed = [];

  const add = (cat, severity, title, evidence, recommendation, source = 'detectado') =>
    issues.push({ category: cat, severity, title, evidence, recommendation, source, weight: SEVERITY_WEIGHT[severity] });
  const ok = (cat, title, evidence, source = 'detectado') => passed.push({ category: cat, title, evidence, source });

  // ===== SEGURIDAD (amenazas observables públicamente) =====
  if (final.protocol !== 'https:') {
    add('security', 'critical', 'La web no usa HTTPS',
      `La página final se sirve en ${final.href}`,
      'Instalar un certificado SSL y forzar HTTPS en todo el sitio.', 'medido');
  } else {
    ok('security', 'Conexión HTTPS activa', final.origin, 'medido');
    // Redirección HTTP -> HTTPS
    try {
      const httpUrl = new URL(final.href); httpUrl.protocol = 'http:';
      const r = await safeFetch(httpUrl.href, { followRedirects: false, readBody: false, timeout: 6000 });
      const loc = r.headers.get('location') || '';
      if (r.status >= 300 && r.status < 400 && /^https:/i.test(new URL(loc, httpUrl).href)) {
        ok('security', 'HTTP redirige a HTTPS', `${r.status} → ${new URL(loc, httpUrl).href}`, 'medido');
      } else if (r.status < 400) {
        add('security', 'high', 'La versión HTTP no redirige a HTTPS',
          `http://${final.host} responde ${r.status} sin redirigir`,
          'Configurar una redirección 301 permanente de HTTP a HTTPS.', 'medido');
      }
    } catch { /* puerto 80 cerrado: no se puede comprobar, no se penaliza */ }

    const hsts = page.headers.get('strict-transport-security');
    if (!hsts) add('security', 'medium', 'Falta la cabecera HSTS',
      'La respuesta no incluye Strict-Transport-Security',
      'Añadir HSTS para impedir que un atacante degrade la conexión a HTTP.', 'medido');
    else ok('security', 'HSTS configurado', short(hsts), 'medido');

    // Contenido mixto
    const mixed = new Set();
    for (const t of [...scripts.map(s => s.src), ...tags(html, 'iframe').map(s => s.src), ...imgs.map(i => i.src),
      ...links.filter(l => /stylesheet/i.test(l.rel || '')).map(l => l.href)]) {
      if (t && /^http:\/\//i.test(t.trim())) mixed.add(t.trim());
    }
    if (mixed.size) add('security', 'high', 'Contenido mixto (recursos inseguros por HTTP)',
      `${mixed.size} recurso(s), p. ej. ${short([...mixed][0], 70)}`,
      'Cargar todos los recursos por HTTPS; el navegador puede bloquearlos o mostrar avisos de seguridad.');
  }

  const csp = page.headers.get('content-security-policy');
  const xfo = page.headers.get('x-frame-options');
  if (!xfo && !(csp && /frame-ancestors/i.test(csp))) add('security', 'medium', 'La web puede incrustarse en otras páginas (clickjacking)',
    'No hay X-Frame-Options ni frame-ancestors en la CSP',
    'Añadir X-Frame-Options: SAMEORIGIN o la directiva frame-ancestors.', 'medido');
  if (!csp) add('security', 'low', 'Sin Content-Security-Policy',
    'La respuesta no incluye la cabecera Content-Security-Policy',
    'Definir una CSP reduce el impacto de inyecciones de código (XSS).', 'medido');
  if (!page.headers.get('x-content-type-options')) add('security', 'low', 'Falta X-Content-Type-Options',
    'Cabecera ausente en la respuesta', 'Añadir X-Content-Type-Options: nosniff.', 'medido');

  const exposed = [];
  const server = page.headers.get('server'); const powered = page.headers.get('x-powered-by');
  if (server && /\d/.test(server)) exposed.push(`Server: ${server}`);
  if (powered) exposed.push(`X-Powered-By: ${powered}`);
  const gen = meta(metas, 'name', 'generator');
  if (gen && /\d/.test(gen.content || '')) exposed.push(`generator: ${gen.content}`);
  if (exposed.length) add('security', 'medium', 'La web muestra públicamente versiones de su software',
    short(exposed.join(' · '), 120),
    'Ocultar las versiones y mantener el software actualizado: facilita a atacantes buscar fallos conocidos. (No implica que la web sea vulnerable.)');

  // ===== SEO =====
  const title = inner(head, 'title')[0] || '';
  if (!title) add('seo', 'critical', 'La página no tiene título (title)', 'Etiqueta <title> ausente o vacía',
    'Escribir un título único de 30–60 caracteres con el servicio principal y la marca.');
  else if (title.length < 15) add('seo', 'medium', 'Título demasiado corto', `"${title}" (${title.length} caracteres)`,
    'Ampliar el título con el servicio principal, la ubicación si aplica y la marca.');
  else if (title.length > 65) add('seo', 'low', 'Título demasiado largo', `${title.length} caracteres: "${short(title, 70)}"`,
    'Reducirlo a unos 60 caracteres para que Google no lo corte.');
  else ok('seo', 'Título correcto', `"${title}"`);

  const desc = decode((meta(metas, 'name', 'description') || {}).content);
  if (!desc) add('seo', 'high', 'Falta la meta description', 'No existe <meta name="description">',
    'Redactar una descripción de 120–155 caracteres que invite a hacer clic desde Google.');
  else if (/prestashop|just another wordpress|shop powered by|default description/i.test(desc)) add('seo', 'critical', 'La meta description es un texto por defecto del CMS',
    `"${short(desc, 100)}"`, 'Sustituirla por una descripción real del negocio.');
  else if (desc.length < 50 || desc.length > 170) add('seo', 'low', 'Meta description con longitud poco eficaz', `${desc.length} caracteres`,
    'Ajustarla a 120–155 caracteres.');
  else ok('seo', 'Meta description presente', `"${short(desc, 90)}"`);

  const h1s = inner(bodyHtml, 'h1').filter(Boolean);
  if (!h1s.length) add('seo', 'high', 'No hay encabezado principal H1', 'La página no contiene ningún <h1> con texto',
    'Añadir un único H1 que diga claramente qué ofrece la web.');
  else if (h1s.length > 1) add('seo', 'low', `Hay ${h1s.length} encabezados H1`, h1s.slice(0, 3).map(h => `"${short(h, 30)}"`).join(', '),
    'Dejar un único H1 y usar H2/H3 para el resto de secciones.');
  else ok('seo', 'Un H1 claro', `"${short(h1s[0], 80)}"`);

  const robotsMeta = (meta(metas, 'name', 'robots') || {}).content || '';
  const xRobots = page.headers.get('x-robots-tag') || '';
  if (/noindex/i.test(robotsMeta + ' ' + xRobots)) add('seo', 'critical', 'La página está bloqueada para Google (noindex)',
    `robots: "${short(robotsMeta || xRobots, 60)}"`, 'Eliminar noindex si la página debe aparecer en buscadores.', 'medido');

  const canonical = links.find(l => /(^|\s)canonical(\s|$)/i.test(l.rel || ''));
  if (!canonical) add('seo', 'low', 'Sin URL canónica', 'No existe <link rel="canonical">',
    'Indicar la URL canónica para evitar contenido duplicado.');
  else ok('seo', 'URL canónica definida', short(canonical.href || '', 80));

  if (!/application\/ld\+json/i.test(html)) add('seo', 'medium', 'Sin datos estructurados (Schema.org)',
    'No se encontró ningún bloque JSON-LD',
    'Añadir Schema (Organization o LocalBusiness) para mejorar cómo aparece la empresa en Google.');
  else ok('seo', 'Datos estructurados presentes', 'Bloque JSON-LD detectado');

  if (!meta(metas, 'property', 'og:title') || !meta(metas, 'property', 'og:image')) add('seo', 'low', 'Open Graph incompleto',
    'Falta og:title u og:image', 'Completar Open Graph para que los enlaces compartidos en redes y WhatsApp muestren imagen y título.');

  // robots.txt y sitemap
  let sitemapFound = false; let robotsTxt = null;
  try {
    const r = await safeFetch(new URL('/robots.txt', final).href, { timeout: 6000 });
    if (r.status === 200 && !/<html/i.test(r.body.slice(0, 300))) {
      robotsTxt = r.body;
      if (/^\s*disallow:\s*\/\s*$/im.test(r.body) && /^\s*user-agent:\s*\*\s*$/im.test(r.body)) {
        add('seo', 'critical', 'robots.txt podría bloquear todo el sitio', 'Contiene "User-agent: *" y "Disallow: /"',
          'Revisar robots.txt: tal como está, puede impedir que Google rastree la web.', 'medido');
      }
      if (/^\s*sitemap:/im.test(r.body)) sitemapFound = true;
    }
  } catch {}
  if (!sitemapFound) {
    try {
      const s = await safeFetch(new URL('/sitemap.xml', final).href, { timeout: 6000 });
      if (s.status === 200 && /<(urlset|sitemapindex)/i.test(s.body.slice(0, 2000))) sitemapFound = true;
    } catch {}
  }
  if (!sitemapFound) add('seo', 'medium', 'No se ha encontrado sitemap.xml',
    'Ni /sitemap.xml ni una línea Sitemap en robots.txt', 'Generar un sitemap y enviarlo a Google Search Console.', 'medido');
  else ok('seo', 'Sitemap disponible', robotsTxt && /sitemap:/i.test(robotsTxt) ? 'Declarado en robots.txt' : '/sitemap.xml', 'medido');

  // ===== MÓVIL Y ACCESIBILIDAD =====
  const viewport = meta(metas, 'name', 'viewport');
  if (!viewport) add('mobile', 'critical', 'La web no está preparada para móvil (sin viewport)',
    'No existe <meta name="viewport">', 'Añadir el meta viewport y adaptar el diseño a pantallas móviles.');
  else if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport.content || '')) add('mobile', 'medium', 'Se impide hacer zoom en móvil',
    `viewport: "${short(viewport.content || '', 80)}"`, 'Permitir el zoom; es un requisito de accesibilidad (WCAG 1.4.4).');
  else ok('mobile', 'Viewport móvil correcto', short(viewport.content || '', 80));

  const htmlTag = tags(html, 'html')[0] || {};
  if (!htmlTag.lang) add('mobile', 'medium', 'No se indica el idioma de la página', 'Falta el atributo lang en <html>',
    'Añadir lang="es" para lectores de pantalla y buscadores (WCAG 3.1.1).');

  const contentImgs = imgs.filter(i => i.src || i['data-src']);
  const noAlt = contentImgs.filter(i => !('alt' in i));
  if (contentImgs.length && noAlt.length) {
    const pct = Math.round(noAlt.length / contentImgs.length * 100);
    add('mobile', pct > 40 ? 'high' : 'medium', 'Imágenes sin texto alternativo',
      `${noAlt.length} de ${contentImgs.length} imágenes sin atributo alt (${pct}%)`,
      'Describir cada imagen con alt: mejora la accesibilidad y el SEO de imágenes.');
  } else if (contentImgs.length) ok('mobile', 'Todas las imágenes tienen alt', `${contentImgs.length} imágenes revisadas`);

  // formularios sin etiquetas
  const inputs = tags(bodyHtml, 'input').filter(i => !/hidden|submit|button|image|reset|checkbox|radio/i.test(i.type || 'text'));
  const labelFor = new Set(tags(bodyHtml, 'label').map(l => l.for).filter(Boolean));
  const unlabeled = inputs.filter(i => !(i.id && labelFor.has(i.id)) && !i['aria-label'] && !i['aria-labelledby'] && !i.title);
  if (unlabeled.length) add('mobile', 'low', 'Campos de formulario sin etiqueta accesible',
    `${unlabeled.length} campo(s) sin <label>, aria-label ni title`, 'Asociar una etiqueta a cada campo (WCAG 1.3.1 / 4.1.2).');

  const kb = Math.round(page.bytes / 1024);
  if (page.headersMs > 1800) add('mobile', 'medium', 'El servidor tarda en responder',
    `${page.headersMs} ms hasta recibir la respuesta (medido desde nuestro servidor)`,
    'Revisar hosting, caché y base de datos. Referencia recomendada: menos de 800 ms.', 'medido');
  if (kb > 500) add('mobile', 'low', 'HTML de la página muy pesado', `${kb} KB solo de HTML`,
    'Reducir código incrustado y elementos innecesarios.', 'medido');
  const extScripts = scripts.filter(s => s.src).length;
  if (extScripts > 25) add('mobile', 'medium', 'Demasiados archivos JavaScript', `${extScripts} scripts externos en la página`,
    'Agrupar, eliminar librerías no usadas y cargar el resto de forma diferida.');

  // ===== CONVERSIÓN =====
  const hrefs = anchors.map(a => (a.href || '').trim());
  const tel = hrefs.some(h => /^tel:/i.test(h));
  const wa = hrefs.some(h => /wa\.me\/|api\.whatsapp\.com|web\.whatsapp\.com/i.test(h));
  const mail = hrefs.some(h => /^mailto:/i.test(h));
  const forms = (bodyHtml.match(/<form\b/gi) || []).length;
  const contactInputs = inputs.filter(i => /email|tel/i.test(i.type || '') || /mail|phone|tel|nombre|name/i.test(i.name || '')).length;

  if (tel) ok('conversion', 'Teléfono clicable', 'Enlace tel: detectado'); else add('conversion', 'medium', 'El teléfono no es clicable',
    'No hay enlaces tel: en la página', 'Convertir el teléfono en enlace para llamar con un toque desde el móvil.');
  if (wa) ok('conversion', 'Enlace a WhatsApp', 'Enlace wa.me / WhatsApp detectado'); else add('conversion', 'low', 'Sin acceso directo a WhatsApp',
    'No se detectan enlaces a WhatsApp', 'Añadir un botón de WhatsApp: muchos clientes prefieren escribir antes que llamar.');
  if (!forms || !contactInputs) add('conversion', mail || tel ? 'medium' : 'high', 'Sin formulario de contacto en la portada',
    forms ? `${forms} formulario(s), ninguno con campos de contacto` : 'No hay formularios en la página',
    'Añadir un formulario corto (nombre, teléfono o email, mensaje) visible en la portada.');
  else ok('conversion', 'Formulario de contacto', `${forms} formulario(s) con campos de contacto`);
  if (!tel && !wa && !mail && !contactInputs) add('conversion', 'critical', 'No hay ninguna vía de contacto directa',
    'Sin teléfono clicable, WhatsApp, email ni formulario', 'Incluir al menos teléfono clicable y un formulario visibles.');

  for (const i of issues) { const m = IMPACT.find(([re]) => re.test(i.title)); i.impact = m ? m[1] : ''; }
  const site = detectSiteName(head, html, final);

  // ---------- scoring transparente ----------
  const categories = Object.entries(CATEGORIES).map(([id, label]) => {
    const list = issues.filter(i => i.category === id);
    const penalty = list.reduce((s, i) => s + i.weight, 0);
    return {
      id, label,
      score: Math.max(0, 100 - penalty),
      errors: list.filter(i => ['critical', 'high'].includes(i.severity)).length,
      warnings: list.filter(i => ['medium', 'low'].includes(i.severity)).length,
      passed: passed.filter(p => p.category === id).length,
    };
  });
  const score = Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    url: final.href,
    siteName: site.name,
    siteNameSource: site.source,
    requestedUrl: targetUrl.href,
    analyzedAt: new Date().toISOString(),
    score,
    scoring: 'Cada categoría parte de 100 y resta por problema: crítico 30, alto 15, medio 8, bajo 3.',
    http: { status: page.status, redirects: page.redirects.length, responseMs: page.headersMs, htmlKB: kb, truncated: page.truncated },
    categories,
    issues,
    passed,
    counts: {
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
    },
    scope: 'Análisis automático de la página indicada (no del sitio completo). El informe completo incluye revisión manual.',
  };
}

module.exports = { runAudit };
