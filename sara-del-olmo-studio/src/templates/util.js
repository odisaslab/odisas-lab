/** Utilidades de plantilla (HTML como texto). Se ejecutan en Node durante el build. */
import { CONFIG, PENDING } from '../data/config.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

export const euro = (n) => `${Number(n).toLocaleString('es-ES')} €`;

/** «desde 25 €» con el «desde» en un <small> para poder estilarlo. */
export const priceHtml = (s) => (s.from ? '<small>desde</small> ' : '') + euro(s.price);
export const pricePlain = (s) => (s.from ? 'desde ' : '') + euro(s.price);

/** Divide un titular en palabras con máscara para revelarlas con scroll (el texto sigue siendo accesible). */
export const words = (text, cls = 'w') =>
  text
    .split(' ')
    .map((w, i) => `<span class="${cls}"><span style="--i:${i}">${esc(w)}</span></span>`)
    .join(' ');

export const kicker = (t) => `<p class="kicker">${esc(t)}</p>`;

/* ───── Enlaces con analítica ───── */
const loc = (l) => ` data-loc="${esc(l)}"`;
const svc = (id) => (id ? ` data-svc="${esc(id)}"` : '');

/** Atributos de un botón «Pedir cita» → Booksy. */
export const bookAttrs = (where, serviceId) =>
  `href="${esc(CONFIG.bookingUrl)}" target="_blank" rel="noopener" data-track="reservation_click"${loc(where)}${svc(serviceId)}`;

export const waHref = (text = '') => {
  const t = encodeURIComponent(text);
  return CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}${t ? `?text=${t}` : ''}` : `https://wa.me/?text=${t}`;
};
export const waAttrs = (where, text = 'Hola, me gustaría pedir información.') =>
  `href="${esc(waHref(text))}" target="_blank" rel="noopener" data-track="whatsapp_click"${loc(where)} data-wa-text="${esc(text)}"`;

export const telAttrs = (where) =>
  CONFIG.phone
    ? `href="tel:${esc(CONFIG.phone)}" data-track="phone_click"${loc(where)}`
    : `href="#contacto" data-track="phone_click"${loc(where)} data-pending="phone"`;

/** Horario legible. */
export const hoursHtml = () =>
  CONFIG.hours
    .map((h) => `${h.days ? esc(h.days) + '<br>' : ''}${esc(h.time)}${h.pending ? ' <span class="pending" title="Dato por confirmar con el estudio">[ días por confirmar ]</span>' : ''}`)
    .join('<br>');

export const phoneHtml = () =>
  CONFIG.phone
    ? `<a ${telAttrs('contacto')}>${esc(CONFIG.phoneDisplay || CONFIG.phone)}</a>`
    : `<span class="pending">${PENDING}</span>`;

/** Primera frase (para el «qué incluye» de una línea en la lista de tarifas). */
export const firstSentence = (t) => {
  const m = t.match(/^.*?\.(\s|$)/);
  let out = (m ? m[0] : t).trim();
  if (out.length > 150) out = out.slice(0, out.lastIndexOf(' ', 146)).replace(/[,:;]$/, '') + '…';
  return out;
};

/** Botón con forma de uña lacada (CTA que se integra con la escena). */
export const nailBtn = ({ label, attrs, where, cls = '', icon = true }) =>
  `<a class="btn-nail ${cls}" ${attrs}><span class="btn-nail__gloss" aria-hidden="true"></span><span class="btn-nail__t">${esc(label)}</span>${icon ? '<svg class="btn-nail__i" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>' : ''}</a>`;
