/**
 * Vale regalo interactivo: la tarjeta se actualiza en tiempo real (importe o servicio, Para, De,
 * dedicatoria, diseño), se inclina en 3D con el cursor, brilla y se mueve sola en móvil.
 * Sin sistema de venta confirmado, «Crear vale» prepara un mensaje de WhatsApp.
 */
import { $, $$, clamp, isFine, REDUCED, euro } from '../lib/util.js';
import { CONFIG } from '../../data/config.js';
import { COPY } from '../../data/copy.js';
import { SERVICES, svcById } from '../../data/services.js';
import { CARD_STYLES, VOUCHER_AMOUNTS, VOUCHER_LIMITS } from '../../data/card-styles.js';
import { waHref, openExternal, toast, noteWhatsappPending } from '../lib/ui.js';
import { track } from './links.js';

export function init(section) {
  const form = $('[data-gift-form]', section), card = $('[data-card]', section), stage = $('[data-stage]', section);
  if (!form) return;
  const g = { mode: 'importe', amount: VOUCHER_AMOUNTS[1], service: SERVICES[0].id, to: '', from: '', msg: '', style: CARD_STYLES[0].id };
  const el = { value: $('[data-c-value]', card), to: $('[data-c-to]', card), from: $('[data-c-from]', card), msg: $('[data-c-msg]', card) };

  const value = () => {
    if (g.mode === 'servicio') {
      const s = svcById(g.service);
      return { label: s.name, html: (s.from ? '<small>desde</small> ' : '') + euro(s.price), plain: `${s.name} (${s.from ? 'desde ' : ''}${euro(s.price)})` };
    }
    return { label: '', html: g.amount ? euro(g.amount) : '— €', plain: g.amount ? euro(g.amount) : '' };
  };

  let lastValue = '';
  const update = ({ pop = false } = {}) => {
    const v = value(), st = CARD_STYLES.find((s) => s.id === g.style);
    card.style.setProperty('--gc-bg', st.bg);
    card.style.setProperty('--gc-ink', st.ink);
    card.style.setProperty('--gc-accent', st.accent);
    const html = (v.label ? `<small>${v.label}</small>` : '') + `<span class="tick">${v.html}</span>`;
    if (html !== lastValue) { el.value.innerHTML = html; lastValue = html; }
    el.to.textContent = g.to || '…';
    el.from.textContent = g.from || '…';
    el.msg.textContent = g.msg || COPY.gift.placeholderMsg;
    if (pop && !REDUCED()) { card.classList.remove('is-pop'); void card.offsetWidth; card.classList.add('is-pop'); }
  };

  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'gmode') {
      g.mode = t.value;
      $('[data-amount-set]', form).hidden = t.value !== 'importe';
      $('[data-service-field]', form).hidden = t.value !== 'servicio';
    }
    if (t.name === 'gamount') {
      const other = $('#gOther', form);
      other.hidden = t.value !== 'otro';
      if (t.value === 'otro') { other.focus(); g.amount = parseInt(other.value, 10) || 0; } else g.amount = parseInt(t.value, 10);
    }
    if (t.id === 'gService') g.service = t.value;
    if (t.name === 'gstyle') g.style = t.value;
    update({ pop: true });
  });
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'gOther') g.amount = clamp(parseInt(t.value, 10) || 0, 0, VOUCHER_LIMITS.max);
    if (t.id === 'gTo') g.to = t.value.trim();
    if (t.id === 'gFrom') g.from = t.value.trim();
    if (t.id === 'gMsg') g.msg = t.value.trim();
    update();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = value();
    if (!v.plain || (g.mode === 'importe' && g.amount < VOUCHER_LIMITS.min)) {
      toast(`Elige un importe de al menos ${VOUCHER_LIMITS.min} €.`);
      const o = $('#gOther', form);
      o.hidden = false; o.focus();
      return;
    }
    const st = CARD_STYLES.find((s) => s.id === g.style);
    track('gift_voucher_click', { voucher: v.plain, style: g.style, stage: 'submit', location: 'vales' });
    if (CONFIG.voucherUrl) { openExternal(CONFIG.voucherUrl); return; }
    const lines = ['Hola, quiero comprar un vale regalo de Sara del Olmo Studio:', `- Regalo: ${v.plain}`];
    if (g.to) lines.push(`- Para: ${g.to}`);
    if (g.from) lines.push(`- De: ${g.from}`);
    if (g.msg) lines.push(`- Dedicatoria: ${g.msg}`);
    lines.push(`- Diseño de tarjeta: ${st.name}`);
    noteWhatsappPending();
    openExternal(waHref(lines.join('\n')));
  });

  // «Regalar una experiencia»: lleva al formulario
  $('[data-gift-entry]', section).addEventListener('click', () => {
    track('gift_voucher_click', { stage: 'start', location: 'vales' });
    form.scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => $('#gTo', form).focus({ preventScroll: true }), 600);
  });

  /* ───── inclinación 3D y brillo ───── */
  if (REDUCED()) { update(); return; }
  if (isFine()) {
    stage.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.transform = `rotateY(${((x - 0.5) * 18).toFixed(2)}deg) rotateX(${((0.5 - y) * 14).toFixed(2)}deg) translateZ(0)`;
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    stage.addEventListener('pointerleave', () => { card.classList.remove('is-tilting'); card.style.transform = ''; });
  } else {
    // en pantallas táctiles la tarjeta «respira» sola mientras está a la vista
    let raf = 0, on = false;
    const t0 = performance.now();
    const loop = (now) => {
      if (!on) { raf = 0; return; }
      const s = (now - t0) / 1000;
      card.style.transform = `rotateY(${(Math.sin(s * 0.9) * 8).toFixed(2)}deg) rotateX(${(Math.cos(s * 0.7) * 5).toFixed(2)}deg)`;
      card.style.setProperty('--mx', (50 + Math.sin(s * 0.9) * 40).toFixed(1) + '%');
      card.style.setProperty('--my', (40 + Math.cos(s * 0.7) * 30).toFixed(1) + '%');
      raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver((es) => es.forEach((en) => { on = en.isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); })).observe(stage);
  }
  update();
}
