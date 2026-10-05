/**
 * «Diseña tu look»: una uña que se diseña en directo. Cambiar forma, color o acabado anima la uña
 * (la forma se transforma, el esmalte sube desde la cutícula, aparece el brillo y se mueve la luz).
 * Al terminar: «Este es tu look.» y un mensaje de WhatsApp con el diseño.
 */
import { $, $$, isFine, REDUCED, tween, ease, lerp } from '../lib/util.js';
import { COLORS, SHAPES, FINISHES, colorById } from '../../data/look.js';
import { CONFIG } from '../../data/config.js';
import { COPY } from '../../data/copy.js';
import { nailMarkup } from '../art/nail-markup.js';
import { handMarkup } from '../art/hand.js';
import { NailSet } from '../art/nail-view.js';
import { look, setLook, lookHex, applyLookTheme } from '../lib/look.js';
import { waHref } from '../lib/ui.js';
import { track } from './links.js';

export function init(section) {
  const bigSlot = $('[data-big-nail]', section), handSlot = $('[data-hand-slot]', section);
  const mirror = $('[data-mirror]', section), form = $('[data-designer-form]', section);
  if (!bigSlot || !form) return;

  // 1) El dibujo (uña grande + mano de previsualización) se genera aquí para no pesar en el HTML inicial
  bigSlot.innerHTML = nailMarkup('big', look, { edge: 1.2 });
  handSlot.innerHTML = handMarkup('dh', look, { skin: CONFIG.skinTone, lightX: 500, lightY: 520 });
  const nails = new NailSet([...bigSlot.querySelectorAll('.nail'), ...handSlot.querySelectorAll('.nail')], look);
  if (REDUCED()) nails.paint(lookHex(), look.finish, { instant: true });
  else nails.bare();

  // 2) Bombillas del espejo
  const bulbs = $('.mirror__bulbs', section);
  const N = 13;
  for (let i = 0; i < N; i++) {
    const a = Math.PI + (i / (N - 1)) * Math.PI;
    const b = document.createElement('i');
    b.style.left = 50 + 46 * Math.cos(a) + '%';
    b.style.top = 38 + 34 * Math.sin(a) + '%';
    b.style.animationDelay = (-i * 0.31).toFixed(2) + 's';
    bulbs.appendChild(b);
  }

  // 3) Resumen y mensaje de WhatsApp
  const summary = $('[data-summary]', section), vColor = $('[data-v-color]', section), vFinish = $('[data-v-finish]', section);
  const wa = $('[data-look-wa]', section);
  const update = () => {
    const c = colorById(look.color);
    summary.innerHTML = `<span>Forma: <b>${SHAPES[look.shape].label}</b></span><span>Color: <b>${c.name}</b></span><span>Acabado: <b>${FINISHES[look.finish].label}</b></span>`;
    vColor.textContent = '· ' + c.name;
    vFinish.textContent = '· ' + FINISHES[look.finish].hint;
    $('[data-view="nail"]', section).setAttribute('aria-label', `Vista previa: uña ${SHAPES[look.shape].label.toLowerCase()}, color ${c.name.toLowerCase()}, acabado ${FINISHES[look.finish].label.toLowerCase()}`);
    const msg = `Hola, me gustaría pedir cita para este diseño de uñas:\n- Forma: ${SHAPES[look.shape].label}\n- Color: ${c.name}\n- Acabado: ${FINISHES[look.finish].label}\n¿Qué días tenéis libres?`;
    wa.href = waHref(msg);
    wa.dataset.waText = msg;
  };
  update();

  // 4) Cambios en vivo
  const pulse = () => {
    mirror.classList.remove('is-flash'); void mirror.offsetWidth; mirror.classList.add('is-flash');
    nails.views[0].sweep(1100);
  };
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'lookShape') { setLook({ shape: t.value }, 'shape'); nails.setShape(t.value); }
    if (t.name === 'lookColor') { setLook({ color: t.value }, 'color'); nails.paint(lookHex(), look.finish, { dur: 700, stagger: 70, center: true }); }
    if (t.name === 'lookFinish') { setLook({ finish: t.value }, 'finish'); nails.paint(lookHex(), look.finish, { dur: 760, stagger: 60 }); }
    update();
    pulse();
    if (look.done) section.classList.remove('is-done'), (look.done = false), finishLabel();
  });

  // 5) La luz sigue al cursor (otra posición = otros reflejos)
  if (isFine() && !REDUCED()) {
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const loop = () => {
      cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
      nails.setLight(cx, cy);
      mirror.style.setProperty('--lx', (50 + cx * 30).toFixed(1) + '%');
      mirror.style.setProperty('--ly', (36 + cy * 24).toFixed(1) + '%');
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    mirror.addEventListener('pointermove', (e) => {
      const r = mirror.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    mirror.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  // 6) Terminar el look
  const btn = $('[data-finish-look]', section), lab = $('[data-finish-label]', section);
  const finishLabel = () => { lab.textContent = section.classList.contains('is-done') ? 'Editar mi look' : 'Terminar mi look'; };
  btn.addEventListener('click', () => {
    const done = !section.classList.contains('is-done');
    section.classList.toggle('is-done', done);
    look.done = done;
    $('.designer__svg--hand', section).setAttribute('aria-hidden', String(!done));
    finishLabel();
    if (done) { nails.sweep(1700, 350, 160); track('service_view', { service: 'diseña_tu_look', label: look.shape + '/' + look.color + '/' + look.finish, location: 'disena_tu_look' }); }
  });

  // 7) Al entrar la sección, la uña se pinta ante tus ojos
  let first = true;
  new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting && first) {
      first = false;
      nails.paint(lookHex(), look.finish, { dur: 1100, stagger: 120, center: false });
      nails.views[0].sweep(1800, 900);
    }
  }), { threshold: 0.35 }).observe(mirror);

  applyLookTheme();
  return nails;
}
