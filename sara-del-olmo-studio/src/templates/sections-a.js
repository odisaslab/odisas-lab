/** Actos 1-7 de la película: hero, manos, diseña tu look, pies, cejas, piercing, seguridad. */
import { CONFIG } from '../data/config.js';
import { COPY } from '../data/copy.js';
import { SERVICES, svcById, svcsByCat, starOf } from '../data/services.js';
import { COLORS, SHAPES, FINISHES, DEFAULT_LOOK } from '../data/look.js';
import { handMarkup, HAND_VIEWBOX } from '../js/art/hand.js';
import { nailMarkup, nailPath } from '../js/art/nail-markup.js';
import { feetMarkup, FEET_VIEWBOX } from '../js/art/feet.js';
import { browMarkup, BROW_VIEWBOX } from '../js/art/brow.js';
import { earMarkup, EAR_VIEWBOX } from '../js/art/ear.js';
import { SAFETY, TECHNIQUES } from '../js/art/icons.js';
import { esc, euro, priceHtml, words, kicker, bookAttrs, waAttrs, nailBtn } from './util.js';

/* ───────────────────────────── 1 · HERO ───────────────────────────── */
export function hero() {
  const c = COPY.hero;
  const r = CONFIG.rating;
  return `<section class="scene scene--hero" id="inicio" data-scene="hero" data-theme="dark" style="--len:6" aria-label="Inicio">
  <div class="scene__stage">
    <div class="hero__bg" aria-hidden="true"></div>
    <canvas class="hero__gl" aria-hidden="true"></canvas>
    <svg class="hero__svg" viewBox="${HAND_VIEWBOX}" role="img" aria-label="Mano con las uñas pintadas en rojo cereza, ilustración" preserveAspectRatio="xMidYMid meet">
      <g class="hero__cam">${handMarkup('hh', DEFAULT_LOOK, { skin: CONFIG.skinTone })}</g>
    </svg>
    <div class="hero__copy">
      <p class="lockup"><span class="lockup__name">Sara del Olmo</span><span class="lockup__sub">Studio</span></p>
      <h1 class="hero__title"><span class="sr-only">Sara del Olmo Studio: uñas, manicura, pedicura, cejas y piercing en Humanes de Madrid. </span>${c.titleLines.map((l) => `<span class="hl" aria-hidden="true"><span>${esc(l)}</span></span>`).join('')}</h1>
      <p class="hero__place"><span class="hero__rule" aria-hidden="true"></span>${esc(c.place)}<span class="hero__tag">${esc(c.tagline)}</span></p>
      <div class="hero__cta">${nailBtn({ label: c.cta, attrs: bookAttrs('hero'), cls: 'btn-nail--lg' })}
        <p class="hero__proof"><svg aria-hidden="true" focusable="false"><use href="#i-star"/></svg><span><strong>${esc(r.value.toLocaleString('es-ES', { minimumFractionDigits: 1 }))}</strong> · ${r.count} reseñas en ${esc(r.source)}</span></p></div>
    </div>
    <div class="hero__caps" aria-hidden="true">${c.captions.map((x, i) => `<p class="hero__cap" data-i="${i}">${esc(x.text)}</p>`).join('')}</div>
    <p class="hero__hint" aria-hidden="true"><span>${esc(c.scroll)}</span><i></i></p>
    <div class="hero__iris" aria-hidden="true"></div>
  </div>
</section>`;
}

/* ───────────────────────────── 2 · MANOS ───────────────────────────── */
const TECH = [
  { key: 'manicura', title: 'Manicura', text: 'Manicura combinada con torno: cutícula limpia, la forma que tú quieras y aceite regenerador.', svc: 'm6' },
  { key: 'semipermanente', title: 'Semipermanente', text: 'El color que elijas, con una duración aproximada de 3 a 4 semanas.', svc: 'm1' },
  { key: 'refuerzo', title: 'Refuerzo', text: 'Nivelamos la uña para corregir asimetrías y que no se rompa, en tono natural traslúcido.', svc: 'm1' },
  { key: 'extensiones', title: 'Extensiones', text: 'Acrigel o soft gel con la forma que quieras. Mantenimiento recomendado cada 3 o 4 semanas.', svc: 'm8' },
  { key: 'nailart', title: 'Nail art', text: 'Diseños a mano alzada. Decoraciones y efectos se calculan según el diseño que elijas.', cat: 'manos' },
  { key: 'rusa', title: 'Manicura rusa', text: 'Una de las especialidades de Sara y de Mafer.', cat: 'manos' },
];

export function manos() {
  const c = COPY.manos;
  const star = starOf('manos');
  return `<section class="manos" id="manos" data-theme="light" aria-labelledby="h-manos">
  <div class="wrap">
    ${kicker(c.kicker)}
    <h2 class="mega" id="h-manos" data-mega><span class="mega__in">${esc(c.title)}</span></h2>
    <div class="manos__grid">
      <div class="manos__lead">
        <p class="lead" data-rv>${esc(c.lead)}</p>
        <article class="star" data-rv>
          <p class="star__tag"><svg aria-hidden="true" focusable="false"><use href="#i-nail"/></svg>Servicio estrella</p>
          <h3 class="star__name">${esc(star.name)}</h3>
          <p class="star__meta"><span class="star__price">${priceHtml(star)}</span><span>${esc(star.dur)}</span><span>Dura de 3 a 4 semanas</span></p>
          <ul class="star__incl">${star.incl.slice(0, 3).map((i) => `<li><svg aria-hidden="true" focusable="false"><use href="#i-nail"/></svg>${esc(i)}</li>`).join('')}</ul>
          <div class="btn-row">
            <a class="btn btn--ghost" href="#tarifas" data-cat-link="manos" data-track="service_view" data-loc="manos">${esc(c.ctaServices)}</a>
            ${nailBtn({ label: c.ctaBook, attrs: bookAttrs('manos', star.id), cls: 'btn-nail--sm' })}
          </div>
        </article>
      </div>
      <ul class="tech" aria-label="Especialidades de manos">
        ${TECH.map((t, i) => `<li class="tech__item" data-rv style="--i:${i}">
          <svg class="tech__art" viewBox="-10 -10 140 210" aria-hidden="true" focusable="false">${TECHNIQUES[t.key]}</svg>
          <h3 class="tech__t">${esc(t.title)}</h3>
          <p class="tech__p">${esc(t.text)}</p>
          ${t.svc ? `<button class="tech__link" type="button" data-open-svc="${t.svc}">Ver servicio</button>` : `<a class="tech__link" href="#tarifas" data-cat-link="${t.cat}">Ver precios</a>`}
        </li>`).join('')}
      </ul>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 3 · DISEÑA TU LOOK ───────────────────────────── */
export function designer() {
  const c = COPY.design;
  const colorBtn = (col, i) => `<label class="bottle" style="--c:${col.hex}"><input type="radio" name="lookColor" value="${col.id}"${col.id === DEFAULT_LOOK.color ? ' checked' : ''} aria-label="${esc(col.name)}"><span class="bottle__name" aria-hidden="true">${esc(col.name)}</span><span class="bottle__cap"></span><span class="bottle__neck"></span><span class="bottle__body"></span></label>`;
  return `<section class="designer" id="disena" data-theme="dark" data-designer aria-labelledby="h-disena">
  <div class="wrap designer__grid">
    <div class="designer__stage">
      <div class="mirror" data-mirror>
        <div class="mirror__bulbs" aria-hidden="true"></div>
        <svg class="designer__svg designer__svg--nail" viewBox="0 0 400 560" role="img" aria-label="Vista previa de tu uña" data-view="nail">
          <defs><linearGradient id="dfg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4d6cb" stop-opacity=".5"/><stop offset=".4" stop-color="#f4d6cb" stop-opacity="0"/><stop offset="1" stop-color="#2a0a10" stop-opacity=".55"/></linearGradient></defs>
          <path d="M96 600 V270 C96 214 142 190 200 190 C258 190 304 214 304 270 V600 Z" fill="${esc(CONFIG.skinTone)}"/>
          <path d="M96 600 V270 C96 214 142 190 200 190 C258 190 304 214 304 270 V600 Z" fill="url(#dfg)"/>
          <g transform="translate(200 108) scale(2.1 2.1) translate(-50 0)" data-big-nail></g>
        </svg>
        <svg class="designer__svg designer__svg--hand" viewBox="${HAND_VIEWBOX}" role="img" aria-label="Tu look en una mano" data-view="hand" aria-hidden="true">
          <g class="designer__handcam" data-hand-slot></g>
        </svg>
        <p class="mirror__done" aria-live="polite"><span>${esc(c.done)}</span></p>
        <p class="mirror__light" aria-hidden="true"></p>
      </div>
    </div>
    <div class="designer__panel">
      ${kicker(c.kicker)}
      <h2 class="h2" id="h-disena" data-split data-design-title>${words(c.title)}</h2>
      <p class="lead">${esc(c.lead)}</p>
      <form class="designer__form" data-designer-form>
        <fieldset class="opt"><legend><span class="opt__n">1</span>Forma</legend>
          <div class="pills">${Object.entries(SHAPES).map(([k, s]) => `<label class="pill"><input type="radio" name="lookShape" value="${k}"${k === DEFAULT_LOOK.shape ? ' checked' : ''}><span><svg viewBox="0 0 100 164" aria-hidden="true" focusable="false"><path fill="currentColor" d="${nailPath(s)}"/></svg>${esc(s.label)}</span></label>`).join('')}</div></fieldset>
        <fieldset class="opt"><legend><span class="opt__n">2</span>Color <span class="opt__v" data-v-color></span></legend>
          <div class="bottles">${COLORS.map(colorBtn).join('')}</div></fieldset>
        <fieldset class="opt"><legend><span class="opt__n">3</span>Acabado <span class="opt__v" data-v-finish></span></legend>
          <div class="pills">${Object.entries(FINISHES).map(([k, f]) => `<label class="pill"><input type="radio" name="lookFinish" value="${k}"${k === DEFAULT_LOOK.finish ? ' checked' : ''}><span>${esc(f.label)}</span></label>`).join('')}</div></fieldset>
        <p class="look-summary" data-summary aria-live="polite"></p>
        <div class="btn-row designer__actions">
          <button class="btn btn--light" type="button" data-finish-look><span data-finish-label>Terminar mi look</span></button>
          ${nailBtn({ label: c.cta, attrs: 'href="#" data-track="whatsapp_click" data-loc="disena_tu_look" data-look-wa', cls: 'btn-nail--sm btn-nail--light' })}
          <a class="btn btn--ghost-light" ${bookAttrs('disena_tu_look')}>Pedir cita</a>
        </div>
        <p class="fine">${esc(c.fine)}</p>
      </form>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 4 · PIES ───────────────────────────── */
export function pies() {
  const c = COPY.pies;
  const list = svcsByCat('pies');
  return `<section class="scene scene--pies" id="pies" data-scene="pies" data-theme="color" style="--len:3.6" aria-labelledby="h-pies">
  <div class="scene__stage">
    <div class="pies__flood" aria-hidden="true"></div>
    <svg class="pies__svg" viewBox="${FEET_VIEWBOX}" role="img" aria-label="Un par de pies con las uñas pintadas, ilustración" preserveAspectRatio="xMidYMid meet">
      <g class="pies__cam"></g>
    </svg>
    <div class="pies__copy">
      ${kicker(c.kicker)}
      <h2 class="mega mega--md" id="h-pies"><span class="pies__t1">${esc(c.titleLines[0])}</span> <span class="pies__t2">${esc(c.titleLines[1])}</span></h2>
      <p class="lead pies__lead">${esc(c.lead)}</p>
      <ul class="mini-list">${list.map((s) => `<li><button type="button" data-open-svc="${s.id}"><span class="mini-list__n">${esc(s.name)}${s.star ? ' <em>favorito</em>' : ''}</span><span class="mini-list__p">${priceHtml(s)}</span></button></li>`).join('')}</ul>
      <div class="btn-row pies__cta"><a class="btn btn--solid" href="#tarifas" data-cat-link="pies" data-track="service_view" data-loc="pies">${esc(c.cta)}</a>
        <a class="btn btn--ghost" ${bookAttrs('pies', 'p4')}>Pedir cita</a></div>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 5 · CEJAS ───────────────────────────── */
export function cejas() {
  const c = COPY.cejas;
  const s1 = svcById('c1'), s2 = svcById('c2');
  return `<section class="scene scene--cejas" id="cejas" data-scene="cejas" data-theme="dark" style="--len:4.2" aria-labelledby="h-cejas">
  <div class="scene__stage">
    <div class="cejas__bg" aria-hidden="true"></div>
    <svg class="cejas__svg" viewBox="${BROW_VIEWBOX}" role="img" aria-label="Dibujo de dos cejas simétricas con guías de medida y efecto sombreado" preserveAspectRatio="xMidYMid meet">
      <g class="cejas__cam"></g>
    </svg>
    <div class="cejas__copy">
      ${kicker(c.kicker)}
      <h2 class="mega mega--md" id="h-cejas">${esc(c.title)}</h2>
      <p class="lead">${esc(c.lead)}</p>
      <ul class="facts">
        <li><span>Medidas de tu rostro</span></li><li><span>Dibujo previo</span></li><li><span>Efecto sombreado</span></li><li><span>Retoque a los 35 días</span></li>
      </ul>
      <dl class="price-pair">
        <div><dt>${esc(s1.name)}</dt><dd><b>${priceHtml(s1)}</b> · ${esc(s1.dur)}</dd></div>
        <div><dt>${esc(s2.name)}</dt><dd><b>${priceHtml(s2)}</b> · ${esc(s2.dur)}</dd></div>
      </dl>
      <div class="btn-row"><a class="btn btn--light" href="#tarifas" data-cat-link="cejas" data-track="service_view" data-loc="cejas">${esc(c.cta)}</a>
        <a class="btn btn--ghost-light" ${bookAttrs('cejas', 'c1')}>Reservar este servicio</a></div>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 6 · PIERCING ───────────────────────────── */
export function piercing() {
  const c = COPY.piercing;
  const s1 = svcById('x1');
  return `<section class="scene scene--piercing" id="piercing" data-scene="piercing" data-theme="dark" style="--len:4.4" aria-labelledby="h-piercing">
  <div class="scene__stage">
    <div class="piercing__bg" aria-hidden="true"></div>
    <svg class="piercing__brow" viewBox="${BROW_VIEWBOX}" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><g class="piercing__browcam"></g></svg>
    <canvas class="piercing__jewel" width="720" height="720" role="img" aria-label="Joya de titanio girando"></canvas>
    <svg class="piercing__ear" viewBox="${EAR_VIEWBOX}" role="img" aria-label="Oreja con una composición de joyas, ilustración"></svg>
    <div class="piercing__copy">
      ${kicker(c.kicker)}
      <h2 class="mega mega--md" id="h-piercing">${esc(c.title)}</h2>
      <p class="lead">${esc(c.lead)}</p>
      <ul class="values">${c.values.map((v) => `<li>${esc(v)}</li>`).join('')}</ul>
      <ul class="facts facts--col">
        <li><span>Diseño de oreja y composición</span></li><li><span>Titanio de grado implante</span></li><li><span>Joyas desde 10 €</span></li>
      </ul>
      <p class="piercing__price">${esc(s1.name)} · <b>${priceHtml(s1)}</b> · ${esc(s1.dur)}</p>
      <div class="btn-row"><a class="btn btn--light" href="#tarifas" data-cat-link="piercing" data-track="service_view" data-loc="piercing">${esc(c.cta)}</a>
        <a class="btn btn--ghost-light" ${bookAttrs('piercing', 'x1')}>Reservar este servicio</a></div>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 7 · SEGURIDAD ───────────────────────────── */
export function safety() {
  const c = COPY.safety;
  return `<section class="scene scene--safety" id="seguridad" data-scene="safety" data-theme="clinic" style="--len:3.4" aria-labelledby="h-seguridad">
  <div class="scene__stage">
    <div class="safety__grid" aria-hidden="true"></div>
    <div class="safety__cover" aria-hidden="true"></div>
    <div class="safety__scan" aria-hidden="true"></div>
    <div class="safety__inner wrap">
      <div class="safety__head">${kicker(c.kicker)}<h2 class="h2 h2--xl" id="h-seguridad">${esc(c.title)}</h2><p class="lead">${esc(c.lead)}</p></div>
      <ol class="safety__row">
        ${SAFETY.map((s, i) => `<li class="safe" data-safe="${i}">
          <div class="safe__art">
            <svg class="safe__tool" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${s.tool.map((d) => `<path d="${d}" pathLength="1"/>`).join('')}</svg>
            <svg class="safe__ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="100" cy="100" r="92" pathLength="1"/></svg>
            <svg class="safe__icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${s.icon.map((d) => `<path d="${d}" pathLength="1"/>`).join('')}</svg>
          </div>
          <h3 class="safe__t">${esc(s.title)}</h3><p class="safe__p">${esc(s.text)}</p>
        </li>`).join('')}
      </ol>
    </div>
  </div>
</section>`;
}
