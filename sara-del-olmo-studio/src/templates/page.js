/** Composición de la página (HTML estático prerenderizado) y páginas auxiliares. */
import { CONFIG, PENDING } from '../data/config.js';
import { hero, manos, designer, pies, cejas, piercing, safety } from './sections-a.js';
import { services, prices, about, studio, reviews } from './sections-b.js';
import { gift, events, instagram, promos, faq, contact, final, footer, header, brush, bottomBar, drawer, sprite } from './sections-c.js';
import { headTags, gtmHead, gtmBody } from './seo.js';
import { esc } from './util.js';
import { SCENE_DIR, HAND } from '../data/scene-photos.js';

/** Script de arranque en <head>: decide el modo (cine / reducido) antes del primer pintado. */
const BOOT = `(function(d){var r=d.documentElement;r.className=r.className.replace('no-js','js');window.dataLayer=window.dataLayer||[];` +
  `var rm=false;try{rm=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}` +
  `r.classList.add(rm?'reduced':'cine');` +
  `setTimeout(function(){if(!window.__sdo&&r.classList.contains('cine')){r.classList.remove('cine');r.classList.add('reduced')}},9000)})(document)`;

export function renderPage(assets) {
  return `<!doctype html>
<html lang="es" class="no-js">
<head>
${headTags(assets)}
<link rel="preload" as="image" href="${SCENE_DIR}/${HAND.wide.file}.avif" type="image/avif" fetchpriority="high">
<script>${BOOT}</script>
${gtmHead()}
</head>
<body>
${gtmBody()}
${sprite()}
<a class="skip" href="#main">Saltar al contenido</a>
${header()}
${brush()}
<main id="main">
${hero()}
${manos()}
${designer()}
${pies()}
${cejas()}
${piercing()}
${safety()}
${services()}
${prices()}
${about()}
${studio()}
${reviews()}
${gift()}
${events()}
${instagram()}
${promos()}
${faq()}
${contact()}
${final()}
</main>
${footer()}
${bottomBar()}
${drawer()}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<noscript><style>.cine .scene{height:auto!important}</style></noscript>
<script type="module" src="${assets.js}"></script>
</body>
</html>
`;
}

/* ───────────── páginas auxiliares ───────────── */
function shell(title, body, assets) {
  return `<!doctype html>
<html lang="es" class="js reduced">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | ${esc(CONFIG.name)}</title><meta name="robots" content="noindex, follow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${assets.css}"></head>
<body class="page-simple"><a class="skip" href="#main">Saltar al contenido</a>
<header class="simple-head"><a class="logo" href="/" aria-label="Volver al inicio"><span class="logo__name">Sara del Olmo</span><span class="logo__sub">Studio</span></a></header>
<main id="main" class="simple wrap">${body}</main>
<footer class="simple-foot wrap"><a href="/">← Volver a la web</a></footer></body></html>`;
}

export function renderNotFound(assets) {
  return shell(
    'Página no encontrada',
    `<p class="kicker">404</p><h1 class="mega mega--md">Esta página no existe.</h1><p class="lead">Quizá se haya movido. Vuelve al inicio o pide tu cita directamente.</p>
<p class="btn-row"><a class="btn btn--ghost" href="/">Ir al inicio</a><a class="btn btn--solid" href="${esc(CONFIG.bookingUrl)}" target="_blank" rel="noopener">Pedir cita</a></p>`,
    assets,
  );
}

const LEGAL = {
  'aviso-legal': {
    title: 'Aviso legal',
    items: ['Titular del sitio web (nombre o razón social)', 'NIF/CIF', 'Domicilio', 'Correo electrónico de contacto', 'Datos de inscripción, si procede'],
  },
  privacidad: {
    title: 'Política de privacidad',
    items: ['Responsable del tratamiento (identidad y NIF)', 'Datos de contacto del responsable', 'Finalidades (formulario de contacto, vales regalo, gestión de citas)', 'Base jurídica y plazo de conservación', 'Destinatarios y encargados del tratamiento (p. ej. Booksy, servicio de formularios)', 'Derechos de las personas usuarias y cómo ejercerlos'],
  },
  cookies: {
    title: 'Política de cookies',
    items: ['Qué cookies o tecnologías se usan realmente (analítica con Google Tag Manager/GA4, si se activa)', 'Finalidad y duración de cada una', 'Cómo gestionar o retirar el consentimiento'],
  },
};

export function renderLegalPages(assets) {
  const out = {};
  for (const [slug, p] of Object.entries(LEGAL)) {
    out[`${slug}.html`] = shell(
      p.title,
      `<p class="kicker">Documento legal</p><h1 class="mega mega--md">${esc(p.title)}</h1>
<p class="lead">${PENDING} Este texto lo redacta o valida Sara con su asesoría. Faltan los datos del titular para publicarlo.</p>
<ul class="pending-list">${p.items.map((i) => `<li>${esc(i)} <span class="pending">${PENDING}</span></li>`).join('')}</ul>`,
      assets,
    );
  }
  return out;
}
