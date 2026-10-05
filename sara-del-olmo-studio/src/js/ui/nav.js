/**
 * Navegación: tema de la cabecera según la escena, enlace activo, menú a pantalla completa,
 * saltos de ancla (instantáneos si son lejanos para no «recorrer la película» entera) y pincel de progreso.
 */
import { $, $$, clamp, REDUCED } from '../lib/util.js';
import { inkOn } from '../lib/color.js';

const root = document.documentElement;
const THEME_INK = { dark: '#F8EAE7', cherry: '#F8EAE7', light: '#2B1519', clinic: '#2B1519' };
const THEME_BRUSH = { dark: '#E7788F', cherry: '#F8EAE7', light: '#7A1027', clinic: '#7A1027' };

export function initNav() {
  const header = $('.site-header'), brush = $('.brush');
  const themed = $$('[data-theme]').filter((n) => n !== header);
  const links = $$('.nav a');
  const linkMap = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const targets = [...linkMap.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  let ticking = false, theme = '';

  const frame = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    // pincel: el trazo se va «pintando» con el avance total
    const p = max > 0 ? clamp(y / max) : 0;
    brush && brush.style.setProperty('--p', p.toFixed(4));
    header.classList.toggle('is-scrolled', y > 24);

    // tema de la cabecera = tema de la sección que hay bajo ella
    let cur = themed[0];
    for (const n of themed) {
      const r = n.getBoundingClientRect();
      if (r.top <= 36 && r.bottom > 36) cur = n;
    }
    const t = cur ? cur.dataset.theme : 'dark';
    if (t !== theme) {
      theme = t;
      header.dataset.theme = t;
      const colorTheme = t === 'color';
      const ink = colorTheme ? getComputedStyle(root).getPropertyValue('--pies-ink').trim() || '#FBF1EE' : THEME_INK[t] || THEME_INK.dark;
      header.style.setProperty('--h-ink', ink);
      root.style.setProperty('--brush-ink', colorTheme ? ink : THEME_BRUSH[t] || THEME_BRUSH.dark);
    }

    // enlace activo
    let active = null;
    for (const el of targets) {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.5 && r.bottom > vh * 0.4) active = el.id;
    }
    links.forEach((a) => (a.getAttribute('href').slice(1) === active ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  frame();
  // El tema también cambia dentro de una escena (p. ej. el portal del hero se vuelve claro)
  new MutationObserver(onScroll).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-theme'] });

  /* ───── menú a pantalla completa ───── */
  const burger = $('.burger'), menu = $('#menu');
  let closeTimer, openRaf = 0;
  const open = () => {
    clearTimeout(closeTimer);
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.querySelector('.sr-only').textContent = 'Cerrar menú';
    root.style.overflow = 'hidden';
    header.style.setProperty('--h-ink', '#F8EAE7');
    cancelAnimationFrame(openRaf);
    // el estado «abierto» solo se aplica si el menú sigue pidiendo estar abierto (evita una carrera si se cierra enseguida)
    openRaf = requestAnimationFrame(() => { openRaf = requestAnimationFrame(() => { if (burger.getAttribute('aria-expanded') === 'true') menu.classList.add('is-open'); }); });
    setTimeout(() => { const f = menu.querySelector('a'); f && f.focus({ preventScroll: true }); }, 80);
  };
  const close = (focusBack = false) => {
    cancelAnimationFrame(openRaf);
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelector('.sr-only').textContent = 'Abrir menú';
    menu.classList.remove('is-open');
    root.style.overflow = '';
    theme = ''; onScroll();
    closeTimer = setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, REDUCED() ? 0 : 420);
    if (focusBack) burger.focus();
  };
  burger.addEventListener('click', () => (burger.getAttribute('aria-expanded') === 'true' ? close() : open()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') close(true);
    // trampa de foco sencilla dentro del menú
    if (e.key === 'Tab' && burger.getAttribute('aria-expanded') === 'true') {
      const f = [burger, ...$$('a', menu)];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  addEventListener('resize', () => { if (innerWidth > 1080 && burger.getAttribute('aria-expanded') === 'true') close(); });

  /* ───── anclas internas ───── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + scrollY;
    const far = Math.abs(top - scrollY) > innerHeight * 3.2;
    scrollTo({ top, behavior: far || REDUCED() ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    setTimeout(() => el.focus({ preventScroll: true }), far ? 50 : 700);
  });
}
