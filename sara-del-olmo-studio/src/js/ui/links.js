/**
 * Analítica (GTM/GA4 vía dataLayer) y comportamiento de los enlaces de contacto.
 * Eventos: reservation_click, phone_click, whatsapp_click, gift_voucher_click, contact_form_submit,
 * service_view, pricing_view (+ instagram_click, maps_click). Cada CTA lleva `data-track` y `data-loc`.
 * Con `location` sabemos desde qué sección se hace clic en Booksy.
 */
import { $, $$ } from '../lib/util.js';
import { toast, noteWhatsappPending } from '../lib/ui.js';
import { CONFIG } from '../../data/config.js';

window.dataLayer = window.dataLayer || [];
export const track = (event, params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  window.dataLayer.push({ event, ...clean });
};

export function initLinks() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) {
      const sec = el.closest('section[id], header, footer, dialog, .dock, .menu');
      track(el.dataset.track, {
        location: el.dataset.loc || (sec && (sec.id || sec.className.split(' ')[0])) || 'pagina',
        service: el.dataset.svc,
        label: (el.textContent || '').trim().slice(0, 60),
      });
    }
    const pend = e.target.closest('[data-pending="phone"]');
    if (pend) {
      e.preventDefault();
      toast('[ DATOS PENDIENTES ] El teléfono del estudio aún no está publicado. Puedes reservar online en «Pedir cita».', 5200);
      return;
    }
    const wa = e.target.closest('a[data-track="whatsapp_click"]');
    if (wa && !CONFIG.whatsapp) noteWhatsappPending();
  });

  // Se mide el interés por las tarifas la primera vez que entran en pantalla
  const prices = $('#tarifas');
  if (prices && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { track('pricing_view'); io.disconnect(); }
    }), { threshold: 0.06 });
    io.observe(prices);
  }
}
