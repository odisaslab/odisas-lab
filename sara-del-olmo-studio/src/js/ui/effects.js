/**
 * Efectos de scroll ligeros que no son «escenas»: revelado de titulares y bloques, títulos gigantes
 * que se resuelven al entrar (MANOS, MAKE IT YOURS) y contadores/estrellas de las opiniones
 * controlados por el scroll (suben y bajan con él).
 */
import { $, $$, clamp, seg, ease, lerp, revealOnView, REDUCED } from '../lib/util.js';

const fmt = (v, dec) => v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export function initEffects() {
  const reduced = REDUCED();
  revealOnView('[data-split], [data-rv]', { threshold: 0.14, margin: '0px 0px -8% 0px' });

  const megas = $$('[data-mega]');
  const score = $('[data-score]');
  const parallax = $$('[data-parallax]');
  if (reduced) {
    // versión simple: valores finales
    $$('[data-count]').forEach((n) => (n.textContent = n.dataset.fin));
    return;
  }

  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    for (const m of megas) {
      const inner = m.firstElementChild;
      const r = m.getBoundingClientRect();
      // 0 cuando el título asoma por abajo, 1 cuando ya está en el tercio superior
      const t = seg((vh * 1.0 - r.top) / vh, 0.02, 0.62, ease.out);
      const s = lerp(2.4, 1, t);
      inner.style.transform = `translate3d(0, ${((1 - t) * 14).toFixed(1)}vh, 0) scale(${s.toFixed(3)})`;
      inner.style.opacity = clamp(t * 1.6).toFixed(3);
    }
    if (score) {
      const r = score.getBoundingClientRect();
      const t = seg((vh * 0.92 - r.top) / (vh * 0.55), 0, 1, ease.out);
      $$('[data-count]', score).forEach((n) => {
        const target = parseFloat(n.dataset.count), dec = parseInt(n.dataset.dec || '0', 10);
        n.textContent = fmt(target * t, dec);
      });
      const stars = $('[data-stars]', score);
      // las estrellas aparecen una a una (5 tramos)
      stars.style.clipPath = `inset(0 ${((1 - clamp(t * 1.15)) * 100).toFixed(1)}% 0 0)`;
      score.style.setProperty('--cp', t.toFixed(3));
      $$('.bar i', score).forEach((b) => (b.style.transform = `scaleX(${(parseFloat(b.style.getPropertyValue('--w')) * seg(t, 0.35, 1)).toFixed(4)})`));
    }
    for (const el of parallax) {
      const r = el.getBoundingClientRect();
      const k = parseFloat(el.dataset.parallax) || 0.1;
      const c = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0, ${(-c * k * 100).toFixed(1)}px, 0)`;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  frame();
}
