/**
 * Motor de escenas · SCROLL = CÁMARA.
 *
 * Cada escena es un contenedor alto con un escenario `position: sticky` dentro. Aquí se calcula cuánto
 * ha avanzado el usuario por esa «película» (p de 0 a 1) y se llama a `render(p)`, que mueve la cámara.
 * El progreso se amortigua (inercia) para que el scroll se sienta cinematográfico, y solo se trabaja
 * mientras la escena está cerca de la pantalla.
 */
import { clamp } from './util.js';
import { observeFrame } from './perf.js';

const scenes = new Map();
let io = null, raf = 0, last = 0, streak = false;

const rawProgress = (el) => {
  const r = el.getBoundingClientRect();
  const total = r.height - innerHeight;
  return total > 0 ? clamp(-r.top / total) : clamp(1 - (r.bottom - 0) / (innerHeight + r.height));
};

function ensureObserver() {
  if (io) return;
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = scenes.get(e.target);
      if (!s) continue;
      s.active = e.isIntersecting;
      if (!s.active) {
        // Al salir se fija el estado final correcto (por si el usuario salta rápido)
        s.tgt = s.p = rawProgress(s.el);
        s.render(s.p, s);
        s.drawn = s.p;
        s.onToggle && s.onToggle(false);
      } else s.onToggle && s.onToggle(true);
    }
    wake();
  }, { rootMargin: '60% 0px 60% 0px' });
}

function tick(now) {
  raf = 0;
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  if (streak) observeFrame(now - last);   // solo cuenta fotogramas seguidos de una racha de scroll
  last = now;
  let busy = false;
  for (const s of scenes.values()) {
    if (!s.active) continue;
    s.tgt = rawProgress(s.el);
    const d = s.tgt - s.p;
    if (Math.abs(d) > 0.0002) { s.p += d * (1 - Math.exp(-s.damp * dt)); busy = true; } else s.p = s.tgt;
    if (Math.abs(s.p - s.drawn) > 1e-5 || s.force) { s.force = false; s.render(s.p, s); s.drawn = s.p; }
  }
  streak = busy;
  if (busy) raf = requestAnimationFrame(tick);
}

export function wake() {
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
}

/**
 * Registra una escena. `render(p, scene)` pinta el fotograma p. Devuelve el objeto de escena
 * (con `.p`, `.force`) para poder forzar un repintado tras un resize.
 */
export function registerScene(el, render, { damp = 8, onToggle } = {}) {
  ensureObserver();
  const s = { el, render, damp, onToggle, p: 0, tgt: 0, drawn: -1, active: false, force: true };
  scenes.set(el, s);
  s.tgt = s.p = rawProgress(el);
  render(s.p, s);
  s.drawn = s.p;
  io.observe(el);
  return s;
}

export const repaintAll = () => { scenes.forEach((s) => (s.force = true)); wake(); };

addEventListener('scroll', wake, { passive: true });
addEventListener('resize', repaintAll, { passive: true });
addEventListener('orientationchange', repaintAll, { passive: true });
