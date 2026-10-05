/** Formularios de eventos y de contacto (validación en español, WhatsApp como canal hasta tener otro). */
import { $, esc } from '../lib/util.js';
import { CONFIG } from '../../data/config.js';
import { waHref, openExternal, noteWhatsappPending } from '../lib/ui.js';
import { track } from './links.js';

/** Eventos: «MAKE IT YOURS» → WhatsApp con el plan. */
export function initEvents(section) {
  const form = $('[data-events-form]', section), a = $('[data-events-wa]', section);
  const set = () => {
    const occ = (form.querySelector('input[name="occ"]:checked') || {}).value || 'un evento';
    const n = $('#evPeople', form).value.trim(), d = $('#evDate', form).value.trim();
    let msg = `Hola, me gustaría organizar una cita para ${occ.toLowerCase()}.`;
    if (n) msg += ` Somos ${n} personas.`;
    if (d) msg += ` La fecha sería ${d}.`;
    a.href = waHref(msg);
    a.dataset.waText = msg;
  };
  form.addEventListener('input', set);
  form.addEventListener('change', set);
  form.addEventListener('submit', (e) => e.preventDefault());
  set();
}

/** Contacto: valida, mide y envía a un servicio de formularios o abre WhatsApp. */
export function initContact(section) {
  const form = $('[data-cform]', section);
  if (!form) return;
  const setErr = (id, msg) => {
    const el = $('#' + id), er = $('#' + id + 'Err');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    er.textContent = msg;
    return !msg;
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#cName').value.trim(), phone = $('#cPhone').value.trim(), msg = $('#cMsg').value.trim();
    let ok = true;
    ok = setErr('cName', name ? '' : 'Escribe tu nombre.') && ok;
    ok = setErr('cPhone', /^[+\d][\d\s-]{8,}$/.test(phone) ? '' : 'Escribe un teléfono válido, por ejemplo 600 12 34 56.') && ok;
    ok = setErr('cMsg', msg ? '' : 'Cuéntanos en qué podemos ayudarte.') && ok;
    ok = setErr('cPriv', $('#cPriv').checked ? '' : 'Necesitamos que aceptes la política de privacidad.') && ok;
    if (!ok) { const first = form.querySelector('[aria-invalid="true"]'); first && first.focus(); return; }
    const service = $('#cService').value;
    track('contact_form_submit', { topic: service, location: 'contacto' });
    if (CONFIG.formEndpoint) {
      try { await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) }); } catch { /* sin conexión */ }
    } else {
      noteWhatsappPending();
      openExternal(waHref(`Hola, soy ${name} (${phone}). Me interesa: ${service}.\n${msg}`));
    }
    form.innerHTML = `<div class="form-ok" role="status"><h3>Mensaje enviado</h3><p>Gracias, ${esc(name)}. Te respondemos lo antes posible.</p></div>`;
  });
}
