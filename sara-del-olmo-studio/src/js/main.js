/**
 * Arranque. Aquí solo vive lo imprescindible (navegación, analítica, efectos). Cada escena y cada pieza
 * interactiva es un módulo aparte (code splitting) que se importa cuando la página está en reposo.
 */
import { $, $$, REDUCED } from './lib/util.js';
import { initLinks } from './ui/links.js';
import { initNav } from './ui/nav.js';
import { initEffects } from './ui/effects.js';
import { initDrawer } from './ui/drawer.js';
import { applyLookTheme } from './lib/look.js';

window.__sdo = { ready: false };

const idle = (fn, timeout = 1200) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 250));
const warn = (name) => (e) => console.warn(`[${name}]`, e);

/** Carga e inicia un módulo sobre un elemento. Si falla, la sección queda en su versión simple. */
function mount(selector, loader, name) {
  const el = $(selector);
  if (!el) return Promise.resolve();
  return loader()
    .then((m) => m.init(el))
    .catch((e) => {
      warn(name)(e);
      el.classList.add('is-static');
      import('./scenes/static.js').then((m) => m.init()).catch(() => {});
    });
}

function boot() {
  applyLookTheme();
  initLinks();
  initNav();
  initEffects();
  initDrawer();
  const reduced = REDUCED();

  // Portada: lo primero que se ve, se carga ya
  if (!reduced) mount('#inicio', () => import('./scenes/hero.js'), 'hero');

  // El resto, cuando el navegador está libre
  idle(() => {
    mount('#tarifas', () => import('./ui/tarifas.js'), 'tarifas');
    mount('[data-quiz]', () => import('./ui/quiz.js'), 'quiz');
    mount('#disena', () => import('./ui/designer.js'), 'disena');
    mount('[data-gift]', () => import('./ui/voucher.js'), 'vales');
    mount('#eventos', () => import('./ui/forms.js').then((m) => ({ init: m.initEvents })), 'eventos');
    mount('#contacto', () => import('./ui/forms.js').then((m) => ({ init: m.initContact })), 'contacto');
    mount('.scene--studio', () => import('./ui/gallery.js'), 'galeria');
    if (reduced) {
      import('./scenes/static.js').then((m) => m.init()).catch(warn('static'));
    } else {
      mount('#pies', () => import('./scenes/pies.js'), 'pies');
      mount('#cejas', () => import('./scenes/cejas.js'), 'cejas');
      mount('#piercing', () => import('./scenes/piercing.js'), 'piercing');
      mount('#seguridad', () => import('./scenes/safety.js'), 'seguridad');
      mount('#estudio', () => import('./scenes/studio.js'), 'estudio');
      mount('#reserva', () => import('./scenes/final.js'), 'reserva');
    }
  });
  window.__sdo.ready = true;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
