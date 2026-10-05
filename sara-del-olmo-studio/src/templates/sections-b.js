/** Actos 8-12: servicios, tarifas, nosotras, estudio, clientas. */
import { CONFIG } from '../data/config.js';
import { COPY } from '../data/copy.js';
import { CATS, SERVICES, QUIZ, svcsByCat, starOf, svcById } from '../data/services.js';
import { TEAM } from '../data/team.js';
import { STUDIO_PHOTOS } from '../data/media.js';
import { catIllustration } from '../js/art/icons.js';
import { esc, euro, priceHtml, words, kicker, bookAttrs, firstSentence, nailBtn } from './util.js';
import { picture, placeholder, hasPhoto } from './media.js';
import { quizStep } from './quiz.js';

/* ───────────────────────────── 8 · SERVICIOS ───────────────────────────── */
const CAT_TEXT = {
  manos: 'Uñas semipermanentes, manicura con refuerzo, extensiones de acrigel o soft gel, rellenos y retiradas. Nail art a mano alzada.',
  pies: 'Pedicura spa con baño, durezas, exfoliación, semipermanente de 5 a 6 semanas y masaje.',
  cejas: 'Micropigmentación con efecto sombreado, diseñada con las medidas de tu rostro y dibujada antes para que la veas.',
  piercing: 'Diseño de oreja, corrección de lóbulo, ombligo, septum y nostril con joyería de titanio.',
};

export function services() {
  const c = COPY.services;
  return `<section class="services" id="servicios" data-theme="light" aria-labelledby="h-servicios">
  <div class="wrap">
    <div class="sec-head">
      <div>${kicker(c.kicker)}<h2 class="h2 h2--xl" id="h-servicios" data-split>${words(c.title)}</h2></div>
      <p class="lead" data-rv>${esc(c.lead)}</p>
    </div>
    <div class="cats">
      ${Object.entries(CATS)
        .map(([k, cat]) => {
          const list = svcsByCat(k);
          const star = starOf(k);
          return `<article class="cat cat--${k}" data-rv>
        <div class="cat__art" aria-hidden="true">${catIllustration(k)}</div>
        <div class="cat__body">
          <h3 class="cat__t">${esc(cat.label)}</h3>
          <p class="cat__p">${esc(CAT_TEXT[k])}</p>
          <p class="cat__meta"><b>${list.length} servicios</b> · ${esc(star.name)}, ${priceHtml(star)}</p>
          <div class="btn-row">
            <button class="btn btn--ghost btn--sm" type="button" data-cat-link="${k}" data-track="service_view" data-loc="servicios">Ver precios</button>
            <a class="btn btn--solid btn--sm" ${bookAttrs('servicios', star.id)}>${esc(c.ctaBook)}</a>
          </div>
        </div>
      </article>`;
        })
        .join('')}
    </div>
    <div class="quiz" data-quiz data-rv>
      <div class="quiz__intro"><h3>¿No sabes qué pedir?</h3><p>Contesta dos preguntas y te decimos qué servicio de uñas encaja contigo.</p></div>
      <div class="quiz__body" data-quiz-body aria-live="polite">${quizStep('start')}</div>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 9 · TARIFAS ───────────────────────────── */
export function prices() {
  const c = COPY.prices;
  const tabs = [['todo', 'Todo', SERVICES.length], ...Object.entries(CATS).map(([k, v]) => [k, v.short, svcsByCat(k).length])];
  return `<section class="prices" id="tarifas" data-theme="light" data-prices aria-labelledby="h-tarifas">
  <div class="wrap">
    <div class="sec-head">
      <div>${kicker(c.kicker)}<h2 class="h2 h2--xl" id="h-tarifas" data-split>${words(c.title)}</h2></div>
      <p class="lead" data-rv>${esc(c.lead)}</p>
    </div>
    <div class="prices__tools">
      <div class="tabs" role="tablist" aria-label="Categorías de servicios" data-tabs>
        ${tabs.map(([k, l, n], i) => `<button class="tab" role="tab" id="tab-${k}" type="button" data-f="${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" aria-controls="priceList"><span class="tab__l">${esc(l)}</span><sup class="tab__n">${n}</sup></button>`).join('')}
      </div>
      <div class="search"><svg aria-hidden="true" focusable="false"><use href="#i-search"/></svg><label for="priceSearch" class="sr-only">Buscar servicio</label><input type="search" id="priceSearch" placeholder="Buscar: relleno, pedicura…" autocomplete="off"><span class="search__n" data-count aria-live="polite"></span></div>
    </div>
    <div class="prices__grid">
      <aside class="prices__aside" aria-hidden="true"><div class="prices__ill" data-ill>${catIllustration('manos')}</div></aside>
      <div class="rows" id="priceList" role="tabpanel" aria-labelledby="tab-todo" data-list>
        ${Object.entries(CATS)
          .map(([k, cat]) => `<section class="rows__group" data-cat="${k}" aria-labelledby="pg-${k}"><h3 id="pg-${k}" class="rows__h">${esc(cat.label)}</h3>
          <ul class="rows__ul">${svcsByCat(k)
            .map(
              (s) => `<li class="row" data-id="${s.id}" data-search="${esc((s.name + ' ' + s.desc).toLowerCase())}">
            <div class="row__main"><button type="button" class="row__name" data-open-svc="${s.id}">${esc(s.name)}</button>${s.star ? '<span class="fav">Favorito</span>' : ''}
              <p class="row__incl">${esc(s.incl ? s.incl.slice(0, 2).join(' · ') : firstSentence(s.desc))}</p></div>
            <span class="row__dur">${esc(s.dur)}</span>
            <span class="row__price">${priceHtml(s)}</span>
            <a class="row__book" ${bookAttrs('tarifas', s.id)} aria-label="Pedir cita: ${esc(s.name)}">Pedir cita</a>
          </li>`,
            )
            .join('')}</ul></section>`)
          .join('')}
        <div class="empty" data-empty hidden><p>No hay ningún servicio que coincida con tu búsqueda.</p><p>Prueba con «relleno», «pedicura» o «cejas».</p><button type="button" class="btn btn--ghost btn--sm" data-clear>Ver todos los servicios</button></div>
      </div>
    </div>
    <p class="prices__cta">${nailBtn({ label: c.cta, attrs: bookAttrs('tarifas') })}</p>
  </div>
</section>`;
}

/* ───────────────────────────── 10 · NOSOTRAS ───────────────────────────── */
function portrait(m, cls = '') {
  const inner = hasPhoto(m.photo)
    ? picture(m.photo, `Retrato de ${m.name}`, { sizes: '(min-width: 900px) 30vw, 70vw' })
    : `<span class="portrait__ph" style="--a:${m.tint[0]};--b:${m.tint[1]}" role="img" aria-label="Foto de ${esc(m.name)} (pendiente)"><span class="portrait__m" aria-hidden="true">${esc((m.short || m.name)[0])}</span><span class="ph__note">[ FOTO PENDIENTE ]</span></span>`;
  return `<div class="portrait ${cls}">${inner}</div>`;
}

export function about() {
  const c = COPY.about;
  const [lead, ...rest] = TEAM;
  const bio = (m) => (m.bio ? `<p class="member__bio">${esc(m.bio)}</p>` : `<p class="member__bio member__bio--pending">[ BIOGRAFÍA PENDIENTE ]</p>`);
  return `<section class="about" id="nosotras" data-theme="light" aria-labelledby="h-nosotras">
  <div class="wrap">
    ${kicker(c.kicker)}
    <h2 class="mega mega--md" id="h-nosotras" data-split>${words(c.title)}</h2>
    <article class="founder" data-rv>
      ${portrait(lead, 'portrait--lg')}
      <div class="founder__txt">
        <p class="founder__role">${esc(lead.role)}</p>
        <h3 class="founder__name">${esc(lead.name)}</h3>
        ${bio(lead)}
        <ul class="tags">${lead.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    </article>
    <p class="lead team__lead" data-rv>${esc(c.lead)}</p>
    <ul class="team">
      ${rest
        .map(
          (m, i) => `<li class="member" data-rv style="--i:${i}">${portrait(m)}
        <h3 class="member__name">${esc(m.name)}</h3><p class="member__role">${esc(m.role)}</p>${bio(m)}
        ${m.pendingNote ? `<p class="member__note">[ ${esc(m.pendingNote)} ]</p>` : ''}
        <ul class="tags">${m.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></li>`,
        )
        .join('')}
    </ul>
    <p class="about__cta">${nailBtn({ label: c.cta, attrs: 'href="#servicios" data-track="service_view" data-loc="nosotras"' })}</p>
  </div>
</section>`;
}

/* ───────────────────────────── 11 · EL ESTUDIO ───────────────────────────── */
export function studio() {
  const c = COPY.studio;
  const frames = STUDIO_PHOTOS.map((p, i) => {
    const media = hasPhoto(p.file) ? picture(p.file, p.alt || p.label, { sizes: '(min-width: 900px) 30vw, 70vw' }) : placeholder(p.label, p.tint);
    return `<figure class="frame frame--${i % 3}" data-frame><div class="frame__m">${media}</div><figcaption>${esc(p.label)}</figcaption></figure>`;
  }).join('');
  return `<section class="scene scene--studio" id="estudio" data-scene="studio" data-theme="light" style="--len:2.4" aria-labelledby="h-estudio">
  <div class="scene__stage">
    <div class="studio__head wrap">${kicker(c.kicker)}<h2 class="h2" id="h-estudio">${esc(c.title)}</h2><p class="lead">${esc(c.lead)}</p></div>
    <div class="studio__zoom" data-zoom>
      <div class="studio__bar wrap"><p class="studio__hint"><svg aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>${esc(c.drag)}</p>
        <div class="g-nav"><button type="button" data-g-prev aria-label="Fotos anteriores"><svg style="transform:scaleX(-1)" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg></button><button type="button" data-g-next aria-label="Fotos siguientes"><svg aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg></button></div></div>
      <div class="studio__strip" tabindex="0" role="region" aria-label="Galería del estudio, arrastra para ver más" data-strip>${frames}</div>
    </div>
  </div>
</section>`;
}

/* ───────────────────────────── 12 · CLIENTAS ───────────────────────────── */
export function reviews() {
  const c = COPY.reviews;
  const r = CONFIG.rating;
  const total = r.distribution.reduce((a, d) => a + d.n, 0) || 1;
  const val = r.value.toLocaleString('es-ES', { minimumFractionDigits: 1 });
  return `<section class="reviews" id="opiniones" data-theme="light" aria-labelledby="h-opiniones">
  <div class="wrap reviews__grid">
    <div class="score" data-score>
      <p class="score__n" aria-label="Valoración ${val} de 5"><span data-count="${r.value}" data-dec="1" data-fin="${val}">0,0</span></p>
      <div class="stars" role="img" aria-label="${val} de 5 estrellas">
        <div class="stars__bg">${'<svg aria-hidden="true" focusable="false"><use href="#i-star"/></svg>'.repeat(5)}</div>
        <div class="stars__fg" data-stars>${'<svg aria-hidden="true" focusable="false"><use href="#i-star"/></svg>'.repeat(5)}</div>
      </div>
      <p class="score__note"><span data-count="${r.count}" data-dec="0" data-fin="${r.count}">0</span> reseñas en ${esc(r.source)}</p>
      <ul class="bars" aria-label="Reparto de valoraciones">${r.distribution.map((d) => `<li><span>${d.stars} ★</span><span class="bar"><i style="--w:${(d.n / total).toFixed(4)}"></i></span><span>${d.n}</span></li>`).join('')}</ul>
    </div>
    <div class="reviews__txt">
      ${kicker(c.kicker)}
      <h2 class="h2" id="h-opiniones" data-split>${words(c.title)}</h2>
      <ul class="themes">${c.themes.map((t, i) => `<li data-rv style="--i:${i}">${esc(t)}</li>`).join('')}</ul>
      <a class="btn btn--ghost" ${bookAttrs('opiniones')}>${esc(c.cta)}</a>
    </div>
  </div>
</section>`;
}
