/**
 * «Elige tu experiencia»: pestañas por categoría, buscador y lista de los 25 servicios reales.
 * La lista viene prerenderizada en el HTML (SEO); aquí solo se filtra y se anima.
 */
import { $, $$, norm, debounce, REDUCED } from '../lib/util.js';
import { catIllustration } from '../art/icons.js';
import { track } from './links.js';

export function init(section) {
  const state = { f: 'todo', q: '' };
  const tabs = $$('.tab', section), list = $('[data-list]', section);
  const groups = $$('.rows__group', list), rows = $$('.row', list);
  const count = $('[data-count]', section), empty = $('[data-empty]', section);
  const ill = $('[data-ill]', section), input = $('#priceSearch', section);

  const apply = (animate = true) => {
    const q = norm(state.q.trim());
    let total = 0, i = 0;
    groups.forEach((g) => {
      const inCat = state.f === 'todo' || g.dataset.cat === state.f;
      let any = false;
      $$('.row', g).forEach((r) => {
        const ok = inCat && (!q || norm(r.dataset.search).includes(q));
        r.hidden = !ok;
        if (ok) {
          any = true; total++;
          if (animate && !REDUCED()) { r.classList.remove('is-in'); r.style.setProperty('--i', i++); void r.offsetWidth; r.classList.add('is-in'); }
        }
      });
      g.hidden = !any;
      $('.rows__h', g).hidden = state.f !== 'todo' && any; // con una sola categoría el título lo da la pestaña
    });
    count.textContent = `${total} ${total === 1 ? 'servicio' : 'servicios'}`;
    empty.hidden = total > 0;
  };

  const swapIll = (cat) => {
    if (!ill) return;
    const next = catIllustration(cat === 'todo' ? 'manos' : cat);
    if (REDUCED()) { ill.innerHTML = next; return; }
    ill.classList.add('is-swap');
    setTimeout(() => { ill.innerHTML = next; ill.classList.remove('is-swap'); }, 260);
  };

  const setFilter = (f, { focus = false, silent = false } = {}) => {
    if (f === state.f && !silent) return;
    state.f = f;
    tabs.forEach((t) => {
      const on = t.dataset.f === f;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) { list.setAttribute('aria-labelledby', t.id); focus && t.focus(); }
    });
    swapIll(f);
    apply();
    if (f !== 'todo') track('service_view', { category: f, location: 'tarifas' });
  };

  tabs.forEach((t, idx) => {
    t.addEventListener('click', () => setFilter(t.dataset.f));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(k)) return;
      e.preventDefault();
      const n = k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : (idx + (k === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      setFilter(tabs[n].dataset.f, { focus: true });
    });
  });

  input.addEventListener('input', debounce((e) => { state.q = e.target.value; apply(); }, 120));
  $('[data-clear]', section).addEventListener('click', () => { input.value = ''; state.q = ''; setFilter('todo', { silent: true }); input.focus(); });

  // Enlaces de otras secciones («Ver precios de pies»…) preseleccionan la categoría
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-cat-link]');
    if (!a) return;
    const cat = a.dataset.catLink;
    if (input.value) { input.value = ''; state.q = ''; }
    setFilter(cat, { silent: true });
    if (!a.getAttribute('href')) section.scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth' });
  });

  apply(false);
  swapIll('manos');
}
