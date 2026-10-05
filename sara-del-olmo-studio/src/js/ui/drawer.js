/**
 * Ficha de servicio: <dialog> nativo y accesible (foco atrapado, Esc cierra, cierra al pulsar fuera,
 * devuelve el foco a quien lo abrió). Nombre, precio, duración, información y CTA «Pedir cita».
 */
import { $, $$, esc, euro, REDUCED } from '../lib/util.js';
import { CATS, svcById } from '../../data/services.js';
import { waHref } from '../lib/ui.js';
import { track } from './links.js';
import { CONFIG } from '../../data/config.js';

let dlg, lastTrigger = null;

export function openService(id, trigger) {
  const s = svcById(id);
  if (!s || !dlg) return;
  lastTrigger = trigger || document.activeElement;
  $('#dCat').textContent = CATS[s.cat].label;
  $('#dTitle').textContent = s.name;
  $('#dPrice').innerHTML = (s.from ? '<small>desde</small>' : '') + euro(s.price);
  $('#dDur').textContent = s.dur;
  $('#dDesc').textContent = s.desc;
  const nail = '<svg viewBox="0 0 100 164" aria-hidden="true" focusable="false"><use href="#i-nail"/></svg>';
  $('#dIncl').innerHTML = (s.incl || []).map((x) => `<li>${nail}<span>${esc(x)}</span></li>`).join('');
  $('#dIncl').hidden = !s.incl;
  $('#dNote').textContent = s.note || '';
  $('#dNote').hidden = !s.note;
  const book = $('#dBook');
  book.dataset.svc = s.id;
  const wa = $('#dWa');
  const text = `Hola, tengo una duda sobre el servicio «${s.name}».`;
  wa.href = waHref(text);
  wa.dataset.waText = text;
  wa.dataset.svc = s.id;
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  track('service_view', { service: s.id, label: s.name, category: s.cat, location: trigger && trigger.closest('section[id]') ? trigger.closest('section[id]').id : 'ficha' });
}

function close() {
  if (!dlg.open) return;
  const done = () => { dlg.classList.remove('is-closing'); dlg.close(); lastTrigger && lastTrigger.focus && lastTrigger.focus({ preventScroll: true }); };
  if (REDUCED()) { done(); return; }
  dlg.classList.add('is-closing');
  setTimeout(done, 300);
}

export function initDrawer() {
  dlg = $('#svc');
  if (!dlg) return;
  $('[data-close]', dlg).addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // Esc
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-svc]');
    if (b) { e.preventDefault(); openService(b.dataset.openSvc, b); }
  });
  void CONFIG;
}
