export const $ = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const euro = (n) => n.toLocaleString('es-ES') + ' €';
export const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

/* Curvas de easing (entrada 0..1 → salida 0..1) */
export const ease = {
  linear: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  smooth: (t) => t * t * (3 - 2 * t),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

/** Progreso local de un tramo [a, b] dentro de p, con easing. Es el «fotograma» de cada gesto de cámara. */
export const seg = (p, a, b, fn = ease.smooth) => fn(clamp((p - a) / (b - a)));
/** Campana: sube entre a..b, se mantiene hasta c y baja hasta d. */
export const bump = (p, a, b, c, d) => seg(p, a, b) * (1 - seg(p, c, d));

export const mq = (q) => (typeof matchMedia === 'function' ? matchMedia(q) : { matches: false, addEventListener() {} });
export const REDUCED = () => document.documentElement.classList.contains('reduced');
export const isSmall = () => mq('(max-width: 760px)').matches;
export const isFine = () => mq('(hover: hover) and (pointer: fine)').matches;
/** Equipo modesto: móvil, pocos núcleos o ahorro de datos. */
export const isLowEnd = () => {
  const n = navigator;
  const conn = n.connection || {};
  return isSmall() || (n.hardwareConcurrency && n.hardwareConcurrency <= 4) || (n.deviceMemory && n.deviceMemory <= 4) || conn.saveData === true;
};

export const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
export const debounce = (fn, ms = 120) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

/** Tween mínimo por rAF (sin librerías): corre `fn(t)` con t en 0..1 y devuelve una función para cancelar. */
export function tween(ms, fn, easing = ease.out) {
  let raf = 0, done = false;
  const t0 = performance.now();
  const step = (now) => {
    if (done) return;
    const t = clamp((now - t0) / ms);
    fn(easing(t), t);
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => { done = true; cancelAnimationFrame(raf); };
}

/** Observa elementos y les añade `.in-view` la primera vez que entran. */
export function revealOnView(selector, { threshold = 0.18, margin = '0px 0px -6% 0px', once = true, onIn } = {}) {
  const els = $$(selector);
  if (!els.length) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      onIn && onIn(e.target);
      if (once) io.unobserve(e.target);
    } else if (!once) e.target.classList.remove('in-view');
  }), { threshold, rootMargin: margin });
  els.forEach((el) => io.observe(el));
}

/** Spline monótona (Fritsch–Carlson): suaviza una cámara que pasa por varios fotogramas clave sin «rebotar». */
export function spline(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

/** Decodifica por adelantado las fotos que aún están ocultas, para que no haya tirón cuando aparezcan en pantalla. */
export const warmImages = (root, delay = 1200) => {
  const go = () => $$('img', root).forEach((i) => { if (i.decode) i.decode().catch(() => {}); });
  setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 2500 }) : go()), delay);
};
