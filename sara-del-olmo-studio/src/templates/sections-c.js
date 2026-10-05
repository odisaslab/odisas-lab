/** Actos 13-19 y piezas fijas: vales, eventos, Instagram, promociones, FAQ, contacto, final, navegación. */
import { CONFIG, PENDING } from '../data/config.js';
import { COPY } from '../data/copy.js';
import { SERVICES, svcById } from '../data/services.js';
import { CARD_STYLES, VOUCHER_AMOUNTS, VOUCHER_LIMITS } from '../data/card-styles.js';
import { FAQS } from '../data/faqs.js';
import { PROMOS } from '../data/promos.js';
import { INSTAGRAM_POSTS, INSTAGRAM_SLOTS } from '../data/media.js';
import { DEFAULT_LOOK } from '../data/look.js';
import { CATS } from '../data/services.js';
import { handWorldMarkup } from './media.js';
import { svgSprite } from '../js/art/icons.js';
import { esc, euro, priceHtml, pricePlain, words, kicker, bookAttrs, waAttrs, telAttrs, nailBtn, hoursHtml, phoneHtml } from './util.js';
import { picture, placeholder, hasPhoto } from './media.js';

/* ───────────────────────────── 13 · VALES ───────────────────────────── */
export function gift() {
  const c = COPY.gift;
  const st = CARD_STYLES[0];
  const groups = Object.entries(CATS)
    .map(([k, cat]) => `<optgroup label="${esc(cat.label)}">${SERVICES.filter((s) => s.cat === k).map((s) => `<option value="${s.id}">${esc(s.name)} (${pricePlain(s)})</option>`).join('')}</optgroup>`)
    .join('');
  return `<section class="gift" id="vales" data-theme="light" data-gift aria-labelledby="h-vales">
  <div class="wrap">
    <div class="sec-head">
      <div>${kicker(c.kicker)}<h2 class="h2 h2--xl" id="h-vales" data-split>${words(c.title)}</h2></div>
      <div><p class="lead" data-rv>${esc(c.lead)}</p><p class="gift__entry"><button type="button" class="btn btn--ghost btn--sm" data-gift-entry>${esc(c.entry)}</button></p></div>
    </div>
    <div class="gift__grid">
      <div class="gift__stage" data-stage>
        <div class="gcard" data-card aria-hidden="true" style="--gc-bg:${st.bg};--gc-ink:${st.ink};--gc-accent:${st.accent}">
          <div class="gcard__sheen"></div><div class="gcard__glare"></div>
          <svg class="gcard__nail"><use href="#i-nail"/></svg>
          <div class="gcard__top"><span class="gcard__brand">Sara del Olmo<small>Studio</small></span><span class="gcard__kind">Vale regalo</span></div>
          <p class="gcard__value" data-c-value>${VOUCHER_AMOUNTS[1]} €</p>
          <div class="gcard__bottom"><em data-c-msg>${esc(c.placeholderMsg)}</em>
            <div class="gcard__ppl"><div><span>Para</span><b data-c-to>…</b></div><div><span>De</span><b data-c-from>…</b></div></div></div>
        </div>
      </div>
      <form class="gift__form" data-gift-form novalidate>
        <fieldset class="seg"><legend class="sr-only">¿Qué quieres regalar?</legend>
          <label><input type="radio" name="gmode" value="importe" checked><span>Un importe</span></label>
          <label><input type="radio" name="gmode" value="servicio"><span>Un servicio</span></label></fieldset>
        <fieldset class="amounts-set" data-amount-set><legend>Importe</legend>
          <div class="amounts">${VOUCHER_AMOUNTS.map((a, i) => `<label class="amount"><input type="radio" name="gamount" value="${a}"${i === 1 ? ' checked' : ''}><span>${a} €</span></label>`).join('')}<label class="amount"><input type="radio" name="gamount" value="otro"><span>Otro</span></label></div>
          <label for="gOther" class="sr-only">Otro importe en euros</label>
          <input class="input input--short" type="number" id="gOther" min="${VOUCHER_LIMITS.min}" max="${VOUCHER_LIMITS.max}" step="5" inputmode="numeric" placeholder="Importe en €" hidden></fieldset>
        <div class="field" data-service-field hidden><label for="gService">Servicio</label><select id="gService" class="input">${groups}</select></div>
        <div class="field-row">
          <div class="field"><label for="gTo">Para</label><input id="gTo" class="input" maxlength="24" placeholder="Quien lo recibe" autocomplete="off"></div>
          <div class="field"><label for="gFrom">De</label><input id="gFrom" class="input" maxlength="24" placeholder="Tu nombre" autocomplete="given-name"></div>
        </div>
        <div class="field"><label for="gMsg">Dedicatoria <span class="opt-note">(opcional)</span></label><textarea id="gMsg" class="input" maxlength="90" rows="2" placeholder="${esc(c.placeholderMsg)}"></textarea></div>
        <fieldset class="styles-set"><legend>Diseño de la tarjeta</legend>
          <div class="styles">${CARD_STYLES.map((s, i) => `<label class="style"><input type="radio" name="gstyle" value="${s.id}"${i === 0 ? ' checked' : ''} aria-label="${esc(s.name)}"><span style="--sw:${s.swatch}"></span><em>${esc(s.name)}</em></label>`).join('')}</div></fieldset>
        <div class="btn-row"><button class="btn-nail btn-nail--lg" type="submit"><span class="btn-nail__gloss" aria-hidden="true"></span><span class="btn-nail__t">${esc(c.cta)}</span><svg class="btn-nail__i" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg></button></div>
        <p class="fine">${CONFIG.voucherUrl ? 'Te llevamos a la tienda de vales para completar la compra.' : 'Al pulsar se abre WhatsApp con tu vale ya preparado para que el estudio te confirme el pago y la entrega.'}</p>
      </form>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 14 · EVENTOS ───────────────────────────── */
const OCC_ICON = {
  Bodas: '<path d="M32 22 L26 14 H38 Z M20 40 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M26 14 L32 22 L38 14 M32 22 V28"/>',
  Despedidas: '<path d="M22 8 H34 L32 28 C32 32 30 34 28 34 C26 34 24 32 24 28 Z M28 34 V52 M20 52 H36 M40 14 l3 -4 M44 20 l5 -1 M42 8 l1 -5"/>',
  Cumpleaños: '<path d="M14 54 V36 H50 V54 Z M14 44 C22 50 28 38 36 46 S46 44 50 42 M32 36 V24 M32 24 C28 20 32 14 32 12 C32 14 36 20 32 24 Z"/>',
  Grupos: '<circle cx="20" cy="22" r="6"/><circle cx="44" cy="22" r="6"/><circle cx="32" cy="18" r="7"/><path d="M8 50 C8 38 32 36 32 36 C32 36 56 38 56 50 M20 50 C20 42 32 40 32 40"/>',
};

export function events() {
  const c = COPY.events;
  return `<section class="events" id="eventos" data-theme="cherry" data-events aria-labelledby="h-eventos">
  <div class="wrap">
    ${kicker(c.kicker)}
    <h2 class="mega" id="h-eventos" data-mega><span class="mega__in">${esc(c.title)}</span></h2>
    <div class="events__grid">
      <p class="lead" data-rv>${esc(c.lead)}</p>
      <form class="events__form" data-events-form novalidate>
        <fieldset class="occ"><legend class="sr-only">Tipo de plan</legend>
          ${c.occasions.map((o, i) => `<label class="occ__i"><input type="radio" name="occ" value="${esc(o)}"${i === 0 ? ' checked' : ''}><span><svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${OCC_ICON[o] || ''}</svg>${esc(o)}</span></label>`).join('')}
        </fieldset>
        <div class="field-row">
          <div class="field"><label for="evPeople">Somos <span class="opt-note">(opcional)</span></label><input id="evPeople" class="input input--inv" type="number" min="1" max="60" inputmode="numeric" placeholder="Nº de personas"></div>
          <div class="field"><label for="evDate">Fecha aproximada <span class="opt-note">(opcional)</span></label><input id="evDate" class="input input--inv" maxlength="40" placeholder="Ej.: sábado 14 de junio"></div>
        </div>
        <div class="btn-row"><a class="btn-nail btn-nail--lg btn-nail--light" data-events-wa ${waAttrs('eventos', 'Hola, me gustaría organizar una cita para un evento.')}><span class="btn-nail__gloss" aria-hidden="true"></span><span class="btn-nail__t">${esc(c.cta)}</span><svg class="btn-nail__i" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg></a></div>
      </form>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 15 · INSTAGRAM ───────────────────────────── */
export function instagram() {
  const c = COPY.instagram;
  const tiles = Array.from({ length: INSTAGRAM_SLOTS }, (_, i) => {
    const p = INSTAGRAM_POSTS[i];
    if (p && hasPhoto(p.file)) {
      return `<a class="tile" href="${esc(p.href || CONFIG.instagram)}" target="_blank" rel="noopener" data-track="instagram_click" data-loc="instagram">${picture(p.file, p.alt, { sizes: '(min-width: 900px) 20vw, 45vw' })}</a>`;
    }
    const tints = [['#C98F8A', '#7A1027'], ['#E4C3BC', '#A86C6A'], ['#9B7690', '#46101D'], ['#D7A49B', '#5B3426'], ['#BFB6C4', '#2B2438'], ['#E6B8AE', '#B01329']];
    return `<div class="tile tile--ph">${placeholder('Trabajo del estudio', tints[i % tints.length], { note: '[ FOTO PENDIENTE ]' })}</div>`;
  }).join('');
  return `<section class="insta" id="instagram" data-theme="light" aria-labelledby="h-instagram">
  <div class="wrap">
    <div class="sec-head">
      <div>${kicker(c.kicker)}<h2 class="h2 h2--xl" id="h-instagram" data-split>${words(c.title)}</h2></div>
      <p class="lead" data-rv>${esc(c.lead)}</p>
    </div>
    <div class="insta__grid" data-rv>${tiles}</div>
    <p class="insta__cta"><a class="btn-nail btn-nail--lg" href="${esc(CONFIG.instagram)}" target="_blank" rel="noopener" data-track="instagram_click" data-loc="instagram"><span class="btn-nail__gloss" aria-hidden="true"></span><svg class="btn-nail__ig" aria-hidden="true" focusable="false"><use href="#i-ig"/></svg><span class="btn-nail__t">${esc(CONFIG.instagramHandle.toUpperCase())}</span></a></p>
  </div>
</section>`;
}

/* ───────────────────────────── PROMOCIONES (solo si hay) ───────────────────────────── */
export function promos() {
  if (!PROMOS.length) return '';
  return `<section class="promos" id="promociones" data-theme="light" aria-labelledby="h-promos">
  <div class="wrap"><h2 class="h2" id="h-promos">Promociones</h2>
    <div class="promos__grid">${PROMOS.map((p) => `<article class="promo"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><p><b>${esc(p.price)}</b>${p.until ? ` hasta el ${esc(p.until)}` : ''}</p><a class="btn btn--solid btn--sm" ${bookAttrs('promociones', p.serviceId)}>Pedir cita</a></article>`).join('')}</div></div>
</section>`;
}

/* ───────────────────────────── FAQ ───────────────────────────── */
export function faq() {
  return `<section class="faq" id="preguntas" data-theme="light" aria-labelledby="h-faq">
  <div class="wrap faq__grid">
    <div>${kicker('Preguntas frecuentes')}<h2 class="h2" id="h-faq" data-split>${words('Antes de reservar')}</h2><p class="lead">¿Te queda alguna duda? Escríbenos y te respondemos.</p></div>
    <div class="faq__list">${FAQS.map((f) => `<details class="qa"><summary>${esc(f.q)}<span class="qa__pm" aria-hidden="true"></span></summary><div class="qa__a"><p>${esc(f.a)}</p></div></details>`).join('')}</div>
  </div>
</section>`;
}

/* ───────────────────────────── CONTACTO ───────────────────────────── */
export function contact() {
  const c = COPY.contact;
  const a = CONFIG.address;
  const waLine = CONFIG.whatsapp ? `<a ${waAttrs('contacto', 'Hola, tengo una consulta:')}>${esc(CONFIG.phoneDisplay || CONFIG.whatsapp)}</a>` : `<span class="pending">${PENDING}</span>`;
  return `<section class="contact" id="contacto" data-theme="light" data-contact aria-labelledby="h-contacto">
  <div class="wrap">
    <div class="sec-head">
      <div>${kicker(c.kicker)}<h2 class="h2 h2--xl" id="h-contacto" data-split>${words(c.title)}</h2></div>
      <p class="lead" data-rv>${esc(c.lead)} Estamos en ${esc(a.city)}.</p>
    </div>
    <div class="contact__grid">
      <div>
        <dl class="info">
          <dt>Dirección</dt><dd><address>${esc(a.street)}<br>${esc(a.postalCode)} ${esc(a.city)}</address></dd>
          <dt>Horario</dt><dd>${hoursHtml()}</dd>
          <dt>Citas</dt><dd>Solo con cita previa<br>Reserva online a cualquier hora</dd>
          <dt>Teléfono</dt><dd>${phoneHtml()}</dd>
          <dt>WhatsApp</dt><dd>${waLine}</dd>
          <dt>Instagram</dt><dd><a href="${esc(CONFIG.instagram)}" target="_blank" rel="noopener" data-track="instagram_click" data-loc="contacto">${esc(CONFIG.instagramHandle)}</a></dd>
        </dl>
        <div class="btn-row"><a class="btn btn--solid" ${bookAttrs('contacto')}>Pedir cita</a><a class="btn btn--ghost" ${waAttrs('contacto', 'Hola, tengo una consulta:')}>WhatsApp</a></div>
        <a class="mapcard" href="${esc(CONFIG.mapsUrl)}" target="_blank" rel="noopener" aria-label="Abrir la ubicación en Google Maps" data-track="maps_click" data-loc="contacto">
          <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <path class="m-st" stroke-width="14" d="M-20 60 L420 90"/><path class="m-st" stroke-width="10" d="M80 -20 L120 270"/><path class="m-st" stroke-width="10" d="M300 -20 L270 270"/>
            <path class="m-st" stroke-width="8" d="M-20 200 L420 180"/><path class="m-st" stroke-width="6" d="M190 90 L200 185"/><path class="m-main" stroke-width="16" d="M-20 138 C120 128 260 146 420 132"/>
            <text class="m-lb" x="28" y="122">C. Madrid</text><circle class="m-pulse" cx="214" cy="137" r="12"/>
            <path class="m-pin" d="M214 104 c-11 0-19 8-19 18 0 13 19 29 19 29s19-16 19-29c0-10-8-18-19-18z"/><circle cx="214" cy="122" r="6" fill="var(--surface)"/>
          </svg><span class="mapcard__cta">Cómo llegar</span></a>
      </div>
      <form class="cform" data-cform novalidate>
        <h3>Escríbenos</h3>
        <div class="field-row">
          <div class="field"><label for="cName">Nombre</label><input id="cName" class="input" name="nombre" autocomplete="name" required aria-describedby="cNameErr"><span class="err" id="cNameErr"></span></div>
          <div class="field"><label for="cPhone">Teléfono</label><input id="cPhone" class="input" name="telefono" type="tel" autocomplete="tel" inputmode="tel" required aria-describedby="cPhoneErr"><span class="err" id="cPhoneErr"></span></div>
        </div>
        <div class="field"><label for="cService">Te interesa</label><select id="cService" class="input" name="servicio"><option>Manos</option><option>Pies</option><option>Cejas</option><option>Piercing y joyería</option><option>Vale regalo</option><option>Evento o grupo</option><option>Otra consulta</option></select></div>
        <div class="field"><label for="cMsg">Mensaje</label><textarea id="cMsg" class="input" name="mensaje" rows="4" required aria-describedby="cMsgErr"></textarea><span class="err" id="cMsgErr"></span></div>
        <label class="check"><input type="checkbox" id="cPriv" required aria-describedby="cPrivErr"><span>He leído y acepto la <a href="/privacidad.html">política de privacidad</a>.</span></label>
        <span class="err" id="cPrivErr"></span>
        <div><button class="btn btn--solid" type="submit">Enviar mensaje</button></div>
      </form>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 16 · FINAL · RESERVA ───────────────────────────── */
export function final() {
  const c = COPY.final;
  return `<section class="scene scene--final" id="reserva" data-scene="final" data-theme="dark" style="--len:4.6" aria-labelledby="h-final">
  <div class="scene__stage">
    <div class="final__bg" aria-hidden="true"></div>
    ${handWorldMarkup({ lazy: true, cls: 'final__pw' })}
    <div class="final__shade" aria-hidden="true"></div>
    <div class="final__copy">
      <h2 class="mega final__t" id="h-final">${words(c.title)}</h2>
      <p class="final__lock"><span class="lockup__name">Sara del Olmo</span><span class="lockup__sub">Studio</span><span class="final__place">${esc(c.place)}</span></p>
      <div class="final__cta">${nailBtn({ label: c.cta, attrs: bookAttrs('final'), cls: 'btn-nail--xl' })}</div>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── FOOTER ───────────────────────────── */
export function footer() {
  const a = CONFIG.address;
  return `<footer class="footer" data-theme="light">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand"><span class="logo__name">Sara del Olmo</span><span class="logo__sub">Studio</span>
        <p>Estudio de uñas, micropigmentación de cejas y piercing en ${esc(a.city)}.</p>
        <a class="btn btn--solid" ${bookAttrs('footer')}>Pedir cita</a></div>
      <div><h2 class="footer__h">Servicios</h2><ul>
        <li><a href="#tarifas" data-cat-link="manos">Manicura y uñas</a></li><li><a href="#tarifas" data-cat-link="pies">Pedicura</a></li>
        <li><a href="#tarifas" data-cat-link="cejas">Cejas</a></li><li><a href="#tarifas" data-cat-link="piercing">Piercing y joyería</a></li><li><a href="#tarifas">Tarifas</a></li></ul></div>
      <div><h2 class="footer__h">Estudio</h2><ul>
        <li><a href="#nosotras">Nosotras</a></li><li><a href="#vales">Vales regalo</a></li><li><a href="#eventos">Eventos</a></li><li><a href="#preguntas">Preguntas frecuentes</a></li><li><a href="#contacto">Contacto</a></li></ul></div>
      <div><h2 class="footer__h">Visítanos</h2><ul>
        <li><a href="${esc(CONFIG.mapsUrl)}" target="_blank" rel="noopener">${esc(a.street)}<br>${esc(a.postalCode)} ${esc(a.city)}</a></li>
        <li>${CONFIG.phone ? `<a ${telAttrs('footer')}>${esc(CONFIG.phoneDisplay || CONFIG.phone)}</a>` : `<span class="pending">Teléfono ${PENDING}</span>`}</li>
        <li><a href="${esc(CONFIG.instagram)}" target="_blank" rel="noopener" data-track="instagram_click" data-loc="footer">${esc(CONFIG.instagramHandle)}</a></li>
        ${CONFIG.facebookConfirmed ? `<li><a href="${esc(CONFIG.facebook)}" target="_blank" rel="noopener">Facebook</a></li>` : ''}</ul></div>
    </div>
    <div class="footer__bottom"><span>© ${new Date().getFullYear()} ${esc(CONFIG.name)}</span>
      <nav aria-label="Legal"><a href="/aviso-legal.html">Aviso legal</a><a href="/privacidad.html">Privacidad</a><a href="/cookies.html">Cookies</a></nav></div>
  </div>
</footer>`;
}

/* ───────────────────────────── NAVEGACIÓN Y PIEZAS FIJAS ───────────────────────────── */
export const NAV = [
  ['Servicios', '#servicios'],
  ['Tarifas', '#tarifas'],
  ['Nosotras', '#nosotras'],
  ['Galería', '#estudio'],
  ['Opiniones', '#opiniones'],
  ['Contacto', '#contacto'],
];
const MENU_EXTRA = [['Diseña tu look', '#disena'], ['Vales regalo', '#vales'], ['Eventos', '#eventos'], ['Instagram', '#instagram']];

export function header() {
  return `<header class="site-header" id="top" data-theme="dark">
  <div class="site-header__in">
    <a class="logo" href="#inicio" aria-label="Sara del Olmo Studio, ir al inicio"><span class="logo__name">Sara del Olmo</span><span class="logo__sub">Studio</span></a>
    <nav class="nav" aria-label="Principal"><ul>${NAV.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></nav>
    <a class="btn-nail btn-nail--sm header__cta" ${bookAttrs('header')}><span class="btn-nail__gloss" aria-hidden="true"></span><span class="btn-nail__t">Pedir cita</span></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu"><span class="burger__l" aria-hidden="true"></span><span class="burger__l" aria-hidden="true"></span><span class="sr-only">Abrir menú</span></button>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <nav aria-label="Menú móvil"><ul>${[...NAV, ...MENU_EXTRA].map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></nav>
  <div class="menu__foot">${nailBtn({ label: 'Pedir cita', attrs: bookAttrs('menu_movil'), cls: 'btn-nail--lg' })}<span>${esc(CONFIG.address.street)}, ${esc(CONFIG.address.city)}</span></div>
</div>`;
}

export function brush() {
  // Trazo de esmalte: línea ondulada vertical que se «pinta» con el scroll.
  const pts = [];
  for (let i = 0; i <= 20; i++) pts.push([10 + Math.sin(i * 0.9) * 2.2, i * 50]);
  let d = `M${pts[0][0]} 0`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    d += ` C${x0} ${y0 + 25} ${x1} ${y1 - 25} ${x1.toFixed(2)} ${y1}`;
  }
  return `<div class="brush" aria-hidden="true"><svg viewBox="0 0 20 1000" preserveAspectRatio="none" focusable="false">
    <path class="brush__track" d="${d}"/><path class="brush__ink" d="${d}" pathLength="1"/><path class="brush__shine" d="${d}" pathLength="1"/></svg><i class="brush__tip"></i></div>`;
}

export function bottomBar() {
  return `<nav class="dock" aria-label="Acciones rápidas"><div class="dock__in">
    <a class="dock__b" ${telAttrs('barra_movil')}><svg aria-hidden="true" focusable="false"><use href="#i-phone"/></svg>Llamar</a>
    <a class="dock__b" ${waAttrs('barra_movil', 'Hola, me gustaría pedir información.')}><svg aria-hidden="true" focusable="false"><use href="#i-wa"/></svg>WhatsApp</a>
    <a class="dock__b dock__b--main" ${bookAttrs('barra_movil')}>Pedir cita</a></div></nav>`;
}

export function drawer() {
  return `<dialog class="drawer" id="svc" aria-labelledby="dTitle">
  <div class="drawer__in">
    <button class="drawer__x" type="button" data-close aria-label="Cerrar"><svg aria-hidden="true" focusable="false"><use href="#i-close"/></svg></button>
    <p class="drawer__cat" id="dCat"></p>
    <h2 class="drawer__t" id="dTitle"></h2>
    <dl class="drawer__meta"><div><dt>Precio</dt><dd id="dPrice"></dd></div><div><dt>Duración</dt><dd id="dDur"></dd></div></dl>
    <p class="drawer__d" id="dDesc"></p>
    <ul class="drawer__incl" id="dIncl"></ul>
    <p class="drawer__note" id="dNote"></p>
    <div class="drawer__act"><a class="btn btn--solid" id="dBook" ${bookAttrs('ficha_servicio')}>Pedir cita</a><a class="btn btn--ghost" id="dWa" ${waAttrs('ficha_servicio', 'Hola, tengo una duda sobre un servicio.')}>Preguntar por WhatsApp</a></div>
  </div>
</dialog>`;
}

export const sprite = svgSprite;
