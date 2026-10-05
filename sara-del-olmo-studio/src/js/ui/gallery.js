/**
 * Galería horizontal del estudio: se arrastra con el ratón (con inercia), con el dedo (scroll nativo),
 * con las flechas y con el teclado (foco en la galería + ← →).
 */
import { $, REDUCED } from '../lib/util.js';

export function init(root) {
  const strip = $('[data-strip]', root);
  if (!strip) return;
  const step = () => (strip.firstElementChild ? strip.firstElementChild.getBoundingClientRect().width + 20 : 300);
  const by = (d) => strip.scrollBy({ left: d, behavior: REDUCED() ? 'auto' : 'smooth' });
  $('[data-g-prev]', root).addEventListener('click', () => by(-step()));
  $('[data-g-next]', root).addEventListener('click', () => by(step()));
  strip.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); by(step()); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); by(-step()); }
  });

  let down = false, sx = 0, sl = 0, moved = false, lastX = 0, vel = 0, lastT = 0, inertia = 0;
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    cancelAnimationFrame(inertia);
    down = true; moved = false; sx = lastX = e.clientX; sl = strip.scrollLeft; vel = 0; lastT = performance.now();
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 4 && !moved) { moved = true; strip.classList.add('is-dragging'); }
    strip.scrollLeft = sl - dx;
    const now = performance.now();
    vel = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX; lastT = now;
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    strip.classList.remove('is-dragging');
    if (!moved || REDUCED()) return;
    let v = -vel * 16;
    const glide = () => { strip.scrollLeft += v; v *= 0.93; if (Math.abs(v) > 0.4) inertia = requestAnimationFrame(glide); };
    inertia = requestAnimationFrame(glide);
  });
  strip.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
}
